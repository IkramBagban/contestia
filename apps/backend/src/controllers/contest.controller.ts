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
        userId: true,
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
        (acc: number, q: { question: { points: number | null } }) => acc + (q.question.points || 0),
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
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
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

    // Ownership check: If the requester is an admin (authenticated), they can only see their own contest details
    // For students, they should be using getContestForAttempt which has its own logic.
    // However, since we don't have separate roles (admin/student) in the User model currently,
    // we assume anyone hitting this authenticated is an admin.
    if (req.user && contest.userId !== req.user.id) {
        throw Object.assign(new Error("Unauthorized access to contest details"), { status: 403 });
    }

    const totalPoints = contest.questions.reduce(
      (acc: number, q: { question: { points: number | null } }) => acc + (q.question.points || 0),
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
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;

    const existingContest = await prismaClient.contest.findUnique({
      where: { id },
    });

    if (!existingContest) {
      throw Object.assign(new Error("Contest not found"), { status: 404 });
    }

    if (existingContest.userId !== req.user?.id) {
      throw Object.assign(new Error("You are not allowed to edit this contest"), { status: 403 });
    }

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

export const registerContest = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    if (!id) {
      throw Object.assign(new Error("Contest id is required"), { status: 400 });
    }

    const contest = await prismaClient.contest.findUnique({ where: { id } });
    if (!contest) {
      throw Object.assign(new Error("Contest not found"), { status: 404 });
    }

    let participant = await prismaClient.participant.findUnique({
      where: {
        userId_contestId: {
          userId,
          contestId: id,
        },
      },
    });

    if (participant) {
      throw Object.assign(new Error("Already registered for this contest"), { status: 400 });
    }

    participant = await prismaClient.participant.create({
      data: {
        userId,
        contestId: id,
        status: "REGISTERED",
      },
    });

    res.status(200).json({
      success: true,
      message: "Registered successfully",
      data: participant,
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
    const id = req.params.id as string;
    const userId = req.user!.id;

    if (!id) {
      throw Object.assign(new Error("Contest id is required"), { status: 400 });
    }

    const contest = await prismaClient.contest.findUnique({ where: { id } });
    if (!contest) {
      throw Object.assign(new Error("Contest not found"), { status: 404 });
    }

    // Check if contest has ended
    const getContestDates = (c: any) => {
      const start = new Date(c.startDate);
      let realStartDate = new Date(start);

      if (c.startTime && c.startTime.includes(':') && c.startTime.length <= 5) {
        const [startHours, startMinutes] = c.startTime.split(":").map(Number);
        if (!isNaN(startHours) && !isNaN(startMinutes)) {
          realStartDate.setHours(startHours, startMinutes, 0, 0);
        }
      }

      let realEndDate = new Date(realStartDate);
      if (c.endTime) {
        if (c.endTime.includes('T') || c.endTime.length > 5) {
          const possibleEndDate = new Date(c.endTime);
          if (!isNaN(possibleEndDate.getTime())) {
            realEndDate = possibleEndDate;
          }
        } else if (c.endTime.includes(':')) {
          const [endHours, endMinutes] = c.endTime.split(":").map(Number);
          if (!isNaN(endHours) && !isNaN(endMinutes)) {
            realEndDate.setHours(endHours, endMinutes, 0, 0);
            if (realEndDate < realStartDate) {
              realEndDate.setDate(realEndDate.getDate() + 1);
            }
          }
        }
      }
      return { start: realStartDate, end: realEndDate };
    };

    const { start: realStart, end: realEnd } = getContestDates(contest);
    const now = new Date();

    if (now > realEnd) {
      throw Object.assign(new Error("Contest has ended"), { status: 400 });
    }

    if (now < realStart) {
      throw Object.assign(new Error("Contest has not started yet"), { status: 400 });
    }

    // Upsert participant to PARTICIPATING
    let participant = await prismaClient.participant.findUnique({
      where: { userId_contestId: { userId, contestId: id } }
    });

    if (!participant) {
      // Auto-register if not already registered (optional, but good UX)
      participant = await prismaClient.participant.create({
        data: { userId, contestId: id, status: "PARTICIPATING" }
      });
    } else if (participant.status === "REGISTERED") {
      participant = await prismaClient.participant.update({
        where: { id: participant.id },
        data: { status: "PARTICIPATING" }
      });
    } else if (participant.status === "DISQUALIFIED") {
      throw Object.assign(new Error("You have been disqualified from this contest"), { status: 403 });
    }

    // Ensure submission also exists for backward compatibility and tracking
    let submission = await prismaClient.submission.findUnique({
      where: {
        userId_contestId: {
          userId,
          contestId: id,
        },
      },
    });

    if (submission) {
      if (submission.status === "COMPLETED") {
        throw Object.assign(new Error("Contest already submitted"), { status: 400 });
      }
    } else {
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
    const id = req.params.id as string;
    const userId = req.user!.id;
    const { answers } = req.body;

    if (!id) {
      throw Object.assign(new Error("Contest id is required"), { status: 400 });
    }

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
    const existingAnswers = (submission.answers as Record<string, any>) || {};
    const richAnswers: Record<string, any> = { ...existingAnswers };

    for (const item of contestQuestions) {
      const q = item.question;

      if (q.type === "MCQ") {
        const selectedOptionId = answers[q.id];
        const correctOption = q.options.find((o: { id: string; isCorrect: boolean }) => o.isCorrect);
        const isCorrect = !!(selectedOptionId && correctOption && correctOption.id === selectedOptionId);

        if (selectedOptionId) {
          richAnswers[q.id] = {
            value: selectedOptionId,
            isCorrect,
            points: isCorrect ? q.points : 0
          };
        }
      }
      // For DSA, we rely on existingAnswers which were set by Judge0 submit-code
      // We don't overwrite them with raw code from the body unless we want to re-validate (which we don't here)
    }

    // Calculate total score from final merged richAnswers
    for (const qId in richAnswers) {
      const entry = richAnswers[qId];
      if (entry && typeof entry === 'object' && entry.isCorrect === true) {
        score += entry.points || 0;
      }
    }

    const updatedSubmission = await prismaClient.submission.update({
      where: { id: submission.id },
      data: {
        status: "COMPLETED",
        submittedAt: new Date(),
        score,
        answers: richAnswers,
      },
    });

    // Also update Participant score
    await prismaClient.participant.update({
      where: { userId_contestId: { userId, contestId: id } },
      data: { score }
    });

    await redisManager.redis.zadd(`contest:${id}:leaderboard`, score, userId);

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
    const id = req.params.id as string;
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

    const participant = await prismaClient.participant.findUnique({
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
        submission,
        participant
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
    const id = req.params.id as string;
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

    const questionData = contest.questions.find((q: { questionId: string }) => q.questionId === questionId)?.question;
    if (!questionData) throw Object.assign(new Error("Question not found"), { status: 404 });

    let points = 0;
    let isCorrect = false;

    const currentAnswersMap = (submission.answers as Record<string, any>) || {};
    const existingEntry = currentAnswersMap[questionId];

    if (questionData.type === "MCQ") {
      const correctOption = questionData.options.find((o: { id: string; isCorrect: boolean }) => o.isCorrect);
      if (correctOption && correctOption.id === answer) {
        points = questionData.points;
        isCorrect = true;
      }
    } else {
      const wasAlreadySolved = existingEntry && typeof existingEntry === 'object' && existingEntry.isCorrect === true;
      if (wasAlreadySolved) {
        isCorrect = true;
        points = (existingEntry as any).points || questionData.points;
      }
    }

    const newAnswerEntry = {
      value: answer,
      isCorrect,
      points,
      ...(questionData.type === "DSA" ? {
        languageId: (existingEntry && typeof existingEntry === 'object') ? existingEntry.languageId : undefined
      } : {})
    };

    const updatedAnswers = {
      ...currentAnswersMap,
      [questionId]: newAnswerEntry
    };

    let totalScore = 0;
    for (const key in updatedAnswers) {
      const entry = (updatedAnswers as any)[key];
      if (entry && typeof entry === 'object') {
        const p = parseInt(String(entry.points), 10);
        if (!isNaN(p) && entry.isCorrect === true) {
          totalScore += p;
        }
      }
    }

    const updatedSubmission = await prismaClient.submission.update({
      where: { id: submission.id },
      data: {
        answers: updatedAnswers,
        score: totalScore
      }
    });

    // Also update Participant score
    try {
      await prismaClient.participant.update({
        where: { userId_contestId: { userId, contestId: id } },
        data: { score: totalScore }
      });
    } catch (e) {
      // Participant might not exist if they started before we added this table or other edge cases
      // Just ignore or log, don't fail the request
      console.error("Failed to update participant score:", e);
    }

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



export const getContestParticipants = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;

    const contest = await prismaClient.contest.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!contest) {
      throw Object.assign(new Error("Contest not found"), { status: 404 });
    }

    if (contest.userId !== req.user?.id) {
      throw Object.assign(new Error("You are not allowed to view participants for this contest"), { status: 403 });
    }

    const { page = 1, limit = 50 } = req.query;
    const p = Math.max(Number(page) || 1, 1);
    const l = Math.min(Number(limit) || 50, 100);

    const participants = await prismaClient.participant.findMany({
      where: { contestId: id },
      skip: (p - 1) * l,
      take: l,
      include: {
        user: {
          select: {
            id: true,
            email: true,
          }
        }
      },
      orderBy: { score: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: participants,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContest = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;

    const existingContest = await prismaClient.contest.findUnique({
      where: { id },
    });

    if (!existingContest) {
      throw Object.assign(new Error("Contest not found"), { status: 404 });
    }

    if (existingContest.userId !== req.user?.id) {
      throw Object.assign(new Error("You are not allowed to delete this contest"), { status: 403 });
    }

    // Delete relations first
    await prismaClient.questionsInContests.deleteMany({
      where: { contestId: id },
    });

    await prismaClient.participant.deleteMany({
      where: { contestId: id },
    });

    await prismaClient.submission.deleteMany({
      where: { contestId: id },
    });

    await prismaClient.contest.delete({
      where: { id },
    });

    // Also cleanup leaderboard from redis if exists
    await redisManager.redis.del(`contest:${id}:leaderboard`);

    res.status(200).json({
      success: true,
      message: "Contest deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
