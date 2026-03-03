import { useState, useCallback, useRef } from "react";

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

// Baseline data from PDF (02/27/26)
const INITIAL_REITS = [
  ["AvalonBay Communities","AVB",177.2,4.0,0.7,-2.6,-20.5,26.0,24,-22.0,5.9,95.7,1.1,"Multifamily"],
  ["Equity Residential","EQR",63.2,4.4,1.7,2.6,-14.2,24.8,26,-22.6,5.8,96.3,2.8,"Multifamily"],
  ["Essex Property Trust","ESS",255.1,4.1,1.3,-2.7,-16.1,17.2,31,-14.7,5.4,96.1,2.4,"Multifamily"],
  ["MAA","MAA",133.9,4.6,-0.6,-1.2,-19.8,16.1,25,-15.6,5.9,95.6,-1.8,"Multifamily"],
  ["UDR Inc.","UDR",37.5,4.6,1.1,3.9,-15.4,13.4,32,-26.0,6.2,96.6,2.3,"Multifamily"],
  ["Camden Property Trust","CPT",108.3,3.9,-0.5,2.2,-12.1,11.9,24,-17.2,5.8,95.5,null,"Multifamily"],
  ["Independence Realty Trust","IRT",16.6,4.1,-1.5,-3.0,-22.4,4.1,36,-17.9,6.3,95.3,2.7,"Multifamily"],
  ["Veris Residential","VRE",18.9,1.7,26.0,25.2,14.2,1.9,44,-14.5,5.1,94.7,-2.7,"Multifamily"],
  ["NexPoint Residential","NXRT",28.2,7.5,-6.8,-11.3,-32.4,0.7,69,-35.3,6.4,94.7,-0.4,"Multifamily"],
  ["Invitation Homes","INVH",26.3,4.6,-1.6,-5.7,-20.9,16.2,33,-39.6,6.1,96.5,1.1,"SFR"],
  ["American Homes 4 Rent","AMH",30.0,4.4,-4.8,-6.0,-17.6,12.7,29,-33.3,5.8,95.9,4.6,"SFR"],
  ["Boston Properties","BXP",57.6,4.9,-11.7,-20.8,-17.8,10.2,61,-23.8,7.9,null,2.6,"Office"],
  ["Alexandria Real Estate","ARE",54.0,5.3,-6.5,1.5,-46.1,9.2,59,-37.6,9.1,91.4,-3.1,"Office"],
  ["Vornado Realty Trust","VNO",27.6,2.4,-14.1,-25.1,-32.7,6.0,61,-42.6,7.9,87.5,-7.4,"Office"],
  ["SL Green Realty","SLG",36.9,8.4,-17.9,-22.0,-42.9,2.9,77,-35.4,6.6,92.4,-5.5,"Office"],
  ["Kilroy Realty","KRC",29.8,7.2,-14.8,-30.8,-16.1,3.6,54,-36.8,9.8,80.9,0.6,"Office"],
  ["Cousins Properties","CUZ",23.2,5.5,-9.4,-10.2,-23.2,4.0,46,-22.6,8.7,89.3,0.3,"Office"],
  ["Douglas Emmett","DEI",9.9,7.7,-6.0,-19.3,-41.3,2.0,68,-34.1,8.4,null,3.5,"Office"],
  ["Highwoods Properties","HIW",22.5,8.9,-14.4,-19.3,-21.9,2.5,58,-30.1,9.6,85.1,-3.6,"Office"],
  ["Corp Office Properties","CDP",31.8,4.0,5.1,4.1,18.3,3.7,40,2.2,7.2,94.3,4.6,"Office"],
  ["Hudson Pacific","HPP",7.2,null,-19.4,-47.2,-68.6,0.5,87,-72.2,9.9,null,-10.7,"Office"],
  ["Empire State Realty","ESRT",5.9,2.4,-11.7,-16.0,-35.5,1.6,55,-53.2,10.9,null,-1.5,"Office"],
  ["JBG SMITH","JBGS",15.2,4.6,-9.7,-17.4,-4.0,1.1,66,-45.7,8.5,null,-6.7,"Office"],
  ["Brandywine Realty","BDN",3.2,10.0,11.7,-6.6,-35.1,0.6,83,-59.5,11.7,88.7,2.1,"Office"],
  ["Piedmont Office","PDM",7.6,null,-8.8,-13.5,2.3,0.9,70,-28.1,9.4,89.2,2.8,"Office"],
  ["Prologis","PLD",142.6,3.0,10.8,11.2,16.1,136.2,22,14.1,4.3,95.2,5.2,"Industrial"],
  ["Lineage","LINE",40.5,5.2,11.9,13.1,-32.1,10.5,42,-22.4,8.4,null,null,"Industrial"],
  ["Rexford Industrial","REXR",37.5,4.6,-4.9,-10.1,-8.1,9.0,26,-18.9,5.9,96.8,5.5,"Industrial"],
  ["EastGroup Properties","EGP",196.3,3.2,9.9,8.4,9.1,10.5,12,10.5,4.5,96.6,6.9,"Industrial"],
  ["Americold","COLD",13.4,6.9,5.0,24.4,-41.8,3.9,53,-34.9,9.8,75.5,-2.9,"Industrial"],
  ["STAG Industrial","STAG",39.2,4.0,5.6,-0.5,10.0,7.5,29,-1.1,6.1,97.0,3.9,"Industrial"],
  ["First Industrial","FR",63.1,3.2,9.9,9.8,10.8,8.6,22,-3.5,5.2,94.6,6.1,"Industrial"],
  ["Terreno Realty","TRNO",66.1,3.1,7.4,5.2,-2.7,6.8,13,10.2,4.1,98.6,6.9,"Industrial"],
  ["Lexington Realty","LXP",49.6,5.6,0.2,1.9,12.5,2.9,33,-12.3,6.6,96.9,2.0,"Industrial"],
  ["Kimco Realty","KIM",23.6,4.4,12.5,14.2,9.0,16.1,36,-5.2,6.7,null,1.9,"Grocery Retail"],
  ["Regency Centers","REG",79.0,3.8,10.8,10.9,4.6,14.8,27,6.4,5.6,null,4.8,"Grocery Retail"],
  ["Brixmor Property","BRX",30.3,4.1,15.1,16.0,9.8,9.3,36,5.1,6.6,null,4.0,"Grocery Retail"],
  ["Kite Realty Group","KRG",26.1,4.5,12.8,12.9,17.6,5.7,35,-7.1,7.0,null,2.1,"Grocery Retail"],
  ["Phillips Edison","PECO",39.3,3.3,10.9,11.1,8.2,5.4,31,1.0,6.3,null,3.3,"Grocery Retail"],
  ["Urban Edge","UE",21.3,4.0,10.9,10.5,4.6,2.8,36,2.5,6.8,null,4.7,"Grocery Retail"],
  ["Federal Realty","FRT",108.8,4.2,7.2,10.3,4.6,9.4,34,1.3,6.0,null,4.4,"Power Center"],
  ["Acadia Realty","AKR",20.9,3.8,6.6,2.5,-8.5,3.1,32,8.2,5.5,null,8.2,"Power Center"],
  ["Simon Property Group","SPG",203.9,4.3,10.5,9.9,11.6,77.9,30,26.7,5.7,null,5.1,"Mall"],
  ["Macerich","MAC",20.5,3.3,15.5,18.7,11.7,5.5,46,19.1,6.8,null,1.7,"Mall"],
  ["Tanger Outlets","SKT",37.1,3.2,14.1,10.3,5.6,4.4,28,18.5,6.8,null,4.0,"Mall"],
  ["Realty Income","O",67.0,4.8,10.0,17.3,18.4,61.6,31,22.1,6.2,null,null,"Net Lease"],
  ["W. P. Carey","WPC",74.7,4.9,7.9,10.8,16.3,16.6,34,41.8,6.1,null,null,"Net Lease"],
  ["NNN REIT","NNN",45.3,5.3,7.5,10.3,7.5,8.6,36,17.8,7.0,null,null,"Net Lease"],
  ["Agree Realty","ADC",80.5,3.9,10.8,7.3,9.4,9.2,28,53.0,5.5,null,null,"Net Lease"],
  ["Essential Properties","EPRT",33.9,3.7,12.5,7.8,4.4,7.1,26,23.5,5.9,null,null,"Net Lease"],
  ["Safehold","SAFE",16.1,4.4,15.7,15.0,-11.6,1.2,81,66.3,4.6,null,null,"Net Lease"],
  ["Broadstone Net Lease","BNL",19.4,6.0,6.1,10.7,15.6,3.7,42,1.2,7.0,null,null,"Net Lease"],
  ["Welltower","WELL",207.1,1.4,12.9,0.4,36.7,144.3,9,160.5,2.7,null,null,"Healthcare"],
  ["Ventas","VTR",86.2,2.4,13.4,7.6,25.5,41.5,23,82.9,4.3,null,null,"Healthcare"],
  ["Healthpeak Properties","DOC",17.7,6.9,-0.1,-2.9,-12.3,12.6,43,-19.0,7.3,null,null,"Healthcare"],
  ["Omega Healthcare","OHI",48.3,5.6,11.8,5.3,31.0,15.3,22,71.8,6.0,null,null,"Healthcare"],
  ["Medical Properties","MPT",5.8,6.3,12.7,-0.2,3.2,3.5,75,40.0,7.4,null,null,"Healthcare"],
  ["Healthcare Realty","HR",18.5,5.2,10.2,0.9,9.8,6.6,41,-11.9,6.6,null,null,"Healthcare"],
  ["Sabra Health Care","SBRA",20.6,5.8,11.0,6.3,24.9,5.4,30,26.8,6.9,null,null,"Healthcare"],
  ["Public Storage","PSA",307.1,3.9,10.6,12.0,0.4,54.1,21,-3.7,5.2,92.2,null,"Self-Storage"],
  ["Extra Space Storage","EXR",151.0,4.3,8.0,13.3,-1.6,33.5,29,-0.5,5.3,94.1,-2.5,"Self-Storage"],
  ["CubeSmart","CUBE",41.1,5.2,10.1,10.1,-3.3,9.4,27,-12.1,5.6,89.9,-1.5,"Self-Storage"],
  ["National Storage","NSA",35.0,6.5,9.5,18.8,-10.2,4.8,46,-4.0,6.0,85.0,-5.7,"Self-Storage"],
  ["Sun Communities","SUI",136.5,3.0,7.4,6.1,2.4,17.6,17,-2.4,5.8,99.2,5.4,"MH"],
  ["Equity LifeStyle","ELS",67.2,3.2,6.8,7.1,-1.7,13.5,20,-9.5,4.8,94.3,5.3,"MH"],
  ["Equinix","EQIX",974.3,2.1,20.3,29.8,7.0,97.8,18,-2.4,5.7,null,null,"Data Center"],
  ["Digital Realty","DLR",177.2,2.8,8.6,11.5,12.7,62.2,26,10.4,5.4,null,8.0,"Data Center"]
];

