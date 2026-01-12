import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import authRouter from "./routes/auth.route";
import contestRouter from "./routes/contest.route";
import questionRouter from "./routes/question.route";
import cookieParser from "cookie-parser";
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/contests", contestRouter);
app.use("/questions", questionRouter);

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
app.listen(PORT);
