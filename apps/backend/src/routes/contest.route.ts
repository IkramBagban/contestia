import { Router } from "express";
import { createContest, getContests } from "../controllers/contest.controller";
import { auth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getContests);
router.post("/create", auth, createContest);

export default router;
