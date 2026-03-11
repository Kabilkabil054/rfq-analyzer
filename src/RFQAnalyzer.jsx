/* RFQAnalyzer.jsx –  V3.1 (drop‑in replacement)  */

// ── 1️⃣ Imports ---------------------------------------------------------
import { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";

const OPENAI_KEY = process.env.REACT_APP_OPENAI_KEY || "";

// ── 2️⃣ Font injection ----------------------------------------------------
const _fl = document.createElement("link");
_fl.rel = "stylesheet";
_fl.href =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap";
document.head.appendChild(_fl);

// ── 3️⃣ Static data ------------------------------------------------------
const MATERIALS = [
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
const PROCESSES = [
  { name:"Laser Cutting",    rate:600,  setup:500,  min_t:0.5, max_t:25  },
  { name:"CNC Machining",    rate:900,  setup:1000, min_t:1,   max_t:200 },
  { name:"Bending",          rate:400,  setup:300,  min_t:0.5, max_t:20  },
  { name:"Welding",          rate:500,  setup:400,  min_t:1,   max_t:50  },
  { name:"Grinding",         rate:300,  setup:200,  min_t:0.5, max_t:100 },
  { name:"Plasma Cutting",   rate:350,  setup:400,  min_t:1,   max_t:60  },
  { name:"Waterjet Cutting", rate:700,  setup:600,  min_t:0.5, max_t:200 },
  { name:"EDM",              rate:1200, setup:1500, min_t:0.1, max_t:300 },
  { name:"Turning",          rate:600,  setup:800,  min_t:5,   max_t:500 },
  { name:"Milling",          rate:750,  setup:900,  min_t:1,   max_t:300 },
];
const INIT_COMPANIES = [
  { name:"DFAB",             laser:600,  cnc:900,  bending:400, welding:500, grinding:300, labor:150, finishing:50, packaging:40, transport:100, margin:0.20 },
  { name:"AlphaFabrication", laser:550,  cnc:850,  bending:380, welding:480, grinding:280, labor:140, finishing:45, packaging:35, transport:90,  margin:0.18 },
  { name:"PrecisionWorks",   laser:700,  cnc:1100, bending:450, welding:600, grinding:350, labor:180, finishing:60, packaging:50, transport:120, margin:0.25 },
  { name:"GlobalMetal",      laser:500,  cnc:800,  bending:350, welding:450, grinding:250, labor:130, finishing:40, packaging:30, transport:80,  margin:0.15 },
  { name:"MetalCraft",       laser:620,  cnc:950,  bending:420, welding:520, grinding:310, labor:160, finishing:55, packaging:45, transport:110, margin:0.22 },
  { name:"Custom",           laser:600,  cnc:900,  bending:400, welding:500, grinding:300, labor:150, finishing:50, packaging:40, transport:100, margin:0.20 },
];
const CURRENCIES = [
  { code:"INR", sym:"₹",   rate:1     },
  { code:"USD", sym:"$",   rate:83.5  },
  { code:"EUR", sym:"€",   rate:91.2  },
  { code:"GBP", sym:"£",   rate:106.3 },
  { code:"AED", sym:"د.إ", rate:22.7  },
];

// ── 4️⃣ Core helpers ----------------------------------------------------
function calcCosts(p, co, ccyCode, extras) {
  const mat  = MATERIALS.find(m => m.name === p.material) || MATERIALS[0];
  const proc = PROCESSES.find(x => x.name === p.process)  || PROCESSES[0];
  const ccy  = CURRENCIES.find(c => c.code === ccyCode)    || CURRENCIES[0];
  const L = +p.length || 200, W = +p.width || 100, T = +p.thickness || 5, Q = +p.quantity || 1;

  const wt   = (L/1000)*(W/1000)*(T/1000)*mat.density;
  const mINR = wt * mat.ppkg;

  const rateMap = {
    "laser cutting":co.laser, "cnc machining":co.cnc, "bending":co.bending,
    "welding":co.welding, "grinding":co.grinding,
    "plasma cutting":co.laser*0.6, "waterjet cutting":co.laser*1.2,
    "edm":co.cnc*1.3, "turning":co.cnc*0.7, "milling":co.cnc*0.85,
  };
  const mrate = rateMap[proc.name.toLowerCase()] || co.laser;
  const mhrs  = Math.max(0.25, (L/1000)*(W/1000)*2.5 + T*0.02);

  const machINR  = mhrs * mrate;
  const labINR   = mhrs * 0.8 * co.labor;
  const setupINR = proc.setup;
  const finINR   = co.finishing * Q;
  const pkgINR   = co.packaging;
  const trINR    = co.transport;
  const exINR    = (extras||[]).reduce((s,c)=>s+(+c.amount||0),0);

  const sub    = (mINR+machINR+labINR+setupINR/Math.max(Q,1)+co.finishing)*Q + pkgINR+trINR+exINR;
  const profINR= sub * co.margin;
  const totINR = sub + profINR;
  const cv = v => v / ccy.rate;

  return {
    material:cv(mINR), machine:cv(machINR), labor:cv(labINR),
    setup:cv(setupINR), finishing:cv(finINR), packaging:cv(pkgINR),
    transport:cv(trINR), extra:cv(exINR), profit:cv(profINR),
    total:cv(totINR), per_part:cv(totINR/Q),
    weight:wt, mhrs, ccy, mat, proc,
  };
}

function mergeOverrides(base, ov) {
  if (!ov) return base;
  const m = { ...base };
  for (const k of ["material","machine","labor","setup","finishing","packaging","transport","extra","profit"]) {
    if (ov[k] !== undefined) m[k] = ov[k];
  }
  m.total = m.material+m.machine+m.labor+m.setup+m.finishing+m.packaging+m.transport+m.extra+m.profit;
  m.per_part = m.total / Math.max(1, m._qty||1);
  return m;
}

function calcFeasibility(p) {
  const proc = PROCESSES.find(x => x.name === p.process);
  const T = +p.thickness, L = +p.length, W = +p.width, Q = +p.quantity;
  const w = [];
  if (proc) {
    if (T > proc.max_t)
      w.push({lvl: "error", msg: `Thickness ${T}mm exceeds max for ${proc.name} (${proc.max_t}mm) — use Plasma/Waterjet.`});
    if (T < proc.min_t)
      w.push({lvl: "error", msg: `Thickness ${T}mm below min for ${proc.name} (${proc.min_t}mm) — warping risk.`});
  }
  if ((p.material||"").toLowerCase().includes("titanium"))
    w.push({lvl: "warn", msg: "Titanium needs specialised tooling — budget extra lead time."});
  if (L>3000||W>1500)
    w.push({lvl: "warn", msg: `Part ${L}×${W}mm is oversized — verify machine-bed capacity.`});
  if (Q<5)
    w.push({lvl: "info", msg:"Low quantity — setup cost is high per piece."});
  if (Q>1000)
    w.push({lvl:"info", msg:"High volume — ask for bulk discount."});
  if ((p.finish||"").match(/mirror|polish/i))
    w.push({lvl:"warn", msg:"Mirror/polish finish adds ~20% cost & lead time."});
  const errs = w.filter(x=>x.lvl==="error").length,
        warns = w.filter(x=>x.lvl==="warn").length;
  return {warnings:w, complexity:errs>0?"High":warns>1?"Medium":"Low"};
}

function calcLeadTime(p, mhrs) {
  const Q = +p.quantity||1, T = +p.thickness||5;
  const qF = Math.max(1, Math.ceil(Q/50));
  const tF = T>20?1.5:T>10?1.2:1;
  const complex = ["CNC Machining","EDM","Milling","Turning"].includes(p.process);
  const cF = complex ? 1.5 : 1;
  const noFinish = !p.finish || ["raw","none","standard",""].includes((p.finish||"").toLowerCase());

  const raw = [
    { icon:"📋", label:"Order Confirmation",       days:1,                                      color:"#38bdf8", desc:"PO review, drawing sign-off, material check"              },
    { icon:"🏭", label:"Raw Material Procurement", days:Math.ceil((T>15?3:2)*tF),               color:"#8b5cf6", desc:"Source & receive raw stock from approved suppliers"       },
    { icon:"⚙️", label:"Machine Setup",            days:Math.ceil(cF),                          color:"#f59e0b", desc:`${p.process||"Process"} setup, tooling & NC programming`  },
    { icon:"🔩", label:"Manufacturing",            days:Math.max(1,Math.ceil(mhrs*qF*cF/8)),    color:"#10b981", desc:`${p.process||""} of ${Q} pcs — ~${(mhrs*Q).toFixed(1)} machine-hrs` },
    { icon:"🔍", label:"Quality Inspection",       days:Math.max(1,Math.ceil(Q/200)),            color:"#06b6d4", desc:"Dimensional & surface checks, first-article report"       },
    ...(!noFinish ? [{ icon:"✨", label:"Surface Finishing", days:Math.max(1,Math.ceil(Q/100)), color:"#ec4899", desc:`${p.finish} — in-house or outsourced` }] : []),
    { icon:"📦", label:"Packing & Dispatch",       days:1,                                      color:"#84cc16", desc:"Pack, label, book courier/freight"                        },
  ];

  let cum=0;
  const schedule = raw.map(s=>{ const st=cum+1; cum+=s.days; return {...s,start:st,end:cum}; });
  return { schedule, total:cum };
}

function regexParse(txt) {
  const g=(pats)=>{for(const p of pats){const m=txt.match(p);if(m)return m[1]?.trim()||"";}return "";};
  let mat="",proc="";
  for(const m of MATERIALS){if(txt.toLowerCase().includes(m.name.toLowerCase())){mat=m.name;break;}}
  for(const p of PROCESSES){if(txt.toLowerCase().includes(p.name.toLowerCase())){proc=p.name;break;}}
  const sz=txt.match(/([0-9.]+)\s*[x×*]\s*([0-9.]+)\s*mm/i)||txt.match(/(?:size)[:\s]+([0-9.]+)\s*[x×*]\s*([0-9.]+)/i);
  const qty=g([/(?:quantity|qty)[:\s]+([0-9,]+)/i,/([0-9,]+)\s*(?:pcs|pieces|nos|units)/i]).replace(/,/g,"");
  const rd=g([/(?:required|deliver(?:y|ed)?)\s*(?:within|in)[:\s]+([0-9]+)\s*(?:days?|working)/i,/within\s+([0-9]+)\s*(?:days?|working)/i]);
  return {material:mat,process:proc, thickness:g([/thickness[:\s]+([0-9.]+)\s*mm/i,/([0-9.]+)\s*mm\s*thick/i]), length:sz?sz[1]:g([/length[:\s]+([0-9.]+)/i]), width:sz?sz[2]:g([/width[:\s]+([0-9.]+)/i]), quantity:qty, finish:g([/(?:finish|surface|coating)[:\s]+([A-Za-z\s\-]+?)(?:\n|$)/i]), client:g([/(?:from|client|company)[:\s]+([A-Za-z\s&.,]+?)(?:\n|,|$)/i,/dear\s+([A-Za-z\s]+)/i]), delivery:g([/delivery\s*(?:location)?[:\s]+([A-Za-z\s,]+?)(?:\n|$)/i]), required_days:rd,};
}

function genQID() {
  const d=new Date();
  return `QT-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${Math.floor(1000+Math.random()*9000)}`;
}

// ── 5️⃣ PDF extraction helper ----------------------------------------------
async function readPdf(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async e => {
      const buffer = new Uint8Array(e.target.result);
      try {
        const pdf = await pdfjsLib.getDocument(buffer).promise;
        const pages = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const txt = await page.getTextContent();
          const pageText = txt.items.map(it => it.str).join(" ");
          pages.push(pageText);
        }
        resolve(pages.join("\n\n"));
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = err => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

async function extractFileText(filesArray) {
  const txts = [];
  for (const f of filesArray) {
    if (f && f.name && f.name.split(".").pop().toLowerCase() === "pdf") {
      try {
        const txt = await readPdf(f);
        txts.push(txt);
      } catch (_) {
        // ignore
      }
    }
  }
  return txts.join("\n\n");
}

// ── 6️⃣ PDF export helper -----------------------------------------------
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

// ── 7️⃣ Main component ----------------------------------------------------
export default function App() {
  /* === State === */
  const [step, setStep] = useState(1);
  const [cos, setCos] = useState(INIT_COMPANIES.map(c => ({...c})));
  const [coIdx, setCoIdx] = useState(0);
  const [ccy, setCcy] = useState("INR");
  const [email, setEmail] = useState("");
  const [files, setFiles] = useState([]);   // *array of File objects*
  const [p, setP] = useState({
    material: "", thickness: "", length: "", width: "", quantity: "", process: "",
    finish: "", client: "", delivery: "", required_days:""
  });
  const [extras, setExtras] = useState([{label:"", amount:""}]);
  const [baseCosts, setBase] = useState(null);
  const [overrides, setOv] = useState({});
  const [feas, setFeas] = useState(null);
  const [lt, setLt] = useState(null);
  const [qid] = useState(genQID);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);   // {type,text}
  const [editRates, setER] = useState(false);
  const fileRef = useRef();

  const co = cos[coIdx];
  const curr = CURRENCIES.find(c => c.code === ccy) || CURRENCIES[0];

  /* === Responsive CSS injection — runs once ==================== */
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
@media (max-width:700px){
  .rfq-side{display:none;}
  .rfq-main{flex:1;}
}
`;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  /* === Basic helpers used everywhere ===================== */
  const valid = !["material","thickness","length","width","quantity","process"].some(k=>!p[k]);

  const run = () => {
    const c = calcCosts(p, co, ccy, extras.filter(e=>e.label&&e.amount));
    const f = calcFeasibility(p);
    const l = calcLeadTime(p, c.mhrs);
    setBase(c);
    setFeas(f);
    setLt(l);
    setOv({});
    setStep(4);
  };

  /* === AI extraction flow ---------------------------------------------- */
  async function aiExtract() {
    if (!email.trim()) {
      setMsg({ type: "err", text: "Paste an RFQ email first." });
      return;
    }
    setBusy(true);
    setMsg({ type: "ok", text: "Sending to AI…" });

    try {
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

      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
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

      if (!resp.ok) throw new Error(`OpenAI ${resp.status}`);
      const data = await resp.json();
      const txt = data.choices[0].message.content
        .replace(/(^```?.*?)$/gm, "") // strip optional fences
        .trim();

      const parsed = JSON.parse(txt);
      setP(prev => ({ ...prev, ...parsed }));
      setMsg({ type: "ok", text: "✅ AI extraction done — review fields below." });
      setStep(3);
    } catch (e) {
      const parsed = regexParse(email);
      setP(prev => ({ ...prev, ...parsed }));
      setMsg({ type: "warn", text: "⚠️ AI extraction failed — fallback to rule‑based parsing." });
      setStep(3);
    } finally {
      setBusy(false);
    }
  }

  /* === Download helpers ----------------------------------------------- */
  function dl(html, mime, name) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: mime }));
    a.download = name;
    a.click();
  }
  function dlHTML() {
    if (!displayCosts) return;
    dl(buildHTML(qid,p,displayCosts,feas,co,extras.filter(e=>e.label&&e.amount),lt), "text/html", `${qid}.html`);
  }
  function dlCSV() {
    if (!displayCosts) return;
    const c = displayCosts, sym = curr.sym;
    const rows = [
      ["Quotation ID", qid], ["Date", new Date().toLocaleString()], ["Company", co.name], ["Currency", ccy],
      ["", ""], ["CLIENT", ""], ["Client", p.client], ["Delivery", p.delivery], ["Required Days", p.required_days],
      ["", ""], ["SPECS", ""], ["Material", p.material], ["Thickness mm", p.thickness], ["Length mm", p.length], ["Width mm", p.width], ["Qty", p.quantity], ["Process", p.process], ["Finish", p.finish],
      ["", ""], ["COSTS", `Amount ${ccy}`],
      ["Material", c.material.toFixed(2)], ["Machine", c.machine.toFixed(2)], ["Labor", c.labor.toFixed(2)],
      ["Setup", c.setup.toFixed(2)], ["Finishing", c.finishing.toFixed(2)], ["Packaging", c.packaging.toFixed(2)],
      ["Transport", c.transport.toFixed(2)], ["Additional", c.extra.toFixed(2)], ["Profit", c.profit.toFixed(2)],
      ["TOTAL", c.total.toFixed(2)], ["Per Part", c.per_part.toFixed(2)],
      ["", ""], ["Part Weight kg", c.weight.toFixed(5)], ["Machine Hours", c.mhrs.toFixed(3)],
      ...(lt ? [["", ""], ["LEAD TIME", ""], ["Total Days", lt.total], ...lt.schedule.map(s=>[s.label, `${s.days} days`])] : [] ),
    ];
    dl(rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n"), "text/csv", `${qid}.csv`);
  }
  function dlJSON() {
    if (!displayCosts) return;
    dl(JSON.stringify({quotation_id: qid, generated: new Date().toISOString(), company: co.name, currency: ccy, params: p, costs: {...displayCosts, ccy:undefined, mat:undefined, proc:undefined}, extras: extras.filter(e=>e.label&&e.amount), lead_time: lt?{total_days:lt.total, stages:lt.schedule.map(s=>({stage:s.label,days:s.days,end_day:s.end}))}:null }, null, 2), "application/json", `${qid}.json`);
  }
  const displayCosts = baseCosts ? mergeOverrides({...baseCosts, _qty: +p.quantity||1}, Object.keys(overrides).length?overrides:null) : null;

  /* =======================================
     RENDER
     ======================================= */
  return (
    <div style={G.app}>
      {/* Topbar */}
      <div style={G.topbar}>
        <div style={G.logo}>
          <span>⚙</span>RFQ<span style={{color:"#38bdf8"}}>Analyzer</span>
          <span style={{fontSize:10,fontWeight:400,color:"#1e3352",marginLeft:4,fontFamily:"'JetBrains Mono',monospace"}}>v3.1</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Pill color="#38bdf8">AI‑POWERED</Pill>
          <Pill color="#10b981">PRODUCTION GRADE</Pill>
          <span style={{fontSize:11,color:"#1e3352",fontFamily:"'JetBrains Mono',monospace",marginLeft:6}}>{qid}</span>
        </div>
      </div>

      <div style={G.layout}>
        {/* Sidebar */}
        <div style={G.side} className="rfq-side">
          <div style={G.navGrp}>Workflow</div>
          {STEPS.map(s => (
            <div key={s.id} style={G.nav(step===s.id)} onClick={() => (step>s.id||step===s.id) && setStep(s.id)}>
              <span style={{fontSize:14,flexShrink:0}}>{s.icon}</span>
              <div>
                <div>{s.label}</div>
                {step>s.id && <div style={{fontSize:9,color:"#10b981",marginTop:1}}>✓ Done</div>}
              </div>
            </div>
          ))}
          <div style={G.hr}/>
          <div style={{padding:"0 14px"}}>
            <div style={G.navGrp}>Session</div>
            <div style={{fontSize:11,color:"#3d5a7a",lineHeight:2.1,padding:"0 1px"}}>
              <div>Co: <b style={{color:"#64748b"}}>{co.name}</b></div>
              <div>CCY: <b style={{color:"#64748b"}}>{curr.sym} {ccy}</b></div>
              {displayCosts && <div>Total: <b style={{color:"#38bdf8"}}>{curr.sym}{displayCosts.total.toFixed(0)}</b></div>}
              {lt && <div>Lead: <b style={{color:"#34d399"}}>{lt.total}d</b></div>}
            </div>
          </div>
          {displayCosts && (
            <div style={{padding:"10px 10px 0"}}>
              <button style={{...G.btn,width:"100%",justifyContent:"center",fontSize:11}} onClick={()=>setStep(5)}>📄 Quotation</button>
            </div>
          )}
        </div>

        {/* Main content */}
        <div style={G.main} className="rfq-main">
          {/* ── Step 1: CONFIGURATION ── */}
          {step===1 && (
            <>
              <h1 style={{fontSize:20,fontWeight:800,color:"#fff",margin:"0 0 4px"}}>Company Configuration</h1>
              <p style={{fontSize:12,color:"#3d5a7a",marginBottom:20}}>Set your company profile, rates and quotation currency.</p>

              <div style={G.card}>
                <div style={G.cardH}>⚙️ Profile & Currency</div>
                <div style={G.g2}>
                  <Field label="Company Profile">
                    <select style={G.sel} value={coIdx} onChange={e=>setCoIdx(+e.target.value)}>
                      {cos.map((c,i)=> <option key={i} value={i}>{c.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Quotation Currency" hint="All amounts displayed in this currency">
                    <select style={G.sel} value={ccy} onChange={e=>setCcy(e.target.value)}>
                      {CURRENCIES.map(c=> <option key={c.code} value={c.code}>{c.sym} {c.code} — 1 INR = {(c.code==="INR"?1:(1/c.rate)).toFixed(5)} {c.code}</option>)}
                    </select>
                  </Field>
                </div>
                <div style={{marginTop:8,padding:"9px 13px",background:"#060e1c",borderRadius:8,border:"1px solid #1a2e4a",fontSize:12,color:"#3d5a7a"}}>
                  Conversion preview: <b style={{color:"#38bdf8"}}>₹1,000 INR = {curr.sym}{(1000/curr.rate).toFixed(2)} {ccy}</b>
                  {ccy!=="INR" && <span style={{marginLeft:8,color:"#2a3f5a"}}>· Rate: 1 {ccy} = ₹{curr.rate}</span>}
                </div>
              </div>

              <div style={G.card}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div style={G.cardH}>💰 Machine & Labor Rates (₹/hr)</div>
                  <button style={editRates?G.green:G.btn} onClick={()=>setER(v=>!v)}>{editRates?"✓ Save Rates":"✏️ Edit Rates"}</button>
                </div>
                <div style={G.g3}>
                  {[
                    {k:"laser",l:"Laser Cutting",icon:"🔴"},
                    {k:"cnc",l:"CNC Machining",icon:"🔩"},
                    {k:"bending",l:"Bending",icon:"🔧"},
                    {k:"welding",l:"Welding",icon:"🔥"},
                    {k:"grinding",l:"Grinding",icon:"⚡"},
                    {k:"labor",l:"Labor / hr",icon:"👷"},
                  ].map(({k,l,icon})=>(
                    <div key={k} style={{background:"#060e1c",border:"1px solid #1a2e4a",borderRadius:10,padding:"12px 14px"}}>
                      <div style={{fontSize:9,color:"#2a3f5a",marginBottom:5,display:"flex",gap:5,alignItems:"center"}}><span>{icon}</span>{l}</div>
                      {editRates ?
                        <input style={{...G.inp,fontSize:18,fontWeight:800,color:"#38bdf8",background:"transparent",border:"none",borderBottom:"1px solid #38bdf8",borderRadius:0,padding:"2px 0"}} type="number"
                               value={co[k]} onChange={e=>setCoField(k,+e.target.value)}/>
                        :
                        <div style={{fontSize:20,fontWeight:800,color:"#38bdf8",fontFamily:"'JetBrains Mono',monospace"}}>₹{co[k]}</div>
                      }
                    </div>
                  ))}
                </div>
                <div style={{...G.g4,marginTop:14}}>
                  {[
                    {k:"finishing",l:"Finishing",icon:"✨",pct:false},
                    {k:"packaging",l:"Packaging",icon:"📦",pct:false},
                    {k:"transport",l:"Transport",icon:"🚛",pct:false},
                    {k:"margin",l:"Profit %",icon:"📈",pct:true},
                  ].map(({k,l,icon,pct})=>(
                    <div key={k} style={{background:"#060e1c",border:"1px solid #1a2e4a",borderRadius:10,padding:"12px 14px"}}>
                      <div style={{fontSize:9,color:"#2a3f5a",marginBottom:5,display:"flex",gap:5,alignItems:"center"}}><span>{icon}</span>{l}</div>
                      {editRates ?
                        <input style={{...G.inp,fontSize:16,fontWeight:800,color:"#a78bfa",background:"transparent",border:"none",borderBottom:"1px solid #a78bfa",borderRadius:0,padding:"2px 0"}} type="number" step={pct?1:1} value={pct?(co[k]*100).toFixed(0):co[k]} onChange={e=>setCoField(k,pct?+e.target.value/100:+e.target.value)}/>
                        :
                        <div style={{fontSize:18,fontWeight:800,color:"#a78bfa",fontFamily:"'JetBrains Mono',monospace"}}>{pct?(co.margin*100).toFixed(0)+"%" :`₹${co[k]}`}</div>
                      }
                    </div>
                  ))}
                </div>
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                <h3 style={{color:"#64748b",fontSize:12,marginBottom:10}}><span>💾 Remarks</span></h3>
                <p style={{fontSize:10,color:"#3d5a7a"}}>Rates are used as the base for all cost calculations. Adjust them with caution.</p>
              </div>

              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <button style={G.btn} onClick={()=>setStep(2)}>Continue to RFQ Input →</button>
              </div>
            </>
          )}

          {/* ── Step 2: RFQ INPUT ── */}
          {step===2 && (
            <>
              <h1 style={{fontSize:20,fontWeight:800,color:"#fff",margin:"0 0 4px"}}>RFQ Input</h1>
              <p style={{fontSize:12,color:"#3d5a7a",marginBottom:20}}>Paste the client's email. AI will extract all manufacturing parameters automatically.</p>

              <div style={G.card}>
                <div style={G.cardH}>📧 Client Email / RFQ Text</div>
                <textarea style={G.ta} value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder={"Paste the full email here. Example:\n\nFrom: Priya Sharma <priya@abc.com>\n\nPlease quote for:\nMaterial: Mild Steel\nThickness: 5 mm\nPart Size: 200 x 100 mm\nQuantity: 50 pcs\nProcess: Laser Cutting\nSurface Finish: Powder Coat\nDelivery Location: Chennai\nRequired within: 10 days"}/>
                {msg && <div style={{marginTop:9,padding:"8px 12px",background:MC[msg.type]+"14",border:`1px solid ${MC[msg.type]}30`,borderRadius:8,fontSize:12,color:MC[msg.type]}}>{msg.text}</div>}
                <div style={{marginTop:12,display:"flex",gap:9,flexWrap:"wrap"}}>
                  <button style={G.btn} onClick={aiExtract} disabled={busy}>{busy?"⏳ Analysing…":"⚡ Extract with AI"}</button>
                  <button style={G.ghost} onClick={ruleExtract}>🔍 Rule‑based Extract</button>
                  <button style={G.ghost} onClick={()=>setStep(3)}>✏️ Manual Entry</button>
                </div>
                <div style={{marginTop:11,padding:"9px 12px",background:"#060e1c",borderRadius:8,border:"1px solid #1a2e4a",fontSize:10,color:"#2a3f5a",lineHeight:1.9}}>
                  <b style={{color:"#3d5a7a"}}>Tip —</b> include: Material · Thickness (mm) · Size L×W mm · Qty · Process · Finish · Delivery location · "required within X days"
                </div>
              </div>

              <div style={G.card}>
                <div style={G.cardH}>📁 Engineering Drawings</div>
                <div style={{border:"2px dashed #1a2e4a",borderRadius:10,padding:"28px 20px",textAlign:"center",cursor:"pointer"}}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e=>e.preventDefault()}
                  onDrop={e=>{ e.preventDefault(); const fs=Array.from(e.dataTransfer.files||[]); setFiles(prev=>[...prev, ...fs]); }} >
                  <div style={{fontSize:30,marginBottom:6}}>📂</div>
                  <div style={{fontSize:13,fontWeight:600,color:"#4a6380"}}>Drop drawings here or click to browse</div>
                  <div style={{fontSize:10,color:"#2a3f5a",marginTop:4}}>PDF · DWG · DXF · STEP · IGES · PNG · JPG</div>
                  <input ref={fileRef} type="file" multiple accept=".pdf,.dwg,.dxf,.step,.iges,.png,.jpg,.jpeg" onChange={e => { const fs = Array.from(e.target.files || []); setFiles(prev => [...prev, ...fs]); }} style={{display:"none"}}/>
                </div>
                {files.length>0 && (
                  <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:5}}>
                    {files.map((f,i) => (
                      <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:"#060e1c",borderRadius:7,border:"1px solid #1a2e4a"}}>
                        <Pill color="#10b981">{f.name.split(".").pop().toUpperCase()}</Pill>
                        <span style={{flex:1,fontSize:12,color:"#4a6380"}}>{f.name}</span>
                        <span style={{fontSize:10,color:"#2a3f5a"}}>{(f.size/1024).toFixed(1)} KB</span>
                        <span style={{fontSize:10,color:"#ef4444",cursor:"pointer"}} onClick={()=>setFiles(prev=>prev.filter((_,j)=>j!==i))}>✕</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{display:"flex",gap:9,justifyContent:"flex-end"}}>
                <button style={G.ghost} onClick={()=>setStep(1)}>← Back</button>
                <button style={G.btn} onClick={()=>setStep(3)}>Review Parameters →</button>
              </div>
            </>
          )}

          {/* ── Step 3: VALIDATE ── */}
          {step===3 && (
            <>
              <h1 style={{fontSize:20,fontWeight:800,color:"#fff",margin:"0 0 4px"}}>Validate Parameters</h1>
              <p style={{fontSize:12,color:"#3d5a7a",marginBottom:16}}>Review extracted data. Correct any errors. Fields marked * are required.</p>

              {msg && <div style={{padding:"9px 13px",background:MC[msg.type]+"14",border:`1px solid ${MC[msg.type]}30`,borderRadius:9,fontSize:12,color:MC[msg.type],marginBottom:14,display:"flex",gap:8,alignItems:"center"}}>
                <span>{msg.type==="ok"?"✅":msg.type==="warn"?"⚠️":"❌"}</span>{msg.text}
              </div>}

              <div style={G.card}>
                <div style={G.cardH}>👤 Client Details</div>
                <div style={G.g2}>
                  <Field label="Client Name"><input style={G.inp} value={p.client} onChange={e=>setP(x=>({...x,client:e.target.value}))} placeholder="e.g. ABC Engineering"/></Field>
                  <Field label="Delivery Location"><input style={G.inp} value={p.delivery} onChange={e=>setP(x=>({...x,delivery:e.target.value}))} placeholder="e.g. Chennai"/></Field>
                </div>
                <div style={{marginTop:12}}>
                  <Field label="Client Required Delivery Days" hint="Days the client has asked for — extracted from email or enter manually">
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <input style={{...G.inp,width:130}} type="number" min="1" value={p.required_days} onChange={e=>setP(x=>({...x,required_days:e.target.value}))} placeholder="e.g. 10"/>
                      {p.required_days && <span style={{fontSize:12,color:"#f59e0b",background:"#f59e0b12",border:"1px solid #f59e0b30",borderRadius:7,padding:"6px 11px"}}>📅 Client needs delivery in <b>{p.required_days} days</b></span>}
                    </div>
                  </Field>
                </div>
              </div>

              <div style={G.card}>
                <div style={G.cardH}>🔩 Part Specifications</div>
                <div style={G.g2}>
                  <Field label="Material" required>
                    <select style={G.sel} value={p.material} onChange={e=>setP(x=>({...x,material:e.target.value}))}>
                      <option value="">— Select —</option>
                      {MATERIALS.map(m=> <option key={m.name}>{m.name}</option>)}
                    </select>
                    {p.material && (() => {
                      const m = MATERIALS.find(x => x.name===p.material);
                      return m?<span style={{fontSize:9,color:"#10b981",marginTop:2,display:"block"}}>Density {m.density} kg/m³ · ₹{m.ppkg}/kg</span>:null;
                    })()}
                  </Field>
                  <Field label="Process" required>
                    <select style={G.sel} value={p.process} onChange={e=>setP(x=>({...x,process:e.target.value}))}>
                      <option value="">— Select —</option>
                      {PROCESSES.map(pr=> <option key={pr.name}>{pr.name}</option>)}
                    </select>
                    {p.process && (() => {
                      const pr = PROCESSES.find(x => x.name===p.process);
                      return pr?<span style={{fontSize:9,color:"#10b981",marginTop:2,display:"block"}}>₹{pr.rate}/hr · T: {pr.min_t}–{pr.max_t}mm</span>:null;
                    })()}
                  </Field>
                  <Field label="Thickness (mm)" required><input style={G.inp} type="number" min=".1" step=".5" value={p.thickness} onChange={e=>setP(x=>({...x,thickness:e.target.value}))} placeholder="e.g. 5"/></Field>
                  <Field label="Length (mm)" required><input style={G.inp} type="number" min="1" value={p.length} onChange={e=>setP(x=>({...x,length:e.target.value}))} placeholder="e.g. 200"/></Field>
                  <Field label="Width (mm)" required><input style={G.inp} type="number" min="1" value={p.width} onChange={e=>setP(x=>({...x,width:e.target.value}))} placeholder="e.g. 100"/></Field>
                  <Field label="Quantity (pcs)" required><input style={G.inp} type="number" min="1" value={p.quantity} onChange={e=>setP(x=>({...x,quantity:e.target.value}))} placeholder="e.g. 50"/></Field>
                </div>
                <div style={{marginTop:12}}>
                  <Field label="Surface Finish" hint="e.g. Powder Coat, Mirror Polish, Anodise, Raw">
                    <input style={G.inp} value={p.finish} onChange={e=>setP(x=>({...x,finish:e.target.value}))} placeholder="e.g. Powder Coat"/>
                  </Field>
                </div>
              </div>

              <div style={G.card}>
                <div style={G.cardH}>✅ Validation</div>
                {!valid ?
                  <>
                    <div style={{padding:"9px 12px",background:"#ef444412",border:"1px solid #ef444430",borderRadius:7,fontSize:12,color:"#ef4444",marginBottom:8}}>Fill in required fields before calculating.</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{missing.map(f=> <Pill key={f} color="#ef4444">Missing: {f}</Pill>)}</div>
                  </>
                  :
                  <div style={{padding:"9px 12px",background:"#10b98112",border:"1px solid #10b98130",borderRadius:7,fontSize:12,color:"#10b981"}}>
                    ✅ All required fields complete.{p.required_days && <span style={{marginLeft:10,color:"#f59e0b"}}>Client target: <b>{p.required_days} days</b></span>}
                  </div>
                }
              </div>

              <div style={{display:"flex",gap:9,justifyContent:"flex-end"}}>
                <button style={G.ghost} onClick={()=>setStep(2)}>← Back</button>
                <button style={{...G.btn,opacity:valid?1:.4,cursor:valid?"pointer":"not-allowed"}} onClick={valid?run:undefined}>Calculate Cost →</button>
              </div>
            </>
          )}

          {/* ── Step 4: COST ANALYSIS ── */}
          {step===4 && baseCosts && displayCosts && (
            (() => {
              const maxV = Math.max(...COST_ROWS.map(r=>displayCosts[r.k]||0),1);
              return (
                <>
                  <h1 style={{fontSize:20,fontWeight:800,color:"#fff",margin:"0 0 4px"}}>Cost Analysis</h1>
                  <p style={{fontSize:12,color:"#3d5a7a",marginBottom:18}}>Click any cost value in the table to edit it directly. Total updates live.</p>

                  <div style={G.g4}>
                    <StatCard icon="💰" label="Total Quotation" value={`${curr.sym}${displayCosts.total.toLocaleString("en-IN",{maximumFractionDigits:0})}`} color="#38bdf8"/>
                    <StatCard icon="🔩" label="Cost Per Part" value={`${curr.sym}${displayCosts.per_part.toFixed(2)}`} color="#a78bfa"/>
                    <StatCard icon="📅" label="Lead Time (Co.)" value={lt?`${lt.total} days`:"—"} color="#34d399"
                      sub={p.required_days?(lt?.total<=+p.required_days?"✅ Within target":"⚠ Exceeds target"):undefined}/>
                    <StatCard icon="⚠" label="Complexity" value={feas.complexity}
                      color={feas.complexity==="High"?"#ef4444":feas.complexity==="Medium"?"#f59e0b":"#10b981"}/>
                  </div>

                  {/* Layout: left 60% + right 40% */}
                  <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:16}}>
                    {/* LEFT - Table, extras, Gantt */}
                    <div>
                      <div style={G.card}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                          <div style={G.cardH}>📊 Cost Breakdown — Click to Edit</div>
                          {Object.keys(overrides).length>0 && (
                            <button style={{...G.ghost,fontSize:11,padding:"5px 10px",color:"#f59e0b",border:"1px solid #f59e0b30"}} onClick={()=>setOv({})}>↺ Reset</button>
                          )}
                        </div>

                        {/* Table header */}
                        <div style={{display:"grid",gridTemplateColumns:"22px 1fr 1fr 100px",gap:8,padding:"5px 0 8px",borderBottom:"1px solid #1a2e4a",marginBottom:3}}>
                          <div/><div style={{fontSize:9,color:"#1e3352",fontWeight:700,letterSpacing:1}}>ITEM</div>
                          <div style={{fontSize:9,color:"#1e3352",fontWeight:700,letterSpacing:1}}>DETAILS</div>
                          <div style={{fontSize:9,color:"#1e3352",fontWeight:700,letterSpacing:1,textAlign:"right"}}>AMOUNT</div>
                        </div>

                        {COST_ROWS.map(row=>{
                          const baseVal = baseCosts[row.k];
                          const dispVal = displayCosts[row.k];
                          const edited = overrides[row.k] !== undefined;
                          return (
                            <div key={row.k} style={{display:"grid",gridTemplateColumns:"22px 1fr 1fr 100px",gap:8,alignItems:"center",padding:"6px 0",borderBottom:"1px solid #0d1d33"}}>
                              <span style={{fontSize:12}}>{row.icon}</span>
                              <div>
                                <div style={{fontSize:12,fontWeight:600,color:edited?"#f59e0b":"#8facc8"}}>{row.label}</div>
                                {edited && <div style={{fontSize:9,color:"#3d5a7a"}}>calc: {curr.sym}{baseVal.toFixed(2)}</div>}
                              </div>
                              <div style={{fontSize:10,color:"#2a3f5a",lineHeight:1.3}}>{row.det}</div>
                              <div style={{position:"relative"}}>
                                <span style={{position:"absolute",left:7,top:"50%",transform:"translateY(-50%)",fontSize:10,color:"#3d5a7a",pointerEvents:"none",fontFamily:"'JetBrains Mono',monospace"}}>{curr.sym}</span>
                                <input type="number" step="0.01" value={dispVal.toFixed(2)} onChange={e=>setOv(prev=>({...prev,[row.k]:Math.max(0,+e.target.value)}))}
                                  style={{...G.inp,paddingLeft:curr.sym.length>1?22:18,textAlign:"right",fontSize:12,fontWeight:700,color:edited?"#f59e0b":"#e2e8f0",borderColor:edited?"#f59e0b50":"#1a2e4a",fontFamily:"'JetBrains Mono',monospace"}}/>
                              </div>
                            </div>
                          );
                        })}

                        {/* Totals */}
                        <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #1e3a5f"}}>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:800,color:"#38bdf8",fontFamily:"'JetBrains Mono',monospace"}}>
                            <span>TOTAL</span><span>{curr.sym}{displayCosts.total.toFixed(2)}</span>
                          </div>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#2a3f5a",marginTop:5}}>
                            <span>Per Part</span><span style={{fontFamily:"'JetBrains Mono',monospace"}}>{curr.sym}{displayCosts.per_part.toFixed(2)} × {p.quantity} pcs</span>
                          </div>
                        </div>

                        {Object.keys(overrides).length>0 && (
                          <div style={{marginTop:10,padding:"7px 11px",background:"#f59e0b0a",border:"1px solid #f59e0b28",borderRadius:7,fontSize:11,color:"#f59e0b"}}>
                            ✏️ Some values manually edited (shown in amber). Click ↺ Reset to restore calculated values.
                          </div>
                        )}

                        {/* Mini bar chart */}
                        <div style={{marginTop:16}}>
                          {COST_ROWS.map((row,i)=>(
                            <BarRow key={row.k} label={row.label} value={displayCosts[row.k]||0} max={maxV} color={BAR_COLORS[i%BAR_COLORS.length]} symbol={curr.sym}/>
                          ))}
                        </div>
                      </div>

                      {/* Additional charges */}
                      <div style={G.card}>
                        <div style={G.cardH}>➕ Additional Charges</div>
                        <p style={{fontSize:11,color:"#2a3f5a",marginBottom:11}}>Add GST, inspection, special tooling, freight surcharge, etc.</p>
                        {extras.map((ex,i)=>(
                          <div key={i} style={{display:"flex",gap:8,marginBottom:7,alignItems:"center"}}>
                            <input style={{...G.inp,flex:2}} placeholder="Label (GST 18%, Inspection Fee…)" value={ex.label} onChange={e=>setExtras(prev=>prev.map((c,j)=>j===i?{...c,label:e.target.value}:c))}/>
                            <div style={{position:"relative",flex:1}}>
                              <span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",fontSize:11,color:"#3d5a7a"}}>₹</span>
                              <input style={{...G.inp,paddingLeft:20,fontFamily:"'JetBrains Mono',monospace"}} type="number" placeholder="amount" value={ex.amount} onChange={e=>setExtras(prev=>prev.map((c,j)=>j===i?{...c,amount:e.target.value}:c))}/>
                            </div>
                            <button style={{...G.ghost,padding:"8px 10px",color:"#ef4444",border:"1px solid #ef444428"}} onClick={()=>setExtras(prev=>prev.filter((_,j)=>j!==i))}>✕</button>
                          </div>
                        ))}
                        <div style={{display:"flex",gap:9,marginTop:6}}>
                          <button style={G.ghost} onClick={()=>setExtras(prev=>[...prev,{label:"",amount:""}])}>+ Add Charge</button>
                          <button style={G.btn} onClick={run}>↻ Recalculate</button>
                        </div>
                      </div>

                      {/* Lead time Gantt */}
                      {lt && (
                        <div style={G.card}>
                          <div style={G.cardH}>📅 Production Lead Time — Company Estimate</div>
                          <Gantt schedule={lt.schedule} total={lt.total} clientDays={p.required_days}/>
                        </div>
                      )}
                    </div>

                    {/* RIGHT – Pie, Part details, Feasibility */}
                    <div>
                      {/* Donut */}
                      <div style={G.card}>
                        <div style={G.cardH}>📈 Cost Distribution</div>
                        <Donut data={[
                          {label:"Material", value:displayCosts.material},
                          {label:"Machine", value:displayCosts.machine},
                          {label:"Labor", value:displayCosts.labor},
                          {label:"Overhead", value:displayCosts.setup+displayCosts.finishing+displayCosts.packaging+displayCosts.transport+displayCosts.extra},
                          {label:"Profit", value:displayCosts.profit},
                        ]}/>
                        <div style={{marginTop:10}}>
                          {[["Material","#3b82f6",displayCosts.material],
                            ["Machine","#8b5cf6",displayCosts.machine],
                            ["Labor","#10b981",displayCosts.labor],
                            ["Overhead","#f59e0b",displayCosts.setup+displayCosts.finishing+displayCosts.packaging+displayCosts.transport+displayCosts.extra],
                            ["Profit","#ef4444",displayCosts.profit]].map(([l,c,v])=>(
                            <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:5}}>
                              <span style={{display:"flex",alignItems:"center",gap:6,color:"#3d5a7a"}}>
                                <span style={{width:8,height:8,borderRadius:2,background:c,display:"inline-block",flexShrink:0}}/>
                                {l}
                              </span>
                              <span style={{color:"#64748b",fontFamily:"'JetBrains Mono',monospace"}}>{curr.sym}{v.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Part details */}
                      <div style={G.card}>
                        <div style={G.cardH}>🔍 Part Details</div>
                        <KV label="Material" value={baseCosts.mat.name} mono/>
                        <KV label="Density" value={`${baseCosts.mat.density} kg/m³`} mono/>
                        <KV label="Weight" value={`${baseCosts.weight.toFixed(5)} kg`} mono/>
                        <KV label="Mat. Rate" value={`₹${baseCosts.mat.ppkg}/kg`} mono/>
                        <KV label="Process" value={baseCosts.proc.name} mono/>
                        <KV label="Mach. Hrs" value={`${baseCosts.mhrs.toFixed(3)} hrs`} mono/>
                        <KV label="Quantity" value={`${p.quantity} pcs`} mono/>
                        {p.required_days && (
                          <div style={{marginTop:9,padding:"7px 10px",
                            background:lt && lt.total>+p.required_days?"#ef444412":"#10b98112",
                            border:`1px solid ${lt && lt.total>+p.required_days?"#ef444430":"#10b98130"`,
                            borderRadius:7,fontSize:11,
                            color:lt && lt.total>+p.required_days?"#fca5a5":"#10b981"}}>
                            📅 Client target: <b>{p.required_days}d</b>
                            {lt.total <= +p.required_days? `✅ We deliver in ${lt.total} days`: `⚠️ Delivery exceeds requirement`}                          </div>
                        )}
                      </div>

                      {/* Feasibility */}
                      <div style={G.card}>
                        <div style={G.cardH}>⚠ Feasibility</div>
                        {feas.warnings.length===0 ?
                          <div style={{padding:"9px 11px",background:"#10b98112",border:"1px solid #10b98130",borderRadius:7,fontSize:12,color:"#10b981"}}>✅ No manufacturing issues.</div>
                          :
                          feas.warnings.map((w,i)=>(
                            <div key={i} style={{padding:"7px 10px",borderRadius:7,marginBottom:6,fontSize:11,
                              background:w.lvl==="error"?"#ef444412":w.lvl==="warn"?"#f59e0b12":"#3b82f612",
                              border:`1px solid ${w.lvl==="error"?"#ef444430":"#f59e0b30":w.lvl==="warn"?"#3b82f630":"#3b82f630"`,
                              color:w.lvl==="error"?"#fca5a5":w.lvl==="warn"?"#fcd34d":"#93c5fd"}}>
                              {w.msg}
                            </div>
                          ))}
                        }
                      </div>
                    </div>
                  </div>

                  <div style={{display:"flex",gap:9,justifyContent:"flex-end"}}>
                    <button style={G.ghost} onClick={()=>setStep(3)}>← Edit Parameters</button>
                    <button style={G.btn} onClick={()=>setStep(5)}>Generate Quotation →</button>
                  </div>
                </>
              );
            })()
          )}

          {/* ── Step 5: QUOTATION ── */}
          {step===5 && displayCosts && (
            <>
              <h1 style={{fontSize:20,fontWeight:800,color:"#fff",margin:"0 0 4px"}}>Final Quotation</h1>
              <p style={{fontSize:12,color:"#3d5a7a",marginBottom:18}}>Download in your preferred format. HTML → browser Print → Save as PDF for a PDF copy.</p>

              <div style={G.card}>
                <div style={G.cardH}>⬇ Export</div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:10}}>
                  <button style={G.btn} onClick={dlHTML}>🌐 HTML <Pill color="#38bdf8">→ PDF via Print</Pill></button>
                  <button style={G.green} onClick={dlCSV}>📊 CSV / Excel</button>
                  <button style={G.purp} onClick={dlJSON}>JSON / API</button>
                  <button style={G.btn} onClick={exportPDF}>⬇ Download PDF</button>
                </div>
                <div style={{fontSize:10,color:"#2a3f5a",lineHeight:1.9,background:"#060e1c",padding:"9px 12px",borderRadius:8,border:"1px solid #1a2e4a"}}>
                  <b style={{color:"#3d5a7a"}}>HTML</b> opens in browser — File → Print → Save as PDF gives a print‑quality PDF.
                  &nbsp;·&nbsp;<b style={{color:"#3d5a7a"}}>CSV</b> opens in Excel/Sheets.
                  &nbsp;·&nbsp;<b style={{color:"#3d5a7a"}}>JSON</b> for ERP integration.
                </div>
              </div>

              {/* Quotation preview – id for PDF export */}
              <div id="quotation-card" style={{...G.card,background:"#0b1527",border:"1px solid #1e3a5f"}}>
                {/* Header */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,paddingBottom:16,borderBottom:"1px solid #1a2e4a"}}>
                  <div>
                    <div style={{fontSize:20,fontWeight:800,color:"#fff"}}>RFQ<span style={{color:"#38bdf8"}}>Analyzer</span></div>
                    <div style={{fontSize:11,color:"#2a3f5a",marginTop:2}}>{co.name} · Fabrication Services</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:24,fontWeight:"800",color:"#e2e8f0",letterSpacing:-1}}>QUOTATION</div>
                    <div style={{fontSize:11,color:"#2a3f5a",marginTop:3,fontFamily:"'JetBrains Mono',monospace"}}>{qid}</div>
                    <div style={{fontSize:11,color:"#2a3f5a"}}>{new Date().toLocaleDateString("en-IN",{year:"numeric",month:"long",day:"numeric"})}</div>
                  </div>
                </div>

                {/* Client & Specs */}
                <div style={G.g2}>
                  <div>
                    <div style={{fontSize:9,color:"#1e3352",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Client</div>
                    <div style={{fontSize:14,color:"#e2e8f0",fontWeight:700}}>{p.client||"—"}</div>
                    <div style={{fontSize:12,color:"#3d5a7a",marginTop:3}}>📍 {p.delivery||"—"}</div>
                    {p.required_days && <div style={{fontSize:12,color:"#f59e0b",marginTop:2}}>📅 Requires delivery in {p.required_days} days</div>}
                  </div>
                  <div>
                    <div style={{fontSize:9,color:"#1e3352",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Specifications</div>
                    <div style={{fontSize:12,color:"#4a6380",lineHeight:2}}>
                      <div>{p.material} · {p.thickness}mm</div>
                      <div>{p.length} × {p.width} mm · {p.quantity} pcs</div>
                      <div>{p.process} · {p.finish||"Standard"}</div>
                    </div>
                  </div>
                </div>

                <div style={G.hr}/>

                {/* Cost list */}
                {[
                  ["Material Cost",              displayCosts.material],
                  ["Machine Cost",              displayCosts.machine],
                  ["Labor Cost",                displayCosts.labor],
                  ["Setup & Finishing",         displayCosts.setup+displayCosts.finishing],
                  ["Packaging & Transport",      displayCosts.packaging+displayCosts.transport],
                  ...(displayCosts.extra>0?[["Additional Charges",displayCosts.extra]]:[]),
                  [`Profit (${(co.margin*100).toFixed(0)}%)`,displayCosts.profit]
                ].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"6px 0",borderBottom:"1px solid #0d1d33"}}>
                    <span style={{color:"#3d5a7a"}}>{k}</span>
                    <span style={{color:"#8facc8",fontWeight:600,fontFamily:"'JetBrains Mono',monospace"}}>{curr.sym}{v.toFixed(2)}</span>
                  </div>
                ))}

                <div style={{display:"flex",justifyContent:"space-between",fontSize:18,fontWeight:800,color:"#38bdf8",paddingTop:12,fontFamily:"'JetBrains Mono',monospace"}}>
                  <span>TOTAL ({ccy})</span><span>{curr.sym}{displayCosts.total.toFixed(2)}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#2a3f5a",marginTop:4}}>
                  <span>Per Part</span><span style={{fontFamily:"'JetBrains Mono',monospace"}}>{curr.sym}{displayCosts.per_part.toFixed(2)}</span>
                </div>

                <div style={G.hr}/>

                {/* Terms */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:lt&&p.required_days?12:0}}>
                  {[
                    ["Our Lead Time",  lt?`${lt.total} working days`:(+p.quantity>500?"21 days":+p.quantity>100?"14 days":"7 days")],
                    ["Client Target",  p.required_days?`${p.required_days} days`:"N/A"],
                    ["Quote Valid",     "30 days"],
                    ["Payment",         "50% advance"]
                  ].map(([k,v])=>(
                    <div key={k} style={{background:"#060e1c",borderRadius:8,padding:"9px 11px"}}>
                      <div style={{fontSize:9,color:"#1e3352",letterSpacing:1,textTransform:"uppercase",marginBottom:3}}>{k}</div>
                      <div style={{fontSize:12,fontWeight:700,color:"#64748b"}}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Lead time banner */}
                {lt && p.required_days && (
                  <div style={{padding:"9px 13px",borderRadius:8,fontSize:12,fontWeight:600,
                    background:lt.total<=+p.required_days?"#10b98112":"#ef444412",
                    border:`1px solid ${lt.total<=+p.required_days?"#10b98130":"#ef444430"}`,
                    color:lt.total<=+p.required_days?"#10b981":"#fca5a5"}}>
                    {lt.total<=+p.required_days ?
                      `✅ Our production lead time (${lt.total}d) meets client's target of ${p.required_days} days.` :
                      `⚠ Our production lead time (${lt.total}d) exceeds client's target (${p.required_days}d) by ${lt.total-+p.required_days} days — discuss expediting options.`}
                  </div>
                )}
              </div>

              {/* Feasibility if any */}
              {feas?.warnings?.length>0 && (
                <div style={{...G.card,border:"1px solid #f59e0b28",background:"#f59e0b06"}}>
                  <div style={G.cardH}>⚠ Manufacturing Notes</div>
                  {feas.warnings.map((w,i)=>(
                    <div key={i} style={{padding:"7px 10px",borderRadius:7,marginBottom:5,fontSize:11,
                      background:w.lvl==="error"?"#ef444412":"#f59e0b12",
                      border:`1px solid ${w.lvl==="error"?"#ef444430":"#f59e0b30"}`,
                      color:w.lvl==="error"?"#fca5a5":"#fcd34d"}}>
                      {w.msg}
                    </div>
                  ))}
                </div>
              )}

              <div style={{display:"flex",gap:9,justifyContent:"flex-end",flexWrap:"wrap"}}>
                <button style={G.ghost} onClick={()=>setStep(4)}>← Back to Analysis</button>
                <button style={G.ghost} onClick={resetAll}>🔄 New RFQ</button>
                <button style={G.green} onClick={dlHTML}>⬇ Download HTML</button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
