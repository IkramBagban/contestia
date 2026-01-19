import prismaClient from "@repo/db";
import type { NextFunction, Request, Response } from "express";
import { createContestSchema } from "../../utils/zodSchema";
import type { ExtendedRequest } from "../../utils/types";
import { redisManager } from "../services/redis";

export const getContests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const p = Math.max(Number(page) || 1, 1);
    const l = Math.min(Number(limit) || 10, 100);

    const contests = await prismaClient.contest.findMany({
      skip: (p - 1) * l,
      take: l,
      orderBy: {
        startDate: 'desc',
      },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        startTime: true,
        endTime: true,
        questions: {
          select: {
            question: {
              select: {
                points: true,
              },
            },
          },
        },
      },
    });

    const contestsIsWithPoints = contests.map((contest) => {
      const totalPoints = contest.questions.reduce(
        (acc, q) => acc + (q.question.points || 0),
        0
      );
      // Remove questions array from list response to keep it light if needed, or keep it.
      // Keeping it fits the mapped type better if I cast it or just return extended object
      const { questions, ...rest } = contest;
      return { ...rest, totalPoints };
    });

    res.status(200).json({
      success: true,
      message: "Contests fetched successfully",
      data: contestsIsWithPoints,
    });
  } catch (error) {
    next(error);
  }
};

export const createContest = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const schemaResult = createContestSchema.safeParse(req.body);
    if (!schemaResult.success) {
      const error = new Error(
        "Validation Error: " + JSON.stringify(schemaResult.error.flatten())
      );
      // @ts-ignore
      error.status = 400;
      throw error;
    }

    const { questionIds, ...contestData } = schemaResult.data;

    if (!questionIds.length) {
      throw Object.assign(new Error("Questions required"), { status: 400 });
    }

    const contest = await prismaClient.contest.create({
      data: {
        ...contestData,
        userId: req.user!.id,
        questions: {
          create: questionIds.map((id) => ({
            question: {
              connect: { id },
            },
          })),
        },
      },
      include: {
        questions: {
          include: {
            question: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Contest Created Successfully",
      data: contest,
    });
  } catch (error) {
    console.error(error);
    next(error); // this will catch in global error handler middleware
  }
};

export const getContestById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const contest = await prismaClient.contest.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!contest) {
      const error = new Error("Contest not found");
      // @ts-ignore
      error.status = 404;
      throw error;
    }

    const totalPoints = contest.questions.reduce(
      (acc, q) => acc + (q.question.points || 0),
      0
    );

    res.status(200).json({
      success: true,
      data: { ...contest, totalPoints },
    });
  } catch (error) {
    next(error);
  }
};

export const updateContest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const schemaResult = createContestSchema.safeParse(req.body);

    if (!schemaResult.success) {
      const error = new Error(
        "Validation Error: " + JSON.stringify(schemaResult.error.flatten())
      );
      // @ts-ignore
      error.status = 400;
      throw error;
    }

    const { questionIds, ...contestData } = schemaResult.data;

    // First update the basic info
    await prismaClient.contest.update({
      where: { id },
      data: {
        ...contestData,
      },
    });

    // Handle question updates if provided
    if (questionIds) {
      // Access the join table 'ContestsOnQuestions' indirectly or directly
      // Since it's a many-to-many with explicit relation table or implicit
      // The schema likely uses 'questions' relation field in Contest model 
      // which points to ContestsOnQuestions (or similar join table)

      // Delete existing relations
      await prismaClient.questionsInContests.deleteMany({
        where: { contestId: id },
      });

      // Create new relations
      await prismaClient.contest.update({
        where: { id },
        data: {
          questions: {
            create: questionIds.map(qId => ({
              question: { connect: { id: qId } }
            }))
          }
        }
      });
    }

    const updatedContest = await prismaClient.contest.findUnique({
      where: { id },
      include: { questions: { include: { question: true } } }
    });

    res.status(200).json({
      success: true,
      message: "Contest updated successfully",
      data: updatedContest,
    });
  } catch (error) {
    next(error);
  }
};

