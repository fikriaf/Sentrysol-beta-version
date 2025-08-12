import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleHealth, handleAnalyzeWallet, handleChatAnalysis } from "./routes/backend";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Backend API routes (mock Solana analysis)
  app.get("/health", handleHealth);
  app.get("/analyze/:address", handleAnalyzeWallet);
  app.post("/chat", handleChatAnalysis);

  return app;
}
