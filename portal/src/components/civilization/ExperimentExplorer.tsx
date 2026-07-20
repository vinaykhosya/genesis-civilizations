import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, Cell,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ResourceFrame {
  tick: number; population: number; alive: number; births: number; deaths: number;
  stored_food: number; stored_water: number; mean_hunger: number; mean_thirst: number;
  mean_shelter: number; dominant_emotion: string; novelty: number; avg_trust: number;
  climate: string; major_event: string; gene_averages: Record<string, number>;
}
export interface ReplayAgent {
  id: number; colony_id: number; generation: number; shelter_location: [number,number];
  cause_of_death: string; primary_cause: string; secondary_cause: string;
  fat_reserves: number; muscle_mass: number; injury_level: number; shelter_level: number;
  life_stage: string; born_tick: number; ticks_survived: number; behavior_cluster: string;
  genome: number[]; drives: Record<string,number|string>; motivation: Record<string,number>;
  stored_food: number; stored_water: number; parent_ids: number[]; children_ids: number[];
  years_survived: number; max_age: number;
}
export interface ReplayData {
  metadata: { seed: number; ticks: number; scarcity: number; experiment: string; timestamp: string; survivors: string; };
  agents: ReplayAgent[];
  events_timeline: Array<{ tick: number; year: number; day: number; type: string; description: string; metadata: any; }>;
  colonies: Array<{ id: number; name: string; color: string; stored_food: number; stored_water: number; founder_ids: number[]; }>;
  population_history: Array<{ tick: number; total: number; per_colony: number[]; }>;
  genetic_history: Array<{ tick: number; diversity_score: number; within_colony_diversity: number; between_colony_diversity: number; gene_means: number[]; }>;
  epoch_stats: Array<{
    epoch: number; alive: number; avg_discoveries: number; avg_radius: number; avg_knowledge: number;
    deaths_starvation: number; deaths_dehydration: number; deaths_exposure: number; deaths_old_age: number;
    deaths_injury: number; total_births: number; total_deaths: number;
    avg_generation: number; max_generation: number; genetic_diversity: number; per_colony_alive: number[];
    avg_fat_reserves: number; avg_muscle_mass: number; avg_injury_level: number; avg_hunger: number; avg_thirst: number;
  }>;
  behavior_clustering: { agent_clusters: Record<string, string>; };
  gene_names: string[];
  extinction_events: Array<{ tick: number; colony_id: number; colony_name: string; }>;
  death_density: Array<[number, number, number]>;
  total_births: number; total_deaths: number; generation_number: number;
  telemetry: {
    resource_timeline: ResourceFrame[];
    scientific_hypotheses: Array<{ id: string; category: string; title: string; confidence: number; evidence: string[]; alternatives: string[]; }>;
    repro_successes: number; repro_actual_opportunities: number;
    water_searches: number; water_search_successes: number; water_search_distance_avg: number;
    dehydration_deaths: number; births_by_generation: Record<string,number>;
  };
  spawn_conditions: Record<string, { coords: [number,number]; biome: string; temperature?: number; elevation?: number; }>;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const COLONY_COLORS: Record<number,string> = { 0:"#ef4444", 1:"#3b82f6", 2:"#10b981", 3:"#f97316" };
const COLONY_NAMES = ["Alpha","Beta","Gamma","Delta"];
const SPEED_OPTIONS = [0.25,0.5,1,2,5,10,25,50];
const CLUSTER_COLORS: Record<string,string> = { C0:"#6366f1",C1:"#10b981",C2:"#f59e0b",C3:"#ef4444",C4:"#8b5cf6" };
const GENE_SHORT: Record<string,string> = {
  g_metabolism:"Metab",g_thermoregulation:"Thermo",g_vision:"Vision",g_mobility:"Mobil",
  g_memory_fidelity:"Memory",g_planning:"Plan",g_novelty_seeking:"Novelty",g_social_proximity:"Social",
  g_aggression:"Aggr",g_resource_sharing:"Sharing",g_risk_sensitivity:"Risk",g_resilience:"Resil",
  g_longevity:"Long",g_learning_rate:"Learn",
};

function tickToYear(tick: number, maxTick = 100228, maxYear = 300) {
  return Math.round((tick / maxTick) * maxYear);
}
function fmtNum(n: number | undefined | null, decimals = 1) {
  if (n == null || isNaN(n)) return "—";
  return n.toFixed(decimals);
}

// ─── Metric Card ─────────────────────────────────────────────────────────────
const MetricCard: React.FC<{ label: string; value: React.ReactNode; color?: string; sub?: string }> = ({ label, value, color, sub }) => (
  <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"12px 14px" }}>
    <div style={{ color:"rgba(255,255,255,0.4)", fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>{label}</div>
    <div style={{ color: color || "#fff", fontWeight:700, fontSize:16 }}>{value}</div>
    {sub && <div style={{ color:"rgba(255,255,255,0.35)", fontSize:10, marginTop:3 }}>{sub}</div>}
  </div>
);

// ─── Tooltip style ────────────────────────────────────────────────────────────
const TT_STYLE = { background:"#1e293b", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, fontSize:11 };

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props { replay: ReplayData; coverUrl: string; experimentId: string; experimentTitle: string; }

const ExperimentExplorer: React.FC<Props> = ({ replay, coverUrl, experimentId, experimentTitle }) => {
  const timeline = useMemo(() => [...(replay.telemetry.resource_timeline || [])].sort((a,b) => a.tick - b.tick), [replay]);
  const maxTick = replay.metadata.ticks || 100228;
  const minTick = timeline[0]?.tick || 0;

  // ─ State ────────────────────────────────────────────────────────────────────
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [activeTab, setActiveTab] = useState<"explorer"|"population"|"evolution"|"agents"|"colonies"|"telemetry">("explorer");
  const [selectedAgent, setSelectedAgent] = useState<ReplayAgent|null>(null);
  const [followAgent, setFollowAgent] = useState<ReplayAgent|null>(null);
  const [agentSearch, setAgentSearch] = useState("");
  const [isCinematic, setIsCinematic] = useState(false);
  const [cinematicCard, setCinematicCard] = useState(0);
  const [expandedHyp, setExpandedHyp] = useState<string|null>(null);
  const [followInput, setFollowInput] = useState("");
  const [mapLayers, setMapLayers] = useState({ agents:true, shelters:true, territories:true, heatmap:false });

  const animRef = useRef<number|null>(null);
  const lastStepRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldImgRef = useRef<HTMLImageElement|null>(null);

  const currentFrame = timeline[frameIndex] || timeline[0];
  const currentTick = currentFrame?.tick || minTick;

  // ─ Load world image ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!coverUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = coverUrl;
    img.onload = () => { worldImgRef.current = img; drawCanvas(frameIndex); };
  }, [coverUrl]);

  // ─ Canvas drawing ────────────────────────────────────────────────────────────
  const drawCanvas = useCallback((fi: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    if (worldImgRef.current) {
      ctx.drawImage(worldImgRef.current, 0, 0, W, H);
    } else {
      ctx.fillStyle = "#0b1622"; ctx.fillRect(0,0,W,H);
    }
    const frame = timeline[fi] || timeline[0];
    const frameTick = frame?.tick || 0;
    const scale = W / 1024;

    // Death heatmap
    if (mapLayers.heatmap) {
      replay.death_density.forEach(([row,col,density]) => {
        ctx.beginPath(); ctx.arc(col*scale, row*scale, 5*scale, 0, Math.PI*2);
        ctx.fillStyle = `rgba(239,68,68,${Math.min(density*3,0.65)})`; ctx.fill();
      });
    }

    // Colony territories
    if (mapLayers.territories) {
      Object.entries(replay.spawn_conditions).forEach(([colName, cond]) => {
        const col = replay.colonies.find(c => c.name === colName);
        if (!col) return;
        const [row, c] = cond.coords;
        ctx.beginPath(); ctx.arc(c*scale, row*scale, 55*scale, 0, Math.PI*2);
        ctx.fillStyle = col.color + "14"; ctx.strokeStyle = col.color + "45";
        ctx.lineWidth = 1; ctx.fill(); ctx.stroke();
        ctx.font = `bold ${Math.max(9,10*scale)}px Inter,sans-serif`;
        ctx.fillStyle = col.color; ctx.textAlign = "center";
        ctx.fillText(colName, c*scale, row*scale - 58*scale);
      });
    }

    // Agents
    if (mapLayers.agents) {
      replay.agents.forEach(agent => {
        const isAlive = (agent.cause_of_death === "none" || agent.cause_of_death === "None")
          ? true : (agent.born_tick + (agent.ticks_survived||0)) > frameTick;
        if (!isAlive) return;
        const loc = agent.shelter_location || replay.spawn_conditions[COLONY_NAMES[agent.colony_id]]?.coords;
        if (!loc) return;
        const [row, col] = loc;
        const x = col*scale, y = row*scale;
        const r = (mapLayers.shelters && agent.shelter_level > 0 ? 4 : 3) * scale;
        const color = COLONY_COLORS[agent.colony_id] || "#fff";
        const isFollow = followAgent?.id === agent.id;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
        ctx.fillStyle = isFollow ? "#fff" : color;
        ctx.strokeStyle = isFollow ? "#fff" : color + "88";
        ctx.lineWidth = isFollow ? 2 : 0.5;
        ctx.fill(); ctx.stroke();
      });
      // Follow ring
      if (followAgent) {
        const loc = followAgent.shelter_location || replay.spawn_conditions[COLONY_NAMES[followAgent.colony_id]]?.coords;
        if (loc) {
          const [row, col] = loc;
          ctx.beginPath(); ctx.arc(col*scale, row*scale, 12*scale, 0, Math.PI*2);
          ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
          ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);
        }
      }
    }
  }, [replay, timeline, mapLayers, followAgent]);

  useEffect(() => { drawCanvas(frameIndex); }, [frameIndex, drawCanvas]);

  // ─ Playback ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) { if (animRef.current) cancelAnimationFrame(animRef.current); return; }
    const step = (ts: number) => {
      if (ts - lastStepRef.current > 1000 / (speed * 2)) {
        lastStepRef.current = ts;
        setFrameIndex(fi => {
          if (fi >= timeline.length - 1) { setIsPlaying(false); return fi; }
          return fi + 1;
        });
      }
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isPlaying, speed, timeline.length]);

  // ─ Cinematic ────────────────────────────────────────────────────────────────
  const cinematicCards = useMemo(() => {
    const milestones = replay.events_timeline
      .filter(e => e.type === "Milestone" || e.type === "Extinction")
      .slice(0, 10)
      .map(e => ({ year: e.year, text: e.description }));
    return [
      { year: 0, text: `${replay.agents.filter(a => a.generation === 0).length} founders awaken on a new world.` },
      ...milestones,
      { year: tickToYear(maxTick), text: `Civilization endures. ${replay.metadata.survivors} agents survive across ${tickToYear(maxTick)} simulated years.` },
    ];
  }, [replay, maxTick]);

  useEffect(() => {
    if (!isCinematic) return;
    setIsPlaying(true); setSpeed(5); setCinematicCard(0);
    const iv = setInterval(() => setCinematicCard(c => Math.min(c+1, cinematicCards.length-1)), 4000);
    return () => clearInterval(iv);
  }, [isCinematic, cinematicCards.length]);

  // ─ Derived data ──────────────────────────────────────────────────────────────
  const eventMarkers = useMemo(() =>
    replay.events_timeline.filter(e => e.type === "Milestone" || e.type === "Extinction" || e.type === "PlateauStatus"),
    [replay]
  );

  const epochData = useMemo(() => replay.epoch_stats.map(e => ({
    epoch: `E${e.epoch}`, alive: e.alive, diversity: +(e.genetic_diversity||0).toFixed(3),
    fat: +(e.avg_fat_reserves||0).toFixed(1), muscle: +(e.avg_muscle_mass||0).toFixed(1),
    hunger: +(e.avg_hunger||0).toFixed(1), thirst: +(e.avg_thirst||0).toFixed(1),
    injury: +(e.avg_injury_level||0).toFixed(1), births: e.total_births, deaths: e.total_deaths,
    dehydration: e.deaths_dehydration, starvation: e.deaths_starvation,
    oldAge: e.deaths_old_age, exposure: e.deaths_exposure,
  })), [replay.epoch_stats]);

  const geneRadarData = useMemo(() => {
    const ga = currentFrame?.gene_averages;
    if (!ga) return [];
    return Object.entries(ga).map(([k,v]) => ({ gene: GENE_SHORT[k]||k.slice(2,8), value: Math.round(v*100) }));
  }, [currentFrame]);

  const scatterData = useMemo(() =>
    replay.agents.slice(0, 300).map(a => ({
      x: +(a.genome?.[0]||0).toFixed(3), y: +(a.genome?.[7]||0).toFixed(3),
      cluster: a.behavior_cluster || "C0", id: a.id,
    })), [replay.agents]
  );

  const clusterData = useMemo(() => {
    const counts: Record<string,number> = {};
    Object.values(replay.behavior_clustering?.agent_clusters || {}).forEach(c => { counts[c] = (counts[c]||0)+1; });
    return Object.entries(counts).sort((a,b) => a[0].localeCompare(b[0])).map(([cluster,count]) => ({ cluster, count }));
  }, [replay]);

  const birthsByGen = useMemo(() =>
    Object.entries(replay.telemetry.births_by_generation || {}).map(([gen,count]) => ({ gen:`Gen ${gen}`, count: count as number })),
    [replay.telemetry]
  );

  const filteredAgents = useMemo(() => {
    const q = agentSearch.trim().toLowerCase();
    if (!q) return replay.agents.slice(0, 80);
    return replay.agents.filter(a =>
      String(a.id).includes(q) ||
      (COLONY_NAMES[a.colony_id]||"").toLowerCase().includes(q) ||
      (a.behavior_cluster||"").toLowerCase().includes(q)
    );
  }, [replay.agents, agentSearch]);

  const progressPct = timeline.length > 1 ? (frameIndex / (timeline.length-1)) * 100 : 0;

  // ─ Cinematic overlay ─────────────────────────────────────────────────────────
  if (isCinematic) return (
    <div onClick={() => setIsCinematic(false)} style={{
      position:"fixed", inset:0, zIndex:50, background:"#000",
      display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
    }}>
      <canvas ref={canvasRef} width={900} height={900}
        style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity:0.25 }} />
      <div style={{ position:"relative", zIndex:10, textAlign:"center", maxWidth:640, padding:"0 32px" }}>
        <div style={{ color:"#818cf8", fontSize:12, fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:16 }}>
          Year {tickToYear(currentTick)} · {currentFrame?.dominant_emotion || ""}
        </div>
        <div key={cinematicCard} style={{ fontSize:38, fontWeight:800, color:"#fff", lineHeight:1.3, animation:"fadeIn 1s ease" }}>
          {cinematicCards[cinematicCard]?.text}
        </div>
        <div style={{ marginTop:40, display:"flex", gap:6, justifyContent:"center" }}>
          {cinematicCards.map((_,i) => (
            <div key={i} style={{ height:3, borderRadius:2, background: i===cinematicCard ? "#6366f1":"rgba(255,255,255,0.2)", width: i===cinematicCard ? 32:8, transition:"all 0.3s" }} />
          ))}
        </div>
        <div style={{ color:"rgba(255,255,255,0.3)", fontSize:11, marginTop:24 }}>Click anywhere to exit</div>
      </div>
    </div>
  );

  const S = {
    root: { width:"100%", background:"#080c14", color:"#f3f4f6", fontFamily:"'Inter',system-ui,sans-serif" } as React.CSSProperties,
    card: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"20px" } as React.CSSProperties,
    sectionHeader: { fontWeight:700, color:"#fff", marginBottom:16, fontSize:15 } as React.CSSProperties,
  };

  return (
    <div style={S.root}>
      <style>{`
        @keyframes fadeIn { from { opacity:0;transform:translateY(8px); } to { opacity:1;transform:translateY(0); } }
        .exp-fade { animation: fadeIn 0.35s ease; }
        .tab-active { background:rgba(99,102,241,0.18)!important; border-color:#6366f1!important; color:#a5b4fc!important; }
        .tab-btn { background:transparent; border:1px solid transparent; color:rgba(255,255,255,0.45);
          padding:10px 18px; border-radius:8px 8px 0 0; font-size:13px; font-weight:600; cursor:pointer;
          white-space:nowrap; transition:all 0.2s; }
        .tab-btn:hover { color:rgba(255,255,255,0.8); }
        .agent-chip { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08);
          border-radius:8px; padding:10px; text-align:left; cursor:pointer; transition:all 0.2s; width:100%; }
        .agent-chip:hover { background:rgba(255,255,255,0.06); }
        .agent-chip.selected { border-color:#6366f1; background:rgba(99,102,241,0.12); }
        input[type=range] { accent-color:#6366f1; cursor:pointer; }
        .ev-mark:hover .ev-tip { display:block!important; }
        .speed-btn { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);
          color:rgba(255,255,255,0.4); padding:4px 10px; border-radius:6px; cursor:pointer;
          font-size:11px; font-family:monospace; transition:all 0.15s; }
        .speed-btn:hover { color:#fff; }
        .speed-btn.active { background:#4f46e5; border-color:#4f46e5; color:#fff; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.15); border-radius:4px; }
      `}</style>

      {/* ═══ Section Header ═════════════════════════════════════════════════ */}
      <div style={{ borderBottom:"1px solid rgba(255,255,255,0.08)", padding:"20px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
              <span style={{ background:"rgba(99,102,241,0.15)", color:"#a5b4fc", border:"1px solid rgba(99,102,241,0.3)", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:9999, letterSpacing:"0.05em", textTransform:"uppercase" }}>{experimentId}</span>
              <span style={{ color:"rgba(255,255,255,0.3)", fontSize:11 }}>Experiment Explorer</span>
            </div>
            <h2 style={{ fontSize:18, fontWeight:800, color:"#fff", margin:0 }}>{experimentTitle}</h2>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => setIsCinematic(true)} style={{
              background:"linear-gradient(135deg,#4f46e5,#7c3aed)", color:"#fff", border:"none",
              borderRadius:8, padding:"9px 18px", fontSize:13, fontWeight:700, cursor:"pointer",
              boxShadow:"0 4px 20px rgba(79,70,229,0.3)",
            }}>🎬 Cinematic Mode</button>
            <a href={`https://tyajlotsxwocxxawcwta.supabase.co/storage/v1/object/public/experiments/${experimentId}/exports/package.zip`}
              style={{ background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.7)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 18px", fontSize:13, fontWeight:600, textDecoration:"none", display:"flex", alignItems:"center", gap:6 }}>
              ↓ Download
            </a>
          </div>
        </div>
      </div>

      {/* ═══ Tab Nav ════════════════════════════════════════════════════════ */}
      <div style={{ display:"flex", gap:4, padding:"16px 24px 0", borderBottom:"1px solid rgba(255,255,255,0.08)", overflowX:"auto" }}>
        {(["explorer","population","evolution","agents","colonies","telemetry"] as const).map(t => (
          <button key={t} className={`tab-btn${activeTab===t?" tab-active":""}`} onClick={() => setActiveTab(t)}>
            {t==="explorer"?"🎮 Replay":t==="population"?"📈 Population":t==="evolution"?"🧬 Evolution":t==="agents"?"👥 Agents":t==="colonies"?"🏛️ Colonies":"📊 Telemetry"}
          </button>
        ))}
      </div>

      {/* ═══ REPLAY TAB ═════════════════════════════════════════════════════ */}
      {activeTab === "explorer" && (
        <div className="exp-fade">
          <div style={{ display:"flex", gap:0, flexWrap:"wrap" }}>
            {/* ── Canvas ── */}
            <div style={{ flex:"1 1 420px", minWidth:0, padding:16, background:"#070b12", borderRight:"1px solid rgba(255,255,255,0.08)", display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ position:"relative", borderRadius:12, overflow:"hidden", background:"#0b1622", border:"1px solid rgba(255,255,255,0.1)", aspectRatio:"1" }}>
                <canvas ref={canvasRef} width={700} height={700} style={{ width:"100%", height:"100%", display:"block" }} />
                {/* Map legend */}
                <div style={{ position:"absolute", top:12, left:12, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 12px", fontSize:11 }}>
                  <div style={{ fontWeight:700, color:"rgba(255,255,255,0.5)", marginBottom:8, fontSize:10, textTransform:"uppercase", letterSpacing:"0.07em" }}>Legend</div>
                  {replay.colonies.map(c => (
                    <div key={c.id} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:c.color }} />
                      <span style={{ color:"rgba(255,255,255,0.7)" }}>{c.name}</span>
                    </div>
                  ))}
                </div>
                {/* Layer toggles */}
                <div style={{ position:"absolute", bottom:12, right:12, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"8px 10px" }}>
                  {Object.entries(mapLayers).map(([layer, on]) => (
                    <label key={layer} style={{ display:"flex", alignItems:"center", gap:6, fontSize:10, cursor:"pointer", marginBottom:4 }}>
                      <input type="checkbox" checked={on} onChange={e => setMapLayers(prev => ({...prev, [layer]:e.target.checked}))} style={{ width:11, height:11 }} />
                      <span style={{ color: on ? "#fff" : "rgba(255,255,255,0.3)", textTransform:"capitalize" }}>{layer}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:16 }}>
                {/* Stats bar */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:6, marginBottom:14 }}>
                  {[
                    { label:"Tick", val: currentTick.toLocaleString() },
                    { label:"Year", val: tickToYear(currentTick, maxTick) },
                    { label:"Alive", val: currentFrame?.alive ?? "—" },
                    { label:"Births", val: currentFrame?.births?.toLocaleString() ?? "—" },
                    { label:"Climate", val: currentFrame?.climate ?? "—" },
                  ].map(({label,val}) => (
                    <div key={label} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:8, padding:"8px 6px", textAlign:"center" }}>
                      <div style={{ color:"rgba(255,255,255,0.35)", fontSize:9, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</div>
                      <div style={{ color:"#fff", fontWeight:700, fontSize:13, marginTop:2 }}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* Scrubber with event markers */}
                <div style={{ position:"relative", marginBottom:10 }}>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:16, pointerEvents:"none", zIndex:2 }}>
                    {eventMarkers.map((ev, i) => {
                      const pct = ((ev.tick - minTick) / (maxTick - minTick)) * 100;
                      const sym = ev.type==="Extinction" ? "✕" : ev.type==="Milestone" ? "★" : "▲";
                      const col = ev.type==="Extinction" ? "#ef4444" : ev.type==="Milestone" ? "#f59e0b" : "#6366f1";
                      return (
                        <div key={i} className="ev-mark" style={{ position:"absolute", left:`${pct}%`, top:0, transform:"translateX(-50%)", pointerEvents:"auto", cursor:"pointer" }}
                          onClick={() => { const fi = timeline.findIndex(f => f.tick >= ev.tick); if (fi>=0) { setFrameIndex(fi); setIsPlaying(false); } }}>
                          <span style={{ color:col, fontSize:8, lineHeight:1 }}>{sym}</span>
                          <div className="ev-tip" style={{ display:"none", position:"absolute", bottom:18, left:"50%", transform:"translateX(-50%)", background:"#1e293b", border:"1px solid rgba(255,255,255,0.2)", borderRadius:8, padding:"8px 12px", fontSize:11, color:"#fff", whiteSpace:"nowrap", zIndex:30, boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
                            <div style={{ color:"rgba(255,255,255,0.5)", marginBottom:2, fontSize:10 }}>Year {ev.year} · Click to jump</div>
                            <div style={{ maxWidth:240, whiteSpace:"normal", lineHeight:1.4 }}>{ev.description}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:"rgba(255,255,255,0.3)", marginTop:18, marginBottom:4 }}>
                    {["Year 0","Year 80","Year 160","Year 240","Year 300"].map(y => <span key={y}>{y}</span>)}
                  </div>
                  <input type="range" min={0} max={timeline.length-1} value={frameIndex}
                    onChange={e => { setIsPlaying(false); setFrameIndex(+e.target.value); }}
                    style={{ width:"100%", height:6, borderRadius:3,
                      background:`linear-gradient(to right,#4f46e5 ${progressPct}%,#1e293b ${progressPct}%)` }} />
                </div>

                {/* Buttons + speed */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, flexWrap:"wrap" }}>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={() => { setFrameIndex(0); setIsPlaying(false); }} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", borderRadius:8, padding:"8px 12px", cursor:"pointer", fontSize:13 }}>⟵</button>
                    <button onClick={() => setIsPlaying(p => !p)} style={{ background: isPlaying ? "#4f46e5" : "rgba(255,255,255,0.1)", color:"#fff", border:"none", borderRadius:8, padding:"8px 20px", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow: isPlaying ? "0 0 20px rgba(79,70,229,0.4)":"none" }}>
                      {isPlaying ? "⏸ Pause" : "▶ Play"}
                    </button>
                    <button onClick={() => setFrameIndex(timeline.length-1)} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", borderRadius:8, padding:"8px 12px", cursor:"pointer", fontSize:13 }}>⟶</button>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                    <span style={{ color:"rgba(255,255,255,0.35)", fontSize:11 }}>Speed</span>
                    {SPEED_OPTIONS.map(s => (
                      <button key={s} className={`speed-btn${speed===s?" active":""}`} onClick={() => setSpeed(s)}>{s}x</button>
                    ))}
                  </div>
                </div>

                {currentFrame?.major_event && (
                  <div style={{ marginTop:10, padding:"8px 12px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:8, fontSize:11, color:"rgba(255,255,255,0.55)" }}>
                    <span style={{ color:"#818cf8", fontWeight:600, marginRight:6 }}>↳</span>
                    {currentFrame.major_event.slice(0, 140)}{currentFrame.major_event.length > 140 ? "…" : ""}
                  </div>
                )}
              </div>
            </div>

            {/* ── Live metrics sidebar ── */}
            <div style={{ width:260, padding:16, display:"flex", flexDirection:"column", gap:8, background:"#080c14", overflowY:"auto", maxHeight:680 }}>
              <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Live Metrics</div>
              {([
                { label:"Alive", val:currentFrame?.alive, color:"#10b981" },
                { label:"Total Dead", val:currentFrame?.deaths, color:"#ef4444" },
                { label:"Total Births", val:currentFrame?.births, color:"#6366f1" },
                { label:"Max Generation", val:replay.generation_number, color:"#f59e0b" },
                { label:"Mean Hunger", val: fmtNum(currentFrame?.mean_hunger)+"%", color:"#f97316" },
                { label:"Mean Thirst", val: fmtNum(currentFrame?.mean_thirst)+"%", color:"#38bdf8" },
                { label:"Shelter Use", val: fmtNum(currentFrame?.mean_shelter)+"%", color:"#a3e635" },
                { label:"Mood", val:currentFrame?.dominant_emotion||"—", color:"#e879f9" },
                { label:"Avg Trust", val: currentFrame?.avg_trust!=null ? fmtNum(currentFrame.avg_trust*100,0)+"%" : "—", color:"#34d399" },
              ] as Array<{ label:string; val:any; color:string }>).map(({ label, val, color }) => (
                <MetricCard key={label} label={label} value={val ?? "—"} color={color} />
              ))}

              <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.08em", marginTop:8 }}>Colonies</div>
              {replay.colonies.map(c => {
                const ei = Math.min(frameIndex, replay.epoch_stats.length-1);
                const alive = replay.epoch_stats[ei]?.per_colony_alive?.[c.id] ?? 0;
                const total = replay.agents.filter(a => a.colony_id === c.id).length;
                return (
                  <div key={c.id} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"10px 12px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ display:"flex", alignItems:"center", gap:6, fontWeight:600, fontSize:13 }}>
                        <span style={{ width:8, height:8, borderRadius:"50%", background:c.color, display:"inline-block" }} />
                        {c.name}
                      </span>
                      <span style={{ color:"rgba(255,255,255,0.4)", fontSize:11 }}>{alive}/{total}</span>
                    </div>
                    <div style={{ height:4, background:"rgba(255,255,255,0.08)", borderRadius:2, overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:2, background:c.color, width:`${total>0?(alive/total)*100:0}%`, transition:"width 0.4s" }} />
                    </div>
                  </div>
                );
              })}

              <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.08em", marginTop:8 }}>Follow Agent</div>
              <div style={{ display:"flex", gap:6 }}>
                <input value={followInput} onChange={e => setFollowInput(e.target.value)}
                  onKeyDown={e => { if (e.key==="Enter") { const a = replay.agents.find(ag => ag.id===+followInput); setFollowAgent(a||null); if(a) setSelectedAgent(a); }}}
                  placeholder="Agent #ID" type="number"
                  style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"8px 10px", fontSize:12, color:"#fff", outline:"none" }} />
                <button onClick={() => { setFollowAgent(null); setFollowInput(""); }}
                  style={{ padding:"8px 10px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:11 }}>✕</button>
              </div>
              {followAgent && (
                <div style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.25)", borderRadius:10, padding:"12px" }} className="exp-fade">
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:COLONY_COLORS[followAgent.colony_id] }} />
                    <span style={{ fontWeight:700, fontSize:13 }}>Agent #{followAgent.id}</span>
                    <span style={{ color:"rgba(255,255,255,0.4)", fontSize:11 }}>{COLONY_NAMES[followAgent.colony_id]}</span>
                  </div>
                  {[
                    ["Generation","Gen "+followAgent.generation],
                    ["Life Stage",followAgent.life_stage],
                    ["Cluster",followAgent.behavior_cluster],
                    ["Children",followAgent.children_ids?.length??0],
                    ["Years",followAgent.years_survived],
                    ["Death",followAgent.cause_of_death==="none"?"Survived ✓":followAgent.primary_cause],
                  ].map(([k,v]) => (
                    <div key={k as string} style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:3 }}>
                      <span style={{ color:"rgba(255,255,255,0.4)" }}>{k}</span>
                      <span style={{ color:"#fff", fontWeight:600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Synced mini-chart ── */}
          <div style={{ padding:"16px 24px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Population Timeline (synchronized to replay)</div>
            <ResponsiveContainer width="100%" height={110}>
              <LineChart data={timeline.slice(0, frameIndex+1).map(f => ({ year:tickToYear(f.tick,maxTick), alive:f.alive, births:f.births, deaths:f.deaths }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0e" />
                <XAxis dataKey="year" tick={{ fontSize:9, fill:"#ffffff40" }} />
                <YAxis tick={{ fontSize:9, fill:"#ffffff40" }} />
                <Tooltip contentStyle={TT_STYLE} />
                <Line type="monotone" dataKey="alive" stroke="#10b981" dot={false} strokeWidth={2} name="Alive" />
                <Line type="monotone" dataKey="births" stroke="#6366f1" dot={false} strokeWidth={1.5} strokeDasharray="4 2" name="Births" />
                <Line type="monotone" dataKey="deaths" stroke="#ef4444" dot={false} strokeWidth={1.5} strokeDasharray="4 2" name="Deaths" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ═══ POPULATION TAB ═════════════════════════════════════════════════ */}
      {activeTab === "population" && (
        <div className="exp-fade" style={{ padding:24, display:"flex", flexDirection:"column", gap:20 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(420px,1fr))", gap:20 }}>
            <div style={S.card}>
              <div style={S.sectionHeader}>Population Over Time</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={timeline.map(f => ({ year:tickToYear(f.tick,maxTick), alive:f.alive, births:f.births, deaths:f.deaths }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0f" />
                  <XAxis dataKey="year" tick={{ fontSize:10, fill:"#ffffff40" }} label={{ value:"Year", position:"insideBottom", fill:"#ffffff30", fontSize:9 }} />
                  <YAxis tick={{ fontSize:10, fill:"#ffffff40" }} />
                  <Tooltip contentStyle={TT_STYLE} />
                  <Legend wrapperStyle={{ fontSize:11 }} />
                  <ReferenceLine x={tickToYear(currentTick,maxTick)} stroke="#6366f1" strokeDasharray="4 2" label={{ value:"now", fill:"#818cf8", fontSize:9 }} />
                  <Line type="monotone" dataKey="alive" stroke="#10b981" dot={false} strokeWidth={2} name="Alive" />
                  <Line type="monotone" dataKey="births" stroke="#6366f1" dot={false} strokeWidth={1.5} name="Births" />
                  <Line type="monotone" dataKey="deaths" stroke="#ef4444" dot={false} strokeWidth={1.5} name="Deaths" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={S.card}>
              <div style={S.sectionHeader}>Birth & Death Rate per Epoch</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={epochData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0f" />
                  <XAxis dataKey="epoch" tick={{ fontSize:10, fill:"#ffffff40" }} />
                  <YAxis tick={{ fontSize:10, fill:"#ffffff40" }} />
                  <Tooltip contentStyle={TT_STYLE} />
                  <Legend wrapperStyle={{ fontSize:11 }} />
                  <Bar dataKey="births" fill="#6366f1" name="Births" radius={[3,3,0,0]} />
                  <Bar dataKey="deaths" fill="#ef4444" name="Deaths" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={S.card}>
              <div style={S.sectionHeader}>Cause of Death per Epoch</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={epochData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0f" />
                  <XAxis dataKey="epoch" tick={{ fontSize:10, fill:"#ffffff40" }} />
                  <YAxis tick={{ fontSize:10, fill:"#ffffff40" }} />
                  <Tooltip contentStyle={TT_STYLE} />
                  <Legend wrapperStyle={{ fontSize:11 }} />
                  <Bar dataKey="dehydration" stackId="a" fill="#38bdf8" name="Dehydration" />
                  <Bar dataKey="starvation" stackId="a" fill="#f97316" name="Starvation" />
                  <Bar dataKey="oldAge" stackId="a" fill="#a78bfa" name="Old Age" />
                  <Bar dataKey="exposure" stackId="a" fill="#94a3b8" name="Exposure" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={S.card}>
              <div style={S.sectionHeader}>Births by Generation</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={birthsByGen}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0f" />
                  <XAxis dataKey="gen" tick={{ fontSize:10, fill:"#ffffff40" }} />
                  <YAxis tick={{ fontSize:10, fill:"#ffffff40" }} />
                  <Tooltip contentStyle={TT_STYLE} />
                  <Bar dataKey="count" radius={[4,4,0,0]}>
                    {birthsByGen.map((_,i) => <Cell key={i} fill={`hsl(${250+i*20},70%,60%)`} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {replay.extinction_events.length > 0 && (
            <div style={S.card}>
              <div style={S.sectionHeader}>⚠️ Extinction Events</div>
              {replay.extinction_events.map((ee,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:14, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, padding:"12px 16px", marginBottom:8 }}>
                  <div style={{ color:"#ef4444", fontWeight:800, fontSize:20 }}>✕</div>
                  <div>
                    <div style={{ fontWeight:700, color:"#fff" }}>Colony {ee.colony_name} — Extinct</div>
                    <div style={{ color:"rgba(255,255,255,0.45)", fontSize:11 }}>Tick {ee.tick.toLocaleString()} · Year {tickToYear(ee.tick,maxTick)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ EVOLUTION TAB ══════════════════════════════════════════════════ */}
      {activeTab === "evolution" && (
        <div className="exp-fade" style={{ padding:24, display:"flex", flexDirection:"column", gap:20 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(420px,1fr))", gap:20 }}>
            <div style={S.card}>
              <div style={S.sectionHeader}>Genetic Diversity Over Time</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={replay.genetic_history.map(g => ({ year:tickToYear(g.tick,maxTick), diversity:g.diversity_score, within:g.within_colony_diversity, between:g.between_colony_diversity }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0f" />
                  <XAxis dataKey="year" tick={{ fontSize:10, fill:"#ffffff40" }} />
                  <YAxis domain={[0,1]} tick={{ fontSize:10, fill:"#ffffff40" }} />
                  <Tooltip contentStyle={TT_STYLE} />
                  <Legend wrapperStyle={{ fontSize:11 }} />
                  <Line type="monotone" dataKey="diversity" stroke="#8b5cf6" dot={{ r:3 }} strokeWidth={2} name="Overall" />
                  <Line type="monotone" dataKey="within" stroke="#10b981" dot={{ r:2 }} strokeWidth={1.5} name="Within Colony" />
                  <Line type="monotone" dataKey="between" stroke="#f59e0b" dot={{ r:2 }} strokeWidth={1.5} name="Between Colony" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={S.card}>
              <div style={S.sectionHeader}>Gene Expression Radar — Year {tickToYear(currentTick,maxTick)}</div>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={geneRadarData}>
                  <PolarGrid stroke="#ffffff15" />
                  <PolarAngleAxis dataKey="gene" tick={{ fontSize:9, fill:"#ffffff60" }} />
                  <PolarRadiusAxis domain={[0,100]} tick={false} />
                  <Radar name="Population Avg" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div style={S.card}>
              <div style={S.sectionHeader}>Physiological Health per Epoch</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={epochData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0f" />
                  <XAxis dataKey="epoch" tick={{ fontSize:10, fill:"#ffffff40" }} />
                  <YAxis domain={[0,100]} tick={{ fontSize:10, fill:"#ffffff40" }} />
                  <Tooltip contentStyle={TT_STYLE} />
                  <Legend wrapperStyle={{ fontSize:11 }} />
                  <Line type="monotone" dataKey="fat" stroke="#f59e0b" dot={false} strokeWidth={2} name="Fat Reserves" />
                  <Line type="monotone" dataKey="muscle" stroke="#10b981" dot={false} strokeWidth={2} name="Muscle Mass" />
                  <Line type="monotone" dataKey="injury" stroke="#ef4444" dot={false} strokeWidth={1.5} name="Injury" />
                  <Line type="monotone" dataKey="hunger" stroke="#f97316" dot={false} strokeWidth={1.5} strokeDasharray="4 2" name="Hunger" />
                  <Line type="monotone" dataKey="thirst" stroke="#38bdf8" dot={false} strokeWidth={1.5} strokeDasharray="4 2" name="Thirst" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={S.card}>
              <div style={S.sectionHeader}>Behavior Clusters (Metabolism vs Social Proximity)</div>
              <ResponsiveContainer width="100%" height={220}>
                <ScatterChart margin={{ top:10,right:20,bottom:20,left:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0f" />
                  <XAxis dataKey="x" type="number" domain={[0,1]} tick={{ fontSize:9, fill:"#ffffff40" }} name="Metabolism" />
                  <YAxis dataKey="y" type="number" domain={[0,1]} tick={{ fontSize:9, fill:"#ffffff40" }} name="Social" />
                  <Tooltip contentStyle={TT_STYLE} />
                  <Legend wrapperStyle={{ fontSize:11 }} />
                  {Object.keys(CLUSTER_COLORS).map(cluster => (
                    <Scatter key={cluster} name={cluster} data={scatterData.filter(d => d.cluster===cluster)} fill={CLUSTER_COLORS[cluster]} opacity={0.75} />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ═══ AGENTS TAB ═════════════════════════════════════════════════════ */}
      {activeTab === "agents" && (
        <div className="exp-fade" style={{ padding:24, display:"flex", gap:20, flexWrap:"wrap" }}>
          <div style={{ flex:"1 1 300px", minWidth:0 }}>
            <input value={agentSearch} onChange={e => setAgentSearch(e.target.value)} placeholder="Search by ID, colony, cluster…"
              style={{ width:"100%", marginBottom:14, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#fff", outline:"none", boxSizing:"border-box" }} />
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:8 }}>
              {filteredAgents.map(agent => {
                const alive = agent.cause_of_death==="none"||agent.cause_of_death==="None";
                return (
                  <button key={agent.id} className={`agent-chip${selectedAgent?.id===agent.id?" selected":""}`}
                    onClick={() => setSelectedAgent(agent)} style={{ opacity: alive ? 1 : 0.55 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:COLONY_COLORS[agent.colony_id] }} />
                      <span style={{ fontFamily:"monospace", fontSize:11, color:"rgba(255,255,255,0.7)" }}>#{agent.id}</span>
                    </div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{COLONY_NAMES[agent.colony_id]}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>Gen {agent.generation} · {agent.behavior_cluster}</div>
                    <div style={{ fontSize:10, fontWeight:700, marginTop:4, color: alive ? "#10b981" : "#ef4444" }}>{alive ? "Alive" : agent.primary_cause||"Dead"}</div>
                  </button>
                );
              })}
            </div>
            {!agentSearch && <div style={{ textAlign:"center", color:"rgba(255,255,255,0.25)", fontSize:11, marginTop:12 }}>Showing {Math.min(80,replay.agents.length)} of {replay.agents.length} agents. Search to filter.</div>}
          </div>
          {selectedAgent && (
            <div style={{ width:360, flexShrink:0 }} className="exp-fade">
              <div style={{ ...S.card, position:"sticky" as any, top:16 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, paddingBottom:14, borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:COLONY_COLORS[selectedAgent.colony_id] }} />
                      <span style={{ fontSize:18, fontWeight:800, color:"#fff" }}>Agent #{selectedAgent.id}</span>
                    </div>
                    <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12, marginTop:2 }}>{COLONY_NAMES[selectedAgent.colony_id]} · {selectedAgent.life_stage} · {selectedAgent.behavior_cluster}</div>
                  </div>
                  <button onClick={() => { setFollowAgent(selectedAgent); setFollowInput(String(selectedAgent.id)); setActiveTab("explorer"); }}
                    style={{ background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", color:"#a5b4fc", borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                    Follow →
                  </button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
                  {[
                    ["Generation","Gen "+selectedAgent.generation],
                    ["Years Lived",selectedAgent.years_survived],
                    ["Life Stage",selectedAgent.life_stage],
                    ["Cluster",selectedAgent.behavior_cluster],
                    ["Children",selectedAgent.children_ids?.length??0],
                    ["Parents",selectedAgent.parent_ids?.length??0],
                    ["Shelter Lv","Level "+selectedAgent.shelter_level],
                    ["Cause","dead"===selectedAgent.cause_of_death?"?":selectedAgent.cause_of_death==="none"?"Survived ✓":selectedAgent.primary_cause||selectedAgent.cause_of_death],
                  ].map(([k,v]) => (
                    <div key={k as string} style={{ background:"rgba(255,255,255,0.04)", borderRadius:8, padding:"8px 10px" }}>
                      <div style={{ color:"rgba(255,255,255,0.35)", fontSize:9, textTransform:"uppercase" }}>{k}</div>
                      <div style={{ color:"#fff", fontWeight:600, fontSize:12, marginTop:2 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>Emotional State</div>
                  {["contentment","hunger_tension","thirst_tension","exhaustion_tension","fear"].map(k => {
                    const v = (selectedAgent.drives?.[k] as number) ?? 0;
                    return (
                      <div key={k} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                        <div style={{ width:70, color:"rgba(255,255,255,0.4)", fontSize:10, textTransform:"capitalize", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{k.replace("_"," ")}</div>
                        <div style={{ flex:1, height:4, background:"rgba(255,255,255,0.08)", borderRadius:2, overflow:"hidden" }}>
                          <div style={{ height:"100%", borderRadius:2, background:k==="contentment"?"#10b981":"#ef4444", width:`${v*100}%` }} />
                        </div>
                        <div style={{ width:32, textAlign:"right", fontFamily:"monospace", fontSize:10, color:"rgba(255,255,255,0.6)" }}>{(v*100).toFixed(0)}%</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Genome</div>
                  <ResponsiveContainer width="100%" height={170}>
                    <RadarChart data={(replay.gene_names||[]).map((name,i) => ({ gene:GENE_SHORT["g_"+name]||name.slice(0,6), value:Math.round((selectedAgent.genome?.[i]||0)*100) }))}>
                      <PolarGrid stroke="#ffffff15" />
                      <PolarAngleAxis dataKey="gene" tick={{ fontSize:8, fill:"#ffffff55" }} />
                      <PolarRadiusAxis domain={[0,100]} tick={false} />
                      <Radar dataKey="value" stroke={COLONY_COLORS[selectedAgent.colony_id]} fill={COLONY_COLORS[selectedAgent.colony_id]} fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                {(selectedAgent.parent_ids?.length>0||selectedAgent.children_ids?.length>0)&&(
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Lineage</div>
                    {selectedAgent.parent_ids?.length>0&&(
                      <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", marginBottom:4 }}>
                        Parents:{" "}
                        {selectedAgent.parent_ids.map(id => (
                          <button key={id} onClick={() => setSelectedAgent(replay.agents.find(a=>a.id===id)||null)}
                            style={{ color:"#818cf8", background:"none", border:"none", cursor:"pointer", fontSize:12, marginRight:4 }}>#{id}</button>
                        ))}
                      </div>
                    )}
                    {selectedAgent.children_ids?.length>0&&(
                      <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>
                        Children ({selectedAgent.children_ids.length}):{" "}
                        {selectedAgent.children_ids.slice(0,8).map(id => (
                          <button key={id} onClick={() => setSelectedAgent(replay.agents.find(a=>a.id===id)||null)}
                            style={{ color:"#34d399", background:"none", border:"none", cursor:"pointer", fontSize:12, marginRight:4 }}>#{id}</button>
                        ))}
                        {selectedAgent.children_ids.length>8&&<span style={{ color:"rgba(255,255,255,0.3)" }}>+{selectedAgent.children_ids.length-8} more</span>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ COLONIES TAB ═══════════════════════════════════════════════════ */}
      {activeTab === "colonies" && (
        <div className="exp-fade" style={{ padding:24 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))", gap:20, marginBottom:20 }}>
            {replay.colonies.map(colony => {
              const members = replay.agents.filter(a => a.colony_id===colony.id);
              const alive = members.filter(a => a.cause_of_death==="none"||a.cause_of_death==="None");
              const avgGen = members.length ? (members.reduce((s,a)=>s+a.generation,0)/members.length).toFixed(1) : "—";
              const avgChildren = members.length ? (members.reduce((s,a)=>s+(a.children_ids?.length||0),0)/members.length).toFixed(1) : "—";
              const clusterDist = members.reduce<Record<string,number>>((acc,a) => { if(a.behavior_cluster) acc[a.behavior_cluster]=(acc[a.behavior_cluster]||0)+1; return acc; }, {});
              const dom = Object.entries(clusterDist).sort((a,b)=>b[1]-a[1])[0]?.[0]||"—";
              return (
                <div key={colony.id} style={S.card}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14, paddingBottom:14, borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ width:14, height:14, borderRadius:"50%", background:colony.color }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:800, color:"#fff", fontSize:16 }}>Colony {colony.name}</div>
                      <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11 }}>Founders: {colony.founder_ids?.map(id=>"#"+id).join(", ")}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:26, fontWeight:800, color:colony.color }}>{alive.length}</div>
                      <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11 }}>alive / {members.length}</div>
                    </div>
                  </div>
                  <div style={{ height:6, background:"rgba(255,255,255,0.08)", borderRadius:3, overflow:"hidden", marginBottom:14 }}>
                    <div style={{ height:"100%", background:colony.color, width:`${members.length>0?(alive.length/members.length)*100:0}%`, borderRadius:3, transition:"width 0.4s" }} />
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
                    {[
                      ["Avg Generation",avgGen],
                      ["Avg Children",avgChildren],
                      ["Dominant Cluster",dom],
                      ["Total Dead",members.length-alive.length],
                      ["Stored Food",(colony.stored_food/1000).toFixed(1)+"k"],
                      ["Stored Water",(colony.stored_water/1000000).toFixed(1)+"M"],
                    ].map(([k,v]) => (
                      <div key={k as string} style={{ background:"rgba(255,255,255,0.04)", borderRadius:8, padding:"8px 10px" }}>
                        <div style={{ color:"rgba(255,255,255,0.35)", fontSize:9, textTransform:"uppercase" }}>{k}</div>
                        <div style={{ color:"#fff", fontWeight:700, fontSize:13, marginTop:2 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginBottom:6 }}>Members Over Epochs</div>
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={replay.epoch_stats.map(e => ({ e:`E${e.epoch}`, alive:e.per_colony_alive?.[colony.id]??0 }))}>
                      <Line type="monotone" dataKey="alive" stroke={colony.color} dot={false} strokeWidth={2} />
                      <XAxis dataKey="e" hide /><YAxis hide />
                      <Tooltip contentStyle={TT_STYLE} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
          <div style={S.card}>
            <div style={S.sectionHeader}>Colony Spawn Conditions</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:14 }}>
              {Object.entries(replay.spawn_conditions).map(([name,cond]) => {
                const col = replay.colonies.find(c=>c.name===name);
                return (
                  <div key={name} style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"14px 16px", borderLeft:`3px solid ${col?.color||"#fff"}` }}>
                    <div style={{ fontWeight:700, color:"#fff", marginBottom:8 }}>{name}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", lineHeight:1.8 }}>
                      <div>Biome: <strong style={{ color:"#fff" }}>{cond.biome}</strong></div>
                      <div>Coords: <strong style={{ color:"#fff", fontFamily:"monospace" }}>[{cond.coords.join(",")}]</strong></div>
                      {cond.temperature!=null&&<div>Temp: <strong style={{ color:"#fff" }}>{cond.temperature.toFixed(1)}°C</strong></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TELEMETRY TAB ══════════════════════════════════════════════════ */}
      {activeTab === "telemetry" && (
        <div className="exp-fade" style={{ padding:24 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14, marginBottom:24 }}>
            {[
              { icon:"🧬", label:"Reproduction Rate", val: replay.telemetry.repro_actual_opportunities > 0 ? ((replay.telemetry.repro_successes/replay.telemetry.repro_actual_opportunities)*100).toFixed(1)+"%" : "—", sub:`${replay.telemetry.repro_successes} successes`, color:"#10b981" },
              { icon:"💧", label:"Water Search Success", val: replay.telemetry.water_searches > 0 ? ((replay.telemetry.water_search_successes/replay.telemetry.water_searches)*100).toFixed(1)+"%" : "—", sub:`${replay.telemetry.water_searches?.toLocaleString()} searches`, color:"#38bdf8" },
              { icon:"📍", label:"Avg Water Distance", val: fmtNum(replay.telemetry.water_search_distance_avg)+" tiles", sub:"Mean search radius", color:"#6366f1" },
              { icon:"☠️", label:"Dehydration Deaths", val: replay.telemetry.dehydration_deaths, sub:"Agents lost to thirst", color:"#f97316" },
              { icon:"🐣", label:"Total Births", val: replay.total_births?.toLocaleString(), sub:`${replay.generation_number} generations`, color:"#8b5cf6" },
              { icon:"💀", label:"Total Deaths", val: replay.total_deaths?.toLocaleString(), sub:`Survival: ${((replay.agents.filter(a=>a.cause_of_death==="none"||a.cause_of_death==="None").length/replay.agents.length)*100).toFixed(1)}%`, color:"#ef4444" },
              { icon:"🔬", label:"Peak Generation", val:`Gen ${replay.generation_number}`, sub:"Max evolutionary depth", color:"#f59e0b" },
              { icon:"🧩", label:"Behavior Clusters", val: clusterData.length, sub:"Distinct archetypes", color:"#a78bfa" },
            ].map(({ icon, label, val, sub, color }) => (
              <div key={label} style={{ ...S.card, padding:"18px 16px" }}>
                <div style={{ fontSize:24, marginBottom:8 }}>{icon}</div>
                <div style={{ fontSize:22, fontWeight:800, color }}>{val}</div>
                <div style={{ fontWeight:700, color:"rgba(255,255,255,0.85)", fontSize:13, marginTop:4 }}>{label}</div>
                <div style={{ color:"rgba(255,255,255,0.35)", fontSize:11, marginTop:2 }}>{sub}</div>
              </div>
            ))}
          </div>
          <div style={S.card}>
            <div style={S.sectionHeader}>🔬 Scientific Hypotheses ({replay.telemetry.scientific_hypotheses?.length||0} generated by the simulation engine)</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, maxHeight:600, overflowY:"auto", paddingRight:4 }}>
              {(replay.telemetry.scientific_hypotheses||[]).map(h => (
                <div key={h.id} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, overflow:"hidden" }}>
                  <button onClick={() => setExpandedHyp(expandedHyp===h.id ? null : h.id)}
                    style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"14px 16px", background:"none", border:"none", color:"#fff", cursor:"pointer", textAlign:"left" }}>
                    <span style={{ flexShrink:0, fontSize:11, padding:"2px 8px", borderRadius:9999, border:"1px solid", fontWeight:700,
                      background:h.confidence>0.8?"rgba(16,185,129,0.12)":"rgba(245,158,11,0.12)",
                      borderColor:h.confidence>0.8?"rgba(16,185,129,0.35)":"rgba(245,158,11,0.35)",
                      color:h.confidence>0.8?"#10b981":"#f59e0b" }}>
                      {(h.confidence*100).toFixed(0)}%
                    </span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:13, color:"#fff" }}>{h.title}</div>
                      <div style={{ color:"rgba(255,255,255,0.35)", fontSize:11, marginTop:2 }}>{h.category}</div>
                    </div>
                    <div style={{ color:"rgba(255,255,255,0.25)", fontSize:12 }}>{expandedHyp===h.id?"▲":"▼"}</div>
                  </button>
                  {expandedHyp===h.id&&(
                    <div style={{ padding:"0 16px 14px" }} className="exp-fade">
                      {h.evidence?.length>0&&(
                        <div style={{ marginBottom:10 }}>
                          <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", marginBottom:6 }}>Evidence</div>
                          {h.evidence.map((e,i) => <div key={i} style={{ fontSize:12, color:"rgba(255,255,255,0.65)", display:"flex", gap:6, marginBottom:4 }}><span style={{ color:"#10b981" }}>✓</span>{e}</div>)}
                        </div>
                      )}
                      {h.alternatives?.length>0&&(
                        <div>
                          <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", marginBottom:6 }}>Alternatives</div>
                          {h.alternatives.map((a,i) => <div key={i} style={{ fontSize:12, color:"rgba(255,255,255,0.5)", display:"flex", gap:6, marginBottom:4 }}><span style={{ color:"#f59e0b" }}>?</span>{a}</div>)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperimentExplorer;
