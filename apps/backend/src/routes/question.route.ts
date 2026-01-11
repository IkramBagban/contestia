import { Router } from "express";
import { createContest, getContests } from "../controllers/contest.controller";
import { auth } from "../middleware/auth.middleware";
import { createQuestion, getQuestions } from "../controllers/question.controller";

const router = Router();

router.get("/", getQuestions);
router.post("/create", auth, createQuestion);

export default router;
