import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      const error = new Error("Authentication required.");
      // @ts-ignore
      error.status = 401;
      throw error;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? "secret");

    // @ts-ignore
    req.user = decoded;

    next();
  } catch (err) {
    const error = new Error("Unauthorized. Please login again.");
    // @ts-ignore
    error.status = 401;
    next(error);
  }
};
