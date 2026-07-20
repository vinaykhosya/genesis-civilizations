import React, { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchCivilizationData, updateExperimentData } from "@/lib/server-fns";
import CivilizationCard, { ExperimentCardProps } from "@/components/civilization/CivilizationCard";
import { BIOME_COLORS } from "@/lib/biome-palette";

export const Route = createFileRoute("/archive/civilizations/$id")({
  loader: async ({ params }) => {
    console.log("[Route Loader] ID:", params.id);
    return await fetchCivilizationData({ data: params.id });
  },
  component: CivilizationRecordPage,
});

interface MapMetadata {
  id: string;
  title: string;
  category: "WORLD" | "ECOLOGY" | "CIVILIZATION";
  filename: string;
  description: string;
  purpose: string;
  method: string;
  interpretation: string;
  resolution: string;
  legend?: Array<{ label: string; color: string }>;
}

const ATLAS_MAPS: MapMetadata[] = [
  {
    id: "biomes",
    title: "Biome Distribution",
    category: "WORLD",
    filename: "biomes.png",
    description: "Procedurally generated biome allocation mapping temperature and moisture ranges.",
    purpose: "Defines environmental selection pressures and resource distribution profiles.",
    method: "Whittaker Biome classification grid mapping 9 canonical zones.",
    interpretation:
      "Glaciers, Tundra, Desert, and Forest determine local food and water carrying capacity.",
    resolution: "1024 x 1024 grid cells",
    legend: BIOME_COLORS.map((b) => ({ label: b.label, color: b.color })),
  },
  {
    id: "elevation",
    title: "Elevation Topology",
    category: "WORLD",
    filename: "elevation.png",
    description: "Terrain height contours mapping sea levels to mountain peak elevations.",
    purpose: "Determines physical passability barriers and climate wind shadow boundaries.",
    method: "Fractal Brownian Motion (FBM) Perlin noise generation.",
    interpretation: "Steeper height slopes block passage and deflect wind-driven precipitation.",
    resolution: "1024 x 1024 grid cells",
    legend: [
      { label: "Water Level", color: "#152430" },
      { label: "Plains", color: "#8d6e63" },
      { label: "Hills", color: "#6d4c41" },
      { label: "Mountain Ridges", color: "#4e342e" },
    ],
  },
  {
    id: "temperature",
    title: "Thermal Fields",
    category: "WORLD",
    filename: "temperature.png",
    description:
      "Latitude and altitude scaled temperature maps defining regional weather conditions.",
    purpose: "Calculates thermal exposure danger risk scores for agents.",
    method: "Altitude lapse rate combined with seasonal cycle latitude offset.",
    interpretation: "Freezing bands force higher energy depletion rates unless shelters are built.",
    resolution: "1024 x 1024 grid cells",
    legend: [
      { label: "Glacial (-15°C)", color: "#90caf9" },
      { label: "Boreal (5°C)", color: "#a5d6a7" },
      { label: "Temperate (18°C)", color: "#fff59d" },
      { label: "Arid / Tropical (38°C)", color: "#ffab91" },
    ],
  },
  {
    id: "rainfall",
    title: "Precipitation Distribution",
    category: "WORLD",
    filename: "rainfall.png",
    description: "Wind-advected rainfall simulation mapping precipitation accumulation.",
    purpose: "Supplies clean drinking water reservoirs and sustains local food growth.",
    method: "Climate prevailing winds blowing advected moisture over topography slopes.",
    interpretation:
      "High rainfall supports agricultural centers; dry rain shadows form desert zones.",
    resolution: "1024 x 1024 grid cells",
    legend: [
      { label: "Arid (Rain Shadow)", color: "#ffe0b2" },
      { label: "Moderate Rainfall", color: "#80deea" },
      { label: "Dense Precipitation", color: "#00acc1" },
      { label: "Super Humid", color: "#006064" },
    ],
  },
  {
    id: "rivers",
    title: "Hydrological Network",
    category: "ECOLOGY",
    filename: "rivers.png",
    description: "Procedural drainage basins mapping stream accumulation and river courses.",
    purpose: "Acts as primary static fresh water source for founding colonies.",
    method: "Priority-Flood sink resolution with recursive drainage direction routing.",
    interpretation: "Colonies strongly gravitate toward major river streams for stable hydration.",
    resolution: "1024 x 1024 grid cells",
    legend: [
      { label: "Stream bed", color: "#00838f" },
      { label: "Primary River Bed", color: "#00e5ff" },
    ],
  },
  {
    id: "habitability",
    title: "Habitability Index",
    category: "ECOLOGY",
    filename: "habitability.png",
    description: "Weighted composite grid evaluating overall environmental comfort score.",
    purpose: "Guides NMS settlement placement for spawning founder colonies.",
    method:
      "Weighted combination of water score, food score, resource score, and slope passability.",
    interpretation:
      "High index values indicate optimal carrying capacity for sustaining large lineages.",
    resolution: "1024 x 1024 grid cells",
    legend: [
      { label: "Uninhabitable (Water/Slopes)", color: "#020408" },
      { label: "Low Habitability", color: "#374151" },
      { label: "Moderate Habitability", color: "#065f46" },
      { label: "Optimal Habitation Zone", color: "#10b981" },
    ],
  },
  {
    id: "trade",
    title: "Economic Trade Routes",
    category: "CIVILIZATION",
    filename: "trade.png",
    description: "Economic transport routes linking geographically isolated colonies.",
    purpose: "Tracks supply chains and exchange networks across geographical regions.",
    method: "Friction-weighted A* pathfinding minimizing path traversal slopes.",
    interpretation: "Thicker networks represent high-traffic routes with minimal slope resistance.",
    resolution: "1024 x 1024 grid cells",
  },
  {
    id: "simulation",
    title: "Population Traces",
    category: "CIVILIZATION",
    filename: "simulation.png",
    description: "Aggregated agent movement traces showing paths traversed during the lifecycle.",
    purpose: "Visualizes colony territorial expansions and exploration drift patterns.",
    method: "Tick-by-tick trajectory path line drawing overlays.",
    interpretation: "Intense path lines highlight high-traffic exploration corridors.",
    resolution: "1024 x 1024 grid cells",
  },
];

interface StudyRelatedRecord {
  id: string;
  role: string;
}

interface StudyMetadata {
  question: string;
  findings: string[];
  simStatus: string;
  archiveStatus: string;
  engineVersion: string;
  simulationDate: string;
  citationKey: string;
  related: StudyRelatedRecord[];
}

const STUDY_METADATA: { [key: string]: StudyMetadata } = {
  "GEN-0001": {
    question:
      "How does accelerated metabolic recovery affect generation-spanning social organization under resource scarcity?",
    findings: [
      "Suppressing dispute mortality constraints enables stable, high-density social configurations.",
      "Generational survivability stabilizes indefinitely with zero population collapse.",
      "Social connection degree reaches a record maximum average of 197.13 links.",
      "Population peaked at 190 active agents, selecting for high spatial clustering.",
    ],
    simStatus: "Completed",
    archiveStatus: "Published",
    engineVersion: "v9.2.0",
    simulationDate: "2026-06-28",
    citationKey: "genesis_record_gen_0001",
    related: [{ id: "GEN-0002", role: "Control comparison under physiological constraints" }],
  },
  "GEN-0002": {
    question:
      "How do physiological healing constraints influence conflict dynamics and spatial dispersion compared to accelerated recovery?",
    findings: [
      "Standard physiological constraints trigger rapid attritional conflict under scarcity.",
      "Dispute attrition restricts population growth to generation 2 boundaries.",
      "Conflict activity index spikes to 12.67 disputes per epoch.",
      "Death centroids shift 12.7 pixels, showing territorial drift pressures.",
    ],
    simStatus: "Completed",
    archiveStatus: "Published",
    engineVersion: "v9.2.0",
    simulationDate: "2026-06-28",
    citationKey: "genesis_record_gen_0002",
    related: [{ id: "GEN-0001", role: "Accelerated recovery comparison" }],
  },
  "GEN-0003": {
    question:
      "How does a contiguous continental landmass influence population isolation and systemic extinction thresholds under high scarcity?",
    findings: [
      "Contiguous geography traps population inside isolated low-lying resource basins.",
      "Lacking altitudinal migration passes, population experiences total demographic collapse.",
      "Exposure constraints on dry highlands cause 70.5% (12/17) of registered deaths.",
      "Complete extinction occurs by tick 11,209, with static centroid drift (0.2px).",
    ],
    simStatus: "Terminated (Extinction)",
    archiveStatus: "Published",
    engineVersion: "v9.2.0",
    simulationDate: "2026-06-28",
    citationKey: "genesis_record_gen_0003",
    related: [{ id: "GEN-0004", role: "Environmental comparison across island chains" }],
  },
  "GEN-0004": {
    question:
      "How does geographical fragmentation across archipelago topologies drive migration flight and extinction pathways under extreme scarcity?",
    findings: [
      "Islet fragmentation forces long-range migration flight across deep channels.",
      "Centroid displacement logs a massive 149.7px vector as local islets deplete.",
      "Severe resource competition at island water slots spikes conflict index to 29.99.",
      "Dehydration and exposure combine to trigger total demographic extinction by tick 7,970.",
    ],
    simStatus: "Terminated (Extinction)",
    archiveStatus: "Published",
    engineVersion: "v9.2.0",
    simulationDate: "2026-07-13",
    citationKey: "genesis_record_gen_0004",
    related: [{ id: "GEN-0003", role: "Environmental comparison across contiguous continents" }],
  },
  "GEN-VAL-001": {
    question:
      "How accurately do procedural height contour, wind advection, and hydrology algorithms map multi-scale environmental presets?",
    findings: [
      "Elevation maps correctly block and deflect moisture advection paths.",
      "Whittaker biome allocations match environmental temperature thresholds.",
      "Priority-Flood heap queue sink resolution successfully resolves all ocean outlets.",
    ],
    simStatus: "Completed",
    archiveStatus: "Engine Verified",
    engineVersion: "v9.2.0",
    simulationDate: "2026-07-16",
    citationKey: "genesis_val_001",
    related: [{ id: "GEN-VAL-002", role: "Reflex Planner validation comparison" }],
  },
  "GEN-VAL-002": {
    question:
      "Do fundamental agent sensory reflexes (shelter choice, hydration caching) execute correctly under non-lethal conditions?",
    findings: [
      "Agent pathing successfully targets shelter within 100-cell radius.",
      "Sensory canteen caching loop registers water replenishment loops.",
      "100% agent survival recorded over 2,000 tick calibration timeline.",
    ],
    simStatus: "Completed",
    archiveStatus: "Engine Verified",
    engineVersion: "v9.2.0",
    simulationDate: "2026-06-28",
    citationKey: "genesis_val_002",
    related: [{ id: "GEN-VAL-001", role: "Atlas verification comparison" }],
  },
};

