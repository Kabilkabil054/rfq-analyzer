// ─────────────────────────────────────────────────────────────────────────────
// RFQ ANALYZER PRO — Open Source Edition
// Fully Responsive · Local AI Extraction · Open Source PDF Generation
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useCallback, useEffect } from "react";

// ── External fonts ─────────────────────────────────────────────────────────
(function loadDeps() {
  const font = document.createElement("link");
  font.rel = "stylesheet";
  font.href =
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap";
  document.head.appendChild(font);
})();

// ════════════════════════════════════════════════════════════════════════════
// MASTER DATA
// ════════════════════════════════════════════════════════════════════════════
const MATERIALS = [
  { name: "Mild Steel", density: 7850, ppkg: 80, color: "#3b82f6" },
  { name: "Stainless Steel 304", density: 8000, ppkg: 180, color: "#8b5cf6" },
  { name: "Aluminium 6061", density: 2700, ppkg: 250, color: "#10b981" },
  { name: "Carbon Steel", density: 7850, ppkg: 90, color: "#f59e0b" },
  { name: "Galvanized Steel", density: 7850, ppkg: 95, color: "#6b7280" },
  { name: "Brass", density: 8500, ppkg: 300, color: "#d97706" },
  { name: "Copper", density: 8960, ppkg: 450, color: "#b45309" },
  { name: "Tool Steel", density: 7750, ppkg: 350, color: "#4b5563" },
  { name: "Titanium", density: 4500, ppkg: 1200, color: "#7c3aed" },
];

const PROCESSES = [
  { name: "Laser Cutting", rate: 600, setup: 500, min_t: 0.5, max_t: 25 },
  { name: "CNC Machining", rate: 900, setup: 1000, min_t: 1, max_t: 200 },
  { name: "Bending", rate: 400, setup: 300, min_t: 0.5, max_t: 20 },
  { name: "Welding", rate: 500, setup: 400, min_t: 1, max_t: 50 },
  { name: "Grinding", rate: 300, setup: 200, min_t: 0.5, max_t: 100 },
  { name: "Plasma Cutting", rate: 350, setup: 400, min_t: 1, max_t: 60 },
  { name: "Waterjet Cutting", rate: 700, setup: 600, min_t: 0.5, max_t: 200 },
  { name: "EDM", rate: 1200, setup: 1500, min_t: 0.1, max_t: 300 },
  { name: "Turning", rate: 600, setup: 800, min_t: 5, max_t: 500 },
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
];

// ════════════════════════════════════════════════════════════════════════════
// OPEN SOURCE AI EXTRACTION (Using local NLP)
// ════════════════════════════════════════════════════════════════════════════
class LocalAIExtractor {
  // Simple rule-based extraction (works offline)
  static extractFromText(text) {
    const result = {
      client: {
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
        required_days: "",
        payment_terms: "",
        incoterms: "",
      },
      parts: [],
      order_notes: "",
    };

    // Extract email patterns
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) result.client.email = emailMatch[0];

