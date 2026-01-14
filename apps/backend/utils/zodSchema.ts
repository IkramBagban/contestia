import z, { number, string } from "zod";

export const signupSchema = z.object({
  fullname: z.string("fullname should be an string"),
  email: z.email(),
  password: z.string(),
});
export const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const createContestSchema = z.object({
  title: z.string(),
  description: z.string(),
  startDate: z.coerce.date(),
  startTime: z.string(),
  endTime: z.string(),
  questionIds: z.array(z.string()),
});

export const optionSchema = z.object({
  questionId: z.string().optional(),
  text: z.string(),
  isCorrect: z.boolean(),
});
export const testSchema = z.object({
  questionId: z.string().optional(),
  input: z.string(),
  output: z.string(),
});

export const createQuestionSchema = z
  .object({
    text: z.string(),
    type: z.enum(["MCQ", "DSA"]),
    points: z.number(),

    options: z.array(optionSchema).optional(),
    testCases: z.array(testSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "MCQ") {
      if (!data.options || data.options.length < 1) {
        ctx.addIssue({
          path: ["options"],
          message: "Options are required for MCQ questions",
          code: "custom",
        });
      }
    }
    else if (data.type === "DSA" && (!data.testCases || data.testCases.length < 1)) {
      ctx.addIssue({
        path: ["testCases"],
        message: "Test cases are required for DSA questions",
        code: "custom",
      });
    }
  });

export const questionQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  contestId: z.string().optional(),
  type: z.enum(["MCQ", "DSA"]).optional(),
});
