import { useState, useRef } from "react";

// ── Fonts ──
const _fl = document.createElement("link");
_fl.rel = "stylesheet";
_fl.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap";
document.head.appendChild(_fl);

// ════════════════════════════════════════════════════
// DATA
// ════════════════════════════════════════════════════
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

// ════════════════════════════════════════════════════
// ENGINES
// ════════════════════════════════════════════════════
function calcCosts(p, co, ccyCode, extras) {
  const mat  = MATERIALS.find(m => m.name === p.material) || MATERIALS[0];
  const proc = PROCESSES.find(x => x.name === p.process)  || PROCESSES[0];
  const ccy  = CURRENCIES.find(c => c.code === ccyCode)    || CURRENCIES[0];
  const L=+p.length||200, W=+p.width||100, T=+p.thickness||5, Q=+p.quantity||1;

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
  const T=+p.thickness, L=+p.length, W=+p.width, Q=+p.quantity;
  const w=[];
  if (proc) {
    if (T>proc.max_t) w.push({lvl:"error",msg:`Thickness ${T}mm exceeds max for ${proc.name} (${proc.max_t}mm) — use Plasma/Waterjet.`});
    if (T<proc.min_t) w.push({lvl:"error",msg:`Thickness ${T}mm below min for ${proc.name} (${proc.min_t}mm) — warping risk.`});
  }
  if ((p.material||"").toLowerCase().includes("titanium")) w.push({lvl:"warn",msg:"Titanium needs specialised tooling — budget extra lead time."});
  if (L>3000||W>1500) w.push({lvl:"warn",msg:`Part ${L}×${W}mm is oversized — verify machine-bed capacity.`});
  if (Q<5)    w.push({lvl:"info",msg:"Low quantity — setup cost is high per piece."});
  if (Q>1000) w.push({lvl:"info",msg:"High volume — ask for bulk discount."});
  if ((p.finish||"").match(/mirror|polish/i)) w.push({lvl:"warn",msg:"Mirror/polish finish adds ~20% cost & lead time."});
  const errs=w.filter(x=>x.lvl==="error").length, warns=w.filter(x=>x.lvl==="warn").length;
  return { warnings:w, complexity:errs>0?"High":warns>1?"Medium":"Low" };
}

function calcLeadTime(p, mhrs) {
  const Q=+p.quantity||1, T=+p.thickness||5;
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
  const g=(pats)=>{ for(const p of pats){const m=txt.match(p);if(m)return m[1]?.trim()||"";}return ""; };
  let mat="",proc="";
  for(const m of MATERIALS){if(txt.toLowerCase().includes(m.name.toLowerCase())){mat=m.name;break;}}
  for(const p of PROCESSES){if(txt.toLowerCase().includes(p.name.toLowerCase())){proc=p.name;break;}}
  const sz=txt.match(/([0-9.]+)\s*[x×*]\s*([0-9.]+)\s*mm/i)||txt.match(/(?:size)[:\s]+([0-9.]+)\s*[x×*]\s*([0-9.]+)/i);
  const qty=g([/(?:quantity|qty)[:\s]+([0-9,]+)/i,/([0-9,]+)\s*(?:pcs|pieces|nos|units)/i]).replace(/,/g,"");
  const rd=g([/(?:required|deliver(?:y|ed)?)\s*(?:within|in)[:\s]+([0-9]+)\s*(?:days?|working)/i,/within\s+([0-9]+)\s*(?:days?|working)/i]);
  return {
    material:mat, process:proc,
    thickness:g([/thickness[:\s]+([0-9.]+)\s*mm/i,/([0-9.]+)\s*mm\s*thick/i]),
    length:sz?sz[1]:g([/length[:\s]+([0-9.]+)/i]),
    width:sz?sz[2]:g([/width[:\s]+([0-9.]+)/i]),
    quantity:qty,
    finish:g([/(?:finish|surface|coating)[:\s]+([A-Za-z\s\-]+?)(?:\n|$)/i]),
    client:g([/(?:from|client|company)[:\s]+([A-Za-z\s&.,]+?)(?:\n|,|$)/i,/dear\s+([A-Za-z\s]+)/i]),
    delivery:g([/delivery\s*(?:location)?[:\s]+([A-Za-z\s,]+?)(?:\n|$)/i]),
    required_days:rd,
  };
}

function genQID() {
  const d=new Date();
  return `QT-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${Math.floor(1000+Math.random()*9000)}`;
}