    // Extract phone numbers (Indian format)
    const phoneMatch = text.match(
      /[\+]?[(]?[0-9]{2,3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}/,
    );
    if (phoneMatch) result.client.phone = phoneMatch[0];

    // Extract GST (Indian format)
    const gstMatch = text.match(
      /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/,
    );
    if (gstMatch) result.client.gst = gstMatch[0];

    // Extract company names (look for Pvt Ltd, Ltd, Inc, etc.)
    const companyMatch = text.match(
      /([A-Z][a-z]+ (?:Pvt Ltd|Ltd|Inc|LLC|Corp|Technologies|Engineering|Industries|Solutions))/g,
    );
    if (companyMatch && companyMatch.length > 0)
      result.client.company = companyMatch[0];

    // Extract person names (simple heuristic)
    const nameMatch = text.match(
      /(?:From|Regards|Best|Contact)[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/,
    );
    if (nameMatch) result.client.name = nameMatch[1];

    // Extract addresses
    const addressPattern = /(?:Address|Deliver to|Ship to)[:\s]+([^\n]+)/i;
    const addressMatch = text.match(addressPattern);
    if (addressMatch) result.client.address = addressMatch[1].trim();

    // Extract city names (common Indian cities)
    const cities = [
      "Mumbai",
      "Delhi",
      "Bangalore",
      "Chennai",
      "Kolkata",
      "Pune",
      "Hyderabad",
      "Ahmedabad",
    ];
    for (let city of cities) {
      if (text.includes(city)) {
        result.client.city = city;
        break;
      }
    }

    // Extract PIN codes
    const pincodeMatch = text.match(/\b\d{6}\b/);
    if (pincodeMatch) result.client.pincode = pincodeMatch[0];

    // Extract delivery days
    const daysMatch = text.match(/(\d+)[\s-]*(?:days|working days)/i);
    if (daysMatch) result.client.required_days = daysMatch[1];

    // Extract parts using pattern matching
    const lines = text.split("\n");
    let currentPart = {};

    for (let line of lines) {
      const lowerLine = line.toLowerCase();

      // Look for part indicators
      if (
        lowerLine.includes("part") ||
        lowerLine.includes("item") ||
        lowerLine.includes("component")
      ) {
        if (Object.keys(currentPart).length > 0) {
          result.parts.push(currentPart);
        }
        currentPart = {};

        // Extract part name/number
        const partNameMatch = line.match(/[Pp]art\s*[#]?\s*([A-Z0-9-]+)/);
        if (partNameMatch) currentPart.partName = partNameMatch[1];
      }

      // Extract material
      for (let material of MATERIALS) {
        if (lowerLine.includes(material.name.toLowerCase())) {
          currentPart.material = material.name;
          break;
        }
      }

      // Extract process
      for (let process of PROCESSES) {
        if (lowerLine.includes(process.name.toLowerCase())) {
          currentPart.process = process.name;
          break;
        }
      }

      // Extract dimensions (e.g., 200x100x5mm)
      const dimMatch = line.match(/(\d+)[xX*](\d+)(?:[xX*](\d+))?/);
      if (dimMatch) {
        currentPart.length = dimMatch[1];
        currentPart.width = dimMatch[2];
        if (dimMatch[3]) currentPart.thickness = dimMatch[3];
      }

      // Extract quantity
      const qtyMatch =
        line.match(/(?:qty|quantity)[:\s]*(\d+)/i) ||
        line.match(/\b(\d+)\s*(?:pcs|pieces|nos)\b/i);
      if (qtyMatch) currentPart.quantity = qtyMatch[1];

      // Extract finish
      for (let finish of FINISH_OPTIONS) {
        if (lowerLine.includes(finish.toLowerCase())) {
          currentPart.finish = finish;
          break;
        }
      }
    }

    // Add last part if exists
    if (Object.keys(currentPart).length > 0) {
      result.parts.push(currentPart);
    }

    return result;
  }

  static async extractFromPDF(base64Data) {
    // For demo, use text extraction (in production, use PDF.js)
    const text = atob(base64Data).substring(0, 5000); // Simple text extraction
    return this.extractFromText(text);
  }
}

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
        msg: `Thickness ${T}mm exceeds ${proc.name} max (${proc.max_t}mm).`,
      });
    if (T < proc.min_t)
      warns.push({
        lvl: "error",
        msg: `Thickness ${T}mm below ${proc.name} min (${proc.min_t}mm).`,
      });
  }
  if (L > 3000 || W > 1500)
    warns.push({ lvl: "warn", msg: `Oversized part (${L}×${W}mm).` });
  if (Q < 5)
    warns.push({ lvl: "info", msg: "Low quantity — setup cost impact." });
  if (Q > 1000)
    warns.push({ lvl: "info", msg: "High volume — consider bulk discount." });
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
  const qF = Math.max(1, Math.ceil(Q / 50));
  const cF = ["CNC Machining", "EDM", "Milling", "Turning"].includes(
    part.process,
  )
    ? 1.5
    : 1;

  const stages = [
    { label: "Material", days: Math.ceil(2), color: "#3b82f6" },
    {
      label: "Manufacturing",
      days: Math.max(1, Math.ceil((mhrs * qF * cF) / 8)),
      color: "#10b981",
    },
    {
      label: "Finish",
      days: Math.max(1, Math.ceil(Q / 100)),
      color: "#f59e0b",
    },
    { label: "QC & Pack", days: 1, color: "#8b5cf6" },
    { label: "Dispatch", days: 1, color: "#ec4899" },
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
  return `QT-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// ════════════════════════════════════════════════════════════════════════════
// PDF GENERATION (Browser native)
// ════════════════════════════════════════════════════════════════════════════
function generatePDF(elementId, filename) {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Create a printable version
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        body { font-family: 'Inter', sans-serif; margin: 0; padding: 20px; background: #fff; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      ${element.outerHTML}
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// ════════════════════════════════════════════════════════════════════════════
// RESPONSIVE DESIGN SYSTEM
// ════════════════════════════════════════════════════════════════════════════
const T = {
  bg: "#0a0a0a",
  surface: "#141414",
  card: "#1a1a1a",
  cardHi: "#202020",
  border: "#2a2a2a",
  borderHi: "#333333",
  accent: "#3b82f6",
  accent2: "#8b5cf6",
  green: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  text: "#ffffff",
  textMid: "#9ca3af",
  textDim: "#4b5563",
};

const S = {
  app: {
    fontFamily: "'Inter', sans-serif",
    background: T.bg,
    minHeight: "100vh",
    color: T.text,
  },
  topbar: {
    background: T.surface,
    borderBottom: `1px solid ${T.border}`,
    padding: "12px 20px",
    position: "sticky",
    top: 0,
    zIndex: 200,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: "clamp(1.2rem, 4vw, 1.5rem)",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  layout: {
    display: "flex",
    flexDirection: window.innerWidth < 768 ? "column" : "row",
    maxWidth: 1440,
    margin: "0 auto",
    padding: "0 20px 60px",
    gap: "20px",
  },
  sidebar: {
    width: window.innerWidth < 768 ? "100%" : 210,
    flexShrink: 0,
    paddingTop: 20,
  },
  main: {
    flex: 1,
    paddingTop: 20,
    minWidth: 0,
  },
  card: {
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    padding: "clamp(16px, 4vw, 22px)",
    marginBottom: 14,
  },
  cardHi: {
    background: T.cardHi,
    border: `1px solid ${T.borderHi}`,
    borderRadius: 12,
    padding: "clamp(16px, 4vw, 22px)",
    marginBottom: 14,
  },
  nav: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 14px",
    borderRadius: 8,
    cursor: "pointer",
    marginBottom: 2,
    background: active ? `${T.accent}14` : "transparent",
    border: active ? `1px solid ${T.accent}30` : "1px solid transparent",
    color: active ? T.accent : T.textMid,
    fontWeight: active ? 700 : 500,
    transition: "all .15s",
  }),
  grid: (cols) => ({
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: "clamp(8px, 2vw, 12px)",
    "@media (max-width: 640px)": {
      gridTemplateColumns: "1fr",
    },
  }),
  responsiveGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "12px",
  },
};

// ════════════════════════════════════════════════════════════════════════════
// MICRO COMPONENTS
// ════════════════════════════════════════════════════════════════════════════
function Field({ label, children, required, hint }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: T.textMid,
          marginBottom: 5,
          display: "flex",
          gap: 4,
          alignItems: "center",
        }}
      >
        {label}
        {required && <span style={{ color: T.red }}>*</span>}
        {hint && (
          <span style={{ color: T.textDim, fontSize: 9 }}>— {hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function Tag({ color = T.accent, children }) {
  return (
    <span
      style={{
        fontSize: 8,
        fontWeight: 700,
        padding: "2px 6px",
        background: `${color}18`,
        color,
        border: `1px solid ${color}35`,
        borderRadius: 4,
        textTransform: "uppercase",
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
        padding: "clamp(12px, 3vw, 16px)",
      }}
    >
      <div style={{ fontSize: "clamp(16px, 4vw, 20px)", marginBottom: 6 }}>
        {icon}
      </div>
      <div
        style={{
          fontSize: 8,
          color: T.textDim,
          letterSpacing: "1px",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "clamp(16px, 4vw, 20px)",
          fontWeight: 700,
          color,
          fontFamily: "'JetBrains Mono', monospace",
          wordBreak: "break-word",
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
          color: T.text,
          fontWeight: 600,
          fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit",
          wordBreak: "break-word",
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
        background: `${T.textDim}40`,
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
        flexWrap: "wrap",
        gap: "10px",
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: T.textDim,
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
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: 400 }}>
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
            <div style={{ width: 100, flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.text }}>
                {s.label}
              </div>
            </div>
            <div
              style={{
                flex: 1,
                background: `${T.textDim}40`,
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
                  fontWeight: 700,
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
                fontWeight: 700,
                color: T.accent,
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
            Total: <b style={{ color: T.green }}>{total} days</b>
          </span>
          {clientDays && (
            <span
              style={{
                color: total <= +clientDays ? T.green : T.red,
                fontWeight: 700,
              }}
            >
              {total <= +clientDays ? "✓ On time" : "⚠ May miss"}
            </span>
          )}
        </div>
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
  required_days: "",
  payment_terms: "50% Advance",
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
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [client, setClient] = useState(blankClient());
  const [parts, setParts] = useState([newPart()]);
  const [extras, setExtras] = useState(DEFAULT_EXTRAS.map((e) => ({ ...e })));
  const [costsArr, setCostsArr] = useState([]);
  const [ltArr, setLtArr] = useState([]);
  const [overridesArr, setOvArr] = useState([]);
  const [orderNotes, setOrderNotes] = useState("");
  const [qid] = useState(genQID);
  const [busy, setBusy] = useState(false);
  const [busyMsg, setBusyMsg] = useState("");
  const [toast, setToast] = useState(null);
  const [activePartIdx, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const co = cos[coIdx];
  const curr = CURRENCIES.find((c) => c.code === ccy) || CURRENCIES[0];

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
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

  // Open Source AI Extraction
  async function extractFromEmailText() {
    if (!emailText.trim()) {
      showToast("Paste email text first", "err");
      return;
    }
    setBusy(true);
    setBusyMsg("Local AI extracting...");

    try {
      // Simulate processing delay for realism
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const result = LocalAIExtractor.extractFromText(emailText);
      if (result.client) setClient((prev) => ({ ...prev, ...result.client }));
      if (result.parts?.length) {
        setParts(result.parts.map((p) => ({ ...newPart(), ...p })));
        setActive(0);
      }
      if (result.order_notes) setOrderNotes(result.order_notes);
      showToast(
        `✅ Extracted ${result.parts?.length || 0} part(s) locally`,
        "ok",
      );
      setStep(3);
    } catch (e) {
      showToast("⚠ Extraction failed — enter manually", "warn");
      setStep(3);
    } finally {
      setBusy(false);
      setBusyMsg("");
    }
  }

  async function extractFromFile(file) {
    setBusy(true);
    setBusyMsg(`Analysing ${file.name}...`);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const result = await LocalAIExtractor.extractFromPDF(file.base64);
      if (result.client) setClient((prev) => ({ ...prev, ...result.client }));
      if (result.parts?.length) {
        setParts(result.parts.map((p) => ({ ...newPart(), ...p })));
        setActive(0);
      }
      if (result.order_notes) setOrderNotes(result.order_notes);
      showToast(`✅ Extracted from ${file.name}`, "ok");
    } catch (e) {
      showToast(`Failed to extract from ${file.name}`, "err");
    } finally {
      setBusy(false);
      setBusyMsg("");
    }
  }

  function handleFiles(fileList) {
    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result.split(",")[1];
        setUploadedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            size: (file.size / 1024).toFixed(1) + " KB",
            type: file.name.split(".").pop().toUpperCase(),
            base64,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }

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

  function handleDownloadPDF() {
    generatePDF("quotation-content", `${qid}.pdf`);
    showToast("📥 PDF generated for printing", "ok");
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

  return (
    <div style={S.app}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            left: isMobile ? 16 : "auto",
            zIndex: 999,
            background: toast.type === "ok" ? T.green : T.red,
            color: "#000",
            padding: "10px 18px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            boxShadow: "0 8px 32px rgba(0,0,0,.5)",
            animation: "slideIn .2s ease",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Loading Overlay */}
      {busy && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.85)",
            zIndex: 500,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: T.accent,
              marginBottom: 16,
            }}
          >
            RFQ Analyzer
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
        </div>
      )}

      {/* Top Bar */}
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
          <span style={{ display: isMobile ? "none" : "inline" }}>
            RFQ Analyzer
          </span>
          <Tag color={T.accent}>Open Source</Tag>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {grandTotal > 0 && (
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                color: T.accent,
                fontWeight: 700,
              }}
            >
              {curr.sym}
              {grandTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </div>
          )}
          <button
            style={{
              background: "transparent",
              color: T.textMid,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 10,
              fontWeight: 700,
              cursor: "pointer",
            }}
            onClick={() => setStep(1)}
          >
            New
          </button>
        </div>
      </div>

      <div style={S.layout}>
        {/* Sidebar - Hidden on mobile when not needed */}
        {(!isMobile || step === 1) && (
          <div style={S.sidebar}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: T.textDim,
                padding: "14px 14px 5px",
              }}
            >
              Workflow
            </div>
            {STEPS.map((s) => (
              <div
                key={s.id}
                style={S.nav(step === s.id)}
                onClick={() => step >= s.id && setStep(s.id)}
              >
                <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>
                  {s.icon}
                </span>
                <div style={{ display: isMobile ? "none" : "block" }}>
                  <div>{s.label}</div>
                  {step > s.id && (
                    <div style={{ fontSize: 8, color: T.green }}>COMPLETE</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div style={S.main}>
          {/* Step 1: Setup */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: 22 }}>
                <div
                  style={{
                    fontSize: "clamp(24px, 6vw, 34px)",
                    fontWeight: 700,
                    color: T.text,
                  }}
                >
                  Company <span style={{ color: T.accent }}>Setup</span>
                </div>
              </div>

              <div style={S.card}>
                <SectionHead>Profile & Currency</SectionHead>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 12,
                  }}
                >
                  <Field label="Company">
                    <select
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 7,
                        padding: "9px 12px",
                        color: T.text,
                        fontSize: 13,
                        width: "100%",
                      }}
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
                  <Field label="Currency">
                    <select
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 7,
                        padding: "9px 12px",
                        color: T.text,
                        fontSize: 13,
                        width: "100%",
                      }}
                      value={ccy}
                      onChange={(e) => setCcy(e.target.value)}
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>

              <div style={S.card}>
                <SectionHead>Machine Rates (₹/hr)</SectionHead>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: 12,
                  }}
                >
                  {[
                    { k: "laser", l: "Laser" },
                    { k: "cnc", l: "CNC" },
                    { k: "bending", l: "Bending" },
                    { k: "welding", l: "Welding" },
                    { k: "grinding", l: "Grinding" },
                    { k: "labor", l: "Labor/hr" },
                  ].map(({ k, l }) => (
                    <div
                      key={k}
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 8,
                        padding: "12px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9,
                          color: T.textDim,
                          marginBottom: 5,
                        }}
                      >
                        {l}
                      </div>
                      <input
                        style={{
                          ...S.inp,
                          fontSize: 18,
                          fontWeight: 700,
                          color: T.accent,
                          background: "transparent",
                          border: "none",
                          borderBottom: `1px solid ${T.accent}`,
                          borderRadius: 0,
                          padding: "2px 0",
                          width: "100%",
                        }}
                        type="number"
                        value={co[k]}
                        onChange={(e) => setCoField(k, +e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  style={{
                    background: `linear-gradient(135deg,${T.accent},${T.accent2})`,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 22px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                  onClick={() => setStep(2)}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: RFQ Upload */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: 22 }}>
                <div
                  style={{
                    fontSize: "clamp(24px, 6vw, 34px)",
                    fontWeight: 700,
                    color: T.text,
                  }}
                >
                  RFQ <span style={{ color: T.accent }}>Input</span>
                </div>
              </div>

              {/* File Upload */}
              <div style={S.cardHi}>
                <SectionHead>📄 Upload Files (PDF/Images)</SectionHead>
                <div
                  style={{
                    border: `2px dashed ${T.accent}40`,
                    borderRadius: 10,
                    padding: "clamp(24px, 8vw, 36px)",
                    textAlign: "center",
                    cursor: "pointer",
                    background: `${T.accent}06`,
                  }}
                  onClick={() => document.getElementById("file-input").click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFiles(e.dataTransfer.files);
                  }}
                >
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📂</div>
                  <div
                    style={{
                      fontSize: "clamp(14px, 4vw, 18px)",
                      fontWeight: 700,
                      color: T.accent,
                    }}
                  >
                    Drop files here
                  </div>
                  <div style={{ fontSize: 11, color: T.textMid, marginTop: 6 }}>
                    PDF, PNG, JPG — Max 10MB
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
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
                          padding: "10px",
                          background: T.surface,
                          borderRadius: 8,
                          border: `1px solid ${T.border}`,
                          marginBottom: 6,
                          flexWrap: isMobile ? "wrap" : "nowrap",
                        }}
                      >
                        <Tag color={f.type === "PDF" ? T.accent : T.accent2}>
                          {f.type}
                        </Tag>
                        <span
                          style={{
                            flex: 1,
                            fontSize: 12,
                            color: T.text,
                            fontWeight: 600,
                            wordBreak: "break-all",
                          }}
                        >
                          {f.name}
                        </span>
                        <span style={{ fontSize: 10, color: T.textDim }}>
                          {f.size}
                        </span>
                        <button
                          style={{
                            background: T.green,
                            color: "#000",
                            border: "none",
                            borderRadius: 6,
                            padding: "5px 12px",
                            fontSize: 10,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                          onClick={() => extractFromFile(f)}
                          disabled={busy}
                        >
                          Extract
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Text Input */}
              <div style={S.card}>
                <SectionHead>📧 Paste RFQ Text</SectionHead>
                <textarea
                  style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: 7,
                    padding: "12px",
                    color: T.text,
                    fontSize: 12,
                    width: "100%",
                    minHeight: 150,
                    resize: "vertical",
                  }}
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  placeholder="Paste RFQ email here..."
                />
                <div style={{ marginTop: 12, display: "flex", gap: 9 }}>
                  <button
                    style={{
                      background: `linear-gradient(135deg,${T.accent},${T.accent2})`,
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "10px 22px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                    onClick={extractFromEmailText}
                    disabled={busy}
                  >
                    {busy ? "Extracting..." : "Extract with AI"}
                  </button>
                  <button
                    style={{
                      background: "transparent",
                      color: T.textMid,
                      border: `1px solid ${T.border}`,
                      borderRadius: 8,
                      padding: "10px 22px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                    onClick={() => setStep(3)}
                  >
                    Manual →
                  </button>
                </div>
              </div>

              <div
                style={{ display: "flex", gap: 9, justifyContent: "flex-end" }}
              >
                <button
                  style={{
                    background: "transparent",
                    color: T.textMid,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: "10px 22px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                  onClick={() => setStep(1)}
                >
                  ← Back
                </button>
                <button
                  style={{
                    background: `linear-gradient(135deg,${T.accent},${T.accent2})`,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 22px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                  onClick={() => setStep(3)}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Client Details */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom: 22 }}>
                <div
                  style={{
                    fontSize: "clamp(24px, 6vw, 34px)",
                    fontWeight: 700,
                    color: T.text,
                  }}
                >
                  Client <span style={{ color: T.accent }}>Details</span>
                </div>
              </div>

              <div style={S.card}>
                <SectionHead>Contact Information</SectionHead>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 12,
                  }}
                >
                  <Field label="Company">
                    <input
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 7,
                        padding: "9px 12px",
                        color: T.text,
                        fontSize: 13,
                        width: "100%",
                      }}
                      value={client.company}
                      onChange={(e) =>
                        setClient((p) => ({ ...p, company: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Contact Person">
                    <input
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 7,
                        padding: "9px 12px",
                        color: T.text,
                        fontSize: 13,
                        width: "100%",
                      }}
                      value={client.name}
                      onChange={(e) =>
                        setClient((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 7,
                        padding: "9px 12px",
                        color: T.text,
                        fontSize: 13,
                        width: "100%",
                      }}
                      type="email"
                      value={client.email}
                      onChange={(e) =>
                        setClient((p) => ({ ...p, email: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 7,
                        padding: "9px 12px",
                        color: T.text,
                        fontSize: 13,
                        width: "100%",
                      }}
                      value={client.phone}
                      onChange={(e) =>
                        setClient((p) => ({ ...p, phone: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="GSTIN">
                    <input
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 7,
                        padding: "9px 12px",
                        color: T.text,
                        fontSize: 13,
                        width: "100%",
                      }}
                      value={client.gst}
                      onChange={(e) =>
                        setClient((p) => ({
                          ...p,
                          gst: e.target.value.toUpperCase(),
                        }))
                      }
                    />
                  </Field>
                </div>
              </div>

              <div style={S.card}>
                <SectionHead>Address</SectionHead>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 12,
                  }}
                >
                  <Field label="Address" col2>
                    <input
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 7,
                        padding: "9px 12px",
                        color: T.text,
                        fontSize: 13,
                        width: "100%",
                      }}
                      value={client.address}
                      onChange={(e) =>
                        setClient((p) => ({ ...p, address: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="City">
                    <input
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 7,
                        padding: "9px 12px",
                        color: T.text,
                        fontSize: 13,
                        width: "100%",
                      }}
                      value={client.city}
                      onChange={(e) =>
                        setClient((p) => ({ ...p, city: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="State">
                    <input
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 7,
                        padding: "9px 12px",
                        color: T.text,
                        fontSize: 13,
                        width: "100%",
                      }}
                      value={client.state}
                      onChange={(e) =>
                        setClient((p) => ({ ...p, state: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Pincode">
                    <input
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 7,
                        padding: "9px 12px",
                        color: T.text,
                        fontSize: 13,
                        width: "100%",
                      }}
                      value={client.pincode}
                      onChange={(e) =>
                        setClient((p) => ({ ...p, pincode: e.target.value }))
                      }
                    />
                  </Field>
                </div>
              </div>

              <div style={S.card}>
                <SectionHead>Terms</SectionHead>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: 12,
                  }}
                >
                  <Field label="Delivery (days)">
                    <input
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 7,
                        padding: "9px 12px",
                        color: T.text,
                        fontSize: 13,
                        width: "100%",
                      }}
                      type="number"
                      value={client.required_days}
                      onChange={(e) =>
                        setClient((p) => ({
                          ...p,
                          required_days: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Payment Terms">
                    <select
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 7,
                        padding: "9px 12px",
                        color: T.text,
                        fontSize: 13,
                        width: "100%",
                      }}
                      value={client.payment_terms}
                      onChange={(e) =>
                        setClient((p) => ({
                          ...p,
                          payment_terms: e.target.value,
                        }))
                      }
                    >
                      <option>50% Advance</option>
                      <option>100% Advance</option>
                      <option>30 Days Credit</option>
                    </select>
                  </Field>
                  <Field label="Incoterms">
                    <select
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 7,
                        padding: "9px 12px",
                        color: T.text,
                        fontSize: 13,
                        width: "100%",
                      }}
                      value={client.incoterms}
                      onChange={(e) =>
                        setClient((p) => ({ ...p, incoterms: e.target.value }))
                      }
                    >
                      <option>Ex-Works</option>
                      <option>FOB</option>
                      <option>CIF</option>
                    </select>
                  </Field>
                </div>
              </div>

              <div
                style={{ display: "flex", gap: 9, justifyContent: "flex-end" }}
              >
                <button
                  style={{
                    background: "transparent",
                    color: T.textMid,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: "10px 22px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                  onClick={() => setStep(2)}
                >
                  ← Back
                </button>
                <button
                  style={{
                    background: `linear-gradient(135deg,${T.accent},${T.accent2})`,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 22px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                  onClick={() => setStep(4)}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Parts */}
          {step === 4 && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 22,
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(24px, 6vw, 34px)",
                    fontWeight: 700,
                    color: T.text,
                  }}
                >
                  Parts <span style={{ color: T.accent }}>& Specs</span>
                </div>
                <button
                  style={{
                    background: "transparent",
                    color: T.textMid,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                  onClick={addPart}
                >
                  + Add Part
                </button>
              </div>

              {/* Part Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginBottom: 14,
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
                    }}
                    onClick={() => setActive(i)}
                  >
                    <span style={{ fontSize: 10 }}>
                      {partValid(p) ? "✓" : "!"}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>
                      {p.partName || `Part ${i + 1}`}
                    </span>
                    {parts.length > 1 && (
                      <span
                        style={{ fontSize: 10, color: T.red, marginLeft: 2 }}
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

              {/* Part Form */}
              {parts.map((p, i) => (
                <div
                  key={p.id}
                  style={{ display: activePartIdx === i ? "block" : "none" }}
                >
                  <div style={S.card}>
                    <SectionHead>Part {i + 1} Specifications</SectionHead>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(150px, 1fr))",
                        gap: 12,
                      }}
                    >
                      <Field label="Part Name">
                        <input
                          style={{
                            background: T.surface,
                            border: `1px solid ${T.border}`,
                            borderRadius: 7,
                            padding: "9px 12px",
                            color: T.text,
                            fontSize: 13,
                            width: "100%",
                          }}
                          value={p.partName}
                          onChange={(e) =>
                            setPart(i, "partName", e.target.value)
                          }
                        />
                      </Field>
                      <Field label="Drawing No">
                        <input
                          style={{
                            background: T.surface,
                            border: `1px solid ${T.border}`,
                            borderRadius: 7,
                            padding: "9px 12px",
                            color: T.text,
                            fontSize: 13,
                            width: "100%",
                          }}
                          value={p.drawingNo}
                          onChange={(e) =>
                            setPart(i, "drawingNo", e.target.value)
                          }
                        />
                      </Field>
                      <Field label="Material" required>
                        <select
                          style={{
                            background: T.surface,
                            border: `1px solid ${T.border}`,
                            borderRadius: 7,
                            padding: "9px 12px",
                            color: T.text,
                            fontSize: 13,
                            width: "100%",
                          }}
                          value={p.material}
                          onChange={(e) =>
                            setPart(i, "material", e.target.value)
                          }
                        >
                          <option value="">Select</option>
                          {MATERIALS.map((m) => (
                            <option key={m.name}>{m.name}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Process" required>
                        <select
                          style={{
                            background: T.surface,
                            border: `1px solid ${T.border}`,
                            borderRadius: 7,
                            padding: "9px 12px",
                            color: T.text,
                            fontSize: 13,
                            width: "100%",
                          }}
                          value={p.process}
                          onChange={(e) =>
                            setPart(i, "process", e.target.value)
                          }
                        >
                          <option value="">Select</option>
                          {PROCESSES.map((pr) => (
                            <option key={pr.name}>{pr.name}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Thickness (mm)" required>
                        <input
                          style={{
                            background: T.surface,
                            border: `1px solid ${T.border}`,
                            borderRadius: 7,
                            padding: "9px 12px",
                            color: T.text,
                            fontSize: 13,
                            width: "100%",
                          }}
                          type="number"
                          value={p.thickness}
                          onChange={(e) =>
                            setPart(i, "thickness", e.target.value)
                          }
                        />
                      </Field>
                      <Field label="Length (mm)" required>
                        <input
                          style={{
                            background: T.surface,
                            border: `1px solid ${T.border}`,
                            borderRadius: 7,
                            padding: "9px 12px",
                            color: T.text,
                            fontSize: 13,
                            width: "100%",
                          }}
                          type="number"
                          value={p.length}
                          onChange={(e) => setPart(i, "length", e.target.value)}
                        />
                      </Field>
                      <Field label="Width (mm)" required>
                        <input
                          style={{
                            background: T.surface,
                            border: `1px solid ${T.border}`,
                            borderRadius: 7,
                            padding: "9px 12px",
                            color: T.text,
                            fontSize: 13,
                            width: "100%",
                          }}
                          type="number"
                          value={p.width}
                          onChange={(e) => setPart(i, "width", e.target.value)}
                        />
                      </Field>
                      <Field label="Quantity" required>
                        <input
                          style={{
                            background: T.surface,
                            border: `1px solid ${T.border}`,
                            borderRadius: 7,
                            padding: "9px 12px",
                            color: T.text,
                            fontSize: 13,
                            width: "100%",
                          }}
                          type="number"
                          value={p.quantity}
                          onChange={(e) =>
                            setPart(i, "quantity", e.target.value)
                          }
                        />
                      </Field>
                      <Field label="Finish">
                        <select
                          style={{
                            background: T.surface,
                            border: `1px solid ${T.border}`,
                            borderRadius: 7,
                            padding: "9px 12px",
                            color: T.text,
                            fontSize: 13,
                            width: "100%",
                          }}
                          value={p.finish}
                          onChange={(e) => setPart(i, "finish", e.target.value)}
                        >
                          <option value="">Select</option>
                          {FINISH_OPTIONS.map((f) => (
                            <option key={f}>{f}</option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    {/* Feasibility Check */}
                    {partValid(p) &&
                      (() => {
                        const f = calcFeasibility(p);
                        return (
                          <div
                            style={{
                              marginTop: 14,
                              padding: "12px",
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
                                  fontWeight: 700,
                                  color: f.score === 100 ? T.green : T.amber,
                                }}
                              >
                                FEASIBILITY — {f.complexity}
                              </div>
                              <div
                                style={{
                                  flex: 1,
                                  height: 4,
                                  background: `${T.textDim}40`,
                                  borderRadius: 2,
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
                                        : T.textMid,
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
                          </div>
                        );
                      })()}
                  </div>
                </div>
              ))}

              <div
                style={{ display: "flex", gap: 9, justifyContent: "flex-end" }}
              >
                <button
                  style={{
                    background: "transparent",
                    color: T.textMid,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: "10px 22px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                  onClick={() => setStep(3)}
                >
                  ← Back
                </button>
                <button
                  style={{
                    background: allValid
                      ? `linear-gradient(135deg,${T.accent},${T.accent2})`
                      : T.textDim,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 22px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: allValid ? "pointer" : "not-allowed",
                    opacity: allValid ? 1 : 0.5,
                  }}
                  onClick={allValid ? runAll : undefined}
                >
                  Calculate Costs →
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Costing */}
          {step === 5 && costsArr.length > 0 && (
            <div>
              <div style={{ marginBottom: 22 }}>
                <div
                  style={{
                    fontSize: "clamp(24px, 6vw, 34px)",
                    fontWeight: 700,
                    color: T.text,
                  }}
                >
                  Cost <span style={{ color: T.accent }}>Analysis</span>
                </div>
              </div>

              {/* KPIs */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <Stat
                  icon="💰"
                  label="Grand Total"
                  value={`${curr.sym}${grandTotal.toFixed(0)}`}
                  color={T.accent}
                />
                <Stat
                  icon="🔩"
                  label="Parts"
                  value={`${parts.length}`}
                  color={T.accent2}
                />
                <Stat
                  icon="📅"
                  label="Lead Time"
                  value={
                    ltArr.length
                      ? `${Math.max(...ltArr.filter(Boolean).map((l) => l.total))}d`
                      : "—"
                  }
                  color={T.green}
                />
                <Stat
                  icon="🏭"
                  label="Subtotal"
                  value={`${curr.sym}${partSubtotal.toFixed(0)}`}
                  color={T.amber}
                />
              </div>

              {/* Part Tabs */}
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
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                      onClick={() => setActive(i)}
                    >
                      {p.partName || `Part ${i + 1}`}
                    </button>
                  );
                })}
              </div>

              {/* Cost Breakdown */}
              {parts.map((p, i) => {
                const dc = displayCost(i);
                if (!dc) return null;
                const lt = ltArr[i];

                return (
                  <div
                    key={p.id}
                    style={{ display: activePartIdx === i ? "block" : "none" }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1fr",
                        gap: 14,
                      }}
                    >
                      <div>
                        <div style={S.card}>
                          <SectionHead>Cost Breakdown</SectionHead>
                          {[
                            { k: "material", l: "Material", v: dc.material },
                            { k: "machine", l: "Machining", v: dc.machine },
                            { k: "labor", l: "Labor", v: dc.labor },
                            { k: "setup", l: "Setup", v: dc.setup },
                            { k: "finishing", l: "Finish", v: dc.finishing },
                            { k: "packaging", l: "Packaging", v: dc.packaging },
                            { k: "transport", l: "Transport", v: dc.transport },
                            { k: "profit", l: "Profit", v: dc.profit },
                          ].map((row) => (
                            <KV
                              key={row.k}
                              label={row.l}
                              value={`${curr.sym}${row.v.toFixed(2)}`}
                              mono
                            />
                          ))}
                          <div
                            style={{
                              marginTop: 10,
                              paddingTop: 10,
                              borderTop: `1px solid ${T.border}`,
                              display: "flex",
                              justifyContent: "space-between",
                              fontWeight: 700,
                              fontSize: 16,
                              color: T.accent,
                            }}
                          >
                            <span>Total ({p.quantity} pcs)</span>
                            <span>
                              {curr.sym}
                              {dc.total.toFixed(2)}
                            </span>
                          </div>
                        </div>

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
                        <div style={S.card}>
                          <SectionHead>Part Details</SectionHead>
                          <KV label="Material" value={p.material} />
                          <KV label="Process" value={p.process} />
                          <KV
                            label="Dimensions"
                            value={`${p.length}×${p.width}×${p.thickness}mm`}
                          />
                          <KV
                            label="Weight"
                            value={`${dc.weight.toFixed(3)} kg`}
                          />
                          <KV label="Quantity" value={`${p.quantity} pcs`} />
                          {p.finish && <KV label="Finish" value={p.finish} />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Additional Charges */}
              <div style={S.card}>
                <SectionHead>➕ Additional Charges</SectionHead>
                {extras.map((ex, i) => (
                  <div
                    key={ex.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile
                        ? "1fr"
                        : "auto 1fr 100px 100px 40px",
                      gap: 8,
                      alignItems: "center",
                      marginBottom: 8,
                      padding: "10px",
                      background: ex.enabled ? `${T.accent}06` : T.surface,
                      border: `1px solid ${ex.enabled ? T.borderHi : T.border}`,
                      borderRadius: 8,
                    }}
                  >
                    {/* Toggle */}
                    <div
                      style={{
                        width: 32,
                        height: 18,
                        background: ex.enabled ? T.accent : `${T.textDim}40`,
                        borderRadius: 9,
                        cursor: ex.locked ? "not-allowed" : "pointer",
                        position: "relative",
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
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 7,
                        padding: "8px",
                        color: T.text,
                        fontSize: 12,
                        width: "100%",
                      }}
                      value={ex.label}
                      onChange={(e) =>
                        setExtras((prev) =>
                          prev.map((e2, j) =>
                            j === i ? { ...e2, label: e.target.value } : e2,
                          ),
                        )
                      }
                      placeholder="Charge label"
                    />

                    {/* Value */}
                    <input
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 7,
                        padding: "8px",
                        color: T.text,
                        fontSize: 12,
                        width: "100%",
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
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 7,
                        padding: "8px",
                        color: T.text,
                        fontSize: 12,
                        width: "100%",
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
                      <option value="percent">%</option>
                      <option value="fixed">Fixed</option>
                    </select>

                    {/* Delete */}
                    {!ex.locked && (
                      <button
                        style={{
                          background: "transparent",
                          border: "none",
                          color: T.red,
                          cursor: "pointer",
                          fontSize: 14,
                        }}
                        onClick={() =>
                          setExtras((prev) => prev.filter((_, j) => j !== i))
                        }
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  style={{
                    background: "transparent",
                    color: T.textMid,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    marginTop: 8,
                  }}
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
                  + Add Charge
                </button>

                {/* Grand Total */}
                <div
                  style={{
                    marginTop: 16,
                    padding: "16px",
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
                      marginBottom: 6,
                    }}
                  >
                    <span>Parts Subtotal</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
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
                        marginBottom: 4,
                      }}
                    >
                      <span>{e.label}</span>
                      <span
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
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
                      fontSize: 18,
                      fontWeight: 700,
                      color: T.accent,
                    }}
                  >
                    <span>GRAND TOTAL</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {curr.sym}
                      {grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{ display: "flex", gap: 9, justifyContent: "flex-end" }}
              >
                <button
                  style={{
                    background: "transparent",
                    color: T.textMid,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: "10px 22px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                  onClick={() => setStep(4)}
                >
                  ← Back
                </button>
                <button
                  style={{
                    background: `linear-gradient(135deg,${T.accent},${T.accent2})`,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 22px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                  onClick={() => setStep(6)}
                >
                  Generate Quotation →
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Quotation */}
          {step === 6 && costsArr.length > 0 && (
            <div>
              <div style={{ marginBottom: 22 }}>
                <div
                  style={{
                    fontSize: "clamp(24px, 6vw, 34px)",
                    fontWeight: 700,
                    color: T.text,
                  }}
                >
                  Final <span style={{ color: T.accent }}>Quotation</span>
                </div>
              </div>

              {/* Quotation Content */}
              <div id="quotation-content">
                <div style={S.cardHi}>
                  <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <div
                      style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}
                    >
                      RFQ Analyzer
                    </div>
                    <div style={{ fontSize: 14, color: T.textMid }}>{qid}</div>
                  </div>

                  {/* Client Info */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: 20,
                      marginBottom: 20,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: T.textDim,
                          marginBottom: 4,
                        }}
                      >
                        BILL TO
                      </div>
                      <div style={{ fontWeight: 700 }}>
                        {client.company || client.name || "Client"}
                      </div>
                      {client.email && (
                        <div style={{ fontSize: 12, color: T.textMid }}>
                          {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div style={{ fontSize: 12, color: T.textMid }}>
                          {client.phone}
                        </div>
                      )}
                      {client.gst && (
                        <div style={{ fontSize: 11, color: T.textMid }}>
                          GST: {client.gst}
                        </div>
                      )}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: T.textDim,
                          marginBottom: 4,
                        }}
                      >
                        SHIP TO
                      </div>
                      {client.address && (
                        <div style={{ fontSize: 12, color: T.textMid }}>
                          {client.address}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: T.textMid }}>
                        {[client.city, client.state, client.pincode]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </div>
                  </div>

                  {/* Parts Table */}
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
                          <th
                            style={{
                              padding: "10px",
                              textAlign: "left",
                              color: T.textDim,
                            }}
                          >
                            Part
                          </th>
                          <th
                            style={{
                              padding: "10px",
                              textAlign: "left",
                              color: T.textDim,
                            }}
                          >
                            Material
                          </th>
                          <th
                            style={{
                              padding: "10px",
                              textAlign: "center",
                              color: T.textDim,
                            }}
                          >
                            Qty
                          </th>
                          <th
                            style={{
                              padding: "10px",
                              textAlign: "right",
                              color: T.textDim,
                            }}
                          >
                            Unit Price
                          </th>
                          <th
                            style={{
                              padding: "10px",
                              textAlign: "right",
                              color: T.textDim,
                            }}
                          >
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {parts.map((p, i) => {
                          const dc = displayCost(i);
                          if (!dc) return null;
                          return (
                            <tr
                              key={p.id}
                              style={{ borderBottom: `1px solid ${T.border}` }}
                            >
                              <td style={{ padding: "10px" }}>
                                <div style={{ fontWeight: 700 }}>
                                  {p.partName || `Part ${i + 1}`}
                                </div>
                                {p.drawingNo && (
                                  <div
                                    style={{ fontSize: 10, color: T.textDim }}
                                  >
                                    {p.drawingNo}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: "10px" }}>
                                <div>{p.material}</div>
                                <div style={{ fontSize: 10, color: T.textDim }}>
                                  {p.process}
                                </div>
                              </td>
                              <td
                                style={{ padding: "10px", textAlign: "center" }}
                              >
                                {p.quantity}
                              </td>
                              <td
                                style={{
                                  padding: "10px",
                                  textAlign: "right",
                                  fontFamily: "'JetBrains Mono', monospace",
                                }}
                              >
                                {curr.sym}
                                {dc.per_part.toFixed(2)}
                              </td>
                              <td
                                style={{
                                  padding: "10px",
                                  textAlign: "right",
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontWeight: 700,
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
                          <tr key={e.id}>
                            <td
                              colSpan={4}
                              style={{
                                padding: "10px",
                                textAlign: "right",
                                color: T.textMid,
                              }}
                            >
                              {e.label}
                            </td>
                            <td
                              style={{
                                padding: "10px",
                                textAlign: "right",
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              {curr.sym}
                              {e.computed.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td
                            colSpan={4}
                            style={{
                              padding: "15px 10px",
                              textAlign: "right",
                              fontWeight: 700,
                              fontSize: 16,
                            }}
                          >
                            GRAND TOTAL
                          </td>
                          <td
                            style={{
                              padding: "15px 10px",
                              textAlign: "right",
                              fontWeight: 700,
                              fontSize: 18,
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

                  {/* Terms */}
                  <div
                    style={{
                      marginTop: 20,
                      padding: "16px",
                      background: T.surface,
                      borderRadius: 8,
                      fontSize: 11,
                      color: T.textMid,
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>
                      Terms & Conditions:
                    </div>
                    <div>
                      • Payment: {client.payment_terms || "50% Advance"}
                    </div>
                    <div>
                      • Delivery:{" "}
                      {ltArr.length
                        ? `${Math.max(...ltArr.filter(Boolean).map((l) => l.total))} working days`
                        : "TBD"}
                    </div>
                    <div>• Validity: 30 days from date</div>
                    <div>• Incoterms: {client.incoterms || "Ex-Works"}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: 9,
                  justifyContent: "flex-end",
                  marginTop: 20,
                }}
              >
                <button
                  style={{
                    background: "transparent",
                    color: T.textMid,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: "10px 22px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                  onClick={() => setStep(5)}
                >
                  ← Back
                </button>
                <button
                  style={{
                    background: `linear-gradient(135deg,${T.green},${T.green}80)`,
                    color: "#000",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 22px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                  onClick={handleDownloadPDF}
                >
                  📥 Print/Save PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        input:focus, select:focus, textarea:focus {
          border-color: ${T.accent} !important;
          outline: none;
        }

        * {
          box-sizing: border-box;
          margin: 0;
        }

        @media print {
          .no-print {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
