// ─────────────────────────────────────────────────────────────────────────────
// RFQ ANALYZER PRO — Full-Stack SaaS
// Industrial Precision aesthetic · AI PDF+Drawing extraction · Professional PDF
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useCallback, useEffect } from "react";

// ── External fonts & libraries ──────────────────────────────────────────────
(function loadDeps() {
  const font = document.createElement("link");
  font.rel = "stylesheet";
  font.href =
    "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Barlow:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap";
  document.head.appendChild(font);

  const pdf = document.createElement("script");
  pdf.src =
    "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
  document.head.appendChild(pdf);
})();

// ════════════════════════════════════════════════════════════════════════════
// MASTER DATA
// ════════════════════════════════════════════════════════════════════════════
const MATERIALS = [
  { name: "Mild Steel", density: 7850, ppkg: 80, color: "#64748b" },
  { name: "Stainless Steel 304", density: 8000, ppkg: 180, color: "#94a3b8" },
  { name: "Aluminium 6061", density: 2700, ppkg: 250, color: "#60a5fa" },
  { name: "Carbon Steel", density: 7850, ppkg: 90, color: "#78716c" },
  { name: "Galvanized Steel", density: 7850, ppkg: 95, color: "#6b7280" },
  { name: "Brass", density: 8500, ppkg: 300, color: "#d97706" },
  { name: "Copper", density: 8960, ppkg: 450, color: "#b45309" },
  { name: "Tool Steel", density: 7750, ppkg: 350, color: "#475569" },
  { name: "Titanium", density: 4500, ppkg: 1200, color: "#7c3aed" },
  { name: "Cast Iron", density: 7200, ppkg: 65, color: "#374151" },
];

const PROCESSES = [
  {
    name: "Laser Cutting",
    rate: 600,
    setup: 500,
    min_t: 0.5,
    max_t: 25,
    icon: "🔴",
  },
  {
    name: "CNC Machining",
    rate: 900,
    setup: 1000,
    min_t: 1,
    max_t: 200,
    icon: "⚙️",
  },
  { name: "Bending", rate: 400, setup: 300, min_t: 0.5, max_t: 20, icon: "🔧" },
  { name: "Welding", rate: 500, setup: 400, min_t: 1, max_t: 50, icon: "🔥" },
  {
    name: "Grinding",
    rate: 300,
    setup: 200,
    min_t: 0.5,
    max_t: 100,
    icon: "⚡",
  },
  {
    name: "Plasma Cutting",
    rate: 350,
    setup: 400,
    min_t: 1,
    max_t: 60,
    icon: "🌡️",
  },
  {
    name: "Waterjet Cutting",
    rate: 700,
    setup: 600,
    min_t: 0.5,
    max_t: 200,
    icon: "💧",
  },
  { name: "EDM", rate: 1200, setup: 1500, min_t: 0.1, max_t: 300, icon: "⚡" },
  { name: "Turning", rate: 600, setup: 800, min_t: 5, max_t: 500, icon: "🔩" },
  { name: "Milling", rate: 750, setup: 900, min_t: 1, max_t: 300, icon: "🏭" },
];

const COMPANIES = [
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
    addr: "Chennai, Tamil Nadu",
    gst: "33AABCD1234E1Z5",
    phone: "+91 44 2345 6789",
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
    addr: "Mumbai, Maharashtra",
    gst: "27AABCD5678F1Z2",
    phone: "+91 22 3456 7890",
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
    addr: "Pune, Maharashtra",
    gst: "27AABCE9012G1Z8",
    phone: "+91 20 4567 8901",
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
    addr: "Coimbatore, TN",
    gst: "33AABCF3456H1Z3",
    phone: "+91 422 567 8901",
  },
  {
    name: "MetalCraft Solutions",
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
    addr: "Bangalore, Karnataka",
    gst: "29AABCG7890I1Z7",
    phone: "+91 80 5678 9012",
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
    addr: "",
    gst: "",
    phone: "",
  },
];

const CURRENCIES = [
  { code: "INR", sym: "₹", rate: 1, flag: "🇮🇳" },
  { code: "USD", sym: "$", rate: 83.5, flag: "🇺🇸" },
  { code: "EUR", sym: "€", rate: 91.2, flag: "🇪🇺" },
  { code: "GBP", sym: "£", rate: 106.3, flag: "🇬🇧" },
  { code: "AED", sym: "د.إ", rate: 22.7, flag: "🇦🇪" },
];

const FINISH_OPTIONS = [
  "Raw / No Finish",
  "Powder Coat (Standard)",
  "Powder Coat (RAL Custom)",
  "Anodizing (Clear)",
  "Anodizing (Black)",
  "Hard Anodizing",
  "Hot-Dip Galvanizing",
  "Electroplating (Zinc)",
  "Chrome Plating",
  "Mirror Polish",
  "Brushed / Satin Finish",
  "Sandblast + Primer",
  "Passivation",
  "Nickel Plating",
  "Phosphating",
  "Custom Finish",
];

const DEFAULT_EXTRAS = [
  {
    id: "gst",
    label: "GST 18%",
    type: "percent",
    value: "18",
    enabled: true,
    locked: true,
  },
  {
    id: "insp",
    label: "Quality Inspection",
    type: "fixed",
    value: "500",
    enabled: false,
    locked: false,
  },
  {
    id: "exp",
    label: "Expedite Surcharge",
    type: "percent",
    value: "15",
    enabled: false,
    locked: false,
  },
  {
    id: "tool",
    label: "Special Tooling",
    type: "fixed",
    value: "0",
    enabled: false,
    locked: false,
  },
  {
    id: "pkg",
    label: "Premium Packaging",
    type: "fixed",
    value: "0",
    enabled: false,
    locked: false,
  },
  {
    id: "custom1",
    label: "",
    type: "fixed",
    value: "0",
    enabled: false,
    locked: false,
  },
  {
    id: "custom2",
    label: "",
    type: "fixed",
    value: "0",
    enabled: false,
    locked: false,
  },
];

// ════════════════════════════════════════════════════════════════════════════
// CALCULATION ENGINES
// ════════════════════════════════════════════════════════════════════════════
function calcCosts(part, co, ccyCode) {
  const mat = MATERIALS.find((m) => m.name === part.material) || MATERIALS[0];
  const proc = PROCESSES.find((p) => p.name === part.process) || PROCESSES[0];
  const ccy = CURRENCIES.find((c) => c.code === ccyCode) || CURRENCIES[0];
  const L = +part.length || 200;
  const W = +part.width || 100;
  const T = +part.thickness || 5;
  const Q = +part.quantity || 1;

  const wt = (L / 1000) * (W / 1000) * (T / 1000) * mat.density;
  const matINR = wt * mat.ppkg;

  const rateMap = {
    "laser cutting": co.laser,
    "cnc machining": co.cnc,
    bending: co.bending,
    welding: co.welding,
    grinding: co.grinding,
    "plasma cutting": co.laser * 0.6,
    "waterjet cutting": co.laser * 1.2,
    edm: co.cnc * 1.3,
    turning: co.cnc * 0.7,
    milling: co.cnc * 0.85,
  };
  const mrate = rateMap[proc.name.toLowerCase()] || co.laser;
  const mhrs = Math.max(0.25, (L / 1000) * (W / 1000) * 2.5 + T * 0.02);

  const machINR = mhrs * mrate;
  const labINR = mhrs * 0.8 * co.labor;
  const setupINR = proc.setup / Math.max(Q, 1);
  const finINR = co.finishing;
  const pkgINR = co.packaging / Math.max(Q, 1);
  const trINR = co.transport / Math.max(Q, 1);

  const unitSub =
    matINR + machINR + labINR + setupINR + finINR + pkgINR + trINR;
  const unitProfit = unitSub * co.margin;
  const unitTot = unitSub + unitProfit;
  const totalINR = unitTot * Q;

  const cv = (v) => v / ccy.rate;
  return {
    material: cv(matINR),
    machine: cv(machINR),
    labor: cv(labINR),
    setup: cv(setupINR),
    finishing: cv(finINR),
    packaging: cv(pkgINR),
    transport: cv(trINR),
    profit: cv(unitProfit),
    per_part: cv(unitTot),
    subtotal: cv(unitSub * Q),
    total: cv(totalINR),
    weight: wt,
    mhrs,
    mat,
    proc,
    ccy,
  };
}

function calcExtrasTotal(extras, subtotalBeforeExtras, ccy) {
  const curr = CURRENCIES.find((c) => c.code === ccy) || CURRENCIES[0];
  let total = 0;
  const rows = extras
    .filter((e) => e.enabled && e.label && +e.value > 0)
    .map((e) => {
      let amt = 0;
      if (e.type === "percent") {
        amt = (subtotalBeforeExtras * +e.value) / 100;
      } else {
        amt = +e.value / curr.rate;
      }
      total += amt;
      return { ...e, computed: amt };
    });
  return { rows, total };
}

function calcFeasibility(part) {
  const proc = PROCESSES.find((p) => p.name === part.process);
  const T = +part.thickness,
    Q = +part.quantity;
  const L = +part.length,
    W = +part.width;
  const warns = [];
  if (proc) {
    if (T > proc.max_t)
      warns.push({
        lvl: "error",
        msg: `Thickness ${T}mm exceeds ${proc.name} max (${proc.max_t}mm). Switch to Plasma/Waterjet.`,
      });
    if (T < proc.min_t)
      warns.push({
        lvl: "error",
        msg: `Thickness ${T}mm below ${proc.name} min (${proc.min_t}mm). Warping risk.`,
      });
  }
  if ((part.material || "").toLowerCase().includes("titanium"))
    warns.push({
      lvl: "warn",
      msg: "Titanium requires specialised tooling — extend lead time budget.",
    });
  if (L > 3000 || W > 1500)
    warns.push({
      lvl: "warn",
      msg: `Oversized part (${L}×${W}mm) — verify machine bed capacity.`,
    });
  if (Q < 5)
    warns.push({
      lvl: "info",
      msg: "Very low quantity — setup cost amortised over fewer pieces.",
    });
  if (Q > 1000)
    warns.push({
      lvl: "info",
      msg: "High volume order — negotiate bulk material discount.",
    });
  if ((part.finish || "").match(/mirror|polish/i))
    warns.push({
      lvl: "warn",
      msg: "Mirror/polish finish adds ~20% cost and lead time.",
    });
  const errs = warns.filter((w) => w.lvl === "error").length;
  const warnCount = warns.filter((w) => w.lvl === "warn").length;
  return {
    warnings: warns,
    complexity: errs > 0 ? "High" : warnCount > 1 ? "Medium" : "Low",
    score: errs > 0 ? 0 : warnCount > 1 ? 50 : 100,
  };
}

function calcLeadTime(part, mhrs) {
  const Q = +part.quantity || 1;
  const T = +part.thickness || 5;
  const qF = Math.max(1, Math.ceil(Q / 50));
  const tF = T > 20 ? 1.5 : T > 10 ? 1.2 : 1;
  const cF = ["CNC Machining", "EDM", "Milling", "Turning"].includes(
    part.process,
  )
    ? 1.5
    : 1;
  const noFinish =
    !part.finish ||
    ["raw", "raw / no finish", "none", ""].includes(
      (part.finish || "").toLowerCase(),
    );

  const stages = [
    {
      label: "Order Confirmation",
      days: 1,
      color: "#38bdf8",
      desc: "PO sign-off, drawing review",
    },
    {
      label: "Material Procurement",
      days: Math.ceil((T > 15 ? 3 : 2) * tF),
      color: "#818cf8",
      desc: "Source & receive raw stock",
    },
    {
      label: "Machine Setup",
      days: Math.ceil(cF),
      color: "#f59e0b",
      desc: "NC programming & tooling",
    },
    {
      label: "Manufacturing",
      days: Math.max(1, Math.ceil((mhrs * qF * cF) / 8)),
      color: "#10b981",
      desc: `${part.process} — ${(mhrs * Q).toFixed(1)} machine-hrs`,
    },
    {
      label: "Quality Inspection",
      days: Math.max(1, Math.ceil(Q / 200)),
      color: "#06b6d4",
      desc: "Dimensional & surface check",
    },
    ...(!noFinish
      ? [
          {
            label: "Surface Finishing",
            days: Math.max(1, Math.ceil(Q / 100)),
            color: "#ec4899",
            desc: part.finish,
          },
        ]
      : []),
    {
      label: "Packing & Dispatch",
      days: 1,
      color: "#84cc16",
      desc: "Pack, label, book freight",
    },
  ];
  let cum = 0;
  const schedule = stages.map((s) => {
    const st = cum + 1;
    cum += s.days;
    return { ...s, start: st, end: cum };
  });
  return { schedule, total: cum };
}

