import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pkviptoytcrdnhhspmtq.supabase.co";
const SUPABASE_KEY = "sb_publishable_AgDyy3NQj4MZBpYjGmWPNQ_NdlT1E7j";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
const SF_URL = "https://42db220e-5803-46ef-b732-23785edabd76-00-26knnqjmug8l8.picard.replit.dev";

// ─── קבועים ────────────────────────────────────────────────
const STAGES = ["רעיון","תכנון","פיתוח","בדיקות","השקה","צמיחה","הושלם","מושהה"];
const STAGE_COL = {רעיון:"#6366f1",תכנון:"#8b5cf6",פיתוח:"#f59e0b",בדיקות:"#ef4444",השקה:"#10b981",צמיחה:"#06b6d4",הושלם:"#22c55e",מושהה:"#6b7280"};
const KANBAN = ["לביצוע","בתהליך","הושלם"];
const PRIORITY = ["נמוכה","בינונית","גבוהה","דחוף"];
const PCOL = {נמוכה:"#64748b",בינונית:"#f59e0b",גבוהה:"#f97316",דחוף:"#ef4444"};
const PROMPT_CATS = ["הכל","קוד","עיצוב","שיווק","מחקר","אוטומציה","אסטרטגיה"];
const TOOL_CATS = ["הכל","פיתוח","אוטומציה","AI","דאטה","שיווק"];

const PIPELINE_STAGES = [
  {id:"idea",icon:"💡",name:"גיבוש רעיון",color:"#6366f1",
   agents:["מנתח שוק","מחקר מתחרים","GO/NO-GO"],
   outputs:["One-liner","קהל יעד","3 מתחרים","המלצה"]},
  {id:"spec",icon:"📐",name:"איפיון מלא",color:"#8b5cf6",
   agents:["ארכיטקט","PM","כלכלן"],
   outputs:["PRD","Stack טכני","MVP scope","תקציב"]},
  {id:"build",icon:"⚙️",name:"בנייה",color:"#f59e0b",
   agents:["Dev Agent","QA Agent","UX Agent"],
   outputs:["קוד MVP","DB schema","UI mockup","API docs"]},
  {id:"automate",icon:"🔄",name:"אוטומציה",color:"#06b6d4",
   agents:["n8n Planner","Integration Bot","Monitor Agent"],
   outputs:["Workflow map","Webhooks","Alerts","Cron jobs"]},
  {id:"test",icon:"🧪",name:"בדיקות",color:"#ef4444",
   agents:["Tester","Security Bot","Performance Agent"],
   outputs:["Test suite","Security report","Load test","Bug list"]},
  {id:"launch",icon:"🚀",name:"השקה",color:"#10b981",
   agents:["Marketing Agent","Growth Hacker","Analytics Bot"],
   outputs:["Landing page","Email sequence","KPIs","Launch plan"]},
  {id:"operate",icon:"📈",name:"תפעול ושותפות",color:"#f59e0b",
   agents:["Support Agent","Partner Scout","Revenue Optimizer"],
   outputs:["SLA","Partner deck","Revenue model","Roadmap"]},
];

const AGENT_ROLES = {
  "מנתח שוק": {icon:"🔬",color:"#6366f1",specialty:"market analysis, competitive intelligence"},
  "ארכיטקט": {icon:"🏗️",color:"#8b5cf6",specialty:"system design, tech stack, architecture"},
  "PM": {icon:"📋",color:"#06b6d4",specialty:"project management, sprints, priorities"},
  "Dev Agent": {icon:"💻",color:"#f59e0b",specialty:"code, implementation, debugging"},
  "Growth Hacker": {icon:"📈",color:"#10b981",specialty:"growth, marketing, user acquisition"},
  "Revenue Optimizer": {icon:"💰",color:"#22c55e",specialty:"monetization, pricing, partnerships"},
  "Monitor Agent": {icon:"👁️",color:"#ef4444",specialty:"monitoring, alerts, performance"},
};

const SYSTEM = `אתה סוכן AI אוטונומי v7 — מנוע הפעלה לפרויקטים.
יכולות: ניתוח, תכנון, אוטומציה, ניהול, שיפור עצמי.
פרויקט ראשי: SignalForge — מנוע לידים B2B + אפיליאציה על Replit VM.
חוקים: עברית. מונח טכני = הסבר בסוגריים. קצר, מדויק, מעשי. ROI > תיאוריה.
כשמשתמש מבקש לבצע פעולה (צור פרויקט, הוסף משימה, הרץ pipeline) — תן JSON עם action.
פורמט action: {"action":"create_project"|"create_task"|"start_pipeline"|"upgrade_agent","data":{...}}`;

