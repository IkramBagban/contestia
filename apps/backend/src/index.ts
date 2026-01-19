import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import authRouter from "./routes/auth.route";
import contestRouter from "./routes/contest.route";
import questionRouter from "./routes/question.route";
import simulationRouter from "./routes/simulation.route";
import judge0Router from "./routes/judge0.route";
import cookieParser from "cookie-parser";
import { createServer } from 'http'
import { WebSocketServer } from "ws";
import websocketHandler from "./services/ws";
const PORT = process.env.PORT || 3000;
const app = express();

const server = createServer(app)

const wss = new WebSocketServer({ server })
wss.on("connection", websocketHandler)

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/contests", contestRouter);
app.use("/questions", questionRouter);
app.use("/simulation", simulationRouter);
app.use("/judge0", judge0Router);

app.get("/", (req, res) => {
  res.send("backend is working");
});

app.use(
  (
    err: Error & { status: number; message: string },
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const status = err.status || 500;
    const errorMessage = err.message || "Internal Serer Error";
    console.log("ERROR: ", { err });
    res.status(status).json({ success: false, error: errorMessage });
  }
);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});