function genQID() {
  const d = new Date();
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const dy = String(d.getDate()).padStart(2, "0");
  return `QT-${yr}${mo}${dy}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// ════════════════════════════════════════════════════════════════════════════
// AI EXTRACTION
// ════════════════════════════════════════════════════════════════════════════
async function callAI(messages, maxTokens = 2000) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      messages,
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  return data.content?.map((b) => b.text || "").join("") || "";
}

async function extractFromText(text) {
  const prompt = `You are an expert fabrication engineer. Extract ALL details from this RFQ email/text.

Return ONLY a valid JSON object — no markdown, no explanation:
{
  "client": {
    "company": "", "name": "", "email": "", "phone": "",
    "address": "", "city": "", "state": "", "pincode": "", "country": "India",
    "gst": "", "pan": "", "required_days": "", "payment_terms": "", "incoterms": ""
  },
  "parts": [
    {
      "partName": "", "drawingNo": "", "description": "",
      "material": "", "process": "",
      "length": "", "width": "", "height": "",
      "thickness": "", "diameter": "",
      "quantity": "", "finish": "",
      "tolerance": "", "hardness": "", "notes": ""
    }
  ],
  "order_notes": ""
}

Rules:
- material must be one of: ${MATERIALS.map((m) => m.name).join(", ")}
- process must be one of: ${PROCESSES.map((p) => p.name).join(", ")}
- use numbers only for mm/qty/days — no units in values
- extract EVERY part mentioned, each as a separate object
- empty string for anything not found

Text:
${text}`;

  const txt = await callAI([{ role: "user", content: prompt }], 2000);
  return JSON.parse(txt.replace(/```json|```/g, "").trim());
}

async function extractFromPDF(base64Data, mimeType) {
  const prompt = `You are an expert fabrication engineer. This document is a client RFQ (Request for Quotation) — it may contain an email, specification sheet, engineering drawing, or all of the above.

Extract ALL manufacturing and client details you can find.

Return ONLY valid JSON — no markdown, no explanation:
{
  "client": {
    "company": "", "name": "", "email": "", "phone": "",
    "address": "", "city": "", "state": "", "pincode": "", "country": "India",
    "gst": "", "pan": "", "required_days": "", "payment_terms": "", "incoterms": ""
  },
  "parts": [
    {
      "partName": "", "drawingNo": "", "description": "",
      "material": "", "process": "",
      "length": "", "width": "", "height": "",
      "thickness": "", "diameter": "",
      "quantity": "", "finish": "",
      "tolerance": "", "hardness": "", "notes": "",
      "extracted_from_drawing": true
    }
  ],
  "drawing_info": {
    "has_drawing": false,
    "drawing_title": "",
    "revision": "",
    "scale": "",
    "projection": "",
    "surface_roughness": "",
    "general_tolerance": "",
    "material_spec": "",
    "heat_treatment": "",
    "notes": []
  },
  "order_notes": ""
}

Rules:
- material must be one of: ${MATERIALS.map((m) => m.name).join(", ")}
- process must be one of: ${PROCESSES.map((p) => p.name).join(", ")}
- values for mm/qty/days — numbers only, no units
- extract EVERY part / component found
- read title block, BOM table, notes block, revision history
- empty string for missing fields`;

  const txt = await callAI(
    [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: mimeType, data: base64Data },
          },
          { type: "text", text: prompt },
        ],
      },
    ],
    3000,
  );
  return JSON.parse(txt.replace(/```json|```/g, "").trim());
}

// ════════════════════════════════════════════════════════════════════════════
// PROFESSIONAL PDF QUOTATION BUILDER
// ════════════════════════════════════════════════════════════════════════════
function buildQuotationHTML({
  qid,
  client,
  parts,
  costsArr,
  extraRows,
  extraTotal,
  grandTotal,
  co,
  currency,
  ltArr,
  drawingInfo,
}) {
  const curr = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
  const fmt = (v) =>
    `${curr.sym}${Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const validUntil = new Date(
    now.getTime() + 30 * 24 * 60 * 60 * 1000,
  ).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const totalPcs = parts.reduce((s, p) => s + (+p.quantity || 0), 0);

  const partsTableRows = parts
    .map((p, i) => {
      const c = costsArr[i];
      if (!c) return "";
      return `
    <tr>
      <td class="ctr" style="font-weight:700;color:#1e293b">${i + 1}</td>
      <td>
        <div style="font-weight:700;color:#0f172a;font-size:13px">${p.partName || `Part ${i + 1}`}</div>
        ${p.drawingNo ? `<div style="font-size:10px;color:#64748b;font-family:'Courier New',monospace">Dwg: ${p.drawingNo}</div>` : ""}
        ${p.description ? `<div style="font-size:11px;color:#475569;margin-top:2px">${p.description}</div>` : ""}
      </td>
      <td>
        <div style="font-weight:600;font-size:12px">${p.material}</div>
        <div style="font-size:10px;color:#64748b">${p.process}</div>
        ${p.finish && p.finish !== "Raw / No Finish" ? `<div style="font-size:10px;color:#64748b">${p.finish}</div>` : ""}
      </td>
      <td class="ctr" style="font-family:'Courier New',monospace;font-size:11px">
        ${p.length && p.width ? `${p.length}×${p.width}` : "—"}
        ${p.thickness ? `<br><span style="color:#94a3b8">t:${p.thickness}mm</span>` : ""}
      </td>
      <td class="ctr" style="font-weight:700">${p.quantity}</td>
      <td class="ctr" style="font-family:'Courier New',monospace">${fmt(c.per_part)}</td>
      <td class="ctr" style="font-weight:700;color:#1d4ed8;font-family:'Courier New',monospace">${fmt(c.total)}</td>
    </tr>`;
    })
    .join("");

  const costDetailRows = parts
    .map((p, i) => {
      const c = costsArr[i];
      if (!c) return "";
      const rows = [
        [
          "Raw Material",
          `${p.material} · ${c.weight.toFixed(4)} kg · ₹${c.mat.ppkg}/kg`,
          c.material,
        ],
        ["Machining", `${p.process} · ${c.mhrs.toFixed(3)} hrs`, c.machine],
        ["Labour", "Operator + supervision", c.labor],
        ["Setup & Prog.", `NC programming & ${p.process} setup`, c.setup],
        ["Surface Finish", p.finish || "Standard", c.finishing],
        ["Packaging", "Protective export packing per piece", c.packaging],
        [
          "Transport",
          `Freight to ${client.city || "destination"}`,
          c.transport,
        ],
        [
          `Profit (${(co.margin * 100).toFixed(0)}%)`,
          "Overhead & margin",
          c.profit,
        ],
      ];
      return `
    <div class="cost-block" style="break-inside:avoid;margin-bottom:16px">
      <div style="background:#0f172a;color:#fff;padding:8px 14px;border-radius:6px 6px 0 0;font-size:12px;font-weight:700;display:flex;justify-content:space-between">
        <span>${p.partName || `Part ${i + 1}`} ${p.drawingNo ? `— ${p.drawingNo}` : ""}</span>
        <span style="color:#38bdf8">${p.quantity} pcs</span>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:12px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 6px 6px;overflow:hidden">
        ${rows
          .map(
            ([k, d, v]) => `
        <tr>
          <td style="padding:7px 14px;color:#475569;border-bottom:1px solid #f1f5f9;width:160px;font-weight:600">${k}</td>
          <td style="padding:7px 14px;color:#94a3b8;border-bottom:1px solid #f1f5f9;font-size:11px">${d}</td>
          <td style="padding:7px 14px;text-align:right;border-bottom:1px solid #f1f5f9;font-family:'Courier New',monospace;font-weight:600;width:100px">${fmt(v)}</td>
        </tr>`,
          )
          .join("")}
        <tr style="background:#eff6ff">
          <td colspan="2" style="padding:9px 14px;font-weight:800;font-size:13px;color:#1d4ed8">TOTAL (${p.quantity} pcs)</td>
          <td style="padding:9px 14px;text-align:right;font-weight:800;font-size:14px;color:#1d4ed8;font-family:'Courier New',monospace">${fmt(c.total)}</td>
        </tr>
        <tr style="background:#f8fafc">
          <td colspan="2" style="padding:6px 14px;font-size:11px;color:#94a3b8">Unit price per piece</td>
          <td style="padding:6px 14px;text-align:right;font-size:12px;font-family:'Courier New',monospace;color:#64748b">${fmt(c.per_part)}</td>
        </tr>
      </table>
    </div>`;
    })
    .join("");

  const extrasSection =
    extraRows.length > 0
      ? `
  <div style="margin-bottom:20px">
    <h3 style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#64748b;margin:0 0 10px">ADDITIONAL CHARGES</h3>
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      ${extraRows
        .map(
          (e) => `
      <tr>
        <td style="padding:6px 0;border-bottom:1px solid #f1f5f9;color:#475569;font-weight:600">${e.label}</td>
        <td style="padding:6px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-family:'Courier New',monospace;font-weight:600">${fmt(e.computed)}</td>
      </tr>`,
        )
        .join("")}
    </table>
  </div>`
      : "";

  const ltSection = ltArr.some(Boolean)
    ? `
  <div style="margin-top:20px;break-inside:avoid">
    <h3 style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#64748b;margin:0 0 12px">PRODUCTION SCHEDULE</h3>
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      ${parts
        .map((p, i) =>
          ltArr[i]
            ? `
      <tr>
        <td style="padding:5px 0;border-bottom:1px solid #f1f5f9;font-weight:600;color:#0f172a;width:200px">${p.partName || `Part ${i + 1}`}</td>
        <td style="padding:5px 0;border-bottom:1px solid #f1f5f9">
          ${ltArr[i].schedule.map((s) => `<span style="font-size:10px;background:#f1f5f9;border-radius:4px;padding:2px 6px;margin:2px;display:inline-block">${s.label}: ${s.days}d</span>`).join("")}
        </td>
        <td style="padding:5px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;color:#10b981">${ltArr[i].total} working days</td>
      </tr>`
            : "",
        )
        .join("")}
    </table>
    ${
      client.required_days
        ? (() => {
            const maxLt = Math.max(
              ...ltArr.filter(Boolean).map((l) => l.total),
            );
            const ok = maxLt <= +client.required_days;
            return `<div style="margin-top:10px;padding:8px 12px;background:${ok ? "#f0fdf4" : "#fef2f2"};border:1px solid ${ok ? "#bbf7d0" : "#fecaca"};border-radius:6px;font-size:12px;font-weight:600;color:${ok ? "#15803d" : "#dc2626"}">
        ${ok ? `✅ All parts can be delivered within client target (${client.required_days} days). Longest lead: ${maxLt} days.` : `⚠ Max lead time (${maxLt} days) may exceed client target (${client.required_days} days). Discuss expediting options.`}
      </div>`;
          })()
        : ""
    }
  </div>`
    : "";

  const drawingSection = drawingInfo?.has_drawing
    ? `
  <div style="margin-top:20px;padding:12px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;break-inside:avoid">
    <h3 style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#64748b;margin:0 0 10px">DRAWING REFERENCE</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;font-size:12px">
      ${drawingInfo.drawing_title ? `<div><span style="color:#94a3b8">Title:</span> <b>${drawingInfo.drawing_title}</b></div>` : ""}
      ${drawingInfo.revision ? `<div><span style="color:#94a3b8">Rev:</span> <b>${drawingInfo.revision}</b></div>` : ""}
      ${drawingInfo.scale ? `<div><span style="color:#94a3b8">Scale:</span> <b>${drawingInfo.scale}</b></div>` : ""}
      ${drawingInfo.general_tolerance ? `<div><span style="color:#94a3b8">Gen. Tolerance:</span> <b>${drawingInfo.general_tolerance}</b></div>` : ""}
      ${drawingInfo.surface_roughness ? `<div><span style="color:#94a3b8">Surface Ra:</span> <b>${drawingInfo.surface_roughness}</b></div>` : ""}
      ${drawingInfo.material_spec ? `<div><span style="color:#94a3b8">Material Spec:</span> <b>${drawingInfo.material_spec}</b></div>` : ""}
    </div>
    ${drawingInfo.notes?.length ? `<div style="margin-top:8px;font-size:11px;color:#64748b"><b>Drawing Notes:</b> ${drawingInfo.notes.join(" · ")}</div>` : ""}
  </div>`
    : "";

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><title>${qid} — Quotation</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500;600;700&display=swap');
body{font-family:'Barlow',system-ui,sans-serif;background:#fff;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-size:13px;line-height:1.5}
.page{max-width:860px;margin:0 auto;background:#fff}
.hdr{background:linear-gradient(135deg,#050c18 0%,#0f2544 50%,#0a1e3d 100%);color:#fff;padding:0}
.hdr-top{display:flex;justify-content:space-between;align-items:stretch;min-height:100px}
.hdr-brand{padding:28px 36px;border-right:1px solid rgba(255,255,255,.1)}
.brand-name{font-family:'Barlow Condensed',sans-serif;font-size:32px;font-weight:900;letter-spacing:-1px;line-height:1}
.brand-name span{color:#38bdf8}
.brand-sub{font-size:11px;color:#64748b;margin-top:4px;letter-spacing:.5px}
.hdr-meta{padding:20px 36px;flex:1;display:flex;flex-direction:column;justify-content:center}
.hdr-right{padding:20px 36px;text-align:right;display:flex;flex-direction:column;justify-content:center;min-width:200px;border-left:1px solid rgba(255,255,255,.1)}
.qt-label{font-family:'Barlow Condensed',sans-serif;font-size:40px;font-weight:900;letter-spacing:2px;color:#fff;line-height:1}
.qt-id{font-size:12px;color:#38bdf8;font-family:'Courier New',monospace;margin-top:4px}
.qt-date{font-size:11px;color:#475569;margin-top:2px}
.stripe{height:4px;background:linear-gradient(90deg,#38bdf8,#818cf8,#34d399,#f59e0b)}
.body{padding:28px 36px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:20px}
.g4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;margin-bottom:20px}
.box{background:#f8fafc;border-radius:8px;padding:14px 18px;border:1px solid #e2e8f0}
.box-dark{background:#0f172a;border-radius:8px;padding:14px 18px}
.box h4{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;margin-bottom:10px}
.kv{display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid #f1f5f9}
.kv:last-child{border:none}.kv .k{color:#64748b}.kv .v{font-weight:600;color:#1e293b}
.stat{background:#f8fafc;border-radius:8px;padding:12px;text-align:center;border:1px solid #e2e8f0}
.stat .sl{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;margin-bottom:4px}
.stat .sv{font-size:20px;font-weight:800;color:#0f172a}
h3.sec{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#64748b;margin:0 0 12px;padding-bottom:6px;border-bottom:2px solid #f1f5f9}
table.parts{width:100%;border-collapse:collapse;margin-bottom:4px;font-size:12px}
table.parts th{background:#0f172a;color:#94a3b8;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;padding:9px 12px;text-align:left}
table.parts th.ctr{text-align:center}
table.parts td{padding:10px 12px;border-bottom:1px solid #f1f5f9;vertical-align:top}
table.parts td.ctr{text-align:center}
table.parts .sub-row td{background:#f8fafc;font-size:11px}
.totals{width:100%;max-width:340px;margin-left:auto;margin-bottom:20px}
.totals tr td{padding:6px 0;font-size:13px}
.totals .grand td{font-size:18px;font-weight:800;color:#1d4ed8;padding-top:10px;border-top:2px solid #1d4ed8}
.badge{display:inline-block;font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:2px 7px;border-radius:4px}
.terms{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:16px 0}
.term{background:#f8fafc;border-radius:6px;padding:10px 12px;border:1px solid #e2e8f0}
.term .tl{font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;margin-bottom:3px}
.term .tv{font-size:12px;font-weight:700;color:#0f172a}
.ftr{background:#0f172a;padding:18px 36px;display:flex;justify-content:space-between;align-items:center;margin-top:4px}
.ftr-l{font-size:11px;color:#475569;line-height:1.9}
.ftr-r{text-align:right}
.sig-line{width:160px;height:1px;background:#334155;margin:24px 0 4px;margin-left:auto}
.sig-name{font-size:11px;color:#475569;text-align:right}
.watermark{position:fixed;bottom:40px;right:40px;font-size:10px;color:#e2e8f0;letter-spacing:1px;transform:rotate(-45deg);pointer-events:none;font-family:'Courier New',monospace}
@media print{
  body{margin:0}
  .page{max-width:100%;margin:0;box-shadow:none}
  .watermark{display:none}
}
</style>
</head><body>
<div class="page">
  <div class="hdr">
    <div class="hdr-top">
      <div class="hdr-brand">
        <div class="brand-name">RFQ<span>Analyzer</span></div>
        <div class="brand-name" style="font-size:18px;color:#64748b;margin-top:2px">PRO</div>
        <div class="brand-sub">${co.name}</div>
        ${co.addr ? `<div style="font-size:10px;color:#334155;margin-top:2px">${co.addr}</div>` : ""}
        ${co.phone ? `<div style="font-size:10px;color:#334155">${co.phone}</div>` : ""}
        ${co.gst ? `<div style="font-size:9px;color:#334155;font-family:'Courier New',monospace">GSTIN: ${co.gst}</div>` : ""}
      </div>
      <div class="hdr-meta">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <div style="font-size:9px;color:#334155;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px">BILL TO</div>
            <div style="font-size:13px;font-weight:700;color:#fff">${client.company || client.name || "—"}</div>
            ${client.name && client.company ? `<div style="font-size:11px;color:#64748b">${client.name}</div>` : ""}
            ${client.email ? `<div style="font-size:11px;color:#64748b">${client.email}</div>` : ""}
            ${client.phone ? `<div style="font-size:11px;color:#64748b">${client.phone}</div>` : ""}
            ${client.gst ? `<div style="font-size:10px;color:#334155;font-family:'Courier New',monospace">GST: ${client.gst}</div>` : ""}
          </div>
          <div>
            <div style="font-size:9px;color:#334155;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px">SHIP TO</div>
            ${client.address ? `<div style="font-size:11px;color:#64748b">${client.address}</div>` : ""}
            <div style="font-size:11px;color:#64748b">${[client.city, client.state, client.pincode].filter(Boolean).join(", ") || "—"}</div>
            ${client.country ? `<div style="font-size:11px;color:#64748b">${client.country}</div>` : ""}
            ${client.required_days ? `<div style="font-size:11px;color:#f59e0b;margin-top:4px;font-weight:600">📅 Required: ${client.required_days} days</div>` : ""}
          </div>
        </div>
      </div>
      <div class="hdr-right">
        <div class="qt-label">QUOTATION</div>
        <div class="qt-id">${qid}</div>
        <div class="qt-date">${dateStr}</div>
        <div style="margin-top:12px;font-size:9px;color:#334155;letter-spacing:1px">VALID UNTIL</div>
        <div style="font-size:11px;color:#64748b;font-weight:600">${validUntil}</div>
        ${client.payment_terms ? `<div style="margin-top:6px;font-size:10px;color:#64748b">${client.payment_terms}</div>` : ""}
      </div>
    </div>
  </div>
  <div class="stripe"></div>

  <div class="body">
    <!-- KPI row -->
    <div class="g4">
      <div class="stat"><div class="sl">Total Parts</div><div class="sv">${parts.length}</div></div>
      <div class="stat"><div class="sl">Total Pieces</div><div class="sv">${totalPcs.toLocaleString()}</div></div>
      <div class="stat"><div class="sl">Grand Total</div><div class="sv" style="color:#1d4ed8;font-size:16px">${fmt(grandTotal + extraTotal)}</div></div>
      <div class="stat"><div class="sl">Currency</div><div class="sv" style="font-size:16px">${currency}</div></div>
    </div>

    <!-- Parts summary -->
    <h3 class="sec">PART SUMMARY & PRICING</h3>
    <table class="parts">
      <tr>
        <th class="ctr" style="width:32px">#</th>
        <th>Part / Drawing</th>
        <th>Material & Process</th>
        <th class="ctr">Dimensions</th>
        <th class="ctr" style="width:50px">Qty</th>
        <th class="ctr">Unit Price</th>
        <th class="ctr">Amount</th>
      </tr>
      ${partsTableRows}
    </table>

    <!-- Totals -->
    <table class="totals">
      <tr><td style="color:#64748b">Parts Subtotal</td><td style="text-align:right;font-family:'Courier New',monospace;font-weight:600">${fmt(costsArr.reduce((s, c) => s + (c?.total || 0), 0))}</td></tr>
      ${extraRows.map((e) => `<tr><td style="color:#64748b">${e.label}</td><td style="text-align:right;font-family:'Courier New',monospace;font-weight:600">${fmt(e.computed)}</td></tr>`).join("")}
      <tr class="grand"><td>GRAND TOTAL (${currency})</td><td style="text-align:right;font-family:'Courier New',monospace">${fmt(grandTotal + extraTotal)}</td></tr>
    </table>

    ${drawingSection}

    <!-- Detailed cost breakdown -->
    <div style="margin-top:24px;break-before:page">
      <h3 class="sec">DETAILED COST BREAKDOWN</h3>
      ${costDetailRows}
    </div>

    ${extrasSection}
    ${ltSection}

    <!-- Terms grid -->
    <div class="terms">
      <div class="term"><div class="tl">Payment Terms</div><div class="tv">${client.payment_terms || "50% Advance"}</div></div>
      <div class="term"><div class="tl">Quote Validity</div><div class="tv">30 Days</div></div>
      <div class="term"><div class="tl">Incoterms</div><div class="tv">${client.incoterms || "Ex-Works"}</div></div>
      <div class="term"><div class="tl">Revision</div><div class="tv">Rev 01</div></div>
    </div>

    <!-- T&C -->
    <div style="margin-top:14px;padding:12px 16px;background:#f8fafc;border-radius:6px;font-size:10px;color:#64748b;line-height:1.8;border:1px solid #e2e8f0">
      <b style="color:#475569">Terms & Conditions:</b>
      Prices are valid for 30 days from quotation date.
      Payment: ${client.payment_terms || "50% advance with order, balance before dispatch"}.
      Delivery lead times are indicative and subject to material availability.
      Prices are exclusive of taxes unless stated. GST/applicable taxes charged extra.
      All disputes subject to the jurisdiction of courts in ${co.addr?.split(",")[0] || "Chennai"}.
      This quotation is subject to final engineering review and drawing approval.
    </div>

    <!-- Signature -->
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:28px">
      <div style="font-size:11px;color:#94a3b8;line-height:1.9">
        Generated by <b style="color:#475569">RFQAnalyzer Pro</b><br>
        Doc ID: ${qid} · ${dateStr}
        ${drawingInfo?.has_drawing ? `<br><span style="color:#10b981">✓ Engineering drawing analysed by AI</span>` : ""}
      </div>
      <div>
        <div class="sig-line"></div>
        <div class="sig-name" style="color:#0f172a;font-weight:700">${co.name}</div>
        <div class="sig-name">Authorised Signatory</div>
      </div>
    </div>
  </div>

  <div class="ftr">
    <div class="ftr-l">
      <b style="color:#fff">RFQAnalyzer Pro</b> — Fabrication Quotation System<br>
      ${co.addr || ""} ${co.phone ? `· ${co.phone}` : ""}<br>
      ${co.gst ? `GSTIN: ${co.gst}` : ""}
    </div>
    <div class="ftr-r" style="font-size:10px;color:#334155">
      Page 1 of 1<br>
      ${qid}<br>
      ${dateStr}
    </div>
  </div>
</div>
</body></html>`;
}

// ════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM — Industrial Precision
// ════════════════════════════════════════════════════════════════════════════
const T = {
  // Colours
  bg: "#03080f",
  surface: "#07101e",
  card: "#0c1828",
  cardHi: "#101f30",
  border: "#162033",
  borderHi: "#1e3048",
  accent: "#00d4ff",
  accent2: "#7c6af5",
  green: "#00e698",
  amber: "#f5a623",
  red: "#ff4757",
  pink: "#ff6b9d",
  text: "#e8f0fe",
  textMid: "#6b8ba4",
  textDim: "#243448",
  // Fonts
  display: "'Barlow Condensed', sans-serif",
  mono: "'Share Tech Mono', monospace",
  body: "'Barlow', sans-serif",
};

const S = {
  app: {
    fontFamily: T.body,
    background: T.bg,
    minHeight: "100vh",
    color: T.text,
  },
  topbar: {
    background: T.surface,
    borderBottom: `1px solid ${T.border}`,
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 28px",
    position: "sticky",
    top: 0,
    zIndex: 200,
    backdropFilter: "blur(10px)",
  },
  logo: {
    fontFamily: T.display,
    fontSize: 26,
    fontWeight: 900,
    letterSpacing: "-0.5px",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  layout: {
    display: "flex",
    maxWidth: 1440,
    margin: "0 auto",
    width: "100%",
    padding: "0 20px 60px",
    gap: 4,
  },
  sidebar: { width: 210, flexShrink: 0, paddingTop: 20 },
  main: { flex: 1, paddingTop: 20, minWidth: 0 },
  card: {
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    padding: "20px 22px",
    marginBottom: 14,
  },
  cardHi: {
    background: T.cardHi,
    border: `1px solid ${T.borderHi}`,
    borderRadius: 12,
    padding: "20px 22px",
    marginBottom: 14,
  },
  nav: (a) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 14px",
    borderRadius: 8,
    cursor: "pointer",
    marginBottom: 2,
    background: a ? `${T.accent}14` : "transparent",
    border: a ? `1px solid ${T.accent}30` : "1px solid transparent",
    color: a ? T.accent : T.textMid,
    fontWeight: a ? 700 : 500,
    fontSize: 12,
    fontFamily: T.body,
    transition: "all .15s",
  }),
  navGrp: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "2.5px",
    textTransform: "uppercase",
    color: T.textDim,
    padding: "14px 14px 5px",
  },
  label: {
    fontSize: 10,
    fontWeight: 700,
    color: T.textMid,
    letterSpacing: "0.5px",
    marginBottom: 5,
    display: "flex",
    gap: 4,
    alignItems: "center",
    textTransform: "uppercase",
    fontFamily: T.body,
  },
  inp: {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 7,
    padding: "9px 12px",
    color: T.text,
    fontSize: 13,
    width: "100%",
    outline: "none",
    fontFamily: T.body,
    boxSizing: "border-box",
    transition: "border-color .15s",
  },
  sel: {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 7,
    padding: "9px 12px",
    color: T.text,
    fontSize: 13,
    width: "100%",
    outline: "none",
    fontFamily: T.body,
    appearance: "none",
    boxSizing: "border-box",
  },
  ta: {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 7,
    padding: "12px 14px",
    color: T.text,
    fontSize: 12,
    width: "100%",
    outline: "none",
    resize: "vertical",
    minHeight: 160,
    fontFamily: T.body,
    lineHeight: 1.7,
    boxSizing: "border-box",
  },
  btn: {
    background: `linear-gradient(135deg,${T.accent},#0098b8)`,
    color: "#000",
    border: "none",
    borderRadius: 8,
    padding: "10px 22px",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: T.display,
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  btnGhost: {
    background: "transparent",
    color: T.textMid,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: "9px 20px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: T.display,
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  btnGreen: {
    background: `linear-gradient(135deg,${T.green},#00b873)`,
    color: "#000",
    border: "none",
    borderRadius: 8,
    padding: "10px 22px",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: T.display,
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  btnRed: {
    background: `linear-gradient(135deg,${T.red},#cc0000)`,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 22px",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: T.display,
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  hr: { height: 1, background: T.border, margin: "14px 0" },
  g2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  g3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },
  g4: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 },
  g5: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 12 },
};

// ════════════════════════════════════════════════════════════════════════════
// MICRO COMPONENTS
// ════════════════════════════════════════════════════════════════════════════
function Field({ label, children, required, hint, col2 }) {
  return (
    <div style={col2 ? { gridColumn: "span 2" } : {}}>
      <div style={S.label}>
        {label}
        {required && <span style={{ color: T.red }}>*</span>}
        {hint && (
          <span
            style={{
              color: T.textDim,
              fontWeight: 400,
              textTransform: "none",
              letterSpacing: 0,
              fontSize: 9,
            }}
          >
            — {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Tag({ color = T.accent, children, size = "sm" }) {
  const sz =
    size === "sm"
      ? { fontSize: 8, padding: "2px 6px" }
      : { fontSize: 10, padding: "3px 9px" };
  return (
    <span
      style={{
        ...sz,
        fontWeight: 800,
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        background: `${color}18`,
        color,
        border: `1px solid ${color}35`,
        borderRadius: 4,
        fontFamily: T.display,
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {children}
    </span>
  );
}

function Stat({ icon, label, value, color = T.accent, sub }) {
  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 10,
        padding: "14px 16px",
      }}
    >
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div
        style={{
          fontSize: 8,
          color: T.textDim,
          letterSpacing: "2px",
          textTransform: "uppercase",
          marginBottom: 4,
          fontFamily: T.display,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 900,
          color,
          fontFamily: T.mono,
          letterSpacing: "-0.5px",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 9, color: T.textMid, marginTop: 3 }}>{sub}</div>
      )}
    </div>
  );
}

function KV({ label, value, mono }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12,
        padding: "5px 0",
        borderBottom: `1px solid ${T.textDim}20`,
      }}
    >
      <span style={{ color: T.textMid }}>{label}</span>
      <span
        style={{
          color: "#8facc8",
          fontWeight: 700,
          fontFamily: mono ? T.mono : T.body,
        }}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      style={{
        height: 6,
        background: T.textDim + "40",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          background: color,
          width: `${pct}%`,
          borderRadius: 3,
          transition: "width .5s ease",
        }}
      />
    </div>
  );
}

function SectionHead({ children, action }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "2.5px",
          textTransform: "uppercase",
          color: T.textDim,
          fontFamily: T.display,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ width: 20, height: 2, background: T.accent }} />
        {children}
      </div>
      {action}
    </div>
  );
}

function Gantt({ schedule, total, clientDays }) {
  return (
    <div>
      {schedule.map((s, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 7,
          }}
        >
          <div style={{ width: 160, flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.text }}>
              {s.label}
            </div>
            <div style={{ fontSize: 9, color: T.textDim, fontFamily: T.mono }}>
              D{s.start}–D{s.end}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              background: T.textDim + "40",
              borderRadius: 3,
              height: 18,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 2,
                bottom: 2,
                left: `${((s.start - 1) / total) * 100}%`,
                width: `${(s.days / total) * 100}%`,
                background: s.color,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                paddingLeft: 5,
                fontSize: 9,
                color: "#000",
                fontWeight: 800,
                fontFamily: T.mono,
              }}
            >
              {s.days}d
            </div>
          </div>
          <div
            style={{
              width: 30,
              textAlign: "right",
              fontSize: 11,
              fontWeight: 800,
              color: T.accent,
              fontFamily: T.mono,
            }}
          >
            {s.end}
          </div>
        </div>
      ))}
      <div
        style={{
          marginTop: 8,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
        }}
      >
        <span style={{ color: T.textMid }}>
          Total: <b style={{ color: T.green }}>{total} working days</b>
        </span>
        {clientDays && (
          <span
            style={{
              color: total <= +clientDays ? T.green : T.red,
              fontWeight: 700,
            }}
          >
            Client: {clientDays}d —{" "}
            {total <= +clientDays ? "✅ On time" : "⚠ May miss"}
          </span>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BLANK STATE FACTORIES
// ════════════════════════════════════════════════════════════════════════════
const newPart = () => ({
  id: Math.random().toString(36).slice(2),
  partName: "",
  drawingNo: "",
  description: "",
  material: "",
  process: "",
  thickness: "",
  length: "",
  width: "",
  height: "",
  diameter: "",
  quantity: "",
  finish: "",
  tolerance: "",
  hardness: "",
  notes: "",
  extracted_from_drawing: false,
});

const blankClient = () => ({
  company: "",
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  gst: "",
  pan: "",
  required_days: "",
  payment_terms: "50% Advance, Balance Before Dispatch",
  incoterms: "Ex-Works",
});

const STEPS = [
  { id: 1, icon: "⚙", label: "Setup" },
  { id: 2, icon: "📄", label: "RFQ Upload" },
  { id: 3, icon: "🏢", label: "Client" },
  { id: 4, icon: "🔩", label: "Parts" },
  { id: 5, icon: "💰", label: "Costing" },
  { id: 6, icon: "📋", label: "Quotation" },
];

// ════════════════════════════════════════════════════════════════════════════
// MAIN APPLICATION
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [step, setStep] = useState(1);
  const [cos, setCos] = useState(COMPANIES.map((c) => ({ ...c })));
  const [coIdx, setCoIdx] = useState(0);
  const [ccy, setCcy] = useState("INR");
  const [emailText, setEmailText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]); // [{name,size,type,base64,mimeType}]
  const [client, setClient] = useState(blankClient());
  const [parts, setParts] = useState([newPart()]);
  const [extras, setExtras] = useState(DEFAULT_EXTRAS.map((e) => ({ ...e })));
  const [costsArr, setCostsArr] = useState([]);
  const [ltArr, setLtArr] = useState([]);
  const [overridesArr, setOvArr] = useState([]);
  const [drawingInfo, setDrawingInfo] = useState(null);
  const [orderNotes, setOrderNotes] = useState("");
  const [qid] = useState(genQID);
  const [busy, setBusy] = useState(false);
  const [busyMsg, setBusyMsg] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [activePartIdx, setActive] = useState(0);
  const [editRates, setEditRates] = useState(false);
  const fileInputRef = useRef();

  const co = cos[coIdx];
  const curr = CURRENCIES.find((c) => c.code === ccy) || CURRENCIES[0];

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  function setCoField(k, v) {
    setCos((prev) => prev.map((c, i) => (i === coIdx ? { ...c, [k]: v } : c)));
  }

  function setPart(idx, k, v) {
    setParts((prev) => prev.map((p, i) => (i === idx ? { ...p, [k]: v } : p)));
  }

  function addPart() {
    setParts((prev) => [...prev, newPart()]);
    setActive(parts.length);
  }

  function removePart(idx) {
    if (parts.length === 1) return;
    setParts((prev) => prev.filter((_, i) => i !== idx));
    setCostsArr((prev) => prev.filter((_, i) => i !== idx));
    setLtArr((prev) => prev.filter((_, i) => i !== idx));
    setOvArr((prev) => prev.filter((_, i) => i !== idx));
    setActive(Math.max(0, idx - 1));
  }

  function dupPart(idx) {
    const clone = { ...parts[idx], id: Math.random().toString(36).slice(2) };
    const arr = [...parts];
    arr.splice(idx + 1, 0, clone);
    setParts(arr);
    setActive(idx + 1);
  }

  // File upload handling
  const handleFiles = useCallback((fileList) => {
    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result.split(",")[1];
        const mimeType =
          file.type ||
          (file.name.endsWith(".pdf") ? "application/pdf" : "image/png");
        setUploadedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            size: (file.size / 1024).toFixed(1) + " KB",
            type: file.name.split(".").pop().toUpperCase(),
            base64,
            mimeType,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // AI Extract from email text
  async function extractFromEmailText() {
    if (!emailText.trim()) {
      showToast("Paste email text first", "err");
      return;
    }
    setBusy(true);
    setBusyMsg("AI reading email...");
    try {
      const result = await extractFromText(emailText);
      if (result.client) setClient((prev) => ({ ...prev, ...result.client }));
      if (result.parts?.length) {
        setParts(result.parts.map((p) => ({ ...newPart(), ...p })));
        setActive(0);
      }
      if (result.order_notes) setOrderNotes(result.order_notes);
      showToast(
        `✅ AI extracted ${result.parts?.length || 0} part(s) and client details`,
        "ok",
      );
      setStep(3);
    } catch (e) {
      showToast("⚠ AI unavailable — enter details manually", "warn");
      setStep(3);
    } finally {
      setBusy(false);
      setBusyMsg("");
    }
  }

  // AI Extract from PDF/drawing
  async function extractFromFile(fileObj) {
    setBusy(true);
    setBusyMsg(`AI analysing ${fileObj.name}...`);
    try {
      const isPDF = fileObj.mimeType === "application/pdf";
      const isImg = fileObj.mimeType.startsWith("image/");
      if (!isPDF && !isImg) {
        showToast("AI extraction supports PDF and image files", "warn");
        setBusy(false);
        return;
      }
      const result = await extractFromPDF(fileObj.base64, fileObj.mimeType);
      if (result.client) setClient((prev) => ({ ...prev, ...result.client }));
      if (result.parts?.length) {
        setParts((prev) => {
          const existing = prev.filter(
            (p) => p.partName || p.material || p.quantity,
          );
          const newParts = result.parts.map((p) => ({ ...newPart(), ...p }));
          return existing.length ? [...existing, ...newParts] : newParts;
        });
        setActive(0);
      }
      if (result.drawing_info) setDrawingInfo(result.drawing_info);
      if (result.order_notes) setOrderNotes(result.order_notes);
      showToast(
        `✅ Extracted from ${fileObj.name} — ${result.parts?.length || 0} part(s) found${result.drawing_info?.has_drawing ? " · Drawing analysed" : ""}`,
        "ok",
      );
    } catch (e) {
      showToast(`Failed to extract from ${fileObj.name}`, "err");
    } finally {
      setBusy(false);
      setBusyMsg("");
    }
  }

  // Calculate all costs
  function runAll() {
    const newCosts = [],
      newLt = [];
    parts.forEach((p) => {
      const c = calcCosts(p, co, ccy);
      const l = calcLeadTime(p, c.mhrs);
      newCosts.push(c);
      newLt.push(l);
    });
    setCostsArr(newCosts);
    setLtArr(newLt);
    setOvArr(parts.map(() => ({})));
    setStep(5);
    showToast(`✅ Costs calculated for ${parts.length} part(s)`, "ok");
  }

  function displayCost(idx) {
    const base = costsArr[idx];
    if (!base) return null;
    const ov = overridesArr[idx] || {};
    if (!Object.keys(ov).length) return base;
    const m = { ...base, ...ov };
    m.total =
      (m.material +
        m.machine +
        m.labor +
        m.setup +
        m.finishing +
        m.packaging +
        m.transport +
        m.profit) *
      (+parts[idx]?.quantity || 1);
    m.per_part =
      m.material +
      m.machine +
      m.labor +
      m.setup +
      m.finishing +
      m.packaging +
      m.transport +
      m.profit;
    return m;
  }

  function setOv(partIdx, k, v) {
    setOvArr((prev) =>
      prev.map((o, i) => (i === partIdx ? { ...o, [k]: v } : o)),
    );
  }

  // Extras computation
  const partSubtotal = costsArr.reduce(
    (_, __, i) => _ + (displayCost(i)?.total || 0),
    0,
  );
  const { rows: extraRows, total: extraTotal } = calcExtrasTotal(
    extras,
    partSubtotal,
    ccy,
  );
  const grandTotal = partSubtotal + extraTotal;

  // PDF download
  async function downloadPDF() {
    const allCosts = parts.map((_, i) => displayCost(i));
    const html = buildQuotationHTML({
      qid,
      client,
      parts,
      costsArr: allCosts,
      extraRows,
      extraTotal,
      grandTotal,
      co,
      currency: ccy,
      ltArr,
      drawingInfo,
    });
    setPdfBusy(true);
    try {
      const el = document.createElement("div");
      el.innerHTML = html;
      el.style.cssText = "position:absolute;left:-9999px;top:0;z-index:-1";
      document.body.appendChild(el);
      await (window.html2pdf ? html2pdf() : null)
        ?.set({
          margin: 0,
          filename: `${qid}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        })
        .from(el.querySelector(".page"))
        .save();
      document.body.removeChild(el);
      showToast("📥 PDF downloaded successfully", "ok");
    } catch (e) {
      // fallback
      const w = window.open("", "_blank");
      w.document.write(html);
      w.document.close();
      setTimeout(() => w.print(), 800);
    } finally {
      setPdfBusy(false);
    }
  }

  function resetAll() {
    setStep(1);
    setCostsArr([]);
    setLtArr([]);
    setOvArr([]);
    setEmailText("");
    setUploadedFiles([]);
    setClient(blankClient());
    setParts([newPart()]);
    setExtras(DEFAULT_EXTRAS.map((e) => ({ ...e })));
    setDrawingInfo(null);
    setOrderNotes("");
    setActive(0);
    showToast("🔄 New RFQ started", "ok");
  }

  const reqFields = [
    "material",
    "thickness",
    "length",
    "width",
    "quantity",
    "process",
  ];
  const partValid = (p) => reqFields.every((k) => p[k]);
  const allValid = parts.every(partValid);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={S.app}>
      {/* TOAST */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 999,
            background:
              toast.type === "ok"
                ? T.green
                : toast.type === "err"
                  ? T.red
                  : T.amber,
            color: "#000",
            padding: "10px 18px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 800,
            fontFamily: T.display,
            letterSpacing: "0.5px",
            boxShadow: "0 8px 32px rgba(0,0,0,.5)",
            animation: "slideIn .2s ease",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* AI BUSY OVERLAY */}
      {busy && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(3,8,15,.85)",
            zIndex: 500,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              fontFamily: T.display,
              fontSize: 48,
              fontWeight: 900,
              color: T.accent,
              letterSpacing: "-2px",
              marginBottom: 16,
            }}
          >
            RFQ<span style={{ color: T.text }}>AI</span>
          </div>
          <div style={{ fontSize: 14, color: T.textMid, marginBottom: 24 }}>
            {busyMsg}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  background: T.accent,
                  borderRadius: "50%",
                  animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
          <style>{`@keyframes pulse{0%,80%,100%{transform:scale(0);opacity:.5}40%{transform:scale(1);opacity:1}}`}</style>
        </div>
      )}

      {/* TOP BAR */}
      <div style={S.topbar}>
        <div style={S.logo}>
          <div
            style={{
              width: 28,
              height: 28,
              background: `linear-gradient(135deg,${T.accent},${T.accent2})`,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}
          >
            ⚙
          </div>
          <span>
            RFQ<span style={{ color: T.accent }}>Analyzer</span>
          </span>
          <Tag color={T.accent} size="md">
            PRO
          </Tag>
          <Tag color={T.green} size="md">
            AI
          </Tag>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {grandTotal > 0 && (
            <div
              style={{
                fontFamily: T.mono,
                fontSize: 14,
                color: T.accent,
                fontWeight: 700,
              }}
            >
              {curr.sym}
              {grandTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </div>
          )}
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.textDim }}>
            {qid}
          </div>
          <button
            style={{ ...S.btnGhost, fontSize: 10, padding: "6px 12px" }}
            onClick={resetAll}
          >
            NEW RFQ
          </button>
        </div>
      </div>

      <div style={S.layout}>
        {/* SIDEBAR */}
        <div style={S.sidebar}>
          <div style={S.navGrp}>Workflow</div>
          {STEPS.map((s) => (
            <div
              key={s.id}
              style={S.nav(step === s.id)}
              onClick={() => step >= s.id && setStep(s.id)}
            >
              <span
                style={{
                  fontSize: 14,
                  width: 20,
                  textAlign: "center",
                  flexShrink: 0,
                  fontFamily: T.mono,
                }}
              >
                {s.icon}
              </span>
              <div>
                <div>{s.label}</div>
                {step > s.id && (
                  <div
                    style={{
                      fontSize: 8,
                      color: T.green,
                      marginTop: 1,
                      letterSpacing: "1px",
                    }}
                  >
                    COMPLETE
                  </div>
                )}
                {step === s.id && (
                  <div
                    style={{
                      fontSize: 8,
                      color: T.accent,
                      marginTop: 1,
                      letterSpacing: "1px",
                    }}
                  >
                    ACTIVE
                  </div>
                )}
              </div>
            </div>
          ))}

          <div style={S.hr} />
          <div style={{ padding: "0 14px" }}>
            <div style={S.navGrp}>Session</div>
            <div style={{ fontSize: 11, color: T.textMid, lineHeight: 2.3 }}>
              <div>
                Company:{" "}
                <b style={{ color: "#64748b" }}>{co.name.split(" ")[0]}</b>
              </div>
              <div>
                Currency:{" "}
                <b style={{ color: "#64748b" }}>
                  {curr.flag} {ccy}
                </b>
              </div>
              <div>
                Parts: <b style={{ color: "#64748b" }}>{parts.length}</b>
              </div>
              {costsArr.length > 0 && (
                <div>
                  Total:{" "}
                  <b style={{ color: T.accent, fontFamily: T.mono }}>
                    {curr.sym}
                    {grandTotal.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </b>
                </div>
              )}
              {drawingInfo?.has_drawing && (
                <div>
                  Drawing: <b style={{ color: T.green }}>✓ Analysed</b>
                </div>
              )}
            </div>
          </div>

          {costsArr.length > 0 && (
            <div style={{ padding: "10px 10px 0" }}>
              <button
                style={{
                  ...S.btn,
                  width: "100%",
                  fontSize: 10,
                  padding: "9px",
                }}
                onClick={() => setStep(6)}
              >
                📋 QUOTATION
              </button>
            </div>
          )}
        </div>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
        <div style={S.main}>
          {/* ════════ STEP 1: SETUP ════════ */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: 22 }}>
                <div
                  style={{
                    fontFamily: T.display,
                    fontSize: 34,
                    fontWeight: 900,
                    letterSpacing: "-1px",
                    color: T.text,
                    lineHeight: 1,
                  }}
                >
                  COMPANY<span style={{ color: T.accent }}> SETUP</span>
                </div>
                <div style={{ fontSize: 12, color: T.textMid, marginTop: 6 }}>
                  Configure your company profile, machine rates and default
                  quotation settings.
                </div>
              </div>

              <div style={S.card}>
                <SectionHead>Profile & Currency</SectionHead>
                <div style={S.g2}>
                  <Field label="Company">
                    <select
                      style={S.sel}
                      value={coIdx}
                      onChange={(e) => setCoIdx(+e.target.value)}
                    >
                      {cos.map((c, i) => (
                        <option key={i} value={i}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Quotation Currency">
                    <select
                      style={S.sel}
                      value={ccy}
                      onChange={(e) => setCcy(e.target.value)}
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code} — {c.sym}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div style={{ ...S.g2, marginTop: 12 }}>
                  <Field label="Company Address">
                    <input
                      style={S.inp}
                      value={co.addr}
                      onChange={(e) => setCoField("addr", e.target.value)}
                      placeholder="City, State"
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      style={S.inp}
                      value={co.phone}
                      onChange={(e) => setCoField("phone", e.target.value)}
                      placeholder="+91 ..."
                    />
                  </Field>
                  <Field label="GSTIN">
                    <input
                      style={S.inp}
                      value={co.gst}
                      onChange={(e) =>
                        setCoField("gst", e.target.value.toUpperCase())
                      }
                      placeholder="29ABCDE1234F1Z5"
                      maxLength={15}
                    />
                  </Field>
                  <div />
                </div>
              </div>

              <div style={S.card}>
                <SectionHead
                  action={
                    <button
                      style={{
                        ...S.btnGhost,
                        fontSize: 9,
                        padding: "5px 12px",
                      }}
                      onClick={() => setEditRates((v) => !v)}
                    >
                      {editRates ? "✓ SAVE" : "✏ EDIT RATES"}
                    </button>
                  }
                >
                  Machine & Labor Rates (₹/hr)
                </SectionHead>
                <div style={S.g3}>
                  {[
                    { k: "laser", l: "Laser Cutting", c: T.accent },
                    { k: "cnc", l: "CNC Machining", c: T.accent2 },
                    { k: "bending", l: "Bending", c: T.green },
                    { k: "welding", l: "Welding", c: T.amber },
                    { k: "grinding", l: "Grinding", c: T.pink },
                    { k: "labor", l: "Labour / hr", c: "#60a5fa" },
                  ].map(({ k, l, c }) => (
                    <div
                      key={k}
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 8,
                        padding: "12px 14px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9,
                          color: T.textDim,
                          marginBottom: 5,
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          fontFamily: T.display,
                        }}
                      >
                        {l}
                      </div>
                      {editRates ? (
                        <input
                          style={{
                            ...S.inp,
                            fontSize: 20,
                            fontWeight: 900,
                            color: c,
                            background: "transparent",
                            border: "none",
                            borderBottom: `1px solid ${c}`,
                            borderRadius: 0,
                            padding: "2px 0",
                            fontFamily: T.mono,
                          }}
                          type="number"
                          value={co[k]}
                          onChange={(e) => setCoField(k, +e.target.value)}
                        />
                      ) : (
                        <div
                          style={{
                            fontSize: 22,
                            fontWeight: 900,
                            color: c,
                            fontFamily: T.mono,
                          }}
                        >
                          ₹{co[k]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ ...S.g4, marginTop: 12 }}>
                  {[
                    { k: "finishing", l: "Finish ₹/pc" },
                    { k: "packaging", l: "Packaging ₹" },
                    { k: "transport", l: "Transport ₹" },
                    { k: "margin", l: "Profit %", pct: true },
                  ].map(({ k, l, pct }) => (
                    <div
                      key={k}
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 8,
                        padding: "12px 14px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9,
                          color: T.textDim,
                          marginBottom: 5,
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          fontFamily: T.display,
                        }}
                      >
                        {l}
                      </div>
                      {editRates ? (
                        <input
                          style={{
                            ...S.inp,
                            fontSize: 18,
                            fontWeight: 900,
                            color: "#a78bfa",
                            background: "transparent",
                            border: "none",
                            borderBottom: "1px solid #a78bfa",
                            borderRadius: 0,
                            padding: "2px 0",
                            fontFamily: T.mono,
                          }}
                          type="number"
                          value={pct ? (co[k] * 100).toFixed(0) : co[k]}
                          onChange={(e) =>
                            setCoField(
                              k,
                              pct ? +e.target.value / 100 : +e.target.value,
                            )
                          }
                        />
                      ) : (
                        <div
                          style={{
                            fontSize: 20,
                            fontWeight: 900,
                            color: "#a78bfa",
                            fontFamily: T.mono,
                          }}
                        >
                          {pct
                            ? `${(co.margin * 100).toFixed(0)}%`
                            : `₹${co[k]}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button style={S.btn} onClick={() => setStep(2)}>
                  PROCEED TO RFQ INPUT →
                </button>
              </div>
            </div>
          )}

          {/* ════════ STEP 2: RFQ UPLOAD ════════ */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: 22 }}>
                <div
                  style={{
                    fontFamily: T.display,
                    fontSize: 34,
                    fontWeight: 900,
                    letterSpacing: "-1px",
                    color: T.text,
                    lineHeight: 1,
                  }}
                >
                  RFQ<span style={{ color: T.accent }}> INPUT</span>
                </div>
                <div style={{ fontSize: 12, color: T.textMid, marginTop: 6 }}>
                  Upload PDFs, engineering drawings, or paste email text. AI
                  extracts all specifications automatically.
                </div>
              </div>

              {/* PDF/Drawing Upload — PRIMARY */}
              <div
                style={{
                  ...S.cardHi,
                  border: `1px solid ${T.accent}30`,
                  background: `linear-gradient(135deg,${T.card},${T.cardHi})`,
                }}
              >
                <SectionHead>
                  📄 Upload PDF / Engineering Drawing
                  <Tag color={T.accent}>PRIMARY</Tag>
                </SectionHead>
                <div
                  style={{
                    border: `2px dashed ${T.accent}40`,
                    borderRadius: 10,
                    padding: "36px 24px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all .2s",
                    background: `${T.accent}06`,
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = T.accent;
                    e.currentTarget.style.background = `${T.accent}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${T.accent}40`;
                    e.currentTarget.style.background = `${T.accent}06`;
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFiles(e.dataTransfer.files);
                  }}
                >
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📂</div>
                  <div
                    style={{
                      fontFamily: T.display,
                      fontSize: 18,
                      fontWeight: 800,
                      color: T.accent,
                      letterSpacing: "1px",
                    }}
                  >
                    DROP FILES HERE
                  </div>
                  <div style={{ fontSize: 11, color: T.textMid, marginTop: 6 }}>
                    PDF · PNG · JPG · DXF · STEP — Multiple files supported
                  </div>
                  <div style={{ fontSize: 10, color: T.textDim, marginTop: 4 }}>
                    AI reads: Title blocks · BOM tables · Dimensions · Material
                    specs · Surface finish callouts · Notes
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.dxf,.step,.iges,.dwg"
                    onChange={(e) => handleFiles(e.target.files)}
                    style={{ display: "none" }}
                  />
                </div>

                {uploadedFiles.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    {uploadedFiles.map((f, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 14px",
                          background: T.surface,
                          borderRadius: 8,
                          border: `1px solid ${T.border}`,
                          marginBottom: 6,
                        }}
                      >
                        <Tag
                          color={
                            f.type === "PDF"
                              ? T.accent
                              : f.type === "PNG" || f.type === "JPG"
                                ? T.pink
                                : T.accent2
                          }
                        >
                          {f.type}
                        </Tag>
                        <span
                          style={{
                            flex: 1,
                            fontSize: 12,
                            color: T.text,
                            fontWeight: 600,
                          }}
                        >
                          {f.name}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            color: T.textDim,
                            fontFamily: T.mono,
                          }}
                        >
                          {f.size}
                        </span>
                        <button
                          style={{
                            ...S.btnGreen,
                            fontSize: 9,
                            padding: "5px 12px",
                          }}
                          onClick={() => extractFromFile(f)}
                          disabled={busy}
                        >
                          ⚡ AI EXTRACT
                        </button>
                        <span
                          style={{
                            fontSize: 11,
                            color: T.red,
                            cursor: "pointer",
                            padding: "4px 8px",
                          }}
                          onClick={() =>
                            setUploadedFiles((prev) =>
                              prev.filter((_, j) => j !== i),
                            )
                          }
                        >
                          ✕
                        </span>
                      </div>
                    ))}
                    {drawingInfo?.has_drawing && (
                      <div
                        style={{
                          padding: "10px 14px",
                          background: `${T.green}10`,
                          border: `1px solid ${T.green}30`,
                          borderRadius: 8,
                          fontSize: 11,
                          color: T.green,
                          marginTop: 8,
                        }}
                      >
                        ✅ Drawing analysed:{" "}
                        {drawingInfo.drawing_title || "Technical Drawing"}{" "}
                        {drawingInfo.revision
                          ? `· Rev ${drawingInfo.revision}`
                          : ""}{" "}
                        · Tolerance: {drawingInfo.general_tolerance || "—"} ·
                        Ra: {drawingInfo.surface_roughness || "—"}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Email Text */}
              <div style={S.card}>
                <SectionHead>📧 Paste Email / RFQ Text</SectionHead>
                <textarea
                  style={S.ta}
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  placeholder={
                    "Paste the client's RFQ email here. AI will extract:\n• Client: company, name, email, phone, GSTIN, address\n• Multiple parts with material, dimensions, process, finish, tolerances\n• Delivery requirements and deadlines\n\nExample:\nFrom: Rajesh Kumar <rajesh@abc.com> · ABC Engineering Pvt Ltd · GSTIN: 29ABCDE1234F1Z5\n\nPart 1 — Laser Cut Brackets · Mild Steel · 5mm · 200×100mm · Qty 50 · Powder Coat\nPart 2 — CNC Flanges · SS304 · 10mm · 150×150mm · Qty 20 · Mirror Polish\nDelivery: Pune, required within 14 days"
                  }
                />
                <div style={{ marginTop: 12, display: "flex", gap: 9 }}>
                  <button
                    style={S.btn}
                    onClick={extractFromEmailText}
                    disabled={busy}
                  >
                    {busy ? "⏳ EXTRACTING..." : "⚡ EXTRACT WITH AI"}
                  </button>
                  <button style={S.btnGhost} onClick={() => setStep(3)}>
                    MANUAL ENTRY →
                  </button>
                </div>
              </div>

              <div
                style={{ display: "flex", gap: 9, justifyContent: "flex-end" }}
              >
                <button style={S.btnGhost} onClick={() => setStep(1)}>
                  ← BACK
                </button>
                <button style={S.btn} onClick={() => setStep(3)}>
                  NEXT: CLIENT DETAILS →
                </button>
              </div>
            </div>
          )}

          {/* ════════ STEP 3: CLIENT ════════ */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom: 22 }}>
                <div
                  style={{
                    fontFamily: T.display,
                    fontSize: 34,
                    fontWeight: 900,
                    letterSpacing: "-1px",
                    color: T.text,
                    lineHeight: 1,
                  }}
                >
                  CLIENT<span style={{ color: T.accent }}> DETAILS</span>
                </div>
                <div style={{ fontSize: 12, color: T.textMid, marginTop: 6 }}>
                  All fields appear on the quotation PDF. AI-extracted fields
                  are pre-filled — review and correct.
                </div>
              </div>

              <div style={S.card}>
                <SectionHead>🏢 Company & Contact</SectionHead>
                <div style={S.g2}>
                  <Field label="Company Name">
                    <input
                      style={S.inp}
                      value={client.company}
                      onChange={(e) =>
                        setClient((p) => ({ ...p, company: e.target.value }))
                      }
                      placeholder="ABC Engineering Pvt Ltd"
                    />
                  </Field>
                  <Field label="Contact Person">
                    <input
                      style={S.inp}
                      value={client.name}
                      onChange={(e) =>
                        setClient((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="Rajesh Kumar"
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      style={S.inp}
                      type="email"
                      value={client.email}
                      onChange={(e) =>
                        setClient((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="rajesh@abc.com"
                    />
                  </Field>
                  <Field label="Phone / Mobile">
                    <input
                      style={S.inp}
                      type="tel"
                      value={client.phone}
                      onChange={(e) =>
                        setClient((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="+91 98765 43210"
                    />
                  </Field>
                  <Field label="GSTIN" hint="15-digit">
                    <input
                      style={S.inp}
                      value={client.gst}
                      onChange={(e) =>
                        setClient((p) => ({
                          ...p,
                          gst: e.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="29ABCDE1234F1Z5"
                      maxLength={15}
                    />
                  </Field>
                  <Field label="PAN">
                    <input
                      style={S.inp}
                      value={client.pan}
                      onChange={(e) =>
                        setClient((p) => ({
                          ...p,
                          pan: e.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="ABCDE1234F"
                      maxLength={10}
                    />
                  </Field>
                </div>
              </div>

              <div style={S.card}>
                <SectionHead>📍 Delivery Address</SectionHead>
                <div style={S.g2}>
                  <Field label="Street / Area" col2>
                    <input
                      style={S.inp}
                      value={client.address}
                      onChange={(e) =>
                        setClient((p) => ({ ...p, address: e.target.value }))
                      }
                      placeholder="Plot 12, MIDC Industrial Area, Phase 2"
                    />
                  </Field>
                  <Field label="City">
                    <input
                      style={S.inp}
                      value={client.city}
                      onChange={(e) =>
                        setClient((p) => ({ ...p, city: e.target.value }))
                      }
                      placeholder="Pune"
                    />
                  </Field>
                  <Field label="State">
                    <input
                      style={S.inp}
                      value={client.state}
                      onChange={(e) =>
                        setClient((p) => ({ ...p, state: e.target.value }))
                      }
                      placeholder="Maharashtra"
                    />
                  </Field>
                  <Field label="Pincode">
                    <input
                      style={S.inp}
                      value={client.pincode}
                      onChange={(e) =>
                        setClient((p) => ({ ...p, pincode: e.target.value }))
                      }
                      placeholder="411018"
                    />
                  </Field>
                  <Field label="Country">
                    <input
                      style={S.inp}
                      value={client.country}
                      onChange={(e) =>
                        setClient((p) => ({ ...p, country: e.target.value }))
                      }
                      placeholder="India"
                    />
                  </Field>
                </div>
              </div>

              <div style={S.card}>
                <SectionHead>📋 Commercial Terms</SectionHead>
                <div style={S.g3}>
                  <Field label="Required Delivery (Days)">
                    <input
                      style={S.inp}
                      type="number"
                      min="1"
                      value={client.required_days}
                      onChange={(e) =>
                        setClient((p) => ({
                          ...p,
                          required_days: e.target.value,
                        }))
                      }
                      placeholder="e.g. 14"
                    />
                  </Field>
                  <Field label="Payment Terms">
                    <select
                      style={S.sel}
                      value={client.payment_terms}
                      onChange={(e) =>
                        setClient((p) => ({
                          ...p,
                          payment_terms: e.target.value,
                        }))
                      }
                    >
                      <option>50% Advance, Balance Before Dispatch</option>
                      <option>100% Advance</option>
                      <option>30 Days Credit</option>
                      <option>45 Days Credit</option>
                      <option>60 Days Credit</option>
                      <option>LC at Sight</option>
                      <option>Custom</option>
                    </select>
                  </Field>
                  <Field label="Incoterms">
                    <select
                      style={S.sel}
                      value={client.incoterms}
                      onChange={(e) =>
                        setClient((p) => ({ ...p, incoterms: e.target.value }))
                      }
                    >
                      <option>Ex-Works</option>
                      <option>FOR Destination</option>
                      <option>DDP</option>
                      <option>FCA</option>
                      <option>FOB</option>
                      <option>CIF</option>
                    </select>
                  </Field>
                </div>
              </div>

              <div
                style={{ display: "flex", gap: 9, justifyContent: "flex-end" }}
              >
                <button style={S.btnGhost} onClick={() => setStep(2)}>
                  ← BACK
                </button>
                <button style={S.btn} onClick={() => setStep(4)}>
                  NEXT: PARTS →
                </button>
              </div>
            </div>
          )}

          {/* ════════ STEP 4: PARTS ════════ */}
          {step === 4 && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginBottom: 22,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: T.display,
                      fontSize: 34,
                      fontWeight: 900,
                      letterSpacing: "-1px",
                      color: T.text,
                      lineHeight: 1,
                    }}
                  >
                    PARTS &amp;<span style={{ color: T.accent }}> SPECS</span>
                  </div>
                  <div style={{ fontSize: 12, color: T.textMid, marginTop: 6 }}>
                    Define each part from the RFQ. AI-extracted data pre-filled
                    from drawing/email.
                  </div>
                </div>
                <button
                  style={{ ...S.btnGhost, fontSize: 10 }}
                  onClick={addPart}
                >
                  + ADD PART
                </button>
              </div>

              {/* Part tabs */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginBottom: 14,
                  alignItems: "center",
                }}
              >
                {parts.map((p, i) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background:
                        activePartIdx === i ? `${T.accent}18` : T.card,
                      border: `1px solid ${activePartIdx === i ? T.accent : T.border}`,
                      borderRadius: 8,
                      padding: "7px 12px",
                      cursor: "pointer",
                      color: activePartIdx === i ? T.accent : T.textMid,
                    }}
                    onClick={() => setActive(i)}
                  >
                    <span style={{ fontSize: 10, fontFamily: T.mono }}>
                      {partValid(p) ? "✓" : "!"}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: T.display,
                        letterSpacing: "0.5px",
                      }}
                    >
                      {p.partName || `PART ${i + 1}`}
                    </span>
                    {p.extracted_from_drawing && <Tag color={T.green}>DWG</Tag>}
                    {parts.length > 1 && (
                      <span
                        style={{
                          fontSize: 10,
                          color: T.red,
                          marginLeft: 2,
                          padding: "1px 4px",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          removePart(i);
                        }}
                      >
                        ✕
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {parts.map((p, i) => (
                <div
                  key={p.id}
                  style={{ display: activePartIdx === i ? "block" : "none" }}
                >
                  <div style={S.card}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                      }}
                    >
                      <SectionHead>
                        🔩 Part {i + 1} — Specifications
                      </SectionHead>
                      <button
                        style={{
                          ...S.btnGhost,
                          fontSize: 9,
                          padding: "5px 12px",
                        }}
                        onClick={() => dupPart(i)}
                      >
                        ⧉ DUPLICATE
                      </button>
                    </div>

                    <div style={{ ...S.g2, marginBottom: 12 }}>
                      <Field label="Part Name / Item">
                        <input
                          style={S.inp}
                          value={p.partName}
                          onChange={(e) =>
                            setPart(i, "partName", e.target.value)
                          }
                          placeholder="e.g. Bracket-A, Flange-001"
                        />
                      </Field>
                      <Field label="Drawing Number">
                        <input
                          style={S.inp}
                          value={p.drawingNo}
                          onChange={(e) =>
                            setPart(i, "drawingNo", e.target.value)
                          }
                          placeholder="e.g. DRG-2024-001 Rev B"
                        />
                      </Field>
                      <Field label="Description" col2>
                        <input
                          style={S.inp}
                          value={p.description}
                          onChange={(e) =>
                            setPart(i, "description", e.target.value)
                          }
                          placeholder="Brief description for client"
                        />
                      </Field>
                    </div>

                    <div style={S.g2}>
                      <Field label="Material" required>
                        <select
                          style={S.sel}
                          value={p.material}
                          onChange={(e) =>
                            setPart(i, "material", e.target.value)
                          }
                        >
                          <option value="">— Select Material —</option>
                          {MATERIALS.map((m) => (
                            <option key={m.name}>{m.name}</option>
                          ))}
                        </select>
                        {p.material &&
                          (() => {
                            const m = MATERIALS.find(
                              (x) => x.name === p.material,
                            );
                            return m ? (
                              <div
                                style={{
                                  fontSize: 9,
                                  color: T.green,
                                  marginTop: 3,
                                  fontFamily: T.mono,
                                }}
                              >
                                ρ={m.density} kg/m³ · ₹{m.ppkg}/kg
                              </div>
                            ) : null;
                          })()}
                      </Field>
                      <Field label="Process" required>
                        <select
                          style={S.sel}
                          value={p.process}
                          onChange={(e) =>
                            setPart(i, "process", e.target.value)
                          }
                        >
                          <option value="">— Select Process —</option>
                          {PROCESSES.map((pr) => (
                            <option key={pr.name}>
                              {pr.icon} {pr.name}
                            </option>
                          ))}
                        </select>
                        {p.process &&
                          (() => {
                            const pr = PROCESSES.find(
                              (x) => x.name === p.process,
                            );
                            return pr ? (
                              <div
                                style={{
                                  fontSize: 9,
                                  color: T.green,
                                  marginTop: 3,
                                  fontFamily: T.mono,
                                }}
                              >
                                ₹{pr.rate}/hr · t: {pr.min_t}–{pr.max_t}mm
                              </div>
                            ) : null;
                          })()}
                      </Field>
                    </div>

                    <div style={{ ...S.g5, marginTop: 12 }}>
                      <Field label="Thickness (mm)" required>
                        <input
                          style={S.inp}
                          type="number"
                          min=".1"
                          step=".5"
                          value={p.thickness}
                          onChange={(e) =>
                            setPart(i, "thickness", e.target.value)
                          }
                          placeholder="5"
                        />
                      </Field>
                      <Field label="Length (mm)" required>
                        <input
                          style={S.inp}
                          type="number"
                          min="1"
                          value={p.length}
                          onChange={(e) => setPart(i, "length", e.target.value)}
                          placeholder="200"
                        />
                      </Field>
                      <Field label="Width (mm)" required>
                        <input
                          style={S.inp}
                          type="number"
                          min="1"
                          value={p.width}
                          onChange={(e) => setPart(i, "width", e.target.value)}
                          placeholder="100"
                        />
                      </Field>
                      <Field label="Height (mm)">
                        <input
                          style={S.inp}
                          type="number"
                          min="0"
                          value={p.height}
                          onChange={(e) => setPart(i, "height", e.target.value)}
                          placeholder="—"
                        />
                      </Field>
                      <Field label="Quantity (pcs)" required>
                        <input
                          style={S.inp}
                          type="number"
                          min="1"
                          value={p.quantity}
                          onChange={(e) =>
                            setPart(i, "quantity", e.target.value)
                          }
                          placeholder="50"
                        />
                      </Field>
                    </div>

                    <div style={{ ...S.g3, marginTop: 12 }}>
                      <Field label="Surface Finish">
                        <select
                          style={S.sel}
                          value={p.finish}
                          onChange={(e) => setPart(i, "finish", e.target.value)}
                        >
                          <option value="">— Select —</option>
                          {FINISH_OPTIONS.map((f) => (
                            <option key={f}>{f}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Tolerance" hint="e.g. ±0.1mm, ISO H7">
                        <input
                          style={S.inp}
                          value={p.tolerance}
                          onChange={(e) =>
                            setPart(i, "tolerance", e.target.value)
                          }
                          placeholder="±0.1mm"
                        />
                      </Field>
                      <Field label="Hardness / Heat Treatment">
                        <input
                          style={S.inp}
                          value={p.hardness}
                          onChange={(e) =>
                            setPart(i, "hardness", e.target.value)
                          }
                          placeholder="e.g. HRC 55, Case hardened"
                        />
                      </Field>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <Field label="Part Notes / Special Requirements">
                        <textarea
                          style={{ ...S.ta, minHeight: 60 }}
                          value={p.notes}
                          onChange={(e) => setPart(i, "notes", e.target.value)}
                          placeholder="Any special notes from drawing or client..."
                        />
                      </Field>
                    </div>

                    {/* Live feasibility */}
                    {partValid(p) &&
                      (() => {
                        const f = calcFeasibility(p);
                        return (
                          <div
                            style={{
                              marginTop: 14,
                              padding: "12px 14px",
                              background:
                                f.score === 100
                                  ? `${T.green}08`
                                  : `${T.amber}08`,
                              border: `1px solid ${f.score === 100 ? T.green : T.amber}25`,
                              borderRadius: 8,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: f.warnings.length ? 8 : 0,
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 9,
                                  fontWeight: 800,
                                  letterSpacing: "1.5px",
                                  color: f.score === 100 ? T.green : T.amber,
                                  fontFamily: T.display,
                                }}
                              >
                                FEASIBILITY — {f.complexity.toUpperCase()}
                              </div>
                              <div
                                style={{
                                  flex: 1,
                                  height: 4,
                                  background: T.textDim + "40",
                                  borderRadius: 2,
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    background:
                                      f.score === 100
                                        ? T.green
                                        : f.score === 50
                                          ? T.amber
                                          : T.red,
                                    width: `${f.score}%`,
                                    borderRadius: 2,
                                  }}
                                />
                              </div>
                            </div>
                            {f.warnings.map((w, wi) => (
                              <div
                                key={wi}
                                style={{
                                  fontSize: 11,
                                  color:
                                    w.lvl === "error"
                                      ? T.red
                                      : w.lvl === "warn"
                                        ? T.amber
                                        : "#93c5fd",
                                  marginBottom: 3,
                                }}
                              >
                                {w.lvl === "error"
                                  ? "❌"
                                  : w.lvl === "warn"
                                    ? "⚠"
                                    : "ℹ"}{" "}
                                {w.msg}
                              </div>
                            ))}
                            {f.warnings.length === 0 && (
                              <div style={{ fontSize: 11, color: T.green }}>
                                ✅ All specifications are manufacturable.
                              </div>
                            )}
                          </div>
                        );
                      })()}
                  </div>
                </div>
              ))}

              {/* Validation summary */}
              <div
                style={{
                  ...S.card,
                  border: `1px solid ${allValid ? T.green + "40" : T.red + "40"}`,
                }}
              >
                <SectionHead>✅ Validation Summary</SectionHead>
                <div style={S.g3}>
                  {parts.map((p, i) => (
                    <div
                      key={p.id}
                      style={{
                        background: T.surface,
                        border: `1px solid ${partValid(p) ? T.green + "30" : T.red + "30"}`,
                        borderRadius: 8,
                        padding: "10px 12px",
                        cursor: "pointer",
                      }}
                      onClick={() => setActive(i)}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 3,
                        }}
                      >
                        <span
                          style={{
                            color: partValid(p) ? T.green : T.red,
                            fontSize: 12,
                          }}
                        >
                          {partValid(p) ? "✓" : "✗"}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: T.text,
                          }}
                        >
                          {p.partName || `Part ${i + 1}`}
                        </span>
                        {p.extracted_from_drawing && (
                          <Tag color={T.green}>DWG</Tag>
                        )}
                      </div>
                      {!partValid(p) && (
                        <div
                          style={{
                            fontSize: 9,
                            color: T.red,
                            fontFamily: T.mono,
                          }}
                        >
                          Missing: {reqFields.filter((k) => !p[k]).join(", ")}
                        </div>
                      )}
                      {partValid(p) && (
                        <div
                          style={{
                            fontSize: 9,
                            color: T.textDim,
                            fontFamily: T.mono,
                          }}
                        >
                          {p.material} · {p.process} · {p.quantity}pcs
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{ display: "flex", gap: 9, justifyContent: "flex-end" }}
              >
                <button style={S.btnGhost} onClick={() => setStep(3)}>
                  ← BACK
                </button>
                <button
                  style={{
                    ...S.btn,
                    opacity: allValid ? 1 : 0.4,
                    cursor: allValid ? "pointer" : "not-allowed",
                  }}
                  onClick={allValid ? runAll : undefined}
                >
                  CALCULATE COSTS →
                </button>
              </div>
            </div>
          )}

          {/* ════════ STEP 5: COSTING ════════ */}
          {step === 5 && costsArr.length > 0 && (
            <div>
              <div style={{ marginBottom: 22 }}>
                <div
                  style={{
                    fontFamily: T.display,
                    fontSize: 34,
                    fontWeight: 900,
                    letterSpacing: "-1px",
                    color: T.text,
                    lineHeight: 1,
                  }}
                >
                  COST<span style={{ color: T.accent }}> ANALYSIS</span>
                </div>
                <div style={{ fontSize: 12, color: T.textMid, marginTop: 6 }}>
                  Click any cost value to override. Configure additional charges
                  below.
                </div>
              </div>

              {/* Grand KPIs */}
              <div style={S.g4}>
                <Stat
                  icon="💰"
                  label="Grand Total"
                  value={`${curr.sym}${grandTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                  color={T.accent}
                />
                <Stat
                  icon="🔩"
                  label="Parts / Pieces"
                  value={`${parts.length} / ${parts.reduce((s, p) => s + (+p.quantity || 0), 0)}`}
                  color={T.accent2}
                />
                <Stat
                  icon="📅"
                  label="Max Lead Time"
                  value={
                    ltArr.length
                      ? `${Math.max(...ltArr.filter(Boolean).map((l) => l.total))}d`
                      : "—"
                  }
                  color={T.green}
                  sub={
                    client.required_days
                      ? Math.max(
                          ...ltArr.filter(Boolean).map((l) => l.total),
                        ) <= +client.required_days
                        ? "✅ Within target"
                        : "⚠ May exceed"
                      : undefined
                  }
                />
                <Stat
                  icon="🏭"
                  label="Subtotal (ex-extras)"
                  value={`${curr.sym}${partSubtotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                  color={T.amber}
                />
              </div>

              {/* Per-part cost tabs */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                {parts.map((p, i) => {
                  const dc = displayCost(i);
                  return (
                    <button
                      key={p.id}
                      style={{
                        background:
                          activePartIdx === i ? `${T.accent}18` : T.card,
                        border: `1px solid ${activePartIdx === i ? T.accent : T.border}`,
                        color: activePartIdx === i ? T.accent : T.textMid,
                        borderRadius: 8,
                        padding: "7px 14px",
                        cursor: "pointer",
                        fontFamily: T.body,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                      onClick={() => setActive(i)}
                    >
                      {p.partName || `Part ${i + 1}`}
                      <span
                        style={{
                          fontFamily: T.mono,
                          fontSize: 10,
                          color: activePartIdx === i ? T.accent : T.textDim,
                        }}
                      >
                        {curr.sym}
                        {(dc?.total || 0).toFixed(0)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {parts.map((p, i) => {
                const dc = displayCost(i);
                if (!dc) return null;
                const bc = costsArr[i];
                const feas = calcFeasibility(p);
                const lt = ltArr[i];
                const ov = overridesArr[i] || {};
                const ROWS = [
                  {
                    k: "material",
                    l: "Material",
                    d: `${p.material} · ${bc.weight.toFixed(4)} kg`,
                  },
                  {
                    k: "machine",
                    l: "Machining",
                    d: `${p.process} · ${bc.mhrs.toFixed(2)} hrs`,
                  },
                  { k: "labor", l: "Labour", d: "Operator & supervision" },
                  {
                    k: "setup",
                    l: "Setup / NC Prog.",
                    d: "Machine setup per piece",
                  },
                  {
                    k: "finishing",
                    l: "Finish",
                    d: p.finish || "Surface treatment",
                  },
                  { k: "packaging", l: "Packaging", d: "Per piece" },
                  {
                    k: "transport",
                    l: "Transport",
                    d: `To ${client.city || "destination"}`,
                  },
                  {
                    k: "profit",
                    l: `Profit (${(co.margin * 100).toFixed(0)}%)`,
                    d: "Overhead & margin",
                  },
                ];
                const maxV = Math.max(...ROWS.map((r) => dc[r.k] || 0), 1);
                const COLS = [
                  T.accent,
                  T.accent2,
                  T.green,
                  T.amber,
                  T.pink,
                  "#60a5fa",
                  "#84cc16",
                  "#f97316",
                ];

                return (
                  <div
                    key={p.id}
                    style={{ display: activePartIdx === i ? "block" : "none" }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.5fr 1fr",
                        gap: 14,
                      }}
                    >
                      <div>
                        {/* Editable cost table */}
                        <div style={S.card}>
                          <SectionHead
                            action={
                              Object.keys(ov).length > 0 ? (
                                <button
                                  style={{
                                    ...S.btnGhost,
                                    fontSize: 9,
                                    padding: "5px 12px",
                                    color: T.amber,
                                    border: `1px solid ${T.amber}40`,
                                  }}
                                  onClick={() =>
                                    setOvArr((prev) =>
                                      prev.map((o, j) => (j === i ? {} : o)),
                                    )
                                  }
                                >
                                  ↺ RESET
                                </button>
                              ) : null
                            }
                          >
                            Cost Breakdown — Click to Edit
                          </SectionHead>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr 100px",
                              gap: 8,
                              padding: "4px 0 8px",
                              borderBottom: `1px solid ${T.border}`,
                              marginBottom: 4,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 8,
                                color: T.textDim,
                                fontWeight: 800,
                                letterSpacing: "1.5px",
                                fontFamily: T.display,
                              }}
                            >
                              ITEM
                            </div>
                            <div
                              style={{
                                fontSize: 8,
                                color: T.textDim,
                                fontWeight: 800,
                                letterSpacing: "1.5px",
                                fontFamily: T.display,
                              }}
                            >
                              DETAILS
                            </div>
                            <div
                              style={{
                                fontSize: 8,
                                color: T.textDim,
                                fontWeight: 800,
                                letterSpacing: "1.5px",
                                fontFamily: T.display,
                                textAlign: "right",
                              }}
                            >
                              AMOUNT
                            </div>
                          </div>

                          {ROWS.map((row, ri) => {
                            const edited = ov[row.k] !== undefined;
                            return (
                              <div
                                key={row.k}
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr 100px",
                                  gap: 8,
                                  alignItems: "center",
                                  padding: "5px 0",
                                  borderBottom: `1px solid ${T.textDim}18`,
                                }}
                              >
                                <div>
                                  <div
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 700,
                                      color: edited ? T.amber : T.textMid,
                                    }}
                                  >
                                    {row.l}
                                  </div>
                                  {edited && (
                                    <div
                                      style={{
                                        fontSize: 9,
                                        color: T.textDim,
                                        fontFamily: T.mono,
                                      }}
                                    >
                                      calc: {curr.sym}
                                      {bc[row.k].toFixed(2)}
                                    </div>
                                  )}
                                </div>
                                <div
                                  style={{
                                    fontSize: 10,
                                    color: T.textDim,
                                    lineHeight: 1.3,
                                  }}
                                >
                                  {row.d}
                                </div>
                                <div style={{ position: "relative" }}>
                                  <span
                                    style={{
                                      position: "absolute",
                                      left: 7,
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      fontSize: 9,
                                      color: T.textDim,
                                      pointerEvents: "none",
                                      fontFamily: T.mono,
                                    }}
                                  >
                                    {curr.sym}
                                  </span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={dc[row.k].toFixed(2)}
                                    onChange={(e) =>
                                      setOv(
                                        i,
                                        row.k,
                                        Math.max(0, +e.target.value),
                                      )
                                    }
                                    style={{
                                      ...S.inp,
                                      paddingLeft:
                                        curr.sym.length > 1 ? 22 : 18,
                                      textAlign: "right",
                                      fontSize: 12,
                                      fontWeight: 800,
                                      color: edited ? T.amber : T.text,
                                      borderColor: edited
                                        ? `${T.amber}60`
                                        : T.border,
                                      fontFamily: T.mono,
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}

                          <div
                            style={{
                              marginTop: 12,
                              paddingTop: 12,
                              borderTop: `1px solid ${T.borderHi}`,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: 4,
                              }}
                            >
                              <span style={{ fontSize: 11, color: T.textMid }}>
                                Per piece
                              </span>
                              <span
                                style={{
                                  fontFamily: T.mono,
                                  fontSize: 12,
                                  fontWeight: 800,
                                  color: T.textMid,
                                }}
                              >
                                {curr.sym}
                                {dc.per_part.toFixed(2)}
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: T.display,
                                  fontSize: 18,
                                  fontWeight: 900,
                                  letterSpacing: "-0.5px",
                                  color: T.accent,
                                }}
                              >
                                TOTAL ({p.quantity} pcs)
                              </span>
                              <span
                                style={{
                                  fontFamily: T.mono,
                                  fontSize: 18,
                                  fontWeight: 900,
                                  color: T.accent,
                                }}
                              >
                                {curr.sym}
                                {dc.total.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Bar chart */}
                          <div style={{ marginTop: 14 }}>
                            {ROWS.map((row, ri) => (
                              <div
                                key={row.k}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  marginBottom: 5,
                                }}
                              >
                                <div
                                  style={{
                                    width: 120,
                                    fontSize: 10,
                                    color: T.textMid,
                                    fontFamily: T.body,
                                  }}
                                >
                                  {row.l}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <ProgressBar
                                    value={dc[row.k] || 0}
                                    max={maxV}
                                    color={COLS[ri % COLS.length]}
                                  />
                                </div>
                                <div
                                  style={{
                                    width: 80,
                                    textAlign: "right",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    fontFamily: T.mono,
                                    color: COLS[ri % COLS.length],
                                  }}
                                >
                                  {curr.sym}
                                  {(dc[row.k] || 0).toFixed(2)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Lead time */}
                        {lt && (
                          <div style={S.card}>
                            <SectionHead>Production Schedule</SectionHead>
                            <Gantt
                              schedule={lt.schedule}
                              total={lt.total}
                              clientDays={client.required_days}
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        {/* Cost distribution */}
                        <div style={S.card}>
                          <SectionHead>Cost Distribution</SectionHead>
                          {[
                            ["Material", T.accent, dc.material],
                            ["Machine", T.accent2, dc.machine],
                            ["Labour", T.green, dc.labor],
                            [
                              "Overhead",
                              T.amber,
                              dc.setup +
                                dc.finishing +
                                dc.packaging +
                                dc.transport,
                            ],
                            ["Profit", T.red, dc.profit],
                          ].map(([l, c, v]) => (
                            <div key={l} style={{ marginBottom: 10 }}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  fontSize: 11,
                                  marginBottom: 4,
                                }}
                              >
                                <span
                                  style={{
                                    color: T.textMid,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                  }}
                                >
                                  <span
                                    style={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: 2,
                                      background: c,
                                      display: "inline-block",
                                      flexShrink: 0,
                                    }}
                                  />
                                  {l}
                                </span>
                                <span
                                  style={{
                                    fontFamily: T.mono,
                                    fontSize: 11,
                                    color: "#8facc8",
                                    fontWeight: 700,
                                  }}
                                >
                                  {dc.total > 0
                                    ? ((v / dc.total) * 100).toFixed(0)
                                    : 0}
                                  %
                                </span>
                              </div>
                              <ProgressBar value={v} max={dc.total} color={c} />
                            </div>
                          ))}
                        </div>

                        {/* Part tech details */}
                        <div style={S.card}>
                          <SectionHead>Part Details</SectionHead>
                          <KV label="Material" value={bc.mat.name} mono />
                          <KV
                            label="Density"
                            value={`${bc.mat.density} kg/m³`}
                            mono
                          />
                          <KV
                            label="Weight"
                            value={`${bc.weight.toFixed(5)} kg`}
                            mono
                          />
                          <KV
                            label="Mat. Rate"
                            value={`₹${bc.mat.ppkg}/kg`}
                            mono
                          />
                          <KV label="Process" value={bc.proc.name} mono />
                          <KV
                            label="Mach. Hours"
                            value={`${bc.mhrs.toFixed(3)} hrs`}
                            mono
                          />
                          <KV label="Qty" value={`${p.quantity} pcs`} mono />
                          {p.tolerance && (
                            <KV label="Tolerance" value={p.tolerance} mono />
                          )}
                          {p.hardness && (
                            <KV label="Hardness" value={p.hardness} mono />
                          )}
                          {p.drawingNo && (
                            <KV label="Drawing" value={p.drawingNo} mono />
                          )}
                        </div>

                        {/* Feasibility */}
                        <div style={S.card}>
                          <SectionHead>Feasibility Check</SectionHead>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              marginBottom: 10,
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <ProgressBar
                                value={feas.score}
                                max={100}
                                color={
                                  feas.score === 100
                                    ? T.green
                                    : feas.score === 50
                                      ? T.amber
                                      : T.red
                                }
                              />
                            </div>
                            <Tag
                              color={
                                feas.score === 100
                                  ? T.green
                                  : feas.score === 50
                                    ? T.amber
                                    : T.red
                              }
                            >
                              {feas.complexity}
                            </Tag>
                          </div>
                          {feas.warnings.length === 0 ? (
                            <div
                              style={{
                                fontSize: 11,
                                color: T.green,
                                padding: "8px 10px",
                                background: `${T.green}0a`,
                                borderRadius: 6,
                              }}
                            >
                              ✅ No manufacturing issues detected.
                            </div>
                          ) : (
                            feas.warnings.map((w, wi) => (
                              <div
                                key={wi}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: 6,
                                  marginBottom: 5,
                                  fontSize: 11,
                                  background:
                                    w.lvl === "error"
                                      ? `${T.red}10`
                                      : w.lvl === "warn"
                                        ? `${T.amber}10`
                                        : `${T.accent}10`,
                                  color:
                                    w.lvl === "error"
                                      ? T.red
                                      : w.lvl === "warn"
                                        ? T.amber
                                        : "#93c5fd",
                                }}
                              >
                                {w.msg}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ── ADDITIONAL CHARGES ── */}
              <div style={S.card}>
                <SectionHead>➕ Additional Charges</SectionHead>
                <p style={{ fontSize: 11, color: T.textDim, marginBottom: 14 }}>
                  Applied to entire order. Percent-based charges calculate on
                  parts subtotal.
                </p>
                {extras.map((ex, i) => (
                  <div
                    key={ex.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr 100px 110px 80px 36px",
                      gap: 8,
                      alignItems: "center",
                      marginBottom: 8,
                      padding: "10px 12px",
                      background: ex.enabled ? `${T.accent}06` : T.surface,
                      border: `1px solid ${ex.enabled ? T.borderHi : T.border}`,
                      borderRadius: 8,
                      transition: "all .2s",
                    }}
                  >
                    {/* Toggle */}
                    <div
                      style={{
                        width: 32,
                        height: 18,
                        background: ex.enabled ? T.accent : T.textDim + "40",
                        borderRadius: 9,
                        cursor: ex.locked ? "not-allowed" : "pointer",
                        position: "relative",
                        transition: "background .2s",
                        opacity: ex.locked ? 0.6 : 1,
                      }}
                      onClick={() =>
                        !ex.locked &&
                        setExtras((prev) =>
                          prev.map((e2, j) =>
                            j === i ? { ...e2, enabled: !e2.enabled } : e2,
                          ),
                        )
                      }
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 2,
                          width: 14,
                          height: 14,
                          background: "#fff",
                          borderRadius: "50%",
                          left: ex.enabled ? "16px" : "2px",
                          transition: "left .2s",
                        }}
                      />
                    </div>
                    {/* Label */}
                    <input
                      style={{
                        ...S.inp,
                        opacity: ex.enabled ? 1 : 0.4,
                        fontSize: 12,
                      }}
                      value={ex.label}
                      onChange={(e) =>
                        setExtras((prev) =>
                          prev.map((e2, j) =>
                            j === i ? { ...e2, label: e.target.value } : e2,
                          ),
                        )
                      }
                      placeholder="Charge label (e.g. GST 18%, Inspection Fee...)"
                    />
                    {/* Value */}
                    <input
                      style={{
                        ...S.inp,
                        opacity: ex.enabled ? 1 : 0.4,
                        fontFamily: T.mono,
                        fontSize: 12,
                      }}
                      type="number"
                      value={ex.value}
                      onChange={(e) =>
                        setExtras((prev) =>
                          prev.map((e2, j) =>
                            j === i ? { ...e2, value: e.target.value } : e2,
                          ),
                        )
                      }
                    />
                    {/* Type */}
                    <select
                      style={{
                        ...S.sel,
                        opacity: ex.enabled ? 1 : 0.4,
                        fontSize: 11,
                      }}
                      value={ex.type}
                      onChange={(e) =>
                        setExtras((prev) =>
                          prev.map((e2, j) =>
                            j === i ? { ...e2, type: e.target.value } : e2,
                          ),
                        )
                      }
                    >
                      <option value="percent">% of subtotal</option>
                      <option value="fixed">Fixed ₹</option>
                    </select>
                    {/* Computed */}
                    <div
                      style={{
                        textAlign: "right",
                        fontFamily: T.mono,
                        fontSize: 11,
                        color: ex.enabled ? T.accent : T.textDim,
                        fontWeight: 700,
                      }}
                    >
                      {ex.enabled && ex.label && +ex.value > 0
                        ? `${curr.sym}${(extraRows.find((r) => r.id === ex.id)?.computed || 0).toFixed(2)}`
                        : "—"}
                    </div>
                    {/* Delete */}
                    {!ex.locked ? (
                      <button
                        style={{
                          background: "transparent",
                          border: "none",
                          color: T.red,
                          cursor: "pointer",
                          fontSize: 14,
                          padding: 0,
                        }}
                        onClick={() =>
                          setExtras((prev) => prev.filter((_, j) => j !== i))
                        }
                      >
                        ✕
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>
                ))}
                <button
                  style={{ ...S.btnGhost, fontSize: 10, marginTop: 6 }}
                  onClick={() =>
                    setExtras((prev) => [
                      ...prev,
                      {
                        id: Math.random().toString(36).slice(2),
                        label: "",
                        type: "fixed",
                        value: "0",
                        enabled: true,
                        locked: false,
                      },
                    ])
                  }
                >
                  + ADD CHARGE
                </button>

                {/* Grand total with extras */}
                <div
                  style={{
                    marginTop: 16,
                    padding: "14px 16px",
                    background: T.surface,
                    borderRadius: 8,
                    border: `1px solid ${T.borderHi}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      color: T.textMid,
                      marginBottom: 6,
                    }}
                  >
                    <span>Parts subtotal</span>
                    <span style={{ fontFamily: T.mono }}>
                      {curr.sym}
                      {partSubtotal.toFixed(2)}
                    </span>
                  </div>
                  {extraRows.map((e) => (
                    <div
                      key={e.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        color: T.textMid,
                        marginBottom: 4,
                      }}
                    >
                      <span>{e.label}</span>
                      <span style={{ fontFamily: T.mono }}>
                        {curr.sym}
                        {e.computed.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div
                    style={{
                      borderTop: `1px solid ${T.borderHi}`,
                      paddingTop: 10,
                      marginTop: 6,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: T.display,
                        fontSize: 20,
                        fontWeight: 900,
                        letterSpacing: "-0.5px",
                        color: T.text,
                      }}
                    >
                      GRAND TOTAL
                    </span>
                    <span
                      style={{
                        fontFamily: T.mono,
                        fontSize: 22,
                        fontWeight: 900,
                        color: T.accent,
                      }}
                    >
                      {curr.sym}
                      {grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{ display: "flex", gap: 9, justifyContent: "flex-end" }}
              >
                <button style={S.btnGhost} onClick={() => setStep(4)}>
                  ← EDIT PARTS
                </button>
                <button style={S.btn} onClick={() => setStep(6)}>
                  GENERATE QUOTATION →
                </button>
              </div>
            </div>
          )}

          {/* ════════ STEP 6: QUOTATION ════════ */}
          {step === 6 && costsArr.length > 0 && (
            <div>
              <div style={{ marginBottom: 22 }}>
                <div
                  style={{
                    fontFamily: T.display,
                    fontSize: 34,
                    fontWeight: 900,
                    letterSpacing: "-1px",
                    color: T.text,
                    lineHeight: 1,
                  }}
                >
                  FINAL<span style={{ color: T.accent }}> QUOTATION</span>
                </div>
                <div style={{ fontSize: 12, color: T.textMid, marginTop: 6 }}>
                  Professional PDF quotation — ready to send to client.
                </div>
              </div>

              {/* PDF Download — ONLY option, prominent */}
              <div
                style={{
                  ...S.cardHi,
                  border: `2px solid ${T.accent}40`,
                  background: `linear-gradient(135deg,${T.card},${T.cardHi})`,
                  textAlign: "center",
                  padding: "36px 40px",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                <div
                  style={{
                    fontFamily: T.display,
                    fontSize: 28,
                    fontWeight: 900,
                    letterSpacing: "-1px",
                    color: T.text,
                    marginBottom: 6,
                  }}
                >
                  PROFESSIONAL QUOTATION
                </div>
                <div
                  style={{ fontSize: 13, color: T.textMid, marginBottom: 24 }}
                >
                  {qid} ·{" "}
                  {new Date().toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  · {parts.length} Part{parts.length > 1 ? "s" : ""} ·{" "}
                  {curr.sym}
                  {grandTotal.toFixed(2)} {ccy}
                </div>

                {/* Preview badges */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 10,
                    flexWrap: "wrap",
                    marginBottom: 28,
                  }}
                >
                  {[
                    ["Client", client.company || client.name || "—"],
                    ["Parts", `${parts.length} items`],
                    [
                      "Pieces",
                      `${parts.reduce((s, p) => s + (+p.quantity || 0), 0)} pcs`,
                    ],
                    ["Total", `${curr.sym}${grandTotal.toFixed(2)}`],
                    ...(drawingInfo?.has_drawing
                      ? [["Drawing", "Included"]]
                      : []),
                    ...(extraRows.length
                      ? [["Extras", `${extraRows.length} charges`]]
                      : []),
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 8,
                        padding: "8px 14px",
                        minWidth: 100,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 8,
                          color: T.textDim,
                          letterSpacing: "1.5px",
                          textTransform: "uppercase",
                          fontFamily: T.display,
                          marginBottom: 3,
                        }}
                      >
                        {k}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: T.text,
                          fontFamily: T.mono,
                        }}
                      >
                        {v}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  style={{
                    ...S.btn,
                    fontSize: 16,
                    padding: "16px 48px",
                    boxShadow: `0 0 40px ${T.accent}40`,
                  }}
                  onClick={downloadPDF}
                  disabled={pdfBusy}
                >
                  {pdfBusy
                    ? "⏳ GENERATING PDF..."
                    : "📥 DOWNLOAD PDF QUOTATION"}
                </button>
                <div style={{ marginTop: 12, fontSize: 10, color: T.textDim }}>
                  Professional A4 PDF · Client & delivery details · Cost
                  breakdown per part · Gantt schedule · Terms & conditions ·
                  Company signature
                </div>
              </div>

              {/* Quotation preview */}
              <div style={S.card}>
                <SectionHead>📄 Quotation Preview</SectionHead>

                {/* Header preview */}
                <div
                  style={{
                    background: "#050c18",
                    border: `1px solid ${T.borderHi}`,
                    borderRadius: 10,
                    overflow: "hidden",
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      background: "linear-gradient(135deg,#050c18,#0f2544)",
                      padding: "16px 20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      borderBottom: `1px solid ${T.border}`,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: T.display,
                          fontSize: 20,
                          fontWeight: 900,
                          color: T.text,
                        }}
                      >
                        RFQ<span style={{ color: T.accent }}>Analyzer</span>{" "}
                        <span style={{ color: T.textMid, fontSize: 14 }}>
                          PRO
                        </span>
                      </div>
                      <div
                        style={{ fontSize: 10, color: T.textDim, marginTop: 1 }}
                      >
                        {co.name} · {co.addr}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontFamily: T.display,
                          fontSize: 18,
                          fontWeight: 900,
                          color: T.text,
                          letterSpacing: "2px",
                        }}
                      >
                        QUOTATION
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          fontFamily: T.mono,
                          color: T.accent,
                          marginTop: 2,
                        }}
                      >
                        {qid}
                      </div>
                    </div>
                  </div>

                  {/* Client & Delivery */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 0,
                    }}
                  >
                    <div
                      style={{
                        padding: "14px 20px",
                        borderRight: `1px solid ${T.border}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 8,
                          color: T.textDim,
                          letterSpacing: "2px",
                          textTransform: "uppercase",
                          fontFamily: T.display,
                          marginBottom: 6,
                        }}
                      >
                        BILL TO
                      </div>
                      <div
                        style={{ fontSize: 13, fontWeight: 800, color: T.text }}
                      >
                        {client.company || client.name || "—"}
                      </div>
                      {client.email && (
                        <div
                          style={{
                            fontSize: 11,
                            color: T.textMid,
                            marginTop: 1,
                          }}
                        >
                          ✉ {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div style={{ fontSize: 11, color: T.textMid }}>
                          📱 {client.phone}
                        </div>
                      )}
                      {client.gst && (
                        <div
                          style={{
                            fontSize: 10,
                            fontFamily: T.mono,
                            color: T.textDim,
                            marginTop: 2,
                          }}
                        >
                          GST: {client.gst}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "14px 20px" }}>
                      <div
                        style={{
                          fontSize: 8,
                          color: T.textDim,
                          letterSpacing: "2px",
                          textTransform: "uppercase",
                          fontFamily: T.display,
                          marginBottom: 6,
                        }}
                      >
                        SHIP TO
                      </div>
                      {client.address && (
                        <div style={{ fontSize: 11, color: T.textMid }}>
                          {client.address}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: T.textMid }}>
                        {[client.city, client.state, client.pincode]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </div>
                      {client.required_days && (
                        <div
                          style={{
                            fontSize: 11,
                            color: T.amber,
                            marginTop: 3,
                            fontWeight: 700,
                          }}
                        >
                          📅 Required: {client.required_days} days
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Parts table preview */}
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 12,
                    }}
                  >
                    <thead>
                      <tr style={{ background: T.surface }}>
                        {[
                          "#",
                          "Part Name",
                          "Material · Process",
                          "Dimensions",
                          "Qty",
                          "Unit Price",
                          "Amount",
                        ].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "8px 10px",
                              textAlign:
                                h === "Amount" || h === "Unit Price"
                                  ? "right"
                                  : "left",
                              color: T.textDim,
                              fontSize: 8,
                              fontWeight: 800,
                              letterSpacing: "1.5px",
                              textTransform: "uppercase",
                              fontFamily: T.display,
                              borderBottom: `1px solid ${T.border}`,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parts.map((p, i) => {
                        const dc = displayCost(i);
                        if (!dc) return null;
                        return (
                          <tr
                            key={p.id}
                            style={{ borderBottom: `1px solid ${T.textDim}20` }}
                          >
                            <td
                              style={{
                                padding: "9px 10px",
                                color: T.textDim,
                                fontFamily: T.mono,
                                fontSize: 10,
                              }}
                            >
                              {i + 1}
                            </td>
                            <td style={{ padding: "9px 10px" }}>
                              <div style={{ fontWeight: 700, color: T.text }}>
                                {p.partName || `Part ${i + 1}`}
                              </div>
                              {p.drawingNo && (
                                <div
                                  style={{
                                    fontSize: 9,
                                    color: T.textDim,
                                    fontFamily: T.mono,
                                  }}
                                >
                                  Dwg: {p.drawingNo}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: "9px 10px" }}>
                              <div style={{ color: T.textMid, fontSize: 11 }}>
                                {p.material}
                              </div>
                              <div style={{ color: T.textDim, fontSize: 10 }}>
                                {p.process}
                              </div>
                            </td>
                            <td
                              style={{
                                padding: "9px 10px",
                                fontFamily: T.mono,
                                fontSize: 10,
                                color: T.textMid,
                              }}
                            >
                              {p.length}×{p.width}×{p.thickness}mm
                            </td>
                            <td
                              style={{
                                padding: "9px 10px",
                                textAlign: "center",
                                fontWeight: 700,
                                color: T.text,
                              }}
                            >
                              {p.quantity}
                            </td>
                            <td
                              style={{
                                padding: "9px 10px",
                                textAlign: "right",
                                fontFamily: T.mono,
                                fontSize: 11,
                                color: T.textMid,
                              }}
                            >
                              {curr.sym}
                              {dc.per_part.toFixed(2)}
                            </td>
                            <td
                              style={{
                                padding: "9px 10px",
                                textAlign: "right",
                                fontFamily: T.mono,
                                fontWeight: 900,
                                color: T.accent,
                              }}
                            >
                              {curr.sym}
                              {dc.total.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      {extraRows.map((e) => (
                        <tr
                          key={e.id}
                          style={{ borderBottom: `1px solid ${T.textDim}15` }}
                        >
                          <td
                            colSpan={6}
                            style={{
                              padding: "7px 10px",
                              color: T.textMid,
                              fontSize: 11,
                            }}
                          >
                            {e.label}
                          </td>
                          <td
                            style={{
                              padding: "7px 10px",
                              textAlign: "right",
                              fontFamily: T.mono,
                              fontSize: 11,
                              color: T.amber,
                              fontWeight: 700,
                            }}
                          >
                            {curr.sym}
                            {e.computed.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr style={{ background: `${T.accent}0a` }}>
                        <td
                          colSpan={6}
                          style={{
                            padding: "12px 10px",
                            fontFamily: T.display,
                            fontWeight: 900,
                            fontSize: 18,
                            letterSpacing: "-0.5px",
                            color: T.accent,
                          }}
                        >
                          GRAND TOTAL ({ccy})
                        </td>
                        <td
                          style={{
                            padding: "12px 10px",
                            textAlign: "right",
                            fontFamily: T.mono,
                            fontWeight: 900,
                            fontSize: 20,
                            color: T.accent,
                          }}
                        >
                          {curr.sym}
                          {grandTotal.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Terms bar */}
                <div style={{ ...S.g4, marginTop: 14 }}>
                  {[
                    [
                      "Max Lead Time",
                      ltArr.length
                        ? `${Math.max(...ltArr.filter(Boolean).map((l) => l.total))} days`
                        : "—",
                    ],
                    [
                      "Payment",
                      client.payment_terms?.split(",")[0] || "50% Advance",
                    ],
                    ["Valid Until", "30 Days"],
                    ["Incoterms", client.incoterms || "Ex-Works"],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 8,
                        padding: "10px 12px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 8,
                          color: T.textDim,
                          letterSpacing: "1.5px",
                          textTransform: "uppercase",
                          fontFamily: T.display,
                          marginBottom: 3,
                        }}
                      >
                        {k}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: T.textMid,
                        }}
                      >
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{ display: "flex", gap: 9, justifyContent: "flex-end" }}
              >
                <button style={S.btnGhost} onClick={() => setStep(5)}>
                  ← BACK TO COSTING
                </button>
                <button style={S.btnGhost} onClick={resetAll}>
                  🔄 NEW RFQ
                </button>
                <button style={S.btn} onClick={downloadPDF} disabled={pdfBusy}>
                  {pdfBusy ? "⏳ GENERATING..." : "📥 DOWNLOAD PDF"}
                </button>
              </div>
            </div>
          )}
        </div>
        {/* /main */}
      </div>
      {/* /layout */}

      <style>{`
        @keyframes slideIn { from{transform:translateX(20px);opacity:0} to{transform:translateX(0);opacity:1} }
        input:focus, select:focus, textarea:focus { border-color: ${T.accent} !important; box-shadow: 0 0 0 2px ${T.accent}20 !important; }
        ::-webkit-scrollbar { width:6px; height:6px }
        ::-webkit-scrollbar-track { background:${T.bg} }
        ::-webkit-scrollbar-thumb { background:${T.border}; border-radius:3px }
        ::-webkit-scrollbar-thumb:hover { background:${T.borderHi} }
        * { box-sizing:border-box }
      `}</style>
    </div>
  );
}