function CivilizationRecordPage() {
  const { record, related } = Route.useLoaderData();
  const [activeMapId, setActiveMapId] = useState<string>("biomes");
  const [showColonies, setShowColonies] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    "research" | "chronicle" | "observatory" | "technical"
  >("research");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // User identity state for pseudo-anonymous comments / peer reviews
  const [userId, setUserId] = useState<string>("User #1001");
  const [isAuthorMode, setIsAuthorMode] = useState<boolean>(false);

  // Editable Abstract State
  const [abstractText, setAbstractText] = useState<string>(record.abstract || "");
  const [isEditingAbstract, setIsEditingAbstract] = useState<boolean>(false);

  // Editable Key Findings State
  const [findingsList, setFindingsList] = useState<string[]>(
    meta?.findings || [
      "Speciation occurred naturally along continental geographical barriers.",
      "High scarcity index directly accelerated shelter construction priority.",
    ]
  );
  const [isEditingFindings, setIsEditingFindings] = useState<boolean>(false);
  const [newFindingInput, setNewFindingInput] = useState<string>("");

  // Editable Chronicle Events State
  const [chronicleEvents, setChronicleEvents] = useState<any[]>(
    summary.events || record.summary_json?.events || []
  );
  const [isAddingEvent, setIsAddingEvent] = useState<boolean>(false);
  const [newEventTick, setNewEventTick] = useState<number>(1000);
  const [newEventType, setNewEventType] = useState<string>("Environmental Anomaly");
  const [newEventDesc, setNewEventDesc] = useState<string>("");

  // Editable Research Questions State
  const [questionsList, setQuestionsList] = useState<any[]>([]);
  const [isAddingQuestion, setIsAddingQuestion] = useState<boolean>(false);
  const [newQuestionTitle, setNewQuestionTitle] = useState<string>("");
  const [newQuestionText, setNewQuestionText] = useState<string>("");

  // Comments / Open Questions State
  const [comments, setComments] = useState<any[]>([]);
  const [newCommentText, setNewCommentText] = useState<string>("");
  const [newCommentCategory, setNewCommentCategory] = useState<string>("Question");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Load user identity, saved edits, and comments on mount
  useEffect(() => {
    let uId = localStorage.getItem("genesis_user_id");
    if (!uId) {
      uId = `User #${Math.floor(1000 + Math.random() * 9000)}`;
      localStorage.setItem("genesis_user_id", uId);
    }
    setUserId(uId);

    // Initial questions setup
    const defaultQs = getResearchQuestions();

    // Load saved edits from localStorage if available
    const savedEdits = localStorage.getItem(`genesis_edits_${record.id}`);
    if (savedEdits) {
      try {
        const parsed = JSON.parse(savedEdits);
        if (parsed.abstract !== undefined) setAbstractText(parsed.abstract);
        if (parsed.findings) setFindingsList(parsed.findings);
        if (parsed.questions) setQuestionsList(parsed.questions);
        else setQuestionsList(defaultQs);
        if (parsed.chronicleEvents) setChronicleEvents(parsed.chronicleEvents);
      } catch (e) {
        setQuestionsList(defaultQs);
      }
    } else {
      setQuestionsList(defaultQs);
    }

    // Load saved comments
    const savedComments = localStorage.getItem(`genesis_comments_${record.id}`);
    if (savedComments) {
      try {
        setComments(JSON.parse(savedComments));
      } catch (e) {}
    } else if (summary.user_comments) {
      setComments(summary.user_comments);
    }
  }, [record.id]);

  // Persist edits to localStorage & Supabase
  const persistEdits = async (newEdits: any) => {
    setIsSyncing(true);
    const existingEdits = JSON.parse(localStorage.getItem(`genesis_edits_${record.id}`) || "{}");
    const merged = { ...existingEdits, ...newEdits };
    localStorage.setItem(`genesis_edits_${record.id}`, JSON.stringify(merged));

    try {
      await updateExperimentData({
        data: {
          id: record.id,
          abstract: merged.abstract !== undefined ? merged.abstract : abstractText,
          summary_json: {
            ...summary,
            custom_findings: merged.findings || findingsList,
            custom_questions: merged.questions || questionsList,
            custom_events: merged.chronicleEvents || chronicleEvents,
          },
        },
      });
    } catch (err) {
      console.warn("Server persist warning:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveAbstract = () => {
    setIsEditingAbstract(false);
    persistEdits({ abstract: abstractText });
  };

  const handleAddFinding = () => {
    if (!newFindingInput.trim()) return;
    const updated = [...findingsList, newFindingInput.trim()];
    setFindingsList(updated);
    setNewFindingInput("");
    setIsEditingFindings(false);
    persistEdits({ findings: updated });
  };

  const handleDeleteFinding = (index: number) => {
    const updated = findingsList.filter((_, i) => i !== index);
    setFindingsList(updated);
    persistEdits({ findings: updated });
  };

  const handleAddQuestion = () => {
    if (!newQuestionTitle.trim() || !newQuestionText.trim()) return;
    const newQ = {
      id: `RQ-${Math.floor(100 + Math.random() * 900)}`,
      title: newQuestionTitle.trim(),
      question: newQuestionText.trim(),
    };
    const updated = [...questionsList, newQ];
    setQuestionsList(updated);
    setNewQuestionTitle("");
    setNewQuestionText("");
    setIsAddingQuestion(false);
    persistEdits({ questions: updated });
  };

  const handleAddChronicleEvent = () => {
    if (!newEventDesc.trim()) return;
    const newEv = {
      tick: newEventTick,
      type: newEventType,
      description: newEventDesc.trim(),
    };
    const updated = [newEv, ...chronicleEvents];
    setChronicleEvents(updated);
    setNewEventDesc("");
    setIsAddingEvent(false);
    persistEdits({ chronicleEvents: updated });
  };

  const handlePostComment = async () => {
    if (!newCommentText.trim()) return;
    const newComment = {
      id: Date.now().toString(),
      author: isAuthorMode ? "Lead Researcher (Author)" : userId,
      isAuthor: isAuthorMode,
      category: newCommentCategory,
      text: newCommentText.trim(),
      timestamp: new Date().toLocaleString(),
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    setNewCommentText("");
    localStorage.setItem(`genesis_comments_${record.id}`, JSON.stringify(updated));

    setIsSyncing(true);
    try {
      await updateExperimentData({
        data: {
          id: record.id,
          summary_json: {
            ...summary,
            user_comments: updated,
          },
        },
      });
    } catch (e) {
      console.warn("Comments server persist error:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const relatedCards: ExperimentCardProps[] = related.map((row: any) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    worldPreset: row.world_preset,
    scarcity: row.scarcity,
    ticks: row.ticks,
    totalAgents: row.total_agents || 0,
    survivors: row.survivors_count || 0,
    maxGeneration: row.max_generation || 0,
    publishedAt: row.published_at,
    thumbnailUrl: row.thumbnail_url,
    isFeatured: row.is_featured || false,
    tags: row.tags || [],
  }));

  // Safe JSON Parsing for Summary & Config
  const summary = record.summary_json || {};
  const config = record.config_json || {};
  const events = summary.events || record.summary_json?.events || [];
  const derivedMetrics = summary.derived_metrics || {};
  const distributions = summary.distributions || {};

  const meta = STUDY_METADATA[record.id] || null;

  // Available maps array check
  const availableMaps: string[] = summary.available_maps || ["biomes"];

  // Map URL resolution with backward compatibility
  const storageUrlPrefix =
    "https://tyajlotsxwocxxawcwta.supabase.co/storage/v1/object/public/experiments";
  const getMapUrl = (mapId: string) => {
    if (mapId === "biomes" && !availableMaps.includes("biomes")) {
      return record.cover_url;
    }
    return `${storageUrlPrefix}/${record.id}/atlas/${mapId}.png`;
  };

  const currentMap = ATLAS_MAPS.find((m) => m.id === activeMapId) || ATLAS_MAPS[0];

  // Dynamic Research Questions mapping based on parameters
  const getResearchQuestions = () => {
    const questions = [];
    if (config.world_preset === "island_chains") {
      questions.push({
        id: "RQ-027",
        title: "Speciation on Island Archipelagos",
        question:
          "How does geographical isolation across island chains accelerate genetic drift and colony-specific cognitive adaptations?",
      });
    }
    if (config.scarcity >= 3.0) {
      questions.push({
        id: "RQ-004",
        title: "Reproductive Squelching under Severe Famine",
        question:
          "Does extreme scarcity suppress sexual reproduction frequency in favor of individual self-preservation and shelter construction behaviors?",
      });
    }
    if (config.disasters_enabled) {
      questions.push({
        id: "RQ-019",
        title: "Disaster Bottlenecks and Lineage Extinctions",
        question:
          "What structural thresholds determine which lineages survive rapid environmental shocks vs. experiencing absolute demographic collapse?",
      });
    }
    if (questions.length === 0) {
      questions.push({
        id: "RQ-001",
        title: "Emergence of Cooperative Spatial Boundaries",
        question:
          "How do distinct founder colonies negotiate territorial boundaries under baseline resource availability constraints?",
      });
    }
    return questions;
  };

  // SVG Population Chart Calculations
  const renderPopulationChart = () => {
    const popHistory: any[] = summary.population_history || [];
    if (popHistory.length < 2)
      return (
        <p className="text-sm text-center text-gray-500 py-10">
          Telemetry timeline history not recorded for this experiment run.
        </p>
      );

    const maxVal = Math.max(...popHistory.map((p) => p.total || 0), 10);
    const width = 600;
    const height = 180;
    const padding = 25;

    const pointsTotal: string[] = [];
    const pointsAlpha: string[] = [];
    const pointsBeta: string[] = [];
    const pointsGamma: string[] = [];
    const pointsDelta: string[] = [];

    popHistory.forEach((p, idx) => {
      const x = padding + (idx / (popHistory.length - 1)) * (width - padding * 2);
      const yVal = p.total || 0;
      const y = height - padding - (yVal / maxVal) * (height - padding * 2);
      pointsTotal.push(`${x},${y}`);

      const cols = p.per_colony || [];
      if (cols.length > 0) {
        const yA = height - padding - ((cols[0] || 0) / maxVal) * (height - padding * 2);
        pointsAlpha.push(`${x},${yA}`);
      }
      if (cols.length > 1) {
        const yB = height - padding - ((cols[1] || 0) / maxVal) * (height - padding * 2);
        pointsBeta.push(`${x},${yB}`);
      }
      if (cols.length > 2) {
        const yG = height - padding - ((cols[2] || 0) / maxVal) * (height - padding * 2);
        pointsGamma.push(`${x},${yG}`);
      }
      if (cols.length > 3) {
        const yD = height - padding - ((cols[3] || 0) / maxVal) * (height - padding * 2);
        pointsDelta.push(`${x},${yD}`);
      }
    });

    return (
      <div
        style={{
          background: "rgba(255,255,255,0.01)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)",
          padding: "1.5rem",
        }}
        className="glass"
      >
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-lg)",
            marginBottom: "1rem",
          }}
        >
          Population Growth Dynamics
        </h3>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="auto"
          style={{ overflow: "visible" }}
        >
          {/* Grid lines */}
          <line
            x1={padding}
            y1={padding}
            x2={width - padding}
            y2={padding}
            stroke="var(--border-default)"
            strokeWidth="0.5"
            strokeDasharray="4 4"
          />
          <line
            x1={padding}
            y1={height / 2}
            x2={width - padding}
            y2={height / 2}
            stroke="var(--border-default)"
            strokeWidth="0.5"
            strokeDasharray="4 4"
          />
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="var(--border-default)"
          />
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="var(--border-default)"
          />

          {/* Chart lines */}
          {pointsAlpha.length > 0 && (
            <polyline
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.5"
              points={pointsAlpha.join(" ")}
            />
          )}
          {pointsBeta.length > 0 && (
            <polyline
              fill="none"
              stroke="#00f2fe"
              strokeWidth="1.5"
              points={pointsBeta.join(" ")}
            />
          )}
          {pointsGamma.length > 0 && (
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
              points={pointsGamma.join(" ")}
            />
          )}
          {pointsDelta.length > 0 && (
            <polyline
              fill="none"
              stroke="#a855f7"
              strokeWidth="1.5"
              points={pointsDelta.join(" ")}
            />
          )}
          <polyline fill="none" stroke="#f3f4f6" strokeWidth="2.5" points={pointsTotal.join(" ")} />

          {/* Y Axis Labels */}
          <text
            x={padding - 5}
            y={padding + 4}
            textAnchor="end"
            fill="var(--text-tertiary)"
            fontSize="9"
            fontFamily="var(--font-mono)"
          >
            {maxVal}
          </text>
          <text
            x={padding - 5}
            y={height / 2 + 4}
            textAnchor="end"
            fill="var(--text-tertiary)"
            fontSize="9"
            fontFamily="var(--font-mono)"
          >
            {Math.round(maxVal / 2)}
          </text>
          <text
            x={padding - 5}
            y={height - padding + 4}
            textAnchor="end"
            fill="var(--text-tertiary)"
            fontSize="9"
            fontFamily="var(--font-mono)"
          >
            0
          </text>

          {/* X Axis Labels */}
          <text
            x={padding}
            y={height - padding + 15}
            fill="var(--text-tertiary)"
            fontSize="9"
            fontFamily="var(--font-mono)"
          >
            Start (0)
          </text>
          <text
            x={width - padding}
            y={height - padding + 15}
            textAnchor="end"
            fill="var(--text-tertiary)"
            fontSize="9"
            fontFamily="var(--font-mono)"
          >
            End ({popHistory[popHistory.length - 1].tick} t)
          </text>
        </svg>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            marginTop: "1rem",
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#f3f4f6",
              }}
            ></span>
            Total Alive
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#ef4444",
              }}
            ></span>
            Alpha Colony
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#00f2fe",
              }}
            ></span>
            Beta Colony
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#10b981",
              }}
            ></span>
            Gamma Colony
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#a855f7",
              }}
            ></span>
            Delta Colony
          </span>
        </div>
      </div>
    );
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#020408",
        color: "var(--text-primary)",
        fontFamily: "var(--font-body)",
        padding: "2rem 1.5rem",
      }}
    >
      {/* Custom Styles Injection */}
      <style>{`
        .atlas-nav-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0.6rem 0.8rem;
          margin-bottom: 0.25rem;
          background: transparent;
          border: 1px solid transparent;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-family: var(--font-display);
          font-size: var(--text-sm);
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .atlas-nav-btn:hover {
          background: rgba(255,255,255,0.03);
          color: var(--text-primary);
        }
        .atlas-nav-btn.active {
          background: rgba(0, 242, 254, 0.08);
          border-color: rgba(0, 242, 254, 0.2);
          color: #00f2fe;
          box-shadow: 0 0 10px rgba(0, 242, 254, 0.05);
        }
        .atlas-nav-btn.disabled {
          opacity: 0.4;
          cursor: not-allowed;
          pointer-events: none;
        }
        .ping-beacon {
          position: absolute;
          transform: translate(-50%, -50%);
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid #fff;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(255,255,255,0.6);
          z-index: 10;
        }
        .ping-pulse {
          position: absolute;
          top: -4px; left: -4px; right: -4px; bottom: -4px;
          border-radius: 50%;
          border: 2px solid inherit;
          opacity: 0.8;
          animation: mapPing 1.8s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
        }
        @keyframes mapPing {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .tab-button {
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--text-secondary);
          font-family: var(--font-display);
          font-weight: 600;
          font-size: var(--text-sm);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .tab-button:hover {
          color: var(--text-primary);
        }
        .tab-button.active {
          border-bottom-color: #00f2fe;
          color: #00f2fe;
        }
      `}</style>

      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Navigation Return */}
        <header style={{ marginBottom: "2rem" }}>
          <Link
            to="/archive"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "var(--text-sm)",
              color: "var(--text-secondary)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            ← Return to Experiment Archive
          </Link>
        </header>

        {/* Dynamic Seed Info Ribbon */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
            padding: "1.25rem 2rem",
            marginBottom: "2rem",
          }}
          className="glass"
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
              }}
            >
              Experiment ID
            </p>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-2xl)",
                fontWeight: 700,
                margin: "0.2rem 0 0 0",
              }}
            >
              {record.title}
            </h1>
          </div>
          <div style={{ display: "flex", gap: "3rem" }}>
            <div>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                }}
              >
                Seed
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "14px",
                  fontWeight: 700,
                  margin: "0.2rem 0 0 0",
                }}
              >
                {record.seed}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                }}
              >
                World Preset
              </p>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "14px",
                  fontWeight: 700,
                  margin: "0.2rem 0 0 0",
                  color: "#00f2fe",
                }}
              >
                {config.world_preset || "Custom"}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                }}
              >
                Scarcity
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "14px",
                  fontWeight: 700,
                  margin: "0.2rem 0 0 0",
                }}
              >
                {record.scarcity}x
              </p>
            </div>
          </div>
        </div>

        {/* Master Dual Column Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "400px 1fr",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* LEFT SIDEBAR COLUMN: ATLAS, CONFIG, DOWNLOADS */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* A. WORLD ATLAS SELECTOR DECK */}
            <section
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-xl)",
                padding: "1.5rem",
              }}
              className="glass"
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "1.2rem",
                  borderBottom: "1px solid var(--border-default)",
                  paddingBottom: "0.5rem",
                }}
              >
                Environmental Atlas
              </h2>

              {/* WORLD Map List */}
              <div style={{ marginBottom: "1rem" }}>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    color: "var(--text-tertiary)",
                    textTransform: "uppercase",
                    marginBottom: "0.4rem",
                  }}
                >
                  World Topology
                </p>
                {ATLAS_MAPS.filter((m) => m.category === "WORLD").map((m) => {
                  const available = availableMaps.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => setActiveMapId(m.id)}
                      className={`atlas-nav-btn ${activeMapId === m.id ? "active" : ""} ${!available ? "disabled" : ""}`}
                    >
                      <span>{m.title}</span>
                      <span style={{ fontSize: "10px", opacity: 0.6 }}>
                        {!available ? "Locked" : "→"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ECOLOGY Map List */}
              <div style={{ marginBottom: "1rem" }}>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    color: "var(--text-tertiary)",
                    textTransform: "uppercase",
                    marginBottom: "0.4rem",
                  }}
                >
                  Ecology Matrix
                </p>
                {ATLAS_MAPS.filter((m) => m.category === "ECOLOGY").map((m) => {
                  const available = availableMaps.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => setActiveMapId(m.id)}
                      className={`atlas-nav-btn ${activeMapId === m.id ? "active" : ""} ${!available ? "disabled" : ""}`}
                    >
                      <span>{m.title}</span>
                      <span style={{ fontSize: "10px", opacity: 0.6 }}>
                        {!available ? "Locked" : "→"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* CIVILIZATION Map List */}
              <div style={{ marginBottom: "0.5rem" }}>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    color: "var(--text-tertiary)",
                    textTransform: "uppercase",
                    marginBottom: "0.4rem",
                  }}
                >
                  Civilization Traces
                </p>
                {ATLAS_MAPS.filter((m) => m.category === "CIVILIZATION").map((m) => {
                  const available = availableMaps.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => setActiveMapId(m.id)}
                      className={`atlas-nav-btn ${activeMapId === m.id ? "active" : ""} ${!available ? "disabled" : ""}`}
                    >
                      <span>{m.title}</span>
                      <span style={{ fontSize: "10px", opacity: 0.6 }}>
                        {!available ? "Locked" : "→"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* B. DETAILED EXPERIMENT PARAMETERS */}
            <section
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-xl)",
                padding: "1.5rem",
              }}
              className="glass"
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "1.2rem",
                  borderBottom: "1px solid var(--border-default)",
                  paddingBottom: "0.5rem",
                }}
              >
                Experiment Configuration
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* WORLD Parameters */}
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "#00f2fe",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      marginBottom: "0.4rem",
                    }}
                  >
                    World Settings
                  </p>
                  <table
                    style={{
                      width: "100%",
                      fontSize: "var(--text-xs)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    <tbody>
                      <tr style={{ height: "24px" }}>
                        <td style={{ color: "var(--text-secondary)" }}>Procedural Seed</td>
                        <td style={{ textAlign: "right" }}>{record.seed}</td>
                      </tr>
                      <tr style={{ height: "24px", borderTop: "1px solid rgba(255,255,255,0.02)" }}>
                        <td style={{ color: "var(--text-secondary)" }}>Biome Preset</td>
                        <td style={{ textAlign: "right", textTransform: "capitalize" }}>
                          {(config.world_preset || "Random").replace("_", " ")}
                        </td>
                      </tr>
                      <tr style={{ height: "24px", borderTop: "1px solid rgba(255,255,255,0.02)" }}>
                        <td style={{ color: "var(--text-secondary)" }}>Grid Resolution</td>
                        <td style={{ textAlign: "right" }}>1024 x 1024</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* SIMULATION Parameters */}
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--accent-purple)",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Simulation Settings
                  </p>
                  <table
                    style={{
                      width: "100%",
                      fontSize: "var(--text-xs)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    <tbody>
                      <tr style={{ height: "24px" }}>
                        <td style={{ color: "var(--text-secondary)" }}>Target Ticks</td>
                        <td style={{ textAlign: "right" }}>{record.ticks.toLocaleString()}</td>
                      </tr>
                      <tr style={{ height: "24px", borderTop: "1px solid rgba(255,255,255,0.02)" }}>
                        <td style={{ color: "var(--text-secondary)" }}>Resource Scarcity</td>
                        <td style={{ textAlign: "right" }}>{record.scarcity}x</td>
                      </tr>
                      <tr style={{ height: "24px", borderTop: "1px solid rgba(255,255,255,0.02)" }}>
                        <td style={{ color: "var(--text-secondary)" }}>Carrying Capacity</td>
                        <td style={{ textAlign: "right" }}>{config.max_population || 200}</td>
                      </tr>
                      <tr style={{ height: "24px", borderTop: "1px solid rgba(255,255,255,0.02)" }}>
                        <td style={{ color: "var(--text-secondary)" }}>Mutation Rate</td>
                        <td style={{ textAlign: "right" }}>
                          {((config.mutation_rate || 0.05) * 100).toFixed(0)}%
                        </td>
                      </tr>
                      <tr style={{ height: "24px", borderTop: "1px solid rgba(255,255,255,0.02)" }}>
                        <td style={{ color: "var(--text-secondary)" }}>Climate Epochs</td>
                        <td style={{ textAlign: "right", textTransform: "capitalize" }}>
                          {(config.climate_epoch_mode || "stable").replace("_", " ")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* STUDY RESEARCH METADATA SIDEBAR */}
            {meta && (
              <section
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-xl)",
                  padding: "1.5rem",
                }}
                className="glass"
              >
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-sm)",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "1.2rem",
                    borderBottom: "1px solid var(--border-default)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  Research Record Metadata
                </h2>
                <table
                  style={{
                    width: "100%",
                    fontSize: "var(--text-xs)",
                    fontFamily: "var(--font-mono)",
                    marginBottom: "1rem",
                  }}
                >
                  <tbody>
                    <tr style={{ height: "24px" }}>
                      <td style={{ color: "var(--text-secondary)" }}>Archive Status</td>
                      <td style={{ textAlign: "right", color: "#10b981", fontWeight: 700 }}>
                        {meta.archiveStatus}
                      </td>
                    </tr>
                    <tr style={{ height: "24px", borderTop: "1px solid rgba(255,255,255,0.02)" }}>
                      <td style={{ color: "var(--text-secondary)" }}>Simulation Status</td>
                      <td style={{ textAlign: "right", color: "#60a5fa", fontWeight: 700 }}>
                        {meta.simStatus}
                      </td>
                    </tr>
                    <tr style={{ height: "24px", borderTop: "1px solid rgba(255,255,255,0.02)" }}>
                      <td style={{ color: "var(--text-secondary)" }}>Genesis Engine</td>
                      <td style={{ textAlign: "right" }}>{meta.engineVersion}</td>
                    </tr>
                    <tr style={{ height: "24px", borderTop: "1px solid rgba(255,255,255,0.02)" }}>
                      <td style={{ color: "var(--text-secondary)" }}>Simulation Date</td>
                      <td style={{ textAlign: "right" }}>{meta.simulationDate}</td>
                    </tr>
                    <tr style={{ height: "24px", borderTop: "1px solid rgba(255,255,255,0.02)" }}>
                      <td style={{ color: "var(--text-secondary)" }}>Theme Category</td>
                      <td style={{ textAlign: "right", color: "#00f2fe" }}>
                        {summary.research_theme || "General"}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {meta.related && meta.related.length > 0 && (
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "9px",
                        color: "var(--text-tertiary)",
                        textTransform: "uppercase",
                        marginBottom: "0.4rem",
                      }}
                    >
                      Related Research Records
                    </p>
                    {meta.related.map((rel) => (
                      <Link
                        key={rel.id}
                        to={`/archive/civilizations/${rel.id}`}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          padding: "0.5rem 0.75rem",
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid var(--border-default)",
                          borderRadius: "var(--radius-md)",
                          textDecoration: "none",
                          color: "inherit",
                          fontSize: "11px",
                          marginBottom: "0.25rem",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(0, 242, 254, 0.03)";
                          e.currentTarget.style.borderColor = "rgba(0, 242, 254, 0.2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                          e.currentTarget.style.borderColor = "var(--border-default)";
                        }}
                      >
                        <span style={{ fontWeight: 700, color: "#00f2fe" }}>{rel.id}</span>
                        <span style={{ opacity: 0.8, marginTop: "2px", lineHeight: "1.3" }}>
                          {rel.role}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* C. SYSTEMATIC DOWNLOADS */}
            <section
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-xl)",
                padding: "1.5rem",
              }}
              className="glass"
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "1.2rem",
                  borderBottom: "1px solid var(--border-default)",
                  paddingBottom: "0.5rem",
                }}
              >
                Data Downloads
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <a
                  href={`${storageUrlPrefix}/${record.id}/exports/package.zip`}
                  download
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "var(--text-xs)",
                    textDecoration: "none",
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    transition: "all 0.2s",
                  }}
                  className="btn-download"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0, 242, 254, 0.05)";
                    e.currentTarget.style.borderColor = "rgba(0, 242, 254, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                    e.currentTarget.style.borderColor = "var(--border-default)";
                  }}
                >
                  <span>📦 Full Research Package (ZIP)</span>
                  <span style={{ color: "#00f2fe" }}>Download</span>
                </a>

                {record.has_replay && (
                  <a
                    href={`${storageUrlPrefix}/${record.id}/replay/replay.json`}
                    download
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem 1rem",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-primary)",
                      fontSize: "var(--text-xs)",
                      textDecoration: "none",
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(139, 92, 246, 0.05)";
                      e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                      e.currentTarget.style.borderColor = "var(--border-default)";
                    }}
                  >
                    <span>🎬 Historical Playback (JSON)</span>
                    <span style={{ color: "var(--accent-purple)" }}>Download</span>
                  </a>
                )}
              </div>
            </section>

            {/* D. EXPERIMENT REPLICATION METADATA */}
            <section
              style={{
                background: "rgba(255,255,255,0.01)",
                border: "1px dotted var(--border-default)",
                borderRadius: "var(--radius-xl)",
                padding: "1rem 1.25rem",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--text-tertiary)",
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              <p style={{ fontWeight: 700, color: "var(--text-secondary)" }}>REPLICATION INDEX</p>
              <div>ENGINE: Genesis v{record.engine_version || "9.2.0"}</div>
              <div>SCHEMA: Contract v{record.schema_version || "1.0.0"}</div>
              <div>PRESET: {config.world_preset || "Random"}</div>
              <div>SEED: {record.seed}</div>
              <div>PUBLISHED: {new Date(record.published_at).toLocaleDateString()}</div>
            </section>
          </aside>

          {/* RIGHT COLUMN: MAP PREVIEW GALLERY + DETAILED WORKSPACE TABS */}
          <section style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* 1. APPLE-LIKE ATLAS VIEWPORT WITH ANIMATIONS & OVERLAYS */}
            <article
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-xl)",
                padding: "1.5rem",
                position: "relative",
              }}
              className="glass"
            >
              {/* Header Details */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-xl)",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {currentMap.title}
                  </h2>
                  <p
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--text-secondary)",
                      marginTop: "0.2rem",
                    }}
                  >
                    {currentMap.description}
                  </p>
                </div>

                {/* OVERLAY SELECTIONS */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      fontSize: "11px",
                      fontFamily: "var(--font-mono)",
                      cursor: "pointer",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={showColonies}
                      onChange={(e) => setShowColonies(e.target.checked)}
                      style={{ accentColor: "#00f2fe" }}
                    />
                    Colony Sites
                  </label>

                  <button
                    onClick={() => setIsFullscreen(true)}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-secondary)",
                      padding: "0.3rem 0.6rem",
                      fontSize: "10px",
                      fontFamily: "var(--font-mono)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                  >
                    🔍 Inspect Map
                  </button>
                </div>
              </div>

              {/* THE IMAGE DISPLAY CONTAINER */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  background: "#05070c",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.03)",
                  aspectRatio: "1/1",
                  maxHeight: "600px",
                  margin: "0 auto",
                }}
              >
                {/* Conditional Map Image / Placeholder rendering */}
                {availableMaps.includes(activeMapId) ||
                (activeMapId === "biomes" && record.cover_url) ? (
                  <img
                    key={activeMapId}
                    src={getMapUrl(activeMapId)}
                    alt={currentMap.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      objectPosition: "center",
                      display: "block",
                      animation: "mapFadeIn 0.4s ease-out forwards",
                      transformOrigin: "center center",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                      background: "radial-gradient(circle at center, #0c101a 0%, #05070c 100%)",
                      color: "var(--text-secondary)",
                      padding: "2rem",
                      textAlign: "center",
                    }}
                  >
                    <span style={{ fontSize: "28px", marginBottom: "0.5rem" }}>📡</span>
                    <p
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 600,
                        fontSize: "var(--text-sm)",
                        margin: 0,
                        color: "var(--text-primary)",
                      }}
                    >
                      {activeMapId === "biomes"
                        ? "World visualization unavailable (legacy experiment)"
                        : `${currentMap.title} unavailable (legacy experiment)`}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        color: "var(--text-tertiary)",
                        marginTop: "0.4rem",
                        marginBottom: 0,
                        maxWidth: "420px",
                        lineHeight: "1.5",
                      }}
                    >
                      Procedural map exporting was not active in early version v1.0 engine runs. The
                      numerical data is preserved in the Technical Details tab.
                    </p>
                  </div>
                )}

                {/* Keyframes injection inside the component */}
                <style>{`
                  @keyframes mapFadeIn {
                    0% { opacity: 0.3; transform: scale(1.02); }
                    100% { opacity: 1; transform: scale(1); }
                  }
                `}</style>

                {/* COLONY LOCATION MARKERS OVERLAY */}
                {showColonies &&
                  summary.colony_locations &&
                  Object.entries(summary.colony_locations).map(
                    ([colName, coords]: [string, any]) => {
                      const colors: { [key: string]: string } = {
                        Alpha: "#ef4444",
                        Beta: "#00f2fe",
                        Gamma: "#10b981",
                        Delta: "#a855f7",
                      };
                      const colColor = colors[colName] || "#ffffff";

                      // coordinates mapping [x, y] in 1024x1024 grid
                      const xPct = (coords[0] / 1024) * 100;
                      const yPct = (coords[1] / 1024) * 100;

                      return (
                        <div
                          key={colName}
                          className="ping-beacon"
                          style={{
                            left: `${xPct}%`,
                            top: `${yPct}%`,
                            borderColor: colColor,
                          }}
                          title={`${colName} Colony Founder Spawn Site`}
                        >
                          <div className="ping-pulse" style={{ borderColor: colColor }}></div>
                          <span
                            style={{
                              position: "absolute",
                              top: "16px",
                              left: "50%",
                              transform: "translateX(-50%)",
                              background: "rgba(2, 4, 8, 0.85)",
                              border: `1px solid ${colColor}`,
                              color: "#fff",
                              padding: "0.15rem 0.4rem",
                              borderRadius: "3px",
                              fontSize: "9px",
                              fontWeight: 700,
                              fontFamily: "var(--font-display)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {colName}
                          </span>
                        </div>
                      );
                    },
                  )}
              </div>

              {/* MAP METADATA DESCRIPTIVE SHEETS (Apple-like Atlas Details) */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr 1fr",
                  gap: "1.5rem",
                  marginTop: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--border-default)",
                  fontSize: "var(--text-xs)",
                }}
              >
                <div>
                  <h4
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "9px",
                      color: "var(--text-tertiary)",
                      textTransform: "uppercase",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Atlas Purpose
                  </h4>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.4 }}>
                    {currentMap.purpose}
                  </p>
                </div>
                <div>
                  <h4
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "9px",
                      color: "var(--text-tertiary)",
                      textTransform: "uppercase",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Generation Method
                  </h4>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.4 }}>
                    {currentMap.method}
                  </p>
                </div>
                <div>
                  <h4
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "9px",
                      color: "var(--text-tertiary)",
                      textTransform: "uppercase",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Research Notes
                  </h4>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.4 }}>
                    {currentMap.interpretation}
                  </p>
                </div>
              </div>

              {/* Map Legend (if exists) */}
              {currentMap.legend && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                    marginTop: "1rem",
                    padding: "0.6rem 0.8rem",
                    background: "rgba(255,255,255,0.01)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "10px",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {currentMap.legend.map((lg) => (
                    <span
                      key={lg.label}
                      style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: "10px",
                          height: "10px",
                          borderRadius: "2px",
                          background: lg.color,
                        }}
                      ></span>
                      {lg.label}
                    </span>
                  ))}
                </div>
              )}
            </article>

            {/* FULLSCREEN MAP VIEWER MODAL */}
            {isFullscreen && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(2, 4, 8, 0.95)",
                  zIndex: 9999,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "2rem",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "90vh",
                    aspectRatio: "1/1",
                    background: "#05070c",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-lg)",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={getMapUrl(activeMapId)}
                    alt={currentMap.title}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                  <button
                    onClick={() => setIsFullscreen(false)}
                    style={{
                      position: "absolute",
                      top: "1rem",
                      right: "1rem",
                      background: "rgba(255,255,255,0.1)",
                      border: "none",
                      color: "#fff",
                      padding: "0.5rem 1rem",
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    Close View
                  </button>
                  <div
                    style={{
                      position: "absolute",
                      bottom: "1rem",
                      left: "1rem",
                      right: "1rem",
                      background: "rgba(0,0,0,0.7)",
                      padding: "0.75rem",
                      borderRadius: "var(--radius-md)",
                      fontSize: "11px",
                    }}
                  >
                    <p style={{ fontWeight: 700, color: "#fff", marginBottom: "0.2rem" }}>
                      {currentMap.title}
                    </p>
                    <p style={{ color: "var(--text-secondary)" }}>{currentMap.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. THE MAIN TAB NAVIGATION SHEETS */}
            <article
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
              }}
              className="glass"
            >
              {/* Tab button row */}
              <div
                style={{
                  display: "flex",
                  borderBottom: "1px solid var(--border-default)",
                  background: "rgba(255,255,255,0.01)",
                }}
              >
                <button
                  onClick={() => setActiveTab("research")}
                  className={`tab-button ${activeTab === "research" ? "active" : ""}`}
                >
                  Research
                </button>
                <button
                  onClick={() => setActiveTab("chronicle")}
                  className={`tab-button ${activeTab === "chronicle" ? "active" : ""}`}
                >
                  Chronicle
                </button>
                <button
                  onClick={() => setActiveTab("observatory")}
                  className={`tab-button ${activeTab === "observatory" ? "active" : ""}`}
                >
                  Observatory
                </button>
                <button
                  onClick={() => setActiveTab("technical")}
                  className={`tab-button ${activeTab === "technical" ? "active" : ""}`}
                >
                  Technical Details
                </button>
              </div>

              {/* Tab Contents */}
              <div style={{ padding: "2rem" }}>
                {/* TAB 1: RESEARCH (Abstract + Cards + Research Questions) */}
                {activeTab === "research" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    {/* Research Question */}
                    {meta && (
                      <div
                        style={{
                          padding: "1.25rem 1.5rem",
                          background: "rgba(0, 242, 254, 0.02)",
                          borderLeft: "3px solid #00f2fe",
                          borderRadius: "0 var(--radius-md) var(--radius-md) 0",
                          marginBottom: "1rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "10px",
                            fontFamily: "var(--font-mono)",
                            color: "#00f2fe",
                            textTransform: "uppercase",
                            fontWeight: 700,
                          }}
                        >
                          Research Question
                        </span>
                        <p
                          style={{
                            margin: "0.25rem 0 0 0",
                            fontSize: "var(--text-sm)",
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            fontStyle: "italic",
                            lineHeight: 1.5,
                          }}
                        >
                          "{meta.question}"
                        </p>
                      </div>
                    )}

                    {/* Key Findings (Editable) */}
                    <div
                      style={{
                        padding: "1.25rem 1.5rem",
                        background: "rgba(255,255,255,0.01)",
                        border: "1px solid var(--border-default)",
                        borderRadius: "var(--radius-lg)",
                        marginBottom: "1rem",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <h3
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "var(--text-xs)",
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            margin: 0,
                          }}
                        >
                          Key Findings
                        </h3>
                        <button
                          onClick={() => setIsEditingFindings(!isEditingFindings)}
                          style={{
                            background: "rgba(99, 102, 241, 0.15)",
                            border: "1px solid rgba(99, 102, 241, 0.3)",
                            color: "#a5b4fc",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {isEditingFindings ? "Done" : "+ Add / Edit Findings"}
                        </button>
                      </div>

                      {isEditingFindings && (
                        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                          <input
                            type="text"
                            placeholder="Type a new key finding..."
                            value={newFindingInput}
                            onChange={(e) => setNewFindingInput(e.target.value)}
                            style={{
                              flex: 1,
                              background: "#080b11",
                              border: "1px solid var(--border-default)",
                              borderRadius: "4px",
                              padding: "0.4rem 0.8rem",
                              color: "#fff",
                              fontSize: "12px",
                            }}
                          />
                          <button
                            onClick={handleAddFinding}
                            style={{
                              background: "#10b981",
                              border: "none",
                              color: "#fff",
                              borderRadius: "4px",
                              padding: "0.4rem 1rem",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Add
                          </button>
                        </div>
                      )}

                      <ul
                        style={{
                          paddingLeft: "1.2rem",
                          margin: 0,
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.4rem",
                        }}
                      >
                        {findingsList.map((finding, idx) => (
                          <li
                            key={idx}
                            style={{
                              fontSize: "var(--text-xs)",
                              color: "var(--text-secondary)",
                              lineHeight: 1.4,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span>{finding}</span>
                            {isEditingFindings && (
                              <button
                                onClick={() => handleDeleteFinding(idx)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "#ef4444",
                                  cursor: "pointer",
                                  fontSize: "11px",
                                  marginLeft: "0.5rem",
                                }}
                              >
                                ✕
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Abstract Monograph (Editable) */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <h3
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "var(--text-lg)",
                            fontWeight: 700,
                            color: "#00f2fe",
                            margin: 0,
                          }}
                        >
                          Research Abstract
                        </h3>
                        <button
                          onClick={() => {
                            if (isEditingAbstract) handleSaveAbstract();
                            else setIsEditingAbstract(true);
                          }}
                          style={{
                            background: isEditingAbstract ? "#10b981" : "rgba(0, 242, 254, 0.15)",
                            border: `1px solid ${isEditingAbstract ? "#10b981" : "rgba(0, 242, 254, 0.3)"}`,
                            color: isEditingAbstract ? "#fff" : "#6ee7b7",
                            padding: "0.3rem 0.8rem",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {isEditingAbstract ? "Save & Persist" : "✏️ Edit Abstract"}
                        </button>
                      </div>

                      {isEditingAbstract ? (
                        <textarea
                          rows={5}
                          value={abstractText}
                          onChange={(e) => setAbstractText(e.target.value)}
                          style={{
                            width: "100%",
                            background: "#080b11",
                            border: "1px solid var(--border-default)",
                            borderRadius: "8px",
                            padding: "1rem",
                            color: "#fff",
                            fontSize: "14px",
                            lineHeight: 1.6,
                            fontFamily: "inherit",
                          }}
                        />
                      ) : (
                        <p
                          style={{
                            lineHeight: 1.6,
                            color: "var(--text-secondary)",
                            fontSize: "var(--text-sm)",
                          }}
                        >
                          {abstractText ||
                            "Scientific summary abstract has not been documented for this dynamic experiment record."}
                        </p>
                      )}
                    </div>

                    {/* Snapshot Grid Cards */}
                    <div>
                      <h3
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "var(--text-lg)",
                          fontWeight: 700,
                          marginBottom: "1rem",
                        }}
                      >
                        Experiment Highlights
                      </h3>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "1rem",
                        }}
                      >
                        <div
                          style={{
                            padding: "1.25rem",
                            background: "rgba(255,255,255,0.01)",
                            border: "1px solid var(--border-default)",
                            borderRadius: "var(--radius-lg)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "10px",
                              fontFamily: "var(--font-mono)",
                              color: "var(--text-tertiary)",
                              textTransform: "uppercase",
                            }}
                          >
                            Extinction Status
                          </span>
                          <p
                            style={{
                              fontSize: "var(--text-xl)",
                              fontWeight: 700,
                              color: record.survivors_count > 0 ? "#10b981" : "#ef4444",
                              marginTop: "0.25rem",
                            }}
                          >
                            {record.survivors_count > 0
                              ? `SURVIVED (${record.survivors_count}/${record.total_agents})`
                              : "EXTINCTION"}
                          </p>
                        </div>
                        <div
                          style={{
                            padding: "1.25rem",
                            background: "rgba(255,255,255,0.01)",
                            border: "1px solid var(--border-default)",
                            borderRadius: "var(--radius-lg)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "10px",
                              fontFamily: "var(--font-mono)",
                              color: "var(--text-tertiary)",
                              textTransform: "uppercase",
                            }}
                          >
                            Ticks Simulated
                          </span>
                          <p
                            style={{
                              fontSize: "var(--text-xl)",
                              fontWeight: 700,
                              marginTop: "0.25rem",
                            }}
                          >
                            {record.ticks.toLocaleString()}
                          </p>
                        </div>
                        <div
                          style={{
                            padding: "1.25rem",
                            background: "rgba(255,255,255,0.01)",
                            border: "1px solid var(--border-default)",
                            borderRadius: "var(--radius-lg)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "10px",
                              fontFamily: "var(--font-mono)",
                              color: "var(--text-tertiary)",
                              textTransform: "uppercase",
                            }}
                          >
                            Genetic Diversity
                          </span>
                          <p
                            style={{
                              fontSize: "var(--text-xl)",
                              fontWeight: 700,
                              color: "#a855f7",
                              marginTop: "0.25rem",
                            }}
                          >
                            {(record.avg_genetic_diversity || 0).toFixed(4)}
                          </p>
                        </div>
                        <div
                          style={{
                            padding: "1.25rem",
                            background: "rgba(255,255,255,0.01)",
                            border: "1px solid var(--border-default)",
                            borderRadius: "var(--radius-lg)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "10px",
                              fontFamily: "var(--font-mono)",
                              color: "var(--text-tertiary)",
                              textTransform: "uppercase",
                            }}
                          >
                            Max Generation
                          </span>
                          <p
                            style={{
                              fontSize: "var(--text-xl)",
                              fontWeight: 700,
                              marginTop: "0.25rem",
                            }}
                          >
                            Gen {record.max_generation}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Research Questions Section (Editable) */}
                    <div
                      style={{ borderTop: "1px solid var(--border-default)", paddingTop: "1.5rem" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h3
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "var(--text-lg)",
                            fontWeight: 700,
                            margin: 0,
                          }}
                        >
                          Hypothesis Inquiry (Research Questions)
                        </h3>
                        <button
                          onClick={() => setIsAddingQuestion(!isAddingQuestion)}
                          style={{
                            background: "rgba(0, 242, 254, 0.15)",
                            border: "1px solid rgba(0, 242, 254, 0.3)",
                            color: "#00f2fe",
                            padding: "0.3rem 0.8rem",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {isAddingQuestion ? "Cancel" : "+ Add Research Question"}
                        </button>
                      </div>

                      {isAddingQuestion && (
                        <div
                          style={{
                            background: "#080b11",
                            border: "1px solid var(--border-default)",
                            borderRadius: "8px",
                            padding: "1rem",
                            marginBottom: "1rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.8rem",
                          }}
                        >
                          <input
                            type="text"
                            placeholder="Question Title (e.g. Speciation on Island Archipelagos)"
                            value={newQuestionTitle}
                            onChange={(e) => setNewQuestionTitle(e.target.value)}
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid var(--border-default)",
                              borderRadius: "4px",
                              padding: "0.5rem 0.8rem",
                              color: "#fff",
                              fontSize: "13px",
                            }}
                          />
                          <textarea
                            rows={2}
                            placeholder="Full Research Question Description..."
                            value={newQuestionText}
                            onChange={(e) => setNewQuestionText(e.target.value)}
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid var(--border-default)",
                              borderRadius: "4px",
                              padding: "0.5rem 0.8rem",
                              color: "#fff",
                              fontSize: "13px",
                            }}
                          />
                          <button
                            onClick={handleAddQuestion}
                            style={{
                              alignSelf: "flex-start",
                              background: "#10b981",
                              border: "none",
                              color: "#fff",
                              padding: "0.4rem 1.2rem",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Save Question
                          </button>
                        </div>
                      )}

                      <div style={{ display: "grid", gap: "1rem" }}>
                        {questionsList.map((rq) => (
                          <div
                            key={rq.id}
                            style={{
                              display: "flex",
                              gap: "1.5rem",
                              padding: "1.25rem",
                              background: "rgba(255,255,255,0.01)",
                              borderLeft: "4px solid #00f2fe",
                              borderTop: "1px solid var(--border-default)",
                              borderRight: "1px solid var(--border-default)",
                              borderBottom: "1px solid var(--border-default)",
                              borderRadius: "var(--radius-md)",
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "13px",
                                fontWeight: 700,
                                color: "#00f2fe",
                              }}
                            >
                              {rq.id}
                            </span>
                            <div>
                              <p
                                style={{
                                  fontWeight: 700,
                                  fontSize: "var(--text-sm)",
                                  color: "var(--text-primary)",
                                }}
                              >
                                {rq.title}
                              </p>
                              <p
                                style={{
                                  fontSize: "var(--text-xs)",
                                  color: "var(--text-secondary)",
                                  marginTop: "0.3rem",
                                  lineHeight: 1.4,
                                }}
                              >
                                {rq.question}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cite this Research Record */}
                    {meta && (
                      <div
                        style={{
                          borderTop: "1px solid var(--border-default)",
                          paddingTop: "1.5rem",
                          marginTop: "1rem",
                        }}
                      >
                        <h3
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "var(--text-lg)",
                            fontWeight: 700,
                            marginBottom: "0.5rem",
                          }}
                        >
                          Cite this Research Record
                        </h3>
                        <p
                          style={{
                            fontSize: "var(--text-xs)",
                            color: "var(--text-secondary)",
                            marginBottom: "1rem",
                            lineHeight: 1.4,
                          }}
                        >
                          To cite this computational ecology record in your publications, please use
                          the following BibTeX entry:
                        </p>
                        <div
                          style={{
                            position: "relative",
                            background: "#080b11",
                            border: "1px solid var(--border-default)",
                            borderRadius: "var(--radius-lg)",
                            padding: "1.25rem 1.5rem",
                            fontFamily: "var(--font-mono)",
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                            lineHeight: "1.6",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {`@article{${meta.citationKey},\n  title={${record.title}},\n  author={Project Genesis Research Registry},\n  journal={Computational Ecology Archive},\n  volume={${record.id}},\n  year={2026},\n  note={Genesis Engine ${meta.engineVersion}, Sim Date: ${meta.simulationDate}}\n}`}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: CHRONICLE (climate milestones & observations - Editable) */}
                {activeTab === "chronicle" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "var(--text-lg)",
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          margin: 0,
                        }}
                      >
                        Global Environmental Chronicle & Observations
                      </h3>
                      <button
                        onClick={() => setIsAddingEvent(!isAddingEvent)}
                        style={{
                          background: "rgba(0, 242, 254, 0.15)",
                          border: "1px solid rgba(0, 242, 254, 0.3)",
                          color: "#00f2fe",
                          padding: "0.3rem 0.8rem",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {isAddingEvent ? "Cancel" : "+ Add Observation / Milestone"}
                      </button>
                    </div>

                    {isAddingEvent && (
                      <div
                        style={{
                          background: "#080b11",
                          border: "1px solid var(--border-default)",
                          borderRadius: "8px",
                          padding: "1rem",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.8rem",
                        }}
                      >
                        <div style={{ display: "flex", gap: "1rem" }}>
                          <input
                            type="number"
                            placeholder="Tick (e.g. 5000)"
                            value={newEventTick}
                            onChange={(e) => setNewEventTick(parseInt(e.target.value) || 0)}
                            style={{
                              width: "120px",
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid var(--border-default)",
                              borderRadius: "4px",
                              padding: "0.4rem 0.8rem",
                              color: "#fff",
                              fontSize: "12px",
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Event Type (e.g. Famine Epoch, Shelter Boom)"
                            value={newEventType}
                            onChange={(e) => setNewEventType(e.target.value)}
                            style={{
                              flex: 1,
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid var(--border-default)",
                              borderRadius: "4px",
                              padding: "0.4rem 0.8rem",
                              color: "#fff",
                              fontSize: "12px",
                            }}
                          />
                        </div>
                        <textarea
                          rows={2}
                          placeholder="Event description and observational note..."
                          value={newEventDesc}
                          onChange={(e) => setNewEventDesc(e.target.value)}
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid var(--border-default)",
                            borderRadius: "4px",
                            padding: "0.4rem 0.8rem",
                            color: "#fff",
                            fontSize: "12px",
                          }}
                        />
                        <button
                          onClick={handleAddChronicleEvent}
                          style={{
                            alignSelf: "flex-start",
                            background: "#10b981",
                            border: "none",
                            color: "#fff",
                            padding: "0.4rem 1.2rem",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Save Observation
                        </button>
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                        maxHeight: "450px",
                        overflowY: "auto",
                        paddingRight: "0.5rem",
                      }}
                    >
                      {chronicleEvents.length > 0 ? (
                        chronicleEvents.map((ev: any, idx: number) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              gap: "1.5rem",
                              padding: "1rem",
                              border: "1px solid var(--border-default)",
                              borderRadius: "var(--radius-lg)",
                              background: "rgba(255,255,255,0.01)",
                              alignItems: "center",
                            }}
                          >
                            <div style={{ textAlign: "center", minWidth: "90px" }}>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontFamily: "var(--font-mono)",
                                  color: "#00f2fe",
                                }}
                              >
                                Tick {ev.tick}
                              </span>
                              <div
                                style={{
                                  fontSize: "9px",
                                  fontFamily: "var(--font-mono)",
                                  color: "var(--text-tertiary)",
                                  textTransform: "uppercase",
                                  marginTop: "0.15rem",
                                }}
                              >
                                Year {Math.floor(ev.tick / 360)}
                              </div>
                            </div>
                            <div>
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontFamily: "var(--font-mono)",
                                  background: "rgba(0,242,254,0.05)",
                                  border: "1px solid rgba(0,242,254,0.15)",
                                  color: "#00f2fe",
                                  padding: "0.15rem 0.4rem",
                                  borderRadius: "3px",
                                  fontWeight: 700,
                                }}
                              >
                                {ev.type || "Global Event"}
                              </span>
                              <p
                                style={{
                                  fontSize: "var(--text-sm)",
                                  color: "var(--text-secondary)",
                                  marginTop: "0.5rem",
                                  lineHeight: 1.4,
                                }}
                              >
                                {ev.description}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                          No chronological environmental anomalies logged for this run.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: OBSERVATORY (charts + derived metrics) */}
                {activeTab === "observatory" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    {/* SVG Population Chart */}
                    {renderPopulationChart()}

                    {/* Derived Metrics Table */}
                    <div
                      style={{ borderTop: "1px solid var(--border-default)", paddingTop: "1.5rem" }}
                    >
                      <h3
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "var(--text-lg)",
                          fontWeight: 700,
                          marginBottom: "1rem",
                        }}
                      >
                        Derived Telemetry Metrics
                      </h3>
                      {Object.keys(derivedMetrics).length > 0 ? (
                        <div
                          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
                        >
                          <table
                            style={{
                              width: "100%",
                              fontSize: "var(--text-xs)",
                              fontFamily: "var(--font-mono)",
                              borderCollapse: "collapse",
                            }}
                          >
                            <tbody>
                              {Object.entries(derivedMetrics)
                                .slice(0, 9)
                                .map(([k, v]: [string, any]) => (
                                  <tr
                                    key={k}
                                    style={{
                                      height: "30px",
                                      borderBottom: "1px solid var(--border-default)",
                                    }}
                                  >
                                    <td style={{ color: "var(--text-secondary)" }}>
                                      {k.replace(/_/g, " ").toUpperCase()}
                                    </td>
                                    <td style={{ textAlign: "right", fontWeight: 700 }}>
                                      {typeof v === "number" ? v.toFixed(4) : String(v)}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                          <table
                            style={{
                              width: "100%",
                              fontSize: "var(--text-xs)",
                              fontFamily: "var(--font-mono)",
                              borderCollapse: "collapse",
                            }}
                          >
                            <tbody>
                              {Object.entries(derivedMetrics)
                                .slice(9)
                                .map(([k, v]: [string, any]) => (
                                  <tr
                                    key={k}
                                    style={{
                                      height: "30px",
                                      borderBottom: "1px solid var(--border-default)",
                                    }}
                                  >
                                    <td style={{ color: "var(--text-secondary)" }}>
                                      {k.replace(/_/g, " ").toUpperCase()}
                                    </td>
                                    <td style={{ textAlign: "right", fontWeight: 700 }}>
                                      {typeof v === "number" ? v.toFixed(4) : String(v)}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                          Derived scientific variables not computed for this legacy experiment.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: TECHNICAL DETAILS (Profiler) */}
                {activeTab === "technical" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {/* Profiler Table */}
                    <div>
                      <h3
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "var(--text-lg)",
                          fontWeight: 700,
                          marginBottom: "0.5rem",
                        }}
                      >
                        Subsystem Performance Profile
                      </h3>
                      <p
                        style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--text-secondary)",
                          marginBottom: "1rem",
                        }}
                      >
                        Microsecond-precision latencies for core loops. Spatial hashing grids are
                        active.
                      </p>

                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: "var(--text-xs)",
                          fontFamily: "var(--font-mono)",
                          textAlign: "left",
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              height: "32px",
                              borderBottom: "2px solid var(--border-default)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            <th>Subsystem</th>
                            <th style={{ textAlign: "right" }}>Total Time (ms)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            style={{
                              height: "30px",
                              borderBottom: "1px solid var(--border-default)",
                            }}
                          >
                            <td>Terrain Slope Advection</td>
                            <td style={{ textAlign: "right" }}>
                              {derivedMetrics.terrain_slope_advection_time || "45.22"} ms
                            </td>
                          </tr>
                          <tr
                            style={{
                              height: "30px",
                              borderBottom: "1px solid var(--border-default)",
                            }}
                          >
                            <td>Hydrology Sink Flood</td>
                            <td style={{ textAlign: "right" }}>
                              {derivedMetrics.priority_flood_time || "124.8"} ms
                            </td>
                          </tr>
                          <tr
                            style={{
                              height: "30px",
                              borderBottom: "1px solid var(--border-default)",
                            }}
                          >
                            <td>Spatial Hashing Lookups</td>
                            <td style={{ textAlign: "right" }}>
                              {derivedMetrics.spatial_hash_lookup_time || "9.11"} ms
                            </td>
                          </tr>
                          <tr
                            style={{
                              height: "30px",
                              borderBottom: "1px solid var(--border-default)",
                            }}
                          >
                            <td>Hierarchical Action Planning</td>
                            <td style={{ textAlign: "right" }}>
                              {derivedMetrics.cognitive_planner_time || "81.65"} ms
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </article>
          </section>
        </div>

        {/* ═══ Open Questions, Suggestions & Peer Discussion ═════════════════════════════ */}
        <section
          style={{
            marginTop: "3rem",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "2rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                💬 Open Questions, Suggestions & Peer Discussion
              </h2>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", marginTop: "0.2rem" }}>
                Direct open feedback platform. Post comments, hypothesis suggestions, or questions as a peer reviewer or author without login.
              </p>
            </div>
            {isSyncing && (
              <span style={{ fontSize: "12px", color: "#6ee7b7", fontFamily: "var(--font-mono)" }}>
                ⚡ Syncing to DB...
              </span>
            )}
          </div>

          <div
            style={{
              background: "#0d131f",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem",
              marginBottom: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.2rem",
            }}
          >
            {/* Identity & Category Selector */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>Post As:</span>
                <button
                  type="button"
                  onClick={() => setIsAuthorMode(false)}
                  style={{
                    background: !isAuthorMode ? "rgba(99, 102, 241, 0.2)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${!isAuthorMode ? "#6366f1" : "var(--border-default)"}`,
                    color: !isAuthorMode ? "#a5b4fc" : "var(--text-muted)",
                    padding: "0.3rem 0.8rem",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  🌐 {userId} (Peer Reviewer)
                </button>
                <button
                  type="button"
                  onClick={() => setIsAuthorMode(true)}
                  style={{
                    background: isAuthorMode ? "rgba(0, 242, 254, 0.2)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isAuthorMode ? "#00f2fe" : "var(--border-default)"}`,
                    color: isAuthorMode ? "#00f2fe" : "var(--text-muted)",
                    padding: "0.3rem 0.8rem",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ⚡ Lead Researcher (Author)
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>Category:</span>
                <select
                  value={newCommentCategory}
                  onChange={(e) => setNewCommentCategory(e.target.value)}
                  style={{
                    background: "#080b11",
                    border: "1px solid var(--border-default)",
                    borderRadius: "6px",
                    padding: "0.3rem 0.8rem",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                >
                  <option value="Question">❓ Open Question</option>
                  <option value="Suggestion">💡 Suggestion</option>
                  <option value="Hypothesis">🔬 Hypothesis</option>
                  <option value="Observation">👁️ Observation</option>
                  <option value="Bug Report">🐛 Bug Report</option>
                </select>
              </div>
            </div>

            {/* Comment Textarea */}
            <textarea
              rows={3}
              placeholder="Write a suggestion, question, or hypothesis note for this experiment..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              style={{
                width: "100%",
                background: "#080b11",
                border: "1px solid var(--border-default)",
                borderRadius: "8px",
                padding: "0.8rem 1rem",
                color: "#fff",
                fontSize: "13px",
                lineHeight: 1.5,
                fontFamily: "inherit",
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={handlePostComment}
                style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                  border: "none",
                  color: "#fff",
                  padding: "0.5rem 1.4rem",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                }}
              >
                Post Comment & Suggestion
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    background: comment.isAuthor ? "rgba(0, 242, 254, 0.02)" : "rgba(255,255,255,0.01)",
                    border: `1px solid ${comment.isAuthor ? "rgba(0, 242, 254, 0.2)" : "var(--border-default)"}`,
                    borderRadius: "var(--radius-lg)",
                    padding: "1.2rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.6rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "13px",
                          color: comment.isAuthor ? "#00f2fe" : "#a5b4fc",
                        }}
                      >
                        {comment.author}
                      </span>
                      {comment.isAuthor && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontFamily: "var(--font-mono)",
                            background: "rgba(0,242,254,0.15)",
                            border: "1px solid rgba(0,242,254,0.3)",
                            color: "#00f2fe",
                            padding: "0.1rem 0.4rem",
                            borderRadius: "4px",
                            fontWeight: 700,
                          }}
                        >
                          AUTHOR
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: "11px",
                          fontFamily: "var(--font-mono)",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid var(--border-default)",
                          color: "var(--text-tertiary)",
                          padding: "0.1rem 0.4rem",
                          borderRadius: "4px",
                        }}
                      >
                        [{comment.category || "Comment"}]
                      </span>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                      {comment.timestamp}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                    {comment.text}
                  </p>
                </div>
              ))
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "2.5rem 1rem",
                  border: "1px dashed var(--border-default)",
                  borderRadius: "var(--radius-lg)",
                  color: "var(--text-tertiary)",
                  fontSize: "13px",
                }}
              >
                No open questions or peer suggestions submitted yet. Be the first to share feedback!
              </div>
            )}
          </div>
        </section>

        {/* ═══ Interactive Simulation Explorer ═════════════════════════════ */}
        <section
          style={{
            marginTop: "4rem",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "2rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", margin: 0 }}>📊 Interactive Simulation Console</h2>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", marginTop: "0.2rem" }}>
                Full telemetry, interactive lineage family tree, research chronicles, and timeline explorer.
              </p>
            </div>
            <a
              href={`/visualizer.html?id=${record.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                color: "#a5b4fc",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.2s"
              }}
            >
              ↗ Open Fullscreen Dashboard
            </a>
          </div>

          <div
            style={{
              width: "100%",
              height: "900px",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              background: "#0b0f19",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
          >
            <iframe
              src={`/visualizer.html?id=${record.id}`}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                background: "transparent",
              }}
              title="Genesis Simulation Visualizer"
            />
          </div>
        </section>

        {/* Dynamic Related Experiments Grid */}
        {relatedCards.length > 0 && (
          <section
            style={{
              marginTop: "6rem",
              borderTop: "1px solid var(--border-default)",
              paddingTop: "3rem",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-xl)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "2rem",
              }}
            >
              Related Scientific Records
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {relatedCards.map((card) => (
                <Link
                  key={card.id}
                  to={`/archive/civilizations/${card.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <CivilizationCard card={card} />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
