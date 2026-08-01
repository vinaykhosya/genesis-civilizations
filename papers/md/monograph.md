# Genesis: Physically Grounded Multi-Agent Artificial Life Simulation with Emergent Social and Cognitive Dynamics

**Author:** Vinay Khosya  
**Affiliation:** Independent Researcher  
**Contact:** vinay@khosya.com  
**Portal:** genesis.vinaykhosya.com  
**Date:** July 2026  
**Engine Version:** v1.5.0 | Schema: phase8.4  
**Status:** Preprint Manuscript — arXiv cs.NE / cs.MA / q-bio.PE

---

## Abstract

Artificial life (ALife) simulations provide fundamental insights into emergent evolutionary biology, social coordination, and cognitive adaptation under environmental stressors. However, traditional computational substrates treat the physical landscape as a uniform setting rather than an active experimental variable, decoupling evolutionary dynamics from spatial geography. We present **Genesis**, an agent-based artificial life simulator built from first principles to evaluate how physically derived environments—incorporating multi-octave Perlin elevation noise, latitude-driven thermodynamics, wind-advection precipitation, Priority-Flood hydrology, and a Whittaker biome matrix—shape evolutionary selection and cognitive architecture. Sixteen founding agents divided across four geographically distinct colonies are initialized on a $1024 \times 1024$ grid with identical founder genome distributions ($\text{avg\_genetic\_diversity} = 0.0$) and observed over longitudinal simulation runs spanning up to 326,075 ticks (905.8 simulated years). Agents inherit 14 continuous genomic traits governing physiological decay, perception, and neural plasticity, operating via a multi-drive homeostatic deliberation system with spatial predictor networks. No behavioral outcomes or social structures are scripted. In a pilot experiment under extreme resource scarcity ($S=3.0$, $n=1$ run, seed 1720), we demonstrate: (1) **Geographic Selection**: initial biome placement determined colony survival, with the riparian colony accumulating $55.5 \times 10^6$ water units and persisting for 905.8 years, while arid and boreal colonies underwent complete extinction; (2) **Cognitive Consolidation**: directional selection collapsed exploratory novelty-seeking ($g_{\text{novelty\_seeking}}$: $-72.4\%$) and neural learning rate ($g_{\text{learning\_rate}}$: $-95.6\%$) as agents transitioned from active spatial learning to automated procedure execution; (3) **Technological Buffering**: construction of 3,009 shelters rendered thermoregulation ($g_{\text{thermoregulation}}$: $-62.4\%$) evolutionarily neutral without survival penalty. These findings establish that environmental heterogeneity is a primary engine of selection, cognitive specialization, and cultural buffering in multi-agent artificial life systems. **All results represent preliminary single-run observations.** Complete source code, simulation schemas, raw datasets, and interactive replays are openly accessible at [genesis.vinaykhosya.com](https://genesis.vinaykhosya.com).

---

## 1. Introduction

### 1.1 The Problem of Geography in Artificial Life

Every prior artificial life system made the same structural assumption: that the environment is uniform.

Avida places digital organisms in a flat computational lattice (Lenski et al., 2003; Ofria & Wilke, 2004). Sugarscape distributes sugar on a fixed $50 \times 50$ grid (Epstein & Axtell, 1996). Conway's Game of Life operates on a homogeneous plane. Polyworld (Yaeger, 1994) and Tierra (Ray, 1991) simulate organism energetics in unmodeled topographies. Even modern multi-agent reinforcement learning platforms place agents in symmetric, procedurally balanced arenas (Baker et al., 2020).

This assumption is not merely a simplification—it forecloses an entire category of scientific investigation. In biological reality, geography is not noise. A mountain range creates a rain shadow. A rain shadow creates a desert. A desert means scarce fresh water. Scarce fresh water means selection pressure operates on thirst tolerance and spatial memory, not on general cognitive capacity.

*The landscape is not a setting. It is an independent variable.*

Genesis is an artificial life simulator designed from first principles around this insight. Before an agent is placed, the world is constructed: elevations emerge from multi-octave Perlin noise, temperatures from a latitude–elevation model, rainfall from wind moisture advection, rivers from Priority-Flood drainage, and biomes from the Whittaker temperature–rainfall matrix.

### 1.2 Why Genesis Exists: Motivation

Why build another artificial life simulator when established platforms such as Avida, Sugarscape, and Polyworld already exist? Because existing simulators structurally decouple cognition and evolution from the physical laws of the landscape. In Avida, organisms replicate on a flat grid; in Sugarscape, resources spawn on fixed schedules; in multi-agent RL arenas, environments are procedurally balanced. Genesis was built to test a hypothesis that cannot be evaluated in uniform substrates: that environmental heterogeneity—rain shadows, altitude thermoclines, river basins—is the primary engine of evolutionary selection and cognitive specialization.

### 1.3 Research Questions

1. **Viability:** Do geographically distinct initial colony placements produce systematically different survival outcomes when agent genomes are initialized with equal means?
2. **Evolutionary trajectory:** Does resource scarcity produce characteristic directional selection signatures across 14 heritable genomic traits?
3. **Technological buffering:** Does infrastructure construction decouple phenotypic fitness from the underlying genome, reducing selection pressure on previously critical traits?
4. **Cognitive consolidation:** Is there evidence of an evolutionary transition from high-plasticity active learning to low-plasticity procedural automation as ecological niches become established?

### 1.4 Contributions

This work provides five primary contributions to artificial life and computational evolutionary biology:

1. **Physically Grounded ALife Platform:** A computational simulator where terrain, climate, hydrology, and biomes are derived from physical equations rather than hand-crafted rules, enabling geography to serve as an independent experimental variable.
2. **Genome-Driven Cognitive Architecture:** A multi-drive homeostatic agent model integrating 14 continuous heritable traits with a spatial predictor network and automated procedure formation.
3. **Long-Duration Reproducible Experiment Protocol:** A longitudinal telemetry framework tracking 300,000+ simulation ticks (900+ simulated years) capturing lineage extinction, technological shelter adoption, and genetic drift.
4. **Public Research Archive & Web Portal:** A searchable research portal ([genesis.vinaykhosya.com/archive](https://genesis.vinaykhosya.com/archive)) hosting complete experiment datasets, JSON-LD metadata, and browser-based tick-by-tick replays.
5. **Open-Source Infrastructure:** Standardized schemas (`experiment_schema.json`) and Python execution pipelines for cross-platform simulation reproducibility.

### 1.5 Reproducibility Statement

To ensure exact computational reproducibility, every simulation run in Genesis adheres to strict execution standards:
- **Seed Determinism:** Procedural world generation and pseudo-random numbers are controlled by integer seed 1720.
- **Config Hash:** Full simulation parameters are logged in `config.json`.
- **Telemetry Archive:** Complete CSV logs and JSON event streams are mirrored in Supabase object storage.
- **License:** Source code is licensed under the MIT License; experimental datasets under CC BY 4.0.

### 1.6 Scope and Limitations

This paper reports one longitudinal pilot study ($n=1$, seed 1720, 326,075 ticks). All effect sizes and causal inferences are preliminary. Section 11 documents specific limitations.

---

## 2. Related Work

### 2.1 Avida

Avida (Lenski et al., 2003; Ofria & Wilke, 2004) demonstrated that self-replicating digital programs evolve increasing functional complexity under selective pressure, producing complex logical operations absent in founding genomes. It established that Darwinian open-ended evolution is achievable in digital substrates.

However, Avida's organisms occupy a uniform computational lattice with no spatial thermodynamics, climate, or hydrological resource gradients. Selection operates exclusively through instruction execution speed and replication rate, not physical survival against environmental hazards. This design prevents investigation of how environmental heterogeneity—such as rain shadows or thermoclines—creates spatially structured selection pressure. Genesis addresses this gap by making the physical world the primary experimental control.

### 2.2 Sugarscape

Sugarscape (Epstein & Axtell, 1996) introduced spatial heterogeneity into agent-based modeling by placing sugar and spice resource peaks on a $50 \times 50$ grid, enabling foundational studies of migration, wealth inequality, and trade emergence.

However, Sugarscape's environment is static: resource replenishment follows fixed algebraic rules, climate is absent, and terrain elevation does not exist. Genesis extends this paradigm by synthesizing a physically derived world where resource distribution emerges naturally from terrain, wind moisture advection, and river hydrology rather than manual placement.

### 2.3 NEAT and Neural Evolution Platforms

NeuroEvolution of Augmenting Topologies (Stanley & Miikkulainen, 2002) and novelty search algorithms (Lehman & Stanley, 2011) demonstrated that neural network topologies and behavioral diversity can be evolved alongside connection weights to discover specialized controllers for robotics, pole balancing, and game agents.

These platforms operate primarily as fitness-landscape optimization tools for fixed tasks rather than simulating open-ended multi-agent survival. Genesis incorporates genomic encoding of 14 cognitive and physiological traits, but embeds them within an unscripted survival ecology rather than an objective-function optimization loop.

### 2.4 OpenAI Five and Multi-Agent RL

Multi-agent reinforcement learning systems such as OpenAI Five (Berner et al., 2019), AlphaStar (Vinyals et al., 2019), and emergent autocurricula platforms (Baker et al., 2020; Ecoffet et al., 2021) demonstrated emergent teamwork, strategic bluffing, and long-horizon coordination in complex multi-player games.

However, these systems operate in symmetric, human-engineered game arenas with pre-defined reward structures. Agent behaviors are trained via gradient descent—they do not evolve heritably across generations. Genesis differs in that all behavioral drives are encoded in a genome transmitted with mutation across generations, capturing long-timescale evolutionary selection that RL frameworks do not model.

### 2.5 Geb and Open-Ended Evolution Systems

Geb (Channon, 2001), Polyworld (Yaeger, 1994), and Tierra (Ray, 1991) pursued whether open-ended complexity growth occurs indefinitely in digital substrates.

While these systems demonstrated sustained evolutionary activity, they operated in minimal-physics environments. Genesis occupies a distinct scientific niche: a geographically grounded study of survival, social clustering, and cognitive evolution under physically realistic selection pressures.

---

## 3. The Physical World Model

Genesis constructs a physically derived world before any agent is placed. All stages mutate a shared `WorldState` container of 2D NumPy arrays (`float32` / `int32`).

```
[Perlin Elevation h(x,y)] ──► [Temperature T(y,h)] ──► [Wind Advection Rainfall R(x,y)]
                                                                   │
[Habitability Map & NMS] ◄── [Whittaker Biomes] ◄── [Priority-Flood Hydrology]
```

### 3.1 Terrain Generation

Elevation is generated by summation of multi-octave Perlin noise:

$$h(x,y) = \sum_{k=0}^{K} A_k \cdot \text{Perlin}\!\left(\frac{x}{S_k}, \frac{y}{S_k}\right)$$

where amplitude $A_k = 0.5^k$ and scale $S_k$ decreases with octave $k$. Tiles with $h < h_{\text{sea}} = 0.3$ are classified as ocean.

### 3.2 Temperature Model

$$T(y, h) = -15 + 47 \cdot \lambda(y) - 38 \cdot \max(0, h) + T_{\text{offset}}$$

where $\lambda(y) = 1 - |y - H/2| / (H/2)$ maps $[0,1]$ from poles to equator.

### 3.3 Rainfall — Wind Moisture Advection

For each column $x$:

$$\text{rain}[x] = m[x] \cdot \left(\frac{0.6}{w} + 35 \cdot \max\!\left(0,\, h_{\text{eff}}[x] - h_{\text{eff}}[x-1]\right)\right)$$

where $m[x]$ is column air moisture, $w$ is grid width (scaling ensures resolution independence), and $h_{\text{eff}} = \max(h, h_{\text{sea}})$ clamps ocean tiles to sea level. Rain shadows emerge naturally on leeward slopes.

### 3.4 Biome Classification

Biomes are assigned per cell from a Whittaker temperature–rainfall matrix:

| Biome | Temperature (°C) | Rainfall (mm/yr) |
|---|---|---|
| Ocean | below sea level | — |
| Glacier | < −8 | any |
| Tundra | −8 to 0 | any |
| Taiga | 0 to 8 | ≥ 400 |
| Temperate Forest | 8 to 20 | ≥ 700 |
| Grassland | 8 to 20 | 350–700 |
| Desert | any land | < 250 |
| Rainforest | > 20 | ≥ 1800 |
| Lake | derived from hydrology | — |

### 3.5 Hydrology — Priority-Flood Drainage

Terrain sinks are resolved using the Priority-Flood algorithm (Barnes et al., 2014): a min-heap initialized from all boundary cells processes interior cells in elevation order, filling depressions to their spillover level. Cells accumulating flow > 1500 units are rivers; filled depressions accumulating > 300 units become lakes.

### 3.6 Resource and Habitability Layers

Mineral resources (iron, copper) are placed using low-frequency noise masks on high-elevation cells. Five habitability scores (water, food, resource, climate, terrain) are combined as a weighted sum. Circular NMS exclusion (radius 40–45 cells) ensures recommended settlement sites are spatially distributed.

---

## 4. Agent Architecture

### 4.1 Genome

Each agent carries 14 continuous genomic traits, initialized from $\mathcal{U}(0,1)$ and transmitted with additive Gaussian mutation ($\sigma_{\text{mut}} = 0.05$ per gene per reproduction):

| Gene | Symbol | Function |
|---|---|---|
| Metabolism | g_metabolism | Energy consumption rate |
| Thermoregulation | g_thermoregulation | Cold/heat exposure resistance |
| Vision | g_vision | Perception radius |
| Mobility | g_mobility | Movement speed |
| Memory Fidelity | g_memory_fidelity | Spatial landmark retention |
| Planning | g_planning | Utility weighting depth |
| Novelty Seeking | g_novelty_seeking | Exploration vs. exploitation bias |
| Social Proximity | g_social_proximity | Colony clustering drive |
| Aggression | g_aggression | Threat display intensity |
| Resource Sharing | g_resource_sharing | Altruistic transfer propensity |
| Risk Sensitivity | g_risk_sensitivity | Danger penalty weight |
| Resilience | g_resilience | Injury recovery rate |
| Longevity | g_longevity | Maximum lifespan ceiling |
| Learning Rate | g_learning_rate | Neural predictor plasticity |

### 4.2 Cognitive Architecture & Deliberation Loop

Agent decisions operate via a homeostatic deliberation system. At each tick, each agent: (1) perceives a radius-bounded neighborhood and indexes resources into memory; (2) evaluates utility for candidate actions weighted against five drive levels (hunger, thirst, fear, fatigue, reproductive drive); (3) executes the highest-utility action.

```
[Perception (g_vision)] ──► [Spatial Memory Prior] ──► [Drive Homeostasis] ──► [Utility Eval] ──► [Execution]
```

### 4.3 Drive Dynamics, Mortality, and Reproduction

Five homeostatic drives decay each tick. Mortality occurs when any drive exceeds a terminal threshold. Agents reproduce sexually when hunger and thirst are below thresholds; offspring receive averaged parent genes with additive Gaussian mutation.

### 4.4 Infrastructure

Agents construct Level-1 shelters (tents) and cache water at reservoir coordinates. Shelters reduce thermal exposure; caches are accessible to agents with high `g_memory_fidelity`.

---

## 5. Experimental Protocol

| Parameter | Value |
|---|---|
| Seed | 1720 |
| Scarcity multiplier $S$ | $3.0$ (300% baseline depletion) |
| Max population $N_{\max}$ | 200 |
| Mutation rate $\sigma$ | 0.05 |
| Healing multiplier | 200× |
| Disputes | Enabled (resource competition; direct combat disabled) |
| Climate epoch mode | Default temperate |
| Grid size | $1024 \times 1024$ cells |
| World preset | `island_chains` |

Sixteen founding agents (Gen 0) were divided equally across 4 geographically distinct colonies.

### 5.1 Experimental Procedure

**Seed selection.**
Seed 1720 was chosen as the canonical pilot seed by running a brief 5,000-tick pre-screen over seeds 1000–2000 and selecting an instance in which all four proposed colony biome placements were genuinely distinct (boreal, arid, temperate, and riparian) and no colony started with water access that would trivially prevent early extinction. The seed was fixed before any longitudinal results were observed.

**Stopping criterion.**
The simulation was run until one of two terminal conditions was met: (a) the total living population reached zero, or (b) the tick counter exceeded $5 \times 10^5$ ticks. The run terminated at tick 326,075 with 201 agents alive in Colony Beta, triggering a voluntary checkpoint save rather than population collapse.

**Telemetry collection.**
At every tick, the engine logs a compact row to an in-memory buffer that is flushed to Supabase Storage every 1,000 ticks as a compressed CSV chunk. A secondary JSON event stream captures birth, death, reproduction, shelter construction, and inter-agent resource transfer events. Aggregate summary statistics (mean trait values per generation, colony population count, resource totals) are computed online via running accumulators and stored in a separate summary table.

**Metrics recorded.**
Primary outcome metrics are: (i) colony lifespan in ticks and simulated years ($1\text{ tick} = 0.00278\text{ yr}$); (ii) maximum generation reached; (iii) total cumulative births over the colony's lifetime; (iv) per-trait mean and standard deviation at generation 0 and at termination; (v) mortality cause distribution; (vi) infrastructure counts (shelters, water caches). Secondary metrics tracked but not the focus of this pilot include inter-agent dispute frequency, cache utilisation rate, and procedure automation depth.

**Hardware-independent execution.**
All stochastic elements are controlled exclusively through the fixed integer seed passed to a deterministic PRNG (`numpy.random.default_rng(1720)`). The engine contains no wall-clock dependencies, thread-racing, or platform-specific floating-point behaviour; simulation state is therefore exactly reproducible across hardware. Execution speed is not a reproducibility variable.

---

## 6. Pilot Study Results

### 6.1 Colony Setup & Survival Timeline

| Colony | Location | Biome | Lifespan | Max Gen | Total Lifetime Members | Status |
|---|---|---|---|---|---|---|
| Delta | (552, 304) | Boreal Highlands | 16,400 ticks (45.5 yr) | Gen 1 | 3 | Extinct |
| Gamma | (847, 540) | Arid Scrubland | 75,600 ticks (210 yr) | Gen 8 | 114 | Extinct |
| Alpha | (146, 503) | Temperate Basin | 206,400 ticks (573 yr) | Gen 19 | 683 | Extinct |
| Beta | (597, 556) | Riparian Oasis | 326,075 ticks (905.8 yr) | Gen 38 | 2,242 | Active (201 alive) |

All colonies began with identical founding genomes ($\text{avg\_genetic\_diversity} = 0.0$ at tick 1; diversity $= 0.0$ implies founding lineages shared identical trait vectors). Total Lifetime Members reports cumulative individual births across the colony's lifespan, whereas peak concurrent living agents reached 142 in Colony Alpha and 201 in Colony Beta. All 201 final survivors are Beta lineage descendants (founders #4–#7).

---

## 7. Results

### 7.1 Geographic Selection as a Viability Determinant

The four colonies began with identical genome distributions but diverged radically in survival.

**Colony Delta** (Boreal Highlands, tick 16,400): Low ambient temperature ($T_{\text{offset}} < -5^{\circ}$C) and sparse food nodes imposed thermal and caloric stress. Only 3 offspring were produced. *Consistent with: boreal biome imposing a viability floor the founding genome did not satisfy.*

**Colony Gamma** (Arid Scrubland, tick 75,600): Water reserves peaked at 393,944 units. A prolonged drought at Year 180 triggered extinction. *Consistent with: hydrological capacity of the local biome imposing a ceiling behavioral adaptation could not overcome.*

**Colony Alpha** (Temperate Basin, tick 206,400): Reached a peak of 142 concurrent living agents (683 cumulative lifetime births). Lower mean $g_{\text{vision}} \approx 0.62$ and $g_{\text{memory\_fidelity}} \approx 0.51$ (versus Beta's final 0.79 and 0.61) were associated with failure to access distant food belts. *Single-run design prevents causal attribution.*

**Colony Beta** (Riparian Oasis, 201 alive): Cumulative births $= 2,242$. Water storage $= 55.5 \times 10^6$ units; 3,009 tents and 14 cabins constructed. *Consistent with: hydrological access as the critical viability threshold under $S=3.0$.*

*Note: All survival variance is attributable to (a) geographic placement, (b) founder sampling variance (4 agents/colony), or (c) stochastic dynamics. Multi-seed replication is required.*

### 7.2 Directional Genomic Selection & Co-Evolutionary Interpretation

| Gene | Start | End | $\Delta\%$ | Consistent with |
|---|---|---|---|---|
| `g_learning_rate` | 0.520 | 0.023 | −95.6% | Cognitive consolidation (§7.3) |
| `g_novelty_seeking` | 0.341 | 0.094 | −72.4% | Exploration penalized under $S=3.0$ |
| `g_thermoregulation` | 0.529 | 0.199 | −62.4% | Technological buffering (§7.4) |
| `g_risk_sensitivity` | 0.505 | 0.191 | −62.2% | Reduced danger near shelters |
| `g_mobility` | 0.549 | 0.363 | −33.9% | Sedentary foraging favored |
| `g_memory_fidelity` | 0.466 | 0.614 | +31.8% | Water cache retention |
| `g_vision` | 0.515 | 0.792 | +53.8% | Long-range resource detection |
| `g_longevity` | 0.540 | 0.848 | +57.0% | Elder knowledge transmission |

#### Co-Evolutionary Interpretation of Trait Shifts:
The joint directional movement across these traits reflects an integrated adaptation strategy:
- **Vision + Longevity ($+53.8\%$, $+57.0\%$):** Long-range perception enabled early detection of distant riparian food patches, while increased longevity allowed experienced agents to maintain shelter networks across decades.
- **Memory Fidelity ($+31.8\%$):** Complemented high vision by anchoring the exact spatial coordinates of Colony Beta's $55.5\times 10^6$ unit water reservoirs.
- **Mobility + Risk Sensitivity ($-33.9\%$, $-62.2\%$):** As shelter density reached $3,009$ tents, high-speed wandering and hyper-vigilance were selected against, favoring energy-conserving, sedentary central-place foraging.

### 7.3 Cognitive Consolidation: The Learning Rate Collapse

$g_{\text{learning\_rate}}$ collapsed from 0.520 to 0.023 (−95.6%) alongside 60.96 automated behavioral procedures per agent (maximum observed: 108). This is consistent with the hypothesis that once Colony Beta established a stable spatial network of 3,009 shelters and water reservoirs, high learning rates became counterproductive. Action control literature (Balleine & O'Doherty, 2010) notes that habitual action sequences replace goal-directed deliberation in stable environments to minimize cognitive overhead. *Alternative explanations (founder drift, allele fixation) cannot be ruled out from $n=1$.*

### 7.4 Technological Buffering of Thermoregulation

$g_{\text{thermoregulation}}$ declined −62.4% while direct cold exposure deaths totaled only 6 (0.21% of 2,841). This is consistent with shelter infrastructure creating a warm microenvironment eliminating the survival cost of low thermoregulation—an analog of cultural buffering (Laland et al., 2000). *Confirmation requires an ablation run with shelter construction disabled.*

### 7.5 Mortality Profile

Of 2,841 deaths: 67.8% old age, 13.6% starvation, 10.5% dehydration, 7.9% injury, 0.2% exposure. Old age dominance (67.8%) indicates multigenerational stability under $S=3.0$.

---

## 8. Discussion

### 8.1 Geography as Independent Variable

Four colonies with identical founding genome distributions produced four qualitatively different survival trajectories, differentiated by initial biome placement. The most parsimonious explanation is geographic. However, small founding populations (4 agents/colony) mean founder sampling variance is substantial.

### 8.2 The Scarcity–Curiosity Trade-Off

The near-elimination of $g_{\text{novelty\_seeking}}$ (−72.4%) under $S=3.0$ is consistent with the hypothesis that exploratory behavior is inherently expensive under scarcity. A cross-scarcity design ($S \in \{1.0, 2.0, 3.0, 5.0\}$) would test whether this decline is monotonically related to scarcity intensity.

### 8.3 Cognitive Consolidation and Procedural Fixation

The learning rate collapse alongside high procedure count suggests an evolutionary analog of skill consolidation: a transition from deliberate cognitive exploration to habituated procedural execution (Balleine & O'Doherty, 2010). Whether this parallel to mammalian habit formation is meaningful or superficial is an open question.

---

## 9. Open Questions

1. Does Beta always outcompete Alpha/Gamma on seed 1720? ($10\times$ re-runs.)
2. Is $g_{\text{novelty\_seeking}}$ collapse monotonic with $S$? ($S \in \{1.0, 2.0, 3.0, 5.0\}$.)
3. Does disabling shelter construction eliminate thermoregulation decay?
4. Would direct combat prevent Beta's single-clade monopolization?
5. Do low-curiosity, low-thermoregulation lineages survive sudden glacial epoch transitions?

---

## 10. Code, Data, and Replay Availability

To ensure complete scientific transparency and independent verification, all components of Project Genesis are open access:

- **Source Code:** The simulation engine, world generator, and agent modules are available at [github.com/vinaykhosya/genesis-civilizations](https://github.com/vinaykhosya/genesis-civilizations).
- **Research Portal & Archive:** [genesis.vinaykhosya.com/archive](https://genesis.vinaykhosya.com/archive).
- **Experiment Telemetry:** Full tick-by-tick CSV logs, summary statistics, and event streams for seed 1720 are archived in Supabase Storage with signed URLs accessible via the research portal.
- **Replay Viewer:** Client-side Canvas2D replay streams enabling tick-level spatial inspection of agent movements, shelter construction, and colony boundaries are accessible directly through the civilization detail view at [genesis.vinaykhosya.com/archive](https://genesis.vinaykhosya.com/archive).
- **License:** Code is released under the MIT License; experimental data and paper documents are published under the Creative Commons Attribution 4.0 International (CC BY 4.0) License.

---

## 11. Limitations

1. **$n=1$.** Single run, single seed. No result should be interpreted as general.
2. **Founder sampling variance.** 4 agents per colony; colony performance differences cannot be cleanly attributed to geography.
3. **No statistical testing.** Multi-run data will enable Mann-Whitney $U$ and Cohen's $d$ analysis.
4. **Selection vs. drift.** Directional selection cannot be distinguished from drift without replicate runs.
5. **Simulation fidelity.** Temperature uses a smooth latitude factor; cognition modeled as utility functions, not neural networks.
6. **Parameter sensitivity.** Mutation rate, scarcity, and population ceiling were fixed throughout.

---

## 12. Conclusion

Genesis is a physically grounded artificial life simulator in which terrain, climate, hydrology, and biome distribution are derived from physical models rather than set by the researcher. The pilot study on seed 1720 ($S=3.0$, 326,075 ticks) provides preliminary evidence that geographic placement is a primary determinant of colony viability when founding genomes are identical, and that directional selection under scarcity produces characteristic cognitive signatures—particularly the suppression of exploratory behavior and the consolidation of procedural routines at the cost of neural plasticity.

Genesis is not presented as a model of biological reality, but as an experimental framework for studying how geography, cognition, and evolution interact over long temporal horizons under reproducible computational conditions. Full simulation code, experiment data, and a public research archive are available at [genesis.vinaykhosya.com](https://genesis.vinaykhosya.com).

The current work establishes Genesis as a reproducible experimental platform. Immediate next steps include multi-seed replication ($n \geq 10$, seeds drawn from a pre-registered list) to distinguish geographic effects from founder sampling variance; systematic parameter ablations varying scarcity ($S \in \{1.0, 2.0, 3.0, 5.0\}$) and mutation rate; a shelter-disabled ablation to test the technological buffering hypothesis; and glacial epoch transition experiments to probe the long-term stability of low-plasticity lineages. Longer-term work will compare Genesis evolutionary outcomes against reinforcement-learning baselines and heuristic foraging agents operating in identical physical environments, and will target a statistically rigorous follow-up study powered by sufficient replication to support Mann–Whitney $U$ tests and Cohen's $d$ effect-size estimation across all primary outcome metrics.

---

## References

Baker, B., Kanitscheider, I., Markov, T., Zheng, Y., Zhou, G., Bowen, C., & Mordatch, I. (2020). Emergent tool use from multi-agent autocurricula. *ICLR 2020*.

Balleine, B. W., & O'Doherty, J. P. (2010). Human and rodent homologs in action control. *Neuropsychopharmacology*, 35(1), 48–69.

Barnes, R., Lehman, C., & Mulla, D. (2014). Priority-flood: An optimal depression-filling and watershed-labeling algorithm for digital elevation models. *Computers & Geosciences*, 62, 117–127.

Berner, C., et al. (2019). Dota 2 with large scale deep reinforcement learning. *arXiv:1912.06680*.

Channon, A. (2001). Passing the ALife test: Activity statistics classify evolution in Geb as unbounded. *Advances in Artificial Life*, 417–426.

Ecoffet, A., Huizinga, J., Lehman, J., Stanley, K. O., & Clune, J. (2021). First explore, then exploit: Go-Explore. *Nature*, 590, 580–586.

Epstein, J. M., & Axtell, R. (1996). *Growing Artificial Societies*. MIT Press.

Laland, K. N., Odling-Smee, J., & Feldman, M. W. (2000). Niche construction, biological evolution, and cultural change. *Behavioral and Brain Sciences*, 23(1), 131–146.

Lehman, J., & Stanley, K. O. (2011). Abandoning objectives: Evolution through the search for novelty alone. *Evolutionary Computation*, 19(2), 189–223.

Lenski, R. E., Ofria, C., Pennock, R. T., & Pennock, D. (2003). The evolutionary origin of complex features. *Nature*, 423, 139–144.

Ofria, C., & Wilke, C. O. (2004). Avida: A software platform for research in computational evolutionary biology. *Artificial Life*, 10(2), 191–229.

Ray, T. S. (1991). An approach to the synthesis of life. *Artificial Life II*, 371–408.

Stanley, K. O., & Miikkulainen, R. (2002). Evolving neural networks through augmenting topologies. *Evolutionary Computation*, 10(2), 99–127.

Vinyals, O., et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. *Nature*, 575, 350–354.

Whittaker, R. H. (1975). *Communities and Ecosystems* (2nd ed.). Macmillan.

Yaeger, L. (1994). Computational genetics, physiology, and artificial life in Polyworld. *Artificial Life III*, 263–298.
