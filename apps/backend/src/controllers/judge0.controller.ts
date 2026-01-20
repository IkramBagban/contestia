import type { NextFunction, Request, Response } from "express";
import prismaClient from "@repo/db";
import { runCodeSchema, submitCodeSchema } from "../../utils/zodSchema";
import type { ExtendedRequest, RunCodeParams } from "../../utils/types";
import { redisManager } from "../services/redis";
import Judge0Manager from "../services/judge0";
import { SUPPORTED_LANGUAGES } from "../../utils/constants";

const judge0Manager = new Judge0Manager()

export const getLanguagesController = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const languages = await judge0Manager.getLanguages()
        res.json(languages)
    } catch (error) {
        next(error)
    }
}

export const runCodeController = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
        const schemaResult = runCodeSchema.safeParse(req.body)
        if (!schemaResult.success) {
            const error = new Error("Validation Error: " + JSON.stringify(schemaResult.error.flatten()))
            // @ts-ignore
            error.status = 400
            throw error
        }

        const { languageId, code, questionId } = schemaResult.data

        const question = await prismaClient.question.findUnique({
            where: { id: questionId },
            select: {
                type: true,
                funcName: true,
                testCases: {
                    where: { isHidden: false },
                    select: {
                        id: true,
                        input: true,
                        expectedOutput: true
                    }
                }
            }
        })

        if (!question) {
            const error = new Error("Question not found")
            // @ts-ignore
            error.status = 404
            throw error
        }

        if (question.type !== "DSA") {
            const error = new Error("Question type is not DSA")
            // @ts-ignore
            error.status = 400
            throw error
        }

        if (!question.testCases.length) {
            const error = new Error("Question test cases not found")
            // @ts-ignore
            error.status = 404
            throw error
        }

        const result = await judge0Manager.runCode({
            languageId,
            code,
            funcName: question.funcName,
            testCases: question.testCases as RunCodeParams["testCases"]
        })

        res.json(result)
    } catch (error) {
        next(error)
    }
}

export const submitCodeController = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
        const schemaResult = submitCodeSchema.safeParse(req.body)
        if (!schemaResult.success) {
            const error = new Error("Validation Error: " + JSON.stringify(schemaResult.error.flatten()))
            // @ts-ignore
            error.status = 400
            throw error
        }

        const { languageId, code, questionId, contestId } = schemaResult.data
        const userId = req.user?.id

        if (!userId) {
            const error = new Error("Unauthorized")
            // @ts-ignore
            error.status = 401
            throw error
        }

        const question = await prismaClient.question.findUnique({
            where: { id: questionId },
            select: {
                type: true,
                points: true,
                funcName: true,
                testCases: {
                    select: {
                        id: true,
                        input: true,
                        expectedOutput: true
                    }
                }
            }
        })

        if (!question) {
            const error = new Error("Question not found")
            // @ts-ignore
            error.status = 404
            throw error
        }

        if (question.type !== "DSA") {
            const error = new Error("Question type is not DSA")
            // @ts-ignore
            error.status = 400
            throw error
        }

        if (!question.testCases.length) {
            const error = new Error("Question test cases not found")
            // @ts-ignore
            error.status = 404
            throw error
        }

        const result = await judge0Manager.runCode({
            languageId,
            code,
            funcName: question.funcName,
            testCases: question.testCases as RunCodeParams["testCases"]
        })

        let newScore: number | undefined
        let pointsEarned = 0
        const isAllPassed = result.passed === result.total && result.total > 0;

        const submission = await prismaClient.submission.findUnique({
            where: {
                userId_contestId: { userId, contestId }
            },
            select: {
                id: true,
                score: true,
                answers: true
            }
        });

        if (!submission) {
            const err = new Error("Submission not found. Please start the contest first.");
            (err as any).status = 404;
            throw err;
        }

        const currentAnswers = (submission.answers as Record<string, any>) || {};
        const wasCorrect = currentAnswers[questionId]?.isCorrect === true;

        if (isAllPassed && !wasCorrect) {
            newScore = submission.score + question.points;
            pointsEarned = question.points;
        } else if (!isAllPassed && wasCorrect) {
            newScore = submission.score - (currentAnswers[questionId].points || question.points);
            pointsEarned = 0;
        } else {
            newScore = submission.score;
        }
        const updatedAnswers = {
            ...currentAnswers,
            [questionId]: {
                value: code,
                isCorrect: isAllPassed,
                points: isAllPassed ? question.points : 0,
                languageId
            }
        };

        await prismaClient.submission.update({
            where: { id: submission.id },
            data: {
                score: newScore,
                answers: updatedAnswers
            }
        });

        await redisManager.redis.zadd(`contest:${contestId}:leaderboard`, newScore, userId);

        res.json({
            ...result,
            score: newScore,
            pointsEarned,
            submitted: true
        });
    } catch (error) {
        next(error);
    }
};