const INITIAL_SECTORS = [
  {name:"Multifamily",chg:1.0},{name:"SFR",chg:-3.0},{name:"Office",chg:-9.7},
  {name:"Industrial",chg:9.4},{name:"Grocery",chg:12.3},{name:"Mall",chg:11.0},
  {name:"Net Lease",chg:9.6},{name:"Healthcare",chg:12.1},{name:"Storage",chg:9.6},
  {name:"MH",chg:7.1},{name:"Data Ctr",chg:15.8}
];

const INITIAL_BRIEFS = [
  {type:"alert",tag:"OFFICE CARNAGE",text:"HPP -19.4% 1M, -68.6% 1Y. Deepest NAV discount at -72.2%. No dividend — equity nearly wiped. SLG -17.9%, KRC -14.8%, VNO -14.1%."},
  {type:"opportunity",tag:"DATA CENTERS RIPPING",text:"EQIX +20.3% 1M, +29.8% 3M — strongest sector momentum. DLR +8.6% 1M with 8.0% SS NOI growth. Sector W.A. +15.8% 1M."},
  {type:"alert",tag:"DEEP NAV DISLOCATIONS",text:"WELL at +160.5% premium to NAV — extreme. HPP -72.2%, BDN -59.5%, ESRT -53.2% — deep office distress persists."},
  {type:"watch",tag:"SFR UNDER PRESSURE",text:"INVH -26.4% off 52W high, NAV disc -39.6%. AMH at -33.3%. Both well-capitalized but market pricing significant cap rate expansion."},
  {type:"opportunity",tag:"RETAIL BROAD RALLY",text:"Grocery-anchored +12.3% 1M. BRX +15.1%, MAC +15.5%, SPG +10.5% with +26.7% NAV premium."},
  {type:"info",tag:"HEALTHCARE RERATING",text:"WELL now $144B mkt cap — largest REIT. +36.7% 1Y. VTR +25.5% 1Y. OHI +31.0% 1Y."},
  {type:"watch",tag:"COLD STORAGE SELLOFF",text:"COLD -41.8% 1Y, NAV disc -34.9%. Occ at 75.5% with -2.9% SS NOI."},
  {type:"info",tag:"YIELD WATCH",text:"Highest yields: BDN 10.0%, HIW 8.9%, SLG 8.4%, DEI 7.7%. All office — market pricing dividend risk."}
];