// ════════════════════════════════════════════════════
// HTML QUOTATION BUILDER
// ════════════════════════════════════════════════════
function buildHTML(qid, p, costs, feas, co, extras, lt) {
  const c=costs.ccy, fmt=v=>`${c.sym}${Number(v).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const now=new Date().toLocaleDateString("en-IN",{year:"numeric",month:"long",day:"numeric"});
  const ex=(extras||[]).filter(e=>e.label&&e.amount);
  const mg=(co.margin*100).toFixed(0);
  const ltLabel=lt?`${lt.total} working days`:(+p.quantity>500?"21 working days":+p.quantity>100?"14 working days":"7 working days");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${qid}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',system-ui,sans-serif;background:#f0f4f8;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{max-width:920px;margin:30px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.12)}
.hdr{background:linear-gradient(135deg,#0f172a,#1e3a5f 60%,#0f4c75);color:#fff;padding:38px 48px;display:flex;justify-content:space-between;align-items:flex-start}
.brand{font-size:26px;font-weight:800;letter-spacing:-1px}.brand b{color:#38bdf8}
.sub{font-size:12px;color:#94a3b8;margin-top:5px}
.qt{font-size:32px;font-weight:800;text-align:right;letter-spacing:-1px}
.qtm{font-size:12px;color:#94a3b8;text-align:right;margin-top:6px;line-height:2}
.stripe{height:4px;background:linear-gradient(90deg,#38bdf8,#818cf8,#34d399)}
.body{padding:36px 48px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:22px}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:22px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px}
.box{background:#f8fafc;border-radius:10px;padding:18px 20px}
.box h4{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#64748b;margin-bottom:12px}
.kv{display:flex;justify-content:space-between;font-size:13px;padding:5px 0;border-bottom:1px solid #e8ecf0}
.kv:last-child{border:none}.kv .k{color:#64748b}.kv .v{font-weight:600}
.sc{background:#f8fafc;border-radius:10px;padding:14px;text-align:center}
.sc .sl{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;margin-bottom:5px}
.sc .sv{font-size:22px;font-weight:800}
h3.sec{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#64748b;margin:0 0 12px}
table{width:100%;border-collapse:collapse;margin-bottom:18px}
th{background:#0f172a;color:#94a3b8;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;padding:11px 15px;text-align:left}
th:last-child{text-align:right}
td{padding:11px 15px;border-bottom:1px solid #f1f5f9;font-size:13.5px}
td:last-child{text-align:right;font-weight:600}
.tr-tot td{font-size:16px;font-weight:800;color:#1d4ed8;background:#eff6ff;border:none}
.tr-cpp td{font-size:12px;color:#64748b;background:#f8fafc}
.gantt-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.gantt-lbl{width:200px;font-size:12px;font-weight:600;color:#1e293b;flex-shrink:0}
.gantt-sub{font-size:10px;color:#64748b;margin-top:1px}
.gantt-track{flex:1;background:#e2e8f0;border-radius:5px;height:24px;position:relative;overflow:hidden}
.gantt-bar{position:absolute;top:2px;bottom:2px;border-radius:4px;display:flex;align-items:center;padding-left:6px;font-size:9px;color:#fff;font-weight:700;white-space:nowrap;overflow:hidden}
.gantt-d{width:36px;text-align:right;font-size:11px;font-weight:700;color:#1d4ed8;flex-shrink:0}
.warn{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin-bottom:16px}
.warn h4{font-size:10px;font-weight:700;letter-spacing:2px;color:#92400e;margin-bottom:8px}
.wi{font-size:13px;color:#78350f;margin:4px 0}
.tl{font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#94a3b8;margin-bottom:3px}
.tv{font-size:13px;font-weight:700}
.target-ok{color:#15803d;font-size:12px;font-weight:600;margin-top:8px}
.target-miss{color:#dc2626;font-size:12px;font-weight:600;margin-top:8px}
.ftr{background:#0f172a;padding:22px 48px;display:flex;justify-content:space-between;align-items:center}
.fl{font-size:12px;color:#475569;line-height:1.8}
.fr{font-size:11px;color:#334155;text-align:right}
@media print{.pg{margin:0;border-radius:0;box-shadow:none}}
</style></head><body>
<div class="pg">
<div class="hdr">
  <div><div class="brand">RFQ<b>Analyzer</b></div><div class="sub">${co.name} · Fabrication & Manufacturing</div></div>
  <div><div class="qt">QUOTATION</div><div class="qtm">${qid}<br>${now}</div></div>
</div>
<div class="stripe"></div>
<div class="body">
<div class="g2">
  <div class="box"><h4>Client Information</h4>
    <div class="kv"><span class="k">Client</span><span class="v">${p.client||"—"}</span></div>
    <div class="kv"><span class="k">Delivery Location</span><span class="v">${p.delivery||"—"}</span></div>
    <div class="kv"><span class="k">Surface Finish</span><span class="v">${p.finish||"Standard"}</span></div>
    <div class="kv"><span class="k">Client Delivery Target</span><span class="v">${p.required_days?p.required_days+" days":"Not specified"}</span></div>
  </div>
  <div class="box"><h4>Part Specifications</h4>
    <div class="kv"><span class="k">Material</span><span class="v">${p.material||"—"}</span></div>
    <div class="kv"><span class="k">Thickness</span><span class="v">${p.thickness||"—"} mm</span></div>
    <div class="kv"><span class="k">Length × Width</span><span class="v">${p.length||"—"} × ${p.width||"—"} mm</span></div>
    <div class="kv"><span class="k">Quantity</span><span class="v">${p.quantity||"—"} pcs</span></div>
    <div class="kv"><span class="k">Process</span><span class="v">${p.process||"—"}</span></div>
  </div>
</div>
<div class="g3">
  <div class="sc"><div class="sl">Part Weight</div><div class="sv">${costs.weight.toFixed(4)} kg</div></div>
  <div class="sc"><div class="sl">Machine Hours</div><div class="sv">${costs.mhrs.toFixed(3)} hrs</div></div>
  <div class="sc"><div class="sl">Cost Per Part</div><div class="sv" style="color:#1d4ed8">${fmt(costs.per_part)}</div></div>
</div>
<h3 class="sec">Cost Breakdown (${c.code})</h3>
<table>
  <tr><th>#</th><th>Item</th><th>Details</th><th>Amount</th></tr>
  <tr><td>1</td><td>Material</td><td>${p.material} @ ${c.sym}${costs.mat.ppkg}/kg · ${costs.weight.toFixed(4)} kg</td><td>${fmt(costs.material)}</td></tr>
  <tr><td>2</td><td>Machine</td><td>${p.process} · ${costs.mhrs.toFixed(2)} hrs</td><td>${fmt(costs.machine)}</td></tr>
  <tr><td>3</td><td>Labor</td><td>Operator & supervision</td><td>${fmt(costs.labor)}</td></tr>
  <tr><td>4</td><td>Setup</td><td>Machine setup & tooling</td><td>${fmt(costs.setup)}</td></tr>
  <tr><td>5</td><td>Finishing</td><td>Surface treatment & QC</td><td>${fmt(costs.finishing)}</td></tr>
  <tr><td>6</td><td>Packaging</td><td>Protective packing</td><td>${fmt(costs.packaging)}</td></tr>
  <tr><td>7</td><td>Transport</td><td>Freight to ${p.delivery||"destination"}</td><td>${fmt(costs.transport)}</td></tr>
  ${ex.map((e,i)=>`<tr><td>${8+i}</td><td>${e.label}</td><td>Additional charge</td><td>${fmt(+e.amount/c.rate)}</td></tr>`).join("")}
  <tr><td>${8+ex.length}</td><td>Profit & Overhead</td><td>${mg}% margin</td><td>${fmt(costs.profit)}</td></tr>
  <tr class="tr-tot"><td colspan="3"><strong>TOTAL QUOTATION VALUE</strong></td><td><strong>${fmt(costs.total)}</strong></td></tr>
  <tr class="tr-cpp"><td colspan="3">Unit Cost Per Part</td><td>${fmt(costs.per_part)} × ${p.quantity} pcs</td></tr>
</table>
${feas?.warnings?.length?`<div class="warn"><h4>⚠ Manufacturing Notes — Complexity: ${feas.complexity}</h4>${feas.warnings.map(w=>`<div class="wi">${w.msg}</div>`).join("")}</div>`:""}
${lt?`
<h3 class="sec">Production Schedule — Company Lead Time</h3>
<div style="margin-bottom:16px">
${lt.schedule.map(s=>`
<div class="gantt-row">
  <div class="gantt-lbl">${s.icon} ${s.label}<div class="gantt-sub">${s.desc}</div></div>
  <div class="gantt-track">
    <div class="gantt-bar" style="left:${(s.start-1)/lt.total*100}%;width:${s.days/lt.total*100}%;background:${s.color}">${s.days/lt.total>0.12?`Days ${s.start}–${s.end}`:""}</div>
    ${p.required_days&&+p.required_days<=lt.total?`<div style="position:absolute;left:${+p.required_days/lt.total*100}%;top:0;bottom:0;width:2px;background:#f59e0b;z-index:2"></div>`:""}
  </div>
  <div class="gantt-d">${s.end}d</div>
</div>`).join("")}
</div>
<div style="background:#f8fafc;border-radius:10px;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
  <span style="font-size:13px;color:#64748b">🏁 Total Production Lead Time</span>
  <span style="font-size:18px;font-weight:800;color:#1d4ed8">${lt.total} Working Days</span>
</div>
${p.required_days?`<p class="${lt.total<=+p.required_days?"target-ok":"target-miss"}">${lt.total<=+p.required_days?`✅ Our lead time (${lt.total}d) meets the client target of ${p.required_days} days.`:`⚠ Our lead time (${lt.total}d) exceeds client target (${p.required_days}d) by ${lt.total-+p.required_days} days — discuss expediting options.`}</p>`:""}
`:""}
<h3 class="sec" style="margin-top:22px">Commercial Terms</h3>
<div class="g4">
  <div><div class="tl">Our Lead Time</div><div class="tv">${ltLabel}</div></div>
  <div><div class="tl">Client Target</div><div class="tv">${p.required_days?p.required_days+" days":"N/A"}</div></div>
  <div><div class="tl">Quote Valid</div><div class="tv">30 days</div></div>
  <div><div class="tl">Payment</div><div class="tv">50% advance</div></div>
</div>
<p style="font-size:11px;color:#94a3b8;line-height:1.9">All prices exclude applicable taxes. Subject to final drawing approval. Lead time starts from receipt of advance payment and approved drawings.</p>
</div>
<div class="ftr">
  <div class="fl"><strong style="color:#38bdf8">RFQAnalyzer</strong><br>${co.name}<br>${now}</div>
  <div class="fr">${qid}<br>System-generated · Confidential</div>
</div>
</div></body></html>`;
}

// ════════════════════════════════════════════════════
// MINI COMPONENTS
// ════════════════════════════════════════════════════
function Pill({color="#38bdf8",children}) {
  return <span style={{display:"inline-flex",alignItems:"center",padding:"2px 9px",borderRadius:20,fontSize:10,fontWeight:700,background:color+"18",color,border:`1px solid ${color}33`,letterSpacing:.4,whiteSpace:"nowrap"}}>{children}</span>;
}

