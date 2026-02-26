# AI Project Management OS v7 (Hebrew)

## Overview
Hebrew-language AI Project Management OS for an Israeli entrepreneur. Built with React + Vite + Supabase, managing projects, Kanban tasks, prompts, knowledge base, and AI tools. v7 focuses on agentic automation: multi-agent Orchestrator, 7-stage Pipeline, SignalForge B2B lead engine monitoring, self-upgrade engine, agentic chat that can autonomously create projects/tasks and trigger pipelines, and an encrypted Vault for secure credential storage. A companion Telegram bot provides mobile access.

## Architecture
- **Frontend**: Single-file React app (`client/src/App.tsx`) with inline CSS, custom design system (no shadcn/Tailwind)
- **Backend**: Express server (template default, mostly unused — app talks directly to Supabase)
- **Database**: Supabase (external) — tables: `agent_projects`, `agent_tasks`, `agent_prompts`, `agent_knowledge`, `agent_tools`, `agent_messages`, `agent_vault`
- **Telegram Bot**: `telegram-bot.js` — standalone Node.js ES module with polling
- **AI**: Claude claude-sonnet-4-20250514 via Anthropic API (called directly from frontend)

## Key Features (v7)
- **10 Tabs**: פיקוד (Command), Pipeline, Orchestrator, SignalForge, פרויקטים, משימות, Analytics, Lab, Vault 🔐, Agent HQ
- **7-Stage Pipeline**: idea → spec → build → automate → test → launch → operate (each with AI agents)
- **Multi-Agent Orchestrator**: Runs מנתח שוק, ארכיטקט, PM, Growth Hacker sequentially with real results
- **SignalForge Live Monitoring**: Polls external SF app every 60s for leads/emails/DB status
- **Self-Upgrade Engine (Lab)**: AI analyzes itself, proposes improvements
- **Agentic Chat (Agent HQ)**: AI parses JSON actions (create_project, create_task, start_pipeline, upgrade_agent)
- **Analytics & ROI**: Project progress, task load, market research with web search
- **Encrypted Vault**: Client-side AES-256-GCM + PBKDF2 (200k iterations) for secure secret storage
- **Mobile bottom nav**: Responsive with safe-area support, includes Vault tab

## Encrypted Vault (🔐)
- **Encryption**: AES-256-GCM with PBKDF2 key derivation (200,000 iterations), all client-side via Web Crypto API
- **Master Password**: First-time setup screen with password strength indicator; lock/unlock screen for returning users
- **Auto-Lock**: 10-minute inactivity timer (resets on mousedown/keydown/scroll/touchstart)
- **Clipboard Security**: Auto-clears clipboard 30 seconds after copying any secret value
- **Categories**: API Keys 🔑, Platforms 🌐, Accounts 👤, Payment 💳, Webhooks 🔗, Other 📦
- **Secret Structure**: name, category, service, fields (key-value pairs), projects array, notes
- **Features**: Create/edit/delete secrets, search & filter by category/text, show/hide toggle per field, category stats dashboard, master password change with re-encryption
- **Storage**: Encrypted blobs in Supabase `agent_vault` table (id BIGINT, encrypted_data TEXT, created_at TEXT)
- **Client Storage**: Salt (hex) in localStorage key `vault_salt_v7`, password hash in localStorage key `vault_hash_v7`
- **Design**: --vault:#f472b6 color, vault-specific CSS classes (.vault-lock-screen, .vault-secret-card, .vault-field, .strength-bar)

## Design System
- CSS variables: --bg:#04080f, --accent:#5b8def, --sf:#00e5a0, --purple:#a78bfa, --vault:#f472b6
- Fonts: Syne (headings), JetBrains Mono (code), Noto Sans Hebrew (body)
- Dark theme only, RTL layout

## Supabase
- URL: `https://pkviptoytcrdnhhspmtq.supabase.co`
- Tables: agent_projects, agent_tasks, agent_prompts, agent_knowledge, agent_tools, agent_messages, agent_vault
- Real-time subscriptions on agent_tasks, agent_projects
- agent_vault schema: id (BIGINT), encrypted_data (TEXT), created_at (TEXT)

## Environment Variables
- `ANTHROPIC_API_KEY` — required for Claude AI features (bot + frontend AI calls)
- `SESSION_SECRET` — Express session

## External Integrations
- **SignalForge**: `https://42db220e-5803-46ef-b732-23785edabd76-00-26knnqjmug8l8.picard.replit.dev` (B2B lead engine on separate Replit)

## Workflows
- **Start application**: `npm run dev` (port 5000)
- **Telegram Bot**: `node --experimental-modules telegram-bot.js` (port 3000)
