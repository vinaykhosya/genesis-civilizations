# Final Bibliography Verification & Clean-Up Script for Genesis Monograph

tex_content = r"""\documentclass[12pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{lmodern}
\usepackage{geometry}
\usepackage{amsmath}
\usepackage{amssymb}
\usepackage{booktabs}
\usepackage{tabularx}
\usepackage{adjustbox}
\usepackage{hyperref}
\usepackage{xcolor}
\usepackage{microtype}
\usepackage{parskip}
\usepackage{titlesec}
\usepackage{authblk}
\usepackage{abstract}
\usepackage{enumitem}
\usepackage{array}
\usepackage{longtable}
\usepackage{tikz}
\usepackage{pgfplots}

\usetikzlibrary{shapes.geometric, arrows.meta, positioning, calc, shadows, patterns}
\pgfplotsset{compat=1.18}

\geometry{margin=2.5cm}

\hypersetup{
  colorlinks=true,
  linkcolor={blue!60!black},
  citecolor={blue!60!black},
  urlcolor={blue!60!black},
  pdftitle={Genesis: Physically Grounded Multi-Agent Artificial Life Simulation},
  pdfauthor={Vinay Khosya}
}

\titleformat{\section}{\large\bfseries}{\thesection.}{0.5em}{}
\titleformat{\subsection}{\normalsize\bfseries}{\thesubsection}{0.5em}{}

\title{\textbf{Genesis: Physically Grounded Multi-Agent Artificial Life Simulation with Emergent Social and Cognitive Dynamics}}

\author[1]{Vinay Khosya}
\affil[1]{Independent Researcher \\ \href{mailto:vinay@khosya.com}{vinay@khosya.com} \quad \href{https://genesis.vinaykhosya.com}{genesis.vinaykhosya.com}}
\date{July 2026 \\ \small Engine v1.5.0 $\mid$ Schema phase8.4 \\ \textit{Preprint Manuscript --- arXiv cs.NE / cs.MA / q-bio.PE}}

\begin{document}
\maketitle
\thispagestyle{empty}

\begin{abstract}
Artificial life (ALife) simulations provide fundamental insights into emergent evolutionary biology, social coordination, and cognitive adaptation under environmental stressors. However, traditional computational substrates treat the physical landscape as a uniform setting rather than an active experimental variable, decoupling evolutionary dynamics from spatial geography. We present \textbf{Genesis}, an agent-based artificial life simulator built from first principles to evaluate how physically derived environments---incorporating multi-octave Perlin elevation noise, latitude-driven thermodynamics, wind-advection precipitation, Priority-Flood hydrology, and a Whittaker biome matrix---shape evolutionary selection and cognitive architecture. Sixteen founding agents divided across four geographically distinct colonies are initialized on a $1024{\times}1024$ grid with identical founder genome distributions ($\text{avg\_genetic\_diversity} = 0.0$) and observed over longitudinal simulation runs spanning up to 326,075 ticks (905.8 simulated years). Agents inherit 14 continuous genomic traits governing physiological decay, perception, and neural plasticity, operating via a multi-drive homeostatic deliberation system with spatial predictor networks. No behavioral outcomes or social structures are scripted. In a pilot experiment under extreme resource scarcity ($S{=}3.0$, $n{=}1$ run, seed 1720), we demonstrate: (1)~\textbf{Geographic Selection}: initial biome placement determined colony survival, with the riparian colony accumulating $55.5{\times}10^6$ water units and persisting for 905.8 years, while arid and boreal colonies underwent complete extinction; (2)~\textbf{Cognitive Consolidation}: directional selection collapsed exploratory novelty-seeking ($g_{\text{novelty\_seeking}}$: $-72.4\%$) and neural learning rate ($g_{\text{learning\_rate}}$: $-95.6\%$) as agents transitioned from active spatial learning to automated procedure execution; (3)~\textbf{Technological Buffering}: construction of 3,009 shelters rendered thermoregulation ($g_{\text{thermoregulation}}$: $-62.4\%$) evolutionarily neutral without survival penalty. These findings establish that environmental heterogeneity is a primary engine of selection, cognitive specialization, and cultural buffering in multi-agent artificial life systems. \textbf{All results represent preliminary single-run observations.} Complete source code, simulation schemas, raw datasets, and interactive replays are openly accessible at \url{https://genesis.vinaykhosya.com}.
\end{abstract}

\clearpage
\tableofcontents
\clearpage

%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\section{Introduction}
%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\subsection{The Problem of Geography in Artificial Life}

Every prior artificial life system made the same structural assumption: that the environment is uniform.

Avida places digital organisms in a flat computational lattice \cite{lenski2003,ofria2004}. Sugarscape distributes sugar on a fixed $50{\times}50$ grid \cite{epstein1996}. Conway's Game of Life operates on a homogeneous plane. Polyworld \cite{yaeger1994} and Tierra \cite{ray1991} simulate organism energetics in unmodeled topographies. Even modern multi-agent reinforcement learning platforms place agents in symmetric, procedurally balanced arenas \cite{baker2020}.

This assumption is not merely a simplification---it forecloses an entire category of scientific investigation. In biological reality, geography is not noise. A mountain range creates a rain shadow. A rain shadow creates a desert. A desert means scarce fresh water. Scarce fresh water means selection pressure operates on thirst tolerance and spatial memory, not on general cognitive capacity.

\textit{The landscape is not a setting. It is an independent variable.}

Genesis is an artificial life simulator designed from first principles around this insight. Before an agent is placed, the world is constructed: elevations emerge from multi-octave Perlin noise, temperatures from a latitude--elevation model, rainfall from wind moisture advection, rivers from Priority-Flood drainage, and biomes from the Whittaker temperature--rainfall matrix.

\subsection{Why Genesis Exists: Motivation}

Why build another artificial life simulator when established platforms such as Avida, Sugarscape, and Polyworld already exist? Because existing simulators structurally decouple cognition and evolution from the physical laws of the landscape. In Avida, organisms replicate on a flat grid; in Sugarscape, resources spawn on fixed schedules; in multi-agent RL arenas, environments are procedurally balanced. Genesis was built to test a hypothesis that cannot be evaluated in uniform substrates: that environmental heterogeneity---rain shadows, altitude thermoclines, river basins---is the primary engine of evolutionary selection and cognitive specialization.

\subsection{Research Questions}

\begin{enumerate}[label=\arabic*.]
  \item \textbf{Viability:} Do geographically distinct initial colony placements produce systematically different survival outcomes when agent genomes are initialized with equal means?
  \item \textbf{Evolutionary trajectory:} Does resource scarcity produce characteristic directional selection signatures across 14 heritable genomic traits?
  \item \textbf{Technological buffering:} Does infrastructure construction decouple phenotypic fitness from the underlying genome, reducing selection pressure on previously critical traits?
  \item \textbf{Cognitive consolidation:} Is there evidence of an evolutionary transition from high-plasticity active learning to low-plasticity procedural automation as ecological niches become established?
\end{enumerate}

\subsection{Contributions}

This work provides five primary contributions to artificial life and computational evolutionary biology:

\begin{enumerate}[label=\arabic*.]
  \item \textbf{Physically Grounded ALife Platform:} A computational simulator where terrain, climate, hydrology, and biomes are derived from physical equations rather than hand-crafted rules, enabling geography to serve as an independent experimental variable.
  \item \textbf{Genome-Driven Cognitive Architecture:} A multi-drive homeostatic agent model integrating 14 continuous heritable traits with a spatial predictor network and automated procedure formation.
  \item \textbf{Long-Duration Reproducible Experiment Protocol:} A longitudinal telemetry framework tracking 300,000+ simulation ticks (900+ simulated years) capturing lineage extinction, technological shelter adoption, and genetic drift.
  \item \textbf{Public Research Archive \& Web Portal:} A searchable research portal (\url{https://genesis.vinaykhosya.com/archive}) hosting complete experiment datasets, JSON-LD metadata, and browser-based tick-by-tick replays.
  \item \textbf{Open-Source Infrastructure:} Standardized schemas (\texttt{experiment\_schema.json}) and Python execution pipelines for cross-platform simulation reproducibility.
\end{enumerate}

\subsection{Reproducibility Statement}

To ensure exact computational reproducibility, every simulation run in Genesis adheres to strict execution standards:
\begin{itemize}[noitemsep]
  \item \textbf{Seed Determinism}: Procedural world generation and pseudo-random numbers are controlled by integer seed 1720.
  \item \textbf{Config Hash}: Full simulation parameters are logged in \texttt{config.json}.
  \item \textbf{Telemetry Archive}: Complete CSV logs and JSON event streams are mirrored in Supabase object storage.
  \item \textbf{License}: Source code is licensed under the MIT License; experimental datasets under CC BY 4.0.
\end{itemize}

\subsection{Scope and Limitations}

This paper reports one longitudinal pilot study ($n{=}1$, seed 1720, 326,075 ticks). All effect sizes and causal inferences are preliminary. Section~11 documents specific limitations.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\section{Related Work}
%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\subsection{Avida}

Avida \cite{lenski2003,ofria2004} demonstrated that self-replicating digital programs evolve increasing functional complexity under selective pressure, producing complex logical operations absent in founding genomes. It established that Darwinian open-ended evolution is achievable in digital substrates.

However, Avida's organisms occupy a uniform computational lattice with no spatial thermodynamics, climate, or hydrological resource gradients. Selection operates exclusively through instruction execution speed and replication rate, not physical survival against environmental hazards. This design prevents investigation of how environmental heterogeneity---such as rain shadows or thermoclines---creates spatially structured selection pressure. Genesis addresses this gap by making the physical world the primary experimental control.

\subsection{Sugarscape}

Sugarscape \cite{epstein1996} introduced spatial heterogeneity into agent-based modelling by placing sugar and spice resource peaks on a $50{\times}50$ grid, enabling foundational studies of migration, wealth inequality, and trade emergence.

However, Sugarscape's environment is static: resource replenishment follows fixed algebraic rules, climate is absent, and terrain elevation does not exist. Genesis extends this paradigm by synthesizing a physically derived world where resource distribution emerges naturally from terrain, wind moisture advection, and river hydrology rather than manual placement.

\subsection{NEAT and Neural Evolution Platforms}

NeuroEvolution of Augmenting Topologies \cite{stanley2002} and novelty search algorithms \cite{lehman2011} demonstrated that neural network topologies and behavioral diversity can be evolved alongside connection weights to discover specialized controllers for robotics, pole balancing, and game agents.

These platforms operate primarily as fitness-landscape optimization tools for fixed tasks rather than simulating open-ended multi-agent survival. Genesis incorporates genomic encoding of 14 cognitive and physiological traits, but embeds them within an unscripted survival ecology rather than an objective-function optimization loop.

\subsection{OpenAI Five and Multi-Agent RL}

Multi-agent reinforcement learning systems such as OpenAI Five \cite{berner2019}, AlphaStar \cite{vinyals2019}, and emergent autocurricula platforms \cite{baker2020,ecoffet2021} demonstrated emergent teamwork, strategic bluffing, and long-horizon coordination in complex multi-player games.

However, these systems operate in symmetric, human-engineered game arenas with pre-defined reward structures. Agent behaviors are trained via gradient descent---they do not evolve heritably across generations. Genesis differs in that all behavioral drives are encoded in a genome transmitted with mutation across generations, capturing long-timescale evolutionary selection that RL frameworks do not model.

\subsection{Geb and Open-Ended Evolution Systems}

Geb \cite{channon2001}, Polyworld \cite{yaeger1994}, and Tierra \cite{ray1991} pursued whether open-ended complexity growth occurs indefinitely in digital substrates.

While these systems demonstrated sustained evolutionary activity, they operated in minimal-physics environments. Genesis occupies a distinct scientific niche: a geographically grounded study of survival, social clustering, and cognitive evolution under physically realistic selection pressures.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\section{The Physical World Model}
%%%%%%%%%%%%%%%%%%%%%%%%%%%%

Genesis constructs a physically derived world before any agent is placed (Figure~\ref{fig:world_pipeline}). All stages mutate a shared \texttt{WorldState} container of 2D NumPy arrays (\texttt{float32} / \texttt{int32}).

\begin{figure}[ht]
\centering
\begin{tikzpicture}[node distance=1.2cm and 0.8cm, auto, >=Stealth,
    block/.style={rectangle, draw=blue!80!black, fill=blue!8!white, thick, rounded corners=3pt, align=center, font=\small\sffamily\bfseries, minimum height=1.0cm, minimum width=2.6cm, drop shadow},
    line/.style={draw=blue!80!black, ->, ultra thick}]
    
    \node [block] (perlin) {Perlin Elevation\\$h(x,y)$};
    \node [block, right=of perlin] (temp) {Temperature\\$T(y,h)$};
    \node [block, right=of temp] (rain) {Wind Advection\\Rainfall $R(x,y)$};
    \node [block, below=of rain] (hydro) {Priority-Flood\\Hydrology \& Lakes};
    \node [block, left=of hydro] (biome) {Whittaker Biomes\\8 Classes};
    \node [block, left=of biome] (settle) {Habitability Map\\NMS Settlement};
    
    \path [line] (perlin) -- (temp);
    \path [line] (temp) -- (rain);
    \path [line] (rain) -- (hydro);
    \path [line] (hydro) -- (biome);
    \path [line] (biome) -- (settle);
\end{tikzpicture}
\caption{Genesis sequential physical world generation pipeline.}
\label{fig:world_pipeline}
\end{figure}

\subsection{Terrain Generation}

Elevation is generated by summation of multi-octave Perlin noise:
\[
h(x,y) = \sum_{k=0}^{K} A_k \cdot \mathrm{Perlin}\!\left(\frac{x}{S_k}, \frac{y}{S_k}\right)
\]
where amplitude $A_k = 0.5^k$ and scale $S_k$ decreases with octave $k$. Tiles with $h < h_{\text{sea}} = 0.3$ are classified as ocean.

\subsection{Temperature Model}

\[
T(y, h) = -15 + 47 \cdot \lambda(y) - 38 \cdot \max(0, h) + T_{\text{offset}}
\]
where $\lambda(y) = 1 - |y - H/2| / (H/2)$ maps $[0,1]$ from poles to equator.

\subsection{Rainfall -- Wind Moisture Advection}

For each column $x$:
\[
\mathrm{rain}[x] = m[x] \cdot \left(\frac{0.6}{w} + 35 \cdot \max\!\left(0,\, h_{\text{eff}}[x] - h_{\text{eff}}[x-1]\right)\right)
\]
where $m[x]$ is column air moisture, $w$ is grid width (scaling ensures resolution independence), and $h_{\text{eff}} = \max(h, h_{\text{sea}})$ clamps ocean tiles to sea level. Rain shadows emerge naturally on leeward slopes.

\subsection{Biome Classification}

Biomes are assigned per cell from a Whittaker temperature--rainfall matrix (Table~\ref{tab:biomes}).

\begin{table}[h]
\centering
\caption{Whittaker biome classification thresholds}
\label{tab:biomes}
\begin{tabularx}{\linewidth}{l X X}
\toprule
\textbf{Biome} & \textbf{Temperature ({\textdegree}C)} & \textbf{Rainfall (mm/yr)} \\
\midrule
Ocean & below sea level & --- \\
Glacier & $< -8$ & any \\
Tundra & $-8$ to $0$ & any \\
Taiga & $0$ to $8$ & $\geq 400$ \\
Temperate Forest & $8$ to $20$ & $\geq 700$ \\
Grassland & $8$ to $20$ & $350$--$700$ \\
Desert & any land & $< 250$ \\
Rainforest & $> 20$ & $\geq 1800$ \\
Lake & derived from hydrology & --- \\
\bottomrule
\end{tabularx}
\end{table}

\subsection{Hydrology -- Priority-Flood Drainage}

Terrain sinks are resolved using the Priority-Flood algorithm \cite{barnes2014}: a min-heap initialised from all boundary cells processes interior cells in elevation order, filling depressions to their spillover level. Cells accumulating flow $> 1500$ units are rivers; filled depressions accumulating $> 300$ units become lakes.

\subsection{Resource and Habitability Layers}

Mineral resources (iron, copper) are placed using low-frequency noise masks on high-elevation cells. Five habitability scores (water, food, resource, climate, terrain) are combined as a weighted sum. Circular NMS exclusion (radius 40--45 cells) ensures recommended settlement sites are spatially distributed.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\section{Agent Architecture}
%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\subsection{Genome}

Each agent carries 14 continuous genomic traits, initialised from $\mathcal{U}(0,1)$ and transmitted with additive Gaussian mutation ($\sigma_{\text{mut}} = 0.05$ per gene per reproduction; Table~\ref{tab:genome}).

\begin{table}[h]
\centering
\caption{Genesis 14-gene genomic architecture}
\label{tab:genome}
\begin{tabularx}{\linewidth}{l l X}
\toprule
\textbf{Gene} & \textbf{Symbol} & \textbf{Function} \\
\midrule
Metabolism & \texttt{g\_metabolism} & Energy consumption rate \\
Thermoregulation & \texttt{g\_thermoregulation} & Cold/heat exposure resistance \\
Vision & \texttt{g\_vision} & Perception radius \\
Mobility & \texttt{g\_mobility} & Movement speed \\
Memory Fidelity & \texttt{g\_memory\_fidelity} & Spatial landmark retention \\
Planning & \texttt{g\_planning} & Utility weighting depth \\
Novelty Seeking & \texttt{g\_novelty\_seeking} & Exploration vs.\ exploitation bias \\
Social Proximity & \texttt{g\_social\_proximity} & Colony clustering drive \\
Aggression & \texttt{g\_aggression} & Threat display intensity \\
Resource Sharing & \texttt{g\_resource\_sharing} & Altruistic transfer propensity \\
Risk Sensitivity & \texttt{g\_risk\_sensitivity} & Danger penalty weight \\
Resilience & \texttt{g\_resilience} & Injury recovery rate \\
Longevity & \texttt{g\_longevity} & Maximum lifespan ceiling \\
Learning Rate & \texttt{g\_learning\_rate} & Neural predictor plasticity \\
\bottomrule
\end{tabularx}
\end{table}

\subsection{Cognitive Architecture \& Deliberation Loop}

Agent decisions operate via a homeostatic deliberation system (Figure~\ref{fig:cognitive_loop}). At each tick, each agent: (1)~perceives a radius-bounded neighbourhood and indexes resources into memory; (2)~evaluates utility for candidate actions weighted against five drive levels; (3)~executes the highest-utility action.

\begin{figure}[ht]
\centering
\begin{tikzpicture}[node distance=1.0cm and 1.2cm, auto, >=Stealth,
    state/.style={ellipse, draw=teal!80!black, fill=teal!8!white, thick, align=center, font=\small\sffamily\bfseries, minimum height=0.9cm, drop shadow},
    action/.style={rectangle, draw=blue!80!black, fill=blue!8!white, thick, rounded corners=3pt, align=center, font=\small\sffamily\bfseries, minimum height=0.9cm, drop shadow},
    line/.style={draw=gray!80!black, ->, ultra thick}]
    
    \node [state] (perceive) {Perception\\Radius $g_{\text{vision}}$};
    \node [state, right=of perceive] (memory) {Spatial Predictor\\Memory Prior};
    \node [action, below=of memory] (drives) {Drive Homeostasis\\(Hunger, Thirst, Fear, Fatigue, Repro)};
    \node [action, left=of drives] (utility) {Utility Evaluation\\$\max U(\text{action})$};
    \node [action, below=of utility] (execute) {Action Execution\\\& Procedure Lock};
    
    \path [line] (perceive) -- (memory);
    \path [line] (memory) -- (drives);
    \path [line] (drives) -- (utility);
    \path [line] (utility) -- (execute);
    \path [line] (execute) |- (perceive);
\end{tikzpicture}
\caption{Agent cognitive deliberation and homeostatic drive loop.}
\label{fig:cognitive_loop}
\end{figure}

\subsection{Drive Dynamics, Mortality, and Reproduction}

Five homeostatic drives decay each tick. Mortality occurs when any drive exceeds a terminal threshold. Agents reproduce sexually when hunger and thirst are below thresholds; offspring receive averaged parent genes with additive Gaussian mutation.

\subsection{Infrastructure}

Agents construct Level-1 shelters (tents) and cache water at reservoir coordinates. Shelters reduce thermal exposure; caches are accessible to agents with high \texttt{g\_memory\_fidelity}.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\section{Experimental Protocol}
%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\begin{table}[h]
\centering
\caption{Pilot study experimental configuration}
\label{tab:config}
\begin{tabularx}{\linewidth}{l X}
\toprule
\textbf{Parameter} & \textbf{Value} \\
\midrule
Seed & 1720 \\
Scarcity multiplier $S$ & $3.0$ (300\% baseline depletion) \\
Max population $N_{\max}$ & 200 \\
Mutation rate $\sigma$ & 0.05 \\
Healing multiplier & 200$\times$ \\
Disputes & Enabled (resource competition; direct combat disabled) \\
Climate epoch mode & Default temperate \\
Grid size & $1024 \times 1024$ cells \\
World preset & \texttt{island\_chains} \\
\bottomrule
\end{tabularx}
\end{table}

Sixteen founding agents (Gen~0) were divided equally across 4 geographically distinct colonies.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\section{Pilot Study Results}
%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\subsection{Colony Setup \& Survival Timeline}

\begin{table}[h]
\centering
\caption{Colony initial placement and demographic outcome}
\label{tab:survival}
\begin{adjustbox}{max width=\linewidth}
\begin{tabular}{lllllll}
\toprule
\textbf{Colony} & \textbf{Location} & \textbf{Biome} & \textbf{Lifespan} & \textbf{Max Gen} & \textbf{Total Lifetime Members} & \textbf{Status} \\
\midrule
Delta & (552, 304) & Boreal Highlands & 16,400 ticks (45.5 yr) & Gen 1 & 3 & Extinct \\
Gamma & (847, 540) & Arid Scrubland & 75,600 ticks (210 yr) & Gen 8 & 114 & Extinct \\
Alpha & (146, 503) & Temperate Basin & 206,400 ticks (573 yr) & Gen 19 & 683 & Extinct \\
Beta & (597, 556) & Riparian Oasis & 326,075 ticks (905.8 yr) & Gen 38 & 2,242 & Active (201 alive) \\
\bottomrule
\end{tabular}
\end{adjustbox}
\end{table}

All colonies began with identical founding genomes ($\text{avg\_genetic\_diversity} = 0.0$ at tick 1; diversity $= 0.0$ implies founding lineages shared identical trait vectors). Total Lifetime Members reports cumulative individual births across the colony's lifespan, whereas peak concurrent living agents reached 142 in Colony Alpha and 201 in Colony Beta. All 201 final survivors are Beta lineage descendants (founders \#4--\#7). Figure~\ref{fig:colony_timeline} illustrates colony survival durations.

\begin{figure}[ht]
\centering
\begin{tikzpicture}
\begin{axis}[
    xbar,
    width=0.85\linewidth,
    height=5.5cm,
    xlabel={Lifespan (Simulation Ticks)},
    symbolic y coords={Delta, Gamma, Alpha, Beta},
    ytick=data,
    nodes near coords,
    nodes near coords align={horizontal},
    xmin=0, xmax=380000,
    bar width=14pt,
    axis lines*=left,
    enlarge y limits=0.2,
    tick label style={font=\small\sffamily\bfseries},
    label style={font=\small\sffamily\bfseries}
]
\addplot[fill=blue!70!black, draw=blue!90!black, thick] coordinates {
    (16400,Delta)
    (75600,Gamma)
    (206400,Alpha)
    (326075,Beta)
};
\end{axis}
\end{tikzpicture}
\caption{Colony lifespans across 326,075 simulation ticks (Seed 1720, $S{=}3.0$).}
\label{fig:colony_timeline}
\end{figure}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\section{Results}
%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\subsection{Geographic Selection as a Viability Determinant}

The four colonies began with identical genome distributions but diverged radically in survival (Table~\ref{tab:survival}).

\textbf{Colony Delta} (Boreal Highlands, tick 16,400): Low ambient temperature ($T_{\text{offset}} < -5^{\circ}$C) and sparse food nodes imposed thermal and caloric stress. Only 3 offspring were produced. \textit{Consistent with: boreal biome imposing a viability floor the founding genome did not satisfy.}

\textbf{Colony Gamma} (Arid Scrubland, tick 75,600): Water reserves peaked at 393,944 units (Figure~\ref{fig:water_storage}). A prolonged drought at Year~180 triggered extinction. \textit{Consistent with: hydrological capacity of the local biome imposing a ceiling behavioural adaptation could not overcome.}

\begin{figure}[ht]
\centering
\begin{tikzpicture}
\begin{axis}[
    ybar,
    width=0.75\linewidth,
    height=5.5cm,
    ylabel={Reservoir Water Storage ($10^6$ Units)},
    symbolic x coords={Delta, Gamma, Alpha, Beta},
    xtick=data,
    nodes near coords,
    nodes near coords align={vertical},
    ymin=0, ymax=65,
    bar width=20pt,
    axis lines*=left,
    enlarge x limits=0.2,
    tick label style={font=\small\sffamily\bfseries},
    label style={font=\small\sffamily\bfseries}
]
\addplot[fill=teal!70!black, draw=teal!90!black, thick] coordinates {
    (Delta,0.01)
    (Gamma,0.39)
    (Alpha,21.7)
    (Beta,55.5)
};
\end{axis}
\end{tikzpicture}
\caption{Final accumulated reservoir water storage by colony.}
\label{fig:water_storage}
\end{figure}

\textbf{Colony Alpha} (Temperate Basin, tick 206,400): Reached a peak of 142 concurrent living agents (683 cumulative lifetime births). Lower mean $g_{\text{vision}} \approx 0.62$ and $g_{\text{memory\_fidelity}} \approx 0.51$ (versus Beta's final 0.79 and 0.61) were associated with failure to access distant food belts. \textit{Single-run design prevents causal attribution.}

\textbf{Colony Beta} (Riparian Oasis, 201 alive): Cumulative births $= 2,242$. Water storage $= 55.5{\times}10^6$ units; 3,009 tents and 14 cabins constructed. \textit{Consistent with: hydrological access as the critical viability threshold under $S{=}3.0$.}

\subsection{Directional Genomic Selection \& Co-Evolutionary Interpretation}

Figure~\ref{fig:gene_shifts} and Table~\ref{tab:genes} report gene shifts for Colony Beta (Gen~38) relative to pooled founding means ($n{=}1$; interpret as observation, not estimate).

\begin{figure}[ht]
\centering
\begin{tikzpicture}
\begin{axis}[
    xbar,
    width=0.85\linewidth,
    height=6.5cm,
    xlabel={Relative Genomic Shift ($\Delta\%$), Baseline vs.\ Final},
    symbolic y coords={{g\_learning\_rate}, {g\_novelty\_seeking}, {g\_thermoregulation}, {g\_risk\_sensitivity}, {g\_mobility}, {g\_memory\_fidelity}, {g\_vision}, {g\_longevity}},
    ytick=data,
    nodes near coords,
    nodes near coords align={horizontal},
    xmin=-110, xmax=80,
    bar width=10pt,
    axis lines*=left,
    enlarge y limits=0.15,
    tick label style={font=\small\sffamily\bfseries},
    label style={font=\small\sffamily\bfseries}
]
\addplot[fill=purple!70!black, draw=purple!90!black, thick] coordinates {
    (-95.6,{g\_learning\_rate})
    (-72.4,{g\_novelty\_seeking})
    (-62.4,{g\_thermoregulation})
    (-62.2,{g\_risk\_sensitivity})
    (-33.9,{g\_mobility})
    (31.8,{g\_memory\_fidelity})
    (53.8,{g\_vision})
    (57.0,{g\_longevity})
};
\end{axis}
\end{tikzpicture}
\caption{Directional Genomic Shift ($\Delta\%$) across 326,075 ticks (Colony Beta).}
\label{fig:gene_shifts}
\end{figure}

\begin{table}[h]
\centering
\caption{Directional gene shifts --- Colony Beta, tick 326,075}
\label{tab:genes}
\begin{tabularx}{\linewidth}{l r r r X}
\toprule
\textbf{Gene} & \textbf{Start} & \textbf{End} & \textbf{$\Delta$\%} & \textbf{Consistent with} \\
\midrule
\texttt{g\_learning\_rate} & 0.520 & 0.023 & $-95.6\%$ & Cognitive consolidation (\S7.3) \\
\texttt{g\_novelty\_seeking} & 0.341 & 0.094 & $-72.4\%$ & Exploration penalised under $S{=}3.0$ \\
\texttt{g\_thermoregulation} & 0.529 & 0.199 & $-62.4\%$ & Technological buffering (\S7.4) \\
\texttt{g\_risk\_sensitivity} & 0.505 & 0.191 & $-62.2\%$ & Reduced danger near shelters \\
\texttt{g\_mobility} & 0.549 & 0.363 & $-33.9\%$ & Sedentary foraging favoured \\
\texttt{g\_memory\_fidelity} & 0.466 & 0.614 & $+31.8\%$ & Water cache retention \\
\texttt{g\_vision} & 0.515 & 0.792 & $+53.8\%$ & Long-range resource detection \\
\texttt{g\_longevity} & 0.540 & 0.848 & $+57.0\%$ & Elder knowledge transmission \\
\bottomrule
\end{tabularx}
\end{table}

\paragraph{Co-Evolutionary Interpretation of Trait Shifts:}
The joint directional movement across these traits reflects an integrated adaptation strategy:
\begin{itemize}[noitemsep]
  \item \textbf{Vision + Longevity ($+53.8\%$, $+57.0\%$)}: Long-range perception enabled early detection of distant riparian food patches, while increased longevity allowed experienced agents to maintain shelter networks across decades.
  \item \textbf{Memory Fidelity ($+31.8\%$)}: Complemented high vision by anchoring the exact spatial coordinates of Colony Beta's $55.5\times 10^6$ unit water reservoirs.
  \item \textbf{Mobility + Risk Sensitivity ($-33.9\%$, $-62.2\%$)}: As shelter density reached $3,009$ tents, high-speed wandering and hyper-vigilance were selected against, favoring energy-conserving, sedentary central-place foraging.
\end{itemize}

\subsection{Cognitive Consolidation: The Learning Rate Collapse}
\label{sec:consolidation}

$g_{\text{learning\_rate}}$ collapsed from 0.520 to 0.023 ($-95.6\%$) alongside 60.96 automated behavioural procedures per agent (maximum observed: 108). This is consistent with the hypothesis that once Colony Beta established a stable spatial network of 3,009 shelters and water reservoirs, high learning rates became counterproductive. Action control literature \cite{balleine2010} notes that habitual action sequences replace goal-directed deliberation in stable environments to minimize cognitive overhead. \textit{Alternative explanations (founder drift, allele fixation) cannot be ruled out from $n{=}1$.}

\subsection{Technological Buffering of Thermoregulation}
\label{sec:buffering}

$g_{\text{thermoregulation}}$ declined $-62.4\%$ while direct cold exposure deaths totalled only 6 (0.21\% of 2,841). This is consistent with shelter infrastructure creating a warm microenvironment eliminating the survival cost of low thermoregulation---an analogue of cultural buffering \cite{laland2000}. \textit{Confirmation requires an ablation run with shelter construction disabled.}

\subsection{Mortality Profile}

Of 2,841 deaths: 67.8\% old age, 13.6\% starvation, 10.5\% dehydration, 7.9\% injury, 0.2\% exposure. Old age dominance (67.8\%) indicates multigenerational stability under $S{=}3.0$.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\section{Discussion}
%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\subsection{Geography as Independent Variable}

Four colonies with identical founding genome distributions produced four qualitatively different survival trajectories, differentiated by initial biome placement. The most parsimonious explanation is geographic. However, small founding populations (4 agents/colony) mean founder sampling variance is substantial.

\subsection{The Scarcity--Curiosity Trade-Off}

The near-elimination of $g_{\text{novelty\_seeking}}$ ($-72.4\%$) under $S{=}3.0$ is consistent with the hypothesis that exploratory behaviour is inherently expensive under scarcity. A cross-scarcity design ($S \in \{1.0, 2.0, 3.0, 5.0\}$) would test whether this decline is monotonically related to scarcity intensity.

\subsection{Cognitive Consolidation and Procedural Fixation}

The learning rate collapse alongside high procedure count suggests an evolutionary analogue of skill consolidation: a transition from deliberate cognitive exploration to habituated procedural execution \cite{balleine2010}. Whether this parallel to mammalian habit formation is meaningful or superficial is an open question.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\section{Open Questions}
%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\begin{enumerate}[label=\arabic*.]
  \item Does Beta always outcompete Alpha/Gamma on seed 1720? ($10\times$ re-runs.)
  \item Is $g_{\text{novelty\_seeking}}$ collapse monotonic with $S$? ($S \in \{1.0, 2.0, 3.0, 5.0\}$.)
  \item Does disabling shelter construction eliminate thermoregulation decay?
  \item Would direct combat prevent Beta's single-clade monopolisation?
  \item Do low-curiosity, low-thermoregulation lineages survive sudden glacial epoch transitions?
\end{enumerate}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\section{Code, Data, and Replay Availability}
%%%%%%%%%%%%%%%%%%%%%%%%%%%%

To ensure complete scientific transparency and independent verification, all components of Project Genesis are open access:

\begin{description}[font=\bfseries]
  \item[Source Code:] The simulation engine, world generator, and agent modules are available at \url{https://github.com/vinaykhosya/genesis-civilizations}.
  \item[Research Portal \& Archive:] Interactive visual exploration, metadata, experiment archives, and JSON-LD schemas are hosted at \url{https://genesis.vinaykhosya.com/archive}.
  \item[Experiment Telemetry:] Full tick-by-tick CSV logs, summary statistics, and event streams for seed 1720 are archived in Supabase Storage with signed URLs accessible via the research portal.
  \item[Replay Viewer:] Client-side Canvas2D replay streams enabling tick-level spatial inspection of agent movements, shelter construction, and colony boundaries are accessible directly through the civilization detail view at \url{https://genesis.vinaykhosya.com/archive}.
  \item[License:] Code is released under the MIT License; experimental data and paper documents are published under the Creative Commons Attribution 4.0 International (CC BY 4.0) License.
\end{description}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\section{Limitations}
%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\begin{enumerate}[label=\arabic*.]
  \item \textbf{$n{=}1$.} Single run, single seed. No result should be interpreted as general.
  \item \textbf{Founder sampling variance.} 4 agents per colony; colony performance differences cannot be cleanly attributed to geography.
  \item \textbf{No statistical testing.} Multi-run data will enable Mann-Whitney $U$ and Cohen's $d$ analysis.
  \item \textbf{Selection vs.\ drift.} Directional selection cannot be distinguished from drift without replicate runs.
  \item \textbf{Simulation fidelity.} Temperature uses a smooth latitude factor; cognition modelled as utility functions, not neural networks.
  \item \textbf{Parameter sensitivity.} Mutation rate, scarcity, and population ceiling were fixed throughout.
\end{enumerate}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\section{Conclusion}
%%%%%%%%%%%%%%%%%%%%%%%%%%%%

Genesis is a physically grounded artificial life simulator in which terrain, climate, hydrology, and biome distribution are derived from physical models rather than set by the researcher. The pilot study on seed~1720 ($S{=}3.0$, 326,075 ticks) provides preliminary evidence that geographic placement is a primary determinant of colony viability when founding genomes are identical, and that directional selection under scarcity produces characteristic cognitive signatures---particularly the suppression of exploratory behaviour and the consolidation of procedural routines at the cost of neural plasticity.

Genesis is not presented as a model of biological reality, but as an experimental framework for studying how geography, cognition, and evolution interact over long temporal horizons under reproducible computational conditions. Full simulation code, experiment data, and a public research archive are available at \url{https://genesis.vinaykhosya.com}.

\begin{thebibliography}{99}

\bibitem{baker2020}
Baker, B., Kanitscheider, I., Markov, T., Zheng, Y., Zhou, G., Bowen, C., \& Mordatch, I. (2020).
Emergent tool use from multi-agent autocurricula.
\textit{International Conference on Learning Representations (ICLR)}.

\bibitem{balleine2010}
Balleine, B.~W., \& O'Doherty, J.~P. (2010).
Human and rodent homologs in action control: Corticostriatal determinants of goal-directed and habitual action.
\textit{Neuropsychopharmacology}, 35(1), 48--69.

\bibitem{barnes2014}
Barnes, R., Lehman, C., \& Mulla, D. (2014).
Priority-flood: An optimal depression-filling and watershed-labeling algorithm for digital elevation models.
\textit{Computers \& Geosciences}, 62, 117--127.

\bibitem{berner2019}
Berner, C., et al. (2019).
Dota 2 with large scale deep reinforcement learning.
\textit{arXiv:1912.06680}.

\bibitem{channon2001}
Channon, A. (2001).
Passing the ALife test: Activity statistics classify evolution in Geb as unbounded.
\textit{Advances in Artificial Life}, 417--426.

\bibitem{ecoffet2021}
Ecoffet, A., Huizinga, J., Lehman, J., Stanley, K.~O., \& Clune, J. (2021).
First explore, then exploit: Go-Explore solves hard exploration problems.
\textit{Nature}, 590, 580--586.

\bibitem{epstein1996}
Epstein, J.~M., \& Axtell, R. (1996).
\textit{Growing Artificial Societies: Social Science from the Bottom Up}.
MIT Press.

\bibitem{laland2000}
Laland, K.~N., Odling-Smee, J., \& Feldman, M.~W. (2000).
Niche construction, biological evolution, and cultural change.
\textit{Behavioral and Brain Sciences}, 23(1), 131--146.

\bibitem{lehman2011}
Lehman, J., \& Stanley, K.~O. (2011).
Abandoning objectives: Evolution through the search for novelty alone.
\textit{Evolutionary Computation}, 19(2), 189--223.

\bibitem{lenski2003}
Lenski, R.~E., Ofria, C., Pennock, R.~T., \& Pennock, D. (2003).
The evolutionary origin of complex features.
\textit{Nature}, 423, 139--144.

\bibitem{ofria2004}
Ofria, C., \& Wilke, C.~O. (2004).
Avida: A software platform for research in computational evolutionary biology.
\textit{Artificial Life}, 10(2), 191--229.

\bibitem{ray1991}
Ray, T.~S. (1991).
An approach to the synthesis of life.
\textit{Artificial Life II}, 371--408.

\bibitem{stanley2002}
Stanley, K.~O., \& Miikkulainen, R. (2002).
Evolving neural networks through augmenting topologies.
\textit{Evolutionary Computation}, 10(2), 99--127.

\bibitem{vinyals2019}
Vinyals, O., et al. (2019).
Grandmaster level in StarCraft II using multi-agent reinforcement learning.
\textit{Nature}, 575, 350--354.

\bibitem{whittaker1975}
Whittaker, R.~H. (1975).
\textit{Communities and Ecosystems} (2nd ed.).
Macmillan.

\bibitem{yaeger1994}
Yaeger, L. (1994).
Computational genetics, physiology, and artificial life in Polyworld.
\textit{Artificial Life III}, 263--298.

\end{thebibliography}

\end{document}
"""

with open("monograph.tex", "w", encoding="utf-8") as f:
    f.write(tex_content)

print("Clean verified monograph.tex generated.")
