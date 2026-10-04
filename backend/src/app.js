import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import categoriesRouter from "./routes/categories.js";
import resourcesRouter from "./routes/resources.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  const database = !process.env.MONGODB_URI
    ? "not_configured"
    : mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected";
  res.json({ status: "ok", database });
});
const requireDatabase = (_req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: "Database is not connected. Configure MONGODB_URI to enable resource and category data."
    });
  }
  next();
};
app.use("/api/categories", requireDatabase, categoriesRouter);
app.use("/api/resources", requireDatabase, resourcesRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((error, _req, res, _next) => {
  if (error.code === 11000) {
    return res.status(409).json({ error: "A category with that slug already exists." });
  }
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ error: error.message });
  }
  console.error(error);
  res.status(500).json({ error: "Internal server error." });
});

export default app;
