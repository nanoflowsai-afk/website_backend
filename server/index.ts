import dotenv from "dotenv";
dotenv.config();

import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
// import .js specifiers so built ESM output resolves correctly at runtime
import path from "path";
import homeRouter from "./routes/home.js";
import contactRouter from "./routes/contact.js";
import authRouter from "./routes/auth.js";
import adminRouter from "./routes/admin/index.js";
import uploadsRouter from "./routes/uploads.js";
import careersRouter from "./routes/careers.js";
import applyRouter from "./routes/apply.js";

const app = express();

app.use(morgan("dev"));

// CORS: allow any origin (frontend is public) while sending credentials.
// This mirrors the earlier permissive config but also handles preflight.
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.options("*", cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ ok: true }));

// Basic root page for humans/browsers
app.get("/", (_req, res) => {
  res.type("html").send(
    `<html><head><title>API</title></head><body style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;padding:2rem;"><h1>API is running</h1><p>This server hosts the JSON API under <code>/api/*</code>.</p><ul><li><a href="/health">/health</a></li><li><a href="/api/home">/api/home</a></li></ul></body></html>`
  );
});

app.use("/api/home", homeRouter);
app.use("/api/contact", contactRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/careers", careersRouter);
app.use("/api/apply", applyRouter);

// Serve uploaded files from /uploads/*
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "public", "uploads"))
);

const port = process.env.PORT || 5001;

// Wrap server startup in try-catch
try {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  }).on("error", (err: NodeJS.ErrnoException) => {
    console.error("Failed to start server:", err);
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Please use a different port.`);
    }
    process.exit(1);
  });
} catch (err: any) {
  console.error("Fatal error starting server:", err);
  console.error("Error details:", {
    message: err?.message,
    stack: err?.stack,
    name: err?.name,
    code: err?.code,
  });
  process.exit(1);
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  console.error("Uncaught Exception:", err);
  console.error("Stack:", err.stack);
  process.exit(1);
});

// Trigger restart 2
