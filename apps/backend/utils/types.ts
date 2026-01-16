import type { Request } from "express";

export interface ExtendedRequest extends Request {
    user?: {
        id: string
        email: String
    }
}

export enum WebSocketMessageType {
    SUBSCRIBE_LEADERBOARD = "SUBSCRIBE_LEADERBOARD",
    UNSUBSCRIBE_LEADERBOARD = "UNSUBSCRIBE_LEADERBOARD",

    LEADERBOARD_UPDATE = "LEADERBOARD_UPDATE",
    ERROR = "ERROR"
}

export interface WebSocketMessage {
    type: WebSocketMessageType
    payload?: any
}

export interface WSResponse {
    type: WebSocketMessageType;
    payload?: any;
    error?: string;
}
