import { useState, useEffect, useRef } from "react";

// ============================================================
// קבועים ראשיים
// ============================================================
const TABS = ["🏠 מרכז פיקוד", "📋 פרויקטים", "✅ משימות", "🤖 כלי AI", "💡 פרומפטים", "🔍 מחקר שוק", "📚 ידע ולקחים", "💭 רעיונות", "🧠 סוכן AI"];

const STAGES = ["רעיון","תכנון","פיתוח","בדיקות","השקה","צמיחה","הושלם","מושהה"];
const TYPES = ["רווח","אישי/משפחתי"];
const STAGE_COL = { "רעיון":"#6366f1","תכנון":"#8b5cf6","פיתוח":"#f59e0b","בדיקות":"#ef4444","השקה":"#10b981","צמיחה":"#06b6d4","הושלם":"#22c55e","מושהה":"#6b7280" };

const KANBAN_COLS = ["לביצוע","בתהליך","הושלם"];
const KANBAN_COL_COLOR = { "לביצוע":"#6366f1","בתהליך":"#f59e0b","הושלם":"#22c55e" };
const PRIORITY = ["נמוכה","בינונית","גבוהה","דחוף"];
const PRIORITY_COL = { "נמוכה":"#64748b","בינונית":"#f59e0b","גבוהה":"#f97316","דחוף":"#ef4444" };

const PROMPT_CATS = ["כל הקטגוריות","קוד ופיתוח","עיצוב ו-UI","שיווק ומכירות","מחקר וניתוח","אוטומציה","אסטרטגיה","כללי"];

const TOOL_CATS = ["הכל","פיתוח וקוד","עיצוב וממשק","אוטומציה","שפה וכתיבה","תמונות ומדיה","ניתוח ודאטה","שיווק","אחר"];

// ============================================================
// נתוני התחלה
// ============================================================
const DEF_PROJECTS = [
  { id:1, name:"אפליקציה משפחתית לימוד AI", type:"אישי/משפחתי", stage:"הושלם", description:"אפליקציה ללמד את המשפחה על בינה מלאכותית", tags:["ai","חינוך"], createdAt:"2024-01-01" },
  { id:2, name:"אפליקציה לימוד נדל\"ן", type:"אישי/משפחתי", stage:"הושלם", description:"למידה ואוטומציה בתחום הנדל\"ן", tags:["נדלן","למידה"], createdAt:"2024-03-01" },
  { id:3, name:"ארביטרז קריפטו", type:"רווח", stage:"פיתוח", description:"מערכת אוטומטית לארביטרז (= ניצול הפרשי מחירים) בשווקי קריפטו", tags:["קריפטו","אוטומציה","בוט"], createdAt:"2024-06-01" },
  { id:4, name:"מערכת שיווק שותפים", type:"רווח", stage:"תכנון", description:"אוטומציה מלאה לניהול שיווק שותפים (= affiliate marketing)", tags:["שיווק","אוטומציה"], createdAt:"2024-08-01" },
];

const DEF_TASKS = [
  { id:1, projectId:3, title:"בניית מודל בדיקת מחירים", description:"סקריפט (= קוד קטן) שסורק מחירים ב-3 בורסות", col:"בתהליך", priority:"גבוהה", dueDate:"2025-03-01", tags:["קוד","קריפטו"] },
  { id:2, projectId:3, title:"חיבור לממשק API של Binance", description:"API = ממשק תקשורת עם הבורסה", col:"לביצוע", priority:"דחוף", dueDate:"2025-02-15", tags:["api","binance"] },
  { id:3, projectId:4, title:"מחקר פלטפורמות שותפים", description:"לבדוק: Clickbank, Commission Junction, דיגיטלי", col:"הושלם", priority:"בינונית", dueDate:"2025-01-20", tags:["מחקר","שיווק"] },
  { id:4, projectId:4, title:"תכנון זרימת עבודה אוטומטית", description:"זרימת עבודה (= workflow) — סדר הפעולות האוטומטיות", col:"לביצוע", priority:"גבוהה", dueDate:"2025-03-10", tags:["תכנון","אוטומציה"] },
];

const DEF_PROMPTS = [
  { id:1, title:"ארכיטקטורת מערכת מאפס", category:"קוד ופיתוח", prompt:"אני רוצה לבנות [תיאור המערכת]. תכנן לי ארכיטקטורה (= מבנה טכני) מלאה: אילו טכנולוגיות להשתמש, איך המודולים (= חלקי הקוד) מתחברים, מה סדר הפיתוח, ואיפה הסיכונים הגדולים.", tags:["ארכיטקטורה","תכנון"], uses:12, rating:5 },
  { id:2, title:"ניתוח מתחרים לרעיון עסקי", category:"מחקר וניתוח", prompt:"אני חושב לבנות [תיאור הרעיון]. תנתח לי: מי המתחרים הקיימים, מה החסרונות שלהם, מה ה-USP (= יתרון ייחודי) שיכול להיות לי, ומה גודל השוק המשוער.", tags:["מחקר","שוק"], uses:8, rating:5 },
  { id:3, title:"המרת קוד Python לאוטומציה", category:"אוטומציה", prompt:"יש לי את הקוד הבא ב-Python (= שפת תכנות). המר אותו ל-n8n workflow (= זרימת עבודה אוטומטית) עם nodes (= תחנות) ברורות, וסביר לי מה כל שלב עושה בעברית פשוטה.", tags:["python","n8n","אוטומציה"], uses:5, rating:4 },
  { id:4, title:"כתיבת תיאור שיווקי לפרויקט", category:"שיווק ומכירות", prompt:"הפרויקט שלי: [תיאור]. כתוב לי תיאור שיווקי קצר (5 משפטים) לדף נחיתה (= Landing Page), שמדגיש את הערך ללקוח ומניע לפעולה. שפה — עברית פשוטה וישירה.", tags:["שיווק","copywriting"], uses:15, rating:5 },
  { id:5, title:"פיתוח בוט קריפטו — שאלות ביטחון", category:"קוד ופיתוח", prompt:"אני בונה בוט (= תוכנה אוטומטית) לארביטרז קריפטו. לפני שמתחיל לקודד, שאל אותי 10 שאלות קריטיות על: ניהול סיכונים, מגבלות API (= ממשק תקשורת), עמלות, וחוקיות — כדי שלא אבנה משהו שיפסיד כסף.", tags:["קריפטו","ביטחון","סיכונים"], uses:3, rating:5 },
];

const DEF_KNOWLEDGE = [
  { id:1, type:"לקח", title:"חשיבות MVP מהיר", content:"MVP (= מוצר מינימלי להדגמה) — עדיף לבנות גרסה פשוטה ולבדוק מהר מאשר לבנות מושלם ולגלות שאין ביקוש", project:"כללי", tags:["mvp","אסטרטגיה"], date:"2024-05-01" },
  { id:2, type:"הצלחה", title:"שימוש ב-Claude לארכיטקטורה", content:"שימוש ב-AI לתכנון ארכיטקטורה (= מבנה המערכת) מראש חסך המון זמן פיתוח ומניעת שגיאות", project:"כללי", tags:["ai","ארכיטקטורה"], date:"2024-07-01" },
  { id:3, type:"שגיאה", title:"לא לדלג על בדיקות", content:"בפרויקט ארביטרז — דילוג על unit tests (= בדיקות יחידה לקוד) גרם לבאגים קריטיים ב-production (= הסביבה האמיתית)", project:"ארביטרז קריפטו", tags:["testing","קריפטו"], date:"2024-09-01" },
];

const DEF_IDEAS = [
  { id:1, title:"בוט לניהול אינסטגרם בAI", description:"אוטומציה של תוכן, תגובות וצמיחה אורגנית", potential:"גבוה", tags:["אוטומציה","סושיאל"], status:"חדש", date:"2024-10-01" },
  { id:2, title:"SaaS לניתוח נדל\"ן עם AI", description:"SaaS (= תוכנה כשירות ענן) שמנתח עסקאות נדל\"ן ומחשב ROI (= תשואה על ההשקעה)", potential:"בינוני", tags:["נדלן","saas"], status:"חדש", date:"2024-10-15" },
];

