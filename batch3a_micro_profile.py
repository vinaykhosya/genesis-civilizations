"""
batch3a_micro_profile.py
========================
Batch 3A — Targeted micro-profiler for get_predictor_context() and
get_environmental_modulation().

Goal: Break down the remaining ~35% of evaluate_utility() "other" into
named operations with measured costs.  No 2000-tick benchmark — just
tight loops with realistic inputs.

Usage:
    python batch3a_micro_profile.py

No changes to any simulation source file.  Read-only profiling pass.
"""

import sys, os, time, math
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

import numpy as np

# ─────────────────────────────────────────────────────────────────────────────
# 1. Build a realistic agent + world (minimal, no full generation needed)
# ─────────────────────────────────────────────────────────────────────────────
from world.agents.agent import Agent
from world.agents.genetics import neutral_genome

print("=" * 70)
print("  Batch 3A — get_predictor_context() + get_environmental_modulation()")
print("  Micro-profiler: tight loops, realistic inputs, per-operation timers")
print("=" * 70)
print()

# Build a minimal agent
g = neutral_genome()
agent = Agent(agent_id=1, location=(512, 512), genome=g)
agent.hunger   = 35.0
agent.thirst   = 60.0
agent.energy   = 70.0
agent.injury_level = 5.0
agent.stored_food  = 20.0
agent.stored_water = 10.0
agent.shelter_location = (500, 500)
agent.shelter_durability = 80.0
agent.reproduction_cooldown = 0
agent.prediction_confidence = 0.9

# Populate knowledge with realistic node counts (from benchmark: agents had
# ~30-50 water + food nodes by mid-run)
for i in range(40):
    loc = (512 + i*3, 512 + i*2)
    agent.knowledge.water_sources[loc] = {
        "confidence": 0.8, "last_seen_tick": 1000 + i,
        "season_seen": 0,
        "active_seasons": {0: 3, 1: 2, 2: 1, 3: 0},
        "dry_seasons":    {0: 0, 1: 1, 2: 2, 3: 3},
    }
for i in range(35):
    loc = (512 - i*2, 512 + i*4)
    agent.knowledge.food_sources[loc] = {
        "confidence": 0.7, "last_seen_tick": 900 + i,
        "season_seen": 1,
        "active_seasons": {0: 2, 1: 3, 2: 2, 3: 1},
        "dry_seasons":    {0: 1, 1: 0, 2: 1, 3: 2},
    }

# Minimal world stub
class MinimalWorld:
    def __init__(self):
        self.tick = 1234
        self.temp_cos_factor = float(np.cos(((1234 % 360 - 180.0) / 180.0) * np.pi))
        self.global_temp_offset = 0.0
        H, W = 1024, 1024
        self.biome       = np.zeros((H, W), dtype=np.int32)
        self.temperature = np.full((H, W), 22.0, dtype=np.float32)
        self.elevation   = np.full((H, W), 0.4,  dtype=np.float32)
        self.rainfall    = np.full((H, W), 800.0, dtype=np.float32)
        self.wildlife    = np.full((H, W), 0.5,  dtype=np.float32)
        self.fertility   = np.full((H, W), 0.4,  dtype=np.float32)
        self.lake_map    = np.zeros((H, W), dtype=np.float32)
        self.river_map   = np.zeros((H, W), dtype=np.float32)
        self.colonies    = [{"stored_food": 50.0, "stored_water": 30.0}]

world = MinimalWorld()
agent.colony_id = 0

# Pre-compute values the real code would have computed once
target_loc    = (520, 525)
action_name   = "Drinking"
local_temp    = 24.0
scarcity_pred = 0.35

REPS = 500_000
WARM = 5_000

def timer(label, fn, reps=REPS):
    """Run fn() reps times, return avg µs per call."""
    # warmup
    for _ in range(WARM):
        fn()
    t0 = time.perf_counter()
    for _ in range(reps):
        fn()
    elapsed = time.perf_counter() - t0
    avg_us = elapsed / reps * 1e6
    return avg_us

