import { useState, useRef, useEffect, useCallback } from "react";

/* ─── viewport + fonts ─── */
if (!document.getElementById("rfqa-meta")) {
  const m = document.createElement("meta");
  m.id = "rfqa-meta"; m.name = "viewport";
  m.content = "width=device-width,initial-scale=1,maximum-scale=5";
  document.head.appendChild(m);
}
if (!document.getElementById("rfqa-font")) {
  const l = document.createElement("link");
  l.id = "rfqa-font"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap";
  document.head.appendChild(l);
}
if (!document.getElementById("rfqa-css")) {
  const s = document.createElement("style");
  s.id = "rfqa-css";
  s.textContent = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',system-ui,sans-serif}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:#0a0f1e}
    ::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:4px}
    .ri:focus{outline:none;border-color:#3b82f6!important;box-shadow:0 0 0 3px rgba(59,130,246,.15)!important}
    .rb{transition:all .15s}
    .rb:hover:not(:disabled){filter:brightness(1.1);transform:translateY(-1px)}
    .rb:active:not(:disabled){transform:translateY(0)}
    .rb:disabled{opacity:.45;cursor:not-allowed}
    .rc{transition:border-color .2s,box-shadow .2s}
    .rh:hover{background:rgba(255,255,255,.04)!important}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    .fade{animation:fadeIn .25s ease}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    .pulsing{animation:pulse 1.4s ease-in-out infinite}
  `;
  document.head.appendChild(s);
}

/* ─── breakpoint hook ─── */
function useBP() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => { const fn = () => setW(window.innerWidth); window.addEventListener("resize", fn); return () => window.removeEventListener("resize", fn); }, []);
  return { w, xs: w < 480, sm: w < 768, md: w >= 768 && w < 1100, lg: w >= 1100 };
}

/* ══════════════════════════════════════
   STATIC DATA
══════════════════════════════════════ */
const MATS = [
  { name:"Mild Steel",          density:7850, ppkg:80   },
  { name:"Stainless Steel 304", density:8000, ppkg:180  },
  { name:"Aluminium 6061",      density:2700, ppkg:250  },
  { name:"Carbon Steel",        density:7850, ppkg:90   },
  { name:"Galvanized Steel",    density:7850, ppkg:95   },
  { name:"Brass",               density:8500, ppkg:300  },
  { name:"Copper",              density:8960, ppkg:450  },
  { name:"Tool Steel",          density:7750, ppkg:350  },
  { name:"Titanium",            density:4500, ppkg:1200 },
  { name:"Cast Iron",           density:7200, ppkg:65   },
];

const PROCS = [
  { name:"Laser Cutting",    rate:600,  setup:500,  mint:0.5, maxt:25  },
  { name:"CNC Machining",    rate:900,  setup:1000, mint:1,   maxt:200 },
  { name:"Bending",          rate:400,  setup:300,  mint:0.5, maxt:20  },
  { name:"Welding",          rate:500,  setup:400,  mint:1,   maxt:50  },
  { name:"Grinding",         rate:300,  setup:200,  mint:0.5, maxt:100 },
  { name:"Plasma Cutting",   rate:350,  setup:400,  mint:1,   maxt:60  },
  { name:"Waterjet Cutting", rate:700,  setup:600,  mint:0.5, maxt:200 },
  { name:"EDM",              rate:1200, setup:1500, mint:0.1, maxt:300 },
  { name:"Turning",          rate:600,  setup:800,  mint:5,   maxt:500 },
  { name:"Milling",          rate:750,  setup:900,  mint:1,   maxt:300 },
];

const COMPANIES = [
  { name:"DFAB Industries",    laser:600,  cnc:900,  bend:400, weld:500, grind:300, labor:150, finish:50, pkg:40,  tr:100, margin:.20 },
  { name:"AlphaFabrication",   laser:550,  cnc:850,  bend:380, weld:480, grind:280, labor:140, finish:45, pkg:35,  tr:90,  margin:.18 },
  { name:"PrecisionWorks",     laser:700,  cnc:1100, bend:450, weld:600, grind:350, labor:180, finish:60, pkg:50,  tr:120, margin:.25 },
  { name:"GlobalMetal",        laser:500,  cnc:800,  bend:350, weld:450, grind:250, labor:130, finish:40, pkg:30,  tr:80,  margin:.15 },
  { name:"MetalCraft",         laser:620,  cnc:950,  bend:420, weld:520, grind:310, labor:160, finish:55, pkg:45,  tr:110, margin:.22 },
  { name:"Custom Company",     laser:600,  cnc:900,  bend:400, weld:500, grind:300, labor:150, finish:50, pkg:40,  tr:100, margin:.20 },
];

const CURRENCIES = [
  { code:"INR", sym:"₹",   name:"Indian Rupee",        rate:1      },
  { code:"USD", sym:"$",   name:"US Dollar",           rate:83.5   },
  { code:"EUR", sym:"€",   name:"Euro",                rate:91.2   },
  { code:"GBP", sym:"£",   name:"British Pound",       rate:106.3  },
  { code:"AED", sym:"د.إ", name:"UAE Dirham",          rate:22.7   },
  { code:"SGD", sym:"S$",  name:"Singapore Dollar",    rate:62.1   },
  { code:"JPY", sym:"¥",   name:"Japanese Yen",        rate:0.56   },
  { code:"CNY", sym:"¥",   name:"Chinese Yuan",        rate:11.5   },
  { code:"SAR", sym:"﷼",   name:"Saudi Riyal",         rate:22.3   },
  { code:"MYR", sym:"RM",  name:"Malaysian Ringgit",   rate:18.4   },
  { code:"THB", sym:"฿",   name:"Thai Baht",           rate:2.34   },
  { code:"MXN", sym:"$",   name:"Mexican Peso",        rate:4.9    },
];

/* ══════════════════════════════════════
   COST ENGINE
══════════════════════════════════════ */
function calcCosts(p, co, ccyCode, extras, ccyList) {
  const mat  = MATS.find(m => m.name === p.material)  || MATS[0];
  const proc = PROCS.find(x => x.name === p.process)  || PROCS[0];
  const ccy  = (ccyList || CURRENCIES).find(c => c.code === ccyCode) || CURRENCIES[0];
  const L = +p.length||200, W = +p.width||100, T = +p.thickness||5, Q = +p.quantity||1;

  const vol    = (L/1000)*(W/1000)*(T/1000);
  const wt     = vol * mat.density;
  const matINR = wt * mat.ppkg;

  const rateMap = {
    "laser cutting":    co.laser,
    "plasma cutting":   co.laser * 0.58,
    "waterjet cutting": co.laser * 1.18,
    "cnc machining":    co.cnc,
    "edm":              co.cnc * 1.3,
    "turning":          co.cnc * 0.7,
    "milling":          co.cnc * 0.85,
    "bending":          co.bend,
    "welding":          co.weld,
    "grinding":         co.grind,
  };
  const mrate   = rateMap[proc.name.toLowerCase()] || co.laser;
  const mhrs    = Math.max(0.25, (L/1000)*(W/1000)*2.5 + T*0.02);
  const machINR = mhrs * mrate;
  const labINR  = mhrs * 0.8 * co.labor;
  const setupINR= proc.setup / Math.max(Q, 1);
  const finINR  = co.finish * Q;
  const pkgINR  = co.pkg;
  const trINR   = co.tr;
  const exINR   = (extras||[]).reduce((s,e) => s + (+e.amount||0), 0);
  const sub     = (matINR + machINR + labINR + setupINR + co.finish)*Q + pkgINR + trINR + exINR;
  const profINR = sub * co.margin;
  const totINR  = sub + profINR;
  const cv = v => v / ccy.rate;

  return {
    material:  cv(matINR),  machine:   cv(machINR),  labor:    cv(labINR),
    setup:     cv(setupINR*Q), finishing: cv(finINR), packaging:cv(pkgINR),
    transport: cv(trINR),   extra:     cv(exINR),    profit:   cv(profINR),
    total:     cv(totINR),  per_part:  cv(totINR/Q),
    weight: wt, mhrs, ccy, mat, proc,
  };
}

function applyOv(base, ov, qty) {
  if (!ov || !Object.keys(ov).length) return base;
  const m = {...base};
  for (const k of ["material","machine","labor","setup","finishing","packaging","transport","extra","profit"])
    if (ov[k] !== undefined) m[k] = ov[k];
  m.total    = m.material+m.machine+m.labor+m.setup+m.finishing+m.packaging+m.transport+m.extra+m.profit;
  m.per_part = m.total / Math.max(1, +qty||1);
  return m;
}

function calcFeas(p) {
  const proc = PROCS.find(x => x.name === p.process);
  const T=+p.thickness, L=+p.length, W=+p.width, Q=+p.quantity;
  const w = [];
  if (proc) {
    if (T > proc.maxt) w.push({lvl:"error", msg:`Thickness ${T}mm exceeds max for ${proc.name} (${proc.maxt}mm).`});
    if (T < proc.mint) w.push({lvl:"error", msg:`Thickness ${T}mm below min for ${proc.name} (${proc.mint}mm).`});
  }
  if ((p.material||"").toLowerCase().includes("titanium")) w.push({lvl:"warn", msg:"Titanium requires specialised tooling — longer lead time expected."});
  if (L>3000||W>1500) w.push({lvl:"warn", msg:`Part ${L}×${W}mm may exceed standard machine bed. Verify capacity.`});
  if (Q<5)    w.push({lvl:"info", msg:"Very low quantity — setup cost dominates per-unit cost."});
  if (Q>1000) w.push({lvl:"info", msg:"High volume order — consider negotiating bulk discount."});
  if ((p.finish||"").match(/mirror|polish/i)) w.push({lvl:"warn", msg:"Mirror/polish finish adds ~20% cost and lead time."});
  const e=w.filter(x=>x.lvl==="error").length, wn=w.filter(x=>x.lvl==="warn").length;
  return { warnings:w, complexity: e>0?"High":wn>1?"Medium":"Low" };
}

function calcLT(p, mhrs) {
  const Q=+p.quantity||1, T=+p.thickness||5;
  const qF=Math.max(1,Math.ceil(Q/50));
  const tF=T>20?1.5:T>10?1.2:1;
  const cF=["CNC Machining","EDM","Milling","Turning"].includes(p.process)?1.5:1;
  const noFin=!p.finish||["raw","none","standard",""].includes((p.finish||"").toLowerCase());
  const stages = [
    {icon:"📋",label:"Order Confirmation",   days:1,                                        color:"#3b82f6"},
    {icon:"🏭",label:"Material Procurement", days:Math.ceil((T>15?3:2)*tF),                 color:"#8b5cf6"},
    {icon:"⚙️",label:"Machine Setup",        days:Math.ceil(cF),                            color:"#f59e0b"},
    {icon:"🔩",label:"Manufacturing",        days:Math.max(1,Math.ceil(mhrs*qF*cF/8)),      color:"#10b981"},
    {icon:"🔍",label:"Quality Inspection",   days:Math.max(1,Math.ceil(Q/200)),              color:"#06b6d4"},
    ...(!noFin?[{icon:"✨",label:"Surface Finishing",days:Math.max(1,Math.ceil(Q/100)),color:"#ec4899"}]:[]),
    {icon:"📦",label:"Packing & Dispatch",   days:1,                                        color:"#84cc16"},
  ];
  let cum=0;
  const schedule=stages.map(s=>{const st=cum+1;cum+=s.days;return{...s,start:st,end:cum};});
  return {schedule, total:cum};
}

/* ══════════════════════════════════════
   SMART REGEX PARSER
══════════════════════════════════════ */
function regexParse(txt) {
  if (!txt) return {};
  const g=(pats)=>{for(const pat of pats){const m=txt.match(pat);if(m)return m[1]?.trim()||"";}return "";};
  let mat="",proc="";
  for(const m of MATS)  {if(txt.toLowerCase().includes(m.name.toLowerCase())){mat=m.name;break;}}
  for(const pr of PROCS){if(txt.toLowerCase().includes(pr.name.toLowerCase())){proc=pr.name;break;}}
  const sz=txt.match(/([0-9.]+)\s*[x×*×]\s*([0-9.]+)\s*mm/i);
  const qty=g([/(?:quantity|qty)[:\s]+([0-9,]+)/i,/([0-9,]+)\s*(?:pcs|pieces|nos|units|qty)/i]).replace(/,/g,"");
  const rd=g([/(?:required|deliver(?:y|ed)?)\s*(?:within|in|by)[:\s]+([0-9]+)\s*(?:days?|working)/i,/within\s+([0-9]+)\s*days?/i,/([0-9]+)\s*days?\s*delivery/i]);
  return {
    material:mat, process:proc,
    thickness:g([/(?:thickness|thk|t=|t\s*:)[:\s]+([0-9.]+)\s*(?:mm)?/i,/([0-9.]+)\s*mm\s*(?:thk|thick)/i]),
    length:sz?sz[1]:g([/(?:length|l=|len)[:\s]+([0-9.]+)/i]),
    width: sz?sz[2]:g([/(?:width|w=|wid)[:\s]+([0-9.]+)/i]),
    quantity:qty,
    finish:g([/(?:finish|surface|coating|treatment)[:\s]+([A-Za-z\s\-]+?)(?:\n|,|$)/i]),
    client:g([/(?:from|client|company|requester)[:\s]+([A-Za-z0-9\s&.,]+?)(?:\n|,|$)/i,/dear\s+(?:sir,?\s*)?([A-Za-z\s]+)/i]),
    delivery:g([/(?:deliver(?:y)?\s*(?:to|location|address)|ship\s*to)[:\s]+([A-Za-z\s,]+?)(?:\n|$)/i,/(?:to|at)\s*:?\s*([A-Za-z]+(?:\s*,\s*[A-Za-z]+)?)\s*(?:plant|factory|site|office)/i]),
    required_days:rd,
  };
}

/* ══════════════════════════════════════
   AI ENGINE — LLAMA 3.3 via GROQ FREE
   ─────────────────────────────────────
   Groq free tier: 30 req/min, 6000 TPM
   Model: llama-3.3-70b-versatile
   Completely free, no credit card.
   
   Waterfall:
   1. Groq / Llama 3.3 70B  (primary — fast, accurate)
   2. Groq / Llama 3.1 8B   (faster fallback)
   3. Together.ai Llama free (secondary — no key needed)
   4. Smart regex            (always works)
   
   OCR: Tesseract.js for images (browser-side, free)
══════════════════════════════════════ */

/* Your free Groq API key — get one at console.groq.com (takes 30 sec, no CC) */
const GROQ_KEY = "gsk_free_placeholder_get_yours_at_console_groq_com";

function buildLlamaPrompt(text) {
  const ML = MATS.map(m=>m.name).join(", ");
  const PL = PROCS.map(p=>p.name).join(", ");
  return [
    { role: "system", content: `You are a precision manufacturing RFQ data extractor. You read fabrication requests (emails and OCR text from engineering drawings) and output structured JSON.

ALLOWED MATERIALS: ${ML}
ALLOWED PROCESSES:  ${PL}

OUTPUT RULES:
- Return ONLY a JSON object. No explanation, no markdown, no code fences.
- material: exact string from ALLOWED MATERIALS list, closest match, "" if none
- process: exact string from ALLOWED PROCESSES list, closest match, "" if none
- thickness: number in mm (0 if not found)
- length: number in mm (0 if not found)
- width: number in mm (0 if not found)
- quantity: number, integer (0 if not found)
- finish: string like "Powder Coat", "Anodize Black", "Hot-Dip Galvanize", "Shot Blast", "" if none
- client: company or person name string, "" if none
- delivery: city or location string, "" if none
- required_days: integer delivery days, 0 if not specified

EXTRACTION TIPS:
- In drawings look for title block, BOM, dimension annotations like "200 x 100 x 5 THK" or "L=200 W=100 T=5"
- "THK", "T=", "t =" or a number followed by "mm thick" = thickness
- LxW or LxWxT format: first number is length, second is width, third (if present) is thickness
- Dimensions from drawings take priority over email text if both are present
- "within 10 days", "10 days delivery", "deliver by 10 days" → required_days: 10` },
    { role: "user", content: `Extract all manufacturing parameters from the following RFQ content:\n\n${text}\n\nJSON:` },
  ];
}

function parseJSON(raw) {
  if (!raw) return null;
  try {
    const c = raw.replace(/```json|```/gi,"").trim();
    const m = c.match(/\{[\s\S]+\}/);
    if (!m) return null;
    return JSON.parse(m[0]);
  } catch { return null; }
}

function merge(a, b) {
  // a = AI result, b = regex fallback — fill gaps
  if (!a) return b||{};
  if (!b) return a;
  const z = v => !v || v==="0" || v===0;
  return {
    material:      a.material      || b.material      || "",
    process:       a.process       || b.process       || "",
    thickness:     z(a.thickness)  ? (b.thickness||a.thickness) : a.thickness,
    length:        z(a.length)     ? (b.length   ||a.length)    : a.length,
    width:         z(a.width)      ? (b.width    ||a.width)     : a.width,
    quantity:      z(a.quantity)   ? (b.quantity ||a.quantity)  : a.quantity,
    finish:        a.finish        || b.finish        || "",
    client:        a.client        || b.client        || "",
    delivery:      a.delivery      || b.delivery      || "",
    required_days: z(a.required_days)?(b.required_days||a.required_days):a.required_days,
  };
}

/* Groq API call — returns parsed JSON or throws */
async function groqLlama(text, model="llama-3.3-70b-versatile") {
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: buildLlamaPrompt(text),
      max_tokens: 400,
      temperature: 0,
      response_format: { type:"json_object" },
    }),
  });
  if (!r.ok) throw new Error(`Groq ${r.status}`);
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  const raw = d?.choices?.[0]?.message?.content || "";
  const j = parseJSON(raw);
  if (!j) throw new Error("Llama: no JSON");
  return j;
}

/* Together.ai free endpoint — no key for llama */
async function togetherLlama(text) {
  const r = await fetch("https://api.together.xyz/v1/chat/completions", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"meta-llama/Llama-3-8b-chat-hf",
      messages: buildLlamaPrompt(text),
      max_tokens:400, temperature:0,
    }),
  });
  if (!r.ok) throw new Error(`Together ${r.status}`);
  const d = await r.json();
  const raw = d?.choices?.[0]?.message?.content || "";
  const j = parseJSON(raw);
  if (!j) throw new Error("Together: no JSON");
  return j;
}

/* Tesseract OCR loader */
async function loadTesseract() {
  if (window.Tesseract) return window.Tesseract;
  return new Promise((res,rej)=>{
    const s=document.createElement("script");
    s.src="https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.0.3/tesseract.min.js";
    s.onload=()=>res(window.Tesseract);
    s.onerror=()=>rej(new Error("Tesseract load failed"));
    document.head.appendChild(s);
  });
}

async function ocrFile(file, onProg) {
  const Tesseract = await loadTesseract();
  const url = URL.createObjectURL(file);
  try {
    const result = await Tesseract.recognize(url,"eng",{
      logger:m=>{if(m.status==="recognizing text"&&onProg)onProg(Math.round(m.progress*100));},
    });
    return result.data.text||"";
  } finally { URL.revokeObjectURL(url); }
}

/* ── MAIN EXTRACTION WATERFALL ── */
async function aiExtract(emailText, imageFiles, onProgress) {
  const imgs = (imageFiles||[]).filter(f=>f&&f.type&&f.type.startsWith("image/"));
  const hasTxt  = emailText && emailText.trim().length > 10;
  const hasImgs = imgs.length > 0;

  /* Step 1: OCR all images with Tesseract (free, in-browser) */
  let ocrText = "";
  if (hasImgs) {
    if (onProgress) onProgress("ocr", 0, "Running Tesseract OCR on drawings…");
    const parts = [];
    for (let i=0; i<imgs.length; i++) {
      try {
        const t = await ocrFile(imgs[i], pct=>{
          if(onProgress) onProgress("ocr", Math.round((i/imgs.length)*100+pct/imgs.length), `OCR drawing ${i+1}/${imgs.length}…`);
        });
        if (t.trim()) parts.push(`[DRAWING ${i+1} OCR]\n${t.trim()}`);
      } catch(e) { console.warn("OCR failed:", e); }
    }
    ocrText = parts.join("\n\n");
  }

  /* Build combined text = email + OCR */
  const combined = [
    hasTxt  ? `[EMAIL / RFQ TEXT]\n${emailText.trim()}` : "",
    ocrText ? ocrText : "",
  ].filter(Boolean).join("\n\n");

  /* Regex always runs first — instant fallback */
  const regexResult = regexParse(combined);

  if (!combined.trim()) {
    return { data: regexResult, src: "Smart Rules" };
  }

  /* Step 2: Groq Llama 3.3 70B — primary (fast, accurate, free) */
  if (onProgress) onProgress("ai", 10, "Calling Llama 3.3 70B via Groq…");
  try {
    const j = await groqLlama(combined, "llama-3.3-70b-versatile");
    const data = merge(j, regexResult);
    if (onProgress) onProgress("ai", 100, "Done");
    const src = hasImgs && hasTxt ? "Llama 3.3 70B + Tesseract OCR (Email + Drawing)"
              : hasImgs           ? "Llama 3.3 70B + Tesseract OCR (Drawing)"
              :                     "Llama 3.3 70B (Email)";
    return { data, src };
  } catch(e) { console.warn("[Groq 70B]", e.message); }

  /* Step 3: Groq Llama 3.1 8B — lighter fallback */
  if (onProgress) onProgress("ai", 30, "Trying Llama 3.1 8B fallback…");
  try {
    const j = await groqLlama(combined, "llama-3.1-8b-instant");
    const data = merge(j, regexResult);
    if (onProgress) onProgress("ai", 100, "Done");
    return { data, src: "Llama 3.1 8B via Groq" + (ocrText ? " + OCR" : "") };
  } catch(e) { console.warn("[Groq 8B]", e.message); }

  /* Step 4: Together.ai free endpoint */
  if (onProgress) onProgress("ai", 50, "Trying Together.ai Llama…");
  try {
    const j = await togetherLlama(combined);
    const data = merge(j, regexResult);
    if (onProgress) onProgress("ai", 100, "Done");
    return { data, src: "Llama 3 8B via Together.ai" + (ocrText ? " + OCR" : "") };
  } catch(e) { console.warn("[Together]", e.message); }

  /* Step 5: Smart regex — always works */
  if (onProgress) onProgress("ai", 100, "Done (regex)");
  return { data: regexResult, src: "Smart Rules" + (ocrText ? " + OCR" : "") };
}

/* file → base64 */
function toBase64(file) {
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onload=()=>res(r.result.split(",")[1]);
    r.onerror=()=>rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });
}

/* PDF-safe text */
function safe(str) {
  return String(str||"-")
    .replace(/[\u{1F000}-\u{1FFFF}]/gu,"")
    .replace(/[\u2600-\u27BF]/g,"")
    .replace(/[^\x00-\x7E]/g,"")
    .trim()||"-";
}

function genQID() {
  const d=new Date();
  return `QT-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${Math.floor(1000+Math.random()*9000)}`;
}

/* ══════════════════════════════════════
   PDF EXPORT
══════════════════════════════════════ */
async function loadjsPDF() {
  if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
  await new Promise((res,rej)=>{
    const ex=document.querySelector('script[src*="jspdf"]');
    if(ex){const iv=setInterval(()=>{if(window.jspdf?.jsPDF){clearInterval(iv);res();}},100);setTimeout(()=>{clearInterval(iv);rej(new Error("jsPDF timeout"));},15000);return;}
    const s=document.createElement("script");
    s.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload=res; s.onerror=()=>rej(new Error("jsPDF CDN failed"));
    document.head.appendChild(s);
  });
  return window.jspdf.jsPDF;
}

function h2rgb(hex){return{r:parseInt(hex.slice(1,3),16),g:parseInt(hex.slice(3,5),16),b:parseInt(hex.slice(5,7),16)};}

async function exportPDF(qid,p,costs,feas,co,extras,lt) {
  const jsPDF=await loadjsPDF();
  const doc=new jsPDF({unit:"mm",format:"a4"});
  const ccy=costs.ccy;
  const fmt=v=>`${ccy.code} ${Number(v||0).toFixed(2)}`;
  const now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
  const PW=210,M=15,B=PW-M*2,PH=297,FH=12;
  let y=0;

  const addFooter=()=>{
    doc.setFillColor(10,15,30);doc.rect(0,PH-FH,PW,FH,"F");
    doc.setFont("helvetica","bold");doc.setFontSize(7.5);doc.setTextColor(59,130,246);
    doc.text("RFQAnalyzer",M,PH-4);
    doc.setFont("helvetica","normal");doc.setTextColor(71,85,105);
    doc.text(safe(co.name),M+26,PH-4);
    doc.text(`${qid}  |  Confidential  |  ${now}`,PW-M,PH-4,{align:"right"});
  };

  const need=h=>{if(y+h>PH-FH-8){addFooter();doc.addPage();y=18;}};

  const sh=lbl=>{
    need(10);
    doc.setFillColor(10,15,30);doc.rect(M,y,B,7,"F");
    doc.setTextColor(100,116,139);doc.setFont("helvetica","bold");doc.setFontSize(7);
    doc.text(lbl.toUpperCase(),M+3,y+5);
    y+=9;
  };

  /* HEADER */
  doc.setFillColor(10,15,30);doc.rect(0,0,PW,44,"F");
  doc.setFillColor(59,130,246);doc.rect(0,44,PW,2,"F");
  doc.setFont("helvetica","bold");doc.setFontSize(20);doc.setTextColor(255,255,255);
  doc.text("RFQAnalyzer",M,16);
  doc.setFont("helvetica","normal");doc.setFontSize(8.5);doc.setTextColor(148,163,184);
  doc.text(`${safe(co.name)}  |  Fabrication Quotation  |  Llama 3.3 AI`,M,24);
  doc.text(`${now}  |  Currency: ${ccy.code}`,M,31);
  doc.setFont("helvetica","bold");doc.setFontSize(17);doc.setTextColor(255,255,255);
  doc.text("QUOTATION",PW-M,16,{align:"right"});
  doc.setFont("helvetica","normal");doc.setFontSize(9);doc.setTextColor(148,163,184);
  doc.text(qid,PW-M,24,{align:"right"});
  y=50;

  /* INFO BOXES */
  const hf=(B-5)/2,bH=36;
  doc.setFillColor(248,250,252);
  doc.roundedRect(M,y,hf,bH,2,2,"F");
  doc.roundedRect(M+hf+5,y,hf,bH,2,2,"F");
  doc.setFont("helvetica","bold");doc.setFontSize(6.5);doc.setTextColor(100,116,139);
  doc.text("CLIENT",M+4,y+5);doc.text("PART SPECIFICATIONS",M+hf+9,y+5);

  const br=(k,v,ox,ry)=>{
    doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(100,116,139);
    doc.text(k,M+4+ox,ry);
    doc.setFont("helvetica","bold");doc.setTextColor(30,41,59);
    doc.text(safe(v).substring(0,28),M+4+ox+24,ry);
  };
  let by=y+10;
  br("Client",  p.client||"-",    0,  by); br("Material", p.material||"-",     hf+5,by); by+=5.5;
  br("Delivery",p.delivery||"-",  0,  by); br("Thickness",(p.thickness||"-")+" mm", hf+5,by); by+=5.5;
  br("Finish",  p.finish||"Std",  0,  by); br("Size",`${p.length||"-"} x ${p.width||"-"} mm`, hf+5,by); by+=5.5;
  br("Target",  p.required_days?p.required_days+"d":"N/A",0,by);
  br("Qty / Process",`${p.quantity||"-"} pcs | ${p.process||"-"}`,hf+5,by);
  y+=bH+5;

  /* STATS */
  const sw=(B-8)/3;
  [[`Weight`,`${costs.weight.toFixed(4)} kg`],[`Machine Hrs`,`${costs.mhrs.toFixed(3)} h`],[`Unit Cost (${ccy.code})`,fmt(costs.per_part)]].forEach((st,i)=>{
    const sx=M+i*(sw+4);
    doc.setFillColor(239,246,255);doc.roundedRect(sx,y,sw,13,2,2,"F");
    doc.setFont("helvetica","normal");doc.setFontSize(7);doc.setTextColor(100,116,139);doc.text(st[0],sx+3,y+5);
    doc.setFont("helvetica","bold");doc.setFontSize(9.5);doc.setTextColor(29,78,216);doc.text(safe(st[1]),sx+3,y+11);
  });
  y+=17;

  /* COST TABLE */
  sh(`Cost Breakdown  (${ccy.code})`);
  const c1=M,c2=M+8,c3=M+58,c4=PW-M;
  doc.setFillColor(10,15,30);doc.rect(c1,y,B,7,"F");
  doc.setFont("helvetica","bold");doc.setFontSize(7);doc.setTextColor(148,163,184);
  doc.text("#",c1+2,y+5);doc.text("ITEM",c2+2,y+5);doc.text("DETAILS",c3+2,y+5);
  doc.text("AMOUNT",c4,y+5,{align:"right"});
  y+=8;

  const ax=(extras||[]).filter(e=>e.label&&e.amount);
  const rows=[
    ["1","Material",    `${safe(p.material)} | ${costs.weight.toFixed(4)} kg`,fmt(costs.material)],
    ["2","Machine",     `${safe(p.process)} | ${costs.mhrs.toFixed(2)} hrs`,  fmt(costs.machine)],
    ["3","Labor",       "Operator and supervision",                             fmt(costs.labor)],
    ["4","Setup",       "Machine setup and tooling",                            fmt(costs.setup)],
    ["5","Finishing",   safe(p.finish)||"Surface treatment",                    fmt(costs.finishing)],
    ["6","Packaging",   "Protective packing",                                   fmt(costs.packaging)],
    ["7","Transport",   `To ${safe(p.delivery)||"destination"}`,                fmt(costs.transport)],
    ...ax.map((e,i)=>[String(8+i),safe(e.label),"Additional charge",fmt(+e.amount/ccy.rate)]),
    [String(8+ax.length),"Profit & Overhead",`${(co.margin*100).toFixed(0)}% margin`,fmt(costs.profit)],
  ];
  rows.forEach((r,i)=>{
    need(8);
    if(i%2===0){doc.setFillColor(248,250,252);doc.rect(c1,y-1,B,8,"F");}
    doc.setFont("helvetica","normal");doc.setFontSize(8.5);doc.setTextColor(71,85,105);
    doc.text(r[0],c1+2,y+5);doc.text(r[1],c2+2,y+5);
    doc.setTextColor(100,116,139);doc.setFontSize(7.5);
    doc.text(safe(r[2]).substring(0,44),c3+2,y+5);
    doc.setFont("helvetica","bold");doc.setFontSize(8.5);doc.setTextColor(30,41,59);
    doc.text(r[3],c4,y+5,{align:"right"});
    y+=8;
  });
  need(11);
  doc.setFillColor(239,246,255);doc.rect(c1,y,B,10,"F");
  doc.setFont("helvetica","bold");doc.setFontSize(13);doc.setTextColor(29,78,216);
  doc.text(`TOTAL  (${ccy.code})`,c1+4,y+7.5);doc.text(fmt(costs.total),c4,y+7.5,{align:"right"});
  y+=11;
  need(7);
  doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(100,116,139);
  doc.text(`Per part: ${fmt(costs.per_part)} x ${p.quantity} pcs`,c1+4,y+5);
  y+=9;

  /* FEASIBILITY */
  if(feas?.warnings?.length>0){
    const bh=9+feas.warnings.length*6;need(bh+4);
    doc.setFillColor(255,251,235);doc.setDrawColor(253,230,138);
    doc.roundedRect(M,y,B,bh,2,2,"FD");
    doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(146,64,14);
    doc.text(`! MANUFACTURING NOTES  (Complexity: ${feas.complexity})`,M+4,y+6);
    y+=8;
    feas.warnings.forEach(w=>{
      const lines=doc.splitTextToSize(`- ${safe(w.msg)}`,B-10);
      lines.forEach(l=>{need(6);doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(120,53,15);doc.text(l,M+5,y+4);y+=5.5;});
    });
    y+=4;
  }

  /* GANTT */
  if(lt){
    sh("Production Schedule");
    const tX=M+54,tW=B-65,eX=PW-M-1;
    lt.schedule.forEach(s=>{
      need(9);
      doc.setFont("helvetica","normal");doc.setFontSize(8.5);doc.setTextColor(30,41,59);
      doc.text(safe(s.label),M+2,y+5.5);
      doc.setFontSize(7);doc.setTextColor(100,116,139);doc.text(s.days+"d",M+42,y+5.5);
      doc.setFillColor(226,232,240);doc.roundedRect(tX,y+1,tW,5.5,1,1,"F");
      const {r,g,b}=h2rgb(s.color);doc.setFillColor(r,g,b);
      const bx=tX+((s.start-1)/lt.total)*tW,bw=Math.max((s.days/lt.total)*tW,1.5);
      doc.roundedRect(bx,y+1.5,bw,4.5,0.5,0.5,"F");
      if(p.required_days&&+p.required_days<=lt.total){
        const dlX=tX+(+p.required_days/lt.total)*tW;
        doc.setDrawColor(245,158,11);doc.setLineWidth(0.6);doc.line(dlX,y+1,dlX,y+6.5);
      }
      doc.setFont("helvetica","bold");doc.setFontSize(7.5);doc.setTextColor(29,78,216);
      doc.text(s.end+"d",eX,y+5.5,{align:"right"});
      y+=9;
    });
    need(11);
    doc.setFillColor(239,246,255);doc.roundedRect(M,y,B,9,2,2,"F");
    doc.setFont("helvetica","normal");doc.setFontSize(9);doc.setTextColor(100,116,139);
    doc.text("Total Lead Time",M+4,y+6.5);
    doc.setFont("helvetica","bold");doc.setFontSize(12);doc.setTextColor(29,78,216);
    doc.text(lt.total+" Working Days",PW-M-1,y+6.5,{align:"right"});
    y+=12;
    if(p.required_days){
      need(9);
      const ok=lt.total<=+p.required_days;
      doc.setFillColor(...(ok?[220,252,231]:[254,226,226]));
      doc.roundedRect(M,y,B,8,2,2,"F");
      doc.setFont("helvetica","bold");doc.setFontSize(8.5);
      doc.setTextColor(...(ok?[21,128,61]:[220,38,38]));
      doc.text(ok?`OK - Lead time (${lt.total}d) meets target (${p.required_days}d)`:`LATE - Lead time (${lt.total}d) exceeds target (${p.required_days}d) by ${lt.total-+p.required_days}d`,M+4,y+5.5);
      y+=11;
    }
  }

  /* TERMS */
  sh("Commercial Terms");
  const tw=(B-5)/2;
  const terms=[["Our Lead Time",lt?lt.total+" working days":"7-21 days"],["Client Target",p.required_days?p.required_days+" days":"Not specified"],["Quote Valid","30 days from date"],["Payment Terms","50% advance, 50% delivery"]];
  for(let i=0;i<terms.length;i+=2){
    need(15);
    [0,1].forEach(j=>{
      const t=terms[i+j];if(!t)return;
      const tx=M+j*(tw+5);
      doc.setFillColor(248,250,252);doc.roundedRect(tx,y,tw,12,2,2,"F");
      doc.setFont("helvetica","normal");doc.setFontSize(7);doc.setTextColor(148,163,184);doc.text(t[0].toUpperCase(),tx+4,y+5);
      doc.setFont("helvetica","bold");doc.setFontSize(9);doc.setTextColor(30,41,59);doc.text(safe(t[1]),tx+4,y+10.5);
    });
    y+=15;
  }
  need(12);
  doc.setFont("helvetica","normal");doc.setFontSize(7.5);doc.setTextColor(148,163,184);
  const nl=doc.splitTextToSize("All prices exclude applicable taxes. Subject to final drawing approval. Lead time commences from receipt of advance payment and approved drawings.",B);
  doc.text(nl,M,y);y+=nl.length*4.5+4;
  addFooter();
  doc.save(qid+".pdf");
}

function exportCSV(qid,p,costs,extras,lt,co,ccySrc) {
  const c=costs,ccy=c.ccy;
  const rows=[
    ["Quotation",qid],["Date",new Date().toLocaleString()],["Company",co.name],
    ["Currency",ccy.code],["Rate Source",ccySrc],["",""],
    ["Client",p.client],["Delivery",p.delivery],["Required Days",p.required_days],
    ["Material",p.material],["Thickness mm",p.thickness],["Length mm",p.length],
    ["Width mm",p.width],["Qty",p.quantity],["Process",p.process],["Finish",p.finish],
    ["",""],["COSTS",ccy.code],
    ["Material",(c.material||0).toFixed(2)],["Machine",(c.machine||0).toFixed(2)],
    ["Labor",(c.labor||0).toFixed(2)],["Setup",(c.setup||0).toFixed(2)],
    ["Finishing",(c.finishing||0).toFixed(2)],["Packaging",(c.packaging||0).toFixed(2)],
    ["Transport",(c.transport||0).toFixed(2)],["Additional",(c.extra||0).toFixed(2)],
    ["Profit",(c.profit||0).toFixed(2)],["TOTAL",(c.total||0).toFixed(2)],["Per Part",(c.per_part||0).toFixed(2)],
    ...(lt?[["",""],["Lead Time Days",lt.total],...lt.schedule.map(s=>[s.label,s.days+"d"])]:[]),
  ];
  dlBlob(rows.map(r=>r.map(v=>`"${v}"`).join(",")).join("\n"),"text/csv",qid+".csv");
}

function exportJSON(qid,p,costs,extras,lt,co,ccy,ccySrc) {
  const{ccy:_a,mat:_b,proc:_c,...cd}=costs;
  dlBlob(JSON.stringify({quotation_id:qid,generated:new Date().toISOString(),company:co.name,currency:ccy,rate_source:ccySrc,params:p,costs:cd,extras:(extras||[]).filter(e=>e.label&&e.amount),lead_time:lt?{total_days:lt.total,stages:lt.schedule}:null},null,2),"application/json",qid+".json");
}

function dlBlob(content,mime,name){
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([content],{type:mime}));
  a.download=name;a.click();
}

/* ══════════════════════════════════════
   DESIGN SYSTEM
══════════════════════════════════════ */
const C = {
  bg:    "#060b18",
  surf:  "#0a1120",
  card:  "#0d1628",
  bdr:   "#1a2d47",
  bdr2:  "#1f3555",
  txt:   "#e8edf5",
  sub:   "#566a85",
  dim:   "#1e3050",
  acc:   "#3b82f6",
  grn:   "#10b981",
  yel:   "#f59e0b",
  red:   "#ef4444",
  pur:   "#8b5cf6",
  cyan:  "#06b6d4",
  pink:  "#ec4899",
  ff:    "'Inter', system-ui, sans-serif",
  mono:  "'JetBrains Mono', monospace",
};

/* ── Atomic Components ── */
const Badge=({color=C.acc,children})=>(
  <span style={{display:"inline-flex",alignItems:"center",padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:600,background:color+"20",color,border:`1px solid ${color}35`,letterSpacing:0.3,whiteSpace:"nowrap"}}>{children}</span>
);

const Field=({label,hint,required,error,children})=>(
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    <label style={{fontSize:11,fontWeight:600,color:error?C.red:C.sub,letterSpacing:0.5,textTransform:"uppercase",display:"flex",gap:3}}>
      {label}{required&&<span style={{color:C.red}}>*</span>}
    </label>
    {children}
    {(hint||error)&&<span style={{fontSize:10,color:error?C.red:C.dim,lineHeight:1.5}}>{error||hint}</span>}
  </div>
);

const Input=({style={},error,...props})=>(
  <input className="ri" {...props} style={{
    background:C.surf,border:`1px solid ${error?C.red:C.bdr}`,borderRadius:8,
    padding:"10px 13px",color:C.txt,fontSize:13,width:"100%",
    boxSizing:"border-box",fontFamily:C.ff,outline:"none",
    transition:"border-color .2s,box-shadow .2s",...style,
  }}/>
);

const Select=({children,style={},...props})=>(
  <select className="ri" {...props} style={{
    background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:8,
    padding:"10px 13px",color:C.txt,fontSize:13,width:"100%",
    boxSizing:"border-box",fontFamily:C.ff,outline:"none",cursor:"pointer",...style,
  }}>{children}</select>
);

const Btn=({children,variant="primary",size="md",disabled,onClick,style={}})=>{
  const V={
    primary:{background:"#3b82f6",color:"#fff"},
    success:{background:"#059669",color:"#fff"},
    purple: {background:"#7c3aed",color:"#fff"},
    danger: {background:"#dc2626",color:"#fff"},
    outline:{background:"transparent",color:C.sub,border:`1px solid ${C.bdr}`},
    ghost:  {background:"transparent",color:C.sub,border:"none"},
  };
  const S=size==="sm"?{padding:"6px 12px",fontSize:12}:size==="lg"?{padding:"12px 22px",fontSize:15}:{padding:"9px 16px",fontSize:13};
  return(
    <button className="rb" disabled={disabled} onClick={disabled?undefined:onClick} style={{
      ...V[variant],border:"none",borderRadius:8,...S,fontWeight:600,
      cursor:disabled?"not-allowed":"pointer",fontFamily:C.ff,
      display:"inline-flex",alignItems:"center",gap:7,
      opacity:disabled?.4:1,transition:"all .15s",whiteSpace:"nowrap",...style,
    }}>{children}</button>
  );
};

const Card=({children,style={}})=>(
  <div className="rc" style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:14,padding:20,marginBottom:14,...style}}>{children}</div>
);

const SectionTitle=({children})=>(
  <div style={{fontSize:10,fontWeight:700,color:C.acc,letterSpacing:2,textTransform:"uppercase",marginBottom:16,display:"flex",alignItems:"center",gap:8}}>{children}</div>
);

const KV=({label,value,mono})=>(
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",fontSize:12,padding:"6px 0",borderBottom:`1px solid ${C.dim}22`}}>
    <span style={{color:C.sub,flexShrink:0}}>{label}</span>
    <span style={{color:"#94a3b8",fontWeight:600,fontFamily:mono?C.mono:C.ff,textAlign:"right",marginLeft:8,wordBreak:"break-word"}}>{value}</span>
  </div>
);

/* ── Global currency selector — used everywhere ── */
const CurrencySelect=({ccy,setCcy,ccyList,size="md",style={}})=>(
  <Select value={ccy} onChange={e=>setCcy(e.target.value)} style={{maxWidth:size==="sm"?120:160,width:"auto",fontSize:size==="sm"?11:13,padding:size==="sm"?"5px 8px":"9px 12px",...style}}>
    {ccyList.map(c=><option key={c.code} value={c.code}>{c.sym} {c.code} — {c.name}</option>)}
  </Select>
);

/* ── Stat card ── */
const Stat=({label,value,sub,color=C.acc,icon})=>(
  <div style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:12,padding:"14px 16px",display:"flex",flexDirection:"column",gap:4}}>
    <div style={{fontSize:9,color:C.sub,letterSpacing:1,textTransform:"uppercase",display:"flex",alignItems:"center",gap:5}}>{icon&&<span>{icon}</span>}<span>{label}</span></div>
    <div style={{fontSize:20,fontWeight:800,color,fontFamily:C.mono,lineHeight:1.1,wordBreak:"break-all"}}>{value}</div>
    {sub&&<div style={{fontSize:9,color:C.sub,marginTop:1}}>{sub}</div>}
  </div>
);

/* ── Gantt ── */
const Gantt=({schedule,total,clientDays,compact})=>{
  const CD=+clientDays||0,over=CD>0&&total>CD;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.sub,marginBottom:10,flexWrap:"wrap",gap:4}}>
        <span style={{fontFamily:C.mono}}>Day 1</span>
        <span style={{fontWeight:700,color:over?C.red:C.grn}}>
          {over?`${total}d — ${total-CD}d over client target`:`${total} working days${CD?` (target ${CD}d)`:""}`}
        </span>
        <span style={{fontFamily:C.mono}}>Day {total}</span>
      </div>
      {schedule.map((s,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:compact?4:6}}>
          <div style={{width:compact?90:145,flexShrink:0}}>
            <div style={{fontSize:compact?9:10,fontWeight:600,color:"#94a3b8",lineHeight:1.3}}>{s.label}</div>
            <div style={{fontSize:8,color:C.sub}}>{s.days}d</div>
          </div>
          <div style={{flex:1,height:compact?18:22,background:C.dim+"66",borderRadius:5,position:"relative",overflow:"hidden"}}>
            {CD>0&&<div style={{position:"absolute",left:`${Math.min(CD/total*100,99)}%`,top:0,bottom:0,width:2,background:C.yel,zIndex:3,opacity:.9}}/>}
            <div style={{position:"absolute",left:`${(s.start-1)/total*100}%`,width:`${s.days/total*100}%`,top:2,bottom:2,background:s.color,borderRadius:3,opacity:.85,display:"flex",alignItems:"center",fontSize:8,color:"#fff",fontWeight:700,paddingLeft:4,overflow:"hidden",whiteSpace:"nowrap"}}>
              {s.days/total>0.12?`${s.start}–${s.end}`:""}
            </div>
          </div>
          <div style={{width:22,textAlign:"right",fontSize:9,color:C.sub,fontFamily:C.mono,flexShrink:0}}>{s.end}d</div>
        </div>
      ))}
      {CD>0&&<div style={{display:"flex",alignItems:"center",gap:5,marginTop:8,fontSize:9,color:C.sub}}><div style={{width:10,height:10,background:C.yel,borderRadius:2,opacity:.9}}/><span>Client deadline: Day {CD}</span></div>}
      <div style={{marginTop:10,padding:"10px 14px",background:C.surf,borderRadius:8,border:`1px solid ${C.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
        <span style={{fontSize:11,color:C.sub}}>Total Lead Time</span>
        <span style={{fontSize:16,fontWeight:800,color:C.acc,fontFamily:C.mono}}>{total} Working Days</span>
      </div>
    </div>
  );
};