const DEF_TOOLS = [
  { id:1, name:"Replit", category:"פיתוח וקוד", logo:"🔷", description:"פיתוח, הרצה ו-deploy (= העלאה לאוויר) של אפליקציות ישירות בדפדפן. מצוין לפרוטוטייפינג (= בניית אב-טיפוס) מהיר עם סוכן AI מובנה.", useCases:["פרוטוטייפינג","Full-stack apps","אוטומציה","בוטים"], strengths:["Deploy מהיר","סוכן AI מובנה","שיתוף קל","סביבת עבודה מלאה"], weaknesses:["עלות גבוהה לפרויקטים גדולים","לא מתאים ל-production כבד"], pricing:"חינמי / 25$ לחודש", url:"https://replit.com", myRating:9, status:"פעיל", tags:["ide","deploy","agent"] },
  { id:2, name:"Lovable", category:"פיתוח וקוד", logo:"❤️", description:"בניית אפליקציות Full-stack (= צד לקוח + שרת) עם AI על ידי תיאור בשפה טבעית.", useCases:["SaaS apps","דאשבורדים","MVP מהיר","אפליקציות לקוח"], strengths:["מהיר מאוד","קוד ניתן לייצוא","חיבור ל-Supabase","ממשק יפה"], weaknesses:["פחות שליטה על ארכיטקטורה","מוגבל ללוגיקה מורכבת"], pricing:"חינמי / 20$ לחודש", url:"https://lovable.dev", myRating:8, status:"פעיל", tags:["no-code","fullstack","mvp"] },
  { id:3, name:"Claude (Anthropic)", category:"שפה וכתיבה", logo:"⬡", description:"המודל המועדף לארכיטקטורה, קוד מורכב, ניתוח וחשיבה. Claude Sonnet מוביל בקידוד.", useCases:["ארכיטקטורה","קוד מורכב","ניתוח פרויקטים","כתיבה טכנית"], strengths:["הטוב ביותר לקוד","חלון הקשר ארוך","הוראות מדויקות","חשיבה עמוקה"], weaknesses:["מחיר API גבוה לנפח גדול"], pricing:"חינמי / 20$ לחודש Pro", url:"https://claude.ai", myRating:10, status:"פעיל", tags:["llm","code","analysis"] },
  { id:4, name:"ChatGPT", category:"שפה וכתיבה", logo:"🤖", description:"GPT-4o עם גלישה, DALL-E ליצירת תמונות, ומתורגמן קוד. אקוסיסטם (= מערכת שלמה) עצום.", useCases:["מחקר","תוכן שיווקי","קוד","ניתוח תמונות"], strengths:["אקוסיסטם גדול","GPTs מותאמים","גלישה מובנית","DALL-E"], weaknesses:["פחות מדויק מ-Claude בקוד מורכב"], pricing:"חינמי / 20$ לחודש", url:"https://chatgpt.com", myRating:8, status:"פעיל", tags:["llm","gpt","browsing"] },
  { id:5, name:"Gemini (Google)", category:"שפה וכתיבה", logo:"♊", description:"Gemini 2.0 Flash — מהיר ועוצמתי, מחובר ל-Google Workspace (= כלי העבודה של גוגל).", useCases:["ניתוח מסמכים גדולים","Google integration","multimodal","קוד"], strengths:["חלון הקשר ענק (מיליון טוקן)","מהיר","חינמי במידה רבה"], weaknesses:["פחות עקבי בניואנסים"], pricing:"חינמי / 20$ לחודש", url:"https://gemini.google.com", myRating:7, status:"פעיל", tags:["llm","google","multimodal"] },
  { id:6, name:"Cursor", category:"פיתוח וקוד", logo:"⌨️", description:"סביבת פיתוח (= IDE) מבוססת VSCode עם AI מובנה. Composer mode לכתיבת פיצ'רים שלמים.", useCases:["פיתוח רציני","refactoring = שיפור קוד קיים","debugging","פיצ'רים גדולים"], strengths:["הכי טוב לפיתוח מורכב","הקשר מלא על קוד","מצב agent","כל שפה"], weaknesses:["דורש הגדרה ראשונית","לא לפרוטוטייפינג מהיר"], pricing:"20$ לחודש", url:"https://cursor.sh", myRating:9, status:"פעיל", tags:["ide","vscode","agent"] },
  { id:7, name:"Make (Integromat)", category:"אוטומציה", logo:"⚙️", description:"פלטפורמת אוטומציה ויזואלית — חיבור בין מאות שירותים ללא קוד.", useCases:["אוטומציה עסקית","שיווק שותפים","pipelines = צינורות נתונים","התראות"], strengths:["ויזואלי וקל","אינטגרציות רבות","מחיר סביר"], weaknesses:["לא מתאים ל-real-time כבד"], pricing:"חינמי / 9$+ לחודש", url:"https://make.com", myRating:8, status:"פעיל", tags:["automation","no-code","integration"] },
  { id:8, name:"n8n", category:"אוטומציה", logo:"🔄", description:"אוטומציה open-source (= קוד פתוח) שניתן לאחסן בעצמך. גמיש יותר מ-Make, עם nodes של AI.", useCases:["אוטומציה מורכבת","זרימות AI","self-hosted = אחסון עצמי","בוטי קריפטו"], strengths:["Self-hosted = חינמי לגמרי","גמיש מאוד","אינטגרציות AI","ללא מגבלות"], weaknesses:["דורש ידע DevOps = ניהול שרתים"], pricing:"חינמי self-hosted / 20$ לחודש ענן", url:"https://n8n.io", myRating:9, status:"פעיל", tags:["automation","self-hosted","ai-workflows"] },
  { id:9, name:"Perplexity AI", category:"ניתוח ודאטה", logo:"🔍", description:"מנוע חיפוש AI עם ציטוטים. מעולה למחקר ומידע עדכני.", useCases:["מחקר שוק","בדיקת נאותות","עדכוני AI","אימות מידע"], strengths:["מידע עדכני","ציטוטים","מהיר","Pro Search מעמיק"], weaknesses:["לא לקוד","לא ליצירה"], pricing:"חינמי / 20$ לחודש", url:"https://perplexity.ai", myRating:8, status:"פעיל", tags:["search","research","realtime"] },
  { id:10, name:"Bolt.new", category:"פיתוח וקוד", logo:"⚡", description:"פיתוח Full-stack בדפדפן עם StackBlitz. מהיר מאוד לפרוטוטייפינג, מייצא ל-GitHub.", useCases:["פרוטוטייפינג","הדגמות","React apps","MVP"], strengths:["מהיר מאוד","StackBlitz מהימן","ייצוא קל","חינמי במידה"], weaknesses:["מוגבל ל-frontend (= צד לקוח)"], pricing:"חינמי / 20$ לחודש", url:"https://bolt.new", myRating:8, status:"פעיל", tags:["prototype","react","frontend"] },
];

const SYSTEM = `אתה סוכן ה-AI האישי של יזם ישראלי שבונה פרויקטים מבוססי AI לרווח ולשימוש אישי.

חוקים:
1. תמיד ענה בעברית
2. כשאתה משתמש במונח טכני באנגלית — הסבר אותו בסוגריים בעברית
3. היה קצר, ישיר, מעשי — בלי מילים מיותרות
4. תמיד חשוב מנקודת מבט יזמית: ROI (= תשואה), זמן לשוק, אוטומציה
5. כשרלוונטי — המלץ על הכלי הנכון מתוך ארגז הכלים של המשתמש
6. לפני שאתה מציע לבנות משהו — שאל על סיכונים ו-edge cases (= מקרי קצה)

הפרויקטים הפעילים: ארביטרז קריפטו (פיתוח), שיווק שותפים (תכנון)
כלים שהמשתמש משתמש בהם: Replit, Lovable, Bolt, Claude, ChatGPT, Gemini, Cursor, Make, n8n`;

