import type { Express } from "express";
import { createServer, type Server } from "http";
const P: Record<string, string> = {
  idea: "אתה סוכן אסטרטגיה. נתח את הרעיון, הגדר value proposition, זהה מתחרים, הצע 3 זוויות שוק. כתוב בעברית.",
  spec: "אתה אדריכל תוכנה. כתוב מפרט טכני: ארכיטקטורה, טבלאות DB, API endpoints, רכיבי UI. כתוב בעברית.",
  build: "אתה מפתח fullstack. כתוב קוד מלא, פרק לקבצים, הוסף TypeScript types. כתוב בעברית.",
  automate: "אתה DevOps. צור GitHub Actions workflow, tests, CI/CD. כתוב בעברית.",
  test: "אתה QA. כתוב test plan, בדוק edge cases, הצע שיפורים. כתוב בעברית.",
  launch: "אתה PM. צור checklist השקה, deployment script, release notes. כתוב בעברית.",
  operate: "אתה SRE. הגדר monitoring, alerts, KPIs, תכנית scale. כתוב בעברית."
};
export async function registerRoutes(httpServer: any, app: Express): Promise<Server> {
  app.post("/api/pipeline/run", async (req: any, res: any) => {
    try {
      const { project_id, stage, project_name, project_description } = req.body;
      if (!project_id || !stage || !project_name) return res.status(400).json({ error: "missing fields" });
      const prompt = P[stage];
      if (!prompt) return res.status(400).json({ error: "invalid stage" });
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "no api key" });
      const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, system: prompt, messages: [{ role: "user", content: `project: ${project_name}\\n${project_description || ""}` }] })
      });
      const aiData = await aiRes.json() as any;
      const result = aiData.content?.[0]?.text || "no result";
      const sUrl = process.env.SUPABASE_URL;
      const sKey = process.env.SUPABASE_ANON_KEY;
      let tasks_created = 0;
      if (sUrl && sKey) {
        const r = await fetch(`${sUrl}/rest/v1/agent_tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "apikey": sKey, "Authorization": `Bearer ${sKey}`, "Prefer": "return=minimal" },
          body: JSON.stringify({ project_id: Number(project_id), title: `Pipeline ${stage} - ${project_name}`, description: result, col: "הושלם", priority: "גבוה" })
        });
        if (r.ok) tasks_created = 1;
      }
      res.json({ success: true, stage, result, tasks_created });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.get("/api/pipeline/status/:project_id", async (req: any, res: any) => {
    try {
      const sUrl = process.env.SUPABASE_URL;
      const sKey = process.env.SUPABASE_ANON_KEY;
      if (!sUrl || !sKey) return res.status(500).json({ error: "no supabase config" });
      const r = await fetch(`${sUrl}/rest/v1/agent_tasks?project_id=eq.${req.params.project_id}&order=id.asc`, {
        headers: { "apikey": sKey, "Authorization": `Bearer ${sKey}` }
      });
      res.json({ success: true, tasks: await r.json() });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.post("/api/ai/chat", async (req: any, res: any) => {
    try {
      const { model, max_tokens, system, messages, tools } = req.body;
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
      const body: any = { model: model || "claude-sonnet-4-20250514", max_tokens: max_tokens || 1800, messages };
      if (system) body.system = system;
      if (tools) body.tools = tools;
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify(body)
      });
      res.json(await r.json());
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.get("/api/health", (_req: any, res: any) => res.status(200).json({ status: "ok" }));
  return httpServer;
}