const DEF_PROJECTS = [
  {id:1,name:"SignalForge",type:"רווח",stage:"צמיחה",description:"מנוע לידים B2B ואפיליאציה",tags:["b2b","automation"],revenue:0,created_at:"2024-11-01"},
  {id:2,name:"TCG Arbitrage Agent",type:"רווח",stage:"פיתוח",description:"סוכן קלפי אספנות עם PSA grading",tags:["TCG","PSA"],revenue:0,created_at:"2025-11-12"},
  {id:3,name:"AI Project OS",type:"אישי",stage:"השקה",description:"מנהל הסוכנים v7",tags:["ai","management"],revenue:0,created_at:"2025-02-24"},
];
const DEF_TASKS = [
  {id:1,project_id:1,title:"תיקון deploy — health check",description:"Replit נכשל ב-Promote",col:"בתהליך",priority:"דחוף",due_date:"2026-02-26",tags:["deploy"]},
  {id:2,project_id:1,title:"הפעלת אימיילים",description:"EMAIL_SENDING_ENABLED=true",col:"לביצוע",priority:"גבוהה",due_date:"2026-03-01",tags:["email"]},
  {id:3,project_id:2,title:"PSA Grading Calculator",description:"ROI calculator PSA 9 breakeven",col:"לביצוע",priority:"דחוף",due_date:"2026-03-10",tags:["PSA"]},
];
const DEF_KNOWLEDGE = [
  {id:1,type:"לקח",title:"Replit deploymentTarget חייב vm",content:"cloudrun = PostgreSQL נכשל. תמיד vm.",project:"SignalForge",tags:["replit"],date:"2026-02-23"},
  {id:2,type:"אסטרטגיה",title:"חוק ה-70/30 בגריידינג",content:"לא לרכוש קלף אם Margin ב-PSA 9 < 20%.",project:"TCG",tags:["PSA"],date:"2025-12-15"},
];
const DEF_PROMPTS = [
  {id:1,title:"ארכיטקטורת מערכת מאפס",category:"קוד",prompt:"תכנן ארכיטקטורה מלאה עבור [תיאור]: Stack, DB, API, אינטגרציות, לוח זמנים.",tags:["arch"],uses:12,rating:5},
  {id:2,title:"GO/NO-GO Analysis",category:"אסטרטגיה",prompt:"נתח רעיון [תיאור]: בעיה, שוק, מתחרים, סיכונים, המלצה. תן ציון 1-10.",tags:["strategy"],uses:8,rating:5},
];
const DEF_TOOLS = [
  {id:1,name:"Claude",category:"AI",logo:"⬡",description:"ארכיטקטורה, קוד, ניתוח",pricing:"20$/חודש",url:"https://claude.ai",my_rating:10,status:"פעיל",tags:["llm"]},
  {id:2,name:"Replit",category:"פיתוח",logo:"🔷",description:"פיתוח, deploy, PostgreSQL",pricing:"25$/חודש",url:"https://replit.com",my_rating:9,status:"פעיל",tags:["ide"]},
  {id:3,name:"Supabase",category:"דאטה",logo:"⚡",description:"Real-time DB, Auth",pricing:"חינמי",url:"https://supabase.com",my_rating:10,status:"פעיל",tags:["db"]},
  {id:4,name:"n8n",category:"אוטומציה",logo:"🔄",description:"Workflows, webhooks",pricing:"חינמי self-hosted",url:"https://n8n.io",my_rating:9,status:"פעיל",tags:["automation"]},
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Noto+Sans+Hebrew:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --bg:#04080f;--bg2:#080e1a;--bg3:#0c1422;--bg4:#101c2e;
    --border:#1a2d45;--border2:#243d5a;
    --text:#e2eaf5;--text2:#8ba3bf;--text3:#4a6278;
    --accent:#5b8def;--accent2:#3d6fd4;
    --green:#22c55e;--yellow:#f59e0b;--red:#ef4444;--purple:#a78bfa;
    --sf:#00e5a0;
  }
  html,body{background:var(--bg);color:var(--text);font-family:'Noto Sans Hebrew',sans-serif;direction:rtl;}
  ::-webkit-scrollbar{width:3px;height:3px;} ::-webkit-scrollbar-thumb{background:#1a2d45;border-radius:3px;}
  
  /* Nav */
  .topbar{position:sticky;top:0;z-index:100;background:rgba(4,8,15,.95);border-bottom:1px solid var(--border);backdrop-filter:blur(20px);padding:0 16px;display:flex;align-items:center;gap:0;height:52px;}
  .logo{display:flex;align-items:center;gap:10px;padding-left:16px;border-left:1px solid var(--border);margin-left:12px;flex-shrink:0;}
  .logo-icon{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#2a4f9e,#1a3a7a);display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 0 20px #3d6fd430;}
  .logo-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#c7d8f0;white-space:nowrap;}
  .logo-sub{font-size:10px;color:var(--text3);font-family:'JetBrains Mono',monospace;}
  .tabs-scroll{display:flex;overflow-x:auto;gap:0;flex:1;}
  .tabs-scroll::-webkit-scrollbar{display:none;}
  .tab{background:none;border:none;cursor:pointer;padding:0 14px;height:52px;color:var(--text3);font-family:'Noto Sans Hebrew',sans-serif;font-size:12px;font-weight:600;transition:all .2s;border-bottom:2px solid transparent;white-space:nowrap;display:flex;align-items:center;gap:5px;}
  .tab:hover{color:var(--text2);background:rgba(91,141,239,.04);}
  .tab.on{color:var(--accent);border-bottom-color:var(--accent);}
  .tab.sf-tab.on{color:var(--sf);border-bottom-color:var(--sf);}
  .tab.agent-tab.on{color:var(--purple);border-bottom-color:var(--purple);}
  
  /* Mobile bottom nav */
  .mobile-nav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:100;background:rgba(4,8,15,.97);border-top:1px solid var(--border);padding:6px 0 env(safe-area-inset-bottom);backdrop-filter:blur(20px);}
  .mobile-nav-btn{background:none;border:none;color:var(--text3);font-family:'Noto Sans Hebrew',sans-serif;font-size:10px;font-weight:600;padding:6px 10px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;transition:color .2s;}
  .mobile-nav-btn.on{color:var(--accent);}
  .mobile-nav-btn span:first-child{font-size:18px;}
  
  /* Cards */
  .card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:16px;transition:border-color .2s;}
  .card:hover{border-color:var(--border2);}
  .card-sm{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px;}
  
  /* Buttons */
  .btn{border:none;cursor:pointer;border-radius:8px;font-family:'Noto Sans Hebrew',sans-serif;font-weight:700;transition:all .18s;font-size:13px;}
  .btn-p{background:var(--accent2);color:#fff;padding:9px 18px;} .btn-p:hover{background:var(--accent);transform:translateY(-1px);}
  .btn-s{background:var(--bg3);color:var(--text2);border:1px solid var(--border);padding:6px 12px;font-size:12px;} .btn-s:hover{border-color:var(--border2);color:var(--text);}
  .btn-d{background:#1a0505;color:#fca5a5;border:1px solid #3d0a0a;padding:5px 10px;font-size:11px;} .btn-d:hover{background:#2d0a0a;}
  .btn-g{background:transparent;border:1px solid var(--border);color:var(--text2);padding:7px 14px;font-size:12px;} .btn-g:hover{border-color:var(--accent);color:var(--accent);}
  .btn-green{background:#051a0f;color:var(--green);border:1px solid #0a3d1a;padding:8px 16px;} .btn-green:hover{background:#0a2d18;}
  .btn-red{background:#1a0505;color:#f87171;border:1px solid #3d0a0a;padding:8px 16px;} .btn-red:hover{background:#2d0a0a;}
  .btn-sf{background:#021a12;color:var(--sf);border:1px solid #035c3f;padding:8px 16px;} .btn-sf:hover{background:#03291a;}
  .btn-icon{background:none;border:none;cursor:pointer;color:var(--text3);font-size:14px;padding:4px;transition:color .2s;line-height:1;} .btn-icon:hover{color:var(--text);}
  
  /* Inputs */
  .inp{background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:9px 12px;font-family:'Noto Sans Hebrew',sans-serif;font-size:14px;width:100%;transition:border-color .2s;outline:none;} .inp:focus{border-color:var(--accent);}
  .inp::placeholder{color:var(--text3);}
  textarea.inp{resize:vertical;min-height:70px;line-height:1.6;}
  .sel{background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:8px 10px;font-family:'Noto Sans Hebrew',sans-serif;font-size:13px;cursor:pointer;outline:none;} .sel:focus{border-color:var(--accent);}
  
  /* Tags */
  .tag{display:inline-flex;align-items:center;background:#0d1e35;color:#7aa7d4;padding:2px 8px;border-radius:4px;font-size:11px;margin:2px;}
  .badge{display:inline-flex;align-items:center;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:700;}
  
  /* Modal */
  .ov{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;}
  .modal{background:var(--bg2);border:1px solid var(--border2);border-radius:16px;padding:24px;width:560px;max-width:100%;max-height:90vh;overflow-y:auto;}
  
  /* Mono */
  .mono{font-family:'JetBrains Mono',monospace;}
  
  /* Pipeline */
  .pipe-stage{border-radius:12px;padding:14px;cursor:pointer;transition:all .2s;border:1px solid var(--border);background:var(--bg2);}
  .pipe-stage.active{border-color:currentColor;}
  .pipe-stage:hover{transform:translateY(-2px);border-color:var(--border2);}
  .pipe-connector{width:2px;height:16px;background:var(--border);margin:0 auto;}
  
  /* Agent bubbles */
  .agent-bubble{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:20px;font-size:12px;border:1px solid;animation:fadeIn .3s ease;}
  
  /* Chat */
  .chat-wrap{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:6px;padding:4px 0;}
  .cmsg{max-width:85%;padding:11px 15px;border-radius:12px;font-size:13.5px;line-height:1.7;white-space:pre-wrap;word-break:break-word;}
  .msg-u{background:#0d1e35;margin-right:auto;border-bottom-right-radius:3px;color:#bfd5f0;}
  .msg-a{background:var(--bg3);border:1px solid var(--border);margin-left:auto;border-bottom-left-radius:3px;}
  .msg-action{background:#051a10;border:1px solid #0a3d20;margin-left:auto;border-bottom-left-radius:3px;color:#a7f3c8;}
  .msg-agent{background:#0f0d1e;border:1px solid #2a2060;margin-left:auto;border-bottom-left-radius:3px;}
  
  /* Kanban */
  .kcard{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:11px;margin-bottom:8px;cursor:pointer;transition:all .15s;}
  .kcard:hover{border-color:var(--border2);}
  
  /* Stat box */
  .stat{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px 14px;text-align:center;}
  .stat-val{font-family:'Syne',sans-serif;font-size:22px;font-weight:700;line-height:1.1;}
  .stat-label{font-size:10px;color:var(--text3);margin-top:3px;}
  
  /* Animations */
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes pulse{0%,100%{opacity:.4;}50%{opacity:1;}}
  @keyframes glow{0%,100%{opacity:1;}50%{opacity:.6;}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
  @keyframes slideIn{from{opacity:0;transform:translateX(-10px);}to{opacity:1;transform:none;}}
  @keyframes typing{0%,100%{opacity:.3;}50%{opacity:1;}}
  .fade-in{animation:fadeIn .3s ease;}
  .slide-in{animation:slideIn .3s ease;}
  
  /* Live dot */
  .live-dot{width:6px;height:6px;border-radius:50%;display:inline-block;animation:glow 2s infinite;}
  
  /* Progress bar */
  .progress{height:4px;border-radius:2px;background:var(--bg4);overflow:hidden;}
  .progress-fill{height:100%;border-radius:2px;transition:width .5s ease;}

  /* Highlight box */
  .highlight{background:linear-gradient(135deg,#0a1428,#0c1e3a);border:1px solid #1a3d6e;border-radius:12px;padding:16px;}
  
  /* Grid responsive */
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}
  .grid-auto{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;}
  
  /* ROI */
  .roi-positive{color:var(--green);}
  .roi-negative{color:var(--red);}
  
  /* Self upgrade */
  .upgrade-item{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;border-right:3px solid var(--purple);}
  
  /* Mobile responsive */
  @media(max-width:768px){
    .grid-2{grid-template-columns:1fr;}
    .grid-3{grid-template-columns:1fr 1fr;}
    .topbar .tabs-scroll{display:none;}
    .mobile-nav{display:flex;}
    .main-content{padding-bottom:80px;}
    .hide-mobile{display:none;}
    .modal{width:calc(100vw - 32px);}
  }
  @media(max-width:480px){
    .grid-3{grid-template-columns:1fr;}
  }
`;

const TABS_MAIN = ["🏠","🎯","🤖","📡","📋","✅","📊","🔬","🧠"];
const TAB_NAMES = {"🏠":"פיקוד","🎯":"Pipeline","🤖":"Orchestrator","📡":"SignalForge","📋":"פרויקטים","✅":"משימות","📊":"Analytics","🔬":"Lab","🧠":"Agent HQ"};

export default function App() {
  const [tab, setTab] = useState("🏠");
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [knowledge, setKnowledge] = useState([]);
  const [tools, setTools] = useState([]);
  const [msgs, setMsgs] = useState([{role:"assistant",content:"⬡ סוכן v7 מוכן — אני יכול לנהל פרויקטים, להריץ pipelines, לתאם AI agents, ולשדרג את עצמי.\n\nנסה: 'הרץ pipeline ל-[רעיון]' או 'צור פרויקט חדש' או 'מה הסטטוס?'"}]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("מסונכרן");
  const [activeProject, setActiveProject] = useState(1);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [activeOrchSession, setActiveOrchSession] = useState(null);
  const [orchLogs, setOrchLogs] = useState([]);
  const [orchRunning, setOrchRunning] = useState(false);
  const [pipelineProject, setPipelineProject] = useState("");
  const [activePipeStage, setActivePipeStage] = useState(0);
  const [pipeResults, setPipeResults] = useState({});
  const [pipeRunning, setPipeRunning] = useState(null);
  const [sfStats, setSfStats] = useState(null);
  const [sfError, setSfError] = useState(null);
  const [sfLastFetch, setSfLastFetch] = useState(null);
  const [upgradeIdeas, setUpgradeIdeas] = useState([]);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [marketIdea, setMarketIdea] = useState("");
  const [marketResult, setMarketResult] = useState(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const [weeklyResult, setWeeklyResult] = useState(null);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [roiData, setRoiData] = useState({});
  const [modals, setModals] = useState({proj:false,task:false,prompt:false,know:false});
  const [forms, setForms] = useState({
    proj:{name:"",type:"רווח",stage:"רעיון",description:"",tags:""},
    task:{title:"",description:"",col:"לביצוע",priority:"בינונית",due_date:"",tags:""},
    prompt:{title:"",category:"קוד",prompt:"",tags:""},
    know:{type:"לקח",title:"",content:"",project:"כללי",tags:""},
  });
  const [copied, setCopied] = useState(null);
  const chatEnd = useRef(null);
  const sfTimer = useRef(null);

  // ── SF fetch ──────────────────────────────────────────────
  const fetchSF = useCallback(async(silent=false)=>{
    try{
      const r = await fetch(`${SF_URL}/api/stats`).then(r=>r.json());
      setSfStats(r); setSfLastFetch(new Date()); setSfError(null);
    }catch(e){ setSfError("SF מנותק"); }
  },[]);

  useEffect(()=>{
    fetchSF();
    sfTimer.current = setInterval(()=>fetchSF(true),60000);
    return()=>clearInterval(sfTimer.current);
  },[fetchSF]);

  // ── Load ─────────────────────────────────────────────────
  useEffect(()=>{ loadAll(); },[]);
  useEffect(()=>{ chatEnd.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  useEffect(()=>{
    const ch = sb.channel("rt")
      .on("postgres_changes",{event:"*",schema:"public",table:"agent_tasks"},()=>loadTable("agent_tasks",setTasks,DEF_TASKS))
      .on("postgres_changes",{event:"*",schema:"public",table:"agent_projects"},()=>loadTable("agent_projects",setProjects,DEF_PROJECTS))
      .subscribe();
    return()=>sb.removeChannel(ch);
  },[]);

  const loadTable = async(table,setter,def)=>{
    const {data,error}=await sb.from(table).select("*");
    if(!error&&data?.length) setter(data);
    else if(!error) setter(def);
  };

  const loadAll = async()=>{
    setLoading(true);
    const [p,t,pr,k,to,m] = await Promise.all([
      sb.from("agent_projects").select("*"),
      sb.from("agent_tasks").select("*"),
      sb.from("agent_prompts").select("*"),
      sb.from("agent_knowledge").select("*"),
      sb.from("agent_tools").select("*"),
      sb.from("agent_messages").select("*").order("created_at",{ascending:true}).limit(80),
    ]);
    if(!p.error&&p.data?.length)setProjects(p.data);else{await sb.from("agent_projects").insert(DEF_PROJECTS);setProjects(DEF_PROJECTS);}
    if(!t.error&&t.data?.length)setTasks(t.data);else{await sb.from("agent_tasks").insert(DEF_TASKS);setTasks(DEF_TASKS);}
    if(!pr.error&&pr.data?.length)setPrompts(pr.data);else{await sb.from("agent_prompts").insert(DEF_PROMPTS);setPrompts(DEF_PROMPTS);}
    if(!k.error&&k.data?.length)setKnowledge(k.data);else{await sb.from("agent_knowledge").insert(DEF_KNOWLEDGE);setKnowledge(DEF_KNOWLEDGE);}
    if(!to.error&&to.data?.length)setTools(to.data);else{await sb.from("agent_tools").insert(DEF_TOOLS);setTools(DEF_TOOLS);}
    if(!m.error&&m.data?.length)setMsgs(m.data.map(x=>({role:x.role,content:x.content})));
    setLoading(false);
    setSyncStatus("מסונכרן");
  };

  // ── CRUD ─────────────────────────────────────────────────
  const save = (op)=>{ setSyncStatus("שומר..."); op().then(()=>setSyncStatus("מסונכרן")); };
  const addProject = async(data=null)=>{
    const p=data||{...forms.proj,id:Date.now(),tags:forms.proj.tags.split(",").map(t=>t.trim()).filter(Boolean),created_at:new Date().toISOString().split("T")[0],revenue:0};
    save(async()=>{ await sb.from("agent_projects").insert(p); setProjects(prev=>[...prev,p]); });
    setModals(m=>({...m,proj:false}));
  };
  const addTask = async(data=null)=>{
    const t=data||{...forms.task,id:Date.now(),project_id:activeProject,tags:forms.task.tags.split(",").map(x=>x.trim()).filter(Boolean)};
    save(async()=>{ await sb.from("agent_tasks").insert(t); setTasks(prev=>[...prev,t]); });
    setModals(m=>({...m,task:false}));
  };
  const addKnow = async(data=null)=>{
    const k=data||{...forms.know,id:Date.now(),tags:forms.know.tags.split(",").map(t=>t.trim()).filter(Boolean),date:new Date().toISOString().split("T")[0]};
    save(async()=>{ await sb.from("agent_knowledge").insert(k); setKnowledge(prev=>[...prev,k]); });
    setModals(m=>({...m,know:false}));
  };
  const addPrompt = async()=>{
    const p={...forms.prompt,id:Date.now(),tags:forms.prompt.tags.split(",").map(t=>t.trim()).filter(Boolean),uses:0,rating:5};
    save(async()=>{ await sb.from("agent_prompts").insert(p); setPrompts(prev=>[...prev,p]); });
    setModals(m=>({...m,prompt:false}));
  };
  const moveTask = (id,col)=>save(async()=>{ await sb.from("agent_tasks").update({col}).eq("id",id); setTasks(prev=>prev.map(t=>t.id===id?{...t,col}:t)); });
  const updateProjStage = (id,stage)=>save(async()=>{ await sb.from("agent_projects").update({stage}).eq("id",id); setProjects(p=>p.map(x=>x.id===id?{...x,stage}:x)); });
  const del = (table,id,setter,arr)=>save(async()=>{ await sb.from(table).delete().eq("id",id); setter(arr.filter(x=>x.id!==id)); });

  // ── AI Core ───────────────────────────────────────────────
  const ctx = ()=>{
    const ps=projects.map(p=>`${p.name}(${p.stage})`).join("|");
    const ts=tasks.filter(t=>t.col!=="הושלם").map(t=>`${t.title}[${t.priority}]`).join("|");
    const sf=sfStats?`SF:${sfStats.leadsFound}לידים,${sfStats.emailsSentToday}מיילים,${sfStats.emailSendingEnabled?"פעיל":"מושהה"}`:"SF:לא מחובר";
    return `פרויקטים:${ps}\nמשימות פתוחות:${ts}\n${sf}`;
  };

  const callAI = async(msg,extra="",hist=[])=>{
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1800,system:SYSTEM+"\n"+ctx()+"\n"+extra,messages:[...hist.slice(-16),{role:"user",content:msg}]})});
    const d=await r.json();
    return (d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n")||"שגיאה";
  };

  const callAISearch = async(msg)=>{
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2000,system:SYSTEM,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:msg}]})});
    const d=await r.json();
    return (d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n")||"לא נמצא";
  };

  // ── Agentic Chat Parser ───────────────────────────────────
  const parseAgentAction = (text)=>{
    try {
      const match = text.match(/\{"action":.*?\}/s);
      if(match) return JSON.parse(match[0]);
    } catch(e) {}
    return null;
  };

  const executeAction = async(action, data)=>{
    switch(action){
      case "create_project":
        await addProject({id:Date.now(),name:data.name||"פרויקט חדש",type:data.type||"רווח",stage:data.stage||"רעיון",description:data.description||"",tags:data.tags||[],revenue:0,created_at:new Date().toISOString().split("T")[0]});
        return `✅ פרויקט "${data.name}" נוצר ב-Supabase`;
      case "create_task":
        const proj=projects.find(p=>p.name?.includes(data.project||""))||projects[0];
        await addTask({id:Date.now(),project_id:proj?.id||1,title:data.title||"משימה חדשה",description:data.description||"",col:"לביצוע",priority:data.priority||"בינונית",due_date:data.due_date||"",tags:data.tags||[]});
        return `✅ משימה "${data.title}" נוספה לפרויקט ${proj?.name}`;
      case "start_pipeline":
        setPipelineProject(data.name||"");
        setTab("🎯");
        return `🎯 Pipeline הופעל עבור "${data.name}" — עובר לטאב Pipeline`;
      case "upgrade_agent":
        setTab("🔬");
        return `🔬 עובר ל-Lab לשדרוג — מה תרצה לשנות?`;
      default:
        return null;
    }
  };

  const sendChat = async()=>{
    if(!chatInput.trim()||chatLoading) return;
    const userMsg={role:"user",content:chatInput};
    const newMsgs=[...msgs,userMsg];
    setMsgs(newMsgs);
    setChatInput("");
    setChatLoading(true);
    await sb.from("agent_messages").insert({role:"user",content:chatInput}).catch(()=>{});

    try{
      const needsSearch=/חדש|עדכני|2025|2026|אחרון|חפש|שוק/i.test(chatInput);
      const extra=`\nכשהמשתמש מבקש פעולה, כלול JSON action בתשובה. לדוגמה: 'צור פרויקט X' → תן תשובה + {"action":"create_project","data":{"name":"X","type":"רווח","stage":"רעיון"}}\nפעולות: create_project, create_task, start_pipeline, upgrade_agent`;
      let reply;
      if(needsSearch) reply=await callAISearch(chatInput);
      else reply=await callAI(chatInput,extra,newMsgs.slice(-20).map(m=>({role:m.role==="action"?"assistant":m.role,content:m.content})));

      const action=parseAgentAction(reply);
      const cleanReply=reply.replace(/\{"action":.*?\}/s,"").trim();
      
      await sb.from("agent_messages").insert({role:"assistant",content:cleanReply}).catch(()=>{});
      
      if(action){
        const actionResult=await executeAction(action.action,action.data||{});
        setMsgs([...newMsgs,{role:"assistant",content:cleanReply},{role:"action",content:actionResult||""}].filter(m=>m.content));
      } else {
        setMsgs([...newMsgs,{role:"assistant",content:cleanReply}]);
      }
    }catch(e){
      setMsgs([...newMsgs,{role:"assistant",content:"שגיאת חיבור — נסה שוב."}]);
    }
    setChatLoading(false);
  };

  // ── Orchestrator ──────────────────────────────────────────
  const runOrchestrator = async(goal)=>{
    setOrchRunning(true);
    setOrchLogs([]);
    const agentPlan=[
      {role:"מנתח שוק",task:`נתח את הצורך ב: "${goal}". גודל שוק, מתחרים, הזדמנות.`,icon:"🔬",color:"#6366f1"},
      {role:"ארכיטקט",task:`תכנן ארכיטקטורה ל: "${goal}". Stack, DB, APIs.`,icon:"🏗️",color:"#8b5cf6"},
      {role:"PM",task:`צור 5 משימות ראשונות ל: "${goal}". JSON: [{title,priority,col}]`,icon:"📋",color:"#06b6d4"},
      {role:"Growth Hacker",task:`תכנן השקה ל: "${goal}". ערוצים, הודעות, KPIs.`,icon:"📈",color:"#10b981"},
    ];

    for(let i=0;i<agentPlan.length;i++){
      const agent=agentPlan[i];
      setOrchLogs(prev=>[...prev,{type:"start",role:agent.role,icon:agent.icon,color:agent.color,text:`מפעיל...`}]);
      await new Promise(r=>setTimeout(r,400));
      
      const result=await callAI(agent.task,`אתה ${agent.role}. ${AGENT_ROLES[agent.role]?.specialty||""}. תשובה קצרה ומעשית.`).catch(()=>"שגיאה");
      setOrchLogs(prev=>prev.map((l,idx)=>idx===prev.length-1?{...l,text:result,done:true}:l));
      
      if(agent.role==="PM"){
        try{
          const jsonMatch=result.match(/\[.*?\]/s);
          if(jsonMatch){
            const taskArr=JSON.parse(jsonMatch[0]);
            const proj=projects.find(p=>p.name?.toLowerCase().includes(goal.toLowerCase().split(" ")[0]))||projects[0];
            for(const t of taskArr.slice(0,5)){
              await addTask({id:Date.now()+Math.random(),project_id:proj?.id||1,...t,description:t.description||"",due_date:"",tags:[]});
            }
            setOrchLogs(prev=>[...prev,{type:"action",text:`✅ ${taskArr.slice(0,5).length} משימות נוצרו ב-Supabase`,color:"#22c55e"}]);
          }
        }catch(e){}
      }
      await new Promise(r=>setTimeout(r,300));
    }
    setOrchRunning(false);
  };

  // ── Pipeline ──────────────────────────────────────────────
  const runPipeStage = async(stageIdx)=>{
    if(!pipelineProject) return;
    setPipeRunning(stageIdx);
    const stage=PIPELINE_STAGES[stageIdx];
    const results=[];
    
    for(const agentName of stage.agents){
      const agentInfo=AGENT_ROLES[agentName]||{specialty:"general"};
      const r=await callAI(
        `אתה ${agentName} (${agentInfo.specialty}). פרויקט: "${pipelineProject}". שלב: ${stage.name}.\nתן תוצאה קצרה ומעשית לשלב זה.`,
        ""
      ).catch(()=>"שגיאה");
      results.push({agent:agentName,result:r});
      await new Promise(r=>setTimeout(r,200));
    }
    
    setPipeResults(prev=>({...prev,[stageIdx]:results}));
    
    const combined=results.map(r=>`${r.agent}: ${r.result}`).join("\n\n");
    await addKnow({
      id:Date.now(),type:"ידע טכני",
      title:`${stage.icon} ${stage.name} — ${pipelineProject}`,
      content:combined.substring(0,500),
      project:pipelineProject,tags:[stage.id],
      date:new Date().toISOString().split("T")[0]
    });
    setPipeRunning(null);
  };

  // ── Self Upgrade ──────────────────────────────────────────
  const genUpgrades = async()=>{
    setUpgradeLoading(true);
    const r=await callAI(
      `ניתחת את מנהל הסוכנים v7. הצע 5 שדרוגים ספציפיים שיהפכו אותו לאוטונומי יותר.
לכל שדרוג: כותרת, תיאור קצר, השפעה (גבוה/בינוני), זמן פיתוח.
JSON: [{"title":"...","desc":"...","impact":"גבוה","time":"2h"}]`,
      ""
    );
    try{
      const m=r.match(/\[.*?\]/s);
      if(m) setUpgradeIdeas(JSON.parse(m[0]));
      else setUpgradeIdeas([{title:"שגיאה",desc:r,impact:"בינוני",time:"?"}]);
    }catch(e){ setUpgradeIdeas([{title:"AI Suggestion",desc:r,impact:"גבוה",time:"3h"}]); }
    setUpgradeLoading(false);
  };

  const getWeekly = async()=>{
    setWeeklyLoading(true); setWeeklyResult(null);
    const r=await callAI("דוח שבועי:\n1. הושג\n2. תקוע\n3. 3 צעדים לשבוע הבא\n4. התראה קריטית\n5. ROI estimate\nקצר.");
    setWeeklyResult(r); setWeeklyLoading(false);
  };

  const doMarket = async()=>{
    if(!marketIdea.trim()) return;
    setMarketLoading(true); setMarketResult(null);
    const r=await callAISearch(`מחקר שוק: "${marketIdea}"\n1.גודל שוק 2.מתחרים 3.USP 4.סיכונים 5.המלצה`);
    setMarketResult(r); setMarketLoading(false);
  };

  const copyPrompt = async(id,text)=>{
    navigator.clipboard.writeText(text).catch(()=>{});
    await sb.from("agent_prompts").update({uses:(prompts.find(p=>p.id===id)?.uses||0)+1}).eq("id",id);
    setPrompts(p=>p.map(x=>x.id===id?{...x,uses:x.uses+1}:x));
    setCopied(id); setTimeout(()=>setCopied(null),1800);
  };

  // ── Helpers ───────────────────────────────────────────────
  const activeProjTasks=tasks.filter(t=>t.project_id===activeProject);
  const openTasks=tasks.filter(t=>t.col!=="הושלם").length;
  const urgentTasks=tasks.filter(t=>t.priority==="דחוף"&&t.col!=="הושלם");

  if(loading) return(
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,direction:"rtl"}}>
      <style>{css}</style>
      <div style={{width:36,height:36,border:"2px solid #1a2d45",borderTop:"2px solid var(--accent)",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
      <div style={{color:"var(--text3)",fontSize:"13px",fontFamily:"JetBrains Mono,monospace"}}>טוען v7...</div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <style>{css}</style>

      {/* ── Topbar ── */}
      <div className="topbar">
        <div className="logo">
          <div className="logo-icon">⬡</div>
          <div>
            <div className="logo-title">Agent OS v7</div>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <div className="live-dot" style={{background:syncStatus.includes("מסונכרן")?"var(--green)":"var(--yellow)"}}/>
              <span className="logo-sub">{syncStatus}</span>
              {sfStats&&<><span className="logo-sub" style={{color:"#1a3d6e"}}>|</span><div className="live-dot" style={{background:"var(--sf)"}}/><span className="logo-sub" style={{color:"var(--sf)"}}>{sfStats.leadsFound}L</span></>}
            </div>
          </div>
        </div>
        <div className="tabs-scroll">
          {TABS_MAIN.map(t=>(
            <button key={t} className={`tab ${t==="📡"?"sf-tab":""} ${t==="🧠"?"agent-tab":""} ${tab===t?"on":""}`} onClick={()=>setTab(t)}>
              {t} {TAB_NAMES[t]}
            </button>
          ))}
        </div>
        {sfStats&&<div style={{display:"flex",gap:6,marginRight:12,flexShrink:0}} className="hide-mobile">
          <div className="stat" style={{padding:"5px 10px"}}>
            <div className="stat-val" style={{fontSize:"15px",color:"var(--sf)"}}>{sfStats.leadsFound??"-"}</div>
            <div className="stat-label">לידים</div>
          </div>
          <div className="stat" style={{padding:"5px 10px",borderColor:sfStats.emailSendingEnabled?"#0a3d20":"#3d0a0a"}}>
            <div className="stat-val" style={{fontSize:"13px",color:sfStats.emailSendingEnabled?"var(--green)":"var(--red)"}}>
              {sfStats.emailSendingEnabled?"📧 ON":"📧 OFF"}
            </div>
            <div className="stat-label">{sfStats.emailsSentToday??0} היום</div>
          </div>
        </div>}
      </div>

      <div className="main-content" style={{padding:"16px 20px",maxWidth:1200,margin:"0 auto"}}>

        {/* ════ פיקוד ════ */}
        {tab==="🏠"&&(
          <div className="fade-in">
            {sfError&&<div style={{padding:"10px 16px",background:"#120404",border:"1px solid #3d0a0a",borderRadius:10,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:"13px",color:"#fca5a5"}}>⚠️ {sfError}</span>
              <button className="btn btn-s" onClick={()=>fetchSF()}>🔄 נסה</button>
            </div>}

            {sfStats&&<div className="highlight fade-in" style={{marginBottom:12,borderColor:"#0a3d20"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div className="live-dot" style={{background:"var(--sf)"}}/>
                  <span style={{fontSize:"14px",fontWeight:700,color:"var(--sf)",fontFamily:"Syne,sans-serif"}}>SignalForge Live</span>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <span style={{fontSize:"10px",color:"var(--text3)"}}>{sfLastFetch?.toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"})}</span>
                  <button className="btn-icon" onClick={()=>fetchSF()}>🔄</button>
                  <button className="btn btn-s" style={{fontSize:"11px"}} onClick={()=>setTab("📡")}>→ SF</button>
                </div>
              </div>
              <div className="grid-3" style={{gridTemplateColumns:"repeat(5,1fr)"}}>
                {[
                  {l:"לידים",v:sfStats.leadsFound,c:"var(--sf)"},
                  {l:"מיילים היום",v:sfStats.emailsSentToday??0,c:"var(--yellow)"},
                  {l:"שליחה",v:sfStats.emailSendingEnabled?"ON":"OFF",c:sfStats.emailSendingEnabled?"var(--green)":"var(--red)"},
                  {l:"DB",v:sfStats.dbConnected?"✅":"❌",c:sfStats.dbConnected?"var(--green)":"var(--red)"},
                  {l:"Agent",v:"🟢",c:"var(--green)"},
                ].map(({l,v,c})=>(
                  <div key={l} className="stat"><div className="stat-val" style={{color:c}}>{v}</div><div className="stat-label">{l}</div></div>
                ))}
              </div>
            </div>}

            <div className="grid-2" style={{marginBottom:12}}>
              <div className="card" style={{borderTop:"2px solid var(--accent)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <span style={{fontSize:"14px",fontWeight:700,color:"var(--accent)"}}>📊 דוח שבועי AI</span>
                  <button className="btn btn-p" onClick={getWeekly} disabled={weeklyLoading} style={{fontSize:"12px",padding:"6px 14px"}}>{weeklyLoading?"...":"✨ צור"}</button>
                </div>
                {weeklyLoading&&<div style={{color:"var(--text3)",fontSize:"13px",animation:"pulse 1s infinite"}}>מנתח...</div>}
                {weeklyResult?<div style={{fontSize:"12.5px",lineHeight:1.7,color:"#8ba3bf",whiteSpace:"pre-wrap",maxHeight:160,overflowY:"auto"}}>{weeklyResult}</div>:<div style={{fontSize:"12px",color:"var(--text3)"}}>לחץ לניתוח מלא</div>}
              </div>
              <div className="card" style={{borderTop:"2px solid var(--red)"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                  <span style={{fontSize:"14px",fontWeight:700,color:"#fca5a5"}}>🔥 דחוף עכשיו</span>
                  <span style={{fontSize:"12px",color:"var(--red)",fontWeight:700}}>{urgentTasks.length}</span>
                </div>
                {urgentTasks.slice(0,4).map(t=>(
                  <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid var(--border)"}}>
                    <div>
                      <div style={{fontSize:"13px",fontWeight:600}}>{t.title}</div>
                      <div style={{fontSize:"11px",color:"var(--text3)"}}>{projects.find(p=>p.id===t.project_id)?.name}</div>
                    </div>
                    <button className="btn btn-s" style={{fontSize:"11px"}} onClick={()=>moveTask(t.id,"הושלם")}>✓</button>
                  </div>
                ))}
                {urgentTasks.length===0&&<div style={{color:"var(--green)",fontSize:"13px"}}>נקי ✓</div>}
              </div>
            </div>

            <div className="card" style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <span style={{fontSize:"14px",fontWeight:700,color:"var(--accent)"}}>⚡ פרויקטים פעילים</span>
                <div style={{display:"flex",gap:6}}>
                  <button className="btn btn-g" style={{fontSize:"11px"}} onClick={()=>setTab("🎯")}>🎯 Pipeline חדש</button>
                  <button className="btn btn-p" style={{fontSize:"11px"}} onClick={()=>setModals(m=>({...m,proj:true}))}>+ פרויקט</button>
                </div>
              </div>
              <div className="grid-auto">
                {projects.filter(p=>!["הושלם","מושהה"].includes(p.stage)).map(p=>(
                  <div key={p.id} className="card-sm" style={{borderRight:`3px solid ${STAGE_COL[p.stage]}`,cursor:"pointer"}} onClick={()=>{setActiveProject(p.id);setTab("✅");}}>
                    <div style={{fontSize:"13px",fontWeight:700,marginBottom:5}}>{p.name}</div>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontSize:"11px",color:STAGE_COL[p.stage],fontWeight:700}}>{p.stage}</span>
                      <span style={{fontSize:"11px",color:"var(--text3)"}}>{tasks.filter(t=>t.project_id===p.id&&t.col!=="הושלם").length} פתוח</span>
                    </div>
                    <div className="progress" style={{marginTop:8}}>
                      <div className="progress-fill" style={{width:`${(tasks.filter(t=>t.project_id===p.id&&t.col==="הושלם").length/Math.max(1,tasks.filter(t=>t.project_id===p.id).length))*100}%`,background:STAGE_COL[p.stage]}}/>
                    </div>
                  </div>
                ))}
                <div className="card-sm" style={{cursor:"pointer",border:"1px dashed var(--border)",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:5,minHeight:80}} onClick={()=>setTab("🎯")}>
                  <span style={{fontSize:"20px"}}>🎯</span>
                  <span style={{fontSize:"12px",color:"var(--text3)"}}>Pipeline חדש</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <span style={{fontSize:"14px",fontWeight:700}}>⬡ שאל את הסוכן</span>
              </div>
              <div style={{display:"flex",gap:5,marginBottom:8,flexWrap:"wrap"}}>
                {["מה הסטטוס?","הרץ pipeline ל-SignalForge v2","צור פרויקט חדש: Travel Affiliate","מה הצעד הבא?"].map((q,i)=>(
                  <button key={i} style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:"6px 11px",color:"var(--text3)",cursor:"pointer",fontSize:"12px",fontFamily:"Noto Sans Hebrew,sans-serif",transition:"all .2s"}} onClick={()=>{setChatInput(q);setTab("🧠");}}>{q}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════ Pipeline ════ */}
        {tab==="🎯"&&(
          <div className="fade-in">
            <div className="highlight" style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <h2 style={{fontSize:"16px",fontWeight:800,color:"#c7d8f0",fontFamily:"Syne,sans-serif"}}>🎯 Pipeline — מגיבוש לתפעול</h2>
                <button className="btn btn-p" style={{fontSize:"12px"}} disabled={!pipelineProject} onClick={()=>runOrchestrator(pipelineProject)}>🤖 Orchestrate הכל</button>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input className="inp" style={{flex:1}} placeholder="שם הפרויקט שאתה בונה..." value={pipelineProject} onChange={e=>setPipelineProject(e.target.value)}/>
                {pipelineProject&&<span style={{color:"var(--green)",fontSize:"13px",flexShrink:0}}>✓ {pipelineProject}</span>}
              </div>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {PIPELINE_STAGES.map((stage,idx)=>(
                <div key={stage.id}>
                  <div className={`pipe-stage ${activePipeStage===idx?"active":""}`}
                    style={{borderColor:activePipeStage===idx?stage.color:"var(--border)",cursor:"pointer"}}
                    onClick={()=>setActivePipeStage(idx)}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:"22px"}}>{stage.icon}</span>
                        <div>
                          <div style={{fontSize:"14px",fontWeight:700,color:activePipeStage===idx?stage.color:undefined}}>{stage.name}</div>
                          <div style={{display:"flex",gap:5,marginTop:3,flexWrap:"wrap"}}>
                            {stage.agents.map(a=>(
                              <span key={a} style={{fontSize:"10px",background:AGENT_ROLES[a]?`${AGENT_ROLES[a].color}20`:"var(--bg3)",color:AGENT_ROLES[a]?.color||"var(--text3)",padding:"2px 7px",borderRadius:10,border:`1px solid ${AGENT_ROLES[a]?.color||"var(--border)"}30`}}>
                                {AGENT_ROLES[a]?.icon||"🤖"} {a}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        {pipeResults[idx]&&<span style={{fontSize:"11px",color:"var(--green)"}}>✓ הושלם</span>}
                        <button className="btn btn-p" style={{fontSize:"12px",padding:"7px 16px",background:stage.color+"33",color:stage.color,border:`1px solid ${stage.color}50`}}
                          disabled={!pipelineProject||pipeRunning===idx}
                          onClick={e=>{e.stopPropagation();runPipeStage(idx);}}>
                          {pipeRunning===idx?"⚡ רץ...":"▶ הרץ שלב"}
                        </button>
                      </div>
                    </div>

                    {activePipeStage===idx&&(
                      <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${stage.color}30`}} onClick={e=>e.stopPropagation()}>
                        <div className="grid-2">
                          <div>
                            <div style={{fontSize:"12px",color:"var(--text3)",marginBottom:6,fontWeight:600}}>תוצרים צפויים:</div>
                            {stage.outputs.map(o=>(
                              <div key={o} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0",fontSize:"12px"}}>
                                <div style={{width:5,height:5,borderRadius:"50%",background:stage.color,flexShrink:0}}/>
                                {o}
                              </div>
                            ))}
                          </div>
                          {pipeResults[idx]&&(
                            <div>
                              <div style={{fontSize:"12px",color:"var(--text3)",marginBottom:6,fontWeight:600}}>תוצאות AI:</div>
                              {pipeResults[idx].map((r,i)=>(
                                <div key={i} style={{marginBottom:8}}>
                                  <div style={{fontSize:"11px",color:AGENT_ROLES[r.agent]?.color||"var(--accent)",fontWeight:700,marginBottom:3}}>{AGENT_ROLES[r.agent]?.icon} {r.agent}</div>
                                  <div style={{fontSize:"12px",color:"var(--text2)",lineHeight:1.5,background:"var(--bg3)",padding:"8px 10px",borderRadius:7,maxHeight:80,overflowY:"auto"}}>{r.result}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {pipeRunning===idx&&<div style={{display:"flex",alignItems:"center",gap:8,color:"var(--accent)",fontSize:"13px",animation:"pulse 1s infinite"}}><div style={{width:14,height:14,border:"2px solid var(--accent)",borderTop:"2px solid transparent",borderRadius:"50%",animation:"spin 1s linear infinite"}}/> מריץ agents...</div>}
                        </div>
                      </div>
                    )}
                  </div>
                  {idx<PIPELINE_STAGES.length-1&&<div className="pipe-connector"/>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ Orchestrator ════ */}
        {tab==="🤖"&&(
          <div className="fade-in">
            <div className="highlight" style={{marginBottom:14}}>
              <h2 style={{fontSize:"16px",fontWeight:800,color:"#c7d8f0",fontFamily:"Syne,sans-serif",marginBottom:6}}>🤖 Orchestrator — תזמור Multi-Agent</h2>
              <p style={{fontSize:"12px",color:"var(--text3)",marginBottom:12}}>הגדר מטרה — מערכת האוכן תבחר ותריץ אוטומטית את ה-agents המתאימים</p>
              <div style={{display:"flex",gap:8}}>
                <input className="inp" style={{flex:1}} placeholder="מה המטרה? לדוגמה: 'בנה מודול travel ל-SignalForge'" value={activeOrchSession||""} onChange={e=>setActiveOrchSession(e.target.value)}/>
                <button className="btn btn-p" disabled={!activeOrchSession||orchRunning} onClick={()=>runOrchestrator(activeOrchSession)}>
                  {orchRunning?<><span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>⚙️</span> רץ...</>:"⚡ הפעל"}
                </button>
              </div>
              <div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>
                {["SignalForge Travel Module","TCG PSA Calculator","Landing Page לקריפטו","n8n workflow לאפיליאציה"].map((s,i)=>(
                  <button key={i} style={{background:"var(--bg4)",border:"1px solid var(--border)",borderRadius:7,padding:"5px 10px",color:"var(--text3)",cursor:"pointer",fontSize:"11px",fontFamily:"Noto Sans Hebrew,sans-serif"}} onClick={()=>setActiveOrchSession(s)}>{s}</button>
                ))}
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:14}}>
              <div>
                <div style={{fontSize:"12px",color:"var(--text3)",fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Agents</div>
                {Object.entries(AGENT_ROLES).map(([name,info])=>(
                  <div key={name} className="card-sm" style={{marginBottom:6,borderRight:`3px solid ${info.color}`}}>
                    <div style={{fontSize:"14px"}}>{info.icon}</div>
                    <div style={{fontSize:"12px",fontWeight:700,marginTop:3}}>{name}</div>
                    <div style={{fontSize:"10px",color:"var(--text3)",lineHeight:1.4}}>{info.specialty}</div>
                    <div style={{marginTop:5}}>
                      <div className="live-dot" style={{background:orchRunning?"var(--yellow)":"var(--border)",display:"inline-block"}}/>
                      <span style={{fontSize:"10px",color:"var(--text3)",marginRight:4}}>{orchRunning?"פעיל":"מוכן"}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card" style={{minHeight:400}}>
                <div style={{fontSize:"12px",color:"var(--text3)",fontWeight:700,marginBottom:12,display:"flex",justifyContent:"space-between"}}>
                  <span>לוג הרצה</span>
                  {orchLogs.length>0&&<button className="btn-icon" onClick={()=>setOrchLogs([])}>✕ נקה</button>}
                </div>
                {orchLogs.length===0&&!orchRunning&&(
                  <div style={{textAlign:"center",padding:40,color:"var(--text3)"}}>
                    <div style={{fontSize:"30px",marginBottom:8}}>🤖</div>
                    <div style={{fontSize:"13px"}}>הגדר מטרה למעלה ולחץ הפעל</div>
                  </div>
                )}
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {orchLogs.map((log,i)=>(
                    <div key={i} className="slide-in" style={{background:log.type==="action"?"#051a0f":log.done?"var(--bg3)":"var(--bg4)",border:`1px solid ${log.type==="action"?"#0a3d20":log.color||"var(--border)"}`,borderRadius:10,padding:12}}>
                      {log.type!=="action"&&(
                        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:log.done?8:0}}>
                          {!log.done&&<div style={{width:12,height:12,border:`2px solid ${log.color}`,borderTop:"2px solid transparent",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>}
                          {log.done&&<div style={{width:14,height:14,borderRadius:"50%",background:`${log.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px"}}>✓</div>}
                          <span style={{fontSize:"13px",fontWeight:700,color:log.color}}>{log.icon} {log.role}</span>
                        </div>
                      )}
                      {log.type==="action"&&<span style={{fontSize:"13px",color:"var(--green)"}}>{log.text}</span>}
                      {log.done&&log.text&&<div style={{fontSize:"12.5px",color:"var(--text2)",lineHeight:1.7,paddingRight:6}}>{log.text}</div>}
                    </div>
                  ))}
                  {orchRunning&&<div style={{fontSize:"13px",color:"var(--accent)",animation:"pulse 1s infinite",padding:8}}>⚡ מריץ agents...</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════ SignalForge ════ */}
        {tab==="📡"&&(
          <div className="fade-in">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h2 style={{fontSize:"16px",fontWeight:700,color:"var(--sf)",fontFamily:"Syne,sans-serif"}}>📡 SignalForge Control</h2>
              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-s" onClick={()=>fetchSF()}>🔄 רענן</button>
                <a href={SF_URL+"/dashboard"} target="_blank" rel="noreferrer"><button className="btn btn-sf">→ Dashboard</button></a>
              </div>
            </div>
            {sfError&&<div style={{padding:12,background:"#120404",border:"1px solid #3d0a0a",borderRadius:10,marginBottom:12,fontSize:"13px",color:"#fca5a5"}}>⚠️ {sfError}</div>}
            {sfStats&&<div className="card" style={{marginBottom:14,borderTop:"2px solid var(--sf)"}}>
              <div className="grid-3" style={{gridTemplateColumns:"repeat(4,1fr)",marginBottom:12}}>
                {[{l:"לידים",v:sfStats.leadsFound,c:"var(--sf)"},{l:"מיילים היום",v:sfStats.emailsSentToday??0,c:"var(--yellow)"},{l:"שליחה",v:sfStats.emailSendingEnabled?"🟢 פעיל":"🔴 כבוי",c:sfStats.emailSendingEnabled?"var(--green)":"var(--red)"},{l:"DB",v:sfStats.dbConnected?"✅":"❌",c:sfStats.dbConnected?"var(--green)":"var(--red)"}].map(({l,v,c})=>(
                  <div key={l} className="stat"><div className="stat-val" style={{color:c}}>{v}</div><div className="stat-label">{l}</div></div>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-green" style={{flex:1}} onClick={()=>{ navigator.clipboard.writeText('Add Secret: EMAIL_SENDING_ENABLED = "true". Republish.'); alert('הועתק לClipboard — הדבק ב-Replit Agent'); }}>🟢 הפעל אימיילים</button>
                <button className="btn btn-red" style={{flex:1}} onClick={()=>{ navigator.clipboard.writeText('Remove/disable EMAIL_SENDING_ENABLED secret. Republish.'); alert('הועתק!'); }}>🔴 השהה</button>
                <button className="btn btn-d" style={{flex:1}} onClick={()=>{ navigator.clipboard.writeText('URGENT: Add middleware before Mastra: GET / → return 200 "OK". npx tsc --noEmit → 0 errors → Republish.'); alert('תיקון deploy הועתק!'); }}>🚀 תיקון Deploy</button>
              </div>
            </div>}
            <div className="card">
              <h3 style={{fontSize:"14px",fontWeight:700,marginBottom:10}}>✅ משימות SignalForge</h3>
              {tasks.filter(t=>{const sf=projects.find(p=>p.name?.includes("SignalForge"));return sf&&t.project_id===sf.id&&t.col!=="הושלם";}).map(task=>(
                <div key={task.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                  <div><div style={{fontSize:"13px",fontWeight:600}}>{task.title}</div><div style={{fontSize:"11px",color:"var(--text3)"}}>{task.description}</div></div>
                  <div style={{display:"flex",gap:6}}>
                    <span style={{padding:"2px 8px",borderRadius:4,fontSize:"11px",background:`${PCOL[task.priority]}20`,color:PCOL[task.priority]}}>{task.priority}</span>
                    <button className="btn btn-s" onClick={()=>moveTask(task.id,"הושלם")}>✓</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ פרויקטים ════ */}
        {tab==="📋"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {STAGES.map(s=>{const n=projects.filter(p=>p.stage===s).length;return n>0?(
                  <div key={s} style={{padding:"5px 10px",borderRadius:8,background:`${STAGE_COL[s]}15`,border:`1px solid ${STAGE_COL[s]}40`,textAlign:"center"}}>
                    <div style={{fontSize:"14px",fontWeight:700,color:STAGE_COL[s]}}>{n}</div>
                    <div style={{fontSize:"9px",color:"var(--text3)"}}>{s}</div>
                  </div>
                ):null;})}
              </div>
              <button className="btn btn-p" onClick={()=>setModals(m=>({...m,proj:true}))}>+ פרויקט</button>
            </div>
            {projects.map(p=>(
              <div key={p.id} className="card" style={{borderRight:`3px solid ${STAGE_COL[p.stage]}`,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                      <h3 style={{fontSize:"14px",fontWeight:700}}>{p.name}</h3>
                      <span style={{padding:"2px 8px",borderRadius:4,fontSize:"11px",background:p.type==="רווח"?"#2d1d00":"#0c1e3a",color:p.type==="רווח"?"#fbbf24":"#60a5fa"}}>{p.type}</span>
                    </div>
                    <p style={{fontSize:"12px",color:"var(--text3)",marginBottom:6}}>{p.description}</p>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {p.tags?.map(t=><span key={t} className="tag">{t}</span>)}
                      <span style={{fontSize:"11px",color:"var(--text3)"}}>{tasks.filter(t=>t.project_id===p.id&&t.col!=="הושלם").length} פתוח</span>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:5,alignItems:"flex-end",flexShrink:0,marginRight:12}}>
                    <span style={{padding:"3px 10px",borderRadius:20,fontSize:"11px",fontWeight:700,background:`${STAGE_COL[p.stage]}1a`,color:STAGE_COL[p.stage]}}>{p.stage}</span>
                    <select className="sel" style={{fontSize:"11px",padding:"3px 6px"}} value={p.stage} onChange={e=>updateProjStage(p.id,e.target.value)}>{STAGES.map(s=><option key={s}>{s}</option>)}</select>
                    <button className="btn btn-s" onClick={()=>{setActiveProject(p.id);setTab("✅");}}>📋 משימות</button>
                    <button className="btn btn-d" onClick={()=>del("agent_projects",p.id,setProjects,projects)}>מחק</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ════ משימות ════ */}
        {tab==="✅"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <select className="sel" value={activeProject||""} onChange={e=>setActiveProject(Number(e.target.value))}>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
              <button className="btn btn-p" onClick={()=>setModals(m=>({...m,task:true}))}>+ משימה</button>
            </div>
            <div className="grid-3">
              {KANBAN.map(col=>(
                <div key={col}>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"8px 10px",background:col==="לביצוע"?"#0d0f2a":col==="בתהליך"?"#1a1205":"#051a0f",borderRadius:"10px 10px 0 0",border:`1px solid ${col==="לביצוע"?"#2a2070":col==="בתהליך"?"#4a3000":"#0a3d20"}`,borderBottom:"none"}}>
                    <span style={{fontSize:"13px",fontWeight:700,color:col==="לביצוע"?"#818cf8":col==="בתהליך"?"#f59e0b":"#22c55e"}}>{col}</span>
                    <span style={{fontSize:"11px",color:"var(--text3)",background:"var(--bg3)",padding:"2px 8px",borderRadius:10}}>{activeProjTasks.filter(t=>t.col===col).length}</span>
                  </div>
                  <div style={{minHeight:180,background:"var(--bg3)",border:`1px solid ${col==="לביצוע"?"#2a2070":col==="בתהליך"?"#4a3000":"#0a3d20"}`,borderTop:"none",borderRadius:"0 0 10px 10px",padding:8}}>
                    {activeProjTasks.filter(t=>t.col===col).map(task=>(
                      <div key={task.id} className="kcard">
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                          <span style={{fontSize:"12px",fontWeight:600,flex:1}}>{task.title}</span>
                          <span style={{fontSize:"10px",padding:"2px 6px",borderRadius:4,background:`${PCOL[task.priority]}20`,color:PCOL[task.priority],flexShrink:0}}>{task.priority}</span>
                        </div>
                        {task.description&&<p style={{fontSize:"11px",color:"var(--text3)",marginBottom:6,lineHeight:1.4}}>{task.description}</p>}
                        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:5}}>
                          {task.tags?.slice(0,2).map(t=><span key={t} className="tag">{t}</span>)}
                          {task.due_date&&<span style={{fontSize:"10px",color:"var(--text3)",marginRight:"auto"}}>⏰{task.due_date}</span>}
                        </div>
                        <div style={{display:"flex",gap:4}}>
                          {KANBAN.filter(c=>c!==col).map(c=>(
                            <button key={c} className="btn btn-s" style={{fontSize:"10px",flex:1,padding:"3px 4px"}} onClick={()=>moveTask(task.id,c)}>→{c}</button>
                          ))}
                          <button className="btn btn-d" style={{fontSize:"10px",padding:"3px 6px"}} onClick={()=>del("agent_tasks",task.id,setTasks,tasks)}>✕</button>
                        </div>
                      </div>
                    ))}
                    {activeProjTasks.filter(t=>t.col===col).length===0&&<div style={{textAlign:"center",padding:20,color:"var(--text3)",fontSize:"12px"}}>ריק</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ Analytics ════ */}
        {tab==="📊"&&(
          <div className="fade-in">
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
              <h2 style={{fontSize:"16px",fontWeight:700,fontFamily:"Syne,sans-serif"}}>📊 Analytics & ROI</h2>
            </div>

            <div className="grid-3" style={{marginBottom:14}}>
              {[
                {l:"פרויקטים פעילים",v:projects.filter(p=>!["הושלם","מושהה"].includes(p.stage)).length,c:"var(--accent)",icon:"📋"},
                {l:"משימות פתוחות",v:openTasks,c:"var(--yellow)",icon:"✅"},
                {l:"משימות דחופות",v:urgentTasks.length,c:"var(--red)",icon:"🔥"},
                {l:"ידע נצבר",v:knowledge.length,c:"var(--purple)",icon:"📚"},
                {l:"פרומפטים",v:prompts.length,c:"var(--sf)",icon:"💡"},
                {l:"כלים פעילים",v:tools.filter(t=>t.status==="פעיל").length,c:"var(--green)",icon:"🔧"},
              ].map(({l,v,c,icon})=>(
                <div key={l} className="stat card">
                  <div style={{fontSize:"20px",marginBottom:5}}>{icon}</div>
                  <div className="stat-val" style={{color:c,fontSize:"28px"}}>{v}</div>
                  <div className="stat-label" style={{fontSize:"12px"}}>{l}</div>
                </div>
              ))}
            </div>

            <div className="grid-2" style={{marginBottom:14}}>
              <div className="card">
                <h3 style={{fontSize:"14px",fontWeight:700,marginBottom:12}}>📈 התקדמות פרויקטים</h3>
                {projects.map(p=>{
                  const total=tasks.filter(t=>t.project_id===p.id).length;
                  const done=tasks.filter(t=>t.project_id===p.id&&t.col==="הושלם").length;
                  const pct=total>0?Math.round((done/total)*100):0;
                  return(
                    <div key={p.id} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",marginBottom:4}}>
                        <span>{p.name}</span>
                        <span style={{color:STAGE_COL[p.stage],fontFamily:"JetBrains Mono,monospace"}}>{pct}%</span>
                      </div>
                      <div className="progress">
                        <div className="progress-fill" style={{width:`${pct}%`,background:STAGE_COL[p.stage]}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="card">
                <h3 style={{fontSize:"14px",fontWeight:700,marginBottom:12}}>🔥 עומס משימות לפי פרויקט</h3>
                {projects.filter(p=>!["הושלם","מושהה"].includes(p.stage)).map(p=>{
                  const open=tasks.filter(t=>t.project_id===p.id&&t.col!=="הושלם").length;
                  const urgent=tasks.filter(t=>t.project_id===p.id&&t.priority==="דחוף"&&t.col!=="הושלם").length;
                  return(
                    <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                      <div>
                        <div style={{fontSize:"13px",fontWeight:600}}>{p.name}</div>
                        <div style={{fontSize:"11px",color:"var(--text3)"}}>{open} פתוח</div>
                      </div>
                      <div style={{display:"flex",gap:5}}>
                        {urgent>0&&<span style={{fontSize:"12px",background:"#2d0505",color:"#f87171",padding:"2px 8px",borderRadius:4,fontWeight:700}}>{urgent} דחוף</span>}
                        <button className="btn btn-s" style={{fontSize:"11px"}} onClick={()=>{setActiveProject(p.id);setTab("✅");}}>→</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card">
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                <h3 style={{fontSize:"14px",fontWeight:700}}>🔍 מחקר שוק</h3>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                <input className="inp" style={{flex:1}} placeholder="רעיון לניתוח..." value={marketIdea} onChange={e=>setMarketIdea(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doMarket()}/>
                <button className="btn btn-p" onClick={doMarket} disabled={marketLoading||!marketIdea.trim()}>{marketLoading?"...":"🔍"}</button>
              </div>
              {marketLoading&&<div style={{color:"var(--accent)",fontSize:"13px",animation:"pulse 1s infinite"}}>גולש ומנתח...</div>}
              {marketResult&&<div style={{fontSize:"12.5px",lineHeight:1.8,color:"var(--text2)",whiteSpace:"pre-wrap",background:"var(--bg3)",padding:12,borderRadius:8,maxHeight:300,overflowY:"auto"}}>{marketResult}</div>}
            </div>
          </div>
        )}

        {/* ════ Lab ════ */}
        {tab==="🔬"&&(
          <div className="fade-in">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div>
                <div className="card" style={{marginBottom:12,borderTop:"2px solid var(--purple)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <h3 style={{fontSize:"14px",fontWeight:700,color:"var(--purple)"}}>⚡ Self-Upgrade Engine</h3>
                    <button className="btn btn-p" style={{fontSize:"12px",background:"#2a1a5e",color:"var(--purple)"}} disabled={upgradeLoading} onClick={genUpgrades}>{upgradeLoading?"...":"🧠 נתח"}</button>
                  </div>
                  {upgradeLoading&&<div style={{color:"var(--purple)",fontSize:"13px",animation:"pulse 1s infinite"}}>מנתח את עצמי...</div>}
                  {upgradeIdeas.map((u,i)=>(
                    <div key={i} className="upgrade-item">
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:"13px",fontWeight:700}}>{u.title}</span>
                        <div style={{display:"flex",gap:5}}>
                          <span style={{fontSize:"10px",background:u.impact==="גבוה"?"#1a0d3a":"var(--bg3)",color:u.impact==="גבוה"?"var(--purple)":"var(--text3)",padding:"2px 7px",borderRadius:10}}>{u.impact}</span>
                          <span style={{fontSize:"10px",color:"var(--text3)"}}>{u.time}</span>
                        </div>
                      </div>
                      <p style={{fontSize:"12px",color:"var(--text3)",lineHeight:1.5}}>{u.desc}</p>
                      <button className="btn btn-s" style={{fontSize:"11px",marginTop:6}} onClick={()=>{setChatInput(`פתח שדרוג: ${u.title}`);setTab("🧠");}}>→ פתח ב-Agent</button>
                    </div>
                  ))}
                  {upgradeIdeas.length===0&&!upgradeLoading&&<div style={{color:"var(--text3)",fontSize:"12px"}}>לחץ "נתח" לקבלת הצעות שדרוג</div>}
                </div>

                <div className="card">
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                    <h3 style={{fontSize:"14px",fontWeight:700,color:"var(--yellow)"}}>📚 ידע נצבר</h3>
                    <button className="btn btn-p" style={{fontSize:"11px"}} onClick={()=>setModals(m=>({...m,know:true}))}>+ הוסף</button>
                  </div>
                  {knowledge.slice(0,6).map(k=>(
                    <div key={k.id} style={{padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                      <div style={{display:"flex",gap:6,marginBottom:3}}>
                        <span style={{fontSize:"10px",background:k.type==="הצלחה"?"#052e16":k.type==="שגיאה"?"#1a0505":"#1e1b4b",color:k.type==="הצלחה"?"var(--green)":k.type==="שגיאה"?"var(--red)":"var(--purple)",padding:"2px 7px",borderRadius:4}}>{k.type}</span>
                        <span style={{fontSize:"12px",fontWeight:600}}>{k.title}</span>
                      </div>
                      <p style={{fontSize:"11px",color:"var(--text3)",lineHeight:1.4}}>{k.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="card" style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                    <h3 style={{fontSize:"14px",fontWeight:700,color:"var(--accent)"}}>💡 פרומפטים</h3>
                    <button className="btn btn-p" style={{fontSize:"11px"}} onClick={()=>setModals(m=>({...m,prompt:true}))}>+ הוסף</button>
                  </div>
                  {prompts.map(p=>(
                    <div key={p.id} style={{background:"var(--bg3)",borderRadius:10,padding:10,marginBottom:8,border:"1px solid var(--border)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                        <span style={{fontSize:"13px",fontWeight:700}}>{p.title}</span>
                        <button className="btn btn-s" style={{fontSize:"11px",background:copied===p.id?"#052e16":"",color:copied===p.id?"var(--green)":""}} onClick={()=>copyPrompt(p.id,p.prompt)}>{copied===p.id?"✓":"📋"}</button>
                      </div>
                      <div style={{fontSize:"11px",color:"var(--text3)",fontFamily:"JetBrains Mono,monospace",lineHeight:1.5,maxHeight:50,overflow:"hidden"}}>{p.prompt?.substring(0,100)}...</div>
                      <div style={{fontSize:"10px",color:"var(--text3)",marginTop:5}}>× {p.uses} | ★ {p.rating}</div>
                    </div>
                  ))}
                </div>

                <div className="card">
                  <h3 style={{fontSize:"14px",fontWeight:700,marginBottom:10}}>🔧 כלים</h3>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {tools.map(t=>(
                      <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <span style={{fontSize:"18px"}}>{t.logo}</span>
                          <div>
                            <div style={{fontSize:"13px",fontWeight:600}}>{t.name}</div>
                            <div style={{fontSize:"11px",color:"var(--text3)"}}>{t.pricing}</div>
                          </div>
                        </div>
                        <div style={{display:"flex",gap:6,alignItems:"center"}}>
                          <span style={{fontSize:"13px",fontWeight:700,color:t.my_rating>=9?"var(--green)":t.my_rating>=7?"var(--yellow)":"var(--red)",fontFamily:"JetBrains Mono,monospace"}}>{t.my_rating}/10</span>
                          <a href={t.url} target="_blank" rel="noreferrer"><button className="btn btn-s" style={{fontSize:"11px"}}>→</button></a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════ Agent HQ ════ */}
        {tab==="🧠"&&(
          <div className="fade-in" style={{display:"flex",flexDirection:"column",height:"calc(100vh - 200px)",minHeight:450}}>
            <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
              <div style={{flex:1,padding:"8px 12px",background:"var(--bg3)",borderRadius:8,border:"1px solid var(--border)",fontSize:"12px",color:"var(--text3)"}}>
                <span style={{color:"var(--purple)"}}>⬡ Agent HQ</span> — אוטונומי, מחובר ל-Supabase, SF{sfStats?`, ${sfStats.leadsFound} לידים`:""}. יכול לצור פרויקטים, משימות, להריץ pipelines.
              </div>
              <button className="btn btn-s" style={{fontSize:"11px",flexShrink:0}} onClick={()=>setTab("🤖")}>→ Orchestrator</button>
            </div>
            
            <div style={{display:"flex",gap:5,marginBottom:8,overflowX:"auto",paddingBottom:2}}>
              {[
                "מה הסטטוס של כל הפרויקטים?",
                "הרץ pipeline לפרויקט חדש: Travel Affiliate",
                "צור פרויקט: SignalForge v2 — ערוצי שיווק",
                "הוסף משימה דחופה ל-TCG: חישוב Landed Cost",
                "מה הצעד הבא ב-SignalForge?",
                "שדרג את עצמך — הצע שיפורים",
              ].map((q,i)=>(
                <button key={i} style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:"6px 11px",color:"var(--text3)",cursor:"pointer",fontSize:"11px",fontFamily:"Noto Sans Hebrew,sans-serif",whiteSpace:"nowrap",transition:"all .2s",flexShrink:0}} onClick={()=>setChatInput(q)}>{q}</button>
              ))}
            </div>

            <div className="chat-wrap">
              {msgs.map((m,i)=>(
                <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-start":"flex-end"}}>
                  <div className={`cmsg ${m.role==="user"?"msg-u":m.role==="action"?"msg-action":"msg-a"}`}>
                    {m.role==="action"&&<span style={{fontSize:"11px",color:"var(--green)",fontFamily:"JetBrains Mono,monospace",display:"block",marginBottom:2}}>⚡ פעולה בוצעה</span>}
                    {m.content}
                  </div>
                </div>
              ))}
              {chatLoading&&(
                <div style={{display:"flex",justifyContent:"flex-end"}}>
                  <div className="cmsg msg-a" style={{display:"flex",gap:4,alignItems:"center"}}>
                    {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"var(--accent)",animation:`typing 1s ${i*0.2}s infinite`}}/>)}
                  </div>
                </div>
              )}
              <div ref={chatEnd}/>
            </div>

            <div style={{display:"flex",gap:8,marginTop:8}}>
              <input className="inp" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendChat()} placeholder="שאל, צווה, תכנן... (Enter שולח)"/>
              <button className="btn btn-p" onClick={sendChat} disabled={chatLoading} style={{flexShrink:0,padding:"9px 22px",fontFamily:"Syne,sans-serif"}}>⬡</button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        {["🏠","🎯","🤖","📡","✅","📊","🧠"].map(t=>(
          <button key={t} className={`mobile-nav-btn ${tab===t?"on":""}`} onClick={()=>setTab(t)}>
            <span>{t}</span>
            <span>{TAB_NAMES[t]}</span>
          </button>
        ))}
      </nav>

      {/* ═══ Modals ═══ */}
      {modals.proj&&<div className="ov" onClick={()=>setModals(m=>({...m,proj:false}))}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h3 style={{marginBottom:14,fontFamily:"Syne,sans-serif"}}>פרויקט חדש</h3>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <input className="inp" placeholder="שם" value={forms.proj.name} onChange={e=>setForms(f=>({...f,proj:{...f.proj,name:e.target.value}}))}/>
          <textarea className="inp" placeholder="תיאור" value={forms.proj.description} onChange={e=>setForms(f=>({...f,proj:{...f.proj,description:e.target.value}}))}/>
          <div style={{display:"flex",gap:8}}>
            <select className="sel" style={{flex:1}} value={forms.proj.type} onChange={e=>setForms(f=>({...f,proj:{...f.proj,type:e.target.value}}))}>
              {["רווח","אישי"].map(t=><option key={t}>{t}</option>)}
            </select>
            <select className="sel" style={{flex:1}} value={forms.proj.stage} onChange={e=>setForms(f=>({...f,proj:{...f.proj,stage:e.target.value}}))}>{STAGES.map(s=><option key={s}>{s}</option>)}</select>
          </div>
          <input className="inp" placeholder="תגיות (פסיק)" value={forms.proj.tags} onChange={e=>setForms(f=>({...f,proj:{...f.proj,tags:e.target.value}}))}/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="btn btn-s" onClick={()=>setModals(m=>({...m,proj:false}))}>ביטול</button>
            <button className="btn btn-p" onClick={()=>addProject()}>+ צור</button>
          </div>
        </div>
      </div></div>}

      {modals.task&&<div className="ov" onClick={()=>setModals(m=>({...m,task:false}))}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h3 style={{marginBottom:14,fontFamily:"Syne,sans-serif"}}>משימה חדשה</h3>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <select className="sel" value={activeProject||""} onChange={e=>setActiveProject(Number(e.target.value))}>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
          <input className="inp" placeholder="שם המשימה" value={forms.task.title} onChange={e=>setForms(f=>({...f,task:{...f.task,title:e.target.value}}))}/>
          <textarea className="inp" placeholder="תיאור" value={forms.task.description} onChange={e=>setForms(f=>({...f,task:{...f.task,description:e.target.value}}))}/>
          <div style={{display:"flex",gap:8}}>
            <select className="sel" style={{flex:1}} value={forms.task.col} onChange={e=>setForms(f=>({...f,task:{...f.task,col:e.target.value}}))}>{KANBAN.map(c=><option key={c}>{c}</option>)}</select>
            <select className="sel" style={{flex:1}} value={forms.task.priority} onChange={e=>setForms(f=>({...f,task:{...f.task,priority:e.target.value}}))}>{PRIORITY.map(p=><option key={p}>{p}</option>)}</select>
          </div>
          <input className="inp" type="date" value={forms.task.due_date} onChange={e=>setForms(f=>({...f,task:{...f.task,due_date:e.target.value}}))}/>
          <input className="inp" placeholder="תגיות (פסיק)" value={forms.task.tags} onChange={e=>setForms(f=>({...f,task:{...f.task,tags:e.target.value}}))}/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="btn btn-s" onClick={()=>setModals(m=>({...m,task:false}))}>ביטול</button>
            <button className="btn btn-p" onClick={()=>addTask()}>+ צור</button>
          </div>
        </div>
      </div></div>}

      {modals.prompt&&<div className="ov" onClick={()=>setModals(m=>({...m,prompt:false}))}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h3 style={{marginBottom:14,fontFamily:"Syne,sans-serif"}}>פרומפט חדש</h3>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <input className="inp" placeholder="שם" value={forms.prompt.title} onChange={e=>setForms(f=>({...f,prompt:{...f.prompt,title:e.target.value}}))}/>
          <select className="sel" value={forms.prompt.category} onChange={e=>setForms(f=>({...f,prompt:{...f.prompt,category:e.target.value}}))}>{PROMPT_CATS.map(c=><option key={c}>{c}</option>)}</select>
          <textarea className="inp" style={{minHeight:100}} placeholder="הפרומפט — [סוגריים] = משתנים" value={forms.prompt.prompt} onChange={e=>setForms(f=>({...f,prompt:{...f.prompt,prompt:e.target.value}}))}/>
          <input className="inp" placeholder="תגיות (פסיק)" value={forms.prompt.tags} onChange={e=>setForms(f=>({...f,prompt:{...f.prompt,tags:e.target.value}}))}/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="btn btn-s" onClick={()=>setModals(m=>({...m,prompt:false}))}>ביטול</button>
            <button className="btn btn-p" onClick={addPrompt}>שמור</button>
          </div>
        </div>
      </div></div>}

      {modals.know&&<div className="ov" onClick={()=>setModals(m=>({...m,know:false}))}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h3 style={{marginBottom:14,fontFamily:"Syne,sans-serif"}}>ידע חדש</h3>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <select className="sel" value={forms.know.type} onChange={e=>setForms(f=>({...f,know:{...f.know,type:e.target.value}}))}>
            {["לקח","הצלחה","שגיאה","ידע טכני","אסטרטגיה"].map(t=><option key={t}>{t}</option>)}
          </select>
          <input className="inp" placeholder="כותרת" value={forms.know.title} onChange={e=>setForms(f=>({...f,know:{...f.know,title:e.target.value}}))}/>
          <textarea className="inp" placeholder="מה למדת?" value={forms.know.content} onChange={e=>setForms(f=>({...f,know:{...f.know,content:e.target.value}}))}/>
          <input className="inp" placeholder="פרויקט" value={forms.know.project} onChange={e=>setForms(f=>({...f,know:{...f.know,project:e.target.value}}))}/>
          <input className="inp" placeholder="תגיות (פסיק)" value={forms.know.tags} onChange={e=>setForms(f=>({...f,know:{...f.know,tags:e.target.value}}))}/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="btn btn-s" onClick={()=>setModals(m=>({...m,know:false}))}>ביטול</button>
            <button className="btn btn-p" onClick={()=>addKnow()}>הוסף</button>
          </div>
        </div>
      </div></div>}
    </div>
  );
}
