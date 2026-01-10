import { Router } from "express";
import { login, signup } from "../controllers/auth.controller";

const router = Router();

router.get("/signup", signup);
router.get("/login", login);

export default router;
