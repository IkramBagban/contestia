import prismaClient from "@repo/db";
import type { NextFunction, Request, Response } from "express";
import {
  createQuestionSchema,
  questionQuerySchema,
} from "../../utils/zodSchema";
import type { ExtendedRequest } from "../../utils/types";

export const getQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schemaResult = questionQuerySchema.safeParse(req.query);
    if (!schemaResult.success) {
      console.error("Query validation failed:", schemaResult.error.flatten());
      const err = new Error("Invalid query params");
      (err as any).status = 400;
      throw err;
    }

    const { page, limit, contestId, type } = schemaResult.data;

    const p = Math.max(Number(page) || 1, 1);
    const l = Math.min(Number(limit) || 20, 100); // Default to 20, max 100


    const where: any = {};
    if (type) where.type = type;

    // If contestId is provided, we need to filter questions associated with that contest
    if (contestId) {
      where.contests = {
        some: {
          contestId: contestId
        }
      };
    }

    const [questions, total] = await Promise.all([
      prismaClient.question.findMany({
        where,
        skip: (p - 1) * l,
        take: l,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          text: true,
          type: true,
          points: true,
          createdAt: true
        },
      }),
      prismaClient.question.count({ where })
    ]);


    res.status(200).json({
      success: true,
      message: "Questions fetched successfully",
      data: questions,
      meta: {
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l)
      }
    });
  } catch (error) {
    next(error);
  }
};
export const getQuestionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const question = await prismaClient.question.findUnique({
      where: { id },
      include: { options: true, testCases: true },
    });

    if (!question) {
      const error = new Error("Question not found");
      // @ts-ignore
      error.status = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const schemaResult = createQuestionSchema.safeParse(req.body);

    if (!schemaResult.success) {
      const error = new Error(
        "Validation Error: " + JSON.stringify(schemaResult.error.flatten())
      );
      // @ts-ignore
      error.status = 400;
      throw error;
    }

    const { type, text, points, options, funcName, testCases } = schemaResult.data;

    let question;
    if (type === "MCQ") {
      await prismaClient.option.deleteMany({
        where: { questionId: id }
      });

      const sanitizedOptions = options?.map((opt) => ({
        text: opt.text,
        isCorrect: opt.isCorrect,
      }));

      question = await prismaClient.question.update({
        where: { id },
        data: {
          text,
          points,
          type,
          options: {
            create: sanitizedOptions
          }
        },
        include: { options: true }
      });
    } else {
      await prismaClient.testcase.deleteMany({
        where: { questionId: id }
      });

      const sanitizedTestCases = testCases?.map((tc) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden
      }));

      question = await prismaClient.question.update({
        where: { id },
        data: {
          text,
          points,
          type,
          funcName: funcName || "",
          testCases: {
            create: sanitizedTestCases
          }
        },
        include: { testCases: true }
      });
    }


    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: question,
    });
  } catch (error) {
    next(error);
  }
};
export const createQuestion = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("YOO")
    const schemaResult = createQuestionSchema.safeParse(req.body);

    if (!schemaResult.success) {
      console.log("body", req.body);
      const error = new Error(
        "Validation Error: " + JSON.stringify(schemaResult.error.flatten())
      );
      // @ts-ignore
      error.status = 400;
      throw error;
    }

    console.log("schemaResult.data", schemaResult.data)

    const { type, text, points, options, testCases, funcName } = schemaResult.data;
    let question = null;
    const contestData = {
      type: type,
      text: text,
      points: points,
      userId: req.user!.id,
      funcName: funcName || "",
    }
    if (type === "MCQ") {
      const sanitizedOptions = options?.map((opt) => ({
        text: opt.text,
        isCorrect: opt.isCorrect,
      }));
      question = await prismaClient.question.create({
        data: {
          ...contestData,
          options: {
            create: sanitizedOptions,
          },
        },
        include: {
          options: true,
        },
      });
    } else {
      const sanitizedTestCases = testCases?.map((tc) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden,
      }));

      console.log("sanitizedTestCases", sanitizedTestCases)
      question = await prismaClient.question.create({
        data: {
          ...contestData,
          testCases: {
            create: sanitizedTestCases,
          },
        },
        include: {
          testCases: true,
        },
      })
      console.log("question", question)
    }

    res.status(201).json({
      success: true,
      message: "Question Created Successfully",
      data: question,
    });
  } catch (error) {
    next(error); // this will catch in global error handler middleware
  }
};