/* ── Donut ── */
const Donut=({slices})=>{
  const COLORS=["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444"];
  const tot=slices.reduce((s,d)=>s+(d.v||0),0)||1;
  let cum=0;
  const paths=slices.map((d,i)=>{
    const pct=(d.v||0)/tot,st=cum;cum+=pct;
    const a1=st*2*Math.PI-Math.PI/2,a2=(st+pct)*2*Math.PI-Math.PI/2;
    const lf=(pct>0.5)?1:0;
    const x1=80+55*Math.cos(a1),y1=80+55*Math.sin(a1);
    const x2=80+55*Math.cos(a2),y2=80+55*Math.sin(a2);
    return{d:`M80,80L${x1},${y1}A55,55,0,${lf},1,${x2},${y2}Z`,color:COLORS[i%5],label:d.label,pct};
  });
  return(
    <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
      <svg viewBox="0 0 160 160" style={{width:120,height:120,flexShrink:0}}>
        {paths.map((p,i)=><path key={i} d={p.d} fill={p.color} opacity={.88}><title>{p.label}: {(p.pct*100).toFixed(1)}%</title></path>)}
        <circle cx="80" cy="80" r="30" fill={C.card}/>
      </svg>
      <div style={{flex:1,minWidth:100}}>
        {paths.map((p,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:5,alignItems:"center",gap:8}}>
            <span style={{display:"flex",alignItems:"center",gap:5,color:C.sub}}><span style={{width:8,height:8,borderRadius:2,background:p.color,display:"inline-block",flexShrink:0}}/>{p.label}</span>
            <span style={{color:"#64748b",fontFamily:C.mono,fontSize:10}}>{(p.pct*100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Step bar ── */
const STEPS=[{id:1,icon:"⚙",label:"Setup"},{id:2,icon:"📥",label:"Input"},{id:3,icon:"✓",label:"Review"},{id:4,icon:"$",label:"Costs"},{id:5,icon:"📄",label:"Quote"}];

const StepBar=({step,setStep,sm})=>(
  <div style={{display:"flex",background:C.surf,borderBottom:`1px solid ${C.bdr}`,flexShrink:0}}>
    {STEPS.map((s,i)=>{
      const active=step===s.id,done=step>s.id;
      return(
        <div key={s.id} onClick={()=>done&&setStep(s.id)} style={{
          flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          padding:sm?"10px 4px":"11px 8px",gap:3,cursor:done?"pointer":"default",
          borderBottom:`2px solid ${active?C.acc:"transparent"}`,transition:"border-color .2s",
          background:active?C.acc+"0a":"transparent",
        }}>
          <span style={{fontSize:11,fontWeight:700,color:done?C.grn:active?C.acc:C.sub}}>{done?"✓":s.icon}</span>
          {!sm&&<span style={{fontSize:9,fontWeight:600,color:done?C.grn:active?C.acc:C.sub,letterSpacing:0.5}}>{s.label}</span>}
        </div>
      );
    })}
  </div>
);

/* ══════════════════════════════════════
   GROQ API KEY MODAL
══════════════════════════════════════ */
const KeyModal=({onSave})=>{
  const [key,setKey]=useState("");
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(6,11,24,.95)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:16,padding:32,maxWidth:480,width:"100%",boxShadow:"0 24px 80px rgba(0,0,0,.6)"}}>
        <div style={{fontSize:24,marginBottom:8}}>🦙</div>
        <h2 style={{fontSize:20,fontWeight:800,color:C.txt,marginBottom:6}}>Enter Groq API Key</h2>
        <p style={{fontSize:13,color:C.sub,marginBottom:20,lineHeight:1.7}}>
          Get a <b style={{color:C.acc}}>free Groq API key</b> at <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{color:C.acc}}>console.groq.com</a> — takes 30 seconds, no credit card required. Powers <b style={{color:C.pur}}>Llama 3.3 70B</b> for highly accurate RFQ extraction.
        </p>
        <div style={{background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:10,padding:14,marginBottom:16,fontSize:11,color:C.sub,lineHeight:1.8}}>
          <b style={{color:C.txt}}>Free tier:</b> 30 req/min · 6,000 tokens/min · Llama 3.3 70B · Llama 3.1 8B<br/>
          <b style={{color:C.txt}}>No billing required.</b> Key starts with <code style={{color:C.acc,fontFamily:C.mono}}>gsk_</code>
        </div>
        <Input
          value={key} onChange={e=>setKey(e.target.value)}
          placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxx"
          style={{fontFamily:C.mono,fontSize:12,marginBottom:12}}
        />
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <Btn variant="primary" onClick={()=>key.trim()&&onSave(key.trim())} disabled={!key.trim().startsWith("gsk_")}>
            Save & Start Extracting
          </Btn>
          <Btn variant="outline" onClick={()=>onSave("SKIP")}>Skip — Use Smart Rules</Btn>
        </div>
        <p style={{marginTop:14,fontSize:10,color:C.dim}}>Key is stored in browser memory only. Never sent anywhere except api.groq.com.</p>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   MAIN APP
══════════════════════════════════════ */
export default function App() {
  const {sm,lg}=useBP();

  /* ── Global currency state — single source of truth ── */
  const [ccy,    setCcy]    = useState("INR");
  const [ccyList,setCcyList]= useState(CURRENCIES);
  const [ccySrc, setCcySrc] = useState("Built-in");
  const curr = ccyList.find(c=>c.code===ccy)||ccyList[0];

  /* ── Company ── */
  const [companies, setCompanies] = useState(COMPANIES.map(c=>({...c})));
  const [coIdx,     setCoIdx]     = useState(0);
  const co = companies[coIdx];

  /* ── Workflow ── */
  const [step,      setStep]      = useState(1);
  const [email,     setEmail]     = useState("");
  const [files,     setFiles]     = useState([]);
  const [p,         setP]         = useState({material:"",thickness:"",length:"",width:"",quantity:"",process:"",finish:"",client:"",delivery:"",required_days:""});
  const [extras,    setExtras]    = useState([{label:"",amount:""}]);
  const [base,      setBase]      = useState(null);
  const [ov,        setOv]        = useState({});
  const [feas,      setFeas]      = useState(null);
  const [lt,        setLt]        = useState(null);
  const [qid]                     = useState(genQID);

  /* ── UI state ── */
  const [busy,      setBusy]      = useState(false);
  const [progress,  setProgress]  = useState({stage:"",pct:0,msg:""});
  const [toast,     setToast]     = useState(null);
  const [aiSrc,     setAiSrc]     = useState("");
  const [editRates, setEditRates] = useState(false);
  const [pdfBusy,   setPdfBusy]   = useState(false);
  const [groqKey,   setGroqKey]   = useState(() => sessionStorage.getItem("rfqa_groq_key")||"");
  const [showKeyModal, setShowKeyModal] = useState(false);

  const fileRef = useRef();

  /* ── Derived costs — recalculate whenever ccy, co, p, extras or overrides change ── */
  const activeExtras = extras.filter(e=>e.label&&e.amount);
  const displayCosts = base
    ? applyOv(
        calcCosts(p, co, ccy, activeExtras, ccyList),
        Object.keys(ov).length ? ov : null,
        p.quantity
      )
    : null;

  /* ── Toast helper ── */
  const showToast=(msg,type="ok",ms=4000)=>{
    setToast({msg,type});
    setTimeout(()=>setToast(null),ms);
  };

  /* ── Live exchange rates ── */
  useEffect(()=>{
    (async()=>{
      try{
        const r=await fetch("https://api.frankfurter.app/latest?from=INR&to=USD,EUR,GBP,AED,SGD,JPY,CNY,SAR,MYR,THB,MXN");
        if(r.ok){
          const d=await r.json();
          if(d?.rates){
            setCcyList(prev=>prev.map(c=>{
              if(c.code==="INR")return c;
              const lr=d.rates[c.code];
              return lr?{...c,rate:1/lr}:c;
            }));
            setCcySrc("Live");
          }
        }
      }catch(_){}
    })();
  },[]);

  /* ── File handling ── */
  const handleFiles=useCallback((incoming)=>{
    const items=Array.from(incoming)
      .filter(f=>f.type.startsWith("image/"))
      .map(f=>({file:f,name:f.name,url:URL.createObjectURL(f),type:f.type}));
    setFiles(prev=>[...prev,...items].slice(0,6));
  },[]);

  /* ── Compute costs ── */
  function run(){
    const c=calcCosts(p,co,ccy,activeExtras,ccyList);
    setBase(c);setFeas(calcFeas(p));setLt(calcLT(p,c.mhrs));setOv({});setStep(4);
  }

  /* ── AI Extract ── */
  async function doAI(){
    if(!email.trim()&&files.length===0){showToast("Paste an RFQ email or upload drawings first.","err");return;}
    setBusy(true);
    const onProg=(stage,pct,msg)=>setProgress({stage,pct,msg});
    try{
      const key=groqKey&&groqKey!=="SKIP"?groqKey:GROQ_KEY;
      /* Temporarily patch GROQ_KEY */
      const imgFiles=files.map(f=>f.file);
      const {data,src}=await (async()=>{
        // Inline with user key
        const imgs=imgFiles.filter(f=>f&&f.type&&f.type.startsWith("image/"));
        const hasTxt=email&&email.trim().length>10;
        const hasImgs=imgs.length>0;

        let ocrText="";
        if(hasImgs){
          onProg("ocr",0,"Running Tesseract OCR on drawings…");
          const parts=[];
          for(let i=0;i<imgs.length;i++){
            try{
              const t=await ocrFile(imgs[i],pct=>onProg("ocr",Math.round((i/imgs.length)*100+pct/imgs.length),`OCR drawing ${i+1}/${imgs.length}…`));
              if(t.trim())parts.push(`[DRAWING ${i+1} OCR]\n${t.trim()}`);
            }catch(e){console.warn("OCR",e);}
          }
          ocrText=parts.join("\n\n");
        }

        const combined=[
          hasTxt?`[EMAIL / RFQ TEXT]\n${email.trim()}`:"",
          ocrText?ocrText:"",
        ].filter(Boolean).join("\n\n");

        const regexResult=regexParse(combined);
        if(!combined.trim())return{data:regexResult,src:"Smart Rules"};

        onProg("ai",10,"Calling Llama 3.3 70B via Groq…");

        /* Groq with actual key */
        const callGroq=async(model)=>{
          const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{
            method:"POST",
            headers:{"Content-Type":"application/json","Authorization":`Bearer ${key}`},
            body:JSON.stringify({
              model,
              messages:buildLlamaPrompt(combined),
              max_tokens:400,temperature:0,
              response_format:{type:"json_object"},
            }),
          });
          if(!r.ok){const t=await r.text();throw new Error(`Groq ${r.status}: ${t}`);}
          const d=await r.json();
          if(d.error)throw new Error(d.error.message);
          const raw=d?.choices?.[0]?.message?.content||"";
          const j=parseJSON(raw);
          if(!j)throw new Error("no JSON");
          return j;
        };

        for(const model of["llama-3.3-70b-versatile","llama-3.1-70b-versatile","llama-3.1-8b-instant"]){
          try{
            onProg("ai",30,`Calling ${model}…`);
            const j=await callGroq(model);
            const data=merge(j,regexResult);
            onProg("ai",100,"Done!");
            const src=hasImgs&&hasTxt?`Llama 3.3 70B + OCR (Email+Drawing)`:hasImgs?`Llama 3.3 70B + OCR (Drawing)`:`Llama 3.3 70B (Email)`;
            return{data,src};
          }catch(e){console.warn(`[${model}]`,e.message);}
        }

        /* Fallback */
        onProg("ai",100,"Using smart rules…");
        return{data:regexResult,src:"Smart Rules"+(ocrText?" + OCR":"")};
      })();

      const cleaned=Object.fromEntries(
        Object.entries(data).map(([k,v])=>[k,
          v===null||v===undefined?"":
          String((v===0&&["thickness","length","width","quantity"].includes(k))?"":v)
        ])
      );
      setP(prev=>({...prev,...cleaned}));
      setAiSrc(src);
      showToast(`✓ Extracted via ${src}`,"ok");
      setStep(3);
    }catch(e){
      showToast(`Extraction error: ${e.message}`,"err");
    }finally{
      setBusy(false);
      setProgress({stage:"",pct:0,msg:""});
    }
  }

  function doRegex(){
    if(!email.trim()){showToast("Paste email text first.","err");return;}
    const d=regexParse(email);
    setP(prev=>({...prev,...d}));
    setAiSrc("Smart Rules");
    showToast("✓ Smart rules extraction done — review below.","ok");
    setStep(3);
  }

  async function doPDF(){
    if(!displayCosts)return;
    setPdfBusy(true);
    try{await exportPDF(qid,p,displayCosts,feas,co,activeExtras,lt);}
    catch(e){showToast("PDF error: "+e.message,"err");}
    setPdfBusy(false);
  }

  function reset(){
    setStep(1);setBase(null);setFeas(null);setLt(null);setOv({});
    setEmail("");setFiles([]);
    setP({material:"",thickness:"",length:"",width:"",quantity:"",process:"",finish:"",client:"",delivery:"",required_days:""});
    setExtras([{label:"",amount:""}]);setToast(null);setAiSrc("");
  }

  function setCoF(k,v){setCompanies(prev=>prev.map((c,i)=>i===coIdx?{...c,[k]:v}:c));}

  const REQ=["material","thickness","length","width","quantity","process"];
  const missing=REQ.filter(k=>!p[k]);
  const valid=missing.length===0;
  const MC={err:C.red,warn:C.yel,ok:C.grn};

  /* Cost rows for table */
  const CROW=base?[
    {k:"material",  label:"Material",   det:`${p.material} · ${base.weight.toFixed(4)} kg`},
    {k:"machine",   label:"Machine",    det:`${p.process} · ${base.mhrs.toFixed(2)} hrs`},
    {k:"labor",     label:"Labor",      det:"Operator & supervision"},
    {k:"setup",     label:"Setup",      det:"Machine setup & tooling"},
    {k:"finishing", label:"Finishing",  det:p.finish||"Surface treatment"},
    {k:"packaging", label:"Packaging",  det:"Protective packing"},
    {k:"transport", label:"Transport",  det:`To ${p.delivery||"destination"}`},
    ...(base.extra>0?[{k:"extra",label:"Additional",det:"Extra charges"}]:[]),
    {k:"profit",    label:`Profit ${(co.margin*100).toFixed(0)}%`,det:"Overhead & margin"},
  ]:[];

  const BARCOLS=["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899","#84cc16","#f97316"];
  const pad=sm?"12px":"20px 24px";

  const fmtAmt=v=>`${curr.sym}${Number(v||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`;

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.txt,fontFamily:C.ff,display:"flex",flexDirection:"column",fontSize:14,lineHeight:1.5}}>

      {/* API Key Modal */}
      {showKeyModal&&<KeyModal onSave={k=>{
        if(k!=="SKIP"){sessionStorage.setItem("rfqa_groq_key",k);setGroqKey(k);}
        setShowKeyModal(false);
      }}/>}

      {/* Toast */}
      {toast&&(
        <div style={{position:"fixed",bottom:24,right:24,zIndex:999,padding:"12px 18px",background:toast.type==="err"?C.red:C.grn,color:"#fff",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 8px 32px rgba(0,0,0,.4)",maxWidth:360,animation:"fadeIn .2s ease",display:"flex",gap:10,alignItems:"center"}}>
          <span>{toast.type==="err"?"✕":"✓"}</span><span>{toast.msg}</span>
        </div>
      )}

      {/* ── TOP NAV ── */}
      <div style={{background:C.surf,borderBottom:`1px solid ${C.bdr}`,padding:`0 ${sm?12:24}px`,height:52,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#fff",flexShrink:0}}>R</div>
          <div>
            <div style={{fontWeight:800,fontSize:sm?14:16,color:C.txt,letterSpacing:-0.3}}>RFQ<span style={{color:C.acc}}>Analyzer</span></div>
            {!sm&&<div style={{fontSize:9,color:C.sub,marginTop:-2,letterSpacing:0.5}}>AI-Powered Fabrication Quotation</div>}
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
          {/* ── THE SINGLE GLOBAL CURRENCY CONTROL ── */}
          <CurrencySelect ccy={ccy} setCcy={setCcy} ccyList={ccyList} size="sm"/>
          <Badge color={ccySrc==="Live"?C.grn:C.yel}>{ccySrc==="Live"?"Live ✓":"Rates"}</Badge>
          {displayCosts&&<Badge color={C.acc}>{curr.sym}{Math.round(displayCosts.total).toLocaleString()} {ccy}</Badge>}
          {!sm&&(
            <Btn variant="outline" size="sm" onClick={()=>setShowKeyModal(true)}>
              🦙 Groq Key{groqKey&&groqKey!=="SKIP"?" ✓":""}
            </Btn>
          )}
        </div>
      </div>

      {/* Step bar */}
      <StepBar step={step} setStep={setStep} sm={sm}/>

      {/* ── CONTENT ── */}
      <div style={{flex:1,overflowY:"auto",padding:pad,maxWidth:1440,width:"100%",margin:"0 auto",boxSizing:"border-box"}} className="fade">

        {/* ══════ STEP 1: SETUP ══════ */}
        {step===1&&(
          <>
            <div style={{marginBottom:20}}>
              <h1 style={{fontSize:sm?18:24,fontWeight:800,color:C.txt,marginBottom:4}}>Company Setup</h1>
              <p style={{fontSize:12,color:C.sub}}>Configure your company profile, machine rates and default currency. All values update instantly across the entire app.</p>
            </div>

            {/* AI key notice */}
            <div style={{padding:"14px 18px",background:`linear-gradient(135deg,${C.pur}12,${C.acc}08)`,border:`1px solid ${C.pur}30`,borderRadius:12,marginBottom:16,display:"flex",alignItems:sm?"flex-start":"center",gap:14,flexWrap:"wrap"}}>
              <div style={{fontSize:28}}>🦙</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,color:C.txt,marginBottom:3}}>Llama 3.3 70B — Free, No Credit Card</div>
                <div style={{fontSize:11,color:C.sub,lineHeight:1.7}}>
                  Get your free Groq API key at <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{color:C.acc}}>console.groq.com</a> (30 seconds). Powers highly accurate RFQ extraction from emails and engineering drawings. Falls back to smart regex rules if no key.
                </div>
              </div>
              <Btn variant="purple" size="sm" onClick={()=>setShowKeyModal(true)}>
                {groqKey&&groqKey!=="SKIP"?"✓ Key Saved":"Set API Key"}
              </Btn>
            </div>

            <div style={{display:"grid",gridTemplateColumns:sm?"1fr":lg?"1fr 1fr":"1fr 1fr",gap:14}}>
              <Card>
                <SectionTitle>🏢 Company Profile</SectionTitle>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <Field label="Select Company">
                    <Select value={coIdx} onChange={e=>setCoIdx(+e.target.value)}>
                      {companies.map((c,i)=><option key={i} value={i}>{c.name}</option>)}
                    </Select>
                  </Field>
                  <Field label="Default Currency" hint="This is the global currency — change it anywhere in the app to update all values">
                    <CurrencySelect ccy={ccy} setCcy={setCcy} ccyList={ccyList}/>
                  </Field>
                  <div style={{padding:"10px 14px",background:C.surf,borderRadius:8,border:`1px solid ${C.bdr}`,fontSize:12,color:C.sub}}>
                    Preview: <b style={{color:C.acc}}>₹10,000 = {curr.sym}{(10000/curr.rate).toFixed(2)} {ccy}</b>
                    <span style={{marginLeft:12,color:ccySrc==="Live"?C.grn:C.yel,fontSize:11}}>{ccySrc==="Live"?"● Live rates":"● Built-in rates"}</span>
                  </div>
                </div>
              </Card>

              <Card>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
                  <SectionTitle>💰 Machine Rates (₹/hr)</SectionTitle>
                  <Btn variant={editRates?"success":"outline"} size="sm" onClick={()=>setEditRates(v=>!v)}>
                    {editRates?"✓ Done":"✏ Edit"}
                  </Btn>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {[
                    {k:"laser",l:"Laser"},  {k:"cnc",l:"CNC"},     {k:"bend",l:"Bending"},
                    {k:"weld",l:"Welding"}, {k:"grind",l:"Grinding"},{k:"labor",l:"Labor/hr"},
                  ].map(({k,l})=>(
                    <div key={k} style={{background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:9,padding:"10px 12px"}}>
                      <div style={{fontSize:9,color:C.sub,marginBottom:4,textTransform:"uppercase",letterSpacing:.8}}>{l}</div>
                      {editRates
                        ?<input type="number" value={co[k]} onChange={e=>setCoF(k,+e.target.value)} style={{background:"transparent",border:"none",borderBottom:`1px solid ${C.acc}`,color:C.acc,fontSize:16,fontWeight:800,fontFamily:C.mono,width:"100%",outline:"none",padding:"2px 0"}}/>
                        :<div style={{fontSize:16,fontWeight:800,color:C.acc,fontFamily:C.mono}}>₹{co[k]}</div>
                      }
                    </div>
                  ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:8}}>
                  {[
                    {k:"finish",l:"Finishing",c:C.pur},{k:"pkg",l:"Packaging",c:C.pur},{k:"tr",l:"Transport",c:C.pur},
                  ].map(({k,l,c})=>(
                    <div key={k} style={{background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:9,padding:"10px 12px"}}>
                      <div style={{fontSize:9,color:C.sub,marginBottom:4,textTransform:"uppercase",letterSpacing:.8}}>{l}</div>
                      {editRates
                        ?<input type="number" value={co[k]} onChange={e=>setCoF(k,+e.target.value)} style={{background:"transparent",border:"none",borderBottom:`1px solid ${c}`,color:c,fontSize:16,fontWeight:800,fontFamily:C.mono,width:"100%",outline:"none",padding:"2px 0"}}/>
                        :<div style={{fontSize:16,fontWeight:800,color:c,fontFamily:C.mono}}>₹{co[k]}</div>
                      }
                    </div>
                  ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr",gap:8,marginTop:8}}>
                  <div style={{background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:9,padding:"10px 12px"}}>
                    <div style={{fontSize:9,color:C.sub,marginBottom:4,textTransform:"uppercase",letterSpacing:.8}}>Profit Margin %</div>
                    {editRates
                      ?<input type="number" value={(co.margin*100).toFixed(0)} onChange={e=>setCoF("margin",+e.target.value/100)} style={{background:"transparent",border:"none",borderBottom:`1px solid ${C.grn}`,color:C.grn,fontSize:16,fontWeight:800,fontFamily:C.mono,width:"100%",outline:"none",padding:"2px 0"}}/>
                      :<div style={{fontSize:16,fontWeight:800,color:C.grn,fontFamily:C.mono}}>{(co.margin*100).toFixed(0)}%</div>
                    }
                  </div>
                </div>
              </Card>
            </div>

            <div style={{display:"flex",justifyContent:"flex-end",marginTop:4}}>
              <Btn variant="primary" onClick={()=>setStep(2)}>Continue to RFQ Input →</Btn>
            </div>
          </>
        )}

        {/* ══════ STEP 2: RFQ INPUT ══════ */}
        {step===2&&(
          <>
            <div style={{marginBottom:16}}>
              <h1 style={{fontSize:sm?18:24,fontWeight:800,color:C.txt,marginBottom:4}}>RFQ Input</h1>
              <p style={{fontSize:12,color:C.sub}}>Provide email and/or upload engineering drawings — Llama 3.3 70B extracts all parameters with high accuracy.</p>
            </div>

            {/* AI engine status */}
            <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
              <Badge color={C.pur}>🦙 Llama 3.3 70B</Badge>
              <Badge color={C.cyan}>📷 Tesseract OCR</Badge>
              <Badge color={C.grn}>Smart Rules fallback</Badge>
              {groqKey&&groqKey!=="SKIP"
                ?<Badge color={C.grn}>Key: ✓ Active</Badge>
                :<span style={{fontSize:10,color:C.yel}}>⚠ No Groq key — <button onClick={()=>setShowKeyModal(true)} style={{color:C.acc,background:"none",border:"none",cursor:"pointer",fontSize:10,textDecoration:"underline",padding:0}}>add key for AI</button> or use smart rules</span>
              }
            </div>

            {/* Dual input layout */}
            <div style={{display:"grid",gridTemplateColumns:lg?"1fr 1fr":"1fr",gap:14,marginBottom:14}}>

              {/* EMAIL */}
              <Card style={{marginBottom:0}}>
                <SectionTitle>📧 Email / RFQ Text</SectionTitle>
                <div style={{fontSize:10,color:C.sub,marginBottom:10,lineHeight:1.8,padding:"8px 12px",background:C.surf,borderRadius:8,border:`1px solid ${C.bdr}`}}>
                  <b style={{color:C.txt}}>What AI extracts from email:</b> client name, delivery city, deadline, quantity, material, process, finish, dimensions mentioned in text.
                </div>
                <textarea
                  value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder={"Paste the complete RFQ email here.\n\nExample:\n\nFrom: procurement@acme.com\nSubject: RFQ - Steel Brackets Q2 2025\n\nDear Team,\n\nPlease quote for 50 pcs of Mild Steel brackets.\nSize: 200 x 100 mm, 5mm thick.\nProcess: Laser Cutting\nFinish: Powder Coat (black)\nDeliver to: Chennai factory\nRequired within 12 working days.\n\nRegards, ABC Industries"}
                  style={{background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:9,padding:14,color:C.txt,fontSize:12.5,width:"100%",boxSizing:"border-box",fontFamily:C.ff,outline:"none",resize:"vertical",minHeight:sm?160:240,lineHeight:1.7,transition:"border-color .2s"}}
                  onFocus={e=>e.target.style.borderColor=C.acc}
                  onBlur={e=>e.target.style.borderColor=C.bdr}
                />
                {email.trim()&&<div style={{marginTop:6,fontSize:10,color:C.grn}}>✓ {email.trim().split(/\s+/).length} words ready for extraction</div>}
              </Card>

              {/* DRAWINGS */}
              <Card style={{marginBottom:0}}>
                <SectionTitle>📐 CAD Drawings / Images</SectionTitle>
                <div style={{fontSize:10,color:C.sub,marginBottom:10,lineHeight:1.8,padding:"8px 12px",background:C.surf,borderRadius:8,border:`1px solid ${C.bdr}`}}>
                  <b style={{color:C.txt}}>What OCR extracts from drawings:</b> dimensions from dimension lines, title block (material, part number, scale), BOM table (material, qty, thickness), surface finish callouts.
                </div>
                <div
                  onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor=C.pur;}}
                  onDragLeave={e=>{e.currentTarget.style.borderColor=files.length?C.pur:C.bdr;}}
                  onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor=files.length?C.pur:C.bdr;handleFiles(e.dataTransfer.files);}}
                  onClick={()=>fileRef.current?.click()}
                  style={{border:`2px dashed ${files.length?C.pur:C.bdr}`,borderRadius:10,padding:"20px 16px",textAlign:"center",cursor:"pointer",transition:"border-color .2s",minHeight:80,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
                  <div style={{fontSize:32}}>📐</div>
                  <div style={{fontSize:12,fontWeight:600,color:C.sub}}>Drop drawings or click to browse</div>
                  <div style={{fontSize:10,color:C.dim}}>PNG · JPG · JPEG · WEBP · TIFF (max 6)</div>
                  <input ref={fileRef} type="file" multiple accept="image/*" onChange={e=>handleFiles(e.target.files)} style={{display:"none"}}/>
                </div>

                {files.length>0&&(
                  <div style={{marginTop:12}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.pur,marginBottom:8,letterSpacing:.8,textTransform:"uppercase"}}>
                      {files.length} drawing(s) — Tesseract OCR + Llama will extract specs
                    </div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {files.map((f,i)=>(
                        <div key={i} style={{position:"relative",width:sm?60:72,height:sm?60:72,borderRadius:9,overflow:"hidden",border:`2px solid ${C.pur}50`,background:C.surf,flexShrink:0}}>
                          <img src={f.url} alt={f.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          <button onClick={ev=>{ev.stopPropagation();setFiles(prev=>prev.filter((_,j)=>j!==i));}}
                            style={{position:"absolute",top:2,right:2,width:16,height:16,borderRadius:"50%",background:C.red,border:"none",color:"#fff",fontSize:9,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>✕</button>
                          <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(6,11,24,.85)",fontSize:7,color:C.pur,padding:"2px 3px",textAlign:"center",fontWeight:700}}>DRAWING</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Progress bar when busy */}
            {busy&&(
              <div style={{marginBottom:12,padding:"12px 16px",background:C.card,border:`1px solid ${C.bdr}`,borderRadius:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:11}}>
                  <span style={{color:C.acc,fontWeight:600}}>{progress.msg||"Processing…"}</span>
                  <span style={{color:C.sub,fontFamily:C.mono}}>{progress.pct}%</span>
                </div>
                <div style={{height:4,background:C.dim,borderRadius:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${progress.pct}%`,background:`linear-gradient(90deg,${C.pur},${C.acc})`,borderRadius:4,transition:"width .3s"}}/>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <Card>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
                <Btn variant="primary" disabled={busy} onClick={doAI} size={sm?"md":"lg"}>
                  {busy?"⏳ Extracting…":
                    files.length>0&&email.trim()?"🦙 Extract — Email + Drawings":
                    files.length>0?"🦙 Extract from Drawings":"🦙 Extract from Email"}
                </Btn>
                <Btn variant="outline" onClick={doRegex} disabled={busy}>🔍 Smart Rules Only</Btn>
                <Btn variant="ghost" onClick={()=>setStep(3)}>✏ Manual Entry</Btn>
                {aiSrc&&<Badge color={C.grn}>Last: {aiSrc}</Badge>}
              </div>
              {!groqKey||groqKey==="SKIP"?
                <div style={{marginTop:10,padding:"8px 12px",background:C.yel+"10",border:`1px solid ${C.yel}25`,borderRadius:8,fontSize:11,color:C.yel}}>
                  ⚠ No Groq key — AI extraction will use smart regex rules. <button onClick={()=>setShowKeyModal(true)} style={{color:C.acc,background:"none",border:"none",cursor:"pointer",textDecoration:"underline",fontSize:11,padding:0}}>Add free Groq key for Llama AI →</button>
                </div>
              :
                <div style={{marginTop:10,fontSize:10,color:C.sub,lineHeight:1.8}}>
                  <b style={{color:C.txt}}>Extraction pipeline:</b> Tesseract OCR (drawings) → Llama 3.3 70B → Llama 3.1 8B → Smart Rules. Results are merged for maximum accuracy.
                </div>
              }
            </Card>

            <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
              <Btn variant="outline" onClick={()=>setStep(1)}>← Back</Btn>
              <Btn variant="primary" onClick={()=>setStep(3)}>Review Parameters →</Btn>
            </div>
          </>
        )}

        {/* ══════ STEP 3: REVIEW ══════ */}
        {step===3&&(
          <>
            <div style={{marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
              <div>
                <h1 style={{fontSize:sm?18:24,fontWeight:800,color:C.txt,marginBottom:4}}>Review Parameters</h1>
                <p style={{fontSize:12,color:C.sub}}>Verify extracted values. Correct any errors. Required fields marked *.</p>
              </div>
              {aiSrc&&<Badge color={C.grn}>Source: {aiSrc}</Badge>}
            </div>

            <div style={{display:"grid",gridTemplateColumns:sm?"1fr":lg?"1fr 1fr":"1fr 1fr",gap:14}}>
              <Card>
                <SectionTitle>👤 Client & Delivery</SectionTitle>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <Field label="Client / Company Name"><Input value={p.client} onChange={e=>setP(x=>({...x,client:e.target.value}))} placeholder="e.g. ACME Engineering Pvt Ltd"/></Field>
                  <Field label="Delivery Location"><Input value={p.delivery} onChange={e=>setP(x=>({...x,delivery:e.target.value}))} placeholder="e.g. Chennai, Tamil Nadu"/></Field>
                  <Field label="Required Delivery (Days)" hint="Days client needs delivery in — used for lead time comparison">
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <Input type="number" min="1" value={p.required_days} onChange={e=>setP(x=>({...x,required_days:e.target.value}))} placeholder="e.g. 12" style={{maxWidth:120}}/>
                      {p.required_days&&<Badge color={C.yel}>Target: {p.required_days} days</Badge>}
                    </div>
                  </Field>
                </div>
              </Card>

              <Card>
                <SectionTitle>🔩 Part Specifications</SectionTitle>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <Field label="Material" required error={!p.material&&missing.includes("material")?"Required":""}>
                      <Select value={p.material} onChange={e=>setP(x=>({...x,material:e.target.value}))}>
                        <option value="">— Select —</option>
                        {MATS.map(m=><option key={m.name}>{m.name}</option>)}
                      </Select>
                      {p.material&&(()=>{const m=MATS.find(x=>x.name===p.material);return m?<span style={{fontSize:9,color:C.grn}}>{m.density}kg/m³ · ₹{m.ppkg}/kg</span>:null;})()}
                    </Field>
                    <Field label="Process" required error={!p.process&&missing.includes("process")?"Required":""}>
                      <Select value={p.process} onChange={e=>setP(x=>({...x,process:e.target.value}))}>
                        <option value="">— Select —</option>
                        {PROCS.map(pr=><option key={pr.name}>{pr.name}</option>)}
                      </Select>
                      {p.process&&(()=>{const pr=PROCS.find(x=>x.name===p.process);return pr?<span style={{fontSize:9,color:C.grn}}>T: {pr.mint}–{pr.maxt}mm</span>:null;})()}
                    </Field>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                    <Field label="Thickness (mm)" required error={!p.thickness?"Required":""}><Input type="number" min=".1" step=".5" value={p.thickness} onChange={e=>setP(x=>({...x,thickness:e.target.value}))} placeholder="5"/></Field>
                    <Field label="Length (mm)" required error={!p.length?"Required":""}><Input type="number" min="1" value={p.length} onChange={e=>setP(x=>({...x,length:e.target.value}))} placeholder="200"/></Field>
                    <Field label="Width (mm)" required error={!p.width?"Required":""}><Input type="number" min="1" value={p.width} onChange={e=>setP(x=>({...x,width:e.target.value}))} placeholder="100"/></Field>
                  </div>
                  <Field label="Quantity (pcs)" required error={!p.quantity?"Required":""}><Input type="number" min="1" value={p.quantity} onChange={e=>setP(x=>({...x,quantity:e.target.value}))} placeholder="50"/></Field>
                  <Field label="Surface Finish" hint="e.g. Powder Coat, Anodize, Hot-Dip Galvanize, Mirror Polish, Shot Blast, Raw"><Input value={p.finish} onChange={e=>setP(x=>({...x,finish:e.target.value}))} placeholder="Powder Coat — Black RAL 9005"/></Field>
                </div>
              </Card>
            </div>

            <Card>
              {!valid
                ?<div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
                  <div style={{padding:"8px 12px",background:C.red+"15",border:`1px solid ${C.red}30`,borderRadius:8,fontSize:12,color:C.red,flex:1}}>Complete required fields to proceed.</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{missing.map(f=><Badge key={f} color={C.red}>{f}</Badge>)}</div>
                </div>
                :<div style={{padding:"10px 14px",background:C.grn+"12",border:`1px solid ${C.grn}28`,borderRadius:8,fontSize:12,color:C.grn,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                  <span>✓ All required fields complete — ready to calculate</span>
                  {p.required_days&&<Badge color={C.yel}>Client target: {p.required_days} days</Badge>}
                </div>
              }
            </Card>

            <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
              <Btn variant="outline" onClick={()=>setStep(2)}>← Back</Btn>
              <Btn variant="primary" disabled={!valid} onClick={run} size="lg">Calculate Costs →</Btn>
            </div>
          </>
        )}

        {/* ══════ STEP 4: COSTS ══════ */}
        {step===4&&base&&displayCosts&&(()=>{
          const maxV=Math.max(...CROW.map(r=>displayCosts[r.k]||0),1);
          return(
            <>
              <div style={{marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
                <div>
                  <h1 style={{fontSize:sm?18:24,fontWeight:800,color:C.txt,marginBottom:4}}>Cost Analysis</h1>
                  <p style={{fontSize:12,color:C.sub}}>Click any amount to edit. Currency updates all values instantly.</p>
                </div>
                {/* ── Currency control — appears again here for quick access ── */}
                <CurrencySelect ccy={ccy} setCcy={setCcy} ccyList={ccyList} size="sm"/>
              </div>

              {/* Stats */}
              <div style={{display:"grid",gridTemplateColumns:sm?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:14}}>
                <Stat icon="💰" label="Total Cost" value={`${curr.sym}${Math.round(displayCosts.total).toLocaleString()}`} color={C.acc}/>
                <Stat icon="🔩" label="Per Part" value={`${curr.sym}${displayCosts.per_part.toFixed(2)}`} color={C.pur}/>
                <Stat icon="📅" label="Lead Time" value={lt?`${lt.total}d`:"—"} color={C.grn}
                  sub={p.required_days?(lt?.total<=+p.required_days?"✓ Within target":"⚠ Over target"):undefined}/>
                <Stat icon="⚠" label="Complexity" value={feas.complexity}
                  color={feas.complexity==="High"?C.red:feas.complexity==="Medium"?C.yel:C.grn}/>
              </div>

              <div style={{display:"grid",gridTemplateColumns:lg?"1.6fr 1fr":"1fr",gap:14}}>
                {/* LEFT */}
                <div>
                  <Card>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
                      <SectionTitle>📊 Cost Breakdown — click to edit</SectionTitle>
                      {Object.keys(ov).length>0&&(
                        <Btn variant="ghost" size="sm" onClick={()=>setOv({})} style={{color:C.red,fontSize:11}}>↺ Reset overrides</Btn>
                      )}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"24px 1fr 100px",gap:8,padding:"4px 0 8px",borderBottom:`1px solid ${C.bdr}`}}>
                      <div/><div style={{fontSize:9,fontWeight:700,color:C.sub,letterSpacing:1,textTransform:"uppercase"}}>ITEM</div>
                      <div style={{fontSize:9,fontWeight:700,color:C.sub,letterSpacing:1,textTransform:"uppercase",textAlign:"right"}}>AMOUNT ({ccy})</div>
                    </div>
                    {CROW.map((row,i)=>{
                      const bv=base[row.k]||0;
                      const dv=displayCosts[row.k]||0;
                      const edited=ov[row.k]!==undefined;
                      return(
                        <div key={row.k} style={{display:"grid",gridTemplateColumns:"24px 1fr 100px",gap:8,alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${C.bg}`}}>
                          <div style={{width:8,height:8,borderRadius:2,background:BARCOLS[i%BARCOLS.length],flexShrink:0}}/>
                          <div>
                            <div style={{fontSize:11,fontWeight:600,color:edited?C.yel:"#94a3b8"}}>{row.label}</div>
                            <div style={{fontSize:9,color:C.sub,marginTop:1}}>{row.det}</div>
                            {edited&&<div style={{fontSize:9,color:C.dim,marginTop:1}}>calc: {curr.sym}{bv.toFixed(2)}</div>}
                          </div>
                          <div style={{position:"relative"}}>
                            <span style={{position:"absolute",left:6,top:"50%",transform:"translateY(-50%)",fontSize:9,color:C.sub,pointerEvents:"none",fontFamily:C.mono}}>{curr.sym}</span>
                            <input
                              type="number" step="0.01" value={dv.toFixed(2)}
                              onChange={e=>setOv(prev=>({...prev,[row.k]:Math.max(0,+e.target.value)}))}
                              style={{background:C.surf,border:`1px solid ${edited?C.yel+"70":C.bdr}`,borderRadius:7,padding:"7px 6px 7px 20px",color:edited?C.yel:C.txt,fontSize:11,fontWeight:700,width:"100%",boxSizing:"border-box",fontFamily:C.mono,outline:"none",textAlign:"right",transition:"border-color .2s"}}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <div style={{marginTop:12,padding:"12px 0",borderTop:`1px solid ${C.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:4}}>
                      <span style={{fontSize:sm?15:18,fontWeight:800,color:C.acc}}>TOTAL</span>
                      <span style={{fontSize:sm?15:18,fontWeight:800,color:C.acc,fontFamily:C.mono}}>{curr.sym}{displayCosts.total.toFixed(2)}</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.sub}}>
                      <span>Per Part</span>
                      <span style={{fontFamily:C.mono}}>{curr.sym}{displayCosts.per_part.toFixed(2)} × {p.quantity} pcs</span>
                    </div>
                    {Object.keys(ov).length>0&&<div style={{marginTop:10,padding:"7px 11px",background:C.yel+"0a",border:`1px solid ${C.yel}25`,borderRadius:7,fontSize:10,color:C.yel}}>✏ {Object.keys(ov).length} value(s) manually overridden. Click ↺ Reset to restore calculated values.</div>}

                    {/* Mini bars */}
                    <div style={{marginTop:14,borderTop:`1px solid ${C.bdr}`,paddingTop:12}}>
                      {CROW.map((row,i)=>{
                        const v=displayCosts[row.k]||0;
                        return(
                          <div key={row.k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                            <div style={{width:68,fontSize:9.5,color:C.sub,textAlign:"right",flexShrink:0,lineHeight:1.3}}>{row.label}</div>
                            <div style={{flex:1,background:C.dim+"55",borderRadius:4,height:16,overflow:"hidden"}}>
                              <div style={{width:`${Math.max(2,(v/maxV)*100)}%`,height:"100%",background:BARCOLS[i%BARCOLS.length],transition:"width .6s",borderRadius:4}}/>
                            </div>
                            <div style={{width:70,fontSize:9.5,color:C.txt,fontWeight:600,textAlign:"right",fontFamily:C.mono,flexShrink:0}}>{curr.sym}{v.toFixed(0)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Additional charges */}
                  <Card>
                    <SectionTitle>➕ Additional Charges</SectionTitle>
                    {extras.map((ex,i)=>(
                      <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
                        <Input value={ex.label} onChange={e=>setExtras(prev=>prev.map((c,j)=>j===i?{...c,label:e.target.value}:c))} placeholder="Label (GST, Inspection…)" style={{flex:2}}/>
                        <div style={{position:"relative",flex:1}}>
                          <span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",fontSize:10,color:C.sub}}>₹</span>
                          <Input type="number" value={ex.amount} onChange={e=>setExtras(prev=>prev.map((c,j)=>j===i?{...c,amount:e.target.value}:c))} placeholder="amount" style={{paddingLeft:20,fontFamily:C.mono}}/>
                        </div>
                        <Btn variant="ghost" size="sm" onClick={()=>setExtras(prev=>prev.filter((_,j)=>j!==i))} style={{color:C.red,flexShrink:0}}>✕</Btn>
                      </div>
                    ))}
                    <div style={{display:"flex",gap:8,marginTop:4,flexWrap:"wrap"}}>
                      <Btn variant="outline" size="sm" onClick={()=>setExtras(prev=>[...prev,{label:"",amount:""}])}>+ Add</Btn>
                      <Btn variant="primary" size="sm" onClick={run}>↻ Recalculate</Btn>
                    </div>
                  </Card>

                  {/* Gantt */}
                  {lt&&<Card><SectionTitle>📅 Production Schedule</SectionTitle><Gantt schedule={lt.schedule} total={lt.total} clientDays={p.required_days} compact={sm}/></Card>}
                </div>

                {/* RIGHT sidebar */}
                <div>
                  {/* Donut */}
                  <Card>
                    <SectionTitle>🍩 Cost Distribution</SectionTitle>
                    <Donut slices={[
                      {label:"Material", v:displayCosts.material||0},
                      {label:"Machine",  v:displayCosts.machine||0},
                      {label:"Labor",    v:displayCosts.labor||0},
                      {label:"Overhead", v:(displayCosts.setup||0)+(displayCosts.finishing||0)+(displayCosts.packaging||0)+(displayCosts.transport||0)+(displayCosts.extra||0)},
                      {label:"Profit",   v:displayCosts.profit||0},
                    ]}/>
                  </Card>

                  {/* Part info */}
                  <Card>
                    <SectionTitle>📐 Part Details</SectionTitle>
                    <KV label="Material"     value={base.mat.name} mono/>
                    <KV label="Density"      value={`${base.mat.density} kg/m³`} mono/>
                    <KV label="Part Weight"  value={`${base.weight.toFixed(5)} kg`} mono/>
                    <KV label="Mat. Rate"    value={`₹${base.mat.ppkg}/kg`} mono/>
                    <KV label="Process"      value={base.proc.name} mono/>
                    <KV label="Machine Hrs"  value={`${base.mhrs.toFixed(3)} hrs`} mono/>
                    <KV label="Quantity"     value={`${p.quantity} pcs`} mono/>
                    {p.required_days&&<div style={{marginTop:10,padding:"8px 11px",background:(lt&&lt.total>+p.required_days)?C.red+"10":C.grn+"10",border:`1px solid ${(lt&&lt.total>+p.required_days)?C.red+"28":C.grn+"28"}`,borderRadius:8,fontSize:11,color:(lt&&lt.total>+p.required_days)?"#fca5a5":C.grn}}>
                      Client: <b>{p.required_days}d</b> — We: <b>{lt?.total}d</b> {lt?.total<=+p.required_days?"✓ OK
Done
