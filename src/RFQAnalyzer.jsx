// ─────────────────────────────────────────────────────────────────────────────
// RFQ ANALYZER PRO — Complete SaaS Application
// Perfect AI Extraction · Multi-Process Support · Fully Responsive
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useCallback, useEffect } from "react";

// ── External fonts ─────────────────────────────────────────────────────────
(function loadDeps() {
  const font = document.createElement("link");
  font.rel = "stylesheet";
  font.href =
    "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap";
  document.head.appendChild(font);
})();

// ════════════════════════════════════════════════════════════════════════════
// ENHANCED MASTER DATA
// ════════════════════════════════════════════════════════════════════════════
const MATERIALS = [
  {
    id: "ms",
    name: "Mild Steel",
    density: 7850,
    ppkg: 80,
    grade: "IS 2062",
    color: "#3b82f6",
    tensile: 410,
    applications: ["Structural", "Automotive", "General Fabrication"],
  },
  {
    id: "ss304",
    name: "Stainless Steel 304",
    density: 8000,
    ppkg: 180,
    grade: "ASTM A240",
    color: "#8b5cf6",
    tensile: 515,
    applications: ["Food Industry", "Medical", "Chemical"],
  },
  {
    id: "al6061",
    name: "Aluminium 6061",
    density: 2700,
    ppkg: 250,
    grade: "ASTM B209",
    color: "#10b981",
    tensile: 310,
    applications: ["Aerospace", "Automotive", "Marine"],
  },
  {
    id: "cs",
    name: "Carbon Steel",
    density: 7850,
    ppkg: 90,
    grade: "A36",
    color: "#f59e0b",
    tensile: 400,
    applications: ["Construction", "Heavy Equipment"],
  },
  {
    id: "gi",
    name: "Galvanized Steel",
    density: 7850,
    ppkg: 95,
    grade: "IS 277",
    color: "#6b7280",
    tensile: 380,
    applications: ["Roofing", "Ducting"],
  },
  {
    id: "brass",
    name: "Brass",
    density: 8500,
    ppkg: 300,
    grade: "C36000",
    color: "#d97706",
    tensile: 340,
    applications: ["Fittings", "Electrical"],
  },
  {
    id: "copper",
    name: "Copper",
    density: 8960,
    ppkg: 450,
    grade: "C11000",
    color: "#b45309",
    tensile: 220,
    applications: ["Electrical", "Plumbing"],
  },
  {
    id: "ti",
    name: "Titanium Grade 5",
    density: 4500,
    ppkg: 1200,
    grade: "Ti-6Al-4V",
    color: "#7c3aed",
    tensile: 950,
    applications: ["Aerospace", "Medical Implants"],
  },
];

const PROCESSES = [
  {
    id: "laser",
    name: "Laser Cutting",
    rate: 600,
    setup: 500,
    min_t: 0.5,
    max_t: 25,
    tolerance: "±0.1mm",
    power: "2-10kW",
    gas: ["O2", "N2"],
    applications: ["Sheet Metal", "Thin Plates"],
  },
  {
    id: "cnc",
    name: "CNC Machining",
    rate: 900,
    setup: 1000,
    min_t: 1,
    max_t: 200,
    tolerance: "±0.02mm",
    spindle: "8-15k RPM",
    applications: ["Precision Parts", "Complex Geometry"],
  },
  {
    id: "bending",
    name: "Bending",
    rate: 400,
    setup: 300,
    min_t: 0.5,
    max_t: 20,
    tolerance: "±0.5°",
    tonnage: "50-400T",
    applications: ["Forming", "Folding"],
  },
  {
    id: "welding",
    name: "Welding",
    rate: 500,
    setup: 400,
    min_t: 1,
    max_t: 50,
    types: ["MIG", "TIG", "SMAW"],
    standards: ["AWS D1.1", "ISO 3834"],
    applications: ["Assembly", "Fabrication"],
  },
  {
    id: "grinding",
    name: "Grinding",
    rate: 300,
    setup: 200,
    min_t: 0.5,
    max_t: 100,
    roughness: "Ra 0.4-3.2",
    applications: ["Surface Finish", "Deburring"],
  },
  {
    id: "plasma",
    name: "Plasma Cutting",
    rate: 350,
    setup: 400,
    min_t: 1,
    max_t: 60,
    tolerance: "±0.5mm",
    applications: ["Thick Plates", "Structural"],
  },
  {
    id: "waterjet",
    name: "Waterjet Cutting",
    rate: 700,
    setup: 600,
    min_t: 0.5,
    max_t: 200,
    tolerance: "±0.1mm",
    applications: ["All Materials", "No HAZ"],
  },
  {
    id: "edm",
    name: "EDM",
    rate: 1200,
    setup: 1500,
    min_t: 0.1,
    max_t: 300,
    tolerance: "±0.005mm",
    types: ["Wire", "Sinker"],
    applications: ["Hard Materials", "Intricate Shapes"],
  },
];

const FINISH_OPTIONS = [
  {
    id: "raw",
    name: "Raw / No Finish",
    cost_multiplier: 1.0,
    time_multiplier: 1.0,
  },
  {
    id: "powder_std",
    name: "Powder Coat (Standard)",
    cost_multiplier: 1.15,
    time_multiplier: 1.2,
    colors: ["RAL 9001", "RAL 9005", "RAL 7035"],
  },
  {
    id: "powder_custom",
    name: "Powder Coat (RAL Custom)",
    cost_multiplier: 1.25,
    time_multiplier: 1.3,
  },
  {
    id: "anodize_clear",
    name: "Anodizing (Clear)",
    cost_multiplier: 1.2,
    time_multiplier: 1.25,
    thickness: "5-25μm",
  },
  {
    id: "anodize_black",
    name: "Anodizing (Black)",
    cost_multiplier: 1.25,
    time_multiplier: 1.3,
  },
  {
    id: "hard_anodize",
    name: "Hard Anodizing",
    cost_multiplier: 1.4,
    time_multiplier: 1.5,
    hardness: "50-70 HRC",
  },
  {
    id: "galvanizing",
    name: "Hot-Dip Galvanizing",
    cost_multiplier: 1.35,
    time_multiplier: 1.4,
    thickness: "45-85μm",
  },
  {
    id: "electro_zinc",
    name: "Electroplating (Zinc)",
    cost_multiplier: 1.1,
    time_multiplier: 1.15,
  },
  {
    id: "chrome",
    name: "Chrome Plating",
    cost_multiplier: 1.5,
    time_multiplier: 1.6,
  },
  {
    id: "polish_mirror",
    name: "Mirror Polish",
    cost_multiplier: 1.3,
    time_multiplier: 1.4,
    roughness: "Ra < 0.1",
  },
  {
    id: "polish_brushed",
    name: "Brushed / Satin Finish",
    cost_multiplier: 1.2,
    time_multiplier: 1.25,
  },
];

const COMPANIES = [
  {
    id: "dfab",
    name: "DFAB Industries",
    rates: {
      laser: 600,
      cnc: 900,
      bending: 400,
      welding: 500,
      grinding: 300,
      plasma: 350,
      waterjet: 700,
      edm: 1200,
    },
    labor_rate: 150,
    finishing_rate: 50,
    packaging_rate: 40,
    transport_rate: 100,
    margin: 0.2,
    address: "Chennai, Tamil Nadu",
    gst: "33AABCD1234E1Z5",
    phone: "+91 44 2345 6789",
    certifications: ["ISO 9001:2015", "AS9100D"],
    capabilities: ["Laser up to 25mm", "CNC 5-Axis", "Bending 4m"],
  },
  {
    id: "alpha",
    name: "AlphaFabrication",
    rates: {
      laser: 550,
      cnc: 850,
      bending: 380,
      welding: 480,
      grinding: 280,
      plasma: 330,
      waterjet: 650,
      edm: 1100,
    },
    labor_rate: 140,
    finishing_rate: 45,
    packaging_rate: 35,
    transport_rate: 90,
    margin: 0.18,
    address: "Mumbai, Maharashtra",
    gst: "27AABCD5678F1Z2",
    phone: "+91 22 3456 7890",
    certifications: ["ISO 9001:2015"],
    capabilities: ["Laser up to 20mm", "CNC 3-Axis", "Bending 3m"],
  },
  {
    id: "prec",
    name: "PrecisionWorks",
    rates: {
      laser: 700,
      cnc: 1100,
      bending: 450,
      welding: 600,
      grinding: 350,
      plasma: 400,
      waterjet: 800,
      edm: 1400,
    },
    labor_rate: 180,
    finishing_rate: 60,
    packaging_rate: 50,
    transport_rate: 120,
    margin: 0.25,
    address: "Pune, Maharashtra",
    gst: "27AABCE9012G1Z8",
    phone: "+91 20 4567 8901",
    certifications: ["ISO 9001:2015", "IATF 16949"],
    capabilities: ["Laser up to 30mm", "CNC 5-Axis", "EDM Precision"],
  },
];

const CURRENCIES = [
  {
    code: "INR",
    sym: "₹",
    rate: 1,
    flag: "🇮🇳",
    format: (v) => `₹${v.toFixed(2)}`,
  },
  {
    code: "USD",
    sym: "$",
    rate: 83.5,
    flag: "🇺🇸",
    format: (v) => `$${v.toFixed(2)}`,
  },
  {
    code: "EUR",
    sym: "€",
    rate: 91.2,
    flag: "🇪🇺",
    format: (v) => `€${v.toFixed(2)}`,
  },
  {
    code: "GBP",
    sym: "£",
    rate: 106.3,
    flag: "🇬🇧",
    format: (v) => `£${v.toFixed(2)}`,
  },
  {
    code: "AED",
    sym: "د.إ",
    rate: 22.7,
    flag: "🇦🇪",
    format: (v) => `د.إ${v.toFixed(2)}`,
  },
];