# ─────────────────────────────────────────────────────────────────────────────
# 2. Full function baseline
# ─────────────────────────────────────────────────────────────────────────────
from world.agents.decision import get_predictor_context, get_environmental_modulation

print("── Section A: Full function baselines ──")
print()

# A1: full get_predictor_context with all kwargs supplied (hot path)
t_full_hot = timer("full_gpc_hot",
    lambda: get_predictor_context(agent, action_name, target_loc, world,
                                   local_temp=local_temp,
                                   scarcity_prediction=scarcity_pred))
print(f"  get_predictor_context (local_temp + scarcity supplied): {t_full_hot:>8.2f} µs/call")

# A2: full get_predictor_context with nothing supplied (cold path — re-computes both)
t_full_cold = timer("full_gpc_cold",
    lambda: get_predictor_context(agent, action_name, target_loc, world))
print(f"  get_predictor_context (nothing supplied, full cold):     {t_full_cold:>8.2f} µs/call")

# A3: full get_environmental_modulation
t_full_env = timer("full_env_mod",
    lambda: get_environmental_modulation(agent, 520, 525, world))
print(f"  get_environmental_modulation:                            {t_full_env:>8.2f} µs/call")

print()

# ─────────────────────────────────────────────────────────────────────────────
# 3. Dissect get_predictor_context — every operation individually
# ─────────────────────────────────────────────────────────────────────────────
print("── Section B: get_predictor_context() internal operation timings ──")
print()

day   = world.tick % 360
season = day // 90
is_transition = (day % 90) >= 45
target_season = (season + 1) % 4 if is_transition else season
cy, cx = agent.location
ty, tx = target_loc

# B1: Seasonal math (lines 20-23)
def _seasonal_math():
    d  = world.tick % 360
    s  = d // 90
    it = (d % 90) >= 45
    ts = (s + 1) % 4 if it else s
t_b1 = timer("seasonal_math", _seasonal_math)
print(f"  B1  Seasonal math (mod, div, bool, ternary):    {t_b1:>8.2f} µs")

# B2: local_temp branch when NOT supplied — biome lookup + getattr + arithmetic (lines 26-46)
def _local_temp_compute():
    biome_id = int(world.biome[ty, tx])
    if biome_id == 6:       amplitude = 22.0
    elif biome_id in (1,2,3): amplitude = 18.0
    elif biome_id in (4,5): amplitude = 12.0
    elif biome_id in (0,8): amplitude = 6.0
    elif biome_id == 7:     amplitude = 4.0
    else:                   amplitude = 12.0
    bt = float(world.temperature[ty, tx])
    cf = getattr(world, "temp_cos_factor", None)
    if cf is None:
        cf = np.cos(((day - 180.0) / 180.0) * np.pi)
    tso = amplitude * cf
    go  = getattr(world, "global_temp_offset", 0.0)
    lt  = bt + tso + go
t_b2 = timer("local_temp_compute", _local_temp_compute)
print(f"  B2  local_temp branch (biome+getattr+arith):   {t_b2:>8.2f} µs  [skipped when kwarg supplied]")

# B3: Scarcity loop — iterate all knowledge nodes (lines 49-59)
def _scarcity_loop():
    ta = 0; to = 0
    for node in (list(agent.knowledge.water_sources.values()) +
                 list(agent.knowledge.food_sources.values())):
        ac = node.get("active_seasons", {}).get(target_season, 0)
        dc = node.get("dry_seasons",    {}).get(target_season, 0)
        ta += ac; to += (ac + dc)
    ab = ta / to if to > 0 else 0.8
    sp = 0.2 + (1.0 - ab - 0.2) * agent.prediction_confidence
t_b3 = timer("scarcity_loop", _scarcity_loop)
print(f"  B3  Scarcity loop ({len(agent.knowledge.water_sources)+len(agent.knowledge.food_sources)} nodes): "
      f"                   {t_b3:>8.2f} µs  [skipped when kwarg supplied]")

