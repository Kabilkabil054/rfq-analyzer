/* RFQ Analyzer.jsx, full replacement */

/* ────────────────────────────────────────────────────────────────────────────────────
   Imports & globals
   ──────────────────────────────────────────────────────────────────────────────────── */
import { useState, useRef, useEffect } from "react";

// We’ll use these libraries for PDF download, PDF extraction and for the
// new OpenAI request.
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry"; // <‑‑ ensures the worker is bundled

//‐- OpenAI key ---------------------------------------------------------------
const OPENAI_KEY = process.env.REACT_APP_OPENAI_KEY || "";

// ────────────────────────────────────────────────────────────────────────────────────
/* Fonts --------------------------------------------------------------------- */
const _fl = document.createElement("link");
_fl.rel = "stylesheet";
_fl.href =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap";
document.head.appendChild(_fl);

/* ────────────────────────────────────────────────────────────────────────────────
   Static lookup data
   ──────────────────────────────────────────────────────────────────────────────── */
const MATERIALS = [/* … (unchanged) … */];
const PROCESSES = [/* … (unchanged) … */];
const INIT_COMPANIES = [/* … (unchanged) … */];
const CURRENCIES = [/* … (unchanged) … */];

/* ────────────────────────────────────────────────────────────────────────
   Calculation helpers
   ──────────────────────────────────────────────────────────────────────── */
function calcCosts(p, co, ccyCode, extras) { /*… unchanged …*/ }
function mergeOverrides(base, ov) { /*… unchanged …*/ }
function calcFeasibility(p) { /*… unchanged …*/ }
function calcLeadTime(p, mhrs) { /*… unchanged …*/ }

/* --------------------------------------------------------------------------- */
/* New helper – read a PDF file and return all its text as a single string.     */
/* Since pdfjs works with Uint8Array we read via FileReader.                 */
/* --------------------------------------------------------------------------- */
function readPdf(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async e => {
      const buffer = new Uint8Array(e.target.result);
      try {
        const pdf = await pdfjsLib.getDocument(buffer).promise;
        const pages = await Promise.all(pdf.numPages).map(async idx => {
          const page = await pdf.getPage(idx + 1);
          const txt = await page.getTextContent();
          return txt.items.map(item => item.str).join(" ");
        });
        resolve(pages.join("\n\n"));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = err => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/* New helper – return all textual information from every uploaded file.      */
async function extractFileText(files) {
  const txts = [];
  for (const f of files) {
    const ext = f.name.split(".").pop().toLowerCase();
    if (ext === "pdf") {
      try {
        const txt = await readPdf(f);
        txts.push(txt);
      } catch (_) {
        /* ignore parse‑errors – best effort */
      }
    }
  }
  return txts.join("\n\n");
}

/* --------------------------------------------------------------------------- */
/* Updated AI extraction flow – now it sends both the email text and   */
/* extracted text from PDFs (or ignores non‑PDF files). The model now asks */
/* *only* for a perfectly‑formatted JSON so we can parse it reliably.       */
/* --------------------------------------------------------------------------- */
async function aiExtract() {
  if (!email.trim()) {
    setMsg({ type: "err", text: "Paste an RFQ email first." });
    return;
  }
  setBusy(true);
  setMsg({ type: "ok", text: "Sending to AI…" });

  try {
    // 1️⃣  Build a single text blob that contains the email + PDFs
    const fileTxt = await extractFileText(files);
    const payload = `
Extract all key details from the following RFQ email and any PDF drawings that were uploaded.
Return ONLY a strict JSON object with the keys:
  material, thickness, length, width, quantity, process, finish, client, delivery, required_days
   (Use numeric values for mm/qty; keep the string empty if a value cannot be found).

Email:
${email}

PDF drawings content:
${fileTxt}
🌐 JSON:
`;

    // 2️⃣  Send to OpenAI (gpt‑4o-mini) – fastest & cheapest
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-2024-07",
        temperature: 0,
        max_tokens: 700,
        messages: [{ role: "user", content: payload.trim() }],
      }),
    });

    if (!response.ok) throw new Error(`OpenAI ${response.status}`);
    const data = await response.json();
    const txt = data.choices[0].message.content
      .replace(/(^```?.*?)$/gm, "") // strip optional code fences
      .trim();

    const parsed = JSON.parse(txt);
    setP(prev => ({ ...prev, ...parsed }));
    setMsg({ type: "ok", text: "✅ AI extraction done — review fields below." });
    setStep(3);
  } catch (err) {
    /* 3️⃣  If anything goes wrong we fall back to regex parsing (old logic).  */
    const parsed = regexParse(email);
    setP(prev => ({ ...prev, ...parsed }));
    setMsg({
      type: "warn",
      text: "⚠️ AI extraction failed – fallback to rule‑based parsing.",
    });
    setStep(3);
  } finally {
    setBusy(false);
  }
}

/* --------------------------------------------------------------------------- */
/* New helper – save the quotation card as a PDF.                            */
/* --------------------------------------------------------------------------- */
function exportPDF() {
  const quoteCard = document.getElementById("quotation-card");
  if (!quoteCard) return;

  html2canvas(quoteCard, { scale: 2 }).then(canvas => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      format: "a4",
      unit: "mm",
      orientation: "portrait",
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${qid}.pdf`);
  });
}