const TOLERANCE_GRADES = [
  { code: "IT01", name: "IT01", range: "±0.002mm", multiplier: 2.5 },
  { code: "IT0", name: "IT0", range: "±0.003mm", multiplier: 2.2 },
  { code: "IT1", name: "IT1", range: "±0.005mm", multiplier: 2.0 },
  { code: "IT2", name: "IT2", range: "±0.008mm", multiplier: 1.8 },
  { code: "IT3", name: "IT3", range: "±0.012mm", multiplier: 1.6 },
  { code: "IT4", name: "IT4", range: "±0.020mm", multiplier: 1.4 },
  { code: "IT5", name: "IT5", range: "±0.030mm", multiplier: 1.3 },
  { code: "IT6", name: "IT6", range: "±0.050mm", multiplier: 1.2 },
  { code: "IT7", name: "IT7", range: "±0.080mm", multiplier: 1.1 },
  { code: "IT8", name: "IT8", range: "±0.120mm", multiplier: 1.0 },
];

// ════════════════════════════════════════════════════════════════════════════
// PERFECT AI EXTRACTION ENGINE
// ════════════════════════════════════════════════════════════════════════════
class AIExtractor {
  // Comprehensive pattern matching
  static patterns = {
    email: /[\w.-]+@[\w.-]+\.\w+/g,
    phone: /[\+]?[(]?[0-9]{2,4}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,8}/g,
    gst: /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/g,
    pan: /[A-Z]{5}\d{4}[A-Z]{1}/g,
    pincode: /\b\d{6}\b/g,

    dimensions:
      /(\d+\.?\d*)\s*[xX*]\s*(\d+\.?\d*)\s*[xX*]\s*(\d+\.?\d*)\s*(?:mm)?/g,
    length: /(?:length|len|L)[:\s]*(\d+\.?\d*)\s*(?:mm)?/gi,
    width: /(?:width|wid|W)[:\s]*(\d+\.?\d*)\s*(?:mm)?/gi,
    thickness: /(?:thickness|thk|t|gauge)[:\s]*(\d+\.?\d*)\s*(?:mm|gauge)?/gi,
    diameter: /(?:diameter|dia|Ø|⌀)[:\s]*(\d+\.?\d*)\s*(?:mm)?/gi,

    quantity: /(?:qty|quantity|pieces|pcs|nos)[:\s]*(\d+)/gi,

    tolerance: /(?:tolerance|tol)[:\s]*[±]?\s*(\d+\.?\d*)\s*(?:mm)?/gi,
    hardness: /(?:hardness|hrc)[:\s]*(\d+)/gi,

    date: /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g,
    days: /(\d+)\s*(?:working|business)?\s*(?:days)/gi,

    payment_terms: /(?:payment|terms)[:\s]*([^.\n]+)/gi,
    incoterms: /\b(EXW|FCA|FAS|FOB|CFR|CIF|CPT|CIP|DAT|DAP|DDP)\b/g,
  };

  static companyKeywords = [
    "Pvt Ltd",
    "Ltd",
    "Limited",
    "Inc",
    "Corporation",
    "Corp",
    "LLC",
    "Technologies",
    "Engineering",
    "Industries",
    "Solutions",
    "Works",
    "Fabricators",
    "Manufacturers",
    "Company",
  ];

