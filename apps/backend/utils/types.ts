import type { Request } from "express";
import judge0 from "../src/services/judge0";

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



// ---
// judge0

export interface RunCodeParams {
    code: string
    funcName: string
    languageId: number
    testCases: {
        id: string
        input: any[]
        expectedOutput: string
    }[]

}

export interface Judge0Response {
    stdout: string | null
    stderr: string | null
    compile_output: string | null
    status: { id: number; description: string }
    time: string
    memory: number
}

export type TestCase = RunCodeParams["testCases"][number]

export interface TestResult {
    testCaseId: string
    passed: boolean
    input: TestCase["input"]
    expectedOutput: TestCase["expectedOutput"]
    actualOutput: string
    error: string | null
    executionTime: string | null
}

export interface RunResult {
    passed: number
    failed: number
    total: number
    results: TestResult[]
    compilationError: string | null
}