# B4: Colony lookup (lines 61-66)
def _colony_lookup():
    c_id = getattr(agent, "colony_id", -1)
    cf = 0.0; cw = 0.0
    if c_id >= 0 and c_id < len(world.colonies):
        cf = world.colonies[c_id].get("stored_food",  0.0)
        cw = world.colonies[c_id].get("stored_water", 0.0)
t_b4 = timer("colony_lookup", _colony_lookup)
print(f"  B4  Colony lookup (getattr+dict.get×2):         {t_b4:>8.2f} µs")

# B5: action_names list construction + .index() (lines 68-77) — THE SUSPECT
action_names_original = [
    "Resting", "Drinking", "Eating", "Exploring", "Building Shelter",
    "Sheltering", "Reproduce", "Store Food", "Store Water", "Share Food",
    "Share Water", "Drink Stored Water", "Eat Stored Food", "Deposit Food",
    "Deposit Water", "Withdraw Food", "Withdraw Water"
]
def _action_index_original():
    action_names = [
        "Resting", "Drinking", "Eating", "Exploring", "Building Shelter",
        "Sheltering", "Reproduce", "Store Food", "Store Water", "Share Food",
        "Share Water", "Drink Stored Water", "Eat Stored Food", "Deposit Food",
        "Deposit Water", "Withdraw Food", "Withdraw Water"
    ]
    try:
        idx = action_names.index(action_name)
    except ValueError:
        idx = 0
t_b5_orig = timer("action_index_original", _action_index_original)
print(f"  B5a action_names list creation + .index():      {t_b5_orig:>8.2f} µs")

# B5 (proposed fix): module-level dict lookup
_ACTION_IDX = {name: i for i, name in enumerate(action_names_original)}
def _action_index_dict():
    idx = _ACTION_IDX.get(action_name, 0)
t_b5_dict = timer("action_index_dict", _action_index_dict)
print(f"  B5b dict lookup (proposed fix):                 {t_b5_dict:>8.2f} µs  "
      f"[{t_b5_orig/max(t_b5_dict,0.001):.1f}x faster]")

# B6: np.array([...20 floats...], dtype=np.float32) construction (lines 79-100)
def _np_array_construction():
    vec = np.array([
        agent.hunger / 100.0,
        agent.thirst / 100.0,
        (100.0 - agent.energy) / 100.0,
        agent.injury_level / 100.0,
        agent.stored_food / 100.0,
        agent.stored_water / 100.0,
        0.5,   # colony_food / 100.0
        0.3,   # colony_water / 100.0
        local_temp / 50.0,
        float(world.elevation[ty, tx]),
        float(world.rainfall[ty, tx] / 3000.0),
        1.0 if agent.shelter_location is not None else 0.0,
        agent.shelter_durability / 100.0,
        agent.reproduction_cooldown / 360.0,
        agent.senescence_factor,
        1.0 if is_transition else 0.0,
        target_season / 3.0,
        scarcity_pred,
        1.0 if agent.life_stage == "Adult" else 0.0,
        0.0 / 16.0,  # action_idx / 16.0
    ], dtype=np.float32)
t_b6_array = timer("np_array_construction", _np_array_construction)
print(f"  B6a np.array([...20 floats...]) construction:   {t_b6_array:>8.2f} µs")

# B6 (proposed fix): pre-allocated buffer, in-place fill
_vec_buffer = np.zeros(20, dtype=np.float32)
def _np_buffer_inplace():
    _vec_buffer[0]  = agent.hunger / 100.0
    _vec_buffer[1]  = agent.thirst / 100.0
    _vec_buffer[2]  = (100.0 - agent.energy) / 100.0
    _vec_buffer[3]  = agent.injury_level / 100.0
    _vec_buffer[4]  = agent.stored_food / 100.0
    _vec_buffer[5]  = agent.stored_water / 100.0
    _vec_buffer[6]  = 0.5    # colony_food / 100.0
    _vec_buffer[7]  = 0.3    # colony_water / 100.0
    _vec_buffer[8]  = local_temp / 50.0
    _vec_buffer[9]  = float(world.elevation[ty, tx])
    _vec_buffer[10] = float(world.rainfall[ty, tx] / 3000.0)
    _vec_buffer[11] = 1.0 if agent.shelter_location is not None else 0.0
    _vec_buffer[12] = agent.shelter_durability / 100.0
    _vec_buffer[13] = agent.reproduction_cooldown / 360.0
    _vec_buffer[14] = agent.senescence_factor
    _vec_buffer[15] = 1.0 if is_transition else 0.0
    _vec_buffer[16] = target_season / 3.0
    _vec_buffer[17] = scarcity_pred
    _vec_buffer[18] = 1.0 if agent.life_stage == "Adult" else 0.0
    _vec_buffer[19] = 0.0 / 16.0