// ============================================================
// רכיב ראשי
// ============================================================
export default function App() {
  const [tab, setTab] = useState("🏠 מרכז פיקוד");
  const [projects, setProjects] = useState(DEF_PROJECTS);
  const [tasks, setTasks] = useState(DEF_TASKS);
  const [prompts, setPrompts] = useState(DEF_PROMPTS);
  const [knowledge, setKnowledge] = useState(DEF_KNOWLEDGE);
  const [ideas, setIdeas] = useState(DEF_IDEAS);
  const [tools, setTools] = useState(DEF_TOOLS);
  const [msgs, setMsgs] = useState([{ role:"assistant", content:"שלום! אני הסוכן שלך לניהול פרויקטי AI 🚀\nאני מכיר את הפרויקטים, הכלים, הלקחים, הפרומפטים (= הוראות ל-AI) והרעיונות שלך.\nאני יכול גם לחפש מידע עדכני מהאינטרנט.\nמה נעשה היום?" }]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [marketIdea, setMarketIdea] = useState("");
  const [marketResult, setMarketResult] = useState(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [weeklyResult, setWeeklyResult] = useState(null);
  const [activeProject, setActiveProject] = useState(DEF_PROJECTS[2].id);
  const [promptCat, setPromptCat] = useState("כל הקטגוריות");
  const [promptSearch, setPromptSearch] = useState("");
  const [toolCat, setToolCat] = useState("הכל");
  const [copied, setCopied] = useState(null);
  const [showTool, setShowTool] = useState(null);
  // modals
  const [m_proj, setM_proj] = useState(false);
  const [m_task, setM_task] = useState(false);
  const [m_prompt, setM_prompt] = useState(false);
  const [m_know, setM_know] = useState(false);
  const [m_idea, setM_idea] = useState(false);
  const [m_tool, setM_tool] = useState(false);
  // forms
  const [f_proj, setF_proj] = useState({ name:"", type:"רווח", stage:"רעיון", description:"", tags:"" });
  const [f_task, setF_task] = useState({ title:"", description:"", col:"לביצוע", priority:"בינונית", dueDate:"", tags:"", projectId: DEF_PROJECTS[2].id });
  const [f_prompt, setF_prompt] = useState({ title:"", category:"קוד ופיתוח", prompt:"", tags:"" });
  const [f_know, setF_know] = useState({ type:"לקח", title:"", content:"", project:"כללי", tags:"" });
  const [f_idea, setF_idea] = useState({ title:"", description:"", potential:"בינוני", tags:"" });
  const [f_tool, setF_tool] = useState({ name:"", category:"פיתוח וקוד", logo:"🔧", description:"", useCases:"", strengths:"", weaknesses:"", pricing:"", url:"", myRating:7, status:"פעיל", tags:"" });

  const chatEnd = useRef(null);

  // טעינה מזיכרון (storage = אחסון)
  useEffect(() => {
    const load = async () => {
      try {
        const keys = ["projects","tasks","prompts","knowledge","ideas","tools","msgs"];
        const sets = [setProjects,setTasks,setPrompts,setKnowledge,setIdeas,setTools,setMsgs];
        await Promise.all(keys.map(async (k, i) => {
          const r = await window.storage.get(k).catch(() => null);
          if (r?.value) sets[i](JSON.parse(r.value));
        }));
      } catch(e) {}
    };
    load();
  }, []);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const save = async (k, v) => { try { await window.storage.set(k, JSON.stringify(v)); } catch(e) {} };

  // ============================================================
  // פעולות CRUD (= יצירה, קריאה, עדכון, מחיקה)
  // ============================================================
  const addProject = () => {
    const p = { ...f_proj, id:Date.now(), tags:f_proj.tags.split(",").map(t=>t.trim()).filter(Boolean), createdAt:new Date().toISOString().split("T")[0] };
    const u = [...projects, p]; setProjects(u); save("projects", u);
    setF_proj({ name:"", type:"רווח", stage:"רעיון", description:"", tags:"" }); setM_proj(false);
  };
  const addTask = () => {
    const t = { ...f_task, id:Date.now(), tags:f_task.tags.split(",").map(x=>x.trim()).filter(Boolean) };
    const u = [...tasks, t]; setTasks(u); save("tasks", u);
    setF_task({ title:"", description:"", col:"לביצוע", priority:"בינונית", dueDate:"", tags:"", projectId: activeProject }); setM_task(false);
  };
  const addPrompt = () => {
    const p = { ...f_prompt, id:Date.now(), tags:f_prompt.tags.split(",").map(t=>t.trim()).filter(Boolean), uses:0, rating:5 };
    const u = [...prompts, p]; setPrompts(u); save("prompts", u);
    setF_prompt({ title:"", category:"קוד ופיתוח", prompt:"", tags:"" }); setM_prompt(false);
  };
  const addKnowledge = () => {
    const k = { ...f_know, id:Date.now(), tags:f_know.tags.split(",").map(t=>t.trim()).filter(Boolean), date:new Date().toISOString().split("T")[0] };
    const u = [...knowledge, k]; setKnowledge(u); save("knowledge", u);
    setF_know({ type:"לקח", title:"", content:"", project:"כללי", tags:"" }); setM_know(false);
  };
  const addIdea = () => {
    const i = { ...f_idea, id:Date.now(), tags:f_idea.tags.split(",").map(t=>t.trim()).filter(Boolean), status:"חדש", date:new Date().toISOString().split("T")[0] };
    const u = [...ideas, i]; setIdeas(u); save("ideas", u);
    setF_idea({ title:"", description:"", potential:"בינוני", tags:"" }); setM_idea(false);
  };
  const addTool = () => {
    const t = { ...f_tool, id:Date.now(), myRating:Number(f_tool.myRating), useCases:f_tool.useCases.split(",").map(x=>x.trim()).filter(Boolean), strengths:f_tool.strengths.split(",").map(x=>x.trim()).filter(Boolean), weaknesses:f_tool.weaknesses.split(",").map(x=>x.trim()).filter(Boolean), tags:f_tool.tags.split(",").map(x=>x.trim()).filter(Boolean) };
    const u = [...tools, t]; setTools(u); save("tools", u);
    setF_tool({ name:"", category:"פיתוח וקוד", logo:"🔧", description:"", useCases:"", strengths:"", weaknesses:"", pricing:"", url:"", myRating:7, status:"פעיל", tags:"" }); setM_tool(false);
  };
  const del = (type, id) => {
    const cfg = { project:[projects,setProjects,"projects"], task:[tasks,setTasks,"tasks"], prompt:[prompts,setPrompts,"prompts"], knowledge:[knowledge,setKnowledge,"knowledge"], idea:[ideas,setIdeas,"ideas"], tool:[tools,setTools,"tools"] };
    const [arr, setter, key] = cfg[type];
    const u = arr.filter(x => x.id !== id); setter(u); save(key, u);
  };
  const moveTask = (id, col) => { const u = tasks.map(t => t.id===id ? {...t, col} : t); setTasks(u); save("tasks", u); };
  const copyPrompt = (id, text) => {
    navigator.clipboard.writeText(text).catch(() => {});
    const u = prompts.map(p => p.id===id ? {...p, uses:p.uses+1} : p); setPrompts(u); save("prompts", u);
    setCopied(id); setTimeout(() => setCopied(null), 2000);
  };
  const ratePrompt = (id, r) => { const u = prompts.map(p => p.id===id ? {...p, rating:r} : p); setPrompts(u); save("prompts", u); };

  // ============================================================
  // AI — סיכום שבועי
  // ============================================================
  const buildCtx = () => {
    const ps = projects.map(p => `${p.name} (${p.type}, שלב: ${p.stage})`).join(" | ");
    const ts = tasks.filter(t => t.col !== "הושלם").map(t => `${t.title} [${t.priority}] - פרויקט ${projects.find(p=>p.id===t.projectId)?.name||"?"}`).join("\n");
    const ks = knowledge.slice(-5).map(k => `[${k.type}] ${k.title}`).join(" | ");
    return `פרויקטים: ${ps}\n\nמשימות פתוחות:\n${ts}\n\nלקחים אחרונים: ${ks}`;
  };

  const getWeekly = async () => {
    setWeeklyLoading(true); setWeeklyResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1500,
          system: SYSTEM,
          messages:[{ role:"user", content:`בצע סיכום שבועי מקצועי בעברית לפי הנתונים הבאים:\n\n${buildCtx()}\n\nפורמט: \n1. מה הושג השבוע\n2. מה תקוע ולמה\n3. 3 צעדים חשובים לשבוע הבא לפי סדר עדיפות\n4. התראה אחת קריטית אם יש\n\nכתוב בצורה ישירה, קצרה, מעשית. כל מונח באנגלית — תרגם בסוגריים.` }]
        })
      });
      const d = await res.json();
      setWeeklyResult(d.content?.[0]?.text || "שגיאה");
    } catch(e) { setWeeklyResult("שגיאה בחיבור. נסה שוב."); }
    setWeeklyLoading(false);
  };

  // ============================================================
  // AI — מחקר שוק
  // ============================================================
  const doMarketResearch = async () => {
    if (!marketIdea.trim()) return;
    setMarketLoading(true); setMarketResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:2000,
          system: SYSTEM,
          tools:[{ type:"web_search_20250305", name:"web_search" }],
          messages:[{ role:"user", content:`בצע מחקר שוק מקיף לרעיון הבא: "${marketIdea}"\n\nחפש מידע עדכני ותן לי:\n1. גודל השוק והזדמנות (עם נתונים אם אפשר)\n2. 3-5 מתחרים עיקריים קיימים ומה החסרונות שלהם\n3. USP (= יתרון ייחודי) שיכול להבדיל אותי\n4. הסיכונים הגדולים\n5. המלצה: לבנות / לא לבנות / לבנות עם שינוי\n\nכל מונח טכני באנגלית — תרגם בסוגריים. ענה בעברית קצרה וישירה.` }]
        })
      });
      const d = await res.json();
      const text = (d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n");
      setMarketResult(text || "לא נמצא מידע");
    } catch(e) { setMarketResult("שגיאה בחיבור."); }
    setMarketLoading(false);
  };

  // ============================================================
  // AI — סוכן צ'אט
  // ============================================================
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role:"user", content: chatInput };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs); setChatInput(""); setChatLoading(true);
    try {
      const needsSearch = /חדש|עדכני|חידוש|השקה|2025|אחרון|trending|latest|חפש/i.test(chatInput);
      const body = {
        model:"claude-sonnet-4-20250514", max_tokens:1500,
        system: SYSTEM + "\n\n" + buildCtx(),
        messages: newMsgs.slice(-20).map(m => ({ role:m.role, content:m.content })),
        ...(needsSearch && { tools:[{ type:"web_search_20250305", name:"web_search" }] })
      };
      const res = await fetch("https://api.anthropic.com/v1/messages", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
      const d = await res.json();
      const reply = (d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n") || "שגיאה";
      const updated = [...newMsgs, { role:"assistant", content:reply }];
      setMsgs(updated); save("msgs", updated.slice(-60));
    } catch(e) { setMsgs([...newMsgs, { role:"assistant", content:"שגיאה בחיבור. נסה שוב." }]); }
    setChatLoading(false);
  };

  // ============================================================
  // עזרים
  // ============================================================
  const rc = r => r>=9?"#4ade80":r>=7?"#fbbf24":"#f87171";
  const activeProjectTasks = tasks.filter(t => t.projectId === activeProject);
  const activeProjName = projects.find(p => p.id === activeProject)?.name || "";
  const filteredPrompts = prompts.filter(p => (promptCat === "כל הקטגוריות" || p.category === promptCat) && (promptSearch === "" || p.title.includes(promptSearch) || p.prompt.includes(promptSearch)));
  const filteredTools = tools.filter(t => toolCat === "הכל" || t.category === toolCat);
  const openTasks = tasks.filter(t => t.col !== "הושלם").length;
  const stats = { projects: projects.length, active: projects.filter(p=>!["הושלם","מושהה"].includes(p.stage)).length, openTasks, tools: tools.length };

  // ============================================================
  // CSS בסיסי
  // ============================================================
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    ::-webkit-scrollbar{width:5px;height:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#2d3748;border-radius:3px;}
    body{font-family:'Assistant',sans-serif;}
    .tab{background:none;border:none;cursor:pointer;padding:11px 16px;color:#475569;font-family:'Assistant',sans-serif;font-size:13px;font-weight:500;transition:all .2s;border-bottom:2px solid transparent;white-space:nowrap;}
    .tab.on{color:#818cf8;border-bottom-color:#818cf8;}
    .tab:hover:not(.on){color:#94a3b8;}
    .card{background:#0f1623;border:1px solid #1e2d45;border-radius:12px;padding:16px;transition:all .2s;}
    .card:hover{border-color:#2d4a6e;}
    .btn{border:none;cursor:pointer;border-radius:8px;font-family:'Assistant',sans-serif;font-weight:600;transition:all .2s;}
    .btn-p{background:#4f46e5;color:#fff;padding:9px 18px;font-size:13px;}
    .btn-p:hover{background:#6366f1;transform:translateY(-1px);}
    .btn-s{padding:5px 12px;font-size:12px;background:#1e293b;color:#94a3b8;}
    .btn-s:hover{background:#2d3748;color:#e2e8f0;}
    .btn-d{background:#450a0a;color:#fca5a5;padding:5px 12px;font-size:12px;}
    .btn-d:hover{background:#7f1d1d;}
    .btn-g{background:transparent;border:1px solid #2d3748;color:#94a3b8;padding:8px 16px;font-size:13px;}
    .btn-g:hover{border-color:#4f46e5;color:#818cf8;}
    .inp{background:#1a2235;border:1px solid #2d3748;color:#e2e8f0;border-radius:8px;padding:9px 12px;font-family:'Assistant',sans-serif;font-size:14px;width:100%;transition:border-color .2s;}
    .inp:focus{outline:none;border-color:#6366f1;background:#1e2a40;}
    .sel{background:#1a2235;border:1px solid #2d3748;color:#e2e8f0;border-radius:8px;padding:8px 12px;font-family:'Assistant',sans-serif;font-size:13px;cursor:pointer;}
    .sel:focus{outline:none;border-color:#6366f1;}
    .tag{display:inline-block;background:#1e2a45;color:#93c5fd;padding:2px 8px;border-radius:4px;font-size:11px;margin:2px;}
    .sbadge{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;}
    .ov{position:fixed;inset:0;background:rgba(0,0,0,.87);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;}
    .modal{background:#0f1623;border:1px solid #2d3748;border-radius:16px;padding:24px;width:520px;max-width:100%;max-height:85vh;overflow-y:auto;}
    textarea.inp{min-height:75px;resize:vertical;}
    .kcard{background:#0d1525;border:1px solid #1e2d45;border-radius:10px;padding:12px;margin-bottom:8px;cursor:grab;transition:all .2s;}
    .kcard:hover{border-color:#4f46e5;transform:translateY(-2px);}
    .chat-u{background:#1e2a50;margin-right:auto;border-bottom-right-radius:4px;color:#bfdbfe;}
    .chat-a{background:#0f1623;border:1px solid #1e293b;margin-left:auto;border-bottom-left-radius:4px;}
    .cmsg{max-width:82%;padding:12px 16px;border-radius:12px;font-size:13.5px;line-height:1.65;margin-bottom:6px;white-space:pre-wrap;word-break:break-word;}
    .qp{background:#0f1623;border:1px solid #1e293b;border-radius:8px;padding:8px 12px;font-size:12px;color:#64748b;cursor:pointer;transition:all .2s;text-align:right;white-space:nowrap;font-family:'Assistant',sans-serif;}
    .qp:hover{border-color:#4f46e5;color:#a5b4fc;}
    .pstar{cursor:pointer;font-size:15px;transition:transform .1s;}
    .pstar:hover{transform:scale(1.2);}
    @keyframes pulse{0%,100%{opacity:.4;}50%{opacity:1;}}
  `;

  return (
    <div style={{ minHeight:"100vh", background:"#070c14", color:"#e2e8f0", fontFamily:"'Assistant',sans-serif", direction:"rtl" }}>
      <style>{css}</style>

      {/* כותרת עליונה */}
      <div style={{ borderBottom:"1px solid #1a2540", padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"#070c14", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:"linear-gradient(135deg,#4f46e5,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>⬡</div>
          <div>
            <h1 style={{ fontSize:"15px", fontWeight:700, color:"#c7d2fe", fontFamily:"'IBM Plex Mono',monospace" }}>סוכן AI לניהול פרויקטים</h1>
            <p style={{ fontSize:"10px", color:"#374151" }}>גרסה 3.0 — מלאכותית מקצועית</p>
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
      <div style={{ borderBottom:"1px solid #1a2540", paddingRight:8, display:"flex", gap:0, overflowX:"auto", background:"#070c14" }}>
        {TABS.map(t => <button key={t} className={`tab ${tab===t?"on":""}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      <div style={{ padding:"18px 20px", maxWidth:1120, margin:"0 auto" }}>

        {/* ============ מרכז פיקוד ============ */}
        {tab === "🏠 מרכז פיקוד" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
              {/* סיכום שבועי */}
              <div className="card" style={{ borderTop:"2px solid #6366f1" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <div>
                    <h3 style={{ fontSize:"14px", fontWeight:700, color:"#a5b4fc" }}>📊 סיכום שבועי חכם</h3>
                    <p style={{ fontSize:"11px", color:"#475569", marginTop:2 }}>AI מנתח את כל הפרויקטים ומציע צעדי הבא</p>
                  </div>
                  <button className="btn btn-p" onClick={getWeekly} disabled={weeklyLoading} style={{ fontSize:"12px", padding:"7px 14px" }}>
                    {weeklyLoading ? "מנתח..." : "✨ צור סיכום"}
                  </button>
                </div>
                {weeklyLoading && <div style={{ color:"#475569", fontSize:"13px", animation:"pulse 1s infinite" }}>הסוכן מנתח את כל הפרויקטים והמשימות שלך...</div>}
                {weeklyResult && <div style={{ fontSize:"13px", lineHeight:1.7, color:"#cbd5e1", whiteSpace:"pre-wrap", background:"#0a1020", padding:12, borderRadius:8, border:"1px solid #1e293b" }}>{weeklyResult}</div>}
                {!weeklyResult && !weeklyLoading && <div style={{ fontSize:"12px", color:"#374151" }}>לחץ "צור סיכום" לקבלת ניתוח מלא על כל הפרויקטים שלך</div>}
              </div>

              {/* משימות דחופות */}
              <div className="card" style={{ borderTop:"2px solid #ef4444" }}>
                <h3 style={{ fontSize:"14px", fontWeight:700, color:"#fca5a5", marginBottom:12 }}>🔥 משימות דחופות</h3>
                {tasks.filter(t => t.priority === "דחוף" && t.col !== "הושלם").slice(0,4).map(t => (
                  <div key={t.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #1e293b" }}>
                    <div>
                      <div style={{ fontSize:"13px", fontWeight:600 }}>{t.title}</div>
                      <div style={{ fontSize:"11px", color:"#475569" }}>{projects.find(p=>p.id===t.projectId)?.name} · {t.dueDate}</div>
                    </div>
                    <button className="btn btn-s" style={{ fontSize:"11px" }} onClick={() => moveTask(t.id, "הושלם")}>✓ בוצע</button>
                  </div>
                ))}
                {tasks.filter(t => t.priority === "דחוף" && t.col !== "הושלם").length === 0 && <div style={{ color:"#22c55e", fontSize:"13px" }}>אין משימות דחופות פתוחות ✓</div>}
              </div>
            </div>

            {/* פרויקטים פעילים */}
            <div className="card" style={{ marginBottom:14 }}>
              <h3 style={{ fontSize:"14px", fontWeight:700, color:"#a5b4fc", marginBottom:12 }}>⚡ פרויקטים פעילים</h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:10 }}>
                {projects.filter(p => !["הושלם","מושהה"].includes(p.stage)).map(p => (
                  <div key={p.id} style={{ padding:"12px", background:"#0d1525", borderRadius:10, borderRight:`3px solid ${STAGE_COL[p.stage]}`, cursor:"pointer" }} onClick={() => { setTab("📋 פרויקטים"); }}>
                    <div style={{ fontSize:"13px", fontWeight:700, marginBottom:4 }}>{p.name}</div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:"11px", color:STAGE_COL[p.stage], fontWeight:700 }}>{p.stage}</span>
                      <span style={{ fontSize:"11px", color:"#475569" }}>{tasks.filter(t=>t.projectId===p.id && t.col!=="הושלם").length} משימות פתוחות</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* כלי AI מובילים */}
            <div className="card">
              <h3 style={{ fontSize:"14px", fontWeight:700, color:"#a5b4fc", marginBottom:12 }}>🏆 כלי AI מובילים שלך</h3>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {tools.sort((a,b)=>b.myRating-a.myRating).slice(0,5).map(t => (
                  <div key={t.id} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", background:"#0d1525", borderRadius:8, border:`1px solid ${rc(t.myRating)}30` }}>
                    <span>{t.logo}</span>
                    <span style={{ fontSize:"13px", fontWeight:600 }}>{t.name}</span>
                    <span style={{ fontSize:"12px", color:rc(t.myRating), fontWeight:700 }}>{t.myRating}/10</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============ פרויקטים ============ */}
        {tab === "📋 פרויקטים" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, flexWrap:"wrap", gap:8 }}>
              <div style={{ fontSize:"12px", color:"#475569", background:"#0f1623", padding:"8px 12px", borderRadius:8, border:"1px solid #1e2d45" }}>
                💡 <b>שלבי פרויקט:</b> רעיון → תכנון → פיתוח → בדיקות → השקה → צמיחה
              </div>
              <button className="btn btn-p" onClick={() => setM_proj(true)}>+ פרויקט חדש</button>
            </div>
            <div style={{ display:"flex", gap:6, marginBottom:16, overflowX:"auto", paddingBottom:4 }}>
              {STAGES.map(s => {
                const n = projects.filter(p=>p.stage===s).length;
                return (
                  <div key={s} style={{ flex:"0 0 auto", textAlign:"center", padding:"8px 14px", borderRadius:8, background:n>0?`${STAGE_COL[s]}18`:"#0f1623", border:`1px solid ${n>0?STAGE_COL[s]+"40":"#1e2d45"}`, minWidth:78 }}>
                    <div style={{ fontSize:"19px", fontWeight:700, color:n>0?STAGE_COL[s]:"#374151" }}>{n}</div>
                    <div style={{ fontSize:"10px", color:"#475569" }}>{s}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display:"grid", gap:10 }}>
              {projects.map(p => (
                <div key={p.id} className="card" style={{ borderRight:`3px solid ${STAGE_COL[p.stage]}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                        <h3 style={{ fontSize:"15px", fontWeight:700 }}>{p.name}</h3>
                        <span style={{ padding:"2px 8px", borderRadius:4, fontSize:"11px", background:p.type==="רווח"?"#3d1d00":"#0c2a3e", color:p.type==="רווח"?"#fbbf24":"#60a5fa" }}>{p.type}</span>
                      </div>
                      <p style={{ fontSize:"12px", color:"#64748b", marginBottom:7, lineHeight:1.5 }}>{p.description}</p>
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap", alignItems:"center" }}>
                        {p.tags?.map(t=><span key={t} className="tag">{t}</span>)}
                        <span style={{ fontSize:"11px", color:"#374151", marginRight:6 }}>{p.createdAt}</span>
                        <span style={{ fontSize:"11px", color:"#475569" }}>{tasks.filter(t=>t.projectId===p.id&&t.col!=="הושלם").length} משימות פתוחות</span>
                      </div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"flex-end", marginRight:12, flexShrink:0 }}>
                      <span className="sbadge" style={{ background:`${STAGE_COL[p.stage]}1a`, color:STAGE_COL[p.stage], border:`1px solid ${STAGE_COL[p.stage]}35` }}>{p.stage}</span>
                      <select className="sel" style={{ fontSize:"11px", padding:"3px 6px" }} value={p.stage} onChange={e => { const u=projects.map(x=>x.id===p.id?{...x,stage:e.target.value}:x); setProjects(u); save("projects",u); }}>
                        {STAGES.map(s=><option key={s}>{s}</option>)}
                      </select>
                      <button className="btn btn-s" onClick={() => { setActiveProject(p.id); setTab("✅ משימות"); }}>📋 משימות</button>
                      <button className="btn btn-d" onClick={() => del("project", p.id)}>מחק</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ לוח קאנבן (משימות) ============ */}
        {tab === "✅ משימות" && (
          <div>
            <div style={{ fontSize:"12px", color:"#475569", background:"#0f1623", padding:"8px 12px", borderRadius:8, border:"1px solid #1e2d45", marginBottom:12 }}>
              💡 <b>קאנבן (Kanban)</b> = לוח חזותי לניהול משימות. 3 עמודות: לביצוע → בתהליך → הושלם. גרור משימות בין עמודות.
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, flexWrap:"wrap", gap:8 }}>
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                <span style={{ fontSize:"12px", color:"#64748b" }}>פרויקט:</span>
                <select className="sel" value={activeProject} onChange={e => setActiveProject(Number(e.target.value))}>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <button className="btn btn-p" onClick={() => { setF_task({...f_task, projectId:activeProject}); setM_task(true); }}>+ משימה חדשה</button>
            </div>
            <div style={{ fontSize:"13px", color:"#64748b", marginBottom:12 }}>
              {activeProjName} — {activeProjectTasks.filter(t=>t.col!=="הושלם").length} משימות פתוחות
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
              {KANBAN_COLS.map(col => (
                <div key={col}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 10px", background:`${KANBAN_COL_COLOR[col]}15`, borderRadius:"10px 10px 0 0", border:`1px solid ${KANBAN_COL_COLOR[col]}30`, marginBottom:0, borderBottom:"none" }}>
                    <span style={{ fontSize:"13px", fontWeight:700, color:KANBAN_COL_COLOR[col] }}>{col}</span>
                    <span style={{ fontSize:"11px", color:"#475569", background:"#1e293b", padding:"2px 8px", borderRadius:10 }}>{activeProjectTasks.filter(t=>t.col===col).length}</span>
                  </div>
                  <div style={{ minHeight:200, background:"#0a1020", border:`1px solid ${KANBAN_COL_COLOR[col]}30`, borderTop:"none", borderRadius:"0 0 10px 10px", padding:8 }}>
                    {activeProjectTasks.filter(t=>t.col===col).map(task => (
                      <div key={task.id} className="kcard">
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                          <span style={{ fontSize:"13px", fontWeight:600, flex:1 }}>{task.title}</span>
                          <span style={{ fontSize:"10px", padding:"2px 6px", borderRadius:4, background:`${PRIORITY_COL[task.priority]}20`, color:PRIORITY_COL[task.priority], marginRight:4, flexShrink:0 }}>{task.priority}</span>
                        </div>
                        {task.description && <p style={{ fontSize:"11px", color:"#475569", marginBottom:7, lineHeight:1.4 }}>{task.description}</p>}
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <div style={{ display:"flex", gap:4 }}>
                            {task.tags?.slice(0,2).map(t=><span key={t} className="tag">{t}</span>)}
                          </div>
                          {task.dueDate && <span style={{ fontSize:"10px", color:"#374151" }}>⏰ {task.dueDate}</span>}
                        </div>
                        <div style={{ display:"flex", gap:4, marginTop:8 }}>
                          {KANBAN_COLS.filter(c=>c!==col).map(c => (
                            <button key={c} className="btn btn-s" style={{ fontSize:"10px", flex:1, padding:"3px 4px" }} onClick={() => moveTask(task.id, c)}>→ {c}</button>
                          ))}
                          <button className="btn btn-d" style={{ fontSize:"10px", padding:"3px 6px" }} onClick={() => del("task", task.id)}>✕</button>
                        </div>
                      </div>
                    ))}
                    {activeProjectTasks.filter(t=>t.col===col).length===0 && (
                      <div style={{ textAlign:"center", padding:20, color:"#374151", fontSize:"12px" }}>ריק</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ כלי AI ============ */}
        {tab === "🤖 כלי AI" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, flexWrap:"wrap", gap:8 }}>
              <select className="sel" value={toolCat} onChange={e => setToolCat(e.target.value)}>
                {TOOL_CATS.map(c=><option key={c}>{c}</option>)}
              </select>
              <button className="btn btn-p" onClick={() => setM_tool(true)}>+ הוסף כלי חדש</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(290px, 1fr))", gap:10 }}>
              {filteredTools.map(tool => (
                <div key={tool.id} style={{ background:"#0f1623", border:"1px solid #1e2d45", borderRadius:12, padding:14, cursor:"pointer", transition:"all .25s" }}
                  onClick={() => setShowTool(tool)}
                  onMouseEnter={e => e.currentTarget.style.borderColor="#4f46e5"}
                  onMouseLeave={e => e.currentTarget.style.borderColor="#1e2d45"}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:22 }}>{tool.logo}</span>
                      <div>
                        <div style={{ fontWeight:700, fontSize:"14px" }}>{tool.name}</div>
                        <div style={{ fontSize:"11px", color:"#475569" }}>{tool.category}</div>
                      </div>
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:"17px", fontWeight:700, color:rc(tool.myRating) }}>{tool.myRating}/10</div>
                      <div style={{ fontSize:"10px", color:tool.status==="פעיל"?"#4ade80":"#a78bfa" }}>{tool.status}</div>
                    </div>
                  </div>
                  <p style={{ fontSize:"12px", color:"#64748b", lineHeight:1.5, marginBottom:8, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{tool.description}</p>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>{tool.tags?.slice(0,3).map(t=><span key={t} className="tag">{t}</span>)}</div>
                    <span style={{ fontSize:"11px", color:"#374151" }}>{tool.pricing}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ ספריית פרומפטים ============ */}
        {tab === "💡 פרומפטים" && (
          <div>
            <div style={{ fontSize:"12px", color:"#475569", background:"#0f1623", padding:"8px 12px", borderRadius:8, border:"1px solid #1e2d45", marginBottom:12 }}>
              💡 <b>פרומפט (Prompt)</b> = הוראה שאתה נותן לAI. ספרייה זו שומרת הפרומפטים הטובים שעבדו לך — לשימוש חוזר ומהיר.
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, flexWrap:"wrap", gap:8 }}>
              <div style={{ display:"flex", gap:8, flex:1 }}>
                <input className="inp" style={{ maxWidth:220 }} placeholder="חפש פרומפט..." value={promptSearch} onChange={e => setPromptSearch(e.target.value)} />
                <select className="sel" value={promptCat} onChange={e => setPromptCat(e.target.value)}>
                  {PROMPT_CATS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <button className="btn btn-p" onClick={() => setM_prompt(true)}>+ פרומפט חדש</button>
            </div>
            <div style={{ display:"grid", gap:10 }}>
              {filteredPrompts.map(p => (
                <div key={p.id} className="card">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                        <h3 style={{ fontSize:"14px", fontWeight:700 }}>{p.title}</h3>
                        <span style={{ fontSize:"11px", background:"#1a1a3e", color:"#a78bfa", padding:"2px 8px", borderRadius:4 }}>{p.category}</span>
                      </div>
                      <div style={{ fontSize:"12px", color:"#64748b", background:"#0a1020", padding:"10px 12px", borderRadius:8, border:"1px solid #1e293b", fontFamily:"monospace", lineHeight:1.6, maxHeight:80, overflow:"hidden", marginBottom:8 }}>
                        {p.prompt.substring(0, 180)}{p.prompt.length > 180 ? "..." : ""}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                        <div style={{ display:"flex", gap:2 }}>
                          {[1,2,3,4,5].map(n => <span key={n} className="pstar" onClick={() => ratePrompt(p.id, n)} style={{ color: n<=p.rating?"#fbbf24":"#1e293b" }}>★</span>)}
                        </div>
                        <span style={{ fontSize:"11px", color:"#475569" }}>שימושים: {p.uses}</span>
                        {p.tags?.map(t=><span key={t} className="tag">{t}</span>)}
                      </div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:6, marginRight:12, flexShrink:0 }}>
                      <button className="btn btn-p" style={{ fontSize:"12px", padding:"6px 14px", background: copied===p.id ? "#052e16" : "#4f46e5", color: copied===p.id ? "#4ade80" : "white" }}
                        onClick={() => copyPrompt(p.id, p.prompt)}>
                        {copied===p.id ? "✓ הועתק!" : "📋 העתק"}
                      </button>
                      <button className="btn btn-d" onClick={() => del("prompt", p.id)}>מחק</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ מחקר שוק ============ */}
        {tab === "🔍 מחקר שוק" && (
          <div>
            <div style={{ fontSize:"12px", color:"#475569", background:"#0f1623", padding:"8px 12px", borderRadius:8, border:"1px solid #1e2d45", marginBottom:14 }}>
              💡 <b>מחקר שוק (Market Research)</b> = ניתוח השוק לפני שבונים. הסוכן מחפש באינטרנט ומנתח: מתחרים, גודל שוק, סיכונים, המלצה.
            </div>
            <div className="card" style={{ marginBottom:16 }}>
              <h3 style={{ fontSize:"14px", fontWeight:700, color:"#a5b4fc", marginBottom:10 }}>🔍 ניתוח רעיון עסקי</h3>
              <div style={{ display:"flex", gap:8 }}>
                <input className="inp" placeholder="תאר את הרעיון שלך (למשל: פלטפורמת SaaS לניהול שיווק שותפים עם AI)..." value={marketIdea} onChange={e => setMarketIdea(e.target.value)} onKeyDown={e => e.key==="Enter" && doMarketResearch()} />
                <button className="btn btn-p" onClick={doMarketResearch} disabled={marketLoading || !marketIdea.trim()} style={{ flexShrink:0 }}>
                  {marketLoading ? "מחקר..." : "🔍 נתח"}
                </button>
              </div>
              <div style={{ display:"flex", gap:6, marginTop:8 }}>
                {["ארביטרז קריפטו אוטומטי", "פלטפורמת שיווק שותפים AI", "בוט ניהול סושיאל מדיה"].map(s => (
                  <button key={s} className="qp" onClick={() => setMarketIdea(s)}>{s}</button>
                ))}
              </div>
            </div>
            {marketLoading && (
              <div className="card" style={{ textAlign:"center", padding:24 }}>
                <div style={{ fontSize:"14px", color:"#818cf8", animation:"pulse 1s infinite", marginBottom:8 }}>🔍 הסוכן מחפש ומנתח את השוק...</div>
                <div style={{ fontSize:"12px", color:"#475569" }}>גלישה באינטרנט, ניתוח מתחרים, הערכת שוק</div>
              </div>
            )}
            {marketResult && !marketLoading && (
              <div className="card" style={{ borderTop:"2px solid #6366f1" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                  <h3 style={{ fontSize:"14px", fontWeight:700, color:"#a5b4fc" }}>📊 תוצאות מחקר: {marketIdea}</h3>
                  <button className="btn btn-s" onClick={() => setMarketResult(null)}>✕</button>
                </div>
                <div style={{ fontSize:"13px", lineHeight:1.8, color:"#cbd5e1", whiteSpace:"pre-wrap", background:"#0a1020", padding:14, borderRadius:8, border:"1px solid #1e293b" }}>{marketResult}</div>
              </div>
            )}
            {/* רעיונות קיימים */}
            <div style={{ marginTop:16 }}>
              <h3 style={{ fontSize:"13px", color:"#64748b", marginBottom:10 }}>רעיונות שמחכים למחקר:</h3>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {ideas.map(i => (
                  <button key={i.id} className="btn btn-g" style={{ fontSize:"12px" }} onClick={() => setMarketIdea(i.title)}>
                    {i.title} <span style={{ color: i.potential==="גבוה"?"#4ade80":i.potential==="בינוני"?"#fbbf24":"#f87171", marginRight:4 }}>●</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============ ידע ולקחים ============ */}
        {tab === "📚 ידע ולקחים" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14, alignItems:"center" }}>
              <div style={{ fontSize:"12px", color:"#475569" }}>
                💡 <b>מאגר ידע (Knowledge Base)</b> = שמירת לקחים, הצלחות ושגיאות כדי ללמוד ולא לחזור עליהן
              </div>
              <button className="btn btn-p" onClick={() => setM_know(true)}>+ הוסף ידע</button>
            </div>
            <div style={{ display:"grid", gap:10 }}>
              {knowledge.map(k => (
                <div key={k.id} className="card">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:7 }}>
                        <span className="sbadge" style={{ background: k.type==="הצלחה"?"#052e16":k.type==="שגיאה"?"#2d0505":k.type==="לקח"?"#1e3050":"#1a1a3e", color: k.type==="הצלחה"?"#4ade80":k.type==="שגיאה"?"#f87171":k.type==="לקח"?"#93c5fd":"#a78bfa" }}>{k.type}</span>
                        <h3 style={{ fontSize:"14px", fontWeight:700 }}>{k.title}</h3>
                      </div>
                      <p style={{ fontSize:"13px", color:"#64748b", marginBottom:8, lineHeight:1.6 }}>{k.content}</p>
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap", alignItems:"center" }}>
                        <span style={{ fontSize:"11px", background:"#1e293b", padding:"2px 8px", borderRadius:4, color:"#475569" }}>פרויקט: {k.project}</span>
                        {k.tags?.map(t=><span key={t} className="tag">{t}</span>)}
                        <span style={{ fontSize:"11px", color:"#374151" }}>{k.date}</span>
                      </div>
                    </div>
                    <button className="btn btn-d" style={{ marginRight:12 }} onClick={() => del("knowledge", k.id)}>מחק</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ רעיונות ============ */}
        {tab === "💭 רעיונות" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14, alignItems:"center" }}>
              <span style={{ fontSize:"12px", color:"#475569" }}>💡 <b>בנק רעיונות</b> — שמור רעיון, דרג פוטנציאל, שלח למחקר שוק</span>
              <button className="btn btn-p" onClick={() => setM_idea(true)}>+ רעיון</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(290px, 1fr))", gap:10 }}>
              {ideas.map(i => (
                <div key={i.id} className="card">
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                    <h3 style={{ fontSize:"14px", fontWeight:700 }}>{i.title}</h3>
                    <button className="btn btn-d" onClick={() => del("idea", i.id)}>✕</button>
                  </div>
                  <p style={{ fontSize:"12px", color:"#64748b", marginBottom:10, lineHeight:1.5 }}>{i.description}</p>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>{i.tags?.map(t=><span key={t} className="tag">{t}</span>)}</div>
                    <span style={{ fontSize:"12px", fontWeight:700, color: i.potential==="גבוה"?"#4ade80":i.potential==="בינוני"?"#fbbf24":"#f87171" }}>● {i.potential}</span>
                  </div>
                  <button className="btn btn-g" style={{ marginTop:10, width:"100%", fontSize:"12px" }} onClick={() => { setMarketIdea(i.title); setTab("🔍 מחקר שוק"); }}>
                    🔍 שלח למחקר שוק
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ סוכן AI ============ */}
        {tab === "🧠 סוכן AI" && (
          <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 220px)", minHeight:420 }}>
            <div style={{ marginBottom:10, padding:"9px 13px", background:"#0d1525", borderRadius:8, border:"1px solid #1e2d45", fontSize:"12px", color:"#475569", display:"flex", justifyContent:"space-between" }}>
              <span>🤖 הסוכן מכיר את כל הנתונים שלך ויכול לחפש באינטרנט לחידושים</span>
              <span style={{ color:"#1e3a5f" }}>כשאתה שואל על חידושים — מחפש אוטומטית</span>
            </div>
            <div style={{ display:"flex", gap:5, marginBottom:10, overflowX:"auto", paddingBottom:4 }}>
              {["מה הצעד הבא בפרויקט ארביטרז?","השווה Replit מול Lovable לבניית SaaS","מה החידושים האחרונים בכלי AI לאוטומציה?","איזה workflow (= זרימת עבודה) מומלץ לשיווק שותפים?","ציין 3 סיכונים בפרויקט הקריפטו שלי"].map((qp,i) => (
                <button key={i} className="qp" onClick={() => { setChatInput(qp); }}>{qp}</button>
              ))}
            </div>
            <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:4, marginBottom:12, padding:"2px" }}>
              {msgs.map((m,i) => (
                <div key={i} style={{ display:"flex", justifyContent: m.role==="user"?"flex-start":"flex-end" }}>
                  <div className={`cmsg ${m.role==="user"?"chat-u":"chat-a"}`}>{m.content}</div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display:"flex", justifyContent:"flex-end" }}>
                  <div className="cmsg chat-a" style={{ color:"#374151", animation:"pulse 1s infinite" }}>הסוכן חושב...</div>
                </div>
              )}
              <div ref={chatEnd} />
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <input className="inp" value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key==="Enter" && !e.shiftKey && sendChat()}
                placeholder="שאל את הסוכן... (Enter = שלח)" />
              <button className="btn btn-p" onClick={sendChat} disabled={chatLoading} style={{ flexShrink:0, padding:"9px 22px" }}>שלח</button>
            </div>
          </div>
        )}

      </div>

      {/* ============ מודלים (חלונות קופצים) ============ */}

      {/* פרויקט */}
      {m_proj && <div className="ov" onClick={() => setM_proj(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h3 style={{ marginBottom:14, color:"#a5b4fc" }}>פרויקט חדש</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <input className="inp" placeholder="שם הפרויקט" value={f_proj.name} onChange={e=>setF_proj({...f_proj,name:e.target.value})} />
          <textarea className="inp" placeholder="תיאור הפרויקט" value={f_proj.description} onChange={e=>setF_proj({...f_proj,description:e.target.value})} />
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

      {/* משימה */}
      {m_task && <div className="ov" onClick={() => setM_task(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h3 style={{ marginBottom:14, color:"#a5b4fc" }}>משימה חדשה</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <select className="sel" value={f_task.projectId} onChange={e=>setF_task({...f_task,projectId:Number(e.target.value)})}>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
          <input className="inp" placeholder="שם המשימה" value={f_task.title} onChange={e=>setF_task({...f_task,title:e.target.value})} />
          <textarea className="inp" placeholder="תיאור (אופציונלי)" value={f_task.description} onChange={e=>setF_task({...f_task,description:e.target.value})} />
          <div style={{ display:"flex", gap:8 }}>
            <select className="sel" style={{flex:1}} value={f_task.col} onChange={e=>setF_task({...f_task,col:e.target.value})}>{KANBAN_COLS.map(c=><option key={c}>{c}</option>)}</select>
            <select className="sel" style={{flex:1}} value={f_task.priority} onChange={e=>setF_task({...f_task,priority:e.target.value})}>{PRIORITY.map(p=><option key={p}>{p}</option>)}</select>
          </div>
          <input className="inp" type="date" value={f_task.dueDate} onChange={e=>setF_task({...f_task,dueDate:e.target.value})} />
          <input className="inp" placeholder="תגיות" value={f_task.tags} onChange={e=>setF_task({...f_task,tags:e.target.value})} />
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button className="btn btn-s" onClick={()=>setM_task(false)}>ביטול</button>
            <button className="btn btn-p" onClick={addTask}>הוסף</button>
          </div>
        </div>
      </div></div>}

      {/* פרומפט */}
      {m_prompt && <div className="ov" onClick={() => setM_prompt(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h3 style={{ marginBottom:14, color:"#a5b4fc" }}>פרומפט חדש</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <input className="inp" placeholder="שם הפרומפט" value={f_prompt.title} onChange={e=>setF_prompt({...f_prompt,title:e.target.value})} />
          <select className="sel" value={f_prompt.category} onChange={e=>setF_prompt({...f_prompt,category:e.target.value})}>{PROMPT_CATS.slice(1).map(c=><option key={c}>{c}</option>)}</select>
          <textarea className="inp" style={{ minHeight:120 }} placeholder="כתוב את הפרומפט כאן — השתמש ב-[סוגריים מרובעים] לחלקים שמשתנים" value={f_prompt.prompt} onChange={e=>setF_prompt({...f_prompt,prompt:e.target.value})} />
          <input className="inp" placeholder="תגיות" value={f_prompt.tags} onChange={e=>setF_prompt({...f_prompt,tags:e.target.value})} />
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button className="btn btn-s" onClick={()=>setM_prompt(false)}>ביטול</button>
            <button className="btn btn-p" onClick={addPrompt}>שמור פרומפט</button>
          </div>
        </div>
      </div></div>}

      {/* ידע */}
      {m_know && <div className="ov" onClick={() => setM_know(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h3 style={{ marginBottom:14, color:"#a5b4fc" }}>הוסף לידע</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <select className="sel" value={f_know.type} onChange={e=>setF_know({...f_know,type:e.target.value})}>
            {["לקח","הצלחה","שגיאה","ידע טכני","אסטרטגיה"].map(t=><option key={t}>{t}</option>)}
          </select>
          <input className="inp" placeholder="כותרת" value={f_know.title} onChange={e=>setF_know({...f_know,title:e.target.value})} />
          <textarea className="inp" placeholder="מה למדת? תהיה קונקרטי — מה קרה, מה הלקח, מה תעשה אחרת" value={f_know.content} onChange={e=>setF_know({...f_know,content:e.target.value})} />
          <input className="inp" placeholder="פרויקט קשור" value={f_know.project} onChange={e=>setF_know({...f_know,project:e.target.value})} />
          <input className="inp" placeholder="תגיות" value={f_know.tags} onChange={e=>setF_know({...f_know,tags:e.target.value})} />
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button className="btn btn-s" onClick={()=>setM_know(false)}>ביטול</button>
            <button className="btn btn-p" onClick={addKnowledge}>הוסף</button>
          </div>
        </div>
      </div></div>}

      {/* רעיון */}
      {m_idea && <div className="ov" onClick={() => setM_idea(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
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

      {/* כלי AI */}
      {m_tool && <div className="ov" onClick={() => setM_tool(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h3 style={{ marginBottom:14, color:"#a5b4fc" }}>הוסף כלי AI חדש</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ display:"flex", gap:8 }}>
            <input className="inp" style={{width:55}} placeholder="🔧" value={f_tool.logo} onChange={e=>setF_tool({...f_tool,logo:e.target.value})} />
            <input className="inp" placeholder="שם הכלי" value={f_tool.name} onChange={e=>setF_tool({...f_tool,name:e.target.value})} />
          </div>
          <select className="sel" value={f_tool.category} onChange={e=>setF_tool({...f_tool,category:e.target.value})}>{TOOL_CATS.slice(1).map(c=><option key={c}>{c}</option>)}</select>
          <textarea className="inp" placeholder="תיאור" value={f_tool.description} onChange={e=>setF_tool({...f_tool,description:e.target.value})} />
          <input className="inp" placeholder="שימושים (מופרד בפסיק)" value={f_tool.useCases} onChange={e=>setF_tool({...f_tool,useCases:e.target.value})} />
          <input className="inp" placeholder="חוזקות (מופרד בפסיק)" value={f_tool.strengths} onChange={e=>setF_tool({...f_tool,strengths:e.target.value})} />
          <input className="inp" placeholder="חסרונות (מופרד בפסיק)" value={f_tool.weaknesses} onChange={e=>setF_tool({...f_tool,weaknesses:e.target.value})} />
          <div style={{ display:"flex", gap:8 }}>
            <input className="inp" placeholder="מחיר" value={f_tool.pricing} onChange={e=>setF_tool({...f_tool,pricing:e.target.value})} />
            <input className="inp" style={{width:80}} type="number" min="1" max="10" placeholder="ציון" value={f_tool.myRating} onChange={e=>setF_tool({...f_tool,myRating:e.target.value})} />
          </div>
          <input className="inp" placeholder="כתובת אתר (URL)" value={f_tool.url} onChange={e=>setF_tool({...f_tool,url:e.target.value})} />
          <input className="inp" placeholder="תגיות" value={f_tool.tags} onChange={e=>setF_tool({...f_tool,tags:e.target.value})} />
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button className="btn btn-s" onClick={()=>setM_tool(false)}>ביטול</button>
            <button className="btn btn-p" onClick={addTool}>הוסף</button>
          </div>
        </div>
      </div></div>}

      {/* פרטי כלי AI */}
      {showTool && <div className="ov" onClick={() => setShowTool(null)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <span style={{ fontSize:30 }}>{showTool.logo}</span>
            <div>
              <h2 style={{ fontSize:"18px", fontWeight:700 }}>{showTool.name}</h2>
              <span style={{ fontSize:"12px", color:"#64748b" }}>{showTool.category}</span>
            </div>
          </div>
          <button className="btn btn-s" onClick={()=>setShowTool(null)}>✕</button>
        </div>
        <p style={{ fontSize:"13px", color:"#94a3b8", marginBottom:14, lineHeight:1.65 }}>{showTool.description}</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
          <div>
            <div style={{ fontSize:"12px", color:"#4ade80", marginBottom:5, fontWeight:700 }}>✓ חוזקות</div>
            {showTool.strengths?.map(s=><div key={s} style={{ fontSize:"12px", color:"#64748b", padding:"2px 0" }}>• {s}</div>)}
          </div>
          <div>
            <div style={{ fontSize:"12px", color:"#f87171", marginBottom:5, fontWeight:700 }}>✗ חסרונות</div>
            {showTool.weaknesses?.map(w=><div key={w} style={{ fontSize:"12px", color:"#64748b", padding:"2px 0" }}>• {w}</div>)}
          </div>
        </div>
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:"12px", color:"#a78bfa", marginBottom:5, fontWeight:700 }}>💡 שימושים</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
            {showTool.useCases?.map(u=><span key={u} style={{ background:"#1a1a3e", color:"#a78bfa", padding:"3px 8px", borderRadius:4, fontSize:"11px" }}>{u}</span>)}
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:10, borderTop:"1px solid #1e293b" }}>
          <span style={{ fontSize:"13px", color:"#475569" }}>💰 {showTool.pricing}</span>
          <div style={{ display:"flex", gap:8 }}>
            {showTool.url && <a href={showTool.url} target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}><button className="btn btn-g" style={{ fontSize:"12px" }}>🔗 לאתר</button></a>}
            <button className="btn btn-d" onClick={() => { del("tool", showTool.id); setShowTool(null); }}>מחק</button>
          </div>
        </div>
      </div></div>}

    </div>
  );
}