export const startContest = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    if (!id) {
      throw Object.assign(new Error("Contest id is required"), { status: 400 });
    }

    const contest = await prismaClient.contest.findUnique({ where: { id } });
    if (!contest) {
      throw Object.assign(new Error("Contest not found"), { status: 404 });
    }

    // Check if contest has ended
    const startDate = new Date(contest.startDate);
    const [hours, minutes] = contest.endTime ? contest.endTime.split(":").map(Number) : [23, 59];
    const endDate = new Date(startDate);
    endDate.setHours(hours, minutes, 0, 0);

    // If start time is also important to block future contests:
    const [startH, startM]: number[] = contest.startTime ? contest.startTime.split(":").map(Number) : [0, 0];
    const realStartDate = new Date(startDate);
    realStartDate.setHours(startH, startM, 0, 0);

    const now = new Date();

    if (now > endDate) {
      throw Object.assign(new Error("Contest has ended"), { status: 400 });
    }

    // Optional: Block early access if strict
    // if (now < realStartDate) {
    //      throw Object.assign(new Error("Contest has not started yet"), { status: 400 });
    // }

    let submission = await prismaClient.submission.findUnique({
      where: {
        userId_contestId: {
          userId,
          contestId: id,
        },
      },
    });

    if (!submission) {
      submission = await prismaClient.submission.create({
        data: {
          userId,
          contestId: id,
          status: "PENDING",
          startedAt: new Date(),
          answers: {},
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Contest started",
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

export const submitContest = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { answers } = req.body;

    const submission = await prismaClient.submission.findUnique({
      where: { userId_contestId: { userId, contestId: id } },
    });

    if (!submission) {
      throw Object.assign(new Error("Submission not found. Start contest first."), { status: 404 });
    }

    if (submission.status === "COMPLETED") {
      throw Object.assign(new Error("Contest already submitted"), { status: 400 });
    }

    const contestQuestions = await prismaClient.questionsInContests.findMany({
      where: { contestId: id },
      include: {
        question: {
          include: {
            options: {
              where: { isCorrect: true },
            },
          },
        },
      },
    });

    let score = 0;

    for (const item of contestQuestions) {
      const q = item.question;
      const selectedOptionId = answers[q.id];
      if (selectedOptionId) {
        const correctOption = q.options.find((o) => o.isCorrect);
        if (correctOption && correctOption.id === selectedOptionId) {
          score += q.points;
        }
      }
    }

    const updatedSubmission = await prismaClient.submission.update({
      where: { id: submission.id },
      data: {
        status: "COMPLETED",
        submittedAt: new Date(),
        score,
        answers: answers || {},
      },
    });

    res.status(200).json({
      success: true,
      message: "Contest submitted successfully",
      data: updatedSubmission,
    });
  } catch (error) {
    next(error);
  }
};

export const getContestForAttempt = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    if (!id) {
      throw Object.assign(new Error("Contest id is required"), { status: 400 });
    }

    const contest = await prismaClient.contest.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                type: true,
                points: true,
                options: {
                  select: {
                    id: true,
                    text: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!contest) {
      throw Object.assign(new Error("Contest not found"), { status: 404 });
    }


    const submission = await prismaClient.submission.findUnique({
      where: {
        userId_contestId: {
          userId,
          contestId: id
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        ...contest,
        submission
      },
    });
  } catch (error) {
    next(error);
  }
};

export const saveProgress = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { questionId, answer } = req.body;

    if (!id || !questionId) {
      throw Object.assign(new Error("Contest id and Question id are required"), { status: 400 });
    }

    let submission = await prismaClient.submission.findUnique({
      where: {
        userId_contestId: { userId, contestId: id }
      }
    });

    if (!submission) {
      submission = await prismaClient.submission.create({
        data: {
          userId,
          contestId: id,
          answers: {},
          score: 0,
        }
      });
    }

    const contest = await prismaClient.contest.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            question: {
              include: { options: true }
            }
          }
        }
      }
    });

    if (!contest) throw Object.assign(new Error("Contest not found"), { status: 404 });

    const questionData = contest.questions.find(q => q.questionId === questionId)?.question;
    if (!questionData) throw Object.assign(new Error("Question not found"), { status: 404 });

    let points = 0;
    let isCorrect = false;

    if (questionData.type === "MCQ") {
      const correctOption = questionData.options.find(o => o.isCorrect);
      if (correctOption && correctOption.id === answer) {
        points = questionData.points;
        isCorrect = true;
      }
    }

    const currentAnswersMap = (submission.answers as Record<string, any>) || {};

    const newAnswerEntry = {
      value: answer,
      isCorrect,
      points
    };

    const updatedAnswers = {
      ...currentAnswersMap,
      [questionId]: newAnswerEntry
    };

    let totalScore = 0;
    Object.values(updatedAnswers).forEach((entry: any) => {
      if (entry && typeof entry === 'object' && typeof entry.points === 'number') {
        totalScore += entry.points;
      }
    });

    const updatedSubmission = await prismaClient.submission.update({
      where: { id: submission.id },
      data: {
        answers: updatedAnswers,
        score: totalScore
      }
    });

    await redisManager.redis.zadd(`contest:${id}:leaderboard`, totalScore, userId);

    res.status(200).json({
      success: true,
      data: {
        score: totalScore,
        answers: updatedAnswers
      }
    });
  } catch (error) {
    next(error);
  }
};