async function callClaude(systemPrompt, userMessage) {
  const resp = await fetch(API_URL, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      model: MODEL, max_tokens: 4000,
      system: systemPrompt,
      messages: [{role: "user", content: userMessage}],
      tools: [{type: "web_search_20250305", name: "web_search"}]
    })
  });
  if (!resp.ok) throw new Error(`API ${resp.status}`);
  const data = await resp.json();
  return data.content.filter(i => i.type === "text").map(i => i.text).join("\n");
}

function parseJSON(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  const match = clean.match(/\[[\s\S]*\]/);
  return match ? JSON.parse(match[0]) : null;
}

// ── Styles ──
const colors = {
  bg: "#0a0e14", surface: "#111720", surface2: "#161d28", border: "#1e2836",
  text: "#c5cdd8", muted: "#5a6878", bright: "#e8edf3",
  green: "#34d399", red: "#f87171", amber: "#fbbf24", blue: "#60a5fa", accent: "#818cf8",
  greenDim: "#134e3a", redDim: "#5c1e1e", amberDim: "#5c4a10", blueDim: "#1e3a5f", accentDim: "#312e81"
};

const typeColors = { alert: colors.red, opportunity: colors.green, watch: colors.amber, info: colors.blue };
const typeIcons = { alert: "▲", opportunity: "◆", watch: "◉", info: "●" };

