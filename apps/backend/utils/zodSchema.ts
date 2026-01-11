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
  startDate: z.date(),
  startTime: z.string(),
  endTime: z.string(),
  questionIds: z.array(z.string()),
});
