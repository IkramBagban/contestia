import { Router } from "express";
import { getLanguagesController, runCodeController, submitCodeController } from "../controllers/judge0.controller";
import { auth } from "../middleware/auth.middleware";

const router = Router();

router.get("/languages", getLanguagesController);
router.post("/run-code", auth, runCodeController);
router.post("/submit-code", auth, submitCodeController);

export default router;
