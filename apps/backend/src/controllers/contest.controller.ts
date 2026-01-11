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
    const contests = await prismaClient.contest.findMany({
      take: Number(limit),
      skip: Number(page) + Number(limit),
      select: {
        title: true,
        description: true,
        startDate: true,
        startTime: true,
        endTime: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Contests fetched successfully",
      data: contests,
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
      error.status = 404;
      throw error;
    }

    const { questionIds, ...contestData } = schemaResult.data;

    const contest = await prismaClient.contest.create({
      data: {
        ...contestData,
        userId: req.user.id,
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