function KV({label, value, mono, accent}) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,padding:"7px 0",borderBottom:"1px solid #0d1d33"}}>
      <span style={{color:"#3d5a7a"}}>{label}</span>
      <span style={{color:accent||"#8facc8",fontWeight:600,fontFamily:mono?"'JetBrains Mono',monospace":"inherit"}}>{value}</span>
    </div>
  );
}

function StatCard({icon,label,value,sub,color="#38bdf8"}) {
  return (
    <div style={{background:"#0b1527",border:"1px solid #1a2e4a",borderRadius:12,padding:"15px 18px"}}>
      <div style={{fontSize:10,color:"#3d5a7a",letterSpacing:1,textTransform:"uppercase",marginBottom:5,display:"flex",gap:5,alignItems:"center"}}>{icon}<span>{label}</span></div>
      <div style={{fontSize:22,fontWeight:800,color,letterSpacing:-0.5,fontFamily:"'JetBrains Mono',monospace",lineHeight:1.1}}>{value}</div>
      {sub&&<div style={{fontSize:10,color:"#2a3f5a",marginTop:4}}>{sub}</div>}
    </div>
  );
}

function Field({label,hint,required,children}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      <label style={{fontSize:10,fontWeight:700,color:"#4a6380",letterSpacing:.8,textTransform:"uppercase",display:"flex",gap:3}}>
        {label}{required&&<span style={{color:"#ef4444"}}>*</span>}
      </label>
      {children}
      {hint&&<span style={{fontSize:9,color:"#2a3f5a",lineHeight:1.5}}>{hint}</span>}
    </div>
  );
}

function Donut({data}) {
  const total=data.reduce((s,d)=>s+d.value,0)||1;
  const COLS=["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444"];
  let cum=0;
  const slices=data.map((d,i)=>{const pct=d.value/total,st=cum;cum+=pct;return{pct,st,color:COLS[i%5],label:d.label};});
  const arc=(r,s,e)=>{const a1=s*2*Math.PI-Math.PI/2,a2=e*2*Math.PI-Math.PI/2,x1=80+r*Math.cos(a1),y1=80+r*Math.sin(a1),x2=80+r*Math.cos(a2),y2=80+r*Math.sin(a2);return`M80,80L${x1},${y1}A${r},${r},0,${(e-s)>.5?1:0},1,${x2},${y2}Z`;};
  return(
    <svg viewBox="0 0 160 160" width="130" height="130" style={{display:"block",margin:"0 auto"}}>
      {slices.map((s,i)=><path key={i} d={arc(60,s.st,s.st+s.pct)} fill={s.color} opacity=".88"><title>{s.label}: {(s.pct*100).toFixed(1)}%</title></path>)}
      <circle cx="80" cy="80" r="36" fill="#0b1527"/>
    </svg>
  );
}

function BarRow({label,value,max,color,symbol}) {
  return(
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
      <div style={{width:82,fontSize:11,color:"#64748b",textAlign:"right",flexShrink:0}}>{label}</div>
      <div style={{flex:1,background:"#0d1d33",borderRadius:4,height:22,overflow:"hidden"}}>
        <div style={{width:`${Math.max(2,(value/max)*100)}%`,height:"100%",background:color,transition:"width .9s ease",borderRadius:4}}/>
      </div>
      <div style={{width:80,fontSize:11,color:"#e2e8f0",fontWeight:700,textAlign:"right",fontFamily:"'JetBrains Mono',monospace",flexShrink:0}}>{symbol}{value.toFixed(2)}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════
// GANTT COMPONENT
// ════════════════════════════════════════════════════
function Gantt({schedule, total, clientDays}) {
  const CD = +clientDays||0;
  const over = CD>0 && total>CD;
  return(
    <div>
      {/* Header row */}
      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#3d5a7a",marginBottom:10,fontFamily:"'JetBrains Mono',monospace"}}>
        <span>Day 1</span>
        <span style={{fontWeight:700,color:over?"#ef4444":"#10b981"}}>
          {over ? `⚠ ${total}d — exceeds client target by ${total-CD}d` : `✅ ${total} working days${CD?` — within client target (${CD}d)`:""}`}
        </span>
        <span>Day {total}</span>
      </div>

      {/* Bars */}
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {schedule.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
            {/* Label */}
            <div style={{width:168,flexShrink:0}}>
              <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:13}}>{s.icon}</span>{s.label}
              </div>
              <div style={{fontSize:9,color:"#3d5a7a",marginTop:1}}>{s.days} day{s.days!==1?"s":""}</div>
            </div>
            {/* Track */}
            <div style={{flex:1,height:26,background:"#0d1d33",borderRadius:6,position:"relative",overflow:"hidden"}}>
              {/* client deadline marker */}
              {CD>0&&CD<=total&&(
                <div style={{position:"absolute",left:`${CD/total*100}%`,top:0,bottom:0,width:2,background:"#f59e0b",zIndex:3,opacity:.9}}/>
              )}
              <div style={{
                position:"absolute",
                left:`${(s.start-1)/total*100}%`,
                width:`${s.days/total*100}%`,
                top:2,bottom:2,
                background:s.color,borderRadius:4,opacity:.88,
                display:"flex",alignItems:"center",
                fontSize:9,color:"#fff",fontWeight:700,
                paddingLeft:5,overflow:"hidden",whiteSpace:"nowrap",
              }}>
                {s.days/total>0.12?`${s.start}–${s.end}`:""}
              </div>
            </div>
            {/* Badge */}
            <div style={{width:30,textAlign:"right",fontSize:10,color:"#4a6380",fontFamily:"'JetBrains Mono',monospace",flexShrink:0}}>{s.end}d</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      {CD>0&&(
        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:10,fontSize:10,color:"#3d5a7a"}}>
          <div style={{width:12,height:12,background:"#f59e0b",borderRadius:2}}/>
          <span>Yellow line = Client delivery target (Day {CD})</span>
        </div>
      )}

      {/* Stage descriptions */}
      <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:4}}>
        {schedule.map((s,i)=>(
          <div key={i} style={{display:"flex",gap:7,fontSize:11,color:"#3d5a7a",alignItems:"flex-start"}}>
            <span style={{width:9,height:9,borderRadius:2,background:s.color,flexShrink:0,marginTop:2,display:"inline-block"}}/>
            <span><b style={{color:"#64748b"}}>{s.label}:</b> {s.desc}</span>
          </div>
        ))}
      </div>

      {/* Total footer */}
      <div style={{marginTop:14,padding:"11px 16px",background:"#060e1c",borderRadius:9,border:"1px solid #1a2e4a",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:12,color:"#4a6380"}}>🏁 Estimated Completion from Order Confirmation</span>
        <span style={{fontSize:18,fontWeight:800,color:"#38bdf8",fontFamily:"'JetBrains Mono',monospace"}}>{total} Working Days</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════
