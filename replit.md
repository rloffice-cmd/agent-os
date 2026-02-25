# AI Project Management Dashboard (Hebrew)

## Overview
A Hebrew-language AI project management dashboard for an Israeli entrepreneur. Built with React + Vite + Supabase, managing projects, Kanban tasks, documents, AI prompts, knowledge base, ideas, and AI tools. Integrates Claude AI for weekly summaries, market research with web search, and a conversational agent. A companion Telegram bot provides mobile access.

## Architecture
- **Frontend**: Single-file React app (`client/src/App.tsx`) with inline CSS, no shadcn/Tailwind
- **Backend**: Express server (template default, mostly unused — app talks directly to Supabase)
- **Database**: Supabase (external) — tables: `agent_projects`, `agent_tasks`, `agent_docs`, `agent_prompts`, `agent_knowledge`, `agent_ideas`, `agent_tools`, `agent_messages`
- **Telegram Bot**: `telegram-bot.js` — standalone Node.js ES module with polling

## Key Features (v6)
- Dashboard with weekly AI summaries, urgent tasks, active projects
- Project management with stage tracking
- Kanban board for tasks per project
- Documents tab (`agent_docs`) with CRUD, filter by project/type
- Real-time sync via Supabase subscriptions (tasks, projects, docs)
- Live connection indicator (green "LIVE" badge)
- AI tools catalog with ratings
- Prompt library with copy/rate
- Market research with web search
- Knowledge base (lessons learned)
- Ideas bank
- AI chat agent with conversation history
- Telegram bot for mobile access

## Supabase Tables
- `agent_projects`: id, name, type, stage, description, tags, created_at
- `agent_tasks`: id, project_id, title, description, col, priority, due_date, tags
- `agent_docs`: id (BIGINT), title (TEXT), type (TEXT), content (TEXT), project (TEXT), created_at (TEXT)
- `agent_prompts`: id, title, category, prompt, tags, uses, rating
- `agent_knowledge`: id, type, title, content, project, tags, date
- `agent_ideas`: id, title, description, potential, tags, status, date
- `agent_tools`: id, name, category, logo, description, use_cases, strengths, weaknesses, pricing, url, my_rating, status, tags
- `agent_messages`: role, content, created_at

## Environment Variables
- `ANTHROPIC_API_KEY` — required for Claude AI features (bot + frontend AI calls)
- `SESSION_SECRET` — Express session

## Workflows
- **Start application**: `npm run dev` (port 5000)
- **Telegram Bot**: `node --experimental-modules telegram-bot.js` (port 3000)

## Real-time
Supabase real-time subscriptions enabled for `agent_tasks`, `agent_projects`, `agent_docs`. Requires Supabase Realtime to be enabled on these tables in the Supabase dashboard.