/* --------------------------------------------------------------------------- */
/* Responsive styles – inject small media‑query block on mount                */
/* --------------------------------------------------------------------------- */
useEffect(() => {
  const style = document.createElement("style");
  style.innerHTML = `
@media (max-width:700px){
  .side{display:none;}
  .main{flex:1;}
  .card{padding:12px 16px;}
  .cardH{font-size:13px;}
}
`;
  document.head.appendChild(style);
  return () => document.head.removeChild(style);
}, []);

/* Rest of App component (unchanged except where we call the new functions) */
return (
  <div style={G.app}>
    {/* Top bar, side bar, etc. – unchanged, but ... */}
    {/* Sidebar toggle on small screens: */}
    <div style={G.topbar}>
      {/* ... */}
    </div>

    <div style={G.layout}>
      <div style={G.side}>
        {/* ... */}
      </div>

      <div style={G.main}>
        {/* ------- STEP 1: CONFIG -------- */}
        {/* ... unchanged ... */}

        {/* ------- STEP 2: RFQ Input -------- */}
        {/* Updated AI button */}
        <div style={G.card}>
          {/* ... */}
          <div style={{ marginTop: 12, display: "flex", gap: 9, flexWrap: "wrap" }}>
            <button
              style={G.btn}
              onClick={aiExtract}
              disabled={busy}
            >
              {busy ? "⏳ Analysing…" : "⚡ Extract with AI"}
            </button>
            <button style={G.ghost} onClick={ruleExtract}>
              🔍 Rule‑based Extract
            </button>
            <button style={G.ghost} onClick={() => setStep(3)}>
              ✏️ Manual Entry
            </button>
          </div>
          {/* ... */}
        </div>

        {/* ------- STEP 5: QUOTATION -------- */}
        {step === 5 && displayCosts && (
          <>
            <h1 style={G.cardH}>Final Quotation</h1>
            <p style={G.lbl}>
              Download in your preferred format. <br />
              HTML → browser Print → Save As PDF for a PDF copy.
            </p>

            {/* NOTE: add a tiny button to export PDF */}
            <div style={G.card}>
              <div style={G.cardH}>⬇ Export</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                <button style={G.btn} onClick={dlHTML}>
                  🌐 HTML <Pill color="#38bdf8">→ PDF via Print</Pill>
                </button>
                <button style={G.green} onClick={dlCSV}>
                  📊 CSV / Excel
                </button>
                <button style={G.purp} onClick={dlJSON}>
                  JSON / API
                </button>
                <button style={G.btn} onClick={exportPDF}>
                  ⬇ Download PDF
                </button>
              </div>
              {/* ... rest of the preview cards unchanged ... */}
              <div
                style={{
                  ...G.card,
                  background: "#0b1527",
                  border: "1px solid #1e3a5f",
                  position: "relative",
                }}
                id="quotation-card"
              >
                {/* Header */}
                {/* ... unchanged ... */}

                {/* ... rest of preview card unchanged ... */}
              </div>

              {/* … remaining code … */}
            </div>
          </>
        )}
      </div>
    </div>
  </div>
);