t_b6_inplace = timer("np_buffer_inplace", _np_buffer_inplace)
print(f"  B6b in-place buffer fill (proposed fix):         {t_b6_inplace:>8.2f} µs  "
      f"[{t_b6_array/max(t_b6_inplace,0.001):.1f}x faster]")

# B7: life_stage property call (in vec construction — calls age/360/stages)
def _life_stage():
    return agent.life_stage
t_b7 = timer("life_stage_property", _life_stage)
print(f"  B7  agent.life_stage property:                  {t_b7:>8.2f} µs")

# B8: senescence_factor property (another np.clip call)
def _senescence():
    return agent.senescence_factor
t_b8 = timer("senescence_factor", _senescence)
print(f"  B8  agent.senescence_factor property:           {t_b8:>8.2f} µs")

# B9: world.biome[ty, tx] numpy index (accessed twice: local_temp + env_mod)
def _np_index():
    _ = int(world.biome[ty, tx])
t_b9 = timer("np_index_biome", _np_index)
print(f"  B9  world.biome[y,x] numpy index:               {t_b9:>8.2f} µs")

print()

# ─────────────────────────────────────────────────────────────────────────────
# 4. Dissect get_environmental_modulation — every operation individually
# ─────────────────────────────────────────────────────────────────────────────
print("── Section C: get_environmental_modulation() internal operation timings ──")
print()

y, x = 520, 525
bt = float(world.temperature[y, x])
lt_env = bt + 12.0 * world.temp_cos_factor

# C1: biome branch + temperature arithmetic (same as B2, shared code duplication!)
def _env_biome_temp():
    btx = float(world.temperature[y, x])
    bid = int(world.biome[y, x])
    if bid == 6:         amp = 22.0
    elif bid in (1,2,3): amp = 18.0
    elif bid in (4,5):   amp = 12.0
    elif bid in (0,8):   amp = 6.0
    elif bid == 7:       amp = 4.0
    else:                amp = 12.0
    cf = getattr(world, "temp_cos_factor", None)
    if cf is None:
        cf = np.cos(((day - 180.0) / 180.0) * np.pi)
    lt2 = btx + amp * cf + getattr(world, "global_temp_offset", 0.0)
    f_temp = (lt2 - 20.0) / 20.0
t_c1 = timer("env_biome_temp", _env_biome_temp)
print(f"  C1  Biome lookup + temp arithmetic:             {t_c1:>8.2f} µs")

# C2: elevation, rainfall, wildlife, fertility reads (4 numpy array accesses)
def _env_array_reads():
    fe = float(world.elevation[y, x])
    fm = float(world.rainfall[y, x] / 3000.0)
    ff = float(world.wildlife[y, x] + world.fertility[y, x])
    hw = (world.biome[y, x] == 8) or (world.lake_map[y, x] > 0.0) or (world.river_map[y, x] > 1500.0)
    fw = 1.0 if hw else 0.0
t_c2 = timer("env_array_reads", _env_array_reads)
print(f"  C2  Elevation/rainfall/wildlife array reads:    {t_c2:>8.2f} µs")

# C3: np.array([5 floats]) construction (same pattern as B6!)
def _env_np_array():
    features = np.array([0.2, 0.4, 0.27, 0.9, 0.0], dtype=np.float32)
