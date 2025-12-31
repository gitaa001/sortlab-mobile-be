import express from "express";
import cors from "cors";
import "dotenv/config";
import { authRouter } from "./routes/auth.js";
import { homeRouter } from "./routes/home.js";
import { meRouter } from "./routes/me.js";
import { coursesRouter } from "./routes/courses.js";
import { progressRouter } from "./routes/progress.js";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Logging middleware
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get("/health", (_req, res) => res.json({ ok: true }));


app.use("/auth", authRouter);
app.use("/home", homeRouter);
app.use("/me", meRouter);
app.use("/courses", coursesRouter);
app.use("/progress", progressRouter);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
