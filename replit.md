# Agent OS – מנהל הסוכנים
## סיכום פרויקט מלא | עודכן: 2026-03-02

---

## זהות הפרויקט

- **שם:** Agent OS / מנהל הסוכנים
- **מטרה:** מערכת ניהול סוכני AI עם Pipeline אוטומטי מ-רעיון עד הפעלה
- **בעלים:** rloffice@gmail.com (Dan, rloffice-cmd)
- **Replit URL:** https://vite-react-starter-rloffice.replit.app
- **GitHub:** https://github.com/rloffice-cmd/agent-os
- **Vercel Production:** https://agent-os-bay.vercel.app

---

## ארכיטקטורה

### Stack
- **Frontend:** React + TypeScript + Vite (client/src/App.tsx)
- **Backend:** Express + TypeScript (server/index.ts + server/routes.ts)
- **Database:** Supabase (REST API ישיר, ללא SDK)
- **AI:** Anthropic Claude claude-sonnet-4-20250514
- **Hosting:** Replit (production) + Vercel (frontend static)

### הפעלת השרת
```bash
# חשוב: חייב לטעון .env לפני הרצה
npm run dev
# הסקריפט כולל: tsx --env-file=.env server/index.ts
```

---

## Environment Variables

### ב-.env (Replit workspace)
```
SUPABASE_URL=https://pkviptoytcrdnhhspmtq.supabase.co
SUPABASE_ANON_KEY=eyJhbGci... (208 תווים)
```

### ב-Replit Secrets (אוטומטי בסביבה)
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### ב-Vercel (הוגדרו דרך API)
- SUPABASE_URL ✅
- SUPABASE_ANON_KEY ✅  
- ANTHROPIC_API_KEY ✅

---

## Supabase

- **Project ID:** pkviptoytcrdnhhspmtq
- **URL:** https://pkviptoytcrdnhhspmtq.supabase.co

### טבלאות
```sql
agent_tasks: id, project_id, title, description, col, priority, due_date, tags(jsonb)
agent_projects: id, name, type, stage, description, tags(jsonb), created_at
```

### שימוש בקוד (ללא SDK!)
```typescript
// תמיד להשתמש ב-fetch ישיר, לא @supabase/supabase-js
const sUrl = process.env.SUPABASE_URL;
const sKey = process.env.SUPABASE_ANON_KEY;
const res = await fetch(`${sUrl}/rest/v1/agent_tasks?project_id=eq.${project_id}`, {
  headers: {
    'apikey': sKey,
    'Authorization': `Bearer ${sKey}`
  }
});
```

---

## API Endpoints

| Method | Path | תיאור |
|--------|------|--------|
| GET | /api/health | בדיקת חיים |
| POST | /api/ai/chat | צ'אט ישיר עם Claude |
| POST | /api/pipeline/run | הרצת שלב Pipeline |
| GET | /api/pipeline/status/:project_id | קבלת tasks מ-Supabase |

### דוגמת קריאה ל-Pipeline
```bash
curl -X POST http://localhost:5000/api/pipeline/run \
  -H "Content-Type: application/json" \
  -d '{"project_id":1,"stage":"idea","project_name":"שם פרויקט","project_description":"תיאור"}'
# Returns: {"success":true,"stage":"idea","result":"...תוכן בעברית...","tasks_created":1}
```

---

## Pipeline – 7 שלבים

כל שלב קורא ל-Anthropic עם system prompt בעברית ושומר תוצאה ב-Supabase.

| idx | id | שם | תיאור |
|-----|----|----|--------|
| 0 | idea | 💡 רעיון | value prop, מתחרים, 3 זוויות שוק |
| 1 | spec | 📋 מפרט | ארכיטקטורה, DB, API, UI |
| 2 | build | 🔨 בנייה | קוד מלא, TypeScript types |
| 3 | automate | ⚙️ אוטומציה | GitHub Actions, CI/CD |
| 4 | test | 🧪 בדיקות | test plan, edge cases |
| 5 | launch | 🚀 השקה | deployment checklist, release notes |
| 6 | operate | 📊 תפעול | monitoring, KPIs, scale |

### תוצאות בדיקה (2026-03-02)
- idea ✅ 2,781 תווים
- spec ✅ 6,030 תווים
- build ✅ 5,482 תווים
- automate ✅ 5,451 תווים
- test ✅ 3,086 תווים
- launch ✅ 5,058 תווים
- operate ✅ 4,639 תווים

---

## MCP Servers (על Windows – C:\\Users\\dan)

הוגדרו ב-Claude Code CLI (claude mcp add):

| שם | Transport | כתובת |
|----|-----------|--------|
| github | http | https://api.githubcopilot.com/mcp |
| filesystem | stdio | cmd /c npx @modelcontextprotocol/server-filesystem |
| supabase | http | https://mcp.supabase.com/mcp?project_ref=pkviptoytcrdnhhspmtq |
| gmail | - | מוגדר |
| google-calendar | - | מוגדר |
| asana | - | מוגדר |

---

## Git & Commits

```bash
# Remote עם PAT (לשימוש ב-Replit Shell)
git push github main

# Commits עיקריים
ba84e94  feat: connect Pipeline UI to /api/pipeline/run backend
443be03  fix: load .env via tsx --env-file for persistent Supabase config
969906b  feat: Pipeline agent with 7 stages and Supabase integration
```

---

## בעיות שנפתרו

| בעיה | פתרון |
|------|--------|
| .env לא נטען ב-tsx | שינוי package.json: tsx --env-file=.env |
| Supabase מחזיר "no config" | export vars לפני npm run dev |
| git push נכשל ב-Replit | שימוש ב-remote github עם PAT |
| Pipeline UI לא קרא לbackend | עדכון runPipeStage בApp.tsx ל-fetch('/api/pipeline/run') |
| Vercel 404 על /api | Vercel הוא static frontend בלבד, API רק ב-Replit |

---

## מה עובד עכשיו

- ✅ שרת Express על פורט 5000
- ✅ כל 7 שלבי Pipeline עם Claude AI
- ✅ שמירה לSupabase
- ✅ UI מחובר לbackend
- ✅ Vercel deploy עם env vars
- ✅ GitHub sync

## מה חסר / עתידי

- ⬜ Vercel Serverless Functions (כדי שAPI יעבוד ב-production URL)
- ⬜ Auth / login למשתמשים
- ⬜ Dashboard לצפייה בתוצאות Pipeline
- ⬜ Webhook מ-GitHub לauto-deploy

---

## הוראות לClaude Agent שקורא קובץ זה

1. השרת מופעל עם `npm run dev` – כולל --env-file=.env אוטומטית
2. לעולם אל תשתמש ב-@supabase/supabase-js – רק fetch ישיר
3. להוסיף endpoints ב-server/routes.ts בלבד
4. לdeploy: `git add . && git commit -m "..." && git push github main`
5. ה-API זמין רק ב-Replit, לא ב-Vercel
6. project_id=3 הוא פרויקט הtest הקיים ב-Supabase