export default function REITObserver() {
  const [reits, setReits] = useState(INITIAL_REITS);
  const [briefs, setBriefs] = useState(INITIAL_BRIEFS);
  const [dataMode, setDataMode] = useState("static");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState(-1);
  const [sortAsc, setSortAsc] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState("");
  const [modal, setModal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [briefTime, setBriefTime] = useState(null);
  const [logs, setLogs] = useState([]);
  const [updatedTickers, setUpdatedTickers] = useState(new Set());

  const addLog = useCallback((msg, type = "") => {
    const ts = new Date().toLocaleTimeString("en-US", {hour12: false});
    setLogs(prev => [...prev.slice(-30), {ts, msg, type}]);
  }, []);

  // ── REFRESH PRICES ──
  const refreshPrices = useCallback(async () => {
    setRefreshing(true);
    setLogs([]);
    addLog("Starting price refresh via web search...");
    const tickers = reits.map(r => r[1]);
    const batchSize = 12;
    const updates = {};
    const batches = [];
    for (let i = 0; i < tickers.length; i += batchSize) batches.push(tickers.slice(i, i + batchSize));

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      setRefreshProgress(`Batch ${i+1}/${batches.length}: ${batch.join(", ")}`);
      addLog(`Fetching batch ${i+1}/${batches.length}: ${batch.join(", ")}`);
      try {
        const text = await callClaude(
          "You are a financial data assistant. Return ONLY a JSON object mapping stock tickers to their current market prices as numbers. No markdown, no explanation. Example: {\"AVB\": 180.5, \"EQR\": 65.2}. If you cannot find a price, omit it.",
          `Search for the current stock prices of these REIT tickers and return as JSON: ${batch.join(", ")}`
        );
        try {
          const clean = text.replace(/```json|```/g, "").trim();
          const m = clean.match(/\{[\s\S]*\}/);
          if (m) {
            const prices = JSON.parse(m[0]);
            Object.assign(updates, prices);
            addLog(`✓ Got ${Object.keys(prices).length} prices`, "success");
          }
        } catch(e) { addLog(`Parse error batch ${i+1}: ${e.message}`, "error"); }
      } catch(e) { addLog(`API error batch ${i+1}: ${e.message}`, "error"); }
    }

    if (Object.keys(updates).length > 0) {
      const updated = new Set();
      setReits(prev => prev.map(r => {
        const ticker = r[1];
        if (updates[ticker] !== undefined) {
          const np = parseFloat(updates[ticker]);
          if (!isNaN(np) && np > 0) {
            updated.add(ticker);
            const copy = [...r];
            copy[2] = np;
            return copy;
          }
        }
        return r;
      }));
      setUpdatedTickers(updated);
      setDataMode("live");
      addLog(`✓ Refresh complete. Updated ${Object.keys(updates).length}/${tickers.length} tickers.`, "success");
      setTimeout(() => setUpdatedTickers(new Set()), 5000);
    } else {
      addLog("No prices returned.", "error");
    }
    setRefreshing(false);
    setRefreshProgress("");
  }, [reits, addLog]);

  // ── GENERATE BRIEF ──
  const generateBrief = useCallback(async () => {
    setGenerating(true);
    addLog("Generating AI brief with web search...");
    const topMovers = [...reits].sort((a,b) => Math.abs(b[4]||0) - Math.abs(a[4]||0)).slice(0,10).map(r => r[1]).join(", ");
    const deepDisc = reits.filter(r => r[9] !== null && r[9] <= -30).map(r => `${r[1]}(${r[9]}%)`).join(", ");
    const summary = reits.map(r => `${r[1]}: $${r[2]}, Yld:${r[3]||"–"}%, 1M:${r[4]}%, 1Y:${r[6]}%, NAV:${r[9]}%`).join("\n");

    try {
      const text = await callClaude(
        `You are a senior REIT equity research analyst producing a daily end-of-day brief for an institutional CRE investor at Starwood Capital. Output ONLY a JSON array. No markdown fences. Each object: {"type":"alert|opportunity|watch|info","tag":"SHORT LABEL","text":"observation text"}. Use ticker symbols in caps. Be specific with numbers. Search for today's REIT news, analyst moves, earnings. Produce 5-8 observations ordered by importance. Keep each 1-3 sentences.`,
        `Today: ${new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}\n\nTOP MOVERS: ${topMovers}\nDEEP DISCOUNTS: ${deepDisc}\n\nPORTFOLIO:\n${summary}\n\nSearch for recent REIT sector news, analyst upgrades/downgrades, earnings, M&A. Produce the daily brief as JSON array.`
      );
      const parsed = parseJSON(text);
      if (parsed && parsed.length > 0) {
        setBriefs(parsed);
        setBriefTime(new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}));
        addLog(`✓ Generated ${parsed.length} observations.`, "success");
      } else {
        addLog("Could not parse brief response.", "error");
      }
    } catch(e) { addLog(`Brief generation failed: ${e.message}`, "error"); }
    setGenerating(false);
  }, [reits, addLog]);

  // ── TICKER DRILL-DOWN ──
  const openTicker = useCallback(async (ticker, company) => {
    setModal({ticker, company});
    setModalLoading(true);
    setModalData(null);
    const reit = reits.find(r => r[1] === ticker);
    const ctx = reit ? `Price:$${reit[2]}, Yld:${reit[3]||"–"}%, 1M:${reit[4]}%, 1Y:${reit[6]}%, NAV:${reit[9]}%, CapRate:${reit[10]}%` : "";
    try {
      const text = await callClaude(
        `You are a REIT research analyst. Search for the latest news on this stock. Return ONLY a JSON array. Each item: {"headline":"string","summary":"2-3 sentences","sentiment":"positive|negative|neutral","source":"source name"}. Return 4-8 items. Prioritize analyst ratings, earnings, M&A, material developments. Include a final item with your analytical take.`,
        `Search for latest news and analyst coverage on ${ticker} (${company}). Metrics: ${ctx}`
      );
      const parsed = parseJSON(text);
      setModalData(parsed || [{headline:"Analysis",summary:text.substring(0,600),sentiment:"neutral",source:"Claude"}]);
    } catch(e) {
      setModalData([{headline:"Error",summary:e.message,sentiment:"negative",source:""}]);
    }
    setModalLoading(false);
  }, [reits]);

  // ── FILTERING / SORTING ──
  let displayData = [...reits];
  if (search) displayData = displayData.filter(r => r[0].toLowerCase().includes(search.toLowerCase()) || r[1].toLowerCase().includes(search.toLowerCase()));
  if (filter === "deep-discount") displayData = displayData.filter(r => r[9] !== null && r[9] <= -25);
  else if (filter === "movers") displayData = displayData.filter(r => Math.abs(r[4]||0) >= 10);
  else if (filter === "high-yield") displayData = displayData.filter(r => r[3] !== null && r[3] >= 5.5);

  if (sortCol >= 0) {
    displayData.sort((a,b) => {
      let va = a[sortCol], vb = b[sortCol];
      if (va === null) va = -Infinity; if (vb === null) vb = -Infinity;
      if (typeof va === "string") return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortAsc ? va - vb : vb - va;
    });
  }

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(col <= 1); }
  };

  // ── HELPERS ──
  const chgClass = v => v === null ? "" : v >= 5 ? "dp" : v > 0 ? "p" : v <= -10 ? "dn" : v < 0 ? "n" : "";
  const fmtChg = v => v === null || v === undefined ? "–" : `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
  const fmtNav = v => v === null ? "–" : `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;

  const chgColor = v => {
    if (v === null || v === undefined) return colors.muted;
    if (v >= 5) return colors.green; if (v > 0) return "#86efac";
    if (v <= -10) return colors.red; if (v < 0) return "#fca5a5";
    return colors.text;
  };

  const navColor = v => v === null ? colors.muted : v >= 0 ? colors.green : colors.red;
  const sentColor = s => s === "positive" ? colors.green : s === "negative" ? colors.red : colors.muted;

  // Group by sector for display
  let grouped = [];
  let lastSector = "";
  displayData.forEach(r => {
    if (r[13] !== lastSector && !search && sortCol < 0) {
      lastSector = r[13];
      grouped.push({type: "sector", name: r[13]});
    }
    grouped.push({type: "row", data: r});
  });

  const thLabels = ["Company","Ticker","Price","Yld","1M","3M","1Y","Mkt Cap","D/EV","NAV","Cap Rt","Occ","SS NOI"];
  const thIdx =    [0,1,2,3,4,5,6,7,8,9,10,11,12];

  return (
    <div style={{background:colors.bg, color:colors.text, fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:13, minHeight:"100vh", lineHeight:1.5}}>

      {/* Header */}
      <div style={{padding:"18px 24px 14px", borderBottom:`1px solid ${colors.border}`, display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12}}>
        <div style={{display:"flex", alignItems:"center", gap:14}}>
          <div style={{width:7,height:30,background:colors.accent,borderRadius:2}}/>
          <div>
            <div style={{fontSize:17,fontWeight:600,color:colors.bright,letterSpacing:"-0.3px"}}>REIT Daily Observer</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:colors.muted,marginTop:2}}>
              {dataMode === "live" ? `Live · Updated ${new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}` : "Static · PDF 02/27/26"}
            </div>
          </div>
        </div>
        <div style={{display:"flex", gap:8, alignItems:"center", flexWrap:"wrap"}}>
          <span style={{
            fontSize:9, fontFamily:"monospace", padding:"3px 8px", borderRadius:3,
            background: dataMode === "live" ? colors.greenDim : colors.amberDim,
            color: dataMode === "live" ? colors.green : colors.amber,
            textTransform:"uppercase", letterSpacing:0.5
          }}>{dataMode === "live" ? "Live Data" : "Static Data"}</span>
          <button onClick={refreshPrices} disabled={refreshing} style={{
            display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:5,
            border:`1px solid ${colors.border}`,background:colors.surface,
            color:refreshing?colors.muted:colors.text,cursor:refreshing?"wait":"pointer",
            fontFamily:"monospace",fontSize:10,textTransform:"uppercase",letterSpacing:0.5,opacity:refreshing?0.6:1
          }}>{refreshing ? "⏳" : "⟳"} Refresh Prices</button>
          <button onClick={generateBrief} disabled={generating} style={{
            display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:5,
            border:`1px solid ${colors.accent}`,background:colors.accentDim,
            color:colors.accent,cursor:generating?"wait":"pointer",
            fontFamily:"monospace",fontSize:10,textTransform:"uppercase",letterSpacing:0.5,opacity:generating?0.6:1
          }}>{generating ? "⏳" : "◆"} Generate Brief</button>
        </div>
      </div>

      {/* Sector Strip */}
      <div style={{padding:"10px 24px",display:"flex",gap:12,overflowX:"auto",borderBottom:`1px solid ${colors.border}`}}>
        {INITIAL_SECTORS.map(s => (
          <div key={s.name} style={{
            display:"flex",alignItems:"center",gap:7,padding:"5px 10px",
            background:colors.surface,border:`1px solid ${colors.border}`,borderRadius:5,whiteSpace:"nowrap"
          }}>
            <span style={{fontSize:9,fontFamily:"monospace",color:colors.muted,textTransform:"uppercase",letterSpacing:0.5}}>{s.name}</span>
            <span style={{fontSize:11,fontFamily:"monospace",fontWeight:600,color:s.chg>=0?colors.green:colors.red}}>
              {s.chg>=0?"+":""}{s.chg.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      {/* Log Panel */}
      {logs.length > 0 && (
        <div style={{padding:"8px 24px",borderBottom:`1px solid ${colors.border}`,background:colors.surface,maxHeight:120,overflowY:"auto"}}>
          {refreshProgress && <div style={{fontFamily:"monospace",fontSize:10,color:colors.accent,marginBottom:4}}>{refreshProgress}</div>}
          {logs.slice(-8).map((l,i) => (
            <div key={i} style={{fontFamily:"monospace",fontSize:10,color:l.type==="success"?colors.green:l.type==="error"?colors.red:colors.muted,padding:"1px 0"}}>
              <span style={{color:colors.muted,marginRight:8}}>[{l.ts}]</span>{l.msg}
            </div>
          ))}
        </div>
      )}

      {/* Brief Section */}
      <div style={{padding:"18px 24px",borderBottom:`1px solid ${colors.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <span style={{fontSize:10,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1.2,color:colors.accent}}>
            Daily Brief{briefTime ? ` · AI Generated ${briefTime}` : " · Key Observations"}
          </span>
        </div>
        {generating ? (
          <div style={{padding:24,textAlign:"center",background:colors.surface,border:`1px solid ${colors.border}`,borderRadius:6}}>
            <div style={{fontSize:11,fontFamily:"monospace",color:colors.muted}}>
              ⏳ Searching for REIT news and generating analysis...
            </div>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {briefs.map((b,i) => (
              <div key={i} style={{
                background:colors.surface, border:`1px solid ${colors.border}`, borderRadius:6,
                padding:"12px 14px", borderLeft:`3px solid ${typeColors[b.type]||colors.blue}`
              }}>
                <div style={{fontSize:9,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:0.8,color:typeColors[b.type]||colors.blue,marginBottom:5}}>
                  {typeIcons[b.type]||"●"} {b.tag}
                </div>
                <div style={{fontSize:12,color:colors.text,lineHeight:1.55}}>{b.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{padding:"10px 24px",display:"flex",gap:6,alignItems:"center",borderBottom:`1px solid ${colors.border}`}}>
        {[["all","All"],["deep-discount","Deep Discount"],["movers","1M Movers"],["high-yield","High Yield"]].map(([k,l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            fontSize:10,fontFamily:"monospace",padding:"4px 10px",borderRadius:4,
            border:`1px solid ${filter===k?colors.accent:colors.border}`,
            background:filter===k?colors.accentDim:"transparent",
            color:filter===k?colors.accent:colors.muted,cursor:"pointer",
            textTransform:"uppercase",letterSpacing:0.5
          }}>{l}</button>
        ))}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search ticker..."
          style={{
            marginLeft:"auto",fontSize:11,fontFamily:"monospace",padding:"5px 10px",borderRadius:4,
            border:`1px solid ${colors.border}`,background:colors.surface,color:colors.text,outline:"none",width:150
          }}/>
      </div>

      {/* Table */}
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr>
              {thLabels.map((label,i) => (
                <th key={i} onClick={() => handleSort(thIdx[i])} style={{
                  position:"sticky",top:0,background:colors.surface,fontFamily:"monospace",fontSize:9,fontWeight:500,
                  textTransform:"uppercase",letterSpacing:0.5,color:sortCol===thIdx[i]?colors.accent:colors.muted,
                  padding:"8px 8px",textAlign:i<=1?"left":"right",borderBottom:`1px solid ${colors.border}`,
                  whiteSpace:"nowrap",cursor:"pointer",userSelect:"none"
                }}>{label}{sortCol===thIdx[i] ? (sortAsc?" ↑":" ↓") : ""}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grouped.map((item, idx) => {
              if (item.type === "sector") {
                return (
                  <tr key={`s-${idx}`}>
                    <td colSpan={13} style={{
                      fontWeight:600,color:colors.bright,fontSize:10,padding:"6px 8px",
                      fontFamily:"monospace",textTransform:"uppercase",letterSpacing:0.8,
                      background:colors.surface,borderBottom:`2px solid ${colors.border}`
                    }}>{item.name}</td>
                  </tr>
                );
              }
              const r = item.data;
              const isUpdated = updatedTickers.has(r[1]);
              return (
                <tr key={r[1]} onClick={() => openTicker(r[1], r[0])} style={{
                  borderBottom:`1px solid ${colors.border}`,cursor:"pointer",
                  background: isUpdated ? "rgba(129,140,248,0.06)" : "transparent"
                }}
                  onMouseEnter={e => e.currentTarget.style.background = colors.surface2}
                  onMouseLeave={e => e.currentTarget.style.background = isUpdated ? "rgba(129,140,248,0.06)" : "transparent"}
                >
                  <td style={{padding:"7px 8px",textAlign:"left",fontFamily:"'DM Sans',sans-serif",fontWeight:500,color:colors.text,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r[0]}</td>
                  <td style={{padding:"7px 8px",textAlign:"left",fontFamily:"monospace",fontWeight:600,color:colors.bright}}>{r[1]}</td>
                  <td style={{padding:"7px 8px",textAlign:"right",fontFamily:"monospace",color:isUpdated?colors.accent:colors.text}}>${r[2].toFixed(1)}</td>
                  <td style={{padding:"7px 8px",textAlign:"right",fontFamily:"monospace",color:colors.text}}>{r[3]!==null?r[3].toFixed(1)+"%":"–"}</td>
                  <td style={{padding:"7px 8px",textAlign:"right",fontFamily:"monospace",color:chgColor(r[4]),fontWeight:Math.abs(r[4]||0)>=10?600:400}}>{fmtChg(r[4])}</td>
                  <td style={{padding:"7px 8px",textAlign:"right",fontFamily:"monospace",color:chgColor(r[5]),fontWeight:Math.abs(r[5]||0)>=10?600:400}}>{fmtChg(r[5])}</td>
                  <td style={{padding:"7px 8px",textAlign:"right",fontFamily:"monospace",color:chgColor(r[6]),fontWeight:Math.abs(r[6]||0)>=10?600:400}}>{fmtChg(r[6])}</td>
                  <td style={{padding:"7px 8px",textAlign:"right",fontFamily:"monospace",color:colors.text}}>${r[7].toFixed(1)}B</td>
                  <td style={{padding:"7px 8px",textAlign:"right",fontFamily:"monospace",color:r[8]>=60?colors.red:colors.text}}>{r[8]}%</td>
                  <td style={{padding:"7px 8px",textAlign:"right",fontFamily:"monospace",color:navColor(r[9]),fontWeight:Math.abs(r[9]||0)>=30?600:400}}>
                    {r[9]!==null && Math.abs(r[9])>=30 && <span style={{display:"inline-block",width:5,height:5,borderRadius:"50%",background:navColor(r[9]),marginRight:4}}/>}
                    {fmtNav(r[9])}
                  </td>
                  <td style={{padding:"7px 8px",textAlign:"right",fontFamily:"monospace",color:colors.text}}>{r[10]!==null?r[10].toFixed(1)+"%":"–"}</td>
                  <td style={{padding:"7px 8px",textAlign:"right",fontFamily:"monospace",color:colors.text}}>{r[11]!==null?r[11].toFixed(1)+"%":"–"}</td>
                  <td style={{padding:"7px 8px",textAlign:"right",fontFamily:"monospace",color:chgColor(r[12]),fontWeight:Math.abs(r[12]||0)>=5?600:400}}>{fmtChg(r[12])}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div onClick={e => { if(e.target === e.currentTarget) setModal(null); }} style={{
          position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.7)",
          display:"flex",justifyContent:"center",alignItems:"flex-start",paddingTop:60
        }}>
          <div style={{
            background:colors.bg,border:`1px solid ${colors.border}`,borderRadius:10,
            width:600,maxWidth:"95vw",maxHeight:"80vh",overflowY:"auto",
            boxShadow:"0 20px 60px rgba(0,0,0,0.5)"
          }}>
            <div style={{padding:"14px 18px",borderBottom:`1px solid ${colors.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:15,fontWeight:600,color:colors.bright}}>{modal.ticker} · {modal.company}</div>
              <button onClick={() => setModal(null)} style={{background:"none",border:"none",color:colors.muted,fontSize:20,cursor:"pointer",padding:"4px 8px"}}>×</button>
            </div>
            <div style={{padding:"14px 18px"}}>
              {modalLoading ? (
                <div style={{textAlign:"center",padding:30,fontFamily:"monospace",fontSize:11,color:colors.muted}}>
                  ⏳ Searching for latest {modal.ticker} news and analysis...
                </div>
              ) : modalData ? (
                modalData.map((item,i) => (
                  <div key={i} style={{padding:"10px 0",borderBottom:i<modalData.length-1?`1px solid ${colors.border}`:"none"}}>
                    <div style={{fontSize:13,color:colors.bright,marginBottom:3,display:"flex",alignItems:"center",gap:6}}>
                      <span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:sentColor(item.sentiment)}}/>
                      {item.headline}
                    </div>
                    <div style={{fontSize:12,color:colors.muted,lineHeight:1.5}}>
                      {item.summary}
                      {item.source && <span style={{color:colors.accent,fontSize:10,fontFamily:"monospace",marginLeft:6}}>— {item.source}</span>}
                    </div>
                  </div>
                ))
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
