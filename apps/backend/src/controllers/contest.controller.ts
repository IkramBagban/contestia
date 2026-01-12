import prismaClient from "@repo/db";
import type { NextFunction, Request, Response } from "express";
import { createContestSchema } from "../../utils/zodSchema";
import type { ExtendedRequest } from "../../utils/types";

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
