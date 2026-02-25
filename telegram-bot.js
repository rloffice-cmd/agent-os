// ============================================================
// בוט טלגרם לסוכן ניהול פרויקטים — עברית מלאה
// ============================================================

import { createClient } from "@supabase/supabase-js";

// הגדרות
const TELEGRAM_TOKEN = "8675849877:AAElTgIVqNSMQdy66Cl4DSc-UkU8FFp71QU";
const SUPABASE_URL   = "https://pkviptoytcrdnhhspmtq.supabase.co";
const SUPABASE_KEY   = "sb_publishable_AgDyy3NQj4MZBpYjGmWPNQ_NdlT1E7j";
const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY || "";
const TELEGRAM_API   = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const sb             = createClient(SUPABASE_URL, SUPABASE_KEY);

// זיכרון שיחה לכל משתמש
const sessions = {};

// ============================================================
// הודעת ברוך הבא
// ============================================================
const WELCOME = `שלום! אני הסוכן שלך לניהול פרויקטים 🤖

כתוב לי כל אחד מהדברים הבאים:

📋 *פרויקטים* — כל הפרויקטים שלך
✅ *משימות* — משימות פתוחות
🔥 *דחוף* — משימות דחופות בלבד
📊 *סיכום* — סיכום שבועי חכם
➕ *משימה חדשה* — הוסף משימה
💡 *רעיון חדש* — שמור רעיון
🔍 *מחקר: [רעיון]* — מחקר שוק לרעיון

או פשוט שאל אותי כל שאלה בעברית 😊`;

// ============================================================
// זיהוי פקודה מטקסט
// ============================================================
const getCmd = (text) => {
  const t = text.trim();
  const tl = t.toLowerCase();

  const match = (list) => list.some(g => tl === g.toLowerCase());

  if (match(["שלום","היי","הי","בוקר טוב","ערב טוב","מה נשמע","/start","התחל","start"])) return "start";
  if (match(["עזרה","פקודות","מה אתה יכול","מה אפשר","/help","help"])) return "help";
  if (match(["פרויקטים","פרויקט","כל הפרויקטים","הצג פרויקטים","/projects","projects"])) return "projects";
  if (match(["משימות","משימה","כל המשימות","הצג משימות","/tasks","tasks"])) return "tasks";
  if (match(["דחוף","דחופות","משימות דחופות","מה דחוף","/urgent","urgent"])) return "urgent";
  if (match(["סיכום","סיכום שבועי","תסכם","מה המצב","/summary","summary"])) return "summary";
  if (match(["משימה חדשה","הוסף משימה","צור משימה","/addtask","addtask"])) return "addtask";
  if (match(["רעיון חדש","הוסף רעיון","שמור רעיון","/addidea","addidea"])) return "addidea";

  if (t.startsWith("מחקר:") || t.startsWith("מחקר ") || t.startsWith("/research ") || t.startsWith("/מחקר ")) return "research";

  return null;
};

// ============================================================
// שליחה לטלגרם
// ============================================================
const send = async (chatId, text, extra = {}) => {
  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown", ...extra })
    });
  } catch(e) { console.error("שגיאת שליחה:", e); }
};

const typing = (chatId) => fetch(`${TELEGRAM_API}/sendChatAction`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ chat_id: chatId, action: "typing" })
});

// ============================================================
// לוחות מקשים עבריים
// ============================================================
const mainKeyboard = {
  reply_markup: JSON.stringify({
    keyboard: [
      ["📋 פרויקטים", "✅ משימות"],
      ["🔥 דחוף", "📊 סיכום"],
      ["➕ משימה חדשה", "💡 רעיון חדש"]
    ],
    resize_keyboard: true
  })
};

const removeKeyboard = { reply_markup: JSON.stringify({ remove_keyboard: true }) };

// ============================================================
// טעינת נתונים מ-Supabase
// ============================================================
const loadData = async () => {
  try {
    const [p, t, k] = await Promise.all([
      sb.from("agent_projects").select("*"),
      sb.from("agent_tasks").select("*"),
      sb.from("agent_knowledge").select("*").limit(8),
    ]);
    const projects  = p.data || [];
    const tasks     = t.data || [];
    const knowledge = k.data || [];
    const openTasks = tasks.filter(t => t.col !== "הושלם");

    const ctx = [
      "פרויקטים:", ...projects.map(p => `- ${p.name} (${p.type}, שלב: ${p.stage})`),
      "", "משימות פתוחות:",
      ...openTasks.map(t => {
        const proj = projects.find(p => p.id === t.project_id)?.name || "?";
        return `- ${t.title} [${t.priority}] — ${proj}`;
      }),
      "", "לקחים:", ...knowledge.map(k => `[${k.type}] ${k.title}`)
    ].join("\n");

    return { projects, tasks, openTasks, ctx };
  } catch(e) {
    return { projects:[], tasks:[], openTasks:[], ctx:"" };
  }
};

