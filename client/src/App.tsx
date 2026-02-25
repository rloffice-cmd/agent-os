import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ============================================================
// חיבור ל-Supabase (= מסד נתונים ענן לסנכרון בין מכשירים)
// ============================================================
const SUPABASE_URL = "https://pkviptoytcrdnhhspmtq.supabase.co";
const SUPABASE_KEY = "sb_publishable_AgDyy3NQj4MZBpYjGmWPNQ_NdlT1E7j";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// קבועים
// ============================================================
const TABS = ["🏠 מרכז פיקוד","📋 פרויקטים","✅ משימות","🤖 כלי AI","💡 פרומפטים","🔍 מחקר שוק","📚 ידע ולקחים","💭 רעיונות","🧠 סוכן AI"];
const STAGES = ["רעיון","תכנון","פיתוח","בדיקות","השקה","צמיחה","הושלם","מושהה"];
const TYPES = ["רווח","אישי/משפחתי"];
const STAGE_COL = { "רעיון":"#6366f1","תכנון":"#8b5cf6","פיתוח":"#f59e0b","בדיקות":"#ef4444","השקה":"#10b981","צמיחה":"#06b6d4","הושלם":"#22c55e","מושהה":"#6b7280" };
const KANBAN_COLS = ["לביצוע","בתהליך","הושלם"];
const KANBAN_COL_COLOR = { "לביצוע":"#6366f1","בתהליך":"#f59e0b","הושלם":"#22c55e" };
const PRIORITY = ["נמוכה","בינונית","גבוהה","דחוף"];
const PRIORITY_COL = { "נמוכה":"#64748b","בינונית":"#f59e0b","גבוהה":"#f97316","דחוף":"#ef4444" };
const PROMPT_CATS = ["כל הקטגוריות","קוד ופיתוח","עיצוב וממשק","שיווק ומכירות","מחקר וניתוח","אוטומציה","אסטרטגיה","כללי"];
const TOOL_CATS = ["הכל","פיתוח וקוד","עיצוב וממשק","אוטומציה","שפה וכתיבה","תמונות ומדיה","ניתוח ודאטה","שיווק","אחר"];

// ============================================================
// נתוני ברירת מחדל — נטענים רק אם הטבלה ריקה
// ============================================================
const DEF_PROJECTS = [
  { id:1, name:"אפליקציה משפחתית לימוד AI", type:"אישי/משפחתי", stage:"הושלם", description:"אפליקציה ללמד את המשפחה על בינה מלאכותית", tags:["ai","חינוך"], created_at:"2024-01-01" },
  { id:2, name:"אפליקציה לימוד נדל\"ן", type:"אישי/משפחתי", stage:"הושלם", description:"למידה ואוטומציה בתחום הנדל\"ן", tags:["נדלן","למידה"], created_at:"2024-03-01" },
  { id:3, name:"ארביטרז קריפטו", type:"רווח", stage:"פיתוח", description:"מערכת אוטומטית לארביטרז (= ניצול הפרשי מחירים) בשווקי קריפטו", tags:["קריפטו","אוטומציה","בוט"], created_at:"2024-06-01" },
  { id:4, name:"מערכת שיווק שותפים", type:"רווח", stage:"תכנון", description:"אוטומציה מלאה לניהול שיווק שותפים (= affiliate marketing)", tags:["שיווק","אוטומציה"], created_at:"2024-08-01" },
];
const DEF_TASKS = [
  { id:1, project_id:3, title:"בניית מודל בדיקת מחירים", description:"סקריפט שסורק מחירים ב-3 בורסות", col:"בתהליך", priority:"גבוהה", due_date:"2025-03-01", tags:["קוד","קריפטו"] },
  { id:2, project_id:3, title:"חיבור לממשק API של Binance", description:"API = ממשק תקשורת עם הבורסה", col:"לביצוע", priority:"דחוף", due_date:"2025-02-15", tags:["api","binance"] },
  { id:3, project_id:4, title:"מחקר פלטפורמות שותפים", description:"לבדוק: Clickbank, Commission Junction", col:"הושלם", priority:"בינונית", due_date:"2025-01-20", tags:["מחקר","שיווק"] },
  { id:4, project_id:4, title:"תכנון זרימת עבודה אוטומטית", description:"זרימת עבודה (= workflow) — סדר הפעולות האוטומטיות", col:"לביצוע", priority:"גבוהה", due_date:"2025-03-10", tags:["תכנון","אוטומציה"] },
];
const DEF_PROMPTS = [
  { id:1, title:"ארכיטקטורת מערכת מאפס", category:"קוד ופיתוח", prompt:"אני רוצה לבנות [תיאור המערכת]. תכנן לי ארכיטקטורה (= מבנה טכני) מלאה: אילו טכנולוגיות להשתמש, איך המודולים מתחברים, מה סדר הפיתוח, ואיפה הסיכונים הגדולים.", tags:["ארכיטקטורה","תכנון"], uses:12, rating:5 },
  { id:2, title:"ניתוח מתחרים לרעיון עסקי", category:"מחקר וניתוח", prompt:"אני חושב לבנות [תיאור הרעיון]. תנתח לי: מי המתחרים הקיימים, מה החסרונות שלהם, מה ה-USP (= יתרון ייחודי) שיכול להיות לי, ומה גודל השוק המשוער.", tags:["מחקר","שוק"], uses:8, rating:5 },
  { id:3, title:"המרת קוד Python לאוטומציה", category:"אוטומציה", prompt:"יש לי קוד ב-Python (= שפת תכנות). המר אותו ל-n8n workflow (= זרימת עבודה אוטומטית) וסביר לי מה כל שלב עושה בעברית פשוטה.", tags:["python","n8n","אוטומציה"], uses:5, rating:4 },
  { id:4, title:"כתיבת תיאור שיווקי לפרויקט", category:"שיווק ומכירות", prompt:"הפרויקט שלי: [תיאור]. כתוב תיאור שיווקי קצר לדף נחיתה (= Landing Page), שמדגיש ערך ללקוח ומניע לפעולה. שפה — עברית פשוטה וישירה.", tags:["שיווק","copywriting"], uses:15, rating:5 },
  { id:5, title:"שאלות ביטחון לבוט קריפטו", category:"קוד ופיתוח", prompt:"אני בונה בוט (= תוכנה אוטומטית) לארביטרז קריפטו. שאל אותי 10 שאלות קריטיות על: ניהול סיכונים, מגבלות API, עמלות, וחוקיות — כדי שלא אבנה משהו שיפסיד כסף.", tags:["קריפטו","ביטחון","סיכונים"], uses:3, rating:5 },
];
const DEF_KNOWLEDGE = [
  { id:1, type:"לקח", title:"חשיבות MVP מהיר", content:"MVP (= מוצר מינימלי להדגמה) — עדיף לבנות פשוט ולבדוק מהר מאשר לבנות מושלם ולגלות שאין ביקוש", project:"כללי", tags:["mvp","אסטרטגיה"], date:"2024-05-01" },
  { id:2, type:"הצלחה", title:"שימוש ב-Claude לארכיטקטורה", content:"תכנון ארכיטקטורה (= מבנה המערכת) עם AI מראש חסך המון זמן פיתוח", project:"כללי", tags:["ai","ארכיטקטורה"], date:"2024-07-01" },
  { id:3, type:"שגיאה", title:"לא לדלג על בדיקות", content:"דילוג על unit tests (= בדיקות קוד אוטומטיות) גרם לבאגים קריטיים ב-production (= הסביבה האמיתית)", project:"ארביטרז קריפטו", tags:["testing","קריפטו"], date:"2024-09-01" },
];
const DEF_IDEAS = [
  { id:1, title:"בוט לניהול אינסטגרם בAI", description:"אוטומציה של תוכן, תגובות וצמיחה אורגנית", potential:"גבוה", tags:["אוטומציה","סושיאל"], status:"חדש", date:"2024-10-01" },
  { id:2, title:"SaaS לניתוח נדל\"ן עם AI", description:"SaaS (= תוכנה כשירות ענן) שמנתח עסקאות נדל\"ן ומחשב ROI (= תשואה על ההשקעה)", potential:"בינוני", tags:["נדלן","saas"], status:"חדש", date:"2024-10-15" },
];
const DEF_TOOLS = [
  { id:1, name:"Replit", category:"פיתוח וקוד", logo:"🔷", description:"פיתוח, הרצה ו-deploy (= העלאה לאוויר) בדפדפן. מצוין לפרוטוטייפינג (= אב-טיפוס) מהיר.", use_cases:["פרוטוטייפינג","Full-stack apps","אוטומציה"], strengths:["Deploy מהיר","סוכן AI מובנה","שיתוף קל"], weaknesses:["עלות גבוהה לפרויקטים גדולים"], pricing:"חינמי / 25$ לחודש", url:"https://replit.com", my_rating:9, status:"פעיל", tags:["ide","deploy","agent"] },
  { id:2, name:"Lovable", category:"פיתוח וקוד", logo:"❤️", description:"בניית אפליקציות Full-stack (= צד לקוח + שרת) עם AI.", use_cases:["SaaS apps","MVP מהיר","דאשבורדים"], strengths:["מהיר מאוד","קוד ניתן לייצוא","ממשק יפה"], weaknesses:["מוגבל ללוגיקה מורכבת"], pricing:"חינמי / 20$ לחודש", url:"https://lovable.dev", my_rating:8, status:"פעיל", tags:["no-code","fullstack","mvp"] },
  { id:3, name:"Claude", category:"שפה וכתיבה", logo:"⬡", description:"המודל המועדף לארכיטקטורה, קוד מורכב וניתוח.", use_cases:["ארכיטקטורה","קוד מורכב","ניתוח"], strengths:["הטוב ביותר לקוד","חלון הקשר ארוך"], weaknesses:["מחיר API גבוה לנפח גדול"], pricing:"חינמי / 20$ לחודש", url:"https://claude.ai", my_rating:10, status:"פעיל", tags:["llm","code","analysis"] },
  { id:4, name:"n8n", category:"אוטומציה", logo:"🔄", description:"אוטומציה open-source (= קוד פתוח) שניתן לאחסן בעצמך.", use_cases:["אוטומציה מורכבת","בוטי קריפטו","שיווק שותפים"], strengths:["Self-hosted = חינמי","גמיש מאוד","אינטגרציות AI"], weaknesses:["דורש ידע שרתים"], pricing:"חינמי self-hosted / 20$ לחודש", url:"https://n8n.io", my_rating:9, status:"פעיל", tags:["automation","self-hosted"] },
  { id:5, name:"Make", category:"אוטומציה", logo:"⚙️", description:"פלטפורמת אוטומציה ויזואלית — חיבור בין מאות שירותים.", use_cases:["אוטומציה עסקית","שיווק שותפים","התראות"], strengths:["ויזואלי וקל","אינטגרציות רבות"], weaknesses:["לא מתאים ל-real-time כבד"], pricing:"חינמי / 9$+ לחודש", url:"https://make.com", my_rating:8, status:"פעיל", tags:["automation","no-code"] },
  { id:6, name:"Cursor", category:"פיתוח וקוד", logo:"⌨️", description:"סביבת פיתוח (= IDE) מבוססת VSCode עם AI מובנה.", use_cases:["פיתוח רציני","שיפור קוד קיים","debugging"], strengths:["הכי טוב לפיתוח מורכב","הקשר מלא על קוד"], weaknesses:["לא לפרוטוטייפינג מהיר"], pricing:"20$ לחודש", url:"https://cursor.sh", my_rating:9, status:"פעיל", tags:["ide","vscode","agent"] },
];

