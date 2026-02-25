# AI Project Management OS v7 (Hebrew)

## Overview
Hebrew-language AI Project Management OS for an Israeli entrepreneur. Built with React + Vite + Supabase, managing projects, Kanban tasks, prompts, knowledge base, and AI tools. v7 focuses on agentic automation: multi-agent Orchestrator, 7-stage Pipeline, SignalForge B2B lead engine monitoring, self-upgrade engine, and an agentic chat that can autonomously create projects/tasks and trigger pipelines. A companion Telegram bot provides mobile access.

## Architecture
- **Frontend**: Single-file React app (`client/src/App.tsx`) with inline CSS, custom design system (no shadcn/Tailwind)
- **Backend**: Express server (template default, mostly unused — app talks directly to Supabase)
- **Database**: Supabase (external) — tables: `agent_projects`, `agent_tasks`, `agent_prompts`, `agent_knowledge`, `agent_tools`, `agent_messages`
- **Telegram Bot**: `telegram-bot.js` — standalone Node.js ES module with polling
- **AI**: Claude claude-sonnet-4-20250514 via Anthropic API (called directly from frontend)

## Key Features (v7)
- **9 Tabs**: פיקוד (Command), Pipeline, Orchestrator, SignalForge, פרויקטים, משימות, Analytics, Lab, Agent HQ
- **7-Stage Pipeline**: idea → spec → build → automate → test → launch → operate (each with AI agents)
- **Multi-Agent Orchestrator**: Runs מנתח שוק, ארכיטקט, PM, Growth Hacker sequentially with real results
- **SignalForge Live Monitoring**: Polls external SF app every 60s for leads/emails/DB status
- **Self-Upgrade Engine (Lab)**: AI analyzes itself, proposes improvements
- **Agentic Chat (Agent HQ)**: AI parses JSON actions (create_project, create_task, start_pipeline, upgrade_agent)
- **Analytics & ROI**: Project progress, task load, market research with web search
- **Mobile bottom nav**: Responsive with safe-area support

## Design System
- CSS variables: --bg:#04080f, --accent:#5b8def, --sf:#00e5a0, --purple:#a78bfa
- Fonts: Syne (headings), JetBrains Mono (code), Noto Sans Hebrew (body)
- Dark theme only, RTL layout

## Supabase
- URL: `https://pkviptoytcrdnhhspmtq.supabase.co`
- Tables: agent_projects, agent_tasks, agent_prompts, agent_knowledge, agent_tools, agent_messages
- Real-time subscriptions on agent_tasks, agent_projects

## Environment Variables
- `ANTHROPIC_API_KEY` — required for Claude AI features (bot + frontend AI calls)
- `SESSION_SECRET` — Express session

## External Integrations
- **SignalForge**: `https://42db220e-5803-46ef-b732-23785edabd76-00-26knnqjmug8l8.picard.replit.dev` (B2B lead engine on separate Replit)

## Workflows
- **Start application**: `npm run dev` (port 5000)
- **Telegram Bot**: `node --experimental-modules telegram-bot.js` (port 3000)