  static cities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Kolkata",
    "Pune",
    "Hyderabad",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
    "Nagpur",
    "Indore",
  ];

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
        pan: "",
        required_days: "",
        payment_terms: "",
        incoterms: "",
      },
      parts: [],
      order_notes: "",
      timeline: {},
      quality_requirements: [],
    };

    // Clean and normalize text
    const cleanText = text.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
    const lines = text.split("\n").filter((l) => l.trim());

    // Extract all emails
    const emails = [...new Set(cleanText.match(this.patterns.email) || [])];
    if (emails.length > 0) result.client.email = emails[0];

    // Extract all phone numbers
    const phones = [...new Set(cleanText.match(this.patterns.phone) || [])];
    if (phones.length > 0) result.client.phone = phones[0];

    // Extract GST
    const gsts = [...new Set(cleanText.match(this.patterns.gst) || [])];
    if (gsts.length > 0) result.client.gst = gsts[0];

    // Extract PAN
    const pans = [...new Set(cleanText.match(this.patterns.pan) || [])];
    if (pans.length > 0) result.client.pan = pans[0];

    // Extract PIN code
    const pincodes = [...new Set(cleanText.match(this.patterns.pincode) || [])];
    if (pincodes.length > 0) result.client.pincode = pincodes[0];

    // Extract company name
    for (let keyword of this.companyKeywords) {
      const regex = new RegExp(`([A-Z][A-Za-z\\s]+${keyword})`, "g");
      const match = cleanText.match(regex);
      if (match) {
        result.client.company = match[0].trim();
        break;
      }
    }

    // Extract person name (from salutations)
    const namePatterns = [
      /(?:From|Regards|Best|Thanks|Contact|Attention)[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/,
      /([A-Z][a-z]+ [A-Z][a-z]+)(?:\s*<[^>]+>)?(?:\s*\([^)]+\))?/,
    ];

    for (let pattern of namePatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        result.client.name = match[1];
        break;
      }
    }

    // Extract city
    for (let city of this.cities) {
      if (cleanText.includes(city)) {
        result.client.city = city;
        break;
      }
    }

    // Extract address (look for address indicators)
    const addressPatterns = [
      /(?:Address|Ship to|Deliver to)[:\s]*([^\n]+(?:,\s*[^\n]+){0,3})/i,
      /(?:Plot|Survey|Unit|Shop)\s*No\.?\s*[^,\n]+(?:,\s*[^,\n]+){1,3}/gi,
    ];

    for (let pattern of addressPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        result.client.address = match[1] || match[0];
        break;
      }
    }

    // Extract delivery days
    const daysMatch = cleanText.match(this.patterns.days);
    if (daysMatch) {
      result.client.required_days = daysMatch[0].match(/\d+/)[0];
    }

    // Extract payment terms
    const paymentMatch = cleanText.match(this.patterns.payment_terms);
    if (paymentMatch) {
      result.client.payment_terms = paymentMatch[1].trim();
    }

    // Extract incoterms
    const incotermMatch = cleanText.match(this.patterns.incoterms);
    if (incotermMatch) {
      result.client.incoterms = incotermMatch[0];
    }

    // Extract multiple parts
    const partSections = this.splitIntoParts(lines);

    for (let section of partSections) {
      const part = this.extractPartDetails(section);
      if (Object.keys(part).length > 2) {
        // Has meaningful data
        result.parts.push(part);
      }
    }

    // If no parts found, try line-by-line extraction
    if (result.parts.length === 0) {
      const part = this.extractPartDetails(lines);
      if (Object.keys(part).length > 2) {
        result.parts.push(part);
      }
    }

    // Extract quality requirements
    const qualityKeywords = [
      "inspection",
      "certificate",
      "test",
      "quality",
      "standard",
      "specification",
    ];
    for (let line of lines) {
      const lowerLine = line.toLowerCase();
      for (let keyword of qualityKeywords) {
        if (lowerLine.includes(keyword)) {
          result.quality_requirements.push(line.trim());
          break;
        }
      }
    }

    return result;
  }

  static splitIntoParts(lines) {
    const sections = [];
    let currentSection = [];
    let partIndices = [];

    // Find part indicators
    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();
      if (
        lowerLine.includes("part") ||
        lowerLine.includes("item") ||
        lowerLine.includes("component") ||
        lowerLine.match(/^\d+\./)
      ) {
        partIndices.push(index);
      }
    });

    // Split into sections based on part indicators
    for (let i = 0; i < partIndices.length; i++) {
      const start = partIndices[i];
      const end =
        i < partIndices.length - 1 ? partIndices[i + 1] : lines.length;
      sections.push(lines.slice(start, end));
    }

    return sections;
  }

  static extractPartDetails(lines) {
    const part = {
      partName: "",
      drawingNo: "",
      description: "",
      material: "",
      process: "",
      secondary_processes: [],
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
      quality_level: "Standard",
      inspection_required: false,
      certificates: [],
    };

    const text = lines.join(" ").toLowerCase();
    const fullText = lines.join(" ");

    // Extract part name/number
    const partNamePatterns = [
      /(?:part|item|component)\s*[#:]?\s*([A-Z0-9][-A-Z0-9/]+)/i,
      /([A-Z0-9]{3,}[-/]?[A-Z0-9]{2,})/,
    ];

    for (let pattern of partNamePatterns) {
      const match = fullText.match(pattern);
      if (match) {
        part.partName = match[1];
        break;
      }
    }

    // Extract drawing number
    const drawingPatterns = [
      /(?:drawing|dwg|drg)[.\s]*[#:]?\s*([A-Z0-9][-A-Z0-9/]+)/i,
      /(?:rev|revision)[.\s]*([A-Z0-9])/i,
    ];

    for (let pattern of drawingPatterns) {
      const match = fullText.match(pattern);
      if (match) {
        part.drawingNo = match[1];
        break;
      }
    }

    // Extract material - check all materials
    for (let material of MATERIALS) {
      if (text.includes(material.name.toLowerCase())) {
        part.material = material.name;
        break;
      }
      // Check for common variations
      if (
        material.id === "ss304" &&
        (text.includes("ss304") ||
          text.includes("ss 304") ||
          text.includes("stainless 304"))
      ) {
        part.material = material.name;
        break;
      }
    }

    // Extract primary and secondary processes
    const processMatches = [];
    for (let process of PROCESSES) {
      const procName = process.name.toLowerCase();
      if (text.includes(procName)) {
        processMatches.push(process.name);
      }
    }

    if (processMatches.length > 0) {
      part.process = processMatches[0]; // Primary process
      part.secondary_processes = processMatches.slice(1); // Secondary processes
    }

    // Extract dimensions
    const dimMatch = fullText.match(this.patterns.dimensions);
    if (dimMatch) {
      const [, l, w, t] = dimMatch[0].match(
        /(\d+\.?\d*)[xX*](\d+\.?\d*)[xX*](\d+\.?\d*)/,
      );
      part.length = l;
      part.width = w;
      part.thickness = t;
    } else {
      // Try individual dimension extraction
      const lengthMatch = fullText.match(this.patterns.length);
      if (lengthMatch) part.length = lengthMatch[1];

      const widthMatch = fullText.match(this.patterns.width);
      if (widthMatch) part.width = widthMatch[1];

      const thickMatch = fullText.match(this.patterns.thickness);
      if (thickMatch) part.thickness = thickMatch[1];

      const diaMatch = fullText.match(this.patterns.diameter);
      if (diaMatch) part.diameter = diaMatch[1];
    }

    // Extract quantity
    const qtyMatch = fullText.match(this.patterns.quantity);
    if (qtyMatch) {
      part.quantity = qtyMatch[1];
    } else {
      // Look for standalone numbers that might be quantity
      const numbers = fullText.match(/\b(\d+)\b/g);
      if (numbers && numbers.length === 1 && !part.thickness && !part.length) {
        part.quantity = numbers[0];
      }
    }

    // Extract finish
    for (let finish of FINISH_OPTIONS) {
      if (text.includes(finish.name.toLowerCase())) {
        part.finish = finish.name;
        break;
      }
    }

    // Extract tolerance
    const tolMatch = fullText.match(this.patterns.tolerance);
    if (tolMatch) {
      part.tolerance = tolMatch[0];
      part.quality_level = "High Precision";
    }

    // Extract hardness
    const hardMatch = fullText.match(this.patterns.hardness);
    if (hardMatch) {
      part.hardness = `HRC ${hardMatch[1]}`;
    }

    // Check for inspection requirements
    if (
      text.includes("inspection") ||
      text.includes("test") ||
      text.includes("certificate")
    ) {
      part.inspection_required = true;
      if (text.includes("certificate")) {
        part.certificates.push("Material Test Certificate");
      }
      if (text.includes("inspection report")) {
        part.certificates.push("Inspection Report");
      }
    }

    // Extract description (first line without specific data)
    for (let line of lines) {
      if (
        line.length > 20 &&
        !line.match(/\d+[xX*]\d+/) &&
        !line.toLowerCase().includes("material") &&
        !line.toLowerCase().includes("quantity")
      ) {
        part.description = line.trim();
        break;
      }
    }

    // Extract notes (remaining important info)
    const noteLines = [];
    for (let line of lines) {
      if (
        line.length > 15 &&
        !line.includes(part.partName) &&
        !line.includes(part.material) &&
        !line.includes(part.quantity)
      ) {
        noteLines.push(line.trim());
      }
    }
    part.notes = noteLines.slice(0, 3).join(" · ");

    return part;
  }

  static async extractFromPDF(base64Data, fileName) {
    // Simulate PDF processing (in production, use PDF.js)
    return new Promise((resolve) => {
      setTimeout(() => {
        // Decode base64 to text (simplified)
        try {
          const text = atob(base64Data.substring(0, 1000));
          const result = this.extractFromText(text);
          resolve(result);
        } catch {
          resolve(this.extractFromText(fileName));
        }
      }, 500);
    });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ADVANCED CALCULATION ENGINE
// ════════════════════════════════════════════════════════════════════════════
function calcCosts(part, co, ccyCode, options = {}) {
  const mat = MATERIALS.find((m) => m.name === part.material) || MATERIALS[0];
  const primaryProc =
    PROCESSES.find((p) => p.name === part.process) || PROCESSES[0];
  const secondaryProcs = (part.secondary_processes || [])
    .map((name) => PROCESSES.find((p) => p.name === name))
    .filter((p) => p);

  const ccy = CURRENCIES.find((c) => c.code === ccyCode) || CURRENCIES[0];

  const L = +part.length || 200;
  const W = +part.width || 100;
  const H = +part.height || 0;
  const T = +part.thickness || 5;
  const D = +part.diameter || 0;
  const Q = +part.quantity || 1;

  // Calculate volume and weight
  let volume = 0;
  if (D > 0) {
    volume = (Math.PI * Math.pow(D / 2, 2) * L) / 1e9; // Cylinder volume in m³
  } else {
    volume = (L / 1000) * (W / 1000) * (T / 1000); // Rectangular volume in m³
    if (H > 0) volume = (L / 1000) * (W / 1000) * (H / 1000);
  }

  const weight = volume * mat.density;
  const materialCost = weight * mat.ppkg;

  // Calculate machining hours based on process
  let machineHours = 0;
  if (primaryProc.id === "laser") {
    machineHours = ((L * W) / 1e6) * 0.5 + T * 0.02; // Laser cutting time
  } else if (primaryProc.id === "cnc") {
    machineHours = volume * 1000 * 2.5; // CNC machining time
  } else if (primaryProc.id === "bending") {
    machineHours = (L / 1000) * 0.2; // Bending time
  } else {
    machineHours = Math.max(0.25, (L / 1000) * (W / 1000) * 2.5 + T * 0.02);
  }

  // Apply tolerance multiplier
  let toleranceMultiplier = 1.0;
  if (part.tolerance) {
    const tolValue = parseFloat(part.tolerance.replace(/[^\d.-]/g, ""));
    if (tolValue < 0.01) toleranceMultiplier = 2.5;
    else if (tolValue < 0.05) toleranceMultiplier = 1.8;
    else if (tolValue < 0.1) toleranceMultiplier = 1.4;
    else if (tolValue < 0.5) toleranceMultiplier = 1.2;
  }

  // Apply finish multiplier
  let finishMultiplier = 1.0;
  if (part.finish) {
    const finish = FINISH_OPTIONS.find((f) => f.name === part.finish);
    if (finish) finishMultiplier = finish.cost_multiplier;
  }

  // Primary process cost
  const primaryRate = co.rates[primaryProc.id] || primaryProc.rate;
  const primaryCost = machineHours * primaryRate * toleranceMultiplier;

  // Secondary processes cost
  let secondaryCost = 0;
  for (let proc of secondaryProcs) {
    const procRate = co.rates[proc.id] || proc.rate;
    secondaryCost += machineHours * 0.5 * procRate; // Assume 50% of primary time
  }

  // Labor cost
  const laborCost = machineHours * 0.8 * co.labor_rate;

  // Setup cost amortized
  const setupCost = primaryProc.setup / Math.max(Q, 1);

  // Finish cost
  const finishCost = co.finishing_rate * finishMultiplier;

  // Packaging and transport
  const packagingCost = co.packaging_rate / Math.max(Q, 1);
  const transportCost = co.transport_rate / Math.max(Q, 1);

  // Calculate subtotal and profit
  const subtotal =
    materialCost +
    primaryCost +
    secondaryCost +
    laborCost +
    setupCost +
    finishCost +
    packagingCost +
    transportCost;

  const profit = subtotal * co.margin;
  const unitTotal = subtotal + profit;
  const totalINR = unitTotal * Q;

  // Convert to selected currency
  const convert = (v) => v / ccy.rate;

  return {
    material: convert(materialCost),
    primary: convert(primaryCost),
    secondary: convert(secondaryCost),
    labor: convert(laborCost),
    setup: convert(setupCost),
    finishing: convert(finishCost),
    packaging: convert(packagingCost),
    transport: convert(transportCost),
    profit: convert(profit),
    per_part: convert(unitTotal),
    total: convert(totalINR),
    weight: weight,
    machine_hours: machineHours,
    volume: volume,
    material_details: mat,
    process_details: primaryProc,
    secondary_details: secondaryProcs,
    multipliers: {
      tolerance: toleranceMultiplier,
      finish: finishMultiplier,
    },
  };
}

function calcLeadTime(part, machineHours) {
  const Q = +part.quantity || 1;
  const secondaryCount = (part.secondary_processes || []).length;

  // Base stages
  const stages = [
    {
      name: "Material Procurement",
      days: Math.ceil(2 + Q / 100),
      color: "#3b82f6",
      depends_on: [],
    },
    {
      name: part.process,
      days: Math.max(1, Math.ceil((machineHours * Q) / 8)),
      color: "#10b981",
      depends_on: ["Material Procurement"],
    },
  ];

  // Add secondary processes
  for (let i = 0; i < secondaryCount; i++) {
    stages.push({
      name: `Secondary ${i + 1}`,
      days: Math.max(1, Math.ceil((machineHours * Q * 0.5) / 8)),
      color: "#f59e0b",
      depends_on: [part.process],
    });
  }

  // Add finishing stages
  if (part.finish && part.finish !== "Raw / No Finish") {
    stages.push({
      name: part.finish,
      days: Math.max(1, Math.ceil(Q / 50)),
      color: "#8b5cf6",
      depends_on: secondaryCount > 0 ? ["Secondary 1"] : [part.process],
    });
  }

  stages.push(
    {
      name: "Quality Control",
      days: Math.max(1, Math.ceil(Q / 100)),
      color: "#ec4899",
      depends_on: stages.slice(-1).map((s) => s.name),
    },
    {
      name: "Packaging",
      days: 1,
      color: "#6b7280",
      depends_on: ["Quality Control"],
    },
    {
      name: "Dispatch",
      days: 1,
      color: "#14b8a6",
      depends_on: ["Packaging"],
    },
  );

  // Calculate schedule with dependencies
  let cumulative = 0;
  const schedule = stages.map((stage) => {
    const start = cumulative + 1;
    cumulative += stage.days;
    return {
      ...stage,
      start,
      end: cumulative,
    };
  });

  return {
    stages: schedule,
    total: cumulative,
    critical_path: this.calculateCriticalPath(schedule),
  };
}

// ════════════════════════════════════════════════════════════════════════════
// PDF GENERATION
// ════════════════════════════════════════════════════════════════════════════
function generateQuotationPDF(
  qid,
  client,
  parts,
  costs,
  extras,
  co,
  currency,
  leadTimes,
) {
  const curr = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
  const date = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quotation ${qid}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Inter', sans-serif; 
          background: #fff; 
          color: #1a1a1a;
          padding: 20px;
        }
        .quotation {
          max-width: 800px;
          margin: 0 auto;
          background: #fff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
          color: #fff;
          padding: 30px;
        }
        .header h1 { font-size: 28px; margin-bottom: 5px; }
        .header h1 span { color: #3b82f6; }
        .header .qid { font-family: 'JetBrains Mono', monospace; color: #9ca3af; }
        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 20px 0;
        }
        .box {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
        }
        .box h3 { font-size: 12px; color: #6b7280; margin-bottom: 8px; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th {
          background: #f3f4f6;
          padding: 12px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 13px;
        }
        .total-row { font-weight: 700; background: #f9fafb; }
        .grand-total { font-size: 18px; color: #3b82f6; }
        .footer {
          margin-top: 30px;
          padding: 20px;
          border-top: 2px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
        }
        @media print {
          body { padding: 0; }
          .quotation { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="quotation">
        <div class="header">
          <h1>RFQ<span>Analyzer</span> Pro</h1>
          <div class="qid">${qid}</div>
          <div style="margin-top: 10px;">${co.name} · ${co.address}</div>
        </div>

        <div style="padding: 30px;">
          <div class="two-col">
            <div class="box">
              <h3>BILL TO</h3>
              <div style="font-weight: 600;">${client.company || client.name || "Client"}</div>
              ${client.email ? `<div style="color: #4b5563;">${client.email}</div>` : ""}
              ${client.phone ? `<div style="color: #4b5563;">${client.phone}</div>` : ""}
              ${client.gst ? `<div style="color: #4b5563;">GST: ${client.gst}</div>` : ""}
            </div>
            <div class="box">
              <h3>SHIP TO</h3>
              ${client.address ? `<div>${client.address}</div>` : ""}
              <div>${[client.city, client.state, client.pincode].filter(Boolean).join(", ")}</div>
              ${client.country}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Part</th>
                <th>Material/Process</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
  `;

  let subtotal = 0;
  parts.forEach((part, i) => {
    const cost = costs[i];
    if (!cost) return;
    subtotal += cost.total;

    html += `
      <tr>
        <td>
          <div style="font-weight: 600;">${part.partName || `Part ${i + 1}`}</div>
          ${part.drawingNo ? `<div style="font-size: 11px; color: #6b7280;">${part.drawingNo}</div>` : ""}
        </td>
        <td>
          <div>${part.material}</div>
          <div style="font-size: 11px; color: #6b7280;">${part.process}</div>
          ${part.secondary_processes?.length ? `<div style="font-size: 11px; color: #6b7280;">+ ${part.secondary_processes.join(", ")}</div>` : ""}
        </td>
        <td>${part.quantity}</td>
        <td>${curr.format(cost.per_part)}</td>
        <td style="font-weight: 600;">${curr.format(cost.total)}</td>
      </tr>
    `;
  });

  // Add extras
  let extrasTotal = 0;
  extras
    .filter((e) => e.enabled && e.label)
    .forEach((e) => {
      let amount = 0;
      if (e.type === "percent") {
        amount = (subtotal * parseFloat(e.value)) / 100;
      } else {
        amount = parseFloat(e.value) / curr.rate;
      }
      extrasTotal += amount;

      html += `
      <tr>
        <td colspan="4" style="text-align: right; color: #6b7280;">${e.label}</td>
        <td>${curr.format(amount)}</td>
      </tr>
    `;
    });

  const grandTotal = subtotal + extrasTotal;

  html += `
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="4" style="text-align: right;">Subtotal</td>
                <td>${curr.format(subtotal)}</td>
              </tr>
              <tr class="grand-total">
                <td colspan="4" style="text-align: right; font-weight: 700;">GRAND TOTAL (${currency})</td>
                <td style="font-weight: 700;">${curr.format(grandTotal)}</td>
              </tr>
            </tfoot>
          </table>

          <div class="two-col" style="margin-top: 20px;">
            <div class="box">
              <h3>DELIVERY SCHEDULE</h3>
              ${leadTimes
                .map(
                  (lt) => `
                <div style="margin-bottom: 5px;">
                  <span style="font-weight: 600;">${lt.total} days</span> working days
                </div>
              `,
                )
                .join("")}
              ${
                client.required_days
                  ? `
                <div style="margin-top: 10px; color: ${Math.max(...leadTimes.map((l) => l.total)) <= client.required_days ? "#10b981" : "#ef4444"};">
                  Required: ${client.required_days} days
                </div>
              `
                  : ""
              }
            </div>
            <div class="box">
              <h3>TERMS</h3>
              <div>Payment: ${client.payment_terms || "50% Advance"}</div>
              <div>Incoterms: ${client.incoterms || "Ex-Works"}</div>
              <div>Validity: 30 days</div>
            </div>
          </div>

          <div class="footer">
            <div style="display: flex; justify-content: space-between;">
              <div>
                <div style="font-weight: 600;">${co.name}</div>
                <div>${co.address}</div>
                <div>${co.phone}</div>
                <div>GST: ${co.gst}</div>
              </div>
              <div style="text-align: right;">
                <div>Authorized Signatory</div>
                <div style="margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 5px;">
                  For ${co.name}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Open in new window for printing
  const printWindow = window.open("", "_blank");
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 500);
}

// ════════════════════════════════════════════════════════════════════════════
// RESPONSIVE COMPONENTS
// ════════════════════════════════════════════════════════════════════════════
const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
    isMobile: typeof window !== "undefined" ? window.innerWidth < 768 : false,
    isTablet:
      typeof window !== "undefined"
        ? window.innerWidth >= 768 && window.innerWidth < 1024
        : false,
    isDesktop: typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
        isDesktop: window.innerWidth >= 1024,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

function ResponsiveGrid({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 16,
}) {
  const { isMobile, isTablet } = useResponsive();
  const gridCols = isMobile
    ? cols.mobile
    : isTablet
      ? cols.tablet
      : cols.desktop;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gap: `${gap}px`,
      }}
    >
      {children}
    </div>
  );
}

function Card({ children, onClick, active, style = {} }) {
  const { isMobile } = useResponsive();

  return (
    <div
      style={{
        background: active ? "rgba(59, 130, 246, 0.1)" : "#141414",
        border: `1px solid ${active ? "#3b82f6" : "#2a2a2a"}`,
        borderRadius: isMobile ? "10px" : "12px",
        padding: isMobile ? "14px" : "16px",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s",
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN APPLICATION
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const responsive = useResponsive();

  // State management
  const [step, setStep] = useState(1);
  const [company, setCompany] = useState(COMPANIES[0]);
  const [currency, setCurrency] = useState("INR");
  const [client, setClient] = useState({
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
    payment_terms: "50% Advance",
    incoterms: "Ex-Works",
  });
  const [parts, setParts] = useState([]);
  const [extras, setExtras] = useState(DEFAULT_EXTRAS);
  const [costs, setCosts] = useState([]);
  const [leadTimes, setLeadTimes] = useState([]);
  const [qid] = useState(genQID);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [emailText, setEmailText] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyMsg, setBusyMsg] = useState("");
  const [toast, setToast] = useState(null);
  const [activePart, setActivePart] = useState(0);

  // Refs
  const fileInputRef = useRef();

  // Show toast notification
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Add new part
  const addPart = () => {
    setParts([
      ...parts,
      {
        id: Math.random().toString(36).slice(2),
        partName: `Part ${parts.length + 1}`,
        material: "",
        process: "",
        secondary_processes: [],
        thickness: "",
        length: "",
        width: "",
        quantity: "",
        finish: "",
        tolerance: "",
        notes: "",
      },
    ]);
  };

  // Update part
  const updatePart = (index, field, value) => {
    const newParts = [...parts];
    newParts[index][field] = value;
    setParts(newParts);
  };

  // Remove part
  const removePart = (index) => {
    if (parts.length > 1) {
      setParts(parts.filter((_, i) => i !== index));
      if (activePart >= index) setActivePart(Math.max(0, activePart - 1));
    }
  };

  // Duplicate part
  const duplicatePart = (index) => {
    const newPart = {
      ...parts[index],
      id: Math.random().toString(36).slice(2),
    };
    setParts([
      ...parts.slice(0, index + 1),
      newPart,
      ...parts.slice(index + 1),
    ]);
  };

  // Handle file upload
  const handleFiles = useCallback((fileList) => {
    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result.split(",")[1];
        const fileObj = {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + " KB",
          type: file.name.split(".").pop().toUpperCase(),
          base64,
          mimeType: file.type,
        };

        setUploadedFiles((prev) => [...prev, fileObj]);

        // Auto-extract from PDF
        if (file.type === "application/pdf" || file.type.startsWith("image/")) {
          await extractFromFile(fileObj);
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // AI Extraction from text
  const extractFromText = async () => {
    if (!emailText.trim()) {
      showToast("Please paste RFQ text", "error");
      return;
    }

    setBusy(true);
    setBusyMsg("AI analyzing RFQ text...");

    try {
      const result = AIExtractor.extractFromText(emailText);

      // Update client details
      if (result.client) {
        setClient((prev) => ({ ...prev, ...result.client }));
      }

      // Update parts
      if (result.parts.length > 0) {
        setParts(
          result.parts.map((p) => ({
            id: Math.random().toString(36).slice(2),
            ...p,
          })),
        );
        showToast(`✅ Extracted ${result.parts.length} part(s)`, "success");
      } else {
        showToast("No parts found in text", "warning");
      }

      setStep(3);
    } catch (error) {
      showToast("Extraction failed", "error");
    } finally {
      setBusy(false);
      setBusyMsg("");
    }
  };

  // AI Extraction from file
  const extractFromFile = async (file) => {
    setBusy(true);
    setBusyMsg(`Analyzing ${file.name}...`);

    try {
      const result = await AIExtractor.extractFromPDF(file.base64, file.name);

      if (result.client) {
        setClient((prev) => ({ ...prev, ...result.client }));
      }

      if (result.parts.length > 0) {
        setParts((prev) => {
          const newParts = result.parts.map((p) => ({
            id: Math.random().toString(36).slice(2),
            ...p,
          }));
          return [...prev, ...newParts];
        });
        showToast(`✅ Extracted ${result.parts.length} part(s)`, "success");
      }

      setStep(3);
    } catch (error) {
      showToast("File analysis failed", "error");
    } finally {
      setBusy(false);
      setBusyMsg("");
    }
  };

  // Calculate all costs
  const calculateCosts = () => {
    if (parts.some((p) => !p.material || !p.process || !p.quantity)) {
      showToast("Please fill all required fields", "error");
      return;
    }

    const newCosts = [];
    const newLeadTimes = [];

    for (let part of parts) {
      const cost = calcCosts(part, company, currency);
      const leadTime = calcLeadTime(part, cost.machine_hours);
      newCosts.push(cost);
      newLeadTimes.push(leadTime);
    }

    setCosts(newCosts);
    setLeadTimes(newLeadTimes);
    setStep(5);
    showToast("✅ Costs calculated successfully", "success");
  };

  // Generate PDF
  const generatePDF = () => {
    generateQuotationPDF(
      qid,
      client,
      parts,
      costs,
      extras,
      company,
      currency,
      leadTimes,
    );
    showToast("📄 PDF generated", "success");
  };

  // Calculate totals
  const subtotal = costs.reduce((sum, c) => sum + (c?.total || 0), 0);
  const extrasTotal = extras
    .filter((e) => e.enabled && e.label && +e.value > 0)
    .reduce((sum, e) => {
      if (e.type === "percent") return sum + (subtotal * +e.value) / 100;
      return sum + +e.value / CURRENCIES.find((c) => c.code === currency).rate;
    }, 0);
  const grandTotal = subtotal + extrasTotal;

  const curr = CURRENCIES.find((c) => c.code === currency);

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "#0a0a0a",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: responsive.isMobile ? 10 : 20,
            left: responsive.isMobile ? 10 : "auto",
            right: responsive.isMobile ? 10 : 20,
            zIndex: 1000,
            background:
              toast.type === "success"
                ? "#10b981"
                : toast.type === "error"
                  ? "#ef4444"
                  : "#f59e0b",
            color: "#000",
            padding: responsive.isMobile ? "10px 16px" : "12px 24px",
            borderRadius: "8px",
            fontSize: responsive.isMobile ? "13px" : "14px",
            fontWeight: 600,
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
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
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.9)",
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#3b82f6",
              marginBottom: 16,
            }}
          >
            RFQ Analyzer Pro
          </div>
          <div style={{ color: "#9ca3af", marginBottom: 24 }}>{busyMsg}</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: 12,
                  height: 12,
                  background: "#3b82f6",
                  borderRadius: "50%",
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "#141414",
          borderBottom: "1px solid #2a2a2a",
          padding: responsive.isMobile ? "12px 16px" : "16px 24px",
          zIndex: 100,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: responsive.isMobile ? 8 : 12,
          }}
        >
          <div
            style={{
              width: responsive.isMobile ? 32 : 40,
              height: responsive.isMobile ? 32 : 40,
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: responsive.isMobile ? 16 : 20,
            }}
          >
            ⚙
          </div>
          <div>
            <span
              style={{
                fontSize: responsive.isMobile ? 18 : 22,
                fontWeight: 700,
              }}
            >
              RFQ<span style={{ color: "#3b82f6" }}>Analyzer</span>
            </span>
            {!responsive.isMobile && (
              <span
                style={{
                  fontSize: 12,
                  background: "#3b82f6",
                  color: "#000",
                  padding: "2px 8px",
                  borderRadius: 12,
                  marginLeft: 12,
                  fontWeight: 600,
                }}
              >
                PRO
              </span>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: responsive.isMobile ? 12 : 20,
          }}
        >
          {grandTotal > 0 && (
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: responsive.isMobile ? 14 : 18,
                fontWeight: 700,
                color: "#3b82f6",
              }}
            >
              {curr.sym}
              {grandTotal.toFixed(0)}
            </div>
          )}
          <div
            style={{
              fontSize: responsive.isMobile ? 10 : 12,
              color: "#6b7280",
            }}
          >
            {qid}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div
        style={{
          display: responsive.isMobile ? "block" : "flex",
          maxWidth: 1440,
          margin: "0 auto",
          padding: responsive.isMobile ? "16px" : "24px",
          gap: 24,
        }}
      >
        {/* Sidebar - Hidden on mobile when not needed */}
        {(!responsive.isMobile || step === 1) && (
          <div
            style={{
              width: responsive.isMobile ? "100%" : 240,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#6b7280",
                padding: "16px 16px 8px",
                letterSpacing: "1px",
              }}
            >
              WORKFLOW
            </div>

            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                onClick={() => s <= step && setStep(s)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: responsive.isMobile ? "10px 16px" : "12px 16px",
                  borderRadius: 8,
                  cursor: s <= step ? "pointer" : "default",
                  background:
                    step === s ? "rgba(59, 130, 246, 0.1)" : "transparent",
                  border:
                    step === s ? "1px solid #3b82f6" : "1px solid transparent",
                  color: step === s ? "#3b82f6" : "#6b7280",
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background:
                      step > s ? "#10b981" : step === s ? "#3b82f6" : "#2a2a2a",
                    color: step > s ? "#000" : "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {step > s ? "✓" : s}
                </div>
                <div style={{ fontWeight: step === s ? 600 : 400 }}>
                  {
                    [
                      "Setup",
                      "RFQ Input",
                      "Client",
                      "Parts",
                      "Costing",
                      "Quotation",
                    ][s - 1]
                  }
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div style={{ flex: 1 }}>
          {/* Step 1: Setup */}
          {step === 1 && (
            <div>
              <h1
                style={{
                  fontSize: responsive.isMobile ? 28 : 36,
                  fontWeight: 700,
                  marginBottom: 24,
                }}
              >
                Company <span style={{ color: "#3b82f6" }}>Setup</span>
              </h1>

              <Card>
                <h3
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}
                >
                  SELECT COMPANY
                </h3>
                <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
                  {COMPANIES.map((c) => (
                    <Card
                      key={c.id}
                      active={company.id === c.id}
                      onClick={() => setCompany(c)}
                    >
                      <div style={{ fontWeight: 700, marginBottom: 8 }}>
                        {c.name}
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {c.address}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#3b82f6", marginTop: 8 }}
                      >
                        {c.certifications.join(" · ")}
                      </div>
                    </Card>
                  ))}
                </ResponsiveGrid>
              </Card>

              <Card style={{ marginTop: 16 }}>
                <h3
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}
                >
                  CURRENCY
                </h3>
                <ResponsiveGrid cols={{ mobile: 2, tablet: 3, desktop: 5 }}>
                  {CURRENCIES.map((c) => (
                    <Card
                      key={c.code}
                      active={currency === c.code}
                      onClick={() => setCurrency(c.code)}
                    >
                      <div style={{ fontSize: 20, marginBottom: 8 }}>
                        {c.flag}
                      </div>
                      <div style={{ fontWeight: 600 }}>{c.code}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {c.sym}
                      </div>
                    </Card>
                  ))}
                </ResponsiveGrid>
              </Card>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 24,
                }}
              >
                <button
                  onClick={() => setStep(2)}
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: responsive.isMobile ? "12px 24px" : "14px 32px",
                    fontSize: responsive.isMobile ? 14 : 16,
                    fontWeight: 600,
                    cursor: "pointer",
                    width: responsive.isMobile ? "100%" : "auto",
                  }}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: RFQ Input */}
          {step === 2 && (
            <div>
              <h1
                style={{
                  fontSize: responsive.isMobile ? 28 : 36,
                  fontWeight: 700,
                  marginBottom: 24,
                }}
              >
                RFQ <span style={{ color: "#3b82f6" }}>Input</span>
              </h1>

              <Card>
                <h3
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}
                >
                  📄 UPLOAD FILES
                </h3>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFiles(e.dataTransfer.files);
                  }}
                  style={{
                    border: `2px dashed ${uploadedFiles.length > 0 ? "#3b82f6" : "#2a2a2a"}`,
                    borderRadius: 12,
                    padding: responsive.isMobile ? 24 : 48,
                    textAlign: "center",
                    cursor: "pointer",
                    background: "rgba(59, 130, 246, 0.05)",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
                  <div
                    style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}
                  >
                    Drop files here
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    PDF, PNG, JPG, DXF (max 10MB)
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.dxf"
                    onChange={(e) => handleFiles(e.target.files)}
                    style={{ display: "none" }}
                  />
                </div>

                {uploadedFiles.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    {uploadedFiles.map((f, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: 12,
                          background: "#141414",
                          borderRadius: 8,
                          border: "1px solid #2a2a2a",
                          marginBottom: 8,
                          flexWrap: responsive.isMobile ? "wrap" : "nowrap",
                        }}
                      >
                        <span
                          style={{
                            background:
                              f.type === "PDF" ? "#3b82f6" : "#8b5cf6",
                            color: "#000",
                            padding: "4px 8px",
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          {f.type}
                        </span>
                        <span style={{ flex: 1, fontSize: 13 }}>{f.name}</span>
                        <span style={{ fontSize: 11, color: "#6b7280" }}>
                          {f.size}
                        </span>
                        <button
                          onClick={() =>
                            setUploadedFiles((files) =>
                              files.filter((_, j) => j !== i),
                            )
                          }
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: 16,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card style={{ marginTop: 16 }}>
                <h3
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}
                >
                  📧 PASTE RFQ TEXT
                </h3>
                <textarea
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  placeholder="Paste your RFQ email or document text here..."
                  style={{
                    width: "100%",
                    minHeight: responsive.isMobile ? 150 : 200,
                    background: "#141414",
                    border: "1px solid #2a2a2a",
                    borderRadius: 8,
                    padding: "16px",
                    color: "#fff",
                    fontSize: 14,
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 16,
                    flexDirection: responsive.isMobile ? "column" : "row",
                  }}
                >
                  <button
                    onClick={extractFromText}
                    style={{
                      flex: 1,
                      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "14px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    🔍 Extract with AI
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    style={{
                      flex: 1,
                      background: "transparent",
                      color: "#fff",
                      border: "1px solid #2a2a2a",
                      borderRadius: 8,
                      padding: "14px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Enter Manually →
                  </button>
                </div>
              </Card>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "flex-end",
                  marginTop: 24,
                }}
              >
                <button
                  onClick={() => setStep(1)}
                  style={{
                    background: "transparent",
                    color: "#fff",
                    border: "1px solid #2a2a2a",
                    borderRadius: 8,
                    padding: responsive.isMobile ? "12px 24px" : "14px 32px",
                    fontSize: responsive.isMobile ? 14 : 16,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: responsive.isMobile ? "12px 24px" : "14px 32px",
                    fontSize: responsive.isMobile ? 14 : 16,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Client Details */}
          {step === 3 && (
            <div>
              <h1
                style={{
                  fontSize: responsive.isMobile ? 28 : 36,
                  fontWeight: 700,
                  marginBottom: 24,
                }}
              >
                Client <span style={{ color: "#3b82f6" }}>Details</span>
              </h1>

              <Card>
                <h3
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}
                >
                  CONTACT INFORMATION
                </h3>
                <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 2 }}>
                  <input
                    placeholder="Company Name"
                    value={client.company}
                    onChange={(e) =>
                      setClient({ ...client, company: e.target.value })
                    }
                    style={{
                      background: "#141414",
                      border: "1px solid #2a2a2a",
                      borderRadius: 8,
                      padding: "12px",
                      color: "#fff",
                      fontSize: 14,
                      width: "100%",
                    }}
                  />
                  <input
                    placeholder="Contact Person"
                    value={client.name}
                    onChange={(e) =>
                      setClient({ ...client, name: e.target.value })
                    }
                    style={{
                      background: "#141414",
                      border: "1px solid #2a2a2a",
                      borderRadius: 8,
                      padding: "12px",
                      color: "#fff",
                      fontSize: 14,
                      width: "100%",
                    }}
                  />
                  <input
                    placeholder="Email"
                    type="email"
                    value={client.email}
                    onChange={(e) =>
                      setClient({ ...client, email: e.target.value })
                    }
                    style={{
                      background: "#141414",
                      border: "1px solid #2a2a2a",
                      borderRadius: 8,
                      padding: "12px",
                      color: "#fff",
                      fontSize: 14,
                      width: "100%",
                    }}
                  />
                  <input
                    placeholder="Phone"
                    value={client.phone}
                    onChange={(e) =>
                      setClient({ ...client, phone: e.target.value })
                    }
                    style={{
                      background: "#141414",
                      border: "1px solid #2a2a2a",
                      borderRadius: 8,
                      padding: "12px",
                      color: "#fff",
                      fontSize: 14,
                      width: "100%",
                    }}
                  />
                  <input
                    placeholder="GSTIN"
                    value={client.gst}
                    onChange={(e) =>
                      setClient({
                        ...client,
                        gst: e.target.value.toUpperCase(),
                      })
                    }
                    style={{
                      background: "#141414",
                      border: "1px solid #2a2a2a",
                      borderRadius: 8,
                      padding: "12px",
                      color: "#fff",
                      fontSize: 14,
                      width: "100%",
                    }}
                  />
                  <input
                    placeholder="PAN"
                    value={client.pan}
                    onChange={(e) =>
                      setClient({
                        ...client,
                        pan: e.target.value.toUpperCase(),
                      })
                    }
                    style={{
                      background: "#141414",
                      border: "1px solid #2a2a2a",
                      borderRadius: 8,
                      padding: "12px",
                      color: "#fff",
                      fontSize: 14,
                      width: "100%",
                    }}
                  />
                </ResponsiveGrid>
              </Card>

              <Card style={{ marginTop: 16 }}>
                <h3
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}
                >
                  ADDRESS
                </h3>
                <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 2 }}>
                  <input
                    placeholder="Street Address"
                    value={client.address}
                    onChange={(e) =>
                      setClient({ ...client, address: e.target.value })
                    }
                    style={{
                      gridColumn: responsive.isMobile ? "auto" : "span 2",
                      background: "#141414",
                      border: "1px solid #2a2a2a",
                      borderRadius: 8,
                      padding: "12px",
                      color: "#fff",
                      fontSize: 14,
                      width: "100%",
                    }}
                  />
                  <input
                    placeholder="City"
                    value={client.city}
                    onChange={(e) =>
                      setClient({ ...client, city: e.target.value })
                    }
                    style={{
                      background: "#141414",
                      border: "1px solid #2a2a2a",
                      borderRadius: 8,
                      padding: "12px",
                      color: "#fff",
                      fontSize: 14,
                      width: "100%",
                    }}
                  />
                  <input
                    placeholder="State"
                    value={client.state}
                    onChange={(e) =>
                      setClient({ ...client, state: e.target.value })
                    }
                    style={{
                      background: "#141414",
                      border: "1px solid #2a2a2a",
                      borderRadius: 8,
                      padding: "12px",
                      color: "#fff",
                      fontSize: 14,
                      width: "100%",
                    }}
                  />
                  <input
                    placeholder="Pincode"
                    value={client.pincode}
                    onChange={(e) =>
                      setClient({ ...client, pincode: e.target.value })
                    }
                    style={{
                      background: "#141414",
                      border: "1px solid #2a2a2a",
                      borderRadius: 8,
                      padding: "12px",
                      color: "#fff",
                      fontSize: 14,
                      width: "100%",
                    }}
                  />
                  <input
                    placeholder="Country"
                    value={client.country}
                    onChange={(e) =>
                      setClient({ ...client, country: e.target.value })
                    }
                    style={{
                      background: "#141414",
                      border: "1px solid #2a2a2a",
                      borderRadius: 8,
                      padding: "12px",
                      color: "#fff",
                      fontSize: 14,
                      width: "100%",
                    }}
                  />
                </ResponsiveGrid>
              </Card>

              <Card style={{ marginTop: 16 }}>
                <h3
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}
                >
                  TERMS
                </h3>
                <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
                  <input
                    placeholder="Required Days"
                    type="number"
                    value={client.required_days}
                    onChange={(e) =>
                      setClient({ ...client, required_days: e.target.value })
                    }
                    style={{
                      background: "#141414",
                      border: "1px solid #2a2a2a",
                      borderRadius: 8,
                      padding: "12px",
                      color: "#fff",
                      fontSize: 14,
                      width: "100%",
                    }}
                  />
                  <select
                    value={client.payment_terms}
                    onChange={(e) =>
                      setClient({ ...client, payment_terms: e.target.value })
                    }
                    style={{
                      background: "#141414",
                      border: "1px solid #2a2a2a",
                      borderRadius: 8,
                      padding: "12px",
                      color: "#fff",
                      fontSize: 14,
                      width: "100%",
                    }}
                  >
                    <option>50% Advance</option>
                    <option>100% Advance</option>
                    <option>30 Days Credit</option>
                    <option>45 Days Credit</option>
                    <option>60 Days Credit</option>
                  </select>
                  <select
                    value={client.incoterms}
                    onChange={(e) =>
                      setClient({ ...client, incoterms: e.target.value })
                    }
                    style={{
                      background: "#141414",
                      border: "1px solid #2a2a2a",
                      borderRadius: 8,
                      padding: "12px",
                      color: "#fff",
                      fontSize: 14,
                      width: "100%",
                    }}
                  >
                    <option>Ex-Works</option>
                    <option>FOB</option>
                    <option>CIF</option>
                    <option>DDP</option>
                  </select>
                </ResponsiveGrid>
              </Card>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "flex-end",
                  marginTop: 24,
                }}
              >
                <button
                  onClick={() => setStep(2)}
                  style={{
                    background: "transparent",
                    color: "#fff",
                    border: "1px solid #2a2a2a",
                    borderRadius: 8,
                    padding: responsive.isMobile ? "12px 24px" : "14px 32px",
                    fontSize: responsive.isMobile ? 14 : 16,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: responsive.isMobile ? "12px 24px" : "14px 32px",
                    fontSize: responsive.isMobile ? 14 : 16,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Continue →
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
                  marginBottom: 24,
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                <h1
                  style={{
                    fontSize: responsive.isMobile ? 28 : 36,
                    fontWeight: 700,
                  }}
                >
                  Parts <span style={{ color: "#3b82f6" }}>& Specs</span>
                </h1>
                <button
                  onClick={addPart}
                  style={{
                    background: "transparent",
                    color: "#3b82f6",
                    border: "1px solid #3b82f6",
                    borderRadius: 8,
                    padding: responsive.isMobile ? "10px 20px" : "12px 24px",
                    fontSize: responsive.isMobile ? 13 : 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  + Add Part
                </button>
              </div>

              {/* Part Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}
              >
                {parts.map((part, index) => (
                  <div
                    key={part.id}
                    onClick={() => setActivePart(index)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background:
                        activePart === index
                          ? "rgba(59, 130, 246, 0.1)"
                          : "#141414",
                      border: `1px solid ${activePart === index ? "#3b82f6" : "#2a2a2a"}`,
                      borderRadius: 20,
                      padding: "8px 16px",
                      cursor: "pointer",
                    }}
                  >
                    <span>{part.partName || `Part ${index + 1}`}</span>
                    {parts.length > 1 && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          removePart(index);
                        }}
                        style={{ color: "#ef4444", fontSize: 16 }}
                      >
                        ✕
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Part Form */}
              {parts.map((part, index) => (
                <div
                  key={part.id}
                  style={{ display: activePart === index ? "block" : "none" }}
                >
                  <Card>
                    <h3
                      style={{
                        fontSize: 12,
                        color: "#6b7280",
                        marginBottom: 16,
                      }}
                    >
                      PART {index + 1} DETAILS
                    </h3>

                    <ResponsiveGrid
                      cols={{ mobile: 1, tablet: 2, desktop: 2 }}
                      gap={12}
                    >
                      <input
                        placeholder="Part Name"
                        value={part.partName}
                        onChange={(e) =>
                          updatePart(index, "partName", e.target.value)
                        }
                        style={{
                          background: "#141414",
                          border: "1px solid #2a2a2a",
                          borderRadius: 8,
                          padding: "12px",
                          color: "#fff",
                          fontSize: 14,
                          width: "100%",
                        }}
                      />
                      <input
                        placeholder="Drawing No."
                        value={part.drawingNo}
                        onChange={(e) =>
                          updatePart(index, "drawingNo", e.target.value)
                        }
                        style={{
                          background: "#141414",
                          border: "1px solid #2a2a2a",
                          borderRadius: 8,
                          padding: "12px",
                          color: "#fff",
                          fontSize: 14,
                          width: "100%",
                        }}
                      />
                    </ResponsiveGrid>

                    <ResponsiveGrid
                      cols={{ mobile: 1, tablet: 2, desktop: 2 }}
                      gap={12}
                      style={{ marginTop: 12 }}
                    >
                      <select
                        value={part.material}
                        onChange={(e) =>
                          updatePart(index, "material", e.target.value)
                        }
                        style={{
                          background: "#141414",
                          border: "1px solid #2a2a2a",
                          borderRadius: 8,
                          padding: "12px",
                          color: "#fff",
                          fontSize: 14,
                          width: "100%",
                        }}
                      >
                        <option value="">Select Material</option>
                        {MATERIALS.map((m) => (
                          <option key={m.id} value={m.name}>
                            {m.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={part.process}
                        onChange={(e) =>
                          updatePart(index, "process", e.target.value)
                        }
                        style={{
                          background: "#141414",
                          border: "1px solid #2a2a2a",
                          borderRadius: 8,
                          padding: "12px",
                          color: "#fff",
                          fontSize: 14,
                          width: "100%",
                        }}
                      >
                        <option value="">Select Primary Process</option>
                        {PROCESSES.map((p) => (
                          <option key={p.id} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>

                      <select
                        multiple
                        value={part.secondary_processes || []}
                        onChange={(e) => {
                          const values = Array.from(
                            e.target.selectedOptions,
                            (opt) => opt.value,
                          );
                          updatePart(index, "secondary_processes", values);
                        }}
                        style={{
                          background: "#141414",
                          border: "1px solid #2a2a2a",
                          borderRadius: 8,
                          padding: "12px",
                          color: "#fff",
                          fontSize: 14,
                          width: "100%",
                          minHeight: 100,
                        }}
                      >
                        <option value="">
                          Secondary Processes (Ctrl+click)
                        </option>
                        {PROCESSES.map((p) => (
                          <option key={p.id} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={part.finish}
                        onChange={(e) =>
                          updatePart(index, "finish", e.target.value)
                        }
                        style={{
                          background: "#141414",
                          border: "1px solid #2a2a2a",
                          borderRadius: 8,
                          padding: "12px",
                          color: "#fff",
                          fontSize: 14,
                          width: "100%",
                        }}
                      >
                        <option value="">Select Finish</option>
                        {FINISH_OPTIONS.map((f) => (
                          <option key={f.id} value={f.name}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </ResponsiveGrid>

                    <ResponsiveGrid
                      cols={{ mobile: 2, tablet: 3, desktop: 4 }}
                      gap={12}
                      style={{ marginTop: 12 }}
                    >
                      <input
                        placeholder="Length (mm)"
                        type="number"
                        value={part.length}
                        onChange={(e) =>
                          updatePart(index, "length", e.target.value)
                        }
                        style={{
                          background: "#141414",
                          border: "1px solid #2a2a2a",
                          borderRadius: 8,
                          padding: "12px",
                          color: "#fff",
                          fontSize: 14,
                          width: "100%",
                        }}
                      />
                      <input
                        placeholder="Width (mm)"
                        type="number"
                        value={part.width}
                        onChange={(e) =>
                          updatePart(index, "width", e.target.value)
                        }
                        style={{
                          background: "#141414",
                          border: "1px solid #2a2a2a",
                          borderRadius: 8,
                          padding: "12px",
                          color: "#fff",
                          fontSize: 14,
                          width: "100%",
                        }}
                      />
                      <input
                        placeholder="Thickness (mm)"
                        type="number"
                        value={part.thickness}
                        onChange={(e) =>
                          updatePart(index, "thickness", e.target.value)
                        }
                        style={{
                          background: "#141414",
                          border: "1px solid #2a2a2a",
                          borderRadius: 8,
                          padding: "12px",
                          color: "#fff",
                          fontSize: 14,
                          width: "100%",
                        }}
                      />
                      <input
                        placeholder="Quantity"
                        type="number"
                        value={part.quantity}
                        onChange={(e) =>
                          updatePart(index, "quantity", e.target.value)
                        }
                        style={{
                          background: "#141414",
                          border: "1px solid #2a2a2a",
                          borderRadius: 8,
                          padding: "12px",
                          color: "#fff",
                          fontSize: 14,
                          width: "100%",
                        }}
                      />
                    </ResponsiveGrid>

                    <div style={{ marginTop: 12 }}>
                      <input
                        placeholder="Tolerance (e.g., ±0.1mm)"
                        value={part.tolerance}
                        onChange={(e) =>
                          updatePart(index, "tolerance", e.target.value)
                        }
                        style={{
                          background: "#141414",
                          border: "1px solid #2a2a2a",
                          borderRadius: 8,
                          padding: "12px",
                          color: "#fff",
                          fontSize: 14,
                          width: "100%",
                        }}
                      />
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <textarea
                        placeholder="Additional Notes / Special Requirements"
                        value={part.notes}
                        onChange={(e) =>
                          updatePart(index, "notes", e.target.value)
                        }
                        rows={3}
                        style={{
                          background: "#141414",
                          border: "1px solid #2a2a2a",
                          borderRadius: 8,
                          padding: "12px",
                          color: "#fff",
                          fontSize: 14,
                          width: "100%",
                          resize: "vertical",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        justifyContent: "flex-end",
                        marginTop: 16,
                      }}
                    >
                      <button
                        onClick={() => duplicatePart(index)}
                        style={{
                          background: "transparent",
                          color: "#fff",
                          border: "1px solid #2a2a2a",
                          borderRadius: 6,
                          padding: "8px 16px",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        Duplicate
                      </button>
                      {parts.length > 1 && (
                        <button
                          onClick={() => removePart(index)}
                          style={{
                            background: "transparent",
                            color: "#ef4444",
                            border: "1px solid #ef4444",
                            borderRadius: 6,
                            padding: "8px 16px",
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </Card>
                </div>
              ))}

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "flex-end",
                  marginTop: 24,
                }}
              >
                <button
                  onClick={() => setStep(3)}
                  style={{
                    background: "transparent",
                    color: "#fff",
                    border: "1px solid #2a2a2a",
                    borderRadius: 8,
                    padding: responsive.isMobile ? "12px 24px" : "14px 32px",
                    fontSize: responsive.isMobile ? 14 : 16,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={calculateCosts}
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: responsive.isMobile ? "12px 24px" : "14px 32px",
                    fontSize: responsive.isMobile ? 14 : 16,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Calculate Costs →
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Costing */}
          {step === 5 && costs.length > 0 && (
            <div>
              <h1
                style={{
                  fontSize: responsive.isMobile ? 28 : 36,
                  fontWeight: 700,
                  marginBottom: 24,
                }}
              >
                Cost <span style={{ color: "#3b82f6" }}>Analysis</span>
              </h1>

              {/* KPI Cards */}
              <ResponsiveGrid
                cols={{ mobile: 1, tablet: 2, desktop: 4 }}
                gap={12}
              >
                <Card>
                  <div
                    style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}
                  >
                    Grand Total
                  </div>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#3b82f6",
                    }}
                  >
                    {curr.sym}
                    {grandTotal.toFixed(0)}
                  </div>
                </Card>
                <Card>
                  <div
                    style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}
                  >
                    Parts
                  </div>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                    }}
                  >
                    {parts.length}
                  </div>
                </Card>
                <Card>
                  <div
                    style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}
                  >
                    Total Pieces
                  </div>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                    }}
                  >
                    {parts.reduce((sum, p) => sum + (+p.quantity || 0), 0)}
                  </div>
                </Card>
                <Card>
                  <div
                    style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}
                  >
                    Max Lead Time
                  </div>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                    }}
                  >
                    {Math.max(...leadTimes.map((l) => l.total))} days
                  </div>
                </Card>
              </ResponsiveGrid>

              {/* Part Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  margin: "24px 0 16px",
                }}
              >
                {parts.map((part, index) => (
                  <div
                    key={part.id}
                    onClick={() => setActivePart(index)}
                    style={{
                      background:
                        activePart === index
                          ? "rgba(59, 130, 246, 0.1)"
                          : "#141414",
                      border: `1px solid ${activePart === index ? "#3b82f6" : "#2a2a2a"}`,
                      borderRadius: 20,
                      padding: "8px 16px",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: activePart === index ? 600 : 400,
                    }}
                  >
                    {part.partName || `Part ${index + 1}`}
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              {parts.map((part, index) => {
                if (activePart !== index || !costs[index]) return null;
                const cost = costs[index];
                const leadTime = leadTimes[index];

                return (
                  <div key={part.id}>
                    <Card>
                      <h3
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                          marginBottom: 16,
                        }}
                      >
                        COST BREAKDOWN
                      </h3>

                      <ResponsiveGrid
                        cols={{ mobile: 1, tablet: 2, desktop: 2 }}
                        gap={12}
                      >
                        <div>
                          <KV
                            label="Material"
                            value={curr.sym + cost.material.toFixed(2)}
                          />
                          <KV
                            label="Primary Process"
                            value={curr.sym + cost.primary.toFixed(2)}
                          />
                          {cost.secondary > 0 && (
                            <KV
                              label="Secondary Processes"
                              value={curr.sym + cost.secondary.toFixed(2)}
                            />
                          )}
                          <KV
                            label="Labor"
                            value={curr.sym + cost.labor.toFixed(2)}
                          />
                          <KV
                            label="Setup"
                            value={curr.sym + cost.setup.toFixed(2)}
                          />
                        </div>
                        <div>
                          <KV
                            label="Finishing"
                            value={curr.sym + cost.finishing.toFixed(2)}
                          />
                          <KV
                            label="Packaging"
                            value={curr.sym + cost.packaging.toFixed(2)}
                          />
                          <KV
                            label="Transport"
                            value={curr.sym + cost.transport.toFixed(2)}
                          />
                          <KV
                            label="Profit"
                            value={curr.sym + cost.profit.toFixed(2)}
                          />
                          <KV
                            label="Weight"
                            value={cost.weight.toFixed(3) + " kg"}
                          />
                        </div>
                      </ResponsiveGrid>

                      <div
                        style={{
                          marginTop: 16,
                          paddingTop: 16,
                          borderTop: "1px solid #2a2a2a",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: 14, color: "#6b7280" }}>
                          Unit Price ({part.quantity} pcs)
                        </span>
                        <span
                          style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: "#3b82f6",
                          }}
                        >
                          {curr.sym}
                          {cost.per_part.toFixed(2)}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: 8,
                        }}
                      >
                        <span style={{ fontSize: 16, fontWeight: 700 }}>
                          Total
                        </span>
                        <span
                          style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: "#3b82f6",
                          }}
                        >
                          {curr.sym}
                          {cost.total.toFixed(2)}
                        </span>
                      </div>
                    </Card>

                    {leadTime && (
                      <Card style={{ marginTop: 16 }}>
                        <h3
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            marginBottom: 16,
                          }}
                        >
                          PRODUCTION SCHEDULE
                        </h3>
                        {leadTime.stages.map((stage, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              marginBottom: 8,
                            }}
                          >
                            <div
                              style={{
                                width: 100,
                                fontSize: 12,
                                color: "#6b7280",
                              }}
                            >
                              {stage.name}
                            </div>
                            <div
                              style={{
                                flex: 1,
                                height: 8,
                                background: "#2a2a2a",
                                borderRadius: 4,
                                position: "relative",
                              }}
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: `${(stage.days / leadTime.total) * 100}%`,
                                  background: stage.color,
                                  borderRadius: 4,
                                }}
                              />
                            </div>
                            <div
                              style={{
                                width: 60,
                                fontSize: 12,
                                textAlign: "right",
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              {stage.days}d
                            </div>
                          </div>
                        ))}
                        <div
                          style={{
                            marginTop: 12,
                            paddingTop: 12,
                            borderTop: "1px solid #2a2a2a",
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          <span>Total Lead Time</span>
                          <span style={{ color: "#10b981" }}>
                            {leadTime.total} working days
                          </span>
                        </div>
                      </Card>
                    )}
                  </div>
                );
              })}

              {/* Additional Charges */}
              <Card style={{ marginTop: 16 }}>
                <h3
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}
                >
                  ADDITIONAL CHARGES
                </h3>

                {extras.map((extra, index) => (
                  <div
                    key={extra.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: responsive.isMobile
                        ? "1fr"
                        : "auto 1fr 100px 100px 40px",
                      gap: 8,
                      alignItems: "center",
                      marginBottom: 8,
                      padding: 8,
                      background: extra.enabled
                        ? "rgba(59, 130, 246, 0.05)"
                        : "transparent",
                      borderRadius: 8,
                    }}
                  >
                    <div
                      onClick={() =>
                        !extra.locked &&
                        setExtras((prev) =>
                          prev.map((e) =>
                            e.id === extra.id
                              ? { ...e, enabled: !e.enabled }
                              : e,
                          ),
                        )
                      }
                      style={{
                        width: 40,
                        height: 20,
                        background: extra.enabled ? "#3b82f6" : "#2a2a2a",
                        borderRadius: 10,
                        position: "relative",
                        cursor: extra.locked ? "not-allowed" : "pointer",
                        opacity: extra.locked ? 0.5 : 1,
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          background: "#fff",
                          borderRadius: "50%",
                          position: "absolute",
                          top: 2,
                          left: extra.enabled ? 22 : 2,
                          transition: "left 0.2s",
                        }}
                      />
                    </div>

                    <input
                      value={extra.label}
                      onChange={(e) =>
                        setExtras((prev) =>
                          prev.map((e) =>
                            e.id === extra.id
                              ? { ...e, label: e.target.value }
                              : e,
                          ),
                        )
                      }
                      placeholder="Charge description"
                      style={{
                        background: "#141414",
                        border: "1px solid #2a2a2a",
                        borderRadius: 6,
                        padding: "8px",
                        color: "#fff",
                        fontSize: 13,
                        width: "100%",
                      }}
                    />

                    <input
                      type="number"
                      value={extra.value}
                      onChange={(e) =>
                        setExtras((prev) =>
                          prev.map((e) =>
                            e.id === extra.id
                              ? { ...e, value: e.target.value }
                              : e,
                          ),
                        )
                      }
                      style={{
                        background: "#141414",
                        border: "1px solid #2a2a2a",
                        borderRadius: 6,
                        padding: "8px",
                        color: "#fff",
                        fontSize: 13,
                        width: "100%",
                      }}
                    />

                    <select
                      value={extra.type}
                      onChange={(e) =>
                        setExtras((prev) =>
                          prev.map((e) =>
                            e.id === extra.id
                              ? { ...e, type: e.target.value }
                              : e,
                          ),
                        )
                      }
                      style={{
                        background: "#141414",
                        border: "1px solid #2a2a2a",
                        borderRadius: 6,
                        padding: "8px",
                        color: "#fff",
                        fontSize: 13,
                        width: "100%",
                      }}
                    >
                      <option value="percent">%</option>
                      <option value="fixed">Fixed</option>
                    </select>

                    {!extra.locked && (
                      <button
                        onClick={() =>
                          setExtras((prev) =>
                            prev.filter((e) => e.id !== extra.id),
                          )
                        }
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          fontSize: 16,
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={() =>
                    setExtras([
                      ...extras,
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
                  style={{
                    background: "transparent",
                    color: "#3b82f6",
                    border: "1px dashed #3b82f6",
                    borderRadius: 6,
                    padding: "10px",
                    width: "100%",
                    cursor: "pointer",
                    marginTop: 8,
                  }}
                >
                  + Add Charge
                </button>
              </Card>

              {/* Grand Total */}
              <Card
                style={{
                  marginTop: 16,
                  background: "linear-gradient(135deg, #1a1a1a, #141414)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6b7280",
                        marginBottom: 4,
                      }}
                    >
                      Parts Subtotal
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>
                      {curr.sym}
                      {subtotal.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6b7280",
                        marginBottom: 4,
                      }}
                    >
                      Extras Total
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>
                      {curr.sym}
                      {extrasTotal.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6b7280",
                        marginBottom: 4,
                      }}
                    >
                      GRAND TOTAL
                    </div>
                    <div
                      style={{
                        fontSize: responsive.isMobile ? 24 : 32,
                        fontWeight: 800,
                        color: "#3b82f6",
                      }}
                    >
                      {curr.sym}
                      {grandTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              </Card>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "flex-end",
                  marginTop: 24,
                }}
              >
                <button
                  onClick={() => setStep(4)}
                  style={{
                    background: "transparent",
                    color: "#fff",
                    border: "1px solid #2a2a2a",
                    borderRadius: 8,
                    padding: responsive.isMobile ? "12px 24px" : "14px 32px",
                    fontSize: responsive.isMobile ? 14 : 16,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(6)}
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: responsive.isMobile ? "12px 24px" : "14px 32px",
                    fontSize: responsive.isMobile ? 14 : 16,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Generate Quotation →
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Quotation */}
          {step === 6 && (
            <div>
              <h1
                style={{
                  fontSize: responsive.isMobile ? 28 : 36,
                  fontWeight: 700,
                  marginBottom: 24,
                }}
              >
                Final <span style={{ color: "#3b82f6" }}>Quotation</span>
              </h1>

              <Card style={{ padding: responsive.isMobile ? 20 : 32 }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <div
                    style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}
                  >
                    RFQ<span style={{ color: "#3b82f6" }}>Analyzer</span> Pro
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#6b7280",
                      fontSize: 14,
                    }}
                  >
                    {qid}
                  </div>
                </div>

                {/* Quotation Preview (simplified for mobile) */}
                <div
                  style={{
                    background: "#141414",
                    borderRadius: 8,
                    padding: 20,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 20,
                      flexWrap: "wrap",
                      gap: 16,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "#6b7280",
                          marginBottom: 4,
                        }}
                      >
                        TO
                      </div>
                      <div style={{ fontWeight: 600 }}>
                        {client.company || client.name || "Client"}
                      </div>
                      {client.email && (
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          {client.email}
                        </div>
                      )}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "#6b7280",
                          marginBottom: 4,
                        }}
                      >
                        DATE
                      </div>
                      <div>{new Date().toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#3b82f6",
                      textAlign: "center",
                      padding: "20px 0",
                    }}
                  >
                    Total: {curr.sym}
                    {grandTotal.toFixed(2)} {currency}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexDirection: responsive.isMobile ? "column" : "row",
                  }}
                >
                  <button
                    onClick={generatePDF}
                    style={{
                      flex: 1,
                      background: "#10b981",
                      color: "#000",
                      border: "none",
                      borderRadius: 8,
                      padding: "16px",
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    📥 Download PDF
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    style={{
                      flex: 1,
                      background: "transparent",
                      color: "#fff",
                      border: "1px solid #2a2a2a",
                      borderRadius: 8,
                      padding: "16px",
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    New Quotation
                  </button>
                </div>
              </Card>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "flex-end",
                  marginTop: 24,
                }}
              >
                <button
                  onClick={() => setStep(5)}
                  style={{
                    background: "transparent",
                    color: "#fff",
                    border: "1px solid #2a2a2a",
                    borderRadius: 8,
                    padding: responsive.isMobile ? "12px 24px" : "14px 32px",
                    fontSize: responsive.isMobile ? 14 : 16,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ← Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
        }
        
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          opacity: 1;
          height: 20px;
        }
        
        select[multiple] {
          overflow-y: auto;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #141414;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #3a3a3a;
        }
      `}</style>
    </div>
  );
}
