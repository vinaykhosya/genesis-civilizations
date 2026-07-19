# Project Genesis

## 1. What is Project Genesis?
Project Genesis is a high-resolution agent-based simulator designed to model the emergence of complex adaptive behaviors, ecology, natural selection, and artificial life. By simulating populations of autonomous agents with individual genomes, physiological models, and cognitive architectures in a dynamic, space-constrained environment, the project enables researchers to observe how local genetic mutations scale up to influence macro-level evolutionary trajectories and social dynamics over thousands of generations.

---

## 2. Research Questions
Project Genesis is designed to explore the following scientific and computational questions:
* **Evolution of Sociality & Altruism**: Under what resource constraints and genetic configurations does cooperative resource-sharing behavior emerge versus territorial aggression?
* **Cognitive Mastery & Adaptation**: How do prediction networks within agents help optimize spatial navigation, resource harvesting, and survival during environmental disasters or seasonal cycles?
* **Genomic Trait Propagation**: What selection pressures steer the evolution of the 14-gene genotype over long epochs, and how do physical adaptations (e.g., speed, home range size) correlate with cognitive survival?
* **Ecological Resiliency**: How do feedback loops between agent consumption and natural resource regeneration influence environmental stability and population caps?

---

## 3. Architecture
The simulation architecture models agents through layered biological, cognitive, and social systems:

* **Genetics**: A 14-gene genotype determines core physical traits and behavioral biases. It expresses active traits at birth, defining attributes like aggression, speed, metabolic rates, and baseline motivational drives.
* **Drives**: Biological needs (hunger, thirst, energy, injury) dynamically produce motivational drives. Emotional drives (fear, comfort, dominance) integrate slower-moving states to scale utility values.
* **Perception**: Agents scan their environment within a defined vision radius, mapping locations of food, water, landmarks, danger zones, and other agents.
* **Memory**: An episodic memory database records spatial resources, territory nests, and social relationship indexes (trust levels and dispute outcomes).
* **Planning**: A cognitive neural predictor predicts future resource scarcity and utility outcomes based on historical environmental inputs and target options.
* **Decision Making**: A soft-threshold sigmoid utility selector evaluates 17 candidate actions (e.g., eating, drinking, exploring, reproducing, storing food) to build a priority queue.
* **Social Behaviour**: Attachment rates, mate selection, and territorial warning displays form the basis of cooperative and competitive interactions.

---

## 4. Simulation Pipeline
Every simulation tick updates the world and processes each agent through the following sequential loop:

```
                  ┌───────────────────────────────┐
                  │      Environmental Tick       │
                  │   (Climate, resource growth)  │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │         Perception            │
                  │ (Spatial scan & memory update)│
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │      Drives & Motivations     │
                  │(Biological & emotional update)│
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │       Decision Making         │
                  │(Sigmoid utility selector &    │
                  │ neural predictor context)     │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │            Action             │
                  │(Pathfinding, resource harvest,│
                  │     or colony sharing)        │
                  └───────────────────────────────┘
```

---

## 5. Repository Structure
* `world/` — Core simulation physics and mechanics.
  * `state.py` — Centralized state container holding spatial grids as 2D NumPy arrays.
  * `generator.py` — Noise-based world generator.
  * `biomes.py` — Whittaker biome mapper.
  * `agents/` — Agent behavioral engines.
    * `agent.py` — Agent attributes, property definitions, and memory indices.
    * `decision.py` — Action selections, contexts, and danger functions.
    * `drives.py` — Metabolic calculations and drive updates.
    * `simulation.py` — Main agent loop orchestration.
* `portal/` — Supabase-backed React ingestion dashboard for running large-scale experiment telemetry.
* `tests/` — Automated test suite verifying physical and biological invariants.
* `run_test.py` — Local validation script.
* `run_resume.py` — Checkpoint restoration utility.
* `run_profiler_benchmark.py` — Deep performance profiling harness.
* `batch3a_micro_profile.py` — Focused micro-profiler for mathematical sub-systems.
* `visualizer.html` — Browser visualizer.

---

## 6. Installation
The core simulation requires **Python 3.10 or 3.11** and standard scientific libraries.

Install the Python dependencies:
```bash
pip install numpy pytest
```

The web dashboard is built on Node.js. Navigate to the `portal/` directory to set up dependencies:
```bash
cd portal
pnpm install
# or npm install / bun install
```

---

## 7. Running Experiments

### Local Validation Runs
Launch a control run of the simulation (2,000 ticks, 200-agent cap) with real-time logging:
```bash
python run_test.py
```
To visualize the run, open `visualizer.html` in your web browser. It reads the local file `live_state.js` generated during execution.

### Resuming Checkpoints
Resume from a previously saved JSON state:
```bash
python run_resume.py
```

---

## 8. Profiling
The project includes a deep profiling harness to measure engine performance:
```bash
python run_profiler_benchmark.py
```
This script runs a standardized 2,000-tick benchmark and outputs:
* **Part 1 (Subsystems)**: Timing breakdown of grid rebuilds, climate processes, and agent loops.
* **Part 2 (Agent Loop)**: Granular analysis of the `simulate_agent_tick` internals.
* **Part 2b & 2c (Perception & Utility)**: Detailed sub-operation timings showing where computations are spent.
* **Part 3 (Scaling Curve)**: Wall-clock scaling in relation to active population size.

---

## 9. Testing
Automated regression tests verify the physics and biology models:
```bash
python -m pytest tests/test_world.py
```
All tests must pass to verify physical invariants (e.g., conservation of mass, genetic expression properties).

---

## 10. Performance Engineering

The primary measured bottlenecks identified during this optimization cycle have been addressed. Remaining performance work will continue using profiler-guided analysis.

### End-to-End Benchmark Gains
* **Average Tick Speed**: Decreased from 270.21 ms/tick to 230.71 ms/tick (**15.0% faster overall**).
* **2,000-Tick Execution Time**: Saved 79.0 seconds over a standardized run.
* **Evaluate Utility Subsystem**: Reduced execution latency by **11.1%** average per call.
* **Environmental Modulation**: Achieved a **35.2% latency reduction** inside tile modulation scoring.

### Preservation of Simulation Semantics
The optimizations in this repository intentionally preserve simulation semantics. Changes focus purely on:
* **Data Structures**: Replaced linear duplicate memory scans with $O(1)$ dictionary index lookups.
* **Caching**: Cached derived properties (`life_stage` and `senescence_factor`) on the agent instance to avoid redundant property evaluations within a single tick.
* **Scalar Math**: Replaced slow NumPy array-oriented methods (`np.clip`/`np.exp`) on scalar data with pure-Python alternatives.
* **Algorithmic Complexity**: Replaced linear list indexing inside the main action selection loop with constant-time lookup maps.

Simulation rules, evolutionary dynamics, and behavioral models remain completely unchanged.