t_c3 = timer("env_np_array_5", _env_np_array)
print(f"  C3  np.array([5 floats]) construction:          {t_c3:>8.2f} µs")

# C4: np.dot(weights, features) — 5-element dot product
weights = agent.feature_weights
feat = np.array([0.2, 0.4, 0.27, 0.9, 0.0], dtype=np.float32)
def _env_np_dot():
    _ = float(np.dot(weights, feat))
t_c4 = timer("env_np_dot", _env_np_dot)
print(f"  C4  np.dot(weights, features):                  {t_c4:>8.2f} µs")

# C5: np.exp + np.clip (the final modulation)
def _env_exp_clip():
    _ = float(np.clip(np.exp(0.05), 0.1, 5.0))
t_c5 = timer("env_exp_clip", _env_exp_clip)
print(f"  C5  np.clip(np.exp(val), 0.1, 5.0):            {t_c5:>8.2f} µs")

# C5b: pure-Python math.exp + min/max
def _env_math_exp_minmax():
    _ = min(max(math.exp(0.05), 0.1), 5.0)
t_c5b = timer("env_math_exp_minmax", _env_math_exp_minmax)
print(f"  C5b math.exp + min/max (proposed fix):          {t_c5b:>8.2f} µs  "
      f"[{t_c5/max(t_c5b,0.001):.1f}x faster]")

# C6: hasattr(agent, "feature_weights") guard (called every time in real code)
def _env_hasattr():
    _ = hasattr(agent, "feature_weights")
t_c6 = timer("env_hasattr_guard", _env_hasattr)
print(f"  C6  hasattr(agent, 'feature_weights') guard:   {t_c6:>8.2f} µs")

# C6b: getattr with default vs hasattr+access
def _env_getattr():
    w = getattr(agent, "feature_weights", None)
t_c6b = timer("env_getattr", _env_getattr)
print(f"  C6b getattr(agent, 'feature_weights', None):   {t_c6b:>8.2f} µs")

print()

# ─────────────────────────────────────────────────────────────────────────────
# 5. Summary: budget breakdown
# ─────────────────────────────────────────────────────────────────────────────
print("── Section D: Budget breakdown (hot path — both kwargs supplied) ──")
print()

# Hot path breakdown (local_temp and scarcity_prediction supplied by caller)
hot_budget = {
    "B1 seasonal math":         t_b1,
    "B4 colony lookup":         t_b4,
    "B5b action dict lookup":   t_b5_orig,   # using original for budget
    "B6a np.array([20])":       t_b6_array,
    "B7 life_stage property":   t_b7,
    "B8 senescence_factor":     t_b8,
    "B9 numpy indexing×4":      t_b9 * 4,    # elevation + rainfall in gpc
}
total_budget = sum(hot_budget.values())
print(f"  Estimated hot-path component total:  {total_budget:.2f} µs")
print(f"  Measured hot-path full function:     {t_full_hot:.2f} µs")
print(f"  {'Operation':<38}  {'µs':>6}  {'% of fn':>8}")
print("  " + "-" * 58)
for k, v in sorted(hot_budget.items(), key=lambda x: -x[1]):
    print(f"  {k:<38}  {v:>6.2f}  {v/max(t_full_hot,0.001)*100:>7.1f}%")
print()

# Proposed combined fix speedup estimate
fixed_budget = {
    "B1 seasonal math":         t_b1,
    "B4 colony lookup":         t_b4,
    "B5b action dict (fixed)":  t_b5_dict,
    "B6b in-place buffer (fixed)": t_b6_inplace,
    "B7 life_stage property":   t_b7,
    "B8 senescence_factor":     t_b8,
    "B9 numpy indexing×4":      t_b9 * 4,
}
total_fixed = sum(fixed_budget.values())
print(f"  Projected fixed hot-path total:      {total_fixed:.2f} µs")
print(f"  Speedup estimate (gpc alone):        {t_full_hot/max(total_fixed,0.001):.2f}x")
print(f"  (Note: projections assume overhead is purely from measured components)")
print()

print("=" * 70)
print("  Batch 3A complete.")
print("=" * 70)
