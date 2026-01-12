import { Router } from "express";
import { createContest, getContests, getContestById, updateContest } from "../controllers/contest.controller";
import { auth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getContests);
router.post("/create", auth, createContest);
router.get("/:id", auth, getContestById);
router.put("/:id", auth, updateContest);

export default router;
