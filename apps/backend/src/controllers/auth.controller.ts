import type { NextFunction, Request, Response } from "express";
import { loginSchema, signupSchema } from "../../utils/zodSchema";
import prismaClient from "@repo/db";
import { Prisma } from "@repo/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    const schemaResult = signupSchema.safeParse(body);

    if (!schemaResult.success) {
      const error = new Error(
        "validation Error: " + JSON.stringify(schemaResult.error.flatten())
      );
      // will solve type error later
      // @ts-ignore
      error.status = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const newUser = await prismaClient.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      sucess: true,
      data: {
        id: newUser.id,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const err = new Error("Email already in use.");
        // @ts-ignore
        err.status = 409;
        return next(error);
      }
    }
    next(error);
  }
  console.log("Signup");
};
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("login");
  try {
    const body = req.body;

    const schemaResult = loginSchema.safeParse(body);
    if (!schemaResult.success) {
      const error = new Error(
        "validation Error: " + JSON.stringify(schemaResult.error.flatten())
      );
      // will solve type error later
      // @ts-ignore
      error.status = 400;
      throw error;
    }

    // check if exists.
    const existingUser = await prismaClient.user.findFirst({
      where: {
        email: body.email,
      },
      select: { id: true, password: true, email: true },
    });

    if (!existingUser) {
      const error = new Error("Email doesn't exist");
      // @ts-ignore
      error.status = 404;
      throw error;
    }

    //match password
    const isMatch = bcrypt.compare(body.password, existingUser.password);

    if (!isMatch) {
      const error = new Error("Wrong Password");
      // @ts-ignore
      error.status = 400;
      throw error;
    }

    // generate jwt
    const jwtPayload = {
      id: existingUser.id,
      email: existingUser.email,
    };
    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET ?? "secret");

    req.cookies("token", token);
    res
      .status(200)
      .json({ success: true, message: "You are logged in successfully." });
  } catch (error) {
    next(error);
  }
};