const SYSTEM = `אתה סוכן ה-AI האישי של יזם ישראלי שבונה פרויקטים מבוססי AI לרווח ולשימוש אישי.
חוקים: ענה תמיד בעברית. כשאתה משתמש במונח טכני — הסבר אותו בסוגריים. היה קצר, ישיר, מעשי. חשוב מנקודת מבט יזמית: ROI (= תשואה), זמן לשוק, אוטומציה.`;

// ============================================================
// רכיב ראשי
// ============================================================
export default function App() {
  const [tab, setTab] = useState("🏠 מרכז פיקוד");
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [knowledge, setKnowledge] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [tools, setTools] = useState([]);
  const [msgs, setMsgs] = useState([{ role:"assistant", content:"שלום! אני הסוכן שלך 🚀\nכל הנתונים מסונכרנים לענן — גישה מכל מכשיר.\nמה נעשה היום?" }]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("מסונכרן ✓");
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [marketIdea, setMarketIdea] = useState("");
  const [marketResult, setMarketResult] = useState(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [weeklyResult, setWeeklyResult] = useState(null);
  const [activeProject, setActiveProject] = useState(3);
  const [promptCat, setPromptCat] = useState("כל הקטגוריות");
  const [promptSearch, setPromptSearch] = useState("");
  const [toolCat, setToolCat] = useState("הכל");
  const [copied, setCopied] = useState(null);
  const [showTool, setShowTool] = useState(null);
  const [m_proj, setM_proj] = useState(false);
  const [m_task, setM_task] = useState(false);
  const [m_prompt, setM_prompt] = useState(false);
  const [m_know, setM_know] = useState(false);
  const [m_idea, setM_idea] = useState(false);
  const [m_tool, setM_tool] = useState(false);
  const [f_proj, setF_proj] = useState({ name:"", type:"רווח", stage:"רעיון", description:"", tags:"" });
  const [f_task, setF_task] = useState({ title:"", description:"", col:"לביצוע", priority:"בינונית", due_date:"", tags:"" });
  const [f_prompt, setF_prompt] = useState({ title:"", category:"קוד ופיתוח", prompt:"", tags:"" });
  const [f_know, setF_know] = useState({ type:"לקח", title:"", content:"", project:"כללי", tags:"" });
  const [f_idea, setF_idea] = useState({ title:"", description:"", potential:"גבוה", tags:"" });
  const [f_tool, setF_tool] = useState({ name:"", category:"פיתוח וקוד", logo:"🔧", description:"", use_cases:"", strengths:"", weaknesses:"", pricing:"", url:"", my_rating:7, status:"פעיל", tags:"" });
  const chatEnd = useRef(null);

  // ============================================================
  // טעינה ראשונית מ-Supabase
  // ============================================================
  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [p, t, pr, k, i, to, m] = await Promise.all([
        sb.from("agent_projects").select("*"),
        sb.from("agent_tasks").select("*"),
        sb.from("agent_prompts").select("*"),
        sb.from("agent_knowledge").select("*"),
        sb.from("agent_ideas").select("*"),
        sb.from("agent_tools").select("*"),
        sb.from("agent_messages").select("*").order("created_at", { ascending:true }).limit(60),
      ]);

      // אם הטבלה ריקה — טען נתוני ברירת מחדל
      if (!p.error && p.data?.length > 0) setProjects(p.data);
      else if (!p.error) { await seedTable("agent_projects", DEF_PROJECTS); setProjects(DEF_PROJECTS); }

      if (!t.error && t.data?.length > 0) setTasks(t.data);
      else if (!t.error) { await seedTable("agent_tasks", DEF_TASKS); setTasks(DEF_TASKS); }

      if (!pr.error && pr.data?.length > 0) setPrompts(pr.data);
      else if (!pr.error) { await seedTable("agent_prompts", DEF_PROMPTS); setPrompts(DEF_PROMPTS); }

      if (!k.error && k.data?.length > 0) setKnowledge(k.data);
      else if (!k.error) { await seedTable("agent_knowledge", DEF_KNOWLEDGE); setKnowledge(DEF_KNOWLEDGE); }

      if (!i.error && i.data?.length > 0) setIdeas(i.data);
      else if (!i.error) { await seedTable("agent_ideas", DEF_IDEAS); setIdeas(DEF_IDEAS); }

      if (!to.error && to.data?.length > 0) setTools(to.data);
      else if (!to.error) { await seedTable("agent_tools", DEF_TOOLS); setTools(DEF_TOOLS); }

      if (!m.error && m.data?.length > 0) setMsgs(m.data.map(x => ({ role:x.role, content:x.content })));

      setSyncStatus("מסונכרן ✓");
    } catch(e) {
      setSyncStatus("שגיאת חיבור ✗");
    }
    setLoading(false);
  };

  const seedTable = async (table, data) => {
    await sb.from(table).insert(data);
  };

  // ============================================================
  // פעולות שמירה ל-Supabase
  // ============================================================
  const setSyncing = () => setSyncStatus("שומר...");
  const setDone = () => setSyncStatus("מסונכרן ✓");

  const addProject = async () => {
    setSyncing();
    const p = { ...f_proj, id:Date.now(), tags:f_proj.tags.split(",").map(t=>t.trim()).filter(Boolean), created_at:new Date().toISOString().split("T")[0] };
    await sb.from("agent_projects").insert(p);
    setProjects(prev => [...prev, p]); setDone();
    setF_proj({ name:"", type:"רווח", stage:"רעיון", description:"", tags:"" }); setM_proj(false);
  };

  const updateProjectStage = async (id, stage) => {
    setSyncing();
    await sb.from("agent_projects").update({ stage }).eq("id", id);
    setProjects(prev => prev.map(p => p.id===id ? {...p, stage} : p)); setDone();
  };

  const addTask = async () => {
    setSyncing();
    const t = { ...f_task, id:Date.now(), project_id:activeProject, tags:f_task.tags.split(",").map(x=>x.trim()).filter(Boolean) };
    await sb.from("agent_tasks").insert(t);
    setTasks(prev => [...prev, t]); setDone();
    setF_task({ title:"", description:"", col:"לביצוע", priority:"בינונית", due_date:"", tags:"" }); setM_task(false);
  };

  const moveTask = async (id, col) => {
    setSyncing();
    await sb.from("agent_tasks").update({ col }).eq("id", id);
    setTasks(prev => prev.map(t => t.id===id ? {...t, col} : t)); setDone();
  };

  const addPrompt = async () => {
    setSyncing();
    const p = { ...f_prompt, id:Date.now(), tags:f_prompt.tags.split(",").map(t=>t.trim()).filter(Boolean), uses:0, rating:5 };
    await sb.from("agent_prompts").insert(p);
    setPrompts(prev => [...prev, p]); setDone();
    setF_prompt({ title:"", category:"קוד ופיתוח", prompt:"", tags:"" }); setM_prompt(false);
  };

  const copyPrompt = async (id, text) => {
    navigator.clipboard.writeText(text).catch(() => {});
    await sb.from("agent_prompts").update({ uses: (prompts.find(p=>p.id===id)?.uses||0)+1 }).eq("id", id);
    setPrompts(prev => prev.map(p => p.id===id ? {...p, uses:p.uses+1} : p));
    setCopied(id); setTimeout(() => setCopied(null), 2000);
  };

  const ratePrompt = async (id, rating) => {
    await sb.from("agent_prompts").update({ rating }).eq("id", id);
    setPrompts(prev => prev.map(p => p.id===id ? {...p, rating} : p));
  };

  const addKnowledge = async () => {
    setSyncing();
    const k = { ...f_know, id:Date.now(), tags:f_know.tags.split(",").map(t=>t.trim()).filter(Boolean), date:new Date().toISOString().split("T")[0] };
    await sb.from("agent_knowledge").insert(k);
    setKnowledge(prev => [...prev, k]); setDone();
    setF_know({ type:"לקח", title:"", content:"", project:"כללי", tags:"" }); setM_know(false);
  };

  const addIdea = async () => {
    setSyncing();
    const i = { ...f_idea, id:Date.now(), tags:f_idea.tags.split(",").map(t=>t.trim()).filter(Boolean), status:"חדש", date:new Date().toISOString().split("T")[0] };
    await sb.from("agent_ideas").insert(i);
    setIdeas(prev => [...prev, i]); setDone();
    setF_idea({ title:"", description:"", potential:"גבוה", tags:"" }); setM_idea(false);
  };

  const addTool = async () => {
    setSyncing();
    const t = { ...f_tool, id:Date.now(), my_rating:Number(f_tool.my_rating), use_cases:f_tool.use_cases.split(",").map(x=>x.trim()).filter(Boolean), strengths:f_tool.strengths.split(",").map(x=>x.trim()).filter(Boolean), weaknesses:f_tool.weaknesses.split(",").map(x=>x.trim()).filter(Boolean), tags:f_tool.tags.split(",").map(x=>x.trim()).filter(Boolean) };
    await sb.from("agent_tools").insert(t);
    setTools(prev => [...prev, t]); setDone();
    setF_tool({ name:"", category:"פיתוח וקוד", logo:"🔧", description:"", use_cases:"", strengths:"", weaknesses:"", pricing:"", url:"", my_rating:7, status:"פעיל", tags:"" }); setM_tool(false);
  };

  const del = async (table, id, setter, arr) => {
    setSyncing();
    await sb.from(table).delete().eq("id", id);
    setter(arr.filter(x => x.id !== id)); setDone();
  };

  // ============================================================
  // AI — סיכום שבועי
  // ============================================================
  const buildCtx = () => {
    const ps = projects.map(p => `${p.name} (${p.type}, שלב: ${p.stage})`).join(" | ");
    const ts = tasks.filter(t => t.col !== "הושלם").map(t => `${t.title} [${t.priority}] - ${projects.find(p=>p.id===t.project_id)?.name||"?"}`).join("\n");
    const ks = knowledge.slice(-5).map(k => `[${k.type}] ${k.title}`).join(" | ");
    return `פרויקטים: ${ps}\nמשימות פתוחות:\n${ts}\nלקחים: ${ks}`;
  };

  const getWeekly = async () => {
    setWeeklyLoading(true); setWeeklyResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1500, system:SYSTEM, messages:[{ role:"user", content:`סיכום שבועי:\n${buildCtx()}\n\nפורמט:\n1. מה הושג\n2. מה תקוע\n3. 3 צעדים לשבוע הבא\n4. התראה קריטית אם יש\n\nקצר, ישיר, מעשי. כל מונח אנגלי — תרגם בסוגריים.` }] })
      });
      const d = await res.json();
      setWeeklyResult(d.content?.[0]?.text || "שגיאה");
    } catch(e) { setWeeklyResult("שגיאה בחיבור."); }
    setWeeklyLoading(false);
  };

  // ============================================================
  // AI — מחקר שוק
  // ============================================================
  const doMarket = async () => {
    if (!marketIdea.trim()) return;
    setMarketLoading(true); setMarketResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:2000, system:SYSTEM, tools:[{ type:"web_search_20250305", name:"web_search" }], messages:[{ role:"user", content:`מחקר שוק לרעיון: "${marketIdea}"\n1. גודל שוק והזדמנות\n2. 3-5 מתחרים וחסרונותיהם\n3. USP אפשרי\n4. סיכונים\n5. המלצה: לבנות / לא / לשנות\nכל מונח אנגלי — תרגם. קצר וישיר.` }] })
      });
      const d = await res.json();
      setMarketResult((d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n") || "לא נמצא מידע");
    } catch(e) { setMarketResult("שגיאה בחיבור."); }
    setMarketLoading(false);
  };

  // ============================================================
  // AI — סוכן צ'אט + שמירת היסטוריה ל-Supabase
  // ============================================================
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role:"user", content:chatInput };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs); setChatInput(""); setChatLoading(true);
    await sb.from("agent_messages").insert({ role:"user", content:chatInput });
    try {
      const needsSearch = /חדש|עדכני|חידוש|2025|אחרון|latest|חפש/i.test(chatInput);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1500, system:SYSTEM+"\n\n"+buildCtx(), messages:newMsgs.slice(-20).map(m=>({role:m.role,content:m.content})), ...(needsSearch && { tools:[{ type:"web_search_20250305", name:"web_search" }] }) })
      });
      const d = await res.json();
      const reply = (d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n") || "שגיאה";
      await sb.from("agent_messages").insert({ role:"assistant", content:reply });
      setMsgs([...newMsgs, { role:"assistant", content:reply }]);
    } catch(e) { setMsgs([...newMsgs, { role:"assistant", content:"שגיאה בחיבור." }]); }
    setChatLoading(false);
  };

  // ============================================================
  // עזרים
  // ============================================================
  const rc = r => r>=9?"#4ade80":r>=7?"#fbbf24":"#f87171";
  const activeProjTasks = tasks.filter(t => t.project_id === activeProject);
  const filteredPrompts = prompts.filter(p => (promptCat==="כל הקטגוריות"||p.category===promptCat) && (promptSearch===""||p.title?.includes(promptSearch)||p.prompt?.includes(promptSearch)));
  const filteredTools = tools.filter(t => toolCat==="הכל"||t.category===toolCat);
  const stats = { projects:projects.length, active:projects.filter(p=>!["הושלם","מושהה"].includes(p.stage)).length, openTasks:tasks.filter(t=>t.col!=="הושלם").length, tools:tools.length };

  // ============================================================
  // CSS
  // ============================================================
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    ::-webkit-scrollbar{width:5px;height:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#2d3748;border-radius:3px;}
    .tab{background:none;border:none;cursor:pointer;padding:11px 14px;color:#475569;font-family:'Assistant',sans-serif;font-size:13px;font-weight:500;transition:all .2s;border-bottom:2px solid transparent;white-space:nowrap;}
    .tab.on{color:#818cf8;border-bottom-color:#818cf8;}.tab:hover:not(.on){color:#94a3b8;}
    .card{background:#0f1623;border:1px solid #1e2d45;border-radius:12px;padding:16px;transition:all .2s;}.card:hover{border-color:#2d4a6e;}
    .btn{border:none;cursor:pointer;border-radius:8px;font-family:'Assistant',sans-serif;font-weight:600;transition:all .2s;}
    .btn-p{background:#4f46e5;color:#fff;padding:9px 18px;font-size:13px;}.btn-p:hover{background:#6366f1;transform:translateY(-1px);}
    .btn-s{padding:5px 12px;font-size:12px;background:#1e293b;color:#94a3b8;}.btn-s:hover{background:#2d3748;color:#e2e8f0;}
    .btn-d{background:#450a0a;color:#fca5a5;padding:5px 12px;font-size:12px;}.btn-d:hover{background:#7f1d1d;}
    .btn-g{background:transparent;border:1px solid #2d3748;color:#94a3b8;padding:8px 14px;font-size:13px;}.btn-g:hover{border-color:#4f46e5;color:#818cf8;}
    .inp{background:#1a2235;border:1px solid #2d3748;color:#e2e8f0;border-radius:8px;padding:9px 12px;font-family:'Assistant',sans-serif;font-size:14px;width:100%;transition:border-color .2s;}
    .inp:focus{outline:none;border-color:#6366f1;}
    .sel{background:#1a2235;border:1px solid #2d3748;color:#e2e8f0;border-radius:8px;padding:8px 12px;font-family:'Assistant',sans-serif;font-size:13px;cursor:pointer;}
    .sel:focus{outline:none;border-color:#6366f1;}
    .tag{display:inline-block;background:#1e2a45;color:#93c5fd;padding:2px 8px;border-radius:4px;font-size:11px;margin:2px;}
    .sbadge{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;}
    .ov{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;}
    .modal{background:#0f1623;border:1px solid #2d3748;border-radius:16px;padding:24px;width:520px;max-width:100%;max-height:85vh;overflow-y:auto;}
    textarea.inp{min-height:75px;resize:vertical;}
    .kcard{background:#0d1525;border:1px solid #1e2d45;border-radius:10px;padding:12px;margin-bottom:8px;transition:all .2s;}.kcard:hover{border-color:#4f46e5;}
    .cmsg{max-width:82%;padding:12px 16px;border-radius:12px;font-size:13.5px;line-height:1.65;margin-bottom:6px;white-space:pre-wrap;word-break:break-word;}
    .chat-u{background:#1e2a50;margin-right:auto;border-bottom-right-radius:4px;color:#bfdbfe;}
    .chat-a{background:#0f1623;border:1px solid #1e293b;margin-left:auto;border-bottom-left-radius:4px;}
    .qp{background:#0f1623;border:1px solid #1e293b;border-radius:8px;padding:8px 12px;font-size:12px;color:#64748b;cursor:pointer;transition:all .2s;font-family:'Assistant',sans-serif;white-space:nowrap;}
    .qp:hover{border-color:#4f46e5;color:#a5b4fc;}
    .pstar{cursor:pointer;font-size:15px;transition:transform .1s;}.pstar:hover{transform:scale(1.2);}
    @keyframes pulse{0%,100%{opacity:.4;}50%{opacity:1;}}
    @keyframes spin{to{transform:rotate(360deg);}}
  `;

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#070c14", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12, fontFamily:"Assistant,sans-serif", direction:"rtl" }}>
      <style>{css}</style>
      <div style={{ width:40, height:40, border:"3px solid #1e293b", borderTop:"3px solid #6366f1", borderRadius:"50%", animation:"spin 1s linear infinite" }} />
      <div style={{ color:"#475569", fontSize:"14px" }}>מתחבר ל-Supabase (= מסד הנתונים בענן)...</div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#070c14", color:"#e2e8f0", fontFamily:"'Assistant',sans-serif", direction:"rtl" }}>
      <style>{css}</style>

      {/* כותרת */}
      <div style={{ borderBottom:"1px solid #1a2540", padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"#070c14", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:"linear-gradient(135deg,#4f46e5,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>⬡</div>
          <div>
            <h1 style={{ fontSize:"15px", fontWeight:700, color:"#c7d2fe", fontFamily:"'IBM Plex Mono',monospace" }}>סוכן AI לניהול פרויקטים</h1>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background: syncStatus.includes("✓") ? "#22c55e" : syncStatus.includes("שומר") ? "#f59e0b" : "#ef4444" }} />
              <p style={{ fontSize:"10px", color:"#374151" }}>{syncStatus} — ענן Supabase</p>
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {[["projects","פרויקטים","#818cf8"],["active","פעילים","#34d399"],["openTasks","משימות פתוחות","#f59e0b"],["tools","כלים","#06b6d4"]].map(([k,l,c]) => (
            <div key={k} style={{ textAlign:"center", padding:"5px 12px", background:"#0f1623", borderRadius:8, border:"1px solid #1e2d45" }}>
              <div style={{ fontSize:"16px", fontWeight:700, color:c }}>{stats[k]}</div>
              <div style={{ fontSize:"9px", color:"#475569" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* טאבים */}
      <div style={{ borderBottom:"1px solid #1a2540", paddingRight:8, display:"flex", overflowX:"auto", background:"#070c14" }}>
        {TABS.map(t => <button key={t} className={`tab ${tab===t?"on":""}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      <div style={{ padding:"18px 20px", maxWidth:1120, margin:"0 auto" }}>

        {/* ========== מרכז פיקוד ========== */}
        {tab === "🏠 מרכז פיקוד" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              <div className="card" style={{ borderTop:"2px solid #6366f1" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div>
                    <h3 style={{ fontSize:"14px", fontWeight:700, color:"#a5b4fc" }}>📊 סיכום שבועי חכם</h3>
                    <p style={{ fontSize:"11px", color:"#475569", marginTop:2 }}>AI מנתח פרויקטים ומציע צעדים הבאים</p>
                  </div>
                  <button className="btn btn-p" onClick={getWeekly} disabled={weeklyLoading} style={{ fontSize:"12px", padding:"7px 14px" }}>{weeklyLoading ? "מנתח..." : "✨ צור סיכום"}</button>
                </div>
                {weeklyLoading && <div style={{ color:"#475569", fontSize:"13px", animation:"pulse 1s infinite" }}>מנתח פרויקטים ומשימות...</div>}
                {weeklyResult && <div style={{ fontSize:"13px", lineHeight:1.7, color:"#cbd5e1", whiteSpace:"pre-wrap", background:"#0a1020", padding:12, borderRadius:8, border:"1px solid #1e293b" }}>{weeklyResult}</div>}
                {!weeklyResult && !weeklyLoading && <div style={{ fontSize:"12px", color:"#374151" }}>לחץ לקבלת ניתוח מלא</div>}
              </div>
              <div className="card" style={{ borderTop:"2px solid #ef4444" }}>
                <h3 style={{ fontSize:"14px", fontWeight:700, color:"#fca5a5", marginBottom:10 }}>🔥 משימות דחופות</h3>
                {tasks.filter(t => t.priority==="דחוף" && t.col!=="הושלם").slice(0,4).map(t => (
                  <div key={t.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #1e293b" }}>
                    <div>
                      <div style={{ fontSize:"13px", fontWeight:600 }}>{t.title}</div>
                      <div style={{ fontSize:"11px", color:"#475569" }}>{projects.find(p=>p.id===t.project_id)?.name} · {t.due_date}</div>
                    </div>
                    <button className="btn btn-s" style={{ fontSize:"11px" }} onClick={() => moveTask(t.id, "הושלם")}>✓ בוצע</button>
                  </div>
                ))}
                {tasks.filter(t => t.priority==="דחוף" && t.col!=="הושלם").length===0 && <div style={{ color:"#22c55e", fontSize:"13px" }}>אין משימות דחופות ✓</div>}
              </div>
            </div>
            <div className="card" style={{ marginBottom:14 }}>
              <h3 style={{ fontSize:"14px", fontWeight:700, color:"#a5b4fc", marginBottom:10 }}>⚡ פרויקטים פעילים</h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:8 }}>
                {projects.filter(p => !["הושלם","מושהה"].includes(p.stage)).map(p => (
                  <div key={p.id} style={{ padding:12, background:"#0d1525", borderRadius:10, borderRight:`3px solid ${STAGE_COL[p.stage]}`, cursor:"pointer" }} onClick={() => setTab("📋 פרויקטים")}>
                    <div style={{ fontSize:"13px", fontWeight:700, marginBottom:4 }}>{p.name}</div>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontSize:"11px", color:STAGE_COL[p.stage], fontWeight:700 }}>{p.stage}</span>
                      <span style={{ fontSize:"11px", color:"#475569" }}>{tasks.filter(t=>t.project_id===p.id&&t.col!=="הושלם").length} משימות</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 style={{ fontSize:"14px", fontWeight:700, color:"#a5b4fc", marginBottom:10 }}>🏆 כלי AI מובילים</h3>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {[...tools].sort((a,b)=>b.my_rating-a.my_rating).slice(0,5).map(t => (
                  <div key={t.id} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", background:"#0d1525", borderRadius:8, border:`1px solid ${rc(t.my_rating)}30` }}>
                    <span>{t.logo}</span><span style={{ fontSize:"13px", fontWeight:600 }}>{t.name}</span>
                    <span style={{ fontSize:"12px", color:rc(t.my_rating), fontWeight:700 }}>{t.my_rating}/10</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== פרויקטים ========== */}
        {tab === "📋 פרויקטים" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
              <div style={{ fontSize:"12px", color:"#475569", background:"#0f1623", padding:"8px 12px", borderRadius:8, border:"1px solid #1e2d45" }}>💡 שלבים: רעיון → תכנון → פיתוח → בדיקות → השקה → צמיחה</div>
              <button className="btn btn-p" onClick={() => setM_proj(true)}>+ פרויקט חדש</button>
            </div>
            <div style={{ display:"flex", gap:6, marginBottom:14, overflowX:"auto", paddingBottom:4 }}>
              {STAGES.map(s => { const n=projects.filter(p=>p.stage===s).length; return (
                <div key={s} style={{ flex:"0 0 auto", textAlign:"center", padding:"8px 12px", borderRadius:8, background:n>0?`${STAGE_COL[s]}18`:"#0f1623", border:`1px solid ${n>0?STAGE_COL[s]+"40":"#1e2d45"}`, minWidth:76 }}>
                  <div style={{ fontSize:"18px", fontWeight:700, color:n>0?STAGE_COL[s]:"#374151" }}>{n}</div>
                  <div style={{ fontSize:"10px", color:"#475569" }}>{s}</div>
                </div>
              ); })}
            </div>
            {projects.map(p => (
              <div key={p.id} className="card" style={{ borderRight:`3px solid ${STAGE_COL[p.stage]}`, marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                      <h3 style={{ fontSize:"15px", fontWeight:700 }}>{p.name}</h3>
                      <span style={{ padding:"2px 8px", borderRadius:4, fontSize:"11px", background:p.type==="רווח"?"#3d1d00":"#0c2a3e", color:p.type==="רווח"?"#fbbf24":"#60a5fa" }}>{p.type}</span>
                    </div>
                    <p style={{ fontSize:"12px", color:"#64748b", marginBottom:7 }}>{p.description}</p>
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap", alignItems:"center" }}>
                      {p.tags?.map(t=><span key={t} className="tag">{t}</span>)}
                      <span style={{ fontSize:"11px", color:"#374151", marginRight:6 }}>{p.created_at}</span>
                      <span style={{ fontSize:"11px", color:"#475569" }}>{tasks.filter(t=>t.project_id===p.id&&t.col!=="הושלם").length} משימות פתוחות</span>
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"flex-end", marginRight:12, flexShrink:0 }}>
                    <span className="sbadge" style={{ background:`${STAGE_COL[p.stage]}1a`, color:STAGE_COL[p.stage], border:`1px solid ${STAGE_COL[p.stage]}35` }}>{p.stage}</span>
                    <select className="sel" style={{ fontSize:"11px", padding:"3px 6px" }} value={p.stage} onChange={e => updateProjectStage(p.id, e.target.value)}>{STAGES.map(s=><option key={s}>{s}</option>)}</select>
                    <button className="btn btn-s" onClick={() => { setActiveProject(p.id); setTab("✅ משימות"); }}>📋 משימות</button>
                    <button className="btn btn-d" onClick={() => del("agent_projects", p.id, setProjects, projects)}>מחק</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========== קאנבן ========== */}
        {tab === "✅ משימות" && (
          <div>
            <div style={{ fontSize:"12px", color:"#475569", background:"#0f1623", padding:"8px 12px", borderRadius:8, border:"1px solid #1e2d45", marginBottom:12 }}>
              💡 <b>קאנבן (Kanban)</b> = לוח חזותי לניהול משימות. לחץ חצים להזזת משימה בין עמודות.
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                <span style={{ fontSize:"12px", color:"#64748b" }}>פרויקט:</span>
                <select className="sel" value={activeProject} onChange={e => setActiveProject(Number(e.target.value))}>
                  {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <button className="btn btn-p" onClick={() => setM_task(true)}>+ משימה חדשה</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
              {KANBAN_COLS.map(col => (
                <div key={col}>
                  <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 10px", background:`${KANBAN_COL_COLOR[col]}15`, borderRadius:"10px 10px 0 0", border:`1px solid ${KANBAN_COL_COLOR[col]}30`, borderBottom:"none" }}>
                    <span style={{ fontSize:"13px", fontWeight:700, color:KANBAN_COL_COLOR[col] }}>{col}</span>
                    <span style={{ fontSize:"11px", color:"#475569", background:"#1e293b", padding:"2px 8px", borderRadius:10 }}>{activeProjTasks.filter(t=>t.col===col).length}</span>
                  </div>
                  <div style={{ minHeight:200, background:"#0a1020", border:`1px solid ${KANBAN_COL_COLOR[col]}30`, borderTop:"none", borderRadius:"0 0 10px 10px", padding:8 }}>
                    {activeProjTasks.filter(t=>t.col===col).map(task => (
                      <div key={task.id} className="kcard">
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                          <span style={{ fontSize:"13px", fontWeight:600, flex:1 }}>{task.title}</span>
                          <span style={{ fontSize:"10px", padding:"2px 6px", borderRadius:4, background:`${PRIORITY_COL[task.priority]}20`, color:PRIORITY_COL[task.priority], marginRight:4, flexShrink:0 }}>{task.priority}</span>
                        </div>
                        {task.description && <p style={{ fontSize:"11px", color:"#475569", marginBottom:6, lineHeight:1.4 }}>{task.description}</p>}
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                          <div>{task.tags?.slice(0,2).map(t=><span key={t} className="tag">{t}</span>)}</div>
                          {task.due_date && <span style={{ fontSize:"10px", color:"#374151" }}>⏰ {task.due_date}</span>}
                        </div>
                        <div style={{ display:"flex", gap:4 }}>
                          {KANBAN_COLS.filter(c=>c!==col).map(c=>(
                            <button key={c} className="btn btn-s" style={{ fontSize:"10px", flex:1, padding:"3px 4px" }} onClick={() => moveTask(task.id, c)}>→ {c}</button>
                          ))}
                          <button className="btn btn-d" style={{ fontSize:"10px", padding:"3px 6px" }} onClick={() => del("agent_tasks", task.id, setTasks, tasks)}>✕</button>
                        </div>
                      </div>
                    ))}
                    {activeProjTasks.filter(t=>t.col===col).length===0 && <div style={{ textAlign:"center", padding:20, color:"#374131", fontSize:"12px" }}>ריק</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== כלי AI ========== */}
        {tab === "🤖 כלי AI" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
              <select className="sel" value={toolCat} onChange={e => setToolCat(e.target.value)}>{TOOL_CATS.map(c=><option key={c}>{c}</option>)}</select>
              <button className="btn btn-p" onClick={() => setM_tool(true)}>+ כלי חדש</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:10 }}>
              {filteredTools.map(tool => (
                <div key={tool.id} style={{ background:"#0f1623", border:"1px solid #1e2d45", borderRadius:12, padding:14, cursor:"pointer", transition:"all .25s" }}
                  onClick={() => setShowTool(tool)} onMouseEnter={e=>e.currentTarget.style.borderColor="#4f46e5"} onMouseLeave={e=>e.currentTarget.style.borderColor="#1e2d45"}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:22 }}>{tool.logo}</span>
                      <div><div style={{ fontWeight:700, fontSize:"14px" }}>{tool.name}</div><div style={{ fontSize:"11px", color:"#475569" }}>{tool.category}</div></div>
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:"17px", fontWeight:700, color:rc(tool.my_rating) }}>{tool.my_rating}/10</div>
                      <div style={{ fontSize:"10px", color:tool.status==="פעיל"?"#4ade80":"#a78bfa" }}>{tool.status}</div>
                    </div>
                  </div>
                  <p style={{ fontSize:"12px", color:"#64748b", lineHeight:1.5, marginBottom:8, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{tool.description}</p>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <div>{tool.tags?.slice(0,3).map(t=><span key={t} className="tag">{t}</span>)}</div>
                    <span style={{ fontSize:"11px", color:"#374151" }}>{tool.pricing}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== פרומפטים ========== */}
        {tab === "💡 פרומפטים" && (
          <div>
            <div style={{ fontSize:"12px", color:"#475569", background:"#0f1623", padding:"8px 12px", borderRadius:8, border:"1px solid #1e2d45", marginBottom:12 }}>
              💡 <b>פרומפט (Prompt)</b> = הוראה לAI. שמור כאן את ההוראות הטובות לשימוש חוזר.
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14, gap:8, flexWrap:"wrap" }}>
              <div style={{ display:"flex", gap:8, flex:1 }}>
                <input className="inp" style={{ maxWidth:220 }} placeholder="חפש פרומפט..." value={promptSearch} onChange={e => setPromptSearch(e.target.value)} />
                <select className="sel" value={promptCat} onChange={e => setPromptCat(e.target.value)}>{PROMPT_CATS.map(c=><option key={c}>{c}</option>)}</select>
              </div>
              <button className="btn btn-p" onClick={() => setM_prompt(true)}>+ פרומפט חדש</button>
            </div>
            {filteredPrompts.map(p => (
              <div key={p.id} className="card" style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6 }}>
                      <h3 style={{ fontSize:"14px", fontWeight:700 }}>{p.title}</h3>
                      <span style={{ fontSize:"11px", background:"#1a1a3e", color:"#a78bfa", padding:"2px 8px", borderRadius:4 }}>{p.category}</span>
                    </div>
                    <div style={{ fontSize:"12px", color:"#64748b", background:"#0a1020", padding:"10px 12px", borderRadius:8, border:"1px solid #1e293b", fontFamily:"monospace", lineHeight:1.6, maxHeight:80, overflow:"hidden", marginBottom:8 }}>
                      {p.prompt?.substring(0,180)}{p.prompt?.length>180?"...":""}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      <div style={{ display:"flex", gap:2 }}>
                        {[1,2,3,4,5].map(n=><span key={n} className="pstar" onClick={() => ratePrompt(p.id, n)} style={{ color:n<=p.rating?"#fbbf24":"#1e293b" }}>★</span>)}
                      </div>
                      <span style={{ fontSize:"11px", color:"#475569" }}>שימושים: {p.uses}</span>
                      {p.tags?.map(t=><span key={t} className="tag">{t}</span>)}
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6, marginRight:12, flexShrink:0 }}>
                    <button className="btn btn-p" style={{ fontSize:"12px", padding:"6px 14px", background:copied===p.id?"#052e16":"#4f46e5", color:copied===p.id?"#4ade80":"white" }} onClick={() => copyPrompt(p.id, p.prompt)}>
                      {copied===p.id?"✓ הועתק!":"📋 העתק"}
                    </button>
                    <button className="btn btn-d" onClick={() => del("agent_prompts", p.id, setPrompts, prompts)}>מחק</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========== מחקר שוק ========== */}
        {tab === "🔍 מחקר שוק" && (
          <div>
            <div style={{ fontSize:"12px", color:"#475569", background:"#0f1623", padding:"8px 12px", borderRadius:8, border:"1px solid #1e2d45", marginBottom:14 }}>
              💡 <b>מחקר שוק (Market Research)</b> = ניתוח השוק לפני שבונים. הסוכן גולש באינטרנט ומנתח: מתחרים, גודל שוק, סיכונים, המלצה.
            </div>
            <div className="card" style={{ marginBottom:14 }}>
              <h3 style={{ fontSize:"14px", fontWeight:700, color:"#a5b4fc", marginBottom:10 }}>🔍 ניתוח רעיון עסקי</h3>
              <div style={{ display:"flex", gap:8 }}>
                <input className="inp" placeholder="תאר את הרעיון שלך..." value={marketIdea} onChange={e => setMarketIdea(e.target.value)} onKeyDown={e => e.key==="Enter" && doMarket()} />
                <button className="btn btn-p" onClick={doMarket} disabled={marketLoading||!marketIdea.trim()} style={{ flexShrink:0 }}>{marketLoading?"מחקר...":"🔍 נתח"}</button>
              </div>
              <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap" }}>
                {["ארביטרז קריפטו אוטומטי","פלטפורמת שיווק שותפים AI","בוט ניהול סושיאל מדיה"].map(s=>(
                  <button key={s} className="qp" onClick={() => setMarketIdea(s)}>{s}</button>
                ))}
              </div>
            </div>
            {marketLoading && <div className="card" style={{ textAlign:"center", padding:24 }}>
              <div style={{ fontSize:"14px", color:"#818cf8", animation:"pulse 1s infinite", marginBottom:8 }}>🔍 גולש באינטרנט ומנתח שוק...</div>
            </div>}
            {marketResult && !marketLoading && (
              <div className="card" style={{ borderTop:"2px solid #6366f1" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                  <h3 style={{ fontSize:"14px", fontWeight:700, color:"#a5b4fc" }}>📊 תוצאות: {marketIdea}</h3>
                  <button className="btn btn-s" onClick={() => setMarketResult(null)}>✕</button>
                </div>
                <div style={{ fontSize:"13px", lineHeight:1.8, color:"#cbd5e1", whiteSpace:"pre-wrap", background:"#0a1020", padding:14, borderRadius:8, border:"1px solid #1e293b" }}>{marketResult}</div>
              </div>
            )}
            <div style={{ marginTop:14 }}>
              <h3 style={{ fontSize:"13px", color:"#64748b", marginBottom:8 }}>רעיונות שמחכים למחקר:</h3>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {ideas.map(i=>(
                  <button key={i.id} className="btn btn-g" style={{ fontSize:"12px" }} onClick={() => setMarketIdea(i.title)}>
                    {i.title} <span style={{ color:i.potential==="גבוה"?"#4ade80":i.potential==="בינוני"?"#fbbf24":"#f87171", marginRight:4 }}>●</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== ידע ולקחים ========== */}
        {tab === "📚 ידע ולקחים" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
              <span style={{ fontSize:"12px", color:"#475569" }}>💡 <b>מאגר ידע (Knowledge Base)</b> = לקחים, הצלחות, שגיאות — לא לחזור עליהן</span>
              <button className="btn btn-p" onClick={() => setM_know(true)}>+ הוסף ידע</button>
            </div>
            {knowledge.map(k=>(
              <div key={k.id} className="card" style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:7 }}>
                      <span className="sbadge" style={{ background:k.type==="הצלחה"?"#052e16":k.type==="שגיאה"?"#2d0505":k.type==="לקח"?"#1e3050":"#1a1a3e", color:k.type==="הצלחה"?"#4ade80":k.type==="שגיאה"?"#f87171":k.type==="לקח"?"#93c5fd":"#a78bfa" }}>{k.type}</span>
                      <h3 style={{ fontSize:"14px", fontWeight:700 }}>{k.title}</h3>
                    </div>
                    <p style={{ fontSize:"13px", color:"#64748b", marginBottom:8, lineHeight:1.6 }}>{k.content}</p>
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                      <span style={{ fontSize:"11px", background:"#1e293b", padding:"2px 8px", borderRadius:4, color:"#475569" }}>פרויקט: {k.project}</span>
                      {k.tags?.map(t=><span key={t} className="tag">{t}</span>)}
                      <span style={{ fontSize:"11px", color:"#374151" }}>{k.date}</span>
                    </div>
                  </div>
                  <button className="btn btn-d" style={{ marginRight:12 }} onClick={() => del("agent_knowledge", k.id, setKnowledge, knowledge)}>מחק</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========== רעיונות ========== */}
        {tab === "💭 רעיונות" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
              <span style={{ fontSize:"12px", color:"#475569" }}>💡 <b>בנק רעיונות</b> — שמור, דרג, שלח למחקר שוק</span>
              <button className="btn btn-p" onClick={() => setM_idea(true)}>+ רעיון</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:10 }}>
              {ideas.map(i=>(
                <div key={i.id} className="card">
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                    <h3 style={{ fontSize:"14px", fontWeight:700 }}>{i.title}</h3>
                    <button className="btn btn-d" onClick={() => del("agent_ideas", i.id, setIdeas, ideas)}>✕</button>
                  </div>
                  <p style={{ fontSize:"12px", color:"#64748b", marginBottom:10, lineHeight:1.5 }}>{i.description}</p>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div>{i.tags?.map(t=><span key={t} className="tag">{t}</span>)}</div>
                    <span style={{ fontSize:"12px", fontWeight:700, color:i.potential==="גבוה"?"#4ade80":i.potential==="בינוני"?"#fbbf24":"#f87171" }}>● {i.potential}</span>
                  </div>
                  <button className="btn btn-g" style={{ width:"100%", fontSize:"12px" }} onClick={() => { setMarketIdea(i.title); setTab("🔍 מחקר שוק"); }}>🔍 שלח למחקר שוק</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== סוכן AI ========== */}
        {tab === "🧠 סוכן AI" && (
          <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 220px)", minHeight:420 }}>
            <div style={{ marginBottom:10, padding:"9px 13px", background:"#0d1525", borderRadius:8, border:"1px solid #1e2d45", fontSize:"12px", color:"#475569", display:"flex", justifyContent:"space-between" }}>
              <span>🤖 הסוכן מכיר את כל הנתונים. היסטוריית שיחה שמורה בענן.</span>
              <span style={{ color:"#1e3a5f" }}>חידושים = חיפוש אוטומטי באינטרנט</span>
            </div>
            <div style={{ display:"flex", gap:5, marginBottom:10, overflowX:"auto", paddingBottom:4 }}>
              {["מה הצעד הבא בפרויקט ארביטרז?","השווה Replit מול Lovable לבניית SaaS","חידושים בכלי AI לאוטומציה?","workflow (= זרימת עבודה) לשיווק שותפים?","3 סיכונים בפרויקט הקריפטו שלי"].map((qp,i)=>(
                <button key={i} className="qp" onClick={() => setChatInput(qp)}>{qp}</button>
              ))}
            </div>
            <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:4, marginBottom:12, padding:"2px" }}>
              {msgs.map((m,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-start":"flex-end" }}>
                  <div className={`cmsg ${m.role==="user"?"chat-u":"chat-a"}`}>{m.content}</div>
                </div>
              ))}
              {chatLoading && <div style={{ display:"flex", justifyContent:"flex-end" }}><div className="cmsg chat-a" style={{ color:"#374131", animation:"pulse 1s infinite" }}>הסוכן חושב...</div></div>}
              <div ref={chatEnd} />
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <input className="inp" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key==="Enter" && !e.shiftKey && sendChat()} placeholder="שאל את הסוכן... (Enter = שלח)" />
              <button className="btn btn-p" onClick={sendChat} disabled={chatLoading} style={{ flexShrink:0, padding:"9px 22px" }}>שלח</button>
            </div>
          </div>
        )}

      </div>

      {/* ========== מודלים ========== */}
      {m_proj && <div className="ov" onClick={()=>setM_proj(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h3 style={{ marginBottom:14, color:"#a5b4fc" }}>פרויקט חדש</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <input className="inp" placeholder="שם הפרויקט" value={f_proj.name} onChange={e=>setF_proj({...f_proj,name:e.target.value})} />
          <textarea className="inp" placeholder="תיאור" value={f_proj.description} onChange={e=>setF_proj({...f_proj,description:e.target.value})} />
          <div style={{ display:"flex", gap:8 }}>
            <select className="sel" style={{flex:1}} value={f_proj.type} onChange={e=>setF_proj({...f_proj,type:e.target.value})}>{TYPES.map(t=><option key={t}>{t}</option>)}</select>
            <select className="sel" style={{flex:1}} value={f_proj.stage} onChange={e=>setF_proj({...f_proj,stage:e.target.value})}>{STAGES.map(s=><option key={s}>{s}</option>)}</select>
          </div>
          <input className="inp" placeholder="תגיות (מופרדות בפסיק)" value={f_proj.tags} onChange={e=>setF_proj({...f_proj,tags:e.target.value})} />
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button className="btn btn-s" onClick={()=>setM_proj(false)}>ביטול</button>
            <button className="btn btn-p" onClick={addProject}>הוסף</button>
          </div>
        </div>
      </div></div>}

      {m_task && <div className="ov" onClick={()=>setM_task(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h3 style={{ marginBottom:14, color:"#a5b4fc" }}>משימה חדשה</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <select className="sel" value={activeProject} onChange={e=>setActiveProject(Number(e.target.value))}>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
          <input className="inp" placeholder="שם המשימה" value={f_task.title} onChange={e=>setF_task({...f_task,title:e.target.value})} />
          <textarea className="inp" placeholder="תיאור (אופציונלי)" value={f_task.description} onChange={e=>setF_task({...f_task,description:e.target.value})} />
          <div style={{ display:"flex", gap:8 }}>
            <select className="sel" style={{flex:1}} value={f_task.col} onChange={e=>setF_task({...f_task,col:e.target.value})}>{KANBAN_COLS.map(c=><option key={c}>{c}</option>)}</select>
            <select className="sel" style={{flex:1}} value={f_task.priority} onChange={e=>setF_task({...f_task,priority:e.target.value})}>{PRIORITY.map(p=><option key={p}>{p}</option>)}</select>
          </div>
          <input className="inp" type="date" value={f_task.due_date} onChange={e=>setF_task({...f_task,due_date:e.target.value})} />
          <input className="inp" placeholder="תגיות" value={f_task.tags} onChange={e=>setF_task({...f_task,tags:e.target.value})} />
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button className="btn btn-s" onClick={()=>setM_task(false)}>ביטול</button>
            <button className="btn btn-p" onClick={addTask}>הוסף</button>
          </div>
        </div>
      </div></div>}

      {m_prompt && <div className="ov" onClick={()=>setM_prompt(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h3 style={{ marginBottom:14, color:"#a5b4fc" }}>פרומפט חדש</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <input className="inp" placeholder="שם הפרומפט" value={f_prompt.title} onChange={e=>setF_prompt({...f_prompt,title:e.target.value})} />
          <select className="sel" value={f_prompt.category} onChange={e=>setF_prompt({...f_prompt,category:e.target.value})}>{PROMPT_CATS.slice(1).map(c=><option key={c}>{c}</option>)}</select>
          <textarea className="inp" style={{ minHeight:120 }} placeholder="כתוב את הפרומפט — השתמש ב-[סוגריים מרובעים] לחלקים שמשתנים" value={f_prompt.prompt} onChange={e=>setF_prompt({...f_prompt,prompt:e.target.value})} />
          <input className="inp" placeholder="תגיות" value={f_prompt.tags} onChange={e=>setF_prompt({...f_prompt,tags:e.target.value})} />
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button className="btn btn-s" onClick={()=>setM_prompt(false)}>ביטול</button>
            <button className="btn btn-p" onClick={addPrompt}>שמור פרומפט</button>
          </div>
        </div>
      </div></div>}

      {m_know && <div className="ov" onClick={()=>setM_know(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h3 style={{ marginBottom:14, color:"#a5b4fc" }}>הוסף ידע / לקח</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <select className="sel" value={f_know.type} onChange={e=>setF_know({...f_know,type:e.target.value})}>
            {["לקח","הצלחה","שגיאה","ידע טכני","אסטרטגיה"].map(t=><option key={t}>{t}</option>)}
          </select>
          <input className="inp" placeholder="כותרת" value={f_know.title} onChange={e=>setF_know({...f_know,title:e.target.value})} />
          <textarea className="inp" placeholder="מה למדת? מה קרה ומה תעשה אחרת?" value={f_know.content} onChange={e=>setF_know({...f_know,content:e.target.value})} />
          <input className="inp" placeholder="פרויקט קשור" value={f_know.project} onChange={e=>setF_know({...f_know,project:e.target.value})} />
          <input className="inp" placeholder="תגיות" value={f_know.tags} onChange={e=>setF_know({...f_know,tags:e.target.value})} />
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button className="btn btn-s" onClick={()=>setM_know(false)}>ביטול</button>
            <button className="btn btn-p" onClick={addKnowledge}>הוסף</button>
          </div>
        </div>
      </div></div>}

      {m_idea && <div className="ov" onClick={()=>setM_idea(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h3 style={{ marginBottom:14, color:"#a5b4fc" }}>רעיון חדש</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <input className="inp" placeholder="שם הרעיון" value={f_idea.title} onChange={e=>setF_idea({...f_idea,title:e.target.value})} />
          <textarea className="inp" placeholder="תיאור — מה הרעיון, מי קהל היעד, איך מרוויחים" value={f_idea.description} onChange={e=>setF_idea({...f_idea,description:e.target.value})} />
          <select className="sel" value={f_idea.potential} onChange={e=>setF_idea({...f_idea,potential:e.target.value})}>
            {["גבוה","בינוני","נמוך"].map(p=><option key={p}>{p}</option>)}
          </select>
          <input className="inp" placeholder="תגיות" value={f_idea.tags} onChange={e=>setF_idea({...f_idea,tags:e.target.value})} />
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button className="btn btn-s" onClick={()=>setM_idea(false)}>ביטול</button>
            <button className="btn btn-p" onClick={addIdea}>הוסף</button>
          </div>
        </div>
      </div></div>}

      {m_tool && <div className="ov" onClick={()=>setM_tool(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h3 style={{ marginBottom:14, color:"#a5b4fc" }}>כלי AI חדש</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ display:"flex", gap:8 }}>
            <input className="inp" style={{width:55}} placeholder="🔧" value={f_tool.logo} onChange={e=>setF_tool({...f_tool,logo:e.target.value})} />
            <input className="inp" placeholder="שם הכלי" value={f_tool.name} onChange={e=>setF_tool({...f_tool,name:e.target.value})} />
          </div>
          <select className="sel" value={f_tool.category} onChange={e=>setF_tool({...f_tool,category:e.target.value})}>{TOOL_CATS.slice(1).map(c=><option key={c}>{c}</option>)}</select>
          <textarea className="inp" placeholder="תיאור" value={f_tool.description} onChange={e=>setF_tool({...f_tool,description:e.target.value})} />
          <input className="inp" placeholder="שימושים (מופרד בפסיק)" value={f_tool.use_cases} onChange={e=>setF_tool({...f_tool,use_cases:e.target.value})} />
          <input className="inp" placeholder="חוזקות (מופרד בפסיק)" value={f_tool.strengths} onChange={e=>setF_tool({...f_tool,strengths:e.target.value})} />
          <input className="inp" placeholder="חסרונות (מופרד בפסיק)" value={f_tool.weaknesses} onChange={e=>setF_tool({...f_tool,weaknesses:e.target.value})} />
          <div style={{ display:"flex", gap:8 }}>
            <input className="inp" placeholder="מחיר" value={f_tool.pricing} onChange={e=>setF_tool({...f_tool,pricing:e.target.value})} />
            <input className="inp" style={{width:80}} type="number" min="1" max="10" placeholder="ציון" value={f_tool.my_rating} onChange={e=>setF_tool({...f_tool,my_rating:e.target.value})} />
          </div>
          <input className="inp" placeholder="כתובת אתר" value={f_tool.url} onChange={e=>setF_tool({...f_tool,url:e.target.value})} />
          <input className="inp" placeholder="תגיות" value={f_tool.tags} onChange={e=>setF_tool({...f_tool,tags:e.target.value})} />
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button className="btn btn-s" onClick={()=>setM_tool(false)}>ביטול</button>
            <button className="btn btn-p" onClick={addTool}>הוסף</button>
          </div>
        </div>
      </div></div>}

      {showTool && <div className="ov" onClick={()=>setShowTool(null)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <span style={{ fontSize:30 }}>{showTool.logo}</span>
            <div><h2 style={{ fontSize:"18px", fontWeight:700 }}>{showTool.name}</h2><span style={{ fontSize:"12px", color:"#64748b" }}>{showTool.category}</span></div>
          </div>
          <button className="btn btn-s" onClick={()=>setShowTool(null)}>✕</button>
        </div>
        <p style={{ fontSize:"13px", color:"#94a3b8", marginBottom:14, lineHeight:1.65 }}>{showTool.description}</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
          <div><div style={{ fontSize:"12px", color:"#4ade80", marginBottom:5, fontWeight:700 }}>✓ חוזקות</div>{showTool.strengths?.map(s=><div key={s} style={{ fontSize:"12px", color:"#64748b", padding:"2px 0" }}>• {s}</div>)}</div>
          <div><div style={{ fontSize:"12px", color:"#f87171", marginBottom:5, fontWeight:700 }}>✗ חסרונות</div>{showTool.weaknesses?.map(w=><div key={w} style={{ fontSize:"12px", color:"#64748b", padding:"2px 0" }}>• {w}</div>)}</div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", paddingTop:10, borderTop:"1px solid #1e293b", alignItems:"center" }}>
          <span style={{ fontSize:"13px", color:"#475569" }}>💰 {showTool.pricing}</span>
          <div style={{ display:"flex", gap:8 }}>
            {showTool.url && <a href={showTool.url} target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}><button className="btn btn-g" style={{ fontSize:"12px" }}>🔗 לאתר</button></a>}
            <button className="btn btn-d" onClick={() => { del("agent_tools", showTool.id, setTools, tools); setShowTool(null); }}>מחק</button>
          </div>
        </div>
      </div></div>}

    </div>
  );
}
