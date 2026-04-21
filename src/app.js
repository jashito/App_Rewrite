import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rewriteRouter from "./routes/rewrite.routes.js";
import { notFoundHandler, errorHandler } from "./middlewares/error-handler.js";
import { env } from "./config/env.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "../public");

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(publicDir));
app.use(
  morgan("combined", {
    skip: (req) => env.nodeEnv === "production" && req.path === "/health"
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok"
  });
});

app.use("/api/rewrite", rewriteRouter);
app.use("/rewrite", rewriteRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
