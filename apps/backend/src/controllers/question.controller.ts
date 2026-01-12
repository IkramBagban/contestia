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
      const err = new Error("Invalid query params");
      (err as any).status = 400;
      throw err;
    }

    const { page = "1", limit = "10", contestId, type } = schemaResult.data;

    const p = Math.max(Number(page) || 1, 1);
    const l = Math.min(Number(limit) || 10, 100);

    const where: {
      contestId?: string;
      type?: "MCQ" | "DSA";
    } = {};

    if (contestId) where.contestId = contestId;
    if (type) where.type = type;

    const questions = await prismaClient.question.findMany({
      where,
      skip: (p - 1) * l,
      take: l,
      select: {
        id: true,
        text: true,
        type: true,
        points: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Questions fetched successfully",
      data: questions,
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
      include: { options: true },
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

    const { type, text, points, options } = schemaResult.data;

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
        question = await prismaClient.question.update({
            where: { id },
            data: { text, points, type },
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
    const schemaResult = createQuestionSchema.safeParse(req.body);
    
    if (!schemaResult.success) {
      console.log("body" , req.body);
      const error = new Error(
        "Validation Error: " + JSON.stringify(schemaResult.error.flatten())
      );
      // @ts-ignore
      error.status = 400;
      throw error;
    }

    const { type, text, points, options } = schemaResult.data;
    console.log("schemaResult.data", schemaResult.data)
    let question = null;
    if (type === "MCQ") {
      const sanitizedOptions = options?.map((opt) => ({
        text: opt.text,
        isCorrect: opt.isCorrect,
      }));
      question = await prismaClient.question.create({
        data: {
          type: type,
          text: text,
          points: points,
          userId: req.user!.id,
          options: {
            create: sanitizedOptions,
          },
        },
        include: {
          options: true,
        },
      });
    } else {
      res
        .status(200)
        .json({ success: true, message: "DSA type is coming soon", data: [] });
      return;
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
