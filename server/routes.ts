import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { model, max_tokens, system, messages, tools } = req.body;
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
      }
      const body: any = {
        model: model || "claude-sonnet-4-20250514",
        max_tokens: max_tokens || 1800,
        messages,
      };
      if (system) body.system = system;
      if (tools) body.tools = tools;
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "AI request failed" });
    }
  });

  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  return httpServer;
}
