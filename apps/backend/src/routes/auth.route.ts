import { Router } from "express";
import { login, logout, me, signup, getMySubmissions } from "../controllers/auth.controller";
import { auth } from "../middleware/auth.middleware";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", auth, me);
router.get("/me/submissions", auth, getMySubmissions);
router.post("/logout", auth, logout);

export default router;
