import { useState, useRef, useEffect, useCallback } from "react";

/* --- inject globals once --- */
(() => {
  if (document.getElementById("rfqa-boot")) return;
  const m = document.createElement("meta");
  m.id = "rfqa-boot";
  m.name = "viewport";
  m.content = "width=device-width,initial-scale=1";
  document.head.appendChild(m);
  const f = document.createElement("link");
  f.rel = "stylesheet";
  f.href =
    "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap";
  document.head.appendChild(f);
  const s = document.createElement("style");
  s.textContent = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'DM Sans',system-ui,sans-serif;background:#07090f}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:#07090f}
    ::-webkit-scrollbar-thumb{background:#1e3050;border-radius:4px}
    input[type=number]::-webkit-inner-spin-button{opacity:1}
    .ri:focus{outline:none!important;border-color:#4f8fff!important;box-shadow:0 0 0 3px rgba(79,143,255,.15)!important}
    .rb{transition:filter .15s,transform .12s;cursor:pointer}
    .rb:hover:not(:disabled){filter:brightness(1.1);transform:translateY(-1px)}
    .rb:active:not(:disabled){transform:translateY(0)}
    .rb:disabled{opacity:.4;cursor:not-allowed!important}
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
    .fade{animation:fadeUp .22s ease}
    .spin{animation:spin .9s linear infinite}
  `;
  document.head.appendChild(s);
})();

function useBP() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return { sm: w < 700, lg: w >= 1080 };
}

/* -- DATA -- */
const MATS = [
  { name: "Mild Steel", density: 7850, ppkg: 80 },
  { name: "Stainless Steel 304", density: 8000, ppkg: 180 },
  { name: "Aluminium 6061", density: 2700, ppkg: 250 },
  { name: "Carbon Steel", density: 7850, ppkg: 90 },
  { name: "Galvanized Steel", density: 7850, ppkg: 95 },
  { name: "Brass", density: 8500, ppkg: 300 },
  { name: "Copper", density: 8960, ppkg: 450 },
  { name: "Tool Steel", density: 7750, ppkg: 350 },
  { name: "Titanium", density: 4500, ppkg: 1200 },
  { name: "Cast Iron", density: 7200, ppkg: 65 },
];

const PROCS = [
  { name: "Laser Cutting", rate: 600, setup: 500, min_t: 0.5, max_t: 25 },
  { name: "CNC Machining", rate: 900, setup: 1000, min_t: 1, max_t: 200 },
  { name: "Bending", rate: 400, setup: 300, min_t: 0.5, max_t: 20 },
  { name: "Welding", rate: 500, setup: 400, min_t: 1, max_t: 50 },
  { name: "Grinding", rate: 300, setup: 200, min_t: 0.5, max_t: 100 },
  { name: "Plasma Cutting", rate: 350, setup: 400, min_t: 1, max_t: 60 },
  { name: "Waterjet Cutting", rate: 700, setup: 600, min_t: 0.5, max_t: 200 },
  { name: "EDM", rate: 1200, setup: 1500, min_t: 0.1, max_t: 300 },
  { name: "Turning", rate: 600, setup: 800, min_t: 5, max_t: 500 },
  { name: "Milling", rate: 750, setup: 900, min_t: 1, max_t: 300 },
];

const INIT_COS = [
  {
    name: "DFAB Industries",
    laser: 600,
    cnc: 900,
    bending: 400,
    welding: 500,
    grinding: 300,
    labor: 150,
    finishing: 50,
    packaging: 40,
    transport: 100,
    margin: 0.2,
  },
  {
    name: "AlphaFabrication",
    laser: 550,
    cnc: 850,
    bending: 380,
    welding: 480,
    grinding: 280,
    labor: 140,
    finishing: 45,
    packaging: 35,
    transport: 90,
    margin: 0.18,
  },
  {
    name: "PrecisionWorks",
    laser: 700,
    cnc: 1100,
    bending: 450,
    welding: 600,
    grinding: 350,
    labor: 180,
    finishing: 60,
    packaging: 50,
    transport: 120,
    margin: 0.25,
  },
  {
    name: "GlobalMetal",
    laser: 500,
    cnc: 800,
    bending: 350,
    welding: 450,
    grinding: 250,
    labor: 130,
    finishing: 40,
    packaging: 30,
    transport: 80,
    margin: 0.15,
  },
  {
    name: "MetalCraft",
    laser: 620,
    cnc: 950,
    bending: 420,
    welding: 520,
    grinding: 310,
    labor: 160,
    finishing: 55,
    packaging: 45,
    transport: 110,
    margin: 0.22,
  },
  {
    name: "Custom Company",
    laser: 600,
    cnc: 900,
    bending: 400,
    welding: 500,
    grinding: 300,
    labor: 150,
    finishing: 50,
    packaging: 40,
    transport: 100,
    margin: 0.2,
  },
];

const INIT_CCY = [
  { code: "INR", sym: "Rs", name: "Indian Rupee", rate: 1 },
  { code: "USD", sym: "$", name: "US Dollar", rate: 83.5 },
  { code: "EUR", sym: "E", name: "Euro", rate: 91.2 },
  { code: "GBP", sym: "L", name: "British Pound", rate: 106.3 },
  { code: "AED", sym: "AED", name: "UAE Dirham", rate: 22.7 },
  { code: "SGD", sym: "S$", name: "Singapore Dollar", rate: 62.1 },
  { code: "JPY", sym: "Y", name: "Japanese Yen", rate: 0.56 },
  { code: "CNY", sym: "CN", name: "Chinese Yuan", rate: 11.5 },
  { code: "SAR", sym: "SR", name: "Saudi Riyal", rate: 22.3 },
  { code: "MYR", sym: "RM", name: "Malaysian Ringgit", rate: 18.4 },
];

/* -- COST ENGINE -- */
function calcCosts(p, co, ccyCode, extras, ccyList) {
  const mat = MATS.find((m) => m.name === p.material) || MATS[0];
  const proc = PROCS.find((x) => x.name === p.process) || PROCS[0];
  const ccy =
    (ccyList || INIT_CCY).find((c) => c.code === ccyCode) || INIT_CCY[0];
  const L = +p.length || 200,
    W = +p.width || 100,
    T = +p.thickness || 5,
    Q = +p.quantity || 1;
  const vol = (L / 1000) * (W / 1000) * (T / 1000);
  const wt = vol * mat.density;
  const matINR = wt * mat.ppkg;
  const rateMap = {
    "laser cutting": co.laser,
    "plasma cutting": co.laser * 0.58,
    "waterjet cutting": co.laser * 1.18,
    "cnc machining": co.cnc,
    edm: co.cnc * 1.3,
    turning: co.cnc * 0.7,
    milling: co.cnc * 0.85,
    bending: co.bending,
    welding: co.welding,
    grinding: co.grinding,
  };
  const mr = rateMap[proc.name.toLowerCase()] || co.laser;
  const mhrs = Math.max(0.25, (L / 1000) * (W / 1000) * 2.5 + T * 0.02);
  const machINR = mhrs * mr;
  const labINR = mhrs * 0.8 * co.labor;
  const setupINR = proc.setup / Math.max(Q, 1);
  const finINR = co.finishing * Q;
  const pkgINR = co.packaging;
  const trINR = co.transport;
  const exINR = (extras || []).reduce((s, e) => s + (+e.amount || 0), 0);
  const sub =
    (matINR + machINR + labINR + setupINR + co.finishing) * Q +
    pkgINR +
    trINR +
    exINR;
  const profINR = sub * co.margin;
  const totINR = sub + profINR;
  const cv = (v) => v / ccy.rate;
  return {
    material: cv(matINR),
    machine: cv(machINR),
    labor: cv(labINR),
    setup: cv(setupINR * Q),
    finishing: cv(finINR),
    packaging: cv(pkgINR),
    transport: cv(trINR),
    extra: cv(exINR),
    profit: cv(profINR),
    total: cv(totINR),
    per_part: cv(totINR / Q),
    weight: wt,
    mhrs,
    ccy,
    mat,
    proc,
  };
}

function applyOv(base, ov, qty) {
  if (!ov || !Object.keys(ov).length) return base;
  const m = { ...base };
  for (const k of [
    "material",
    "machine",
    "labor",
    "setup",
    "finishing",
    "packaging",
    "transport",
    "extra",
    "profit",
  ])
    if (ov[k] !== undefined) m[k] = ov[k];
  m.total =
    m.material +
    m.machine +
    m.labor +
    m.setup +
    m.finishing +
    m.packaging +
    m.transport +
    m.extra +
    m.profit;
  m.per_part = m.total / Math.max(1, +qty || 1);
  return m;
}

function calcFeas(p) {
  const proc = PROCS.find((x) => x.name === p.process);
  const T = +p.thickness,
    L = +p.length,
    W = +p.width,
    Q = +p.quantity;
  const w = [];
  if (proc) {
    if (T > proc.max_t)
      w.push({
        lvl: "error",
        msg: `Thickness ${T}mm exceeds max for ${proc.name} (${proc.max_t}mm).`,
      });
    if (T < proc.min_t)
      w.push({
        lvl: "error",
        msg: `Thickness ${T}mm below min for ${proc.name} (${proc.min_t}mm).`,
      });
  }
  if ((p.material || "").toLowerCase().includes("titanium"))
    w.push({
      lvl: "warn",
      msg: "Titanium requires specialised tooling - longer lead time expected.",
    });
  if (L > 3000 || W > 1500)
    w.push({
      lvl: "warn",
      msg: `Part ${L}x${W}mm may exceed standard machine bed. Verify capacity.`,
    });
  if (Q < 5)
    w.push({
      lvl: "info",
      msg: "Low quantity - setup cost dominates per-unit price.",
    });
  if (Q > 1000)
    w.push({
      lvl: "info",
      msg: "High volume order - consider negotiating bulk discount.",
    });
  if ((p.finish || "").match(/mirror|polish/i))
    w.push({
      lvl: "warn",
      msg: "Mirror/polish finish adds ~20% cost and lead time.",
    });
  const e = w.filter((x) => x.lvl === "error").length,
    wn = w.filter((x) => x.lvl === "warn").length;
  return {
    warnings: w,
    complexity: e > 0 ? "High" : wn > 1 ? "Medium" : "Low",
  };
}

function calcLT(p, mhrs) {
  const Q = +p.quantity || 1,
    T = +p.thickness || 5;
  const qF = Math.max(1, Math.ceil(Q / 50));
  const tF = T > 20 ? 1.5 : T > 10 ? 1.2 : 1;
  const cF = ["CNC Machining", "EDM", "Milling", "Turning"].includes(p.process)
    ? 1.5
    : 1;
  const noFin =
    !p.finish ||
    ["raw", "none", "standard", ""].includes((p.finish || "").toLowerCase());
  const stages = [
    { label: "Order Confirmation", days: 1, color: "#4f8fff" },
    {
      label: "Material Procurement",
      days: Math.ceil((T > 15 ? 3 : 2) * tF),
      color: "#a78bfa",
    },
    { label: "Machine Setup", days: Math.ceil(cF), color: "#f59e0b" },
    {
      label: "Manufacturing",
      days: Math.max(1, Math.ceil((mhrs * qF * cF) / 8)),
      color: "#10b981",
    },
    {
      label: "Quality Inspection",
      days: Math.max(1, Math.ceil(Q / 200)),
      color: "#06b6d4",
    },
    ...(!noFin
      ? [
          {
            label: "Surface Finishing",
            days: Math.max(1, Math.ceil(Q / 100)),
            color: "#ec4899",
          },
        ]
      : []),
    { label: "Packing & Dispatch", days: 1, color: "#84cc16" },
  ];
  let cum = 0;
  return {
    schedule: stages.map((s) => {
      const st = cum + 1;
      cum += s.days;
      return { ...s, start: st, end: cum };
    }),
    total: cum,
  };
}

function regexParse(txt) {
  if (!txt) return {};
  const g = (pats) => {
    for (const p of pats) {
      const m = txt.match(p);
      if (m) return m[1]?.trim() || "";
    }
    return "";
  };
  let mat = "",
    proc = "";
  for (const m of MATS) {
    if (txt.toLowerCase().includes(m.name.toLowerCase())) {
      mat = m.name;
      break;
    }
  }
  for (const pr of PROCS) {
    if (txt.toLowerCase().includes(pr.name.toLowerCase())) {
      proc = pr.name;
      break;
    }
  }
  const sz = txt.match(/([0-9.]+)\s*[xXx]\s*([0-9.]+)\s*mm/i);
  const qty = g([
    /(?:quantity|qty)[:\s]+([0-9,]+)/i,
    /([0-9,]+)\s*(?:pcs|pieces|nos|units)/i,
  ]).replace(/,/g, "");
  const rd = g([
    /(?:required|deliver(?:y|ed)?)\s*(?:within|in|by)[:\s]+([0-9]+)\s*(?:days?|working)/i,
    /within\s+([0-9]+)\s*days?/i,
  ]);
  return {
    material: mat,
    process: proc,
    thickness: g([
      /(?:thickness|thk|t\s*=)[:\s]*([0-9.]+)\s*mm/i,
      /([0-9.]+)\s*mm\s*(?:thk|thick)/i,
    ]),
    length: sz ? sz[1] : g([/(?:length|l\s*=)[:\s]*([0-9.]+)/i]),
    width: sz ? sz[2] : g([/(?:width|w\s*=)[:\s]*([0-9.]+)/i]),
    quantity: qty,
    finish: g([/(?:finish|surface|coating)[:\s]+([A-Za-z .\-]+?)(?:\n|,|$)/i]),
    client: g([
      /(?:from|client|company)[:\s]+([A-Za-z0-9 &.,]+?)(?:\n|,|$)/i,
      /dear\s+(?:sir,?\s*)?([A-Za-z ]+)/i,
    ]),
    delivery: g([
      /(?:deliver(?:y)?\s*(?:to|location)|ship\s*to)[:\s]+([A-Za-z ,]+?)(?:\n|$)/i,
    ]),
    required_days: rd,
  };
}

function mergeData(ai, rx) {
  if (!ai) return rx || {};
  if (!rx) return ai;
  const z = (v) => !v || v === "0" || v === 0;
  return {
    material: ai.material || rx.material || "",
    process: ai.process || rx.process || "",
    thickness: z(ai.thickness) ? rx.thickness || ai.thickness : ai.thickness,
    length: z(ai.length) ? rx.length || ai.length : ai.length,
    width: z(ai.width) ? rx.width || ai.width : ai.width,
    quantity: z(ai.quantity) ? rx.quantity || ai.quantity : ai.quantity,
    finish: ai.finish || rx.finish || "",
    client: ai.client || rx.client || "",
    delivery: ai.delivery || rx.delivery || "",
    required_days: z(ai.required_days)
      ? rx.required_days || ai.required_days
      : ai.required_days,
  };
}

/* ====================================
   AI EXTRACTION - LLAMA 3.3 via GROQ
   Free API: console.groq.com
   30 req/min, no credit card needed
   Tesseract.js OCR for drawings
   Smart regex as final fallback
==================================== */
function buildSysPrompt() {
  const ML = MATS.map((m) => m.name).join(", ");
  const PL = PROCS.map((p) => p.name).join(", ");
  return `You are a manufacturing RFQ data extractor. Extract parameters from client emails and/or OCR text from engineering drawings. Return ONLY a JSON object with no markdown, no explanation.

ALLOWED MATERIALS: ${ML}
ALLOWED PROCESSES: ${PL}

Required JSON keys:
- material: string matching ALLOWED MATERIALS exactly ("" if none)
- process: string matching ALLOWED PROCESSES exactly ("" if none)
- thickness: number in mm (0 if not found)
- length: number in mm (0 if not found)
- width: number in mm (0 if not found)
- quantity: integer (0 if not found)
- finish: string e.g. "Powder Coat", "Anodize", "" if none
- client: company or person name ("" if none)
- delivery: city or location ("" if none)
- required_days: integer delivery days (0 if not specified)

RULES:
- "MS" = Mild Steel, "SS" = Stainless Steel 304, "AL"/"Alum" = Aluminium 6061
- "Laser"=Laser Cutting, "CNC"=CNC Machining, "Press brake"=Bending
- Look for dimensions like "200x100x5 THK", "L=200 W=100 T=5mm", title block values
- Drawing dimensions take priority over email text
- "within 10 days" or "10 days delivery" => required_days: 10`;
}

function safeJSON(raw) {
  if (!raw) return null;
  try {
    const c = raw.replace(/\`\`\`json|\`\`\`/gi, "").trim();
    const m = c.match(/\{[\s\S]+\}/);
    if (!m) return null;
    return JSON.parse(m[0]);
  } catch {
    return null;
  }
}

async function callGroq(text, apiKey, model) {
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    },
    body: JSON.stringify({
      model: model || "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: buildSysPrompt() },
        {
          role: "user",
          content:
            "Extract manufacturing parameters from this RFQ:\n\n" +
            text +
            "\n\nJSON:",
        },
      ],
      max_tokens: 512,
      temperature: 0,
      response_format: { type: "json_object" },
    }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d?.error?.message || "Groq " + r.status);
  const raw = d?.choices?.[0]?.message?.content || "";
  const j = safeJSON(raw);
  if (!j) throw new Error("Llama returned no valid JSON");
  return j;
}

async function loadTesseract() {
  if (window.Tesseract) return window.Tesseract;
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src =
      "https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.0.3/tesseract.min.js";
    s.onload = () => res(window.Tesseract);
    s.onerror = () => rej(new Error("Tesseract CDN failed"));
    document.head.appendChild(s);
  });
}

async function ocrImage(file, onPct) {
  const Tess = await loadTesseract();
  const url = URL.createObjectURL(file);
  try {
    const res = await Tess.recognize(url, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text" && onPct)
          onPct(Math.round(m.progress * 100));
      },
    });
    return res.data.text || "";
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function aiExtract(emailText, imageFiles, apiKey, onProgress) {
  const imgs = (imageFiles || []).filter(
    (f) => f && f.type && f.type.startsWith("image/"),
  );
  const hasTxt = emailText && emailText.trim().length > 5;
  const hasImgs = imgs.length > 0;

  /* OCR all drawings */
  let ocrText = "";
  if (hasImgs) {
    onProgress("ocr", 0, "Running Tesseract OCR on drawings...");
    const parts = [];
    for (let i = 0; i < imgs.length; i++) {
      try {
        const t = await ocrImage(imgs[i], (pct) =>
          onProgress(
            "ocr",
            Math.round((i / imgs.length) * 100 + pct / imgs.length),
            "OCR drawing " + (i + 1) + "/" + imgs.length + "...",
          ),
        );
        if (t.trim()) parts.push("[DRAWING " + (i + 1) + "]\n" + t.trim());
      } catch (e) {
        console.warn("OCR failed", e);
      }
    }
    ocrText = parts.join("\n\n");
    onProgress("ocr", 100, "OCR complete");
  }

  /* Combine text sources */
  const combined = [
    hasTxt ? "[CLIENT EMAIL]\n" + emailText.trim() : "",
    ocrText ? ocrText : "",
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");

  /* Regex always runs as base */
  const rx = regexParse(combined);

  if (!combined.trim()) {
    return { data: rx, src: "Smart Rules (no input)" };
  }

  /* Llama via Groq - try 3 models in order */
  if (apiKey && apiKey.startsWith("gsk_")) {
    const models = [
      "llama-3.3-70b-versatile",
      "llama-3.1-70b-versatile",
      "llama-3.1-8b-instant",
    ];
    for (const model of models) {
      try {
        onProgress("ai", 20, "Calling " + model + " via Groq...");
        const j = await callGroq(combined, apiKey, model);
        onProgress("ai", 100, "Extraction complete");
        const src =
          hasImgs && hasTxt
            ? "Llama 3.3 70B + Tesseract OCR (Email + Drawing)"
            : hasImgs
              ? "Llama 3.3 70B + Tesseract OCR (Drawing)"
              : "Llama 3.3 70B (Email)";
        return { data: mergeData(j, rx), src };
      } catch (e) {
        console.warn("[" + model + "]", e.message);
      }
    }
  }

  /* Regex fallback */
  onProgress("ai", 100, "Done (smart rules)");
  return { data: rx, src: "Smart Rules" + (ocrText ? " + OCR" : "") };
}

function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });
}

function safeStr(s) {
  return (
    String(s || "-")
      .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
      .replace(/[\u2600-\u27BF]/g, "")
      .replace(/[^\x00-\x7E]/g, "")
      .trim() || "-"
  );
}

function genQID() {
  const d = new Date();
  return (
    "QT-" +
    d.getFullYear() +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0") +
    "-" +
    Math.floor(1000 + Math.random() * 9000)
  );
}

/* ====================================
   PDF EXPORT
==================================== */
async function loadjsPDF() {
  if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
  await new Promise((res, rej) => {
    if (document.querySelector('script[src*="jspdf"]')) {
      const iv = setInterval(() => {
        if (window.jspdf?.jsPDF) {
          clearInterval(iv);
          res();
        }
      }, 120);
      setTimeout(() => {
        clearInterval(iv);
        rej(new Error("jsPDF timeout"));
      }, 12000);
      return;
    }
    const s = document.createElement("script");
    s.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = res;
    s.onerror = () => rej(new Error("jsPDF CDN failed"));
    document.head.appendChild(s);
  });
  if (!window.jspdf?.jsPDF) throw new Error("jsPDF unavailable");
  return window.jspdf.jsPDF;
}

function h2rgb(h) {
  return {
    r: parseInt(h.slice(1, 3), 16),
    g: parseInt(h.slice(3, 5), 16),
    b: parseInt(h.slice(5, 7), 16),
  };
}

async function exportPDF(qid, p, costs, feas, co, extras, lt) {
  const jsPDF = await loadjsPDF();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ccy = costs.ccy;
  const fmt = (v) => ccy.code + " " + Number(v || 0).toFixed(2);
  const now = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const PW = 210,
    M = 14,
    B = PW - M * 2,
    PH = 297,
    FH = 12;
  let y = 0;

  const foot = () => {
    doc.setFillColor(7, 9, 15);
    doc.rect(0, PH - FH, PW, FH, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(79, 143, 255);
    doc.text("RFQAnalyzer", M, PH - 4);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(safeStr(co.name), M + 28, PH - 4);
    doc.text(qid + "  |  " + now + "  |  Confidential", PW - M, PH - 4, {
      align: "right",
    });
  };

  const need = (h) => {
    if (y + h > PH - FH - 8) {
      foot();
      doc.addPage();
      y = 18;
    }
  };
  const sh = (lbl) => {
    need(10);
    doc.setFillColor(7, 9, 15);
    doc.rect(M, y, B, 7, "F");
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(lbl.toUpperCase(), M + 3, y + 5);
    y += 9;
  };

  /* HEADER */
  doc.setFillColor(7, 9, 15);
  doc.rect(0, 0, PW, 44, "F");
  doc.setFillColor(79, 143, 255);
  doc.rect(0, 44, PW, 2.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("RFQAnalyzer", M, 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    safeStr(co.name) + "  |  Fabrication Quotation  |  Llama 3.3 AI",
    M,
    25,
  );
  doc.text(now + "  |  Currency: " + ccy.code, M, 32);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text("QUOTATION", PW - M, 17, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(qid, PW - M, 25, { align: "right" });
  y = 50;

  /* INFO BOXES */
  const hf = (B - 4) / 2,
    bH = 34;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(M, y, hf, bH, 2, 2, "F");
  doc.roundedRect(M + hf + 4, y, hf, bH, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("CLIENT", M + 3, y + 5);
  doc.text("PART SPECIFICATIONS", M + hf + 7, y + 5);
  const br = (k, v, ox, ry) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(k, M + 3 + ox, ry);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(safeStr(v).substring(0, 26), M + 3 + ox + 24, ry);
  };
  let by = y + 10;
  br("Client", p.client || "-", 0, by);
  br("Material", p.material || "-", hf + 4, by);
  by += 5.5;
  br("Delivery", p.delivery || "-", 0, by);
  br("Thickness", (p.thickness || "-") + "mm", hf + 4, by);
  by += 5.5;
  br("Finish", p.finish || "Std", 0, by);
  br("Size", (p.length || "-") + "x" + (p.width || "-") + "mm", hf + 4, by);
  by += 5.5;
  br("Target", p.required_days ? p.required_days + "d" : "N/A", 0, by);
  br("Qty", p.quantity || "-" + " pcs | " + p.process || "-", hf + 4, by);
  y += bH + 5;

  /* STATS */
  const sw = (B - 8) / 3;
  [
    ["Weight", costs.weight.toFixed(4) + " kg"],
    ["Machine Hrs", costs.mhrs.toFixed(3) + " h"],
    ["Unit Cost (" + ccy.code + ")", fmt(costs.per_part)],
  ].forEach((st, i) => {
    const sx = M + i * (sw + 4);
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(sx, y, sw, 13, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(st[0], sx + 3, y + 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(29, 78, 216);
    doc.text(safeStr(st[1]), sx + 3, y + 11);
  });
  y += 17;

  /* COST TABLE */
  sh("Cost Breakdown (" + ccy.code + ")");
  const c1 = M,
    c2 = M + 8,
    c3 = M + 56,
    c4 = PW - M;
  doc.setFillColor(7, 9, 15);
  doc.rect(c1, y, B, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("#", c1 + 2, y + 5);
  doc.text("ITEM", c2 + 2, y + 5);
  doc.text("DETAILS", c3 + 2, y + 5);
  doc.text("AMOUNT", c4, y + 5, { align: "right" });
  y += 8;
  const ax = (extras || []).filter((e) => e.label && e.amount);
  const trows = [
    [
      "1",
      "Material",
      safeStr(p.material) + " | " + costs.weight.toFixed(4) + " kg",
      fmt(costs.material),
    ],
    [
      "2",
      "Machine",
      safeStr(p.process) + " | " + costs.mhrs.toFixed(2) + " hrs",
      fmt(costs.machine),
    ],
    ["3", "Labor", "Operator and supervision", fmt(costs.labor)],
    ["4", "Setup", "Machine setup and tooling", fmt(costs.setup)],
    [
      "5",
      "Finishing",
      safeStr(p.finish) || "Surface treatment",
      fmt(costs.finishing),
    ],
    ["6", "Packaging", "Protective packing", fmt(costs.packaging)],
    [
      "7",
      "Transport",
      "To " + safeStr(p.delivery || "destination"),
      fmt(costs.transport),
    ],
    ...ax.map((e, i) => [
      String(8 + i),
      safeStr(e.label),
      "Additional",
      fmt(+e.amount / ccy.rate),
    ]),
    [
      String(8 + ax.length),
      "Profit",
      "Margin " + (co.margin * 100).toFixed(0) + "%",
      fmt(costs.profit),
    ],
  ];
  trows.forEach((r, i) => {
    need(8);
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(c1, y - 1, B, 8, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(r[0], c1 + 2, y + 5);
    doc.text(r[1], c2 + 2, y + 5);
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.text(safeStr(r[2]).substring(0, 44), c3 + 2, y + 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(r[3], c4, y + 5, { align: "right" });
    y += 8;
  });
  need(12);
  doc.setFillColor(239, 246, 255);
  doc.rect(c1, y, B, 11, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(29, 78, 216);
  doc.text("TOTAL (" + ccy.code + ")", c1 + 4, y + 7.5);
  doc.text(fmt(costs.total), c4, y + 7.5, { align: "right" });
  y += 12;
  need(7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Per part: " + fmt(costs.per_part) + " x " + p.quantity + " pcs",
    c1 + 4,
    y + 5,
  );
  y += 9;

  /* FEASIBILITY */
  if (feas && feas.warnings && feas.warnings.length > 0) {
    const bh = 9 + feas.warnings.length * 6;
    need(bh + 4);
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(253, 230, 138);
    doc.roundedRect(M, y, B, bh, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(146, 64, 14);
    doc.text(
      "MANUFACTURING NOTES (Complexity: " + feas.complexity + ")",
      M + 4,
      y + 6,
    );
    y += 8;
    feas.warnings.forEach((w) => {
      const lines = doc.splitTextToSize("- " + safeStr(w.msg), B - 10);
      lines.forEach((l) => {
        need(6);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(120, 53, 15);
        doc.text(l, M + 5, y + 4);
        y += 5.5;
      });
    });
    y += 4;
  }

  /* GANTT */
  if (lt) {
    sh("Production Schedule");
    const tX = M + 52,
      tW = B - 62,
      eX = PW - M - 1;
    lt.schedule.forEach((s) => {
      need(9);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(safeStr(s.label), M + 2, y + 5.5);
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(s.days + "d", M + 40, y + 5.5);
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(tX, y + 1, tW, 5.5, 1, 1, "F");
      const { r, g, b } = h2rgb(s.color);
      doc.setFillColor(r, g, b);
      const bx = tX + ((s.start - 1) / lt.total) * tW;
      const bw = Math.max((s.days / lt.total) * tW, 1.5);
      doc.roundedRect(bx, y + 1.5, bw, 4.5, 0.5, 0.5, "F");
      if (p.required_days && +p.required_days <= lt.total) {
        const dlX = tX + (+p.required_days / lt.total) * tW;
        doc.setDrawColor(245, 158, 11);
        doc.setLineWidth(0.6);
        doc.line(dlX, y + 1, dlX, y + 6.5);
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(29, 78, 216);
      doc.text(s.end + "d", eX, y + 5.5, { align: "right" });
      y += 9;
    });
    need(11);
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(M, y, B, 9, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Total Lead Time", M + 4, y + 6.5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(29, 78, 216);
    doc.text(lt.total + " Working Days", PW - M - 1, y + 6.5, {
      align: "right",
    });
    y += 12;
    if (p.required_days) {
      need(9);
      const ok = lt.total <= +p.required_days;
      doc.setFillColor(...(ok ? [220, 252, 231] : [254, 226, 226]));
      doc.roundedRect(M, y, B, 8, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...(ok ? [21, 128, 61] : [220, 38, 38]));
      doc.text(
        ok
          ? "OK - Lead time (" +
              lt.total +
              "d) meets target (" +
              p.required_days +
              "d)"
          : "LATE - Exceeds target by " + (lt.total - +p.required_days) + "d",
        M + 4,
        y + 5.5,
      );
      y += 11;
    }
  }

  /* TERMS */
  sh("Commercial Terms");
  const tw = (B - 4) / 2;
  const terms = [
    ["Our Lead Time", lt ? lt.total + " working days" : "7-21 days"],
    [
      "Client Target",
      p.required_days ? p.required_days + " days" : "Not specified",
    ],
    ["Quote Valid", "30 days from date"],
    ["Payment", "50% advance, 50% delivery"],
  ];
  for (let i = 0; i < terms.length; i += 2) {
    need(15);
    [0, 1].forEach((j) => {
      const t = terms[i + j];
      if (!t) return;
      const tx = M + j * (tw + 4);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(tx, y, tw, 12, 2, 2, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(t[0].toUpperCase(), tx + 4, y + 5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(safeStr(t[1]), tx + 4, y + 10.5);
    });
    y += 15;
  }
  need(12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  const nl = doc.splitTextToSize(
    "All prices exclude applicable taxes. Subject to final drawing approval. Lead time commences from receipt of advance payment and approved drawings.",
    B,
  );
  doc.text(nl, M, y);
  foot();
  doc.save(qid + ".pdf");
}

function exportCSV(qid, p, costs, extras, lt, co, ccySrc) {
  const c = costs,
    cy = c.ccy;
  const rows = [
    ["Quotation", qid],
    ["Date", new Date().toLocaleString()],
    ["Company", co.name],
    ["Currency", cy.code],
    ["Rate Source", ccySrc],
    ["", ""],
    ["Client", p.client || ""],
    ["Delivery", p.delivery || ""],
    ["Required Days", p.required_days || ""],
    ["Material", p.material || ""],
    ["Thickness mm", p.thickness || ""],
    ["Length mm", p.length || ""],
    ["Width mm", p.width || ""],
    ["Qty", p.quantity || ""],
    ["Process", p.process || ""],
    ["Finish", p.finish || ""],
    ["", ""],
    ["COSTS", cy.code],
    ["Material", (c.material || 0).toFixed(2)],
    ["Machine", (c.machine || 0).toFixed(2)],
    ["Labor", (c.labor || 0).toFixed(2)],
    ["Setup", (c.setup || 0).toFixed(2)],
    ["Finishing", (c.finishing || 0).toFixed(2)],
    ["Packaging", (c.packaging || 0).toFixed(2)],
    ["Transport", (c.transport || 0).toFixed(2)],
    ["Extra", (c.extra || 0).toFixed(2)],
    ["Profit", (c.profit || 0).toFixed(2)],
    ["TOTAL", (c.total || 0).toFixed(2)],
    ["Per Part", (c.per_part || 0).toFixed(2)],
    ...(lt
      ? [
          ["", ""],
          ["Lead Time Days", lt.total],
          ...lt.schedule.map((s) => [s.label, s.days + "d"]),
        ]
      : []),
  ];
  dlBlob(
    rows.map((r) => r.map((v) => '"' + v + '"').join(",")).join("\n"),
    "text/csv",
    qid + ".csv",
  );
}

function exportJSON(qid, p, costs, extras, lt, co, ccy, ccySrc) {
  const { ccy: _a, mat: _b, proc: _c, ...cd } = costs;
  dlBlob(
    JSON.stringify(
      {
        quotation_id: qid,
        generated: new Date().toISOString(),
        company: co.name,
        currency: ccy,
        rate_source: ccySrc,
        params: p,
        costs: cd,
        extras: (extras || []).filter((e) => e.label && e.amount),
        lead_time: lt ? { total_days: lt.total, stages: lt.schedule } : null,
      },
      null,
      2,
    ),
    "application/json",
    qid + ".json",
  );
}

function dlBlob(content, mime, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = name;
  a.click();
}

/* ====================================
   DESIGN TOKENS
==================================== */
const K = {
  bg: "#07090f",
  surf: "#0b0f1c",
  card: "#0e1423",
  bdr: "#182540",
  txt: "#e4eaf5",
  sub: "#4d6280",
  dim: "#16243a",
  blue: "#4f8fff",
  grn: "#10b981",
  yel: "#f59e0b",
  red: "#ef4444",
  pur: "#8b5cf6",
  cyan: "#06b6d4",
  ff: "'DM Sans',system-ui,sans-serif",
  mono: "'DM Mono',monospace",
};

/* -- UI primitives -- */
const Tag = ({ col, sm, children }) => {
  const c = col || K.blue;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: sm ? "2px 7px" : "3px 10px",
        borderRadius: 99,
        fontSize: sm ? 9.5 : 11,
        fontWeight: 600,
        background: c + "1a",
        color: c,
        border: "1px solid " + c + "30",
        letterSpacing: 0.2,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
};

const Inp = ({ error, style, ...props }) => (
  <input
    className="ri"
    {...props}
    style={{
      background: K.surf,
      border: "1px solid " + (error ? K.red : K.bdr),
      borderRadius: 8,
      padding: "10px 13px",
      color: K.txt,
      fontSize: 13,
      width: "100%",
      boxSizing: "border-box",
      fontFamily: K.ff,
      outline: "none",
      transition: "border-color .2s,box-shadow .2s",
      ...(style || {}),
    }}
  />
);

const Sel = ({ children, style, ...props }) => (
  <select
    className="ri"
    {...props}
    style={{
      background: K.surf,
      border: "1px solid " + K.bdr,
      borderRadius: 8,
      padding: "10px 13px",
      color: K.txt,
      fontSize: 13,
      width: "100%",
      boxSizing: "border-box",
      fontFamily: K.ff,
      outline: "none",
      cursor: "pointer",
      ...(style || {}),
    }}
  >
    {children}
  </select>
);

const Btn = ({ children, v, sz, disabled, onClick, style }) => {
  const variant = v || "primary";
  const size = sz || "md";
  const VS = {
    primary: { background: K.blue, color: "#fff", border: "none" },
    success: { background: "#059669", color: "#fff", border: "none" },
    purple: { background: K.pur, color: "#fff", border: "none" },
    danger: { background: K.red, color: "#fff", border: "none" },
    outline: {
      background: "transparent",
      color: K.sub,
      border: "1px solid " + K.bdr,
    },
    ghost: { background: "transparent", color: K.sub, border: "none" },
  };
  const SZ = {
    sm: { padding: "6px 12px", fontSize: 12 },
    md: { padding: "10px 17px", fontSize: 13 },
    lg: { padding: "13px 24px", fontSize: 14 },
  };
  return (
    <button
      className="rb"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      style={{
        ...VS[variant],
        ...SZ[size],
        borderRadius: 9,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: K.ff,
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        opacity: disabled ? 0.38 : 1,
        whiteSpace: "nowrap",
        ...(style || {}),
      }}
    >
      {children}
    </button>
  );
};

const Card = ({ children, style }) => (
  <div
    style={{
      background: K.card,
      border: "1px solid " + K.bdr,
      borderRadius: 14,
      padding: 20,
      marginBottom: 14,
      ...(style || {}),
    }}
  >
    {children}
  </div>
);

const SH = ({ children }) => (
  <div
    style={{
      fontSize: 9.5,
      fontWeight: 700,
      color: K.blue,
      letterSpacing: 2,
      textTransform: "uppercase",
      marginBottom: 14,
      display: "flex",
      alignItems: "center",
      gap: 6,
    }}
  >
    {children}
  </div>
);

const Fld = ({ label, hint, required, err, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label
      style={{
        fontSize: 10.5,
        fontWeight: 600,
        color: err ? K.red : K.sub,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        display: "flex",
        gap: 3,
      }}
    >
      {label}
      {required && <span style={{ color: K.red }}>*</span>}
    </label>
    {children}
    {(hint || err) && (
      <span
        style={{ fontSize: 9.5, color: err ? K.red : K.dim, lineHeight: 1.5 }}
      >
        {err || hint}
      </span>
    )}
  </div>
);

const KV = ({ label, value, mono }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      fontSize: 12,
      padding: "5px 0",
      borderBottom: "1px solid " + K.dim + "44",
    }}
  >
    <span style={{ color: K.sub, flexShrink: 0 }}>{label}</span>
    <span
      style={{
        color: "#64748b",
        fontWeight: 600,
        fontFamily: mono ? K.mono : K.ff,
        textAlign: "right",
        marginLeft: 8,
        wordBreak: "break-word",
      }}
    >
      {value}
    </span>
  </div>
);

const CcySel = ({ ccy, setCcy, ccyList, style }) => (
  <Sel
    value={ccy}
    onChange={(e) => setCcy(e.target.value)}
    style={{
      width: "auto",
      minWidth: 140,
      fontSize: 12,
      padding: "7px 10px",
      ...(style || {}),
    }}
  >
    {ccyList.map((c) => (
      <option key={c.code} value={c.code}>
        {c.sym} {c.code} - {c.name}
      </option>
    ))}
  </Sel>
);

const StatCard = ({ label, value, sub, col, icon }) => {
  const c = col || K.blue;
  return (
    <div
      style={{
        background: K.card,
        border: "1px solid " + K.bdr,
        borderRadius: 12,
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          fontSize: 9,
          color: K.sub,
          letterSpacing: 1,
          textTransform: "uppercase",
          marginBottom: 5,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {icon && <span>{icon}</span>}
        <span>{label}</span>
      </div>
      <div
        style={{
          fontSize: 21,
          fontWeight: 800,
          color: c,
          fontFamily: K.mono,
          lineHeight: 1,
          wordBreak: "break-all",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 9, color: K.sub, marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
};

const GanttChart = ({ schedule, total, clientDays, sm }) => {
  const CD = +clientDays || 0;
  const over = CD > 0 && total > CD;
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 9,
          color: K.sub,
          marginBottom: 10,
          flexWrap: "wrap",
          gap: 4,
        }}
      >
        <span style={{ fontFamily: K.mono }}>Day 1</span>
        <span style={{ fontWeight: 700, color: over ? K.red : K.grn }}>
          {over
            ? total + "d - " + (total - CD) + "d over target"
            : total + " working days" + (CD ? " (target " + CD + "d)" : "")}
        </span>
        <span style={{ fontFamily: K.mono }}>Day {total}</span>
      </div>
      {schedule.map((s, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: sm ? 4 : 6,
          }}
        >
          <div style={{ width: sm ? 90 : 145, flexShrink: 0 }}>
            <div
              style={{
                fontSize: sm ? 9 : 10,
                fontWeight: 600,
                color: "#94a3b8",
                lineHeight: 1.3,
              }}
            >
              {s.label}
            </div>
            <div style={{ fontSize: 8, color: K.sub }}>{s.days}d</div>
          </div>
          <div
            style={{
              flex: 1,
              height: sm ? 16 : 20,
              background: K.dim + "88",
              borderRadius: 5,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {CD > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: Math.min((CD / total) * 100, 99) + "%",
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: K.yel,
                  zIndex: 3,
                }}
              />
            )}
            <div
              style={{
                position: "absolute",
                left: ((s.start - 1) / total) * 100 + "%",
                width: (s.days / total) * 100 + "%",
                top: 2,
                bottom: 2,
                background: s.color,
                borderRadius: 3,
                opacity: 0.88,
                display: "flex",
                alignItems: "center",
                fontSize: 7.5,
                color: "#fff",
                fontWeight: 700,
                paddingLeft: 4,
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {s.days / total > 0.12 ? s.start + "-" + s.end : ""}
            </div>
          </div>
          <div
            style={{
              width: 22,
              textAlign: "right",
              fontSize: 9,
              color: K.sub,
              fontFamily: K.mono,
              flexShrink: 0,
            }}
          >
            {s.end}d
          </div>
        </div>
      ))}
      {CD > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            marginTop: 8,
            fontSize: 9,
            color: K.sub,
          }}
        >
          <div
            style={{ width: 8, height: 8, background: K.yel, borderRadius: 2 }}
          />
          <span>Client deadline: Day {CD}</span>
        </div>
      )}
      <div
        style={{
          marginTop: 10,
          padding: "10px 14px",
          background: K.surf,
          borderRadius: 9,
          border: "1px solid " + K.bdr,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        <span style={{ fontSize: 11, color: K.sub }}>Total Lead Time</span>
        <span
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: K.blue,
            fontFamily: K.mono,
          }}
        >
          {total} Working Days
        </span>
      </div>
    </div>
  );
};

const Donut = ({ slices }) => {
  const COLS = ["#4f8fff", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];
  const tot = slices.reduce((s, d) => s + (d.v || 0), 0) || 1;
  let cum = 0;
  const paths = slices.map((d, i) => {
    const pct = (d.v || 0) / tot,
      st = cum;
    cum += pct;
    const a1 = st * 2 * Math.PI - Math.PI / 2,
      a2 = (st + pct) * 2 * Math.PI - Math.PI / 2;
    const lf = pct > 0.5 ? 1 : 0;
    const x1 = 80 + 55 * Math.cos(a1),
      y1 = 80 + 55 * Math.sin(a1);
    const x2 = 80 + 55 * Math.cos(a2),
      y2 = 80 + 55 * Math.sin(a2);
    return {
      d:
        "M80,80L" +
        x1 +
        "," +
        y1 +
        "A55,55,0," +
        lf +
        ",1," +
        x2 +
        "," +
        y2 +
        "Z",
      color: COLS[i % 5],
      label: d.label,
      pct,
    };
  });
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <svg
        viewBox="0 0 160 160"
        style={{ width: 110, height: 110, flexShrink: 0 }}
      >
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} opacity={0.9}>
            <title>
              {p.label}: {(p.pct * 100).toFixed(1)}%
            </title>
          </path>
        ))}
        <circle cx="80" cy="80" r="30" fill={K.card} />
      </svg>
      <div style={{ flex: 1, minWidth: 90 }}>
        {paths.map((p, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              marginBottom: 5,
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                color: K.sub,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 2,
                  background: p.color,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              {p.label}
            </span>
            <span
              style={{ color: "#64748b", fontFamily: K.mono, fontSize: 10 }}
            >
              {(p.pct * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const STEPS = [
  { id: 1, label: "Setup" },
  { id: 2, label: "Input" },
  { id: 3, label: "Review" },
  { id: 4, label: "Costs" },
  { id: 5, label: "Quote" },
];

const StepBar = ({ step, setStep, sm }) => (
  <div
    style={{
      display: "flex",
      background: K.surf,
      borderBottom: "1px solid " + K.bdr,
      flexShrink: 0,
    }}
  >
    {STEPS.map((s) => {
      const active = step === s.id,
        done = step > s.id;
      return (
        <div
          key={s.id}
          onClick={() => done && setStep(s.id)}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: sm ? "10px 4px" : "11px 8px",
            gap: 2,
            cursor: done ? "pointer" : "default",
            borderBottom: "2px solid " + (active ? K.blue : "transparent"),
            transition: "border-color .2s",
            background: active ? K.blue + "0b" : "transparent",
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: done ? K.grn : active ? K.blue : K.dim,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {done ? "v" : s.id}
          </div>
          {!sm && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: done ? K.grn : active ? K.blue : K.sub,
                letterSpacing: 0.5,
                marginTop: 1,
              }}
            >
              {s.label}
            </span>
          )}
        </div>
      );
    })}
  </div>
);

/* ====================================
   MAIN APP
==================================== */
export default function App() {
  const { sm, lg } = useBP();

  /* -- State -- */
  const [step, setStep] = useState(1);
  const [cos, setCos] = useState(INIT_COS.map((c) => ({ ...c })));
  const [coIdx, setCoIdx] = useState(0);
  /* SINGLE currency state - one source of truth, used in all steps */
  const [ccy, setCcy] = useState("INR");
  const [ccyList, setCcyList] = useState(INIT_CCY);
  const [ccySrc, setCcySrc] = useState("Built-in");

  const [groqKey, setGroqKey] = useState(
    () => sessionStorage.getItem("rfqa_gk") || "",
  );
  const [showKeyDlg, setShowKeyDlg] = useState(false);
  const [keyInput, setKeyInput] = useState("");

  const [email, setEmail] = useState("");
  const [files, setFiles] = useState([]);
  const [p, setP] = useState({
    material: "",
    thickness: "",
    length: "",
    width: "",
    quantity: "",
    process: "",
    finish: "",
    client: "",
    delivery: "",
    required_days: "",
  });
  const [extras, setExtras] = useState([{ label: "", amount: "" }]);
  const [base, setBase] = useState(null);
  const [ov, setOv] = useState({});
  const [feas, setFeas] = useState(null);
  const [lt, setLt] = useState(null);
  const [qid] = useState(genQID);
  const [busy, setBusy] = useState(false);
  const [prog, setProg] = useState({ stage: "", pct: 0, msg: "" });
  const [toast, setToast] = useState(null);
  const [aiSrc, setAiSrc] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [editRates, setEditRates] = useState(false);
  const fileRef = useRef();

  const co = cos[coIdx];
  const curr = ccyList.find((c) => c.code === ccy) || ccyList[0];
  const activeExtras = extras.filter((e) => e.label && e.amount);

  /* Costs always derived from current ccy - changing currency auto-updates everything */
  const displayCosts = base
    ? applyOv(
        calcCosts(p, co, ccy, activeExtras, ccyList),
        Object.keys(ov).length ? ov : null,
        p.quantity,
      )
    : null;

  /* Live exchange rates on mount */
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(
          "https://api.frankfurter.app/latest?from=INR&to=USD,EUR,GBP,AED,SGD,JPY,CNY,SAR,MYR",
        );
        if (r.ok) {
          const d = await r.json();
          if (d && d.rates) {
            setCcyList((prev) =>
              prev.map((c) => {
                if (c.code === "INR") return c;
                const lr = d.rates[c.code];
                return lr ? { ...c, rate: 1 / lr } : c;
              }),
            );
            setCcySrc("Live");
          }
        }
      } catch (_) {}
    })();
  }, []);

  const showToast = useCallback((msg, type, ms) => {
    setToast({ msg, type: type || "ok" });
    setTimeout(() => setToast(null), ms || 4500);
  }, []);

  const handleFiles = useCallback((incoming) => {
    const items = Array.from(incoming)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        file: f,
        name: f.name,
        url: URL.createObjectURL(f),
        type: f.type,
      }));
    setFiles((prev) => [...prev, ...items].slice(0, 6));
  }, []);

  function run() {
    const c = calcCosts(p, co, ccy, activeExtras, ccyList);
    setBase(c);
    setFeas(calcFeas(p));
    setLt(calcLT(p, c.mhrs));
    setOv({});
    setStep(4);
  }

  async function doAI() {
    if (!email.trim() && files.length === 0) {
      showToast("Paste an email or upload drawings first.", "err");
      return;
    }
    setBusy(true);
    const onProg = (stage, pct, msg) => setProg({ stage, pct, msg });
    try {
      const imgFiles = files.map((f) => f.file);
      const { data, src } = await aiExtract(email, imgFiles, groqKey, onProg);
      const cleaned = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [
          k,
          v === null || v === undefined
            ? ""
            : String(
                v === 0 &&
                  ["thickness", "length", "width", "quantity"].includes(k)
                  ? ""
                  : v,
              ),
        ]),
      );
      setP((prev) => ({ ...prev, ...cleaned }));
      setAiSrc(src);
      showToast("Extracted via: " + src, "ok");
      setStep(3);
    } catch (e) {
      showToast("Extraction error: " + e.message, "err");
    } finally {
      setBusy(false);
      setProg({ stage: "", pct: 0, msg: "" });
    }
  }

  function doRegex() {
    if (!email.trim()) {
      showToast("Paste email text first.", "err");
      return;
    }
    setP((prev) => ({ ...prev, ...regexParse(email) }));
    setAiSrc("Smart Rules");
    showToast("Smart rules extraction done.", "ok");
    setStep(3);
  }

  async function doPDF() {
    if (!displayCosts) return;
    setPdfBusy(true);
    try {
      await exportPDF(qid, p, displayCosts, feas, co, activeExtras, lt);
    } catch (e) {
      showToast("PDF error: " + e.message, "err");
    } finally {
      setPdfBusy(false);
    }
  }

  function reset() {
    setStep(1);
    setBase(null);
    setFeas(null);
    setLt(null);
    setOv({});
    setEmail("");
    setFiles([]);
    setAiSrc("");
    setToast(null);
    setP({
      material: "",
      thickness: "",
      length: "",
      width: "",
      quantity: "",
      process: "",
      finish: "",
      client: "",
      delivery: "",
      required_days: "",
    });
    setExtras([{ label: "", amount: "" }]);
  }

  function setCoF(k, v) {
    setCos((prev) => prev.map((c, i) => (i === coIdx ? { ...c, [k]: v } : c)));
  }

  function saveKey() {
    const k = keyInput.trim();
    if (k.startsWith("gsk_")) {
      sessionStorage.setItem("rfqa_gk", k);
      setGroqKey(k);
      showToast("Groq key saved - Llama 3.3 active", "ok");
    } else if (k === "") {
      sessionStorage.removeItem("rfqa_gk");
      setGroqKey("");
    }
    setShowKeyDlg(false);
    setKeyInput("");
  }

  const REQ = [
    "material",
    "thickness",
    "length",
    "width",
    "quantity",
    "process",
  ];
  const missing = REQ.filter((k) => !p[k]);
  const valid = missing.length === 0;

  const CROW = base
    ? [
        {
          k: "material",
          label: "Material",
          det: p.material + " - " + base.weight.toFixed(4) + " kg",
        },
        {
          k: "machine",
          label: "Machine",
          det: p.process + " - " + base.mhrs.toFixed(2) + " hrs",
        },
        { k: "labor", label: "Labor", det: "Operator & supervision" },
        { k: "setup", label: "Setup", det: "Machine setup & tooling" },
        {
          k: "finishing",
          label: "Finishing",
          det: p.finish || "Surface treatment",
        },
        { k: "packaging", label: "Packaging", det: "Protective packing" },
        {
          k: "transport",
          label: "Transport",
          det: "To " + (p.delivery || "destination"),
        },
        ...(base.extra > 0
          ? [{ k: "extra", label: "Additional", det: "Extra charges" }]
          : []),
        {
          k: "profit",
          label: "Profit " + (co.margin * 100).toFixed(0) + "%",
          det: "Overhead & margin",
        },
      ]
    : [];

  const BCOLS = [
    "#4f8fff",
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#ec4899",
    "#84cc16",
    "#f97316",
  ];
  const pad = sm ? "12px" : "20px 28px";
  const fmtAmt = (v) =>
    curr.sym +
    Number(v || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: K.bg,
        color: K.txt,
        fontFamily: K.ff,
        display: "flex",
        flexDirection: "column",
        fontSize: 14,
        lineHeight: 1.55,
      }}
    >
      {/* -- Groq API Key Dialog -- */}
      {showKeyDlg && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(7,9,15,.94)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: K.card,
              border: "1px solid " + K.bdr,
              borderRadius: 16,
              padding: 30,
              maxWidth: 460,
              width: "100%",
              boxShadow: "0 24px 80px rgba(0,0,0,.5)",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>Llama</div>
            <h2
              style={{
                fontSize: 19,
                fontWeight: 800,
                color: K.txt,
                marginBottom: 6,
              }}
            >
              Groq API Key - Free Llama 3.3
            </h2>
            <p
              style={{
                fontSize: 12.5,
                color: K.sub,
                marginBottom: 16,
                lineHeight: 1.75,
              }}
            >
              Get a free key at{" "}
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noreferrer"
                style={{ color: K.blue }}
              >
                console.groq.com
              </a>{" "}
              (30 sec, no credit card). Unlocks{" "}
              <b style={{ color: K.pur }}>Llama 3.3 70B</b> for highly accurate
              extraction from emails and drawings.
            </p>
            <div
              style={{
                background: K.surf,
                border: "1px solid " + K.bdr,
                borderRadius: 9,
                padding: 12,
                marginBottom: 14,
                fontSize: 11,
                color: K.sub,
                lineHeight: 1.8,
              }}
            >
              Free tier:{" "}
              <b style={{ color: K.txt }}>
                30 req/min - Llama-3.3-70b-versatile
              </b>
              <br />
              Key format:{" "}
              <code style={{ color: K.blue, fontFamily: K.mono }}>gsk_...</code>
            </div>
            <Inp
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              style={{ fontFamily: K.mono, fontSize: 12, marginBottom: 12 }}
            />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Btn
                v="primary"
                onClick={saveKey}
                disabled={
                  keyInput.trim().length > 0 &&
                  !keyInput.trim().startsWith("gsk_")
                }
              >
                Save Key
              </Btn>
              <Btn
                v="outline"
                onClick={() => {
                  setShowKeyDlg(false);
                  setKeyInput("");
                }}
              >
                Cancel
              </Btn>
              {groqKey && (
                <Btn
                  v="ghost"
                  onClick={() => {
                    sessionStorage.removeItem("rfqa_gk");
                    setGroqKey("");
                    setShowKeyDlg(false);
                    showToast("Key removed", "ok");
                  }}
                  style={{ color: K.red }}
                >
                  Remove
                </Btn>
              )}
            </div>
            <p style={{ marginTop: 12, fontSize: 9.5, color: K.dim }}>
              Key stored in browser session only. Only sent to api.groq.com.
            </p>
          </div>
        </div>
      )}

      {/* -- Toast -- */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 999,
            padding: "12px 18px",
            background: toast.type === "err" ? K.red : "#059669",
            color: "#fff",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 8px 32px rgba(0,0,0,.45)",
            maxWidth: 380,
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <span>{toast.type === "err" ? "X" : "v"}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* -- Top Nav -- */}
      <div
        style={{
          background: K.surf,
          borderBottom: "1px solid " + K.bdr,
          padding: "0 " + (sm ? 12 : 24) + "px",
          height: 54,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg,#4f8fff,#8b5cf6)",
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              fontWeight: 800,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            R
          </div>
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: sm ? 14 : 16,
                color: K.txt,
                letterSpacing: -0.3,
              }}
            >
              RFQ<span style={{ color: K.blue }}>Analyzer</span>
            </div>
            {!sm && (
              <div
                style={{
                  fontSize: 9,
                  color: K.sub,
                  marginTop: -2,
                  letterSpacing: 0.5,
                }}
              >
                AI Fabrication Quotation
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {/* SINGLE GLOBAL CURRENCY SELECTOR - drives all values everywhere */}
          <CcySel ccy={ccy} setCcy={setCcy} ccyList={ccyList} />
          <Tag col={ccySrc === "Live" ? K.grn : K.yel} sm>
            {ccySrc === "Live" ? "Live" : "Rates"}
          </Tag>
          {displayCosts && !sm && (
            <Tag col={K.blue} sm>
              {curr.sym}
              {Math.round(displayCosts.total).toLocaleString()} {ccy}
            </Tag>
          )}
          <Btn
            v="outline"
            sz="sm"
            onClick={() => {
              setKeyInput(groqKey);
              setShowKeyDlg(true);
            }}
          >
            {groqKey ? "Key Active" : "Add Key"}
          </Btn>
        </div>
      </div>

      <StepBar step={step} setStep={setStep} sm={sm} />

      {/* -- Page Content -- */}
      <div
        className="fade"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: pad,
          maxWidth: 1380,
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {/* ==== STEP 1: SETUP ==== */}
        {step === 1 && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h1
                style={{
                  fontSize: sm ? 19 : 26,
                  fontWeight: 800,
                  color: K.txt,
                  marginBottom: 4,
                  letterSpacing: -0.4,
                }}
              >
                Company Setup
              </h1>
              <p style={{ fontSize: 12.5, color: K.sub }}>
                Configure your company and machine rates. The currency selector
                in the top bar updates all values across every step.
              </p>
            </div>

            {/* Llama key callout */}
            <div
              style={{
                padding: "16px 20px",
                background:
                  "linear-gradient(135deg," + K.pur + "14," + K.blue + "0a)",
                border: "1px solid " + K.pur + "28",
                borderRadius: 14,
                marginBottom: 16,
                display: "flex",
                alignItems: sm ? "flex-start" : "center",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontSize: 28 }}>AI</div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 700,
                    color: K.txt,
                    marginBottom: 3,
                    fontSize: 14,
                  }}
                >
                  Llama 3.3 70B - Free, No Credit Card
                </div>
                <div style={{ fontSize: 11.5, color: K.sub, lineHeight: 1.75 }}>
                  Get your free Groq key at{" "}
                  <a
                    href="https://console.groq.com"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: K.blue }}
                  >
                    console.groq.com
                  </a>{" "}
                  (30 sec). Powers accurate extraction from emails and
                  engineering drawings via Tesseract OCR. Falls back to smart
                  rules if no key.
                </div>
              </div>
              <Btn
                v="purple"
                sz="sm"
                onClick={() => {
                  setKeyInput(groqKey);
                  setShowKeyDlg(true);
                }}
              >
                {groqKey ? "Key Active - Update" : "Set Free API Key"}
              </Btn>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: sm ? "1fr" : lg ? "1fr 1fr" : "1fr 1fr",
                gap: 14,
              }}
            >
              <Card>
                <SH>Company Profile</SH>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <Fld label="Select Company">
                    <Sel
                      value={coIdx}
                      onChange={(e) => setCoIdx(+e.target.value)}
                    >
                      {cos.map((c, i) => (
                        <option key={i} value={i}>
                          {c.name}
                        </option>
                      ))}
                    </Sel>
                  </Fld>
                  <Fld
                    label="Default Currency"
                    hint="Same as the top-bar selector - change either to update all values"
                  >
                    <CcySel ccy={ccy} setCcy={setCcy} ccyList={ccyList} />
                  </Fld>
                  <div
                    style={{
                      padding: "10px 14px",
                      background: K.surf,
                      borderRadius: 9,
                      border: "1px solid " + K.bdr,
                      fontSize: 12,
                      color: K.sub,
                      display: "flex",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 6,
                    }}
                  >
                    <span>
                      Rs 10,000 ={" "}
                      <b style={{ color: K.blue }}>
                        {curr.sym}
                        {(10000 / curr.rate).toFixed(2)} {ccy}
                      </b>
                    </span>
                    <Tag col={ccySrc === "Live" ? K.grn : K.yel} sm>
                      {ccySrc === "Live" ? "Live rates" : "Built-in rates"}
                    </Tag>
                  </div>
                </div>
              </Card>

              <Card>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <SH>Machine Rates (Rs/hr)</SH>
                  <Btn
                    v={editRates ? "success" : "outline"}
                    sz="sm"
                    onClick={() => setEditRates((v) => !v)}
                  >
                    {editRates ? "Done" : "Edit"}
                  </Btn>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 8,
                  }}
                >
                  {[
                    { k: "laser", l: "Laser" },
                    { k: "cnc", l: "CNC" },
                    { k: "bending", l: "Bending" },
                    { k: "welding", l: "Welding" },
                    { k: "grinding", l: "Grinding" },
                    { k: "labor", l: "Labor/hr" },
                    { k: "finishing", l: "Finish" },
                    { k: "packaging", l: "Pkg" },
                    { k: "transport", l: "Transport" },
                  ].map(({ k, l }) => (
                    <div
                      key={k}
                      style={{
                        background: K.surf,
                        border: "1px solid " + K.bdr,
                        borderRadius: 9,
                        padding: "10px 11px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9,
                          color: K.sub,
                          marginBottom: 4,
                          textTransform: "uppercase",
                          letterSpacing: 0.8,
                        }}
                      >
                        {l}
                      </div>
                      {editRates ? (
                        <input
                          type="number"
                          value={co[k]}
                          onChange={(e) => setCoF(k, +e.target.value)}
                          style={{
                            background: "transparent",
                            border: "none",
                            borderBottom: "1px solid " + K.blue,
                            color: K.blue,
                            fontSize: 15,
                            fontWeight: 800,
                            fontFamily: K.mono,
                            width: "100%",
                            outline: "none",
                            padding: "2px 0",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: K.blue,
                            fontFamily: K.mono,
                          }}
                        >
                          Rs{co[k]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    background: K.surf,
                    border: "1px solid " + K.bdr,
                    borderRadius: 9,
                    padding: "10px 11px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 9,
                      color: K.sub,
                      marginBottom: 4,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    Profit Margin %
                  </div>
                  {editRates ? (
                    <input
                      type="number"
                      value={(co.margin * 100).toFixed(0)}
                      onChange={(e) => setCoF("margin", +e.target.value / 100)}
                      style={{
                        background: "transparent",
                        border: "none",
                        borderBottom: "1px solid " + K.grn,
                        color: K.grn,
                        fontSize: 15,
                        fontWeight: 800,
                        fontFamily: K.mono,
                        width: "100%",
                        outline: "none",
                        padding: "2px 0",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: K.grn,
                        fontFamily: K.mono,
                      }}
                    >
                      {(co.margin * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 4,
              }}
            >
              <Btn v="primary" sz="lg" onClick={() => setStep(2)}>
                Continue to RFQ Input
              </Btn>
            </div>
          </>
        )}

        {/* ==== STEP 2: INPUT ==== */}
        {step === 2 && (
          <>
            <div style={{ marginBottom: 16 }}>
              <h1
                style={{
                  fontSize: sm ? 19 : 26,
                  fontWeight: 800,
                  color: K.txt,
                  marginBottom: 4,
                  letterSpacing: -0.4,
                }}
              >
                RFQ Input
              </h1>
              <p style={{ fontSize: 12.5, color: K.sub }}>
                Paste the client email and/or upload engineering drawings. Llama
                3.3 70B reads both for maximum extraction accuracy.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 14,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Tag col={K.pur}>Llama 3.3 70B</Tag>
              <Tag col={K.cyan}>Tesseract OCR</Tag>
              <Tag col={K.grn}>Smart Rules fallback</Tag>
              {groqKey ? (
                <Tag col={K.grn}>Key: Active</Tag>
              ) : (
                <span style={{ fontSize: 11, color: K.yel }}>
                  No key -{" "}
                  <button
                    onClick={() => setShowKeyDlg(true)}
                    style={{
                      color: K.blue,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textDecoration: "underline",
                      fontSize: 11,
                      padding: 0,
                    }}
                  >
                    add Groq key
                  </button>{" "}
                  or use rules
                </span>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: lg ? "1fr 1fr" : "1fr",
                gap: 14,
                marginBottom: 14,
              }}
            >
              {/* Email */}
              <Card style={{ marginBottom: 0 }}>
                <SH>Email / RFQ Text</SH>
                <div
                  style={{
                    fontSize: 11,
                    color: K.sub,
                    marginBottom: 10,
                    padding: "8px 12px",
                    background: K.surf,
                    borderRadius: 8,
                    border: "1px solid " + K.bdr,
                    lineHeight: 1.8,
                  }}
                >
                  <b style={{ color: K.txt }}>Extracted from email:</b> client,
                  delivery, deadline, quantity, material, process, finish,
                  dimensions.
                </div>
                <textarea
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    "Paste the full client RFQ email here.\n\nExample:\nFrom: purchase@acme.com\nSubject: RFQ - Laser Cut Brackets\n\nPlease quote 50 pcs Mild Steel brackets,\n5mm thick, 200 x 100mm.\nLaser Cutting, Powder Coat finish.\nDeliver to: Chennai. Required within 12 days."
                  }
                  style={{
                    background: K.surf,
                    border: "1px solid " + K.bdr,
                    borderRadius: 9,
                    padding: 14,
                    color: K.txt,
                    fontSize: 12.5,
                    width: "100%",
                    boxSizing: "border-box",
                    fontFamily: K.ff,
                    outline: "none",
                    resize: "vertical",
                    minHeight: sm ? 160 : 230,
                    lineHeight: 1.7,
                    transition: "border-color .2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = K.blue)}
                  onBlur={(e) => (e.target.style.borderColor = K.bdr)}
                />
                {email.trim() && (
                  <div style={{ marginTop: 6, fontSize: 10.5, color: K.grn }}>
                    Ready: {email.trim().split(/\s+/).length} words
                  </div>
                )}
              </Card>

              {/* Drawings */}
              <Card style={{ marginBottom: 0 }}>
                <SH>CAD Drawings / Images</SH>
                <div
                  style={{
                    fontSize: 11,
                    color: K.sub,
                    marginBottom: 10,
                    padding: "8px 12px",
                    background: K.surf,
                    borderRadius: 8,
                    border: "1px solid " + K.bdr,
                    lineHeight: 1.8,
                  }}
                >
                  <b style={{ color: K.txt }}>OCR extracts from drawings:</b>{" "}
                  dimensions, title block (material, scale), BOM table, surface
                  finish callouts.
                </div>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = K.pur;
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.borderColor = files.length
                      ? K.pur
                      : K.bdr;
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = files.length
                      ? K.pur
                      : K.bdr;
                    handleFiles(e.dataTransfer.files);
                  }}
                  onClick={() => fileRef.current && fileRef.current.click()}
                  style={{
                    border: "2px dashed " + (files.length ? K.pur : K.bdr),
                    borderRadius: 10,
                    padding: "22px 16px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "border-color .2s",
                    minHeight: 88,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <div style={{ fontSize: 30 }}>IMG</div>
                  <div
                    style={{ fontSize: 12.5, fontWeight: 600, color: K.sub }}
                  >
                    Drop drawings or click to browse
                  </div>
                  <div style={{ fontSize: 10, color: K.dim }}>
                    PNG, JPG, JPEG, WEBP, TIFF (max 6)
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFiles(e.target.files)}
                    style={{ display: "none" }}
                  />
                </div>
                {files.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: K.pur,
                        marginBottom: 8,
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                      }}
                    >
                      {files.length} drawing(s) - OCR + Llama will extract specs
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {files.map((f, i) => (
                        <div
                          key={i}
                          style={{
                            position: "relative",
                            width: sm ? 60 : 72,
                            height: sm ? 60 : 72,
                            borderRadius: 9,
                            overflow: "hidden",
                            border: "2px solid " + K.pur + "50",
                            background: K.surf,
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={f.url}
                            alt={f.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              URL.revokeObjectURL(f.url);
                              setFiles((prev) =>
                                prev.filter((_, j) => j !== i),
                              );
                            }}
                            style={{
                              position: "absolute",
                              top: 2,
                              right: 2,
                              width: 17,
                              height: 17,
                              borderRadius: "50%",
                              background: K.red,
                              border: "none",
                              color: "#fff",
                              fontSize: 9,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                            }}
                          >
                            X
                          </button>
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: "rgba(7,9,15,.85)",
                              fontSize: 7,
                              color: K.pur,
                              padding: "2px 3px",
                              textAlign: "center",
                              fontWeight: 700,
                            }}
                          >
                            DWG
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Progress bar */}
            {busy && (
              <div
                style={{
                  marginBottom: 12,
                  padding: "12px 16px",
                  background: K.card,
                  border: "1px solid " + K.bdr,
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 7,
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: K.blue, fontWeight: 600 }}>
                    {prog.msg || "Processing..."}
                  </span>
                  <span style={{ color: K.sub, fontFamily: K.mono }}>
                    {prog.pct}%
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    background: K.dim,
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: prog.pct + "%",
                      background:
                        "linear-gradient(90deg," + K.pur + "," + K.blue + ")",
                      borderRadius: 4,
                      transition: "width .4s",
                    }}
                  />
                </div>
              </div>
            )}

            <Card>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Btn
                  v="primary"
                  sz={sm ? "md" : "lg"}
                  disabled={busy}
                  onClick={doAI}
                >
                  {busy
                    ? "Extracting..."
                    : files.length > 0 && email.trim()
                      ? "Extract - Email + Drawings"
                      : files.length > 0
                        ? "Extract from Drawings"
                        : "Extract from Email"}
                </Btn>
                <Btn v="outline" disabled={busy} onClick={doRegex}>
                  Smart Rules Only
                </Btn>
                <Btn v="ghost" onClick={() => setStep(3)}>
                  Manual Entry
                </Btn>
                {aiSrc && (
                  <Tag col={K.grn} sm>
                    Last: {aiSrc}
                  </Tag>
                )}
              </div>
              {!groqKey && (
                <div
                  style={{
                    marginTop: 10,
                    padding: "9px 13px",
                    background: K.yel + "0d",
                    border: "1px solid " + K.yel + "22",
                    borderRadius: 8,
                    fontSize: 11.5,
                    color: K.yel,
                  }}
                >
                  No Groq key - extraction uses smart rules only.{" "}
                  <button
                    onClick={() => setShowKeyDlg(true)}
                    style={{
                      color: K.blue,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textDecoration: "underline",
                      fontSize: 11.5,
                      padding: 0,
                    }}
                  >
                    Add free Groq key for Llama AI
                  </button>
                </div>
              )}
              <div
                style={{
                  marginTop: 10,
                  fontSize: 10.5,
                  color: K.sub,
                  lineHeight: 1.85,
                }}
              >
                <b style={{ color: K.txt }}>Pipeline:</b> Tesseract OCR
                (drawings) then Llama 3.3 70B via Groq then Llama 3.1 8B then
                Smart Rules. Results merged for max accuracy.
              </div>
            </Card>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <Btn v="outline" onClick={() => setStep(1)}>
                Back
              </Btn>
              <Btn v="primary" onClick={() => setStep(3)}>
                Review Parameters
              </Btn>
            </div>
          </>
        )}

        {/* ==== STEP 3: REVIEW ==== */}
        {step === 3 && (
          <>
            <div
              style={{
                marginBottom: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: sm ? 19 : 26,
                    fontWeight: 800,
                    color: K.txt,
                    marginBottom: 4,
                    letterSpacing: -0.4,
                  }}
                >
                  Review Parameters
                </h1>
                <p style={{ fontSize: 12.5, color: K.sub }}>
                  Verify extracted values. Fix any errors. Required fields
                  marked *.
                </p>
              </div>
              {aiSrc && (
                <Tag col={K.grn} sm>
                  Source: {aiSrc}
                </Tag>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: sm ? "1fr" : lg ? "1fr 1fr" : "1fr 1fr",
                gap: 14,
              }}
            >
              <Card>
                <SH>Client and Delivery</SH>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <Fld label="Client / Company">
                    <Inp
                      value={p.client}
                      onChange={(e) =>
                        setP((x) => ({ ...x, client: e.target.value }))
                      }
                      placeholder="e.g. ACME Engineering Pvt Ltd"
                    />
                  </Fld>
                  <Fld label="Delivery Location">
                    <Inp
                      value={p.delivery}
                      onChange={(e) =>
                        setP((x) => ({ ...x, delivery: e.target.value }))
                      }
                      placeholder="e.g. Chennai, Tamil Nadu"
                    />
                  </Fld>
                  <Fld
                    label="Required Delivery (days)"
                    hint="Client's requested window - used in lead time comparison"
                  >
                    <div
                      style={{ display: "flex", gap: 10, alignItems: "center" }}
                    >
                      <Inp
                        type="number"
                        min="1"
                        value={p.required_days}
                        onChange={(e) =>
                          setP((x) => ({ ...x, required_days: e.target.value }))
                        }
                        placeholder="12"
                        style={{ maxWidth: 120 }}
                      />
                      {p.required_days && (
                        <Tag col={K.yel} sm>
                          Target: {p.required_days} days
                        </Tag>
                      )}
                    </div>
                  </Fld>
                </div>
              </Card>

              <Card>
                <SH>Part Specifications</SH>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <Fld
                      label="Material"
                      required
                      err={
                        !p.material && missing.includes("material")
                          ? "Required"
                          : ""
                      }
                    >
                      <Sel
                        value={p.material}
                        onChange={(e) =>
                          setP((x) => ({ ...x, material: e.target.value }))
                        }
                      >
                        <option value="">Select material</option>
                        {MATS.map((m) => (
                          <option key={m.name} value={m.name}>
                            {m.name}
                          </option>
                        ))}
                      </Sel>
                      {p.material &&
                        (() => {
                          const m = MATS.find((x) => x.name === p.material);
                          return m ? (
                            <span style={{ fontSize: 9.5, color: K.grn }}>
                              {m.density}kg/m3 - Rs{m.ppkg}/kg
                            </span>
                          ) : null;
                        })()}
                    </Fld>
                    <Fld
                      label="Process"
                      required
                      err={
                        !p.process && missing.includes("process")
                          ? "Required"
                          : ""
                      }
                    >
                      <Sel
                        value={p.process}
                        onChange={(e) =>
                          setP((x) => ({ ...x, process: e.target.value }))
                        }
                      >
                        <option value="">Select process</option>
                        {PROCS.map((pr) => (
                          <option key={pr.name} value={pr.name}>
                            {pr.name}
                          </option>
                        ))}
                      </Sel>
                      {p.process &&
                        (() => {
                          const pr = PROCS.find((x) => x.name === p.process);
                          return pr ? (
                            <span style={{ fontSize: 9.5, color: K.grn }}>
                              T: {pr.min_t}-{pr.max_t}mm
                            </span>
                          ) : null;
                        })()}
                    </Fld>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <Fld
                      label="Thickness mm"
                      required
                      err={!p.thickness ? "Required" : ""}
                    >
                      <Inp
                        type="number"
                        min="0.1"
                        step="0.5"
                        value={p.thickness}
                        onChange={(e) =>
                          setP((x) => ({ ...x, thickness: e.target.value }))
                        }
                        placeholder="5"
                      />
                    </Fld>
                    <Fld
                      label="Length mm"
                      required
                      err={!p.length ? "Required" : ""}
                    >
                      <Inp
                        type="number"
                        min="1"
                        value={p.length}
                        onChange={(e) =>
                          setP((x) => ({ ...x, length: e.target.value }))
                        }
                        placeholder="200"
                      />
                    </Fld>
                    <Fld
                      label="Width mm"
                      required
                      err={!p.width ? "Required" : ""}
                    >
                      <Inp
                        type="number"
                        min="1"
                        value={p.width}
                        onChange={(e) =>
                          setP((x) => ({ ...x, width: e.target.value }))
                        }
                        placeholder="100"
                      />
                    </Fld>
                  </div>
                  <Fld
                    label="Quantity (pcs)"
                    required
                    err={!p.quantity ? "Required" : ""}
                  >
                    <Inp
                      type="number"
                      min="1"
                      value={p.quantity}
                      onChange={(e) =>
                        setP((x) => ({ ...x, quantity: e.target.value }))
                      }
                      placeholder="50"
                    />
                  </Fld>
                  <Fld
                    label="Surface Finish"
                    hint="e.g. Powder Coat, Anodize Black, Hot-Dip Galvanize, Shot Blast, Raw"
                  >
                    <Inp
                      value={p.finish}
                      onChange={(e) =>
                        setP((x) => ({ ...x, finish: e.target.value }))
                      }
                      placeholder="Powder Coat - Black RAL 9005"
                    />
                  </Fld>
                </div>
              </Card>
            </div>

            <Card>
              {!valid ? (
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      padding: "9px 13px",
                      background: K.red + "12",
                      border: "1px solid " + K.red + "28",
                      borderRadius: 8,
                      fontSize: 12,
                      color: K.red,
                      flex: 1,
                    }}
                  >
                    Complete all required fields to proceed.
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {missing.map((f) => (
                      <Tag key={f} col={K.red} sm>
                        {f}
                      </Tag>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: "10px 14px",
                    background: K.grn + "10",
                    border: "1px solid " + K.grn + "25",
                    borderRadius: 8,
                    fontSize: 12.5,
                    color: K.grn,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <span>All fields complete - ready to calculate</span>
                  {p.required_days && (
                    <Tag col={K.yel} sm>
                      Client target: {p.required_days} days
                    </Tag>
                  )}
                </div>
              )}
            </Card>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <Btn v="outline" onClick={() => setStep(2)}>
                Back
              </Btn>
              <Btn v="primary" sz="lg" disabled={!valid} onClick={run}>
                Calculate Costs
              </Btn>
            </div>
          </>
        )}

        {/* ==== STEP 4: COSTS ==== */}
        {step === 4 &&
          base &&
          displayCosts &&
          (() => {
            const maxV = Math.max(
              ...CROW.map((r) => displayCosts[r.k] || 0),
              1,
            );
            return (
              <>
                <div
                  style={{
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <div>
                    <h1
                      style={{
                        fontSize: sm ? 19 : 26,
                        fontWeight: 800,
                        color: K.txt,
                        marginBottom: 4,
                        letterSpacing: -0.4,
                      }}
                    >
                      Cost Analysis
                    </h1>
                    <p style={{ fontSize: 12.5, color: K.sub }}>
                      Click any row to override. Currency updates all values
                      instantly.
                    </p>
                  </div>
                  {/* Currency also here for quick access - same state, same effect */}
                  <CcySel ccy={ccy} setCcy={setCcy} ccyList={ccyList} />
                </div>

                {/* Stats row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: sm ? "1fr 1fr" : "repeat(4,1fr)",
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  <StatCard
                    icon="$"
                    label="Total Cost"
                    value={
                      curr.sym + Math.round(displayCosts.total).toLocaleString()
                    }
                    col={K.blue}
                  />
                  <StatCard
                    icon="*"
                    label="Per Part"
                    value={curr.sym + displayCosts.per_part.toFixed(2)}
                    col={K.pur}
                  />
                  <StatCard
                    icon="D"
                    label="Lead Time"
                    value={lt ? lt.total + "d" : "--"}
                    col={K.grn}
                    sub={
                      p.required_days
                        ? lt && lt.total <= +p.required_days
                          ? "Within target"
                          : "Over target"
                        : undefined
                    }
                  />
                  <StatCard
                    icon="!"
                    label="Complexity"
                    value={feas.complexity}
                    col={
                      feas.complexity === "High"
                        ? K.red
                        : feas.complexity === "Medium"
                          ? K.yel
                          : K.grn
                    }
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: lg ? "1.6fr 1fr" : "1fr",
                    gap: 14,
                  }}
                >
                  {/* Left - cost breakdown */}
                  <div>
                    <Card>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 14,
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        <SH>Cost Breakdown - click to edit</SH>
                        {Object.keys(ov).length > 0 && (
                          <Btn
                            v="ghost"
                            sz="sm"
                            onClick={() => setOv({})}
                            style={{ color: K.red, fontSize: 11 }}
                          >
                            Reset overrides
                          </Btn>
                        )}
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "18px 1fr 105px",
                          gap: 8,
                          padding: "3px 0 8px",
                          borderBottom: "1px solid " + K.bdr,
                        }}
                      >
                        <div />
                        <div
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: K.sub,
                            letterSpacing: 1,
                            textTransform: "uppercase",
                          }}
                        >
                          ITEM
                        </div>
                        <div
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: K.sub,
                            letterSpacing: 1,
                            textTransform: "uppercase",
                            textAlign: "right",
                          }}
                        >
                          AMOUNT ({ccy})
                        </div>
                      </div>

                      {CROW.map((row, i) => {
                        const bv = base[row.k] || 0;
                        const dv = displayCosts[row.k] || 0;
                        const edited = ov[row.k] !== undefined;
                        return (
                          <div
                            key={row.k}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "18px 1fr 105px",
                              gap: 8,
                              alignItems: "center",
                              padding: "7px 0",
                              borderBottom: "1px solid " + K.bg,
                            }}
                          >
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 2,
                                background: BCOLS[i % BCOLS.length],
                                flexShrink: 0,
                              }}
                            />
                            <div>
                              <div
                                style={{
                                  fontSize: 11.5,
                                  fontWeight: 600,
                                  color: edited ? K.yel : "#94a3b8",
                                }}
                              >
                                {row.label}
                              </div>
                              <div
                                style={{
                                  fontSize: 9.5,
                                  color: K.sub,
                                  marginTop: 1,
                                }}
                              >
                                {row.det}
                              </div>
                              {edited && (
                                <div
                                  style={{
                                    fontSize: 9,
                                    color: K.dim,
                                    marginTop: 1,
                                  }}
                                >
                                  calc: {curr.sym}
                                  {bv.toFixed(2)}
                                </div>
                              )}
                            </div>
                            <div style={{ position: "relative" }}>
                              <span
                                style={{
                                  position: "absolute",
                                  left: 7,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  fontSize: 9,
                                  color: K.sub,
                                  pointerEvents: "none",
                                  fontFamily: K.mono,
                                }}
                              >
                                {curr.sym}
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                value={dv.toFixed(2)}
                                onChange={(e) =>
                                  setOv((prev) => ({
                                    ...prev,
                                    [row.k]: Math.max(0, +e.target.value),
                                  }))
                                }
                                style={{
                                  background: K.surf,
                                  border:
                                    "1px solid " +
                                    (edited ? K.yel + "88" : K.bdr),
                                  borderRadius: 7,
                                  padding: "7px 6px 7px 20px",
                                  color: edited ? K.yel : K.txt,
                                  fontSize: 11.5,
                                  fontWeight: 700,
                                  width: "100%",
                                  boxSizing: "border-box",
                                  fontFamily: K.mono,
                                  outline: "none",
                                  textAlign: "right",
                                  transition: "border-color .2s",
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}

                      <div
                        style={{
                          marginTop: 12,
                          padding: "11px 0",
                          borderTop: "1px solid " + K.bdr,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: sm ? 15 : 18,
                            fontWeight: 800,
                            color: K.blue,
                          }}
                        >
                          TOTAL
                        </span>
                        <span
                          style={{
                            fontSize: sm ? 15 : 18,
                            fontWeight: 800,
                            color: K.blue,
                            fontFamily: K.mono,
                          }}
                        >
                          {curr.sym}
                          {displayCosts.total.toFixed(2)}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 11.5,
                          color: K.sub,
                        }}
                      >
                        <span>Per Part</span>
                        <span style={{ fontFamily: K.mono }}>
                          {curr.sym}
                          {displayCosts.per_part.toFixed(2)} x {p.quantity} pcs
                        </span>
                      </div>
                      {Object.keys(ov).length > 0 && (
                        <div
                          style={{
                            marginTop: 10,
                            padding: "8px 12px",
                            background: K.yel + "0a",
                            border: "1px solid " + K.yel + "22",
                            borderRadius: 8,
                            fontSize: 10.5,
                            color: K.yel,
                          }}
                        >
                          {Object.keys(ov).length} value(s) overridden. Click
                          Reset to restore.
                        </div>
                      )}

                      {/* Mini bars */}
                      <div
                        style={{
                          marginTop: 14,
                          borderTop: "1px solid " + K.bdr,
                          paddingTop: 12,
                        }}
                      >
                        {CROW.map((row, i) => {
                          const v = displayCosts[row.k] || 0;
                          return (
                            <div
                              key={row.k}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 5,
                              }}
                            >
                              <div
                                style={{
                                  width: 64,
                                  fontSize: 9.5,
                                  color: K.sub,
                                  textAlign: "right",
                                  flexShrink: 0,
                                  lineHeight: 1.3,
                                }}
                              >
                                {row.label}
                              </div>
                              <div
                                style={{
                                  flex: 1,
                                  background: K.dim + "55",
                                  borderRadius: 4,
                                  height: 14,
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    width: Math.max(2, (v / maxV) * 100) + "%",
                                    height: "100%",
                                    background: BCOLS[i % BCOLS.length],
                                    transition: "width .6s",
                                    borderRadius: 4,
                                  }}
                                />
                              </div>
                              <div
                                style={{
                                  width: 68,
                                  fontSize: 9.5,
                                  color: K.txt,
                                  fontWeight: 600,
                                  textAlign: "right",
                                  fontFamily: K.mono,
                                  flexShrink: 0,
                                }}
                              >
                                {curr.sym}
                                {v.toFixed(0)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>

                    {/* Additional charges */}
                    <Card>
                      <SH>Additional Charges</SH>
                      {extras.map((ex, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            gap: 8,
                            marginBottom: 8,
                            alignItems: "center",
                          }}
                        >
                          <Inp
                            value={ex.label}
                            onChange={(e) =>
                              setExtras((prev) =>
                                prev.map((c, j) =>
                                  j === i ? { ...c, label: e.target.value } : c,
                                ),
                              )
                            }
                            placeholder="Label e.g. GST, Inspection"
                            style={{ flex: 2 }}
                          />
                          <div style={{ position: "relative", flex: 1 }}>
                            <span
                              style={{
                                position: "absolute",
                                left: 9,
                                top: "50%",
                                transform: "translateY(-50%)",
                                fontSize: 11,
                                color: K.sub,
                              }}
                            >
                              Rs
                            </span>
                            <Inp
                              type="number"
                              value={ex.amount}
                              onChange={(e) =>
                                setExtras((prev) =>
                                  prev.map((c, j) =>
                                    j === i
                                      ? { ...c, amount: e.target.value }
                                      : c,
                                  ),
                                )
                              }
                              placeholder="0"
                              style={{ paddingLeft: 28, fontFamily: K.mono }}
                            />
                          </div>
                          <Btn
                            v="ghost"
                            sz="sm"
                            onClick={() =>
                              setExtras((prev) =>
                                prev.filter((_, j) => j !== i),
                              )
                            }
                            style={{ color: K.red, flexShrink: 0 }}
                          >
                            X
                          </Btn>
                        </div>
                      ))}
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          marginTop: 4,
                          flexWrap: "wrap",
                        }}
                      >
                        <Btn
                          v="outline"
                          sz="sm"
                          onClick={() =>
                            setExtras((prev) => [
                              ...prev,
                              { label: "", amount: "" },
                            ])
                          }
                        >
                          Add
                        </Btn>
                        <Btn v="primary" sz="sm" onClick={run}>
                          Recalculate
                        </Btn>
                      </div>
                    </Card>

                    {/* Gantt */}
                    {lt && (
                      <Card>
                        <SH>Production Schedule</SH>
                        <GanttChart
                          schedule={lt.schedule}
                          total={lt.total}
                          clientDays={p.required_days}
                          sm={sm}
                        />
                      </Card>
                    )}
                  </div>

                  {/* Right sidebar */}
                  <div>
                    <Card>
                      <SH>Cost Distribution</SH>
                      <Donut
                        slices={[
                          { label: "Material", v: displayCosts.material || 0 },
                          { label: "Machine", v: displayCosts.machine || 0 },
                          { label: "Labor", v: displayCosts.labor || 0 },
                          {
                            label: "Overhead",
                            v:
                              (displayCosts.setup || 0) +
                              (displayCosts.finishing || 0) +
                              (displayCosts.packaging || 0) +
                              (displayCosts.transport || 0) +
                              (displayCosts.extra || 0),
                          },
                          { label: "Profit", v: displayCosts.profit || 0 },
                        ]}
                      />
                    </Card>

                    <Card>
                      <SH>Part Details</SH>
                      <KV label="Material" value={base.mat.name} mono />
                      <KV
                        label="Density"
                        value={base.mat.density + " kg/m3"}
                        mono
                      />
                      <KV
                        label="Weight"
                        value={base.weight.toFixed(5) + " kg"}
                        mono
                      />
                      <KV
                        label="Mat Rate"
                        value={"Rs" + base.mat.ppkg + "/kg"}
                        mono
                      />
                      <KV label="Process" value={base.proc.name} mono />
                      <KV
                        label="Mach Hrs"
                        value={base.mhrs.toFixed(3) + " hrs"}
                        mono
                      />
                      <KV label="Quantity" value={p.quantity + " pcs"} mono />
                      {p.required_days && (
                        <div
                          style={{
                            marginTop: 10,
                            padding: "8px 11px",
                            background:
                              lt && lt.total > +p.required_days
                                ? K.red + "0d"
                                : K.grn + "0d",
                            border:
                              "1px solid " +
                              (lt && lt.total > +p.required_days
                                ? K.red + "22"
                                : K.grn + "22"),
                            borderRadius: 8,
                            fontSize: 11.5,
                            color:
                              lt && lt.total > +p.required_days
                                ? "#fca5a5"
                                : K.grn,
                          }}
                        >
                          Client: <b>{p.required_days}d</b> - We:{" "}
                          <b>{lt && lt.total}d</b>{" "}
                          {lt && lt.total <= +p.required_days
                            ? "OK"
                            : "Discuss expedite"}
                        </div>
                      )}
                    </Card>

                    {feas && feas.warnings && feas.warnings.length > 0 && (
                      <Card style={{ border: "1px solid " + K.yel + "22" }}>
                        <SH>Manufacturing Notes</SH>
                        {feas.warnings.map((w, i) => (
                          <div
                            key={i}
                            style={{
                              padding: "7px 10px",
                              borderRadius: 7,
                              marginBottom: 5,
                              fontSize: 11.5,
                              background:
                                w.lvl === "error" ? K.red + "0f" : K.yel + "0f",
                              border:
                                "1px solid " +
                                (w.lvl === "error"
                                  ? K.red + "28"
                                  : K.yel + "28"),
                              color: w.lvl === "error" ? "#fca5a5" : "#fcd34d",
                            }}
                          >
                            {w.msg}
                          </div>
                        ))}
                      </Card>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <Btn v="outline" onClick={() => setStep(3)}>
                    Back
                  </Btn>
                  <Btn v="primary" sz="lg" onClick={() => setStep(5)}>
                    Generate Quote
                  </Btn>
                </div>
              </>
            );
          })()}

        {/* ==== STEP 5: QUOTE ==== */}
        {step === 5 && displayCosts && (
          <>
            <div
              style={{
                marginBottom: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: sm ? 19 : 26,
                    fontWeight: 800,
                    color: K.txt,
                    marginBottom: 4,
                    letterSpacing: -0.4,
                  }}
                >
                  Quotation
                </h1>
                <p style={{ fontSize: 12.5, color: K.sub }}>
                  Review final quote. Export as PDF, CSV or JSON.
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Tag col={K.blue} sm>
                  {qid}
                </Tag>
                {/* Currency in quote step - same state, same effect everywhere */}
                <CcySel ccy={ccy} setCcy={setCcy} ccyList={ccyList} />
              </div>
            </div>

            {/* Quote summary */}
            <Card style={{ border: "1px solid " + K.blue + "22" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: sm ? "1fr" : "1fr 1fr",
                  gap: 14,
                  marginBottom: 16,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      color: K.sub,
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    Client
                  </div>
                  <KV label="Company" value={p.client || "--"} />
                  <KV label="Delivery" value={p.delivery || "--"} />
                  <KV label="Finish" value={p.finish || "Standard"} />
                  <KV
                    label="Target"
                    value={
                      p.required_days
                        ? p.required_days + " days"
                        : "Not specified"
                    }
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      color: K.sub,
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    Part
                  </div>
                  <KV label="Material" value={p.material || "--"} mono />
                  <KV
                    label="Thickness"
                    value={(p.thickness || "--") + " mm"}
                    mono
                  />
                  <KV
                    label="Size"
                    value={
                      (p.length || "--") + " x " + (p.width || "--") + " mm"
                    }
                    mono
                  />
                  <KV
                    label="Quantity"
                    value={(p.quantity || "--") + " pcs"}
                    mono
                  />
                  <KV label="Process" value={p.process || "--"} mono />
                </div>
              </div>

              {/* Cost summary stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: sm ? "1fr 1fr" : "repeat(3,1fr)",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <StatCard
                  icon="$"
                  label="Total Cost"
                  value={fmtAmt(displayCosts.total)}
                  col={K.blue}
                />
                <StatCard
                  icon="*"
                  label="Per Part"
                  value={fmtAmt(displayCosts.per_part)}
                  col={K.pur}
                />
                <StatCard
                  icon="D"
                  label="Lead Time"
                  value={lt ? lt.total + " days" : "--"}
                  col={K.grn}
                />
              </div>

              {/* Commercial terms */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: sm ? "1fr 1fr" : "repeat(4,1fr)",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                {[
                  [
                    "Our Lead Time",
                    lt ? lt.total + " working days" : "7-21 days",
                  ],
                  [
                    "Client Target",
                    p.required_days
                      ? p.required_days + " days"
                      : "Not specified",
                  ],
                  ["Quote Valid", "30 days"],
                  ["Payment", "50% advance"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      background: K.surf,
                      borderRadius: 8,
                      padding: "9px 11px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        color: K.sub,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        marginBottom: 3,
                      }}
                    >
                      {k}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#64748b",
                      }}
                    >
                      {v}
                    </div>
                  </div>
                ))}
              </div>

              {/* Lead time verdict */}
              {lt && p.required_days && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 9,
                    fontSize: 12,
                    fontWeight: 600,
                    background:
                      lt.total <= +p.required_days
                        ? K.grn + "10"
                        : K.red + "10",
                    border:
                      "1px solid " +
                      (lt.total <= +p.required_days
                        ? K.grn + "28"
                        : K.red + "28"),
                    color: lt.total <= +p.required_days ? K.grn : "#fca5a5",
                    marginBottom: 16,
                  }}
                >
                  {lt.total <= +p.required_days
                    ? "Lead time (" +
                      lt.total +
                      "d) meets client target (" +
                      p.required_days +
                      "d)."
                    : "Lead time (" +
                      lt.total +
                      "d) exceeds target (" +
                      p.required_days +
                      "d) by " +
                      (lt.total - +p.required_days) +
                      "d - discuss expediting."}
                </div>
              )}

              {/* Gantt in quote */}
              {lt && (
                <div>
                  <div
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      color: K.sub,
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      marginBottom: 10,
                    }}
                  >
                    Production Schedule
                  </div>
                  <GanttChart
                    schedule={lt.schedule}
                    total={lt.total}
                    clientDays={p.required_days}
                    sm={sm}
                  />
                </div>
              )}
            </Card>

            {/* Feasibility warnings */}
            {feas && feas.warnings && feas.warnings.length > 0 && (
              <Card style={{ border: "1px solid " + K.yel + "28" }}>
                <SH>Manufacturing Notes - Complexity: {feas.complexity}</SH>
                {feas.warnings.map((w, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "7px 10px",
                      borderRadius: 7,
                      marginBottom: 5,
                      fontSize: 12,
                      background:
                        w.lvl === "error" ? K.red + "0f" : K.yel + "0f",
                      border:
                        "1px solid " +
                        (w.lvl === "error" ? K.red + "28" : K.yel + "28"),
                      color: w.lvl === "error" ? "#fca5a5" : "#fcd34d",
                    }}
                  >
                    {w.msg}
                  </div>
                ))}
              </Card>
            )}

            {/* Export buttons */}
            <Card>
              <SH>Export Quotation</SH>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Btn v="danger" sz="lg" disabled={pdfBusy} onClick={doPDF}>
                  {pdfBusy ? "Generating PDF..." : "Download PDF"}
                </Btn>
                <Btn
                  v="outline"
                  onClick={() =>
                    exportCSV(
                      qid,
                      p,
                      displayCosts,
                      activeExtras,
                      lt,
                      co,
                      ccySrc,
                    )
                  }
                >
                  Export CSV
                </Btn>
                <Btn
                  v="outline"
                  onClick={() =>
                    exportJSON(
                      qid,
                      p,
                      displayCosts,
                      activeExtras,
                      lt,
                      co,
                      ccy,
                      ccySrc,
                    )
                  }
                >
                  Export JSON
                </Btn>
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 10.5,
                  color: K.sub,
                  lineHeight: 1.75,
                }}
              >
                PDF includes: client info, part specs, full cost breakdown,
                production Gantt chart, commercial terms. All exports use
                currency: <b style={{ color: K.blue }}>{ccy}</b> - change the
                currency selector above to switch.
              </div>
            </Card>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <Btn v="outline" onClick={() => setStep(4)}>
                Back to Costs
              </Btn>
              <Btn v="ghost" onClick={reset}>
                New RFQ
              </Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