// ============================================================
// שאלת Claude AI
// ============================================================
const askAI = async (question, ctx, history = []) => {
  try {
    const needsSearch = /חדש|עדכני|2025|אחרון|חפש|מחקר/i.test(question);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        system: `אתה סוכן AI אישי של יזם ישראלי. אתה מדבר דרך בוט טלגרם.
חוקים: ענה בעברית, קצר (מקסימום 200 מילים), מונח אנגלי = הסבר בסוגריים, חשוב כיזם.
\n${ctx}`,
        messages: [...history.slice(-10), { role:"user", content:question }],
        ...(needsSearch && { tools:[{ type:"web_search_20250305", name:"web_search" }] })
      })
    });
    const data = await res.json();
    return (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n") || "לא קיבלתי תשובה.";
  } catch(e) {
    return "שגיאה בחיבור ל-AI. נסה שוב.";
  }
};

// ============================================================
// עיבוד הודעה
// ============================================================
const handle = async (msg) => {
  const chatId = msg.chat.id;

  // emoji מלוח מקשים → פקודה
  const emojiMap = {
    "📋 פרויקטים":"פרויקטים", "✅ משימות":"משימות",
    "🔥 דחוף":"דחוף", "📊 סיכום":"סיכום",
    "➕ משימה חדשה":"משימה חדשה", "💡 רעיון חדש":"רעיון חדש"
  };
  const text = emojiMap[msg.text?.trim()] || msg.text?.trim() || "";

  if (!sessions[chatId]) sessions[chatId] = { mode:null, history:[], tmp:{} };
  const s = sessions[chatId];

  await typing(chatId);
  const cmd = getCmd(text);

  // התחלה / עזרה
  if (cmd === "start" || cmd === "help") return send(chatId, WELCOME, mainKeyboard);

  // פרויקטים
  if (cmd === "projects") {
    const { projects } = await loadData();
    if (!projects.length) return send(chatId, "אין פרויקטים עדיין.", mainKeyboard);
    const E = { "רעיון":"💜","תכנון":"🔵","פיתוח":"🟡","בדיקות":"🔴","השקה":"🟢","צמיחה":"🩵","הושלם":"✅","מושהה":"⚪" };
    const lines = projects.map(p => `${E[p.stage]||"⚫"} *${p.name}*\n  ${p.stage} · ${p.type}`).join("\n\n");
    return send(chatId, `📋 *הפרויקטים שלך:*\n\n${lines}`, mainKeyboard);
  }

  // משימות
  if (cmd === "tasks") {
    const { openTasks, projects } = await loadData();
    if (!openTasks.length) return send(chatId, "✅ אין משימות פתוחות!", mainKeyboard);
    const E = { "דחוף":"🔴","גבוהה":"🟠","בינונית":"🟡","נמוכה":"⚪" };
    const lines = openTasks.map(t => {
      const proj = projects.find(p=>p.id===t.project_id)?.name||"?";
      return `${E[t.priority]||"⚫"} *${t.title}*\n  📁 ${proj} · ⏰ ${t.due_date||"ללא תאריך"}`;
    }).join("\n\n");
    return send(chatId, `✅ *משימות פתוחות (${openTasks.length}):*\n\n${lines}`, mainKeyboard);
  }

  // דחוף
  if (cmd === "urgent") {
    const { tasks, projects } = await loadData();
    const urgent = tasks.filter(t=>t.priority==="דחוף"&&t.col!=="הושלם");
    if (!urgent.length) return send(chatId, "🟢 אין משימות דחופות כרגע!", mainKeyboard);
    const lines = urgent.map(t => {
      const proj = projects.find(p=>p.id===t.project_id)?.name||"?";
      return `🔴 *${t.title}*\n  📁 ${proj} · ⏰ ${t.due_date||"ללא תאריך"}`;
    }).join("\n\n");
    return send(chatId, `🔥 *משימות דחופות (${urgent.length}):*\n\n${lines}`, mainKeyboard);
  }

  // סיכום
  if (cmd === "summary") {
    await send(chatId, "📊 מכין סיכום שבועי, רגע...");
    const { ctx } = await loadData();
    const reply = await askAI(`סיכום שבועי קצר:\n1. מה הושג\n2. מה תקוע\n3. 3 צעדים לשבוע הבא\n\n${ctx}`, ctx);
    return send(chatId, `📊 *סיכום שבועי:*\n\n${reply}`, mainKeyboard);
  }

  // הוסף משימה — שלב א: שם
  if (cmd === "addtask") {
    s.mode = "task_title";
    return send(chatId, "➕ *משימה חדשה*\n\nמה שם המשימה?", removeKeyboard);
  }
  if (s.mode === "task_title") {
    s.tmp.title = text; s.mode = "task_priority";
    return send(chatId, `✏️ שם: *${text}*\n\nמה העדיפות?`, {
      reply_markup: JSON.stringify({ keyboard:[["🔴 דחוף","🟠 גבוהה"],["🟡 בינונית","⚪ נמוכה"]], one_time_keyboard:true, resize_keyboard:true })
    });
  }
  if (s.mode === "task_priority") {
    s.tmp.priority = text.replace(/^[🔴🟠🟡⚪] /,""); s.mode = "task_project";
    const { projects } = await loadData();
    return send(chatId, "לאיזה פרויקט?", {
      reply_markup: JSON.stringify({ keyboard:projects.map(p=>[p.name]), one_time_keyboard:true, resize_keyboard:true })
    });
  }
  if (s.mode === "task_project") {
    const { projects } = await loadData();
    const proj = projects.find(p=>p.name===text);
    if (!proj) return send(chatId, "פרויקט לא נמצא. נסה שוב.", mainKeyboard);
    const task = { id:Date.now(), project_id:proj.id, title:s.tmp.title, priority:s.tmp.priority, col:"לביצוע", description:"", due_date:"", tags:[] };
    await sb.from("agent_tasks").insert(task);
    s.mode=null; s.tmp={};
    return send(chatId, `✅ *משימה נוספה!*\n\n📌 ${task.title}\n🔴 עדיפות: ${task.priority}\n📁 פרויקט: ${text}`, mainKeyboard);
  }

  // הוסף רעיון — שלב א: שם
  if (cmd === "addidea") {
    s.mode = "idea_title";
    return send(chatId, "💡 *רעיון חדש*\n\nמה שם הרעיון?", removeKeyboard);
  }
  if (s.mode === "idea_title") {
    s.tmp.title = text; s.mode = "idea_desc";
    return send(chatId, `💡 *${text}*\n\nתאר אותו בקצרה:`);
  }
  if (s.mode === "idea_desc") {
    s.tmp.desc = text; s.mode = "idea_potential";
    return send(chatId, "מה הפוטנציאל?", {
      reply_markup: JSON.stringify({ keyboard:[["⭐⭐⭐ גבוה","⭐⭐ בינוני","⭐ נמוך"]], one_time_keyboard:true, resize_keyboard:true })
    });
  }
  if (s.mode === "idea_potential") {
    const potential = text.replace(/^[⭐]+ /,"");
    const idea = { id:Date.now(), title:s.tmp.title, description:s.tmp.desc, potential, tags:[], status:"חדש", date:new Date().toISOString().split("T")[0] };
    await sb.from("agent_ideas").insert(idea);
    s.mode=null; s.tmp={};
    return send(chatId, `✅ *רעיון נשמר!*\n\n💡 ${idea.title}\n📝 ${idea.description}\n⭐ פוטנציאל: ${potential}`, mainKeyboard);
  }

  // מחקר שוק
  if (cmd === "research") {
    const idea = text.replace(/^מחקר[: ]/i,"").replace(/^\/research /i,"").replace(/^\/מחקר /i,"").trim();
    if (!idea) return send(chatId, "כתוב לדוגמה: *מחקר: בוט קריפטו אוטומטי*", mainKeyboard);
    await send(chatId, `🔍 מחפש ומנתח: *${idea}*...`);
    const { ctx } = await loadData();
    const reply = await askAI(`מחקר שוק לרעיון: "${idea}"\n1. גודל שוק\n2. 3 מתחרים\n3. USP אפשרי\n4. המלצה: לבנות / לא`, ctx);
    return send(chatId, `📊 *מחקר שוק: ${idea}*\n\n${reply}`, mainKeyboard);
  }

  // שאלה חופשית
  const { ctx } = await loadData();
  s.history.push({ role:"user", content:text });
  if (s.history.length > 20) s.history = s.history.slice(-20);
  const reply = await askAI(text, ctx, s.history.slice(0,-1));
  s.history.push({ role:"assistant", content:reply });
  return send(chatId, reply, mainKeyboard);
};

// ============================================================
// לולאת polling
// ============================================================
let lastId = 0;
const poll = async () => {
  try {
    const res  = await fetch(`${TELEGRAM_API}/getUpdates?offset=${lastId+1}&timeout=30`);
    const data = await res.json();
    if (data.ok && data.result?.length) {
      for (const u of data.result) {
        lastId = u.update_id;
        if (u.message?.text) handle(u.message).catch(e=>console.error("שגיאה:", e));
      }
    }
  } catch(e) { console.error("שגיאת polling:", e); }
  setTimeout(poll, 1000);
};

// שמירת Replit פעיל
import http from "http";
http.createServer((req, res) => { res.writeHead(200); res.end("🤖 בוט פעיל!"); }).listen(3000);

console.log("🤖 בוט טלגרם עולה...");
console.log("✅ Supabase מחובר");
console.log("✅ Claude AI מחובר");
console.log("📱 ממתין להודעות...");
poll();
