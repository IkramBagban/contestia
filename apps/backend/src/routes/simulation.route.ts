import { Router } from "express";
import { handleSimulation } from "../controllers/simulation.controller";

const router = Router();

router.get("/", handleSimulation);

export default router;
