import type { Request, Response } from "express";
import { simulationService } from "../services/simulation.service";

export const handleSimulation = async (req: Request, res: Response) => {
    const action = req.query.action as string;

    if (action === "start") {
        const result = await simulationService.start();
        res.json(result);
    } else if (action === "stop") {
        const result = simulationService.stop();
        res.json(result);
    } else {
        res.json(simulationService.getStatus());
    }
};