const G = {
  app:    {minHeight:"100vh",background:"#060e1c",color:"#e2e8f0",fontFamily:"'Inter',system-ui,sans-serif"},
  topbar: {background:"linear-gradient(135deg,#0a1628,#0c1e3a)",borderBottom:"1px solid #1a2e4a",padding:"0 24px",display:"flex",alignItems:"stretch",justifyContent:"space-between",height:54,flexShrink:0},
  logo:   {display:"flex",alignItems:"center",gap:8,fontSize:19,fontWeight:800,color:"#fff",letterSpacing:-.5},
  layout: {display:"flex",height:"calc(100vh - 54px)"},
  side:   {width:205,background:"#080f1e",borderRight:"1px solid #1a2e4a",flexShrink:0,display:"flex",flexDirection:"column",overflowY:"auto"},
  navGrp: {padding:"14px 14px 5px",fontSize:9,letterSpacing:2,color:"#1e3352",textTransform:"uppercase",fontWeight:700},
  nav:    a=>({display:"flex",alignItems:"center",gap:9,padding:"9px 15px",fontSize:12.5,fontWeight:a?700:500,color:a?"#38bdf8":"#4a6380",background:a?"#0d1f38":"transparent",borderLeft:a?"3px solid #38bdf8":"3px solid transparent",cursor:"pointer",userSelect:"none"}),
  main:   {flex:1,overflowY:"auto",padding:"24px 26px"},
  card:   {background:"#0b1527",border:"1px solid #1a2e4a",borderRadius:12,padding:"18px 22px",marginBottom:16},
  cardH:  {fontSize:11,fontWeight:700,color:"#38bdf8",letterSpacing:1.8,textTransform:"uppercase",marginBottom:14,display:"flex",alignItems:"center",gap:7},
  inp:    {background:"#060e1c",border:"1px solid #1a2e4a",borderRadius:8,padding:"9px 12px",color:"#e2e8f0",fontSize:13,width:"100%",boxSizing:"border-box",fontFamily:"inherit",outline:"none"},
  sel:    {background:"#060e1c",border:"1px solid #1a2e4a",borderRadius:8,padding:"9px 12px",color:"#e2e8f0",fontSize:13,width:"100%",boxSizing:"border-box",fontFamily:"inherit",outline:"none",cursor:"pointer"},
  ta:     {background:"#060e1c",border:"1px solid #1a2e4a",borderRadius:8,padding:"11px 12px",color:"#e2e8f0",fontSize:13,width:"100%",boxSizing:"border-box",fontFamily:"inherit",outline:"none",resize:"vertical",minHeight:160,lineHeight:1.6},
  btn:    {background:"linear-gradient(135deg,#0ea5e9,#0284c7)",color:"#fff",border:"none",borderRadius:8,padding:"9px 18px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:6},
  ghost:  {background:"transparent",color:"#4a6380",border:"1px solid #1a2e4a",borderRadius:8,padding:"9px 18px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:6},
  green:  {background:"linear-gradient(135deg,#059669,#047857)",color:"#fff",border:"none",borderRadius:8,padding:"9px 18px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:6},
  purp:   {background:"linear-gradient(135deg,#7c3aed,#6d28d9)",color:"#fff",border:"none",borderRadius:8,padding:"9px 18px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:6},
  g2:     {display:"grid",gridTemplateColumns:"1fr 1fr",gap:14},
  g3:     {display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14},
  g4:     {display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:14},
  hr:     {height:1,background:"#1a2e4a",margin:"14px 0"},
};

const STEPS = [
  {id:1,icon:"⚙️",label:"Configuration"},
  {id:2,icon:"📧",label:"RFQ Input"},
  {id:3,icon:"✏️",label:"Validate"},
  {id:4,icon:"💰",label:"Cost Analysis"},
  {id:5,icon:"📄",label:"Quotation"},
];

// ════════════════════════════════════════════════════
// APP
// ════════════════════════════════════════════════════
export default function App() {
  const [step,  setStep]   = useState(1);
  const [cos,   setCos]    = useState(INIT_COMPANIES.map(c=>({...c})));
  const [coIdx, setCoIdx]  = useState(0);
  const [ccy,   setCcy]    = useState("INR");
  const [email, setEmail]  = useState("");
  const [files, setFiles]  = useState([]);
  const [p, setP]          = useState({material:"",thickness:"",length:"",width:"",quantity:"",process:"",finish:"",client:"",delivery:"",required_days:""});
  const [extras, setExtras]= useState([{label:"",amount:""}]);
  const [baseCosts, setBase]= useState(null);
  const [overrides, setOv] = useState({});   // per-key manual overrides
  const [feas, setFeas]    = useState(null);
  const [lt,   setLt]      = useState(null);
  const [qid]              = useState(genQID);
  const [busy, setBusy]    = useState(false);
  const [msg,  setMsg]     = useState(null);  // {type,text}
  const [editRates, setER] = useState(false);
  const fileRef = useRef();

  const co   = cos[coIdx];
  const curr = CURRENCIES.find(c=>c.code===ccy)||CURRENCIES[0];

  // ── computed display costs (base + overrides) ──
  const displayCosts = baseCosts ? mergeOverrides({...baseCosts, _qty:+p.quantity||1}, Object.keys(overrides).length?overrides:null) : null;

  function setCoField(k,v){ setCos(prev=>prev.map((c,i)=>i===coIdx?{...c,[k]:v}:c)); }

  function run() {
    const c = calcCosts(p, co, ccy, extras.filter(e=>e.label&&e.amount));
    const f = calcFeasibility(p);
    const l = calcLeadTime(p, c.mhrs);
    setBase(c); setFeas(f); setLt(l); setOv({}); setStep(4);
  }

  async function aiExtract() {
    if (!email.trim()) { setMsg({type:"err",text:"Paste an RFQ email first."}); return; }
    setBusy(true); setMsg({type:"ok",text:"Sending to AI…"});
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:`Extract fabrication RFQ parameters. Return ONLY JSON with keys: material, thickness, length, width, quantity, process, finish, client, delivery, required_days. Use numbers for mm/qty. Use empty string if not found.
Known materials: ${MATERIALS.map(m=>m.name).join(", ")}
Known processes: ${PROCESSES.map(p=>p.name).join(", ")}
Email:\n${email}\nONLY JSON.`}]})
      });
      const d=await res.json();
      const txt=d.content?.map(b=>b.text||"").join("")||"";
      const parsed=JSON.parse(txt.replace(/```json|```/g,"").trim());
      setP(prev=>({...prev,...parsed}));
      setMsg({type:"ok",text:"✅ AI extraction done — review fields below."});
      setStep(3);
    } catch(e) {
      const fb=regexParse(email);
      setP(prev=>({...prev,...fb}));
      setMsg({type:"warn",text:"⚠ AI unavailable — rule-based extraction used. Check fields carefully."});
      setStep(3);
    } finally { setBusy(false); }
  }

  function ruleExtract() {
    if (!email.trim()) { setMsg({type:"err",text:"Paste an RFQ email first."}); return; }
    setP(prev=>({...prev,...regexParse(email)}));
    setMsg({type:"ok",text:"✅ Rule-based extraction done — review & correct below."});
    setStep(3);
  }

  function dl(content,mime,name){
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([content],{type:mime}));
    a.download=name; a.click();
  }
  function dlHTML(){ if(!displayCosts)return; dl(buildHTML(qid,p,displayCosts,feas,co,extras.filter(e=>e.label&&e.amount),lt),"text/html",`${qid}.html`); }
  function dlCSV(){
    if(!displayCosts)return;
    const c=displayCosts,s=curr.sym;
    const rows=[
      ["Quotation ID",qid],["Date",new Date().toLocaleString()],["Company",co.name],["Currency",ccy],
      ["",""],["CLIENT",""],["Client",p.client],["Delivery",p.delivery],["Required Days",p.required_days],
      ["",""],["SPECS",""],["Material",p.material],["Thickness mm",p.thickness],["Length mm",p.length],["Width mm",p.width],["Qty",p.quantity],["Process",p.process],["Finish",p.finish],
      ["",""],["COSTS",`Amount ${ccy}`],
      ["Material",c.material.toFixed(2)],["Machine",c.machine.toFixed(2)],["Labor",c.labor.toFixed(2)],
      ["Setup",c.setup.toFixed(2)],["Finishing",c.finishing.toFixed(2)],["Packaging",c.packaging.toFixed(2)],
      ["Transport",c.transport.toFixed(2)],["Additional",c.extra.toFixed(2)],["Profit",c.profit.toFixed(2)],
      ["TOTAL",c.total.toFixed(2)],["Per Part",c.per_part.toFixed(2)],
      ["",""],["Part Weight kg",c.weight.toFixed(5)],["Machine Hours",c.mhrs.toFixed(3)],
      ...(lt?[["",""],["LEAD TIME",""],["Total Days",lt.total],...lt.schedule.map(s=>[s.label,`${s.days} days`])]:[] ),
    ];
    dl(rows.map(r=>r.map(v=>`"${v}"`).join(",")).join("\n"),"text/csv",`${qid}.csv`);
  }
  function dlJSON(){
    if(!displayCosts)return;
    dl(JSON.stringify({quotation_id:qid,generated:new Date().toISOString(),company:co.name,currency:ccy,params:p,costs:{...displayCosts,ccy:undefined,mat:undefined,proc:undefined},extras:extras.filter(e=>e.label&&e.amount),lead_time:lt?{total_days:lt.total,stages:lt.schedule.map(s=>({stage:s.label,days:s.days,end_day:s.end}))}:null},null,2),"application/json",`${qid}.json`);
  }

  function resetAll(){
    setStep(1);setBase(null);setFeas(null);setLt(null);setOv({});
    setEmail("");setP({material:"",thickness:"",length:"",width:"",quantity:"",process:"",finish:"",client:"",delivery:"",required_days:""});
    setExtras([{label:"",amount:""}]);setMsg(null);
  }

  const required=["material","thickness","length","width","quantity","process"];
  const missing=required.filter(k=>!p[k]);
  const valid=missing.length===0;
  const MC={err:"#ef4444",warn:"#f59e0b",ok:"#10b981"};

  // cost rows definition (used in step 4 table)
  const COST_ROWS = baseCosts ? [
    {k:"material", icon:"🔵", label:"Material Cost",    det:`${p.material} · ${baseCosts.weight.toFixed(4)} kg`},
    {k:"machine",  icon:"🔩", label:"Machine Cost",     det:`${p.process} · ${baseCosts.mhrs.toFixed(2)} hrs`},
    {k:"labor",    icon:"👷", label:"Labor Cost",       det:"Operator & supervision"},
    {k:"setup",    icon:"⚙️", label:"Setup Cost",       det:"Machine setup & tooling"},
    {k:"finishing",icon:"✨", label:"Finishing",         det:p.finish||"Surface treatment"},
    {k:"packaging",icon:"📦", label:"Packaging",         det:"Protective packing"},
    {k:"transport",icon:"🚛", label:"Transport",         det:`Freight to ${p.delivery||"destination"}`},
    ...(baseCosts.extra>0?[{k:"extra",icon:"➕",label:"Additional",det:"Extra charges"}]:[]),
    {k:"profit",   icon:"📈", label:`Profit (${(co.margin*100).toFixed(0)}%)`, det:"Overhead & margin"},
  ] : [];

  const BAR_COLORS=["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#ec4899","#06b6d4","#84cc16","#f97316"];

  // ══════════════════ RENDER ══════════════════
  return (
    <div style={G.app}>

      {/* TOP BAR */}
      <div style={G.topbar}>
        <div style={G.logo}>
          <span>⚙</span>RFQ<span style={{color:"#38bdf8"}}>Analyzer</span>
          <span style={{fontSize:10,fontWeight:400,color:"#1e3352",marginLeft:4,fontFamily:"'JetBrains Mono',monospace"}}>v3.0</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Pill color="#38bdf8">AI-POWERED</Pill>
          <Pill color="#10b981">PRODUCTION GRADE</Pill>
          <span style={{fontSize:11,color:"#1e3352",fontFamily:"'JetBrains Mono',monospace",marginLeft:6}}>{qid}</span>
        </div>
      </div>

      <div style={G.layout}>
        {/* SIDEBAR */}
        <div style={G.side}>
          <div style={G.navGrp}>Workflow</div>
          {STEPS.map(s=>(
            <div key={s.id} style={G.nav(step===s.id)} onClick={()=>(step>s.id||step===s.id)&&setStep(s.id)}>
              <span style={{fontSize:14,flexShrink:0}}>{s.icon}</span>
              <div>
                <div>{s.label}</div>
                {step>s.id&&<div style={{fontSize:9,color:"#10b981",marginTop:1}}>✓ Done</div>}
              </div>
            </div>
          ))}
          <div style={G.hr}/>
          <div style={{padding:"0 14px"}}>
            <div style={G.navGrp}>Session</div>
            <div style={{fontSize:11,color:"#3d5a7a",lineHeight:2.1,padding:"0 1px"}}>
              <div>Co: <b style={{color:"#64748b"}}>{co.name}</b></div>
              <div>CCY: <b style={{color:"#64748b"}}>{curr.sym} {ccy}</b></div>
              {displayCosts&&<div>Total: <b style={{color:"#38bdf8"}}>{curr.sym}{displayCosts.total.toFixed(0)}</b></div>}
              {lt&&<div>Lead: <b style={{color:"#34d399"}}>{lt.total}d</b></div>}
            </div>
          </div>
          {displayCosts&&(
            <div style={{padding:"10px 10px 0"}}>
              <button style={{...G.btn,width:"100%",justifyContent:"center",fontSize:11}} onClick={()=>setStep(5)}>📄 Quotation</button>
            </div>
          )}
        </div>

        {/* MAIN */}
        <div style={G.main}>

          {/* ══ STEP 1: CONFIG ══ */}
          {step===1&&(
            <>
              <h1 style={{fontSize:20,fontWeight:800,color:"#fff",margin:"0 0 4px"}}>Company Configuration</h1>
              <p style={{fontSize:12,color:"#3d5a7a",marginBottom:20}}>Set your company profile, rates and quotation currency.</p>

              <div style={G.card}>
                <div style={G.cardH}>⚙️ Profile & Currency</div>
                <div style={G.g2}>
                  <Field label="Company Profile">
                    <select style={G.sel} value={coIdx} onChange={e=>setCoIdx(+e.target.value)}>
                      {cos.map((c,i)=><option key={i} value={i}>{c.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Quotation Currency" hint="All amounts displayed in this currency">
                    <select style={G.sel} value={ccy} onChange={e=>setCcy(e.target.value)}>
                      {CURRENCIES.map(c=><option key={c.code} value={c.code}>{c.sym} {c.code} — 1 INR = {c.code==="INR"?"1":(1/c.rate).toFixed(5)} {c.code}</option>)}
                    </select>
                  </Field>
                </div>
                <div style={{marginTop:8,padding:"9px 13px",background:"#060e1c",borderRadius:8,border:"1px solid #1a2e4a",fontSize:12,color:"#3d5a7a"}}>
                  Conversion preview: <b style={{color:"#38bdf8"}}>₹1,000 INR = {curr.sym}{(1000/curr.rate).toFixed(2)} {ccy}</b>
                  {ccy!=="INR"&&<span style={{marginLeft:8,color:"#2a3f5a"}}>· Rate: 1 {ccy} = ₹{curr.rate}</span>}
                </div>
              </div>

              <div style={G.card}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div style={G.cardH}>💰 Machine & Labor Rates (₹/hr)</div>
                  <button style={editRates?G.green:G.btn} onClick={()=>setER(v=>!v)}>
                    {editRates?"✓ Save Rates":"✏️ Edit Rates"}
                  </button>
                </div>
                <div style={G.g3}>
                  {[
                    {k:"laser",l:"Laser Cutting",icon:"🔴"},
                    {k:"cnc",  l:"CNC Machining",icon:"🔩"},
                    {k:"bending",l:"Bending",    icon:"🔧"},
                    {k:"welding",l:"Welding",    icon:"🔥"},
                    {k:"grinding",l:"Grinding",  icon:"⚡"},
                    {k:"labor",l:"Labor / hr",   icon:"👷"},
                  ].map(({k,l,icon})=>(
                    <div key={k} style={{background:"#060e1c",border:"1px solid #1a2e4a",borderRadius:10,padding:"12px 14px"}}>
                      <div style={{fontSize:9,color:"#2a3f5a",marginBottom:5,display:"flex",gap:5,alignItems:"center"}}><span>{icon}</span>{l}</div>
                      {editRates
                        ? <input style={{...G.inp,fontSize:18,fontWeight:800,color:"#38bdf8",background:"transparent",border:"none",borderBottom:"1px solid #38bdf8",borderRadius:0,padding:"2px 0"}} type="number" value={co[k]} onChange={e=>setCoField(k,+e.target.value)}/>
                        : <div style={{fontSize:20,fontWeight:800,color:"#38bdf8",fontFamily:"'JetBrains Mono',monospace"}}>₹{co[k]}</div>
                      }
                    </div>
                  ))}
                </div>
                <div style={{...G.g4,marginTop:14}}>
                  {[
                    {k:"finishing",l:"Finishing",icon:"✨",pct:false},
                    {k:"packaging",l:"Packaging",icon:"📦",pct:false},
                    {k:"transport",l:"Transport",icon:"🚛",pct:false},
                    {k:"margin",   l:"Profit %", icon:"📈",pct:true},
                  ].map(({k,l,icon,pct})=>(
                    <div key={k} style={{background:"#060e1c",border:"1px solid #1a2e4a",borderRadius:10,padding:"12px 14px"}}>
                      <div style={{fontSize:9,color:"#2a3f5a",marginBottom:5,display:"flex",gap:5,alignItems:"center"}}><span>{icon}</span>{l}</div>
                      {editRates
                        ? <input style={{...G.inp,fontSize:16,fontWeight:800,color:"#a78bfa",background:"transparent",border:"none",borderBottom:"1px solid #a78bfa",borderRadius:0,padding:"2px 0"}} type="number" step={pct?1:1} value={pct?(co[k]*100).toFixed(0):co[k]} onChange={e=>setCoField(k,pct?+e.target.value/100:+e.target.value)}/>
                        : <div style={{fontSize:18,fontWeight:800,color:"#a78bfa",fontFamily:"'JetBrains Mono',monospace"}}>{pct?`${(co.margin*100).toFixed(0)}%`:`₹${co[k]}`}</div>
                      }
                    </div>
                  ))}
                </div>
              </div>

              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <button style={G.btn} onClick={()=>setStep(2)}>Continue to RFQ Input →</button>
              </div>
            </>
          )}

          {/* ══ STEP 2: INPUT ══ */}
          {step===2&&(
            <>
              <h1 style={{fontSize:20,fontWeight:800,color:"#fff",margin:"0 0 4px"}}>RFQ Input</h1>
              <p style={{fontSize:12,color:"#3d5a7a",marginBottom:20}}>Paste the client's email. AI will extract all manufacturing parameters automatically.</p>

              <div style={G.card}>
                <div style={G.cardH}>📧 Client Email / RFQ Text</div>
                <textarea style={G.ta} value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder={"Paste the full email here. Example:\n\nFrom: Priya Sharma <priya@abc.com>\n\nPlease quote for:\nMaterial: Mild Steel\nThickness: 5 mm\nPart Size: 200 x 100 mm\nQuantity: 50 pcs\nProcess: Laser Cutting\nSurface Finish: Powder Coat\nDelivery Location: Chennai\nRequired within: 10 days"}/>
                {msg&&<div style={{marginTop:9,padding:"8px 12px",background:MC[msg.type]+"14",border:`1px solid ${MC[msg.type]}30`,borderRadius:8,fontSize:12,color:MC[msg.type]}}>{msg.text}</div>}
                <div style={{marginTop:12,display:"flex",gap:9,flexWrap:"wrap"}}>
                  <button style={G.btn} onClick={aiExtract} disabled={busy}>{busy?"⏳ Analysing…":"⚡ Extract with AI"}</button>
                  <button style={G.ghost} onClick={ruleExtract}>🔍 Rule-based Extract</button>
                  <button style={G.ghost} onClick={()=>setStep(3)}>✏️ Manual Entry</button>
                </div>
                <div style={{marginTop:11,padding:"9px 12px",background:"#060e1c",borderRadius:8,border:"1px solid #1a2e4a",fontSize:10,color:"#2a3f5a",lineHeight:1.9}}>
                  <b style={{color:"#3d5a7a"}}>Tip —</b> include: Material · Thickness (mm) · Size L×W mm · Qty · Process · Finish · Delivery location · "required within X days"
                </div>
              </div>

              <div style={G.card}>
                <div style={G.cardH}>📁 Engineering Drawings</div>
                <div style={{border:"2px dashed #1a2e4a",borderRadius:10,padding:"28px 20px",textAlign:"center",cursor:"pointer"}}
                  onClick={()=>fileRef.current?.click()}
                  onDragOver={e=>e.preventDefault()}
                  onDrop={e=>{e.preventDefault();const fs=Array.from(e.dataTransfer.files||[]);setFiles(prev=>[...prev,...fs.map(f=>({name:f.name,size:(f.size/1024).toFixed(1)+"KB",type:f.name.split(".").pop().toUpperCase()}))]);}} >
                  <div style={{fontSize:30,marginBottom:6}}>📂</div>
                  <div style={{fontSize:13,fontWeight:600,color:"#4a6380"}}>Drop drawings here or click to browse</div>
                  <div style={{fontSize:10,color:"#2a3f5a",marginTop:4}}>PDF · DWG · DXF · STEP · IGES · PNG · JPG</div>
                  <input ref={fileRef} type="file" multiple accept=".pdf,.dwg,.dxf,.step,.iges,.png,.jpg,.jpeg" onChange={e=>{const fs=Array.from(e.target.files||[]);setFiles(prev=>[...prev,...fs.map(f=>({name:f.name,size:(f.size/1024).toFixed(1)+"KB",type:f.name.split(".").pop().toUpperCase()}))])}} style={{display:"none"}}/>
                </div>
                {files.length>0&&<div style={{marginTop:10,display:"flex",flexDirection:"column",gap:5}}>
                  {files.map((f,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:"#060e1c",borderRadius:7,border:"1px solid #1a2e4a"}}>
                      <Pill color="#10b981">{f.type}</Pill>
                      <span style={{flex:1,fontSize:12,color:"#4a6380"}}>{f.name}</span>
                      <span style={{fontSize:10,color:"#2a3f5a"}}>{f.size}</span>
                      <span style={{fontSize:10,color:"#ef4444",cursor:"pointer"}} onClick={()=>setFiles(prev=>prev.filter((_,j)=>j!==i))}>✕</span>
                    </div>
                  ))}
                </div>}
              </div>

              <div style={{display:"flex",gap:9,justifyContent:"flex-end"}}>
                <button style={G.ghost} onClick={()=>setStep(1)}>← Back</button>
                <button style={G.btn} onClick={()=>setStep(3)}>Review Parameters →</button>
              </div>
            </>
          )}

          {/* ══ STEP 3: VALIDATE ══ */}
          {step===3&&(
            <>
              <h1 style={{fontSize:20,fontWeight:800,color:"#fff",margin:"0 0 4px"}}>Validate Parameters</h1>
              <p style={{fontSize:12,color:"#3d5a7a",marginBottom:16}}>Review extracted data. Correct any errors. Fields marked * are required.</p>

              {msg&&<div style={{padding:"9px 13px",background:MC[msg.type]+"14",border:`1px solid ${MC[msg.type]}30`,borderRadius:9,fontSize:12,color:MC[msg.type],marginBottom:14,display:"flex",gap:8,alignItems:"center"}}>
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
                      {p.required_days&&<span style={{fontSize:12,color:"#f59e0b",background:"#f59e0b12",border:"1px solid #f59e0b30",borderRadius:7,padding:"6px 11px"}}>📅 Client needs delivery in <b>{p.required_days} days</b></span>}
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
                      {MATERIALS.map(m=><option key={m.name}>{m.name}</option>)}
                    </select>
                    {p.material&&(()=>{const m=MATERIALS.find(x=>x.name===p.material);return m?<span style={{fontSize:9,color:"#10b981",marginTop:2,display:"block"}}>Density {m.density} kg/m³ · ₹{m.ppkg}/kg</span>:null;})()}
                  </Field>
                  <Field label="Process" required>
                    <select style={G.sel} value={p.process} onChange={e=>setP(x=>({...x,process:e.target.value}))}>
                      <option value="">— Select —</option>
                      {PROCESSES.map(pr=><option key={pr.name}>{pr.name}</option>)}
                    </select>
                    {p.process&&(()=>{const pr=PROCESSES.find(x=>x.name===p.process);return pr?<span style={{fontSize:9,color:"#10b981",marginTop:2,display:"block"}}>₹{pr.rate}/hr · T: {pr.min_t}–{pr.max_t}mm</span>:null;})()}
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
                {!valid
                  ? <><div style={{padding:"9px 12px",background:"#ef444412",border:"1px solid #ef444430",borderRadius:7,fontSize:12,color:"#ef4444",marginBottom:8}}>Fill in required fields before calculating.</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{missing.map(f=><Pill key={f} color="#ef4444">Missing: {f}</Pill>)}</div></>
                  : <div style={{padding:"9px 12px",background:"#10b98112",border:"1px solid #10b98130",borderRadius:7,fontSize:12,color:"#10b981"}}>
                      ✅ All required fields complete.{p.required_days&&<span style={{marginLeft:10,color:"#f59e0b"}}>Client target: <b>{p.required_days} days</b></span>}
                    </div>
                }
              </div>

              <div style={{display:"flex",gap:9,justifyContent:"flex-end"}}>
                <button style={G.ghost} onClick={()=>setStep(2)}>← Back</button>
                <button style={{...G.btn,opacity:valid?1:.4,cursor:valid?"pointer":"not-allowed"}} onClick={valid?run:undefined}>Calculate Cost →</button>
              </div>
            </>
          )}

          {/* ══ STEP 4: COST ANALYSIS ══ */}
          {step===4&&baseCosts&&displayCosts&&(()=>{
            const maxV = Math.max(...COST_ROWS.map(r=>displayCosts[r.k]||0),1);
            return (
              <>
                <h1 style={{fontSize:20,fontWeight:800,color:"#fff",margin:"0 0 4px"}}>Cost Analysis</h1>
                <p style={{fontSize:12,color:"#3d5a7a",marginBottom:18}}>Click any cost value in the table to edit it directly. Total updates live.</p>

                {/* Stats */}
                <div style={G.g4}>
                  <StatCard icon="💰" label="Total Quotation" value={`${curr.sym}${displayCosts.total.toLocaleString("en-IN",{maximumFractionDigits:0})}`} color="#38bdf8"/>
                  <StatCard icon="🔩" label="Cost Per Part"   value={`${curr.sym}${displayCosts.per_part.toFixed(2)}`} color="#a78bfa"/>
                  <StatCard icon="📅" label="Lead Time (Co.)" value={lt?`${lt.total} days`:"—"} color="#34d399"
                    sub={p.required_days?(lt?.total<=+p.required_days?"✅ Within target":"⚠ Exceeds target"):undefined}/>
                  <StatCard icon="⚠" label="Complexity" value={feas.complexity}
                    color={feas.complexity==="High"?"#ef4444":feas.complexity==="Medium"?"#f59e0b":"#10b981"}/>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:16}}>
                  {/* LEFT */}
                  <div>
                    {/* ── Inline-editable cost table ── */}
                    <div style={G.card}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                        <div style={G.cardH}>📊 Cost Breakdown — Click to Edit</div>
                        {Object.keys(overrides).length>0&&(
                          <button style={{...G.ghost,fontSize:11,padding:"5px 10px",color:"#f59e0b",border:"1px solid #f59e0b30"}} onClick={()=>setOv({})}>↺ Reset</button>
                        )}
                      </div>

                      {/* Table header */}
                      <div style={{display:"grid",gridTemplateColumns:"22px 1fr 1fr 100px",gap:8,padding:"5px 0 8px",borderBottom:"1px solid #1a2e4a",marginBottom:3}}>
                        <div/><div style={{fontSize:9,color:"#1e3352",fontWeight:700,letterSpacing:1}}>ITEM</div>
                        <div style={{fontSize:9,color:"#1e3352",fontWeight:700,letterSpacing:1}}>DETAILS</div>
                        <div style={{fontSize:9,color:"#1e3352",fontWeight:700,letterSpacing:1,textAlign:"right"}}>AMOUNT</div>
                      </div>

                      {COST_ROWS.map((row,i)=>{
                        const baseVal = baseCosts[row.k];
                        const dispVal = displayCosts[row.k];
                        const edited  = overrides[row.k] !== undefined;
                        return (
                          <div key={row.k} style={{display:"grid",gridTemplateColumns:"22px 1fr 1fr 100px",gap:8,alignItems:"center",padding:"6px 0",borderBottom:"1px solid #0d1d33"}}>
                            <span style={{fontSize:12}}>{row.icon}</span>
                            <div>
                              <div style={{fontSize:12,fontWeight:600,color:edited?"#f59e0b":"#8facc8"}}>{row.label}</div>
                              {edited&&<div style={{fontSize:9,color:"#3d5a7a"}}>calc: {curr.sym}{baseVal.toFixed(2)}</div>}
                            </div>
                            <div style={{fontSize:10,color:"#2a3f5a",lineHeight:1.3}}>{row.det}</div>
                            <div style={{position:"relative"}}>
                              <span style={{position:"absolute",left:7,top:"50%",transform:"translateY(-50%)",fontSize:10,color:"#3d5a7a",pointerEvents:"none",fontFamily:"'JetBrains Mono',monospace"}}>{curr.sym}</span>
                              <input
                                type="number" step="0.01"
                                value={dispVal.toFixed(2)}
                                onChange={e=>setOv(prev=>({...prev,[row.k]:Math.max(0,+e.target.value)}))}
                                style={{...G.inp,
                                  paddingLeft:curr.sym.length>1?22:18,
                                  textAlign:"right",fontSize:12,fontWeight:700,
                                  color:edited?"#f59e0b":"#e2e8f0",
                                  borderColor:edited?"#f59e0b50":"#1a2e4a",
                                  fontFamily:"'JetBrains Mono',monospace",
                                }}
                              />
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

                      {Object.keys(overrides).length>0&&(
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

                    {/* ── LEAD TIME GANTT ── */}
                    {lt&&(
                      <div style={G.card}>
                        <div style={G.cardH}>📅 Production Lead Time — Company Estimate</div>
                        <Gantt schedule={lt.schedule} total={lt.total} clientDays={p.required_days}/>
                      </div>
                    )}
                  </div>

                  {/* RIGHT */}
                  <div>
                    {/* Donut */}
                    <div style={G.card}>
                      <div style={G.cardH}>📈 Cost Distribution</div>
                      <Donut data={[
                        {label:"Material", value:displayCosts.material},
                        {label:"Machine",  value:displayCosts.machine},
                        {label:"Labor",    value:displayCosts.labor},
                        {label:"Overhead", value:displayCosts.setup+displayCosts.finishing+displayCosts.packaging+displayCosts.transport+displayCosts.extra},
                        {label:"Profit",   value:displayCosts.profit},
                      ]}/>
                      <div style={{marginTop:10}}>
                        {[
                          ["Material","#3b82f6",displayCosts.material],
                          ["Machine","#8b5cf6",displayCosts.machine],
                          ["Labor","#10b981",displayCosts.labor],
                          ["Overhead","#f59e0b",displayCosts.setup+displayCosts.finishing+displayCosts.packaging+displayCosts.transport+displayCosts.extra],
                          ["Profit","#ef4444",displayCosts.profit],
                        ].map(([l,c,v])=>(
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
                      <KV label="Material"   value={baseCosts.mat.name} mono/>
                      <KV label="Density"    value={`${baseCosts.mat.density} kg/m³`} mono/>
                      <KV label="Weight"     value={`${baseCosts.weight.toFixed(5)} kg`} mono/>
                      <KV label="Mat. Rate"  value={`₹${baseCosts.mat.ppkg}/kg`} mono/>
                      <KV label="Process"    value={baseCosts.proc.name} mono/>
                      <KV label="Mach. Hrs"  value={`${baseCosts.mhrs.toFixed(3)} hrs`} mono/>
                      <KV label="Quantity"   value={`${p.quantity} pcs`} mono/>
                      {p.required_days&&(
                        <div style={{marginTop:9,padding:"7px 10px",
                          background:lt&&lt.total>+p.required_days?"#ef444412":"#10b98112",
                          border:`1px solid ${lt&&lt.total>+p.required_days?"#ef444430":"#10b98130"}`,
                          borderRadius:7,fontSize:11,
                          color:lt&&lt.total>+p.required_days?"#fca5a5":"#10b981"}}>
                          📅 Client target: <b>{p.required_days}d</b>
                          {lt&&<span style={{marginLeft:6}}>{lt.total<=+p.required_days?`✅ We deliver in ${lt.total}d`:`⚠ We need ${lt.total}d`}</span>}
                        </div>
                      )}
                    </div>

                    {/* Feasibility */}
                    <div style={G.card}>
                      <div style={G.cardH}>⚠ Feasibility</div>
                      {feas.warnings.length===0
                        ? <div style={{padding:"9px 11px",background:"#10b98112",border:"1px solid #10b98130",borderRadius:7,fontSize:12,color:"#10b981"}}>✅ No manufacturing issues.</div>
                        : feas.warnings.map((w,i)=>(
                          <div key={i} style={{padding:"7px 10px",borderRadius:7,marginBottom:6,fontSize:11,
                            background:w.lvl==="error"?"#ef444412":w.lvl==="warn"?"#f59e0b12":"#3b82f612",
                            border:`1px solid ${w.lvl==="error"?"#ef444430":w.lvl==="warn"?"#f59e0b30":"#3b82f630"}`,
                            color:w.lvl==="error"?"#fca5a5":w.lvl==="warn"?"#fcd34d":"#93c5fd"}}>
                            {w.msg}
                          </div>
                        ))
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
          })()}

          {/* ══ STEP 5: QUOTATION ══ */}
          {step===5&&displayCosts&&(
            <>
              <h1 style={{fontSize:20,fontWeight:800,color:"#fff",margin:"0 0 4px"}}>Final Quotation</h1>
              <p style={{fontSize:12,color:"#3d5a7a",marginBottom:18}}>Download in your preferred format. HTML → browser Print → Save as PDF for a PDF copy.</p>

              {/* Downloads */}
              <div style={G.card}>
                <div style={G.cardH}>⬇ Export</div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:10}}>
                  <button style={G.btn} onClick={dlHTML}>🌐 HTML <Pill color="#38bdf8">→ PDF via Print</Pill></button>
                  <button style={G.green} onClick={dlCSV}>📊 CSV / Excel</button>
                  <button style={G.purp} onClick={dlJSON}>{ }JSON / API</button>
                </div>
                <div style={{fontSize:10,color:"#2a3f5a",lineHeight:1.9,background:"#060e1c",padding:"9px 12px",borderRadius:8,border:"1px solid #1a2e4a"}}>
                  <b style={{color:"#3d5a7a"}}>HTML</b> opens in browser — File → Print → Save as PDF gives a print-quality PDF. &nbsp;·&nbsp;
                  <b style={{color:"#3d5a7a"}}>CSV</b> opens in Excel/Sheets. &nbsp;·&nbsp;
                  <b style={{color:"#3d5a7a"}}>JSON</b> for ERP integration.
                </div>
              </div>

              {/* Preview card */}
              <div style={{...G.card,background:"#0b1527",border:"1px solid #1e3a5f"}}>
                {/* Header */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,paddingBottom:16,borderBottom:"1px solid #1a2e4a"}}>
                  <div>
                    <div style={{fontSize:20,fontWeight:800,color:"#fff"}}>RFQ<span style={{color:"#38bdf8"}}>Analyzer</span></div>
                    <div style={{fontSize:11,color:"#2a3f5a",marginTop:2}}>{co.name} · Fabrication Services</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:24,fontWeight:800,color:"#e2e8f0",letterSpacing:-1}}>QUOTATION</div>
                    <div style={{fontSize:11,color:"#2a3f5a",marginTop:3,fontFamily:"'JetBrains Mono',monospace"}}>{qid}</div>
                    <div style={{fontSize:11,color:"#2a3f5a"}}>{new Date().toLocaleDateString("en-IN",{year:"numeric",month:"long",day:"numeric"})}</div>
                  </div>
                </div>

                <div style={G.g2}>
                  <div>
                    <div style={{fontSize:9,color:"#1e3352",letterSpacing:2,textTransform:"uppercase",fontWeight:700,marginBottom:8}}>Client</div>
                    <div style={{fontSize:14,color:"#e2e8f0",fontWeight:700}}>{p.client||"—"}</div>
                    <div style={{fontSize:12,color:"#3d5a7a",marginTop:3}}>📍 {p.delivery||"—"}</div>
                    {p.required_days&&<div style={{fontSize:12,color:"#f59e0b",marginTop:2}}>📅 Requires delivery in {p.required_days} days</div>}
                  </div>
                  <div>
                    <div style={{fontSize:9,color:"#1e3352",letterSpacing:2,textTransform:"uppercase",fontWeight:700,marginBottom:8}}>Specifications</div>
                    <div style={{fontSize:12,color:"#4a6380",lineHeight:2}}>
                      <div>{p.material} · {p.thickness}mm</div>
                      <div>{p.length} × {p.width} mm · {p.quantity} pcs</div>
                      <div>{p.process} · {p.finish||"Standard"}</div>
                    </div>
                  </div>
                </div>

                <div style={G.hr}/>

                {[
                  ["Material Cost",       displayCosts.material],
                  ["Machine Cost",        displayCosts.machine],
                  ["Labor Cost",          displayCosts.labor],
                  ["Setup & Finishing",   displayCosts.setup+displayCosts.finishing],
                  ["Packaging & Transport",displayCosts.packaging+displayCosts.transport],
                  ...(displayCosts.extra>0?[["Additional Charges",displayCosts.extra]]:[]),
                  [`Profit (${(co.margin*100).toFixed(0)}%)`,displayCosts.profit],
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

                {/* Terms grid */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:lt&&p.required_days?12:0}}>
                  {[
                    ["Our Lead Time",  lt?`${lt.total} working days`:(+p.quantity>500?"21 days":+p.quantity>100?"14 days":"7 days")],
                    ["Client Target",  p.required_days?`${p.required_days} days`:"N/A"],
                    ["Quote Valid",    "30 days"],
                    ["Payment",        "50% advance"],
                  ].map(([k,v])=>(
                    <div key={k} style={{background:"#060e1c",borderRadius:8,padding:"9px 11px"}}>
                      <div style={{fontSize:9,color:"#1e3352",letterSpacing:1,textTransform:"uppercase",marginBottom:3}}>{k}</div>
                      <div style={{fontSize:12,fontWeight:700,color:"#64748b"}}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Lead time vs target banner */}
                {lt&&p.required_days&&(
                  <div style={{padding:"9px 13px",borderRadius:8,fontSize:12,fontWeight:600,
                    background:lt.total<=+p.required_days?"#10b98112":"#ef444412",
                    border:`1px solid ${lt.total<=+p.required_days?"#10b98130":"#ef444430"}`,
                    color:lt.total<=+p.required_days?"#10b981":"#fca5a5"}}>
                    {lt.total<=+p.required_days
                      ?`✅ Our production lead time (${lt.total} days) meets client's target of ${p.required_days} days.`
                      :`⚠ Our production lead time (${lt.total} days) exceeds client's target (${p.required_days} days) by ${lt.total-+p.required_days} days — discuss expediting options.`}
                  </div>
                )}
              </div>

              {feas?.warnings?.length>0&&(
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

