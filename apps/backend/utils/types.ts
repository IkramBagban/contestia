import type { Request } from "express";

export interface ExtendedRequest extends Request {
    user?: {
        id: string
        email: String
    }
}