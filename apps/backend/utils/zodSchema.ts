import z from "zod";

export const signupSchema = z.object({
  fullname: z.string("fullname should be an string"),
  email: z.email(),
  password: z.string(),
});
export const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});