"""
run_profiler_benchmark.py
=========================
PROJECT GENESIS — Deep Performance Observatory

Runs a fresh short experiment (2000 ticks, 200-agent cap, same world config)
and instruments EVERY section of the simulation loop — including all the parts
the existing profiler misses — to produce a full, attributed time-breakdown report.

Do NOT stop the existing run_resume.py experiment before running this.
This script runs independently in a second terminal.

Usage:
    python run_profiler_benchmark.py

Output:
    - Prints a ranked time-breakdown table every 500 ticks
    - Writes a final report to: experiments/_profiler_benchmark/summary.json
    - Writes tick-by-tick CSV to: experiments/_profiler_benchmark/ticks.csv
"""

import os
import sys
import time
import csv
import json
import collections
import numpy as np

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

# ── Config (mirrors run_test.py defaults) ─────────────────────────────────────
SEED            = 1720
BENCHMARK_TICKS = 2000       # short enough to finish in ~2-3 minutes
MAX_POPULATION  = 200
SCARCITY        = 3.0
MUTATION_RATE   = 0.05
REPORT_INTERVAL = 500        # print a live summary every N ticks

# ── Output folder ─────────────────────────────────────────────────────────────
OUT_DIR = os.path.join("experiments", "_profiler_benchmark")
os.makedirs(OUT_DIR, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 1  World generation
# ─────────────────────────────────────────────────────────────────────────────
print("=" * 70)
print("  PROJECT GENESIS — Performance Observatory (Benchmark Run)")
print(f"  Seed: {SEED} | Ticks: {BENCHMARK_TICKS} | Pop cap: {MAX_POPULATION}")
print("=" * 70)
print()

t_gen_start = time.perf_counter()
from world.generator import generate_world
world = generate_world(width=1024, height=1024, seed=SEED, world_preset="None")
t_gen = time.perf_counter() - t_gen_start
print(f"  World generated in {t_gen:.2f}s")

# Wire world settings
world.max_population           = MAX_POPULATION
world.mutation_rate            = MUTATION_RATE
world.reproduction_enabled     = True
world.disputes_enabled         = False
world.disasters_enabled        = True
world.healing_speed_mult       = 2_000_000.0
world.shelter_build_speed_mult = 1.0
world.shelter_search_dist      = 100.0
world.climate_epoch_mode       = "legacy"
world.spawn_mode               = "fixed"
world.colony_spawn_locations   = {"Alpha": 1, "Beta": 2, "Gamma": 3, "Delta": 4}
world.targeted_biomes          = []
world.ecology_ablation = {
    "dehydration_ramp":    True,
    "memory_fidelity":     True,
    "water_caching":       True,
    "deposit_utility_fix": True,
}
world.ablation = {
    "planner":           True,
    "emotion":           False,
    "relationships":     False,
    "memory_importance": False,
    "motivation":        False,
    "prediction_error":  False,
}
world.planner_enabled             = True
world.sleep_consolidation_enabled = True
world.exp_folder                  = OUT_DIR
world.agents                      = []

# ── World pre-flight (mirrors run_simulation() lines 843-862) ─────────────────
from world.noise import fbm_noise_2d
world.wildlife  = np.clip(world.wildlife  * SCARCITY, 0.0, 1.0)
world.fertility = np.clip(world.fertility * SCARCITY, 0.0, 1.0)
world.lake_map  = np.clip(world.lake_map  * SCARCITY, 0.0, float('inf'))
world.river_map = np.clip(world.river_map * SCARCITY, 0.0, float('inf'))
world.base_wildlife  = world.wildlife.copy()
world.base_fertility = world.fertility.copy()
world.base_river_map = world.river_map.copy()
world.base_lake_map  = world.lake_map.copy()
world.seasonal_noise = fbm_noise_2d(
    (world.height, world.width), seed=world.seed + 1010, octaves=2, base_res=(2, 2)
)
world.shelters = {}

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 2  Import simulation internals & Apply Monkey-Patching Profiler
# ─────────────────────────────────────────────────────────────────────────────
import world.agents.simulation as sim_mod
import world.agents.perception as perc_mod
import world.agents.decision as dec_mod
import world.agents.drives as dr_mod
from world.agents.cognitive import Predictor
from world.agents.agent import Agent, WATER, FOOD, PERSON, LANDMARK, DANGER
from world.state import WorldState

from world.agents.simulation  import simulate_agent_tick
from world.agents.genetics    import create_genome, express_genome
from world.predictor          import predict_settlements
from world.state              import BIOME_NAMES
from world.climate_epochs     import ClimateEpochEngine

# Replicate colony spawn constants directly.
COLONY_NAMES   = ["Alpha", "Beta", "Gamma", "Delta"]
COLONY_COLORS  = ["#E74C3C", "#3498DB", "#2ECC71", "#F39C12"]
AGENTS_PER_COL = 50  # 50 * 4 = 200 starting agents to test scaling!

engine = ClimateEpochEngine(mode=world.climate_epoch_mode, seed=world.seed)

# Define sub-profiler data structure
sub_prof = collections.defaultdict(lambda: {"calls": 0, "total_ms": 0.0, "max_ms": 0.0})

# Thread-local / script-global state flags to track caller context
in_perceive_flag = False
in_evaluate_utility_flag = False

def record_sub(key, ms):
    p = sub_prof[key]
    p["calls"] += 1
    p["total_ms"] += ms
    if ms > p["max_ms"]:
        p["max_ms"] = ms

def profile_wrapper(name, func):
    def wrapped(*args, **kwargs):
        t0 = time.perf_counter()
        res = func(*args, **kwargs)
        ms = (time.perf_counter() - t0) * 1000.0
        record_sub(name, ms)
        return res
    return wrapped


# 1. Custom wrappers for evaluate_utility and perceive to control execution context flags
#    evaluate_utility: wrapper calls ORIGINAL for correctness + total time,
#    then a shadow pass breaks apart the "other" 69.5% bucket.
_orig_evaluate_utility = sim_mod.evaluate_utility

import math as _math
from world.agents.decision import (
    sigmoid_utility as _sigmoid_utility,
    calculate_danger_penalty as _calc_danger,
    get_environmental_modulation as _get_env_mod,
    get_predictor_context as _get_predictor_context,
)
from world.agents.drives import compute_drive_modulation as _compute_drive_mod
try:
    from world.agents.reproduction import (
        MIN_REPRO_AGE_TICKS as _MIN_REPRO,
        MAX_REPRO_AGE_TICKS as _MAX_REPRO,
    )
except Exception:
    _MIN_REPRO = 0; _MAX_REPRO = 99999
try:
    from world.agents.cognitive import DecisionContext as _DecisionCtx
except Exception:
    _DecisionCtx = None

def _shadow_evaluate_utility(agent, world, chunk_size=32, context=None):
    """Instrumented shadow — results discarded, only sub_prof timing matters."""
    if agent.dead:
        return
    cy, cx = agent.location

    # scarcity prediction loop
    t0 = time.perf_counter()
    if context is not None and hasattr(context, "day"):
        day = context.day; season = context.season
    else:
        day = world.tick % 360; season = day // 90
    target_season = (season + 1) % 4 if (day % 90) >= 45 else season
    ta = 0; to = 0
    for node in list(agent.knowledge.water_sources.values()) + list(agent.knowledge.food_sources.values()):
        ac = node.get("active_seasons", {}).get(target_season, 0)
        dc = node.get("dry_seasons",    {}).get(target_season, 0)
        ta += ac; to += (ac + dc)
    record_sub("eval_scarcity_loop", (time.perf_counter() - t0) * 1000.0)

    # DecisionContext construction (7 sigmoid calls)
    t0 = time.perf_counter()
    sht = agent.shelter_location if agent.shelter_location is not None else agent.home_location
    if _DecisionCtx is not None:
        try:
            _DecisionCtx(
                risk_mult=agent.brain.get("risk_mult", 1.0),
                scarcity_prediction=0.3,
                colony_food=0.0, colony_water=0.0,
                shelter_target=sht,
                rest_sig=_sigmoid_utility(100.0 - agent.energy, 55.0, 12.0),
                drink_sig=_sigmoid_utility(agent.thirst, 50.0, 10.0),
                eat_sig=_sigmoid_utility(agent.hunger, 50.0, 10.0),
                drink_stored_sig=_sigmoid_utility(agent.thirst, 40.0, 10.0),
                eat_stored_sig=_sigmoid_utility(agent.hunger, 40.0, 10.0),
                withdraw_food_sig=_sigmoid_utility(agent.hunger, 45.0, 10.0),
                withdraw_water_sig=_sigmoid_utility(agent.thirst, 45.0, 10.0),
            )
        except Exception:
            pass
    record_sub("eval_decision_context", (time.perf_counter() - t0) * 1000.0)

    # drink candidate ranking (cache-miss path)
    cache = agent.memory_cache
    t0 = time.perf_counter()
    cache_water_valid = (
        cache.get("last_update_tick", -1) != -1 and
        agent.discoveries_count == cache.get("last_discoveries", 0) and
        target_season == cache.get("last_season", -1) and
        "water_spots" in cache and len(cache["water_spots"]) > 0
    )
    if not cache_water_valid and len(agent.knowledge.water_sources) > 0:
        wc = []
        for loc, node in agent.knowledge.water_sources.items():
            d = _math.sqrt((loc[0]-cy)**2+(loc[1]-cx)**2)
            wc.append((node["confidence"]/(1.0+d/200.0), loc))
        wc.sort(key=lambda x: x[0], reverse=True)
    record_sub("eval_drink_candidate_rank", (time.perf_counter() - t0) * 1000.0)

    # drink top-3 scoring
    t0 = time.perf_counter()
    for loc in cache.get("water_spots", [])[:3]:
        if loc in agent.knowledge.water_sources:
            _ = _math.sqrt((loc[0]-cy)**2+(loc[1]-cx)**2)
    record_sub("eval_drink_top3_score", (time.perf_counter() - t0) * 1000.0)

    # food candidate ranking (cache-miss path)
    t0 = time.perf_counter()
    cache_food_valid = (
        cache.get("last_update_tick", -1) != -1 and
        agent.discoveries_count == cache.get("last_discoveries", 0) and
        target_season == cache.get("last_season", -1) and
        "food_spots" in cache and len(cache["food_spots"]) > 0
    )
    if not cache_food_valid and len(agent.knowledge.food_sources) > 0:
        fc = []
        for loc, node in agent.knowledge.food_sources.items():
            d = _math.sqrt((loc[0]-cy)**2+(loc[1]-cx)**2)
            fc.append((node["confidence"]/(1.0+d/200.0), loc))
        fc.sort(key=lambda x: x[0], reverse=True)
    record_sub("eval_food_candidate_rank", (time.perf_counter() - t0) * 1000.0)

    # food top-3 scoring
    t0 = time.perf_counter()
    for loc in cache.get("food_spots", [])[:3]:
        if loc in agent.knowledge.food_sources:
            _ = _math.sqrt((loc[0]-cy)**2+(loc[1]-cx)**2)
    record_sub("eval_food_top3_score", (time.perf_counter() - t0) * 1000.0)

    # explore chunk scan (9-cell neighbourhood)
    t0 = time.perf_counter()
    chy, chx = cy // chunk_size, cx // chunk_size
    unexplored = [
        (chy+dy, chx+dx)
        for dy in (-1,0,1) for dx in (-1,0,1)
        if (0 <= chy+dy < world.height//chunk_size and
            0 <= chx+dx < world.width//chunk_size and
            (chy+dy, chx+dx) not in agent.visited_chunks)
    ]
    record_sub("eval_explore_chunk_scan", (time.perf_counter() - t0) * 1000.0)

    # reproduce gate (bio check + any() world scan)
    t0 = time.perf_counter()
    if _MIN_REPRO <= agent.age < _MAX_REPRO:
        bio_ok = (agent.reproduction_cooldown == 0 and agent.health >= 50.0 and
                  agent.fat_reserves >= 30.0 and agent.hunger <= 75.0 and agent.thirst <= 75.0)
        if bio_ok:
            _ = any(
                a.id != agent.id and not a.dead and
                getattr(a, "colony_id", -1) == getattr(agent, "colony_id", -1)
                for a in world.agents
            )
    record_sub("eval_reproduce_gate", (time.perf_counter() - t0) * 1000.0)

    # procedure bias loop
    t0 = time.perf_counter()
    if hasattr(agent, "action_history") and agent.action_history:
        for p in getattr(agent, "procedures", []):
            if p.trigger_season == season:
                pass
    record_sub("eval_procedure_bias", (time.perf_counter() - t0) * 1000.0)

    # 17-action scoring loop (drive mods + get_predictor_context per action)
    t0 = time.perf_counter()
    drive_mods = _compute_drive_mod(agent)
    action_names_17 = [
        "Resting","Drinking","Eating","Exploring","Building Shelter",
        "Sheltering","Reproduce","Store Food","Store Water",
        "Share Food","Share Water","Drink Stored Water","Eat Stored Food",
        "Deposit Food","Deposit Water","Withdraw Food","Withdraw Water",
    ]
    for aname in action_names_17:
        _ = drive_mods.get(aname, 1.0)
        try:
            _get_predictor_context(agent, aname, agent.location, world)
        except Exception:
            pass
    record_sub("eval_action_loop", (time.perf_counter() - t0) * 1000.0)

    # sort + resting-lock + winner selection
    t0 = time.perf_counter()
    dummy = [(float(i), i) for i in range(17)]
    dummy.sort(key=lambda a: a[0], reverse=True)
    record_sub("eval_sort_and_select", (time.perf_counter() - t0) * 1000.0)

    # post-selection telemetry / queue fill
    t0 = time.perf_counter()
    q = []; q.clear(); q.append(("Resting", None))
    record_sub("eval_post_selection", (time.perf_counter() - t0) * 1000.0)


def profiled_evaluate_utility(agent, world, *args, **kwargs):
    global in_evaluate_utility_flag
    in_evaluate_utility_flag = True
    t0 = time.perf_counter()
    res = _orig_evaluate_utility(agent, world, *args, **kwargs)
    ms = (time.perf_counter() - t0) * 1000.0
    in_evaluate_utility_flag = False
    record_sub("evaluate_utility", ms)
    try:
        _shadow_evaluate_utility(agent, world, *args, **kwargs)
    except Exception:
        pass
    return res
sim_mod.evaluate_utility = profiled_evaluate_utility



_orig_perceive = sim_mod.perceive
def profiled_perceive(agent, world, *args, **kwargs):
    global in_perceive_flag
    in_perceive_flag = True
    t0 = time.perf_counter()
    res = _orig_perceive(agent, world, *args, **kwargs)
    ms = (time.perf_counter() - t0) * 1000.0
    in_perceive_flag = False
    record_sub("perceive", ms)
    return res
sim_mod.perceive = profiled_perceive

# 2. Patch sub-functions called inside simulate_agent_tick
sim_mod.step_toward = profile_wrapper("step_toward", sim_mod.step_toward)
sim_mod.update_agent_needs = profile_wrapper("update_agent_needs", sim_mod.update_agent_needs)
sim_mod.update_biological_drives = profile_wrapper("update_biological_drives", sim_mod.update_biological_drives)
sim_mod.update_emotional_drives = profile_wrapper("update_emotional_drives", sim_mod.update_emotional_drives)
sim_mod.update_relationships = profile_wrapper("update_relationships", sim_mod.update_relationships)
sim_mod.update_adaptive_motivations = profile_wrapper("update_adaptive_motivations", sim_mod.update_adaptive_motivations)
sim_mod._run_survival_reflexes = profile_wrapper("_run_survival_reflexes", sim_mod._run_survival_reflexes)

# 3. Patch dec_mod helpers that are called by evaluate_utility
dec_mod.calculate_danger_penalty = profile_wrapper("eval_danger_penalty", dec_mod.calculate_danger_penalty)
dec_mod.get_environmental_modulation = profile_wrapper("eval_env_modulation", dec_mod.get_environmental_modulation)

_orig_compute_drive_modulation = dec_mod.compute_drive_modulation
def profiled_compute_drive_modulation(agent):
    t0 = time.perf_counter()
    res = _orig_compute_drive_modulation(agent)
    ms = (time.perf_counter() - t0) * 1000.0
    if in_evaluate_utility_flag:
        record_sub("eval_compute_drive_modulation", ms)
    else:
        record_sub("compute_drive_modulation_other", ms)
    return res
dec_mod.compute_drive_modulation = profiled_compute_drive_modulation

# 4. Patch Agent memory methods to separate lookup context and measure linear duplicate scan
def profiled_add_memory(self, mem_type: str, location: tuple, tick: int, importance: float, associated_id: int = -1, outcome: str = "neutral"):
    # Sub-timer 1: Dynamic importance computation
    t0 = time.perf_counter()
    if getattr(self, "ablation", {}).get("memory_importance", True):
        try:
            from world.agents.drives import compute_memory_importance
            is_first = True
            if mem_type == WATER:
                is_first = (location not in self.knowledge.water_sources)
            elif mem_type == FOOD:
                is_first = (location not in self.knowledge.food_sources)
            elif mem_type == PERSON:
                is_first = (associated_id >= 0 and associated_id not in self.known_agents)
            
            near_death = (self.health < 30.0)
            arousal = self.drives.arousal if hasattr(self, "drives") else 0.0
            
            dynamic_importance = compute_memory_importance(
                agent=self,
                mem_type=mem_type,
                outcome=outcome,
                near_death=near_death,
                is_first_encounter=is_first,
                emotional_intensity=arousal
            )
            importance = dynamic_importance
        except Exception:
            pass
    t_importance = time.perf_counter() - t0
    if in_perceive_flag:
        record_sub("add_mem_dynamic_importance", t_importance * 1000.0)

    # Sub-timer 2: Duplicate linear scan loop
    t0 = time.perf_counter()
    existing_mem = None
    for idx_m, m in enumerate(self.episodic_memory):
        if m.type == mem_type and m.location == location and m.associated_id == associated_id:
            existing_mem = m
            self.episodic_memory.pop(idx_m)
            break
    t_dup_scan = time.perf_counter() - t0
    if in_perceive_flag:
        record_sub("add_mem_duplicate_scan", t_dup_scan * 1000.0)

    # Sub-timer 3: Insertion / Pruning
    t0 = time.perf_counter()
    from world.agents.agent import Memory
    if existing_mem is not None:
        existing_mem.timestamp = tick
        existing_mem.importance = max(existing_mem.importance, importance)
        existing_mem.confidence = 1.0
        existing_mem.outcome = outcome
        self.episodic_memory.append(existing_mem)
    else:
        mem = Memory(
            type=mem_type, location=location,
            timestamp=tick, importance=importance, confidence=1.0,
            associated_id=associated_id, outcome=outcome,
        )
        self.episodic_memory.append(mem)

        if len(self.episodic_memory) > 200:
            self.episodic_memory.sort(key=lambda m: (m.importance, m.timestamp))
            self.episodic_memory.pop(0)
    t_insert_prune = time.perf_counter() - t0
    if in_perceive_flag:
        record_sub("add_mem_insert_prune", t_insert_prune * 1000.0)

    # Sub-timer 4: Generalized knowledge upserts
    t0 = time.perf_counter()
    season_id = (tick % 360) // 90
    if mem_type == WATER:
        if location not in self.knowledge.water_sources:
            self.nodes_added_count += 1
            self.knowledge.water_sources[location] = {
                "confidence": 1.0, "last_seen_tick": tick,
                "season_seen": season_id,
                "active_seasons": {0: 0, 1: 0, 2: 0, 3: 0},
                "dry_seasons":    {0: 0, 1: 0, 2: 0, 3: 0},
            }
        node = self.knowledge.water_sources[location]
        node["confidence"]     = 1.0
        node["last_seen_tick"] = tick
        node["season_seen"]    = season_id
        node.setdefault("active_seasons", {0: 0, 1: 0, 2: 0, 3: 0})[season_id] += 1
        node.setdefault("dry_seasons",    {0: 0, 1: 0, 2: 0, 3: 0})

    elif mem_type == FOOD:
        if location not in self.knowledge.food_sources:
            self.nodes_added_count += 1
            self.knowledge.food_sources[location] = {
                "confidence": 1.0, "last_seen_tick": tick,
                "season_seen": season_id,
                "active_seasons": {0: 0, 1: 0, 2: 0, 3: 0},
                "dry_seasons":    {0: 0, 1: 0, 2: 0, 3: 0},
            }
        node = self.knowledge.food_sources[location]
        node["confidence"]     = 1.0
        node["last_seen_tick"] = tick
        node["season_seen"]    = season_id
        node.setdefault("active_seasons", {0: 0, 1: 0, 2: 0, 3: 0})[season_id] += 1
        node.setdefault("dry_seasons",    {0: 0, 1: 0, 2: 0, 3: 0})

    elif mem_type == DANGER:
        self.knowledge.danger_locations[location] = 1.0
    t_knowledge_upsert = time.perf_counter() - t0
    if in_perceive_flag:
        record_sub("add_mem_knowledge_upsert", t_knowledge_upsert * 1000.0)

    # Accumulate total add_memory sum for verify prints
    if in_perceive_flag:
        record_sub("add_memory_in_perceive", (t_importance + t_dup_scan + t_insert_prune + t_knowledge_upsert) * 1000.0)
    else:
        record_sub("add_memory_other", (t_importance + t_dup_scan + t_insert_prune + t_knowledge_upsert) * 1000.0)
Agent.add_memory = profiled_add_memory

# 4b. Patch Agent get_social_modifier to measure linear memory scans in utility evaluations
_orig_get_social_modifier = Agent.get_social_modifier
def profiled_get_social_modifier(self, other_id: int, current_tick: int):
    t0 = time.perf_counter()
    res = _orig_get_social_modifier(self, other_id, current_tick)
    ms = (time.perf_counter() - t0) * 1000.0
    if in_evaluate_utility_flag:
        record_sub("eval_get_social_modifier", ms)
    else:
        record_sub("get_social_modifier_other", ms)
    return res
Agent.get_social_modifier = profiled_get_social_modifier

# 5. Patch WorldState spatial grid queries to separate caller context
_orig_query_agents = WorldState.query_agents
def profiled_query_agents(self, *args, **kwargs):
    t0 = time.perf_counter()
    res = _orig_query_agents(self, *args, **kwargs)
    ms = (time.perf_counter() - t0) * 1000.0
    if in_perceive_flag:
        record_sub("perceive_query_agents", ms)
    else:
        record_sub("query_agents_other", ms)
    return res
WorldState.query_agents = profiled_query_agents

# 6. Patch Predictor methods to separate caller context
_orig_predict = Predictor.predict
def profiled_predict(self, *args, **kwargs):
    t0 = time.perf_counter()
    res = _orig_predict(self, *args, **kwargs)
    ms = (time.perf_counter() - t0) * 1000.0
    if in_evaluate_utility_flag:
        record_sub("predictor_predict_in_eval", ms)
    else:
        record_sub("predictor_predict_in_tick", ms)
    return res
Predictor.predict = profiled_predict

_orig_train = Predictor.train
Predictor.train = profile_wrapper("predictor_train", Predictor.train)

# 7. Monkey-patch global NumPy operations to capture internal mathematical routines
_orig_argwhere = np.argwhere
def profiled_argwhere(*args, **kwargs):
    if in_perceive_flag:
        t0 = time.perf_counter()
        res = _orig_argwhere(*args, **kwargs)
        record_sub("perceive_np_argwhere", (time.perf_counter() - t0) * 1000.0)
        return res
    return _orig_argwhere(*args, **kwargs)
np.argwhere = profiled_argwhere

_orig_sum = np.sum
def profiled_sum(*args, **kwargs):
    if in_perceive_flag:
        t0 = time.perf_counter()
        res = _orig_sum(*args, **kwargs)
        record_sub("perceive_np_closest_dists", (time.perf_counter() - t0) * 1000.0)
        return res
    return _orig_sum(*args, **kwargs)
np.sum = profiled_sum

_orig_sqrt = np.sqrt
def profiled_sqrt(*args, **kwargs):
    if in_evaluate_utility_flag:
        t0 = time.perf_counter()
        res = _orig_sqrt(*args, **kwargs)
        record_sub("eval_np_sqrt_dists", (time.perf_counter() - t0) * 1000.0)
        return res
    return _orig_sqrt(*args, **kwargs)
np.sqrt = profiled_sqrt

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 3  Profiler data structures (Tick-level)
# ─────────────────────────────────────────────────────────────────────────────
SECTIONS = [
    "spatial_grid_rebuild",   # build bin spatial grid every tick
    "shelter_weathering",     # shelter durability decay loop every tick
    "ecology_climate",        # ClimateEngine.tick() every tick
    "ecology_arrays",         # seasonal NumPy array multiply (every 30 ticks)
    "agent_loop_total",       # full per-agent simulate_agent_tick() loop
    "reproduction_pass",      # mate-finding and child creation
    "alive_scan_1",           # sum(not a.dead for a in world.agents) — line 1522
    "colony_extinction_chk",  # colony alive check (every 100 ticks or on birth)
    "alive_scan_2",           # sum(not a.dead for a in world.agents) — line 1666
    "milestone_checks",       # generation max / milestone flag tests
    "resource_timeline",      # 500-tick snapshot incl. O(n^2) trust loop
    "path_history_append",    # sampled_path_history.append() every 10 ticks
    "epoch_stats",            # per-epoch statistics snapshot
    "perf_log_write",         # performance_log.csv write (every 10k ticks)
    "live_callback",          # live dashboard callback (no-op in benchmark)
    "total_tick",             # full tick wall-clock (ground truth)
]

prof = {s: {"calls": 0, "total_ms": 0.0, "max_ms": 0.0, "worst_tick": 0}
        for s in SECTIONS}

def record(key, ms, tick):
    p = prof[key]
    p["calls"]    += 1
    p["total_ms"] += ms
    if ms > p["max_ms"]:
        p["max_ms"]     = ms
        p["worst_tick"] = tick

tick_rows = []  # per-tick CSV rows

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 4  Colony spawn
# ─────────────────────────────────────────────────────────────────────────────
print("  Spawning colonies...")

spots = predict_settlements(world, count=4)
if len(spots) < 4:
    spots = predict_settlements(world, count=4, exclusion_radius=20.0)

world.colonies         = []
world.alive_agents     = []
world.alive_agents_map = {}
world.next_agent_id    = 0
agent_list             = []

for i in range(min(4, len(spots))):
    colony_name = COLONY_NAMES[i]
    spot_num    = world.colony_spawn_locations.get(colony_name, i + 1)
    spot_idx    = np.clip(spot_num - 1, 0, len(spots) - 1)
    spot        = spots[spot_idx]
    colony = {
        "id":           i,
        "name":         colony_name,
        "color":        COLONY_COLORS[i],
        "founder_ids":  [],
        "stored_food":  0.0,
        "stored_water": 0.0,
    }
    for _ in range(AGENTS_PER_COL):
        genome = create_genome()
        brain  = express_genome(genome)
        agent  = Agent(agent_id=world.next_agent_id,
                       location=(spot["y"], spot["x"]), genome=genome)
        start_age      = float(np.random.uniform(20, 40))
        agent.age      = int(start_age * 360)
        base_max_age   = int(max(start_age + 15.0, np.random.normal(70, 10)) * 360)
        agent.max_age  = max(20 * 360, base_max_age + brain["max_age_offset"])
        agent.colony_id    = i
        agent.generation   = 0
        agent.parent_ids   = None
        agent.born_tick    = 0
        agent.sampled_path_history = [
            [int(spot["x"]), int(spot["y"]), 0,
             float(agent.health), float(agent.hunger),
             float(agent.thirst), float(agent.energy), 0]
        ]
        colony["founder_ids"].append(world.next_agent_id)
        world.next_agent_id += 1
        agent_list.append(agent)
    world.colonies.append(colony)

world.agents            = agent_list
world.alive_agents      = list(agent_list)
world.alive_agents_map  = {a.id: a for a in agent_list}
world.tick              = 0
world.total_births      = 0
world.total_deaths      = 0
world.generation_number = 0
world.history           = []
world.events_timeline   = []
world.extinction_events = []
world.population_history= []
world.genetic_history   = []
world.shelters          = {}
world._disputes_this_tick = set()

print(f"  Spawned {len(world.agents)} agents across {len(world.colonies)} colonies.")
print()

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 5  Main benchmark loop
# ─────────────────────────────────────────────────────────────────────────────
w       = world.width   # 1024
bin_size = 32
grid_w  = w // bin_size
grid_h  = world.height // bin_size
sample_interval = 500   # epoch stats interval for benchmark
prev_discoveries_sum   = 0
prev_nodes_added_sum   = 0
prev_nodes_removed_sum = 0

print("  Starting benchmark loop...")
print(f"  {'Tick':>6}  {'Alive':>5}  {'Total':>6}  "
      f"{'ms/tick':>8}  {'agent_loop':>10}  {'spatial_grid':>12}  "
      f"{'both_scans':>10}  {'path_hist':>9}  {'repro':>7}")
print("  " + "-" * 82)

run_start = time.perf_counter()

from world.agents.simulation import ACTION_TO_ID, attempt_reproduce, population_diversity

for _iter in range(BENCHMARK_TICKS):
    t_tick_start = time.perf_counter()
    world.tick += 1
    tick = world.tick
    world.temp_cos_factor = float(
        np.cos((((tick % 360) - 180.0) / 180.0) * np.pi)
    )
    world._disputes_this_tick = set()
    day  = tick % 360

    # ── STEP-DOWN POPULATION PRUNING FOR CLEAN SCALING CURVE ────────────────
    # We prune the population at fixed intervals to get clean buckets of data
    if tick == 400:
        to_kill = np.random.choice(world.alive_agents, max(0, len(world.alive_agents) - 150), replace=False)
        for a in to_kill:
            a.dead = True
            a.primary_cause = "Benchmark Pruning"
            if a in world.alive_agents: world.alive_agents.remove(a)
            if a.id in world.alive_agents_map: del world.alive_agents_map[a.id]
        print(f"\n  [PRUNING] Tick {tick}: Pruned population to {len(world.alive_agents)} agents.")
    elif tick == 800:
        to_kill = np.random.choice(world.alive_agents, max(0, len(world.alive_agents) - 100), replace=False)
        for a in to_kill:
            a.dead = True
            a.primary_cause = "Benchmark Pruning"
            if a in world.alive_agents: world.alive_agents.remove(a)
            if a.id in world.alive_agents_map: del world.alive_agents_map[a.id]
        print(f"\n  [PRUNING] Tick {tick}: Pruned population to {len(world.alive_agents)} agents.")
    elif tick == 1200:
        to_kill = np.random.choice(world.alive_agents, max(0, len(world.alive_agents) - 50), replace=False)
        for a in to_kill:
            a.dead = True
            a.primary_cause = "Benchmark Pruning"
            if a in world.alive_agents: world.alive_agents.remove(a)
            if a.id in world.alive_agents_map: del world.alive_agents_map[a.id]
        print(f"\n  [PRUNING] Tick {tick}: Pruned population to {len(world.alive_agents)} agents.")
    elif tick == 1600:
        to_kill = np.random.choice(world.alive_agents, max(0, len(world.alive_agents) - 20), replace=False)
        for a in to_kill:
            a.dead = True
            a.primary_cause = "Benchmark Pruning"
            if a in world.alive_agents: world.alive_agents.remove(a)
            if a.id in world.alive_agents_map: del world.alive_agents_map[a.id]
        print(f"\n  [PRUNING] Tick {tick}: Pruned population to {len(world.alive_agents)} agents.")

    # ── SPATIAL GRID REBUILD ─────────────────────────────────────────────────
    t0 = time.perf_counter()
    spatial_grid = [[[] for _ in range(grid_w)] for _ in range(grid_h)]
    for agent in world.alive_agents:
        bx = min(grid_w - 1, max(0, agent.location[1] // bin_size))
        by = min(grid_h - 1, max(0, agent.location[0] // bin_size))
        spatial_grid[by][bx].append(agent)
    world.spatial_grid = spatial_grid
    record("spatial_grid_rebuild", (time.perf_counter() - t0) * 1000, tick)

    # ── SHELTER WEATHERING ───────────────────────────────────────────────────
    t0 = time.perf_counter()
    if world.shelters:
        to_remove = []
        for loc, sh in list(world.shelters.items()):
            sh["durability"] -= 0.1
            owner_id = sh.get("owner_id")
            owner_agent = world.alive_agents_map.get(owner_id) if owner_id is not None else None
            if owner_agent is not None:
                owner_agent.shelter_durability = max(0.0, sh["durability"])
            else:
                sh["owner_id"] = None
            if sh["durability"] <= 0.0:
                to_remove.append(loc)
                if owner_agent is not None:
                    owner_agent.shelter_location  = None
                    owner_agent.shelter_level      = 0
                    owner_agent.shelter_durability = 0.0
        for loc in to_remove:
            world.shelters.pop(loc, None)
    record("shelter_weathering", (time.perf_counter() - t0) * 1000, tick)

    # ── ECOLOGY: CLIMATE ENGINE ──────────────────────────────────────────────
    t0 = time.perf_counter()
    temp_off, water_m, food_m, seasonal_m = engine.tick(tick)
    world.global_temp_offset         = temp_off
    world.global_water_multiplier    = water_m
    world.global_food_multiplier     = food_m
    world.global_seasonal_multiplier = seasonal_m
    world.climate_epoch_state        = engine.save_state()
    record("ecology_climate", (time.perf_counter() - t0) * 1000, tick)

    # ── ECOLOGY: SEASONAL NUMPY ARRAYS (every 30 ticks) ─────────────────────
    t0 = time.perf_counter()
    if tick % 30 == 1 or _iter == 0:
        seasonal_mult       = getattr(world, "global_seasonal_multiplier", 1.0)
        g_seasonal_factor   = 0.65 + (0.35 * seasonal_mult) * np.cos(
            ((day - 180.0) / 180.0) * np.pi)
        local_factor        = g_seasonal_factor * (0.7 + 0.6 * world.seasonal_noise)
        food_mult           = getattr(world, "global_food_multiplier", 1.0)
        water_mult          = getattr(world, "global_water_multiplier", 1.0)
        world.wildlife      = np.clip(world.base_wildlife  * local_factor * food_mult,  0.0, 1.0)
        world.fertility     = np.clip(world.base_fertility * local_factor * food_mult,  0.0, 1.0)
        world.river_map     = world.base_river_map * local_factor * water_mult
        world.lake_map      = world.base_lake_map  * water_mult
    record("ecology_arrays", (time.perf_counter() - t0) * 1000, tick)

    # ── AGENT LOOP ───────────────────────────────────────────────────────────
    t0 = time.perf_counter()
    for agent in list(world.alive_agents):
        if not agent.dead:
            simulate_agent_tick(agent, world)
            if agent.dead:
                if agent in world.alive_agents:
                    world.alive_agents.remove(agent)
                if agent.id in world.alive_agents_map:
                    del world.alive_agents_map[agent.id]
                world.total_deaths = getattr(world, "total_deaths", 0) + 1
    record("agent_loop_total", (time.perf_counter() - t0) * 1000, tick)

    # ── REPRODUCTION PASS ────────────────────────────────────────────────────
    t0 = time.perf_counter()
    reproduced_ids = set()
    new_agents     = []
    if world.reproduction_enabled and len(world.alive_agents) < world.max_population:
        for agent in world.alive_agents:
            if agent.id in reproduced_ids:
                continue
            target_loc = getattr(agent, "_wants_to_reproduce_with", None)
            if target_loc is None:
                continue
            agent._wants_to_reproduce_with = None
            candidates = world.query_agents(target_loc, 1.0, alive_only=True)
            mate = next(
                (a for a in candidates
                 if a.id != agent.id
                 and a.id not in reproduced_ids
                 and getattr(a, "colony_id", -1) == getattr(agent, "colony_id", -1)
                 and a.location == target_loc
                 and getattr(a, "_wants_to_reproduce_with", None) is not None),
                None,
            )
            if mate is not None:
                mate._wants_to_reproduce_with = None
                child = attempt_reproduce(agent, mate, world, world.next_agent_id,
                                          mutation_rate=world.mutation_rate)
                if child is not None:
                    new_agents.append(child)
                    world.next_agent_id += 1
                    world.total_births  += 1
                reproduced_ids.add(agent.id)
                reproduced_ids.add(mate.id)
        for child in new_agents:
            world.agents.append(child)
            world.alive_agents.append(child)
            world.alive_agents_map[child.id] = child
    record("reproduction_pass", (time.perf_counter() - t0) * 1000, tick)

    # ── ALIVE SCAN 1 (mirrors simulation.py line 1522) ───────────────────────
    t0 = time.perf_counter()
    alive_count = sum(1 for a in world.agents if not a.dead)
    record("alive_scan_1", (time.perf_counter() - t0) * 1000, tick)

    # ── COLONY EXTINCTION CHECK (mirrors simulation.py line 1606-1640) ───────
    t0 = time.perf_counter()
    if new_agents or tick % 100 == 0:
        colony_alive = {c["id"]: 0 for c in world.colonies}
        for a in world.agents:
            if not a.dead and getattr(a, "life_stage", "Adult") in ("Adult", "Elder"):
                cid = getattr(a, "colony_id", -1)
                if cid in colony_alive:
                    colony_alive[cid] += 1
    record("colony_extinction_chk", (time.perf_counter() - t0) * 1000, tick)

    # ── ALIVE SCAN 2 (mirrors simulation.py line 1666) ───────────────────────
    t0 = time.perf_counter()
    alive_now = sum(1 for a in world.agents if not a.dead)
    record("alive_scan_2", (time.perf_counter() - t0) * 1000, tick)

    # ── MILESTONE CHECKS ─────────────────────────────────────────────────────
    t0 = time.perf_counter()
    current_max_gen = max((a.generation for a in world.agents), default=0)
    world.generation_number = max(world.generation_number, current_max_gen)
    record("milestone_checks", (time.perf_counter() - t0) * 1000, tick)

    # ── RESOURCE TIMELINE (every 500 ticks — includes O(n^2) trust loop) ─────
    t0 = time.perf_counter()
    if tick % 500 == 0 or tick == 1:
        living  = [a for a in world.agents if not a.dead]
        # O(n^2) pairwise trust
        trust_sum   = 0.0
        trust_count = 0
        for i, a in enumerate(living):
            for b in living[i + 1:]:
                trust_sum   += a.get_social_modifier(b.id, tick)
                trust_count += 1
        avg_trust = trust_sum / max(1, trust_count)
    record("resource_timeline", (time.perf_counter() - t0) * 1000, tick)

    # ── PATH HISTORY APPEND (every 10 ticks, all alive agents) ───────────────
    t0 = time.perf_counter()
    if tick % 10 == 0:
        for agent in world.agents:
            if not agent.dead:
                action_id = ACTION_TO_ID.get(
                    getattr(agent, "current_action", "Idle"), 0
                )
                agent.sampled_path_history.append([
                    int(agent.location[1]),
                    int(agent.location[0]),
                    int(action_id),
                    round(float(agent.health), 1),
                    round(float(agent.hunger), 1),
                    round(float(agent.thirst), 1),
                    round(float(agent.energy), 1),
                    int(agent.generation),
                ])
    record("path_history_append", (time.perf_counter() - t0) * 1000, tick)

    # ── EPOCH STATS SNAPSHOT (every sample_interval ticks) ───────────────────
    t0 = time.perf_counter()
    if tick % sample_interval == 0:
        alive_agents_ep = [a for a in world.agents if not a.dead]
        if len(alive_agents_ep) >= 2:
            living_genomes = [a.genome for a in alive_agents_ep]
            _ = population_diversity(living_genomes)
        prev_discoveries_sum = sum(a.discoveries_count for a in world.agents)
    record("epoch_stats", (time.perf_counter() - t0) * 1000, tick)

    # ── PERF LOG WRITE ───────────────────────────────────────────────────────
    t0 = time.perf_counter()
    record("perf_log_write", (time.perf_counter() - t0) * 1000, tick)

    # ── LIVE CALLBACK ────────────────────────────────────────────────────────
    t0 = time.perf_counter()
    record("live_callback", (time.perf_counter() - t0) * 1000, tick)

    # ── TOTAL TICK ────────────────────────────────────────────────────────────
    t_tick_total = (time.perf_counter() - t_tick_start) * 1000
    record("total_tick", t_tick_total, tick)

    # ── Per-tick CSV row ──────────────────────────────────────────────────────
    tick_rows.append({
        "tick":         tick,
        "alive":        alive_count,
        "total_agents": len(world.agents),
        "total_ms":     round(t_tick_total, 3),
    })

    # ── Live print every REPORT_INTERVAL ─────────────────────────────────────
    if tick % REPORT_INTERVAL == 0:
        def avg(k):
            p = prof[k]
            return p["total_ms"] / max(p["calls"], 1)

        print(f"  {tick:>6}  {alive_count:>5}  {len(world.agents):>6}  "
              f"{avg('total_tick'):>8.2f}  {avg('agent_loop_total'):>10.2f}  "
              f"{avg('spatial_grid_rebuild'):>12.3f}  "
              f"{avg('alive_scan_1')+avg('alive_scan_2'):>10.3f}  "
              f"{avg('path_history_append'):>9.3f}  "
              f"{avg('reproduction_pass'):>7.3f}")

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 6  Final Report
# ─────────────────────────────────────────────────────────────────────────────
total_wall    = time.perf_counter() - run_start
total_ms_avg  = prof["total_tick"]["total_ms"] / max(prof["total_tick"]["calls"], 1)

print()
print("=" * 80)
print("  PROJECT GENESIS — Performance Observatory: Final Report")
print(f"  {BENCHMARK_TICKS} ticks | {total_wall:.1f}s wall | {total_ms_avg:.2f} ms/tick avg")
print("=" * 80)
print()

print("  ── Part 1: Tick-Level Subsystems ──")
print(f"  {'Section':<25}  {'Calls':>6}  {'Avg/call (ms)':>13}  "
      f"{'Max (ms)':>9}  {'% of tick':>9}  {'WrstTick':>8}")
print("  " + "-" * 76)
rows_sorted = sorted(
    [(k, v) for k, v in prof.items() if k != "total_tick"],
    key=lambda x: (x[1]["total_ms"] / max(x[1]["calls"], 1)),
    reverse=True,
)
for key, v in rows_sorted:
    calls = v["calls"]
    avg   = v["total_ms"] / max(calls, 1)
    pct   = (avg / total_ms_avg * 100) if total_ms_avg > 0 else 0
    print(f"  {key:<25}  {calls:>6}  {avg:>13.4f}  "
          f"{v['max_ms']:>9.4f}  {pct:>8.1f}%  {v['worst_tick']:>8}")
print("  " + "-" * 76)
print(f"  {'TOTAL (wall avg)':<25}  {'':>6}  {total_ms_avg:>13.4f}  "
      f"{'':>9}  {'100.0':>8}%")
print()

# ── Part 2: Sub-profiler inside simulate_agent_tick() ─────────────────────────
agent_loop_calls    = prof["agent_loop_total"]["calls"]
agent_loop_avg      = prof["agent_loop_total"]["total_ms"] / max(agent_loop_calls, 1)
sub_total_ms_sum    = sum(v["total_ms"] for k, v in sub_prof.items() if k in ("perceive", "evaluate_utility", "step_toward", "update_agent_needs", "update_biological_drives", "update_emotional_drives", "update_relationships", "update_adaptive_motivations", "_run_survival_reflexes", "predictor_train"))
sub_avg_total       = sub_total_ms_sum / max(agent_loop_calls, 1)
unaccounted_loop    = max(0.0, agent_loop_avg - sub_avg_total)
unaccounted_pct     = (unaccounted_loop / agent_loop_avg * 100) if agent_loop_avg > 0 else 0

print("  ── Part 2: Inside simulate_agent_tick() Breakdown ──")
print(f"  {'Function':<28}  {'Calls':>8}  {'Avg/call (ms)':>13}  "
      f"{'Max (ms)':>9}  {'% of agent_loop':>15}")
print("  " + "-" * 78)
sub_keys_to_show = ["perceive", "evaluate_utility", "step_toward", "update_agent_needs", "update_biological_drives", "update_emotional_drives", "update_relationships", "update_adaptive_motivations", "_run_survival_reflexes", "predictor_train"]
sub_sorted = sorted(
    [(k, v) for k, v in sub_prof.items() if k in sub_keys_to_show],
    key=lambda x: x[1]["total_ms"],
    reverse=True
)
for key, v in sub_sorted:
    calls = v["calls"]
    avg   = v["total_ms"] / max(calls, 1)
    pct   = (v["total_ms"] / max(prof["agent_loop_total"]["total_ms"], 1.0) * 100)
    print(f"  {key:<28}  {calls:>8}  {avg:>13.4f}  "
          f"{v['max_ms']:>9.4f}  {pct:>14.1f}%")
print("  " + "-" * 78)
print(f"  {'unaccounted_loop_overhead':<28}  {'':>8}  {unaccounted_loop:>13.4f}  "
      f"{'':>9}  {unaccounted_pct:>14.1f}%")
print(f"  {'TOTAL simulate_agent_tick()':<28}  {'':>8}  {agent_loop_avg:>13.4f}  "
      f"{'':>9}  {'100.0':>14}%")
print()

# ── Part 2b: Detailed perceive() breakdown ──
perc_calls = sub_prof["perceive"]["calls"]
perc_total_ms = sub_prof["perceive"]["total_ms"]
sub_perc_keys = ["add_memory_in_perceive", "perceive_query_agents", "perceive_np_argwhere", "perceive_np_closest_dists"]
sub_perc_sum = sum(sub_prof[k]["total_ms"] for k in sub_perc_keys)
perc_unaccounted = max(0.0, perc_total_ms - sub_perc_sum)

print("  ── Part 2b: Detailed perceive() Sub-Operation Breakdown ──")
print(f"  {'Sub-Operation':<28}  {'Calls':>8}  {'Avg/call (ms)':>13}  "
      f"{'Max (ms)':>9}  {'% of perceive':>15}")
print("  " + "-" * 78)
for k in sub_perc_keys:
    v = sub_prof[k]
    if k == "add_memory_in_perceive":
        # Print sub-details of add_memory
        calls = v["calls"]
        avg = v["total_ms"] / max(calls, 1)
        pct = (v["total_ms"] / max(perc_total_ms, 1.0) * 100)
        print(f"  {k:<28}  {calls:>8}  {avg:>13.4f}  "
              f"{v['max_ms']:>9.4f}  {pct:>14.1f}%")
        
        # Sub-breakdown of add_memory internals
        for sub_k in ["add_mem_dynamic_importance", "add_mem_duplicate_scan", "add_mem_insert_prune", "add_mem_knowledge_upsert"]:
            sub_v = sub_prof[sub_k]
            sub_calls = sub_v["calls"]
            sub_avg = sub_v["total_ms"] / max(sub_calls, 1)
            sub_pct = (sub_v["total_ms"] / max(v["total_ms"], 1.0) * 100)
            print(f"    ├─ {sub_k:<26}  {sub_calls:>8}  {sub_avg:>13.4f}  "
                  f"{sub_v['max_ms']:>9.4f}  {sub_pct:>13.1f}% (of add_mem)")
    else:
        calls = v["calls"]
        avg = v["total_ms"] / max(calls, 1)
        pct = (v["total_ms"] / max(perc_total_ms, 1.0) * 100)
        print(f"  {k:<28}  {calls:>8}  {avg:>13.4f}  "
              f"{v['max_ms']:>9.4f}  {pct:>14.1f}%")
print("  " + "-" * 78)
print(f"  {'numpy_views_and_slicing_other':<28}  {'':>8}  {perc_unaccounted/max(perc_calls, 1):>13.4f}  "
      f"{'':>9}  {(perc_unaccounted/max(perc_total_ms, 1.0)*100):>14.1f}%")
print(f"  {'TOTAL perceive()':<28}  {'':>8}  {perc_total_ms/max(perc_calls, 1):>13.4f}  "
      f"{'':>9}  {'100.0':>14}%")
print()

# ── Part 2c: Detailed evaluate_utility() breakdown ──
eval_calls = sub_prof["evaluate_utility"]["calls"]
eval_total_ms = sub_prof["evaluate_utility"]["total_ms"]

# Original 6 function-level wrappers (still valid)
sub_eval_func_keys = [
    "eval_danger_penalty", "eval_env_modulation", "eval_get_social_modifier",
    "eval_compute_drive_modulation", "predictor_predict_in_eval", "eval_np_sqrt_dists",
]
# 10 new shadow-pass block timers
sub_eval_shadow_keys = [
    "eval_scarcity_loop", "eval_decision_context",
    "eval_drink_candidate_rank", "eval_drink_top3_score",
    "eval_food_candidate_rank",  "eval_food_top3_score",
    "eval_explore_chunk_scan",   "eval_reproduce_gate",
    "eval_procedure_bias",       "eval_action_loop",
    "eval_sort_and_select",      "eval_post_selection",
]
sub_eval_func_sum = sum(sub_prof[k]["total_ms"] for k in sub_eval_func_keys)
sub_eval_shadow_sum = sum(sub_prof[k]["total_ms"] for k in sub_eval_shadow_keys)
eval_unaccounted = max(0.0, eval_total_ms - sub_eval_func_sum)

print("  ── Part 2c: evaluate_utility() — Function-Level Wrappers ──")
print(f"  {'Sub-Operation':<34}  {'Calls':>8}  {'Avg/call (ms)':>13}  "
      f"{'Max (ms)':>9}  {'% of eval_util':>14}")
print("  " + "-" * 85)
for k in sub_eval_func_keys:
    v = sub_prof[k]
    calls = v["calls"]
    avg = v["total_ms"] / max(calls, 1)
    pct = (v["total_ms"] / max(eval_total_ms, 1.0) * 100)
    print(f"  {k:<34}  {calls:>8}  {avg:>13.4f}  "
          f"{v['max_ms']:>9.4f}  {pct:>13.1f}%")
print("  " + "-" * 85)
print(f"  {'eval_deliberation_other (residual)':<34}  {'':>8}  {eval_unaccounted/max(eval_calls, 1):>13.4f}  "
      f"{'':>9}  {(eval_unaccounted/max(eval_total_ms, 1.0)*100):>13.1f}%")
print(f"  {'TOTAL evaluate_utility()':<34}  {'':>8}  {eval_total_ms/max(eval_calls, 1):>13.4f}  "
      f"{'':>9}  {'100.0':>13}%")
print()

print("  ── Part 2d: evaluate_utility() — Shadow Block Timers (Batch 2) ──")
print(f"  {'Block':<34}  {'Calls':>8}  {'Avg/call (ms)':>13}  "
      f"{'Max (ms)':>9}  {'% of shadow sum':>15}")
print("  " + "-" * 87)
for k in sub_eval_shadow_keys:
    v = sub_prof[k]
    calls = v["calls"]
    avg = v["total_ms"] / max(calls, 1)
    pct = (v["total_ms"] / max(sub_eval_shadow_sum, 1.0) * 100)
    print(f"  {k:<34}  {calls:>8}  {avg:>13.4f}  "
          f"{v['max_ms']:>9.4f}  {pct:>14.1f}%")
print("  " + "-" * 87)
print(f"  {'SHADOW TOTAL':<34}  {'':>8}  {sub_eval_shadow_sum/max(eval_calls, 1):>13.4f}  "
      f"{'':>9}  {'100.0':>14}%")
print(f"  (Shadow sum vs real eval_util: shadow={sub_eval_shadow_sum/max(eval_calls,1):.4f} ms/call,"
      f" real={eval_total_ms/max(eval_calls,1):.4f} ms/call)")
print()


# ── Part 3: Scaling table ─────────────────────────────────────────────────────
print("  ── Part 3: Alive Agents vs ms/tick Scaling Curve ──")
alive_buckets = collections.defaultdict(list)
for row in tick_rows:
    bucket = (row["alive"] // 10) * 10
    alive_buckets[bucket].append(row["total_ms"])
for bucket in sorted(alive_buckets.keys()):
    vals = alive_buckets[bucket]
    print(f"    {bucket:>3}–{bucket+9:<3} agents  "
          f"avg {np.mean(vals):>6.2f} ms  "
          f"p95 {np.percentile(vals, 95):>6.2f} ms  "
          f"({len(vals)} ticks)")

# ── Write CSV ─────────────────────────────────────────────────────────────────
csv_path = os.path.join(OUT_DIR, "ticks.csv")
with open(csv_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=tick_rows[0].keys())
    writer.writeheader()
    writer.writerows(tick_rows)

# ── Write JSON summary ────────────────────────────────────────────────────────
summary = {
    "benchmark_ticks":  BENCHMARK_TICKS,
    "wall_seconds":     round(total_wall, 2),
    "avg_ms_per_tick":  round(total_ms_avg, 3),
    "max_ms_per_tick":  prof["total_tick"]["max_ms"],
    "tick_subsystems": {
        k: {
            "calls":    v["calls"],
            "total_ms": round(v["total_ms"], 3),
            "avg_ms":   round(v["total_ms"] / max(v["calls"], 1), 4),
            "max_ms":   round(v["max_ms"], 4),
            "pct_of_tick": round(
                (v["total_ms"] / max(v["calls"], 1)) / max(total_ms_avg, 1) * 100, 2
            ),
            "worst_tick": v["worst_tick"],
        }
        for k, v in prof.items()
    },
    "agent_loop_subsystems": {
        k: {
            "calls":    v["calls"],
            "total_ms": round(v["total_ms"], 3),
            "avg_ms":   round(v["total_ms"] / max(v["calls"], 1), 4),
            "max_ms":   round(v["max_ms"], 4),
            "pct_of_loop": round(
                v["total_ms"] / max(prof["agent_loop_total"]["total_ms"], 1.0) * 100, 2
            )
        }
        for k, v in sub_prof.items()
    },
    "unaccounted_loop_ms": round(unaccounted_loop, 3),
    "unaccounted_loop_pct": round(unaccounted_pct, 1),
}
json_path = os.path.join(OUT_DIR, "summary.json")
with open(json_path, "w") as f:
    json.dump(summary, f, indent=2)

print()
print(f"  Tick CSV     → {csv_path}")
print(f"  Summary JSON → {json_path}")
print("=" * 80)
