import { Router } from "express";
import { createContest, getContests, getContestById, updateContest, startContest, submitContest, getContestForAttempt } from "../controllers/contest.controller";
import { auth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getContests);
router.post("/create", auth, createContest);
router.get("/:id", auth, getContestById);
router.get("/:id/attempt", auth, getContestForAttempt);
router.put("/:id", auth, updateContest);

router.post("/:id/start", auth, startContest);
router.post("/:id/submit", auth, submitContest);

export default router;
