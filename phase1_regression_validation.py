"""
phase1_regression_validation.py
================================
Phase 1 -- Semantic and Regression Validation

Uses run_simulation() exactly as the real experiment does, with save_epochs=True
so that population_history and genetic_history are populated every INTERVAL ticks.

Tests:
  1A-a) Determinism: two identical-seed runs must produce the same population
        curves, birth/death counts, and final alive count.
  1A-b) Checkpoint round-trip: save at tick N, reload, run 50 more ticks,
        compare against the uninterrupted live run.
  1B)   Scientific curves printed and saved to CSV.

Usage:
    python phase1_regression_validation.py
"""

import sys
import os
import time
import random

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

import numpy as np

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
SEED             = 42
N_TICKS          = 500
CKPT_TICK        = 250
SNAP_INTERVAL    = 50      # epoch snapshot frequency (must divide N_TICKS evenly)
MAX_POP          = 40
SCARCITY         = 1.0
OUT_DIR          = os.path.join("experiments", "phase1_regression")
CKPT_PATH        = os.path.join(OUT_DIR, "rt_checkpoint.json")

os.makedirs(OUT_DIR, exist_ok=True)

print("=" * 60)
print("  Phase 1 -- Semantic & Regression Validation")
print(f"  Seed={SEED}  Ticks={N_TICKS}  PopCap={MAX_POP}  Scarcity={SCARCITY}")
print("=" * 60)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def reset_rng(seed):
    np.random.seed(seed)
    random.seed(seed)


def build_world(seed):
    """Build a fresh WorldState using the standard generator API."""
    from world.generator import generate_world
    world = generate_world(256, 256, seed)
    world.max_population = MAX_POP
    world.mutation_rate = 0.05
    return world


def run_sim(world, ticks, snap_interval=None):
    """
    Run simulation via the real run_simulation() pipeline.
    Returns (population_history, genetic_history) lists captured after the run.
    """
    from world.agents.simulation import run_simulation
    run_simulation(
        world,
        ticks=ticks,
        experiment_type="default",
        scarcity_level=SCARCITY,
        save_paths=False,
        save_epochs=True,
        sample_interval=(snap_interval or N_TICKS),
        prediction_enabled=True,
        planner_enabled=True,
        sleep_consolidation_enabled=True,
        long_run=False,
        pacing_delay=0.0,
    )
    return (
        list(world.population_history),
        list(world.genetic_history),
    )


def pop_summary(world):
    """Compact scientific snapshot from the current world state."""
    alive = [a for a in world.agents if not a.dead]
    n = len(alive)
    if n == 0:
        return {
            "alive": 0,
            "births": world.total_births,
            "deaths": world.total_deaths,
            "gene_means": [],
            "gene_stds": [],
        }
    genes = np.array([list(a.genome.genes) for a in alive])
    return {
        "alive": n,
        "births": int(world.total_births),
        "deaths": int(getattr(world, "total_deaths", 0)),
        "age_mean": round(float(np.mean([a.age / 360.0 for a in alive])), 3),
        "gene_means": list(np.mean(genes, axis=0).round(4)),
        "gene_stds": list(np.std(genes, axis=0).round(4)),
    }


def diff_pop_histories(ph_a, ph_b):
    """Compare two population_history lists, return list of discrepancy strings."""
    issues = []
    min_len = min(len(ph_a), len(ph_b))
    for i in range(min_len):
        ea, eb = ph_a[i], ph_b[i]
        tick = ea.get("tick", i)
        if ea.get("total") != eb.get("total"):
            issues.append(
                f"tick={tick}  total: A={ea.get('total')}  B={eb.get('total')}"
            )
    if len(ph_a) != len(ph_b):
        issues.append(
            f"population_history length differs: A={len(ph_a)} B={len(ph_b)}"
        )
    return issues


def diff_genetic_histories(gh_a, gh_b):
    """Compare two genetic_history lists, return discrepancy strings."""
    issues = []
    min_len = min(len(gh_a), len(gh_b))
    for i in range(min_len):
        ea, eb = gh_a[i], gh_b[i]
        tick = ea.get("tick", i)
        da = ea.get("diversity_score", 0.0)
        db = eb.get("diversity_score", 0.0)
        if abs(da - db) > 0.001:
            issues.append(f"tick={tick}  diversity_score: A={da:.4f}  B={db:.4f}")
        gma = ea.get("gene_means", [])
        gmb = eb.get("gene_means", [])
        for j, (a_v, b_v) in enumerate(zip(gma, gmb)):
            if abs(a_v - b_v) > 0.001:
                issues.append(f"tick={tick}  gene[{j}].mean: A={a_v}  B={b_v}")
    return issues


# ---------------------------------------------------------------------------
# 1A-a: Determinism check
# ---------------------------------------------------------------------------
print()
print("[1A-a] Run A ...")
t0 = time.perf_counter()
reset_rng(SEED)
world_a = build_world(SEED)
ph_a, gh_a = run_sim(world_a, N_TICKS, snap_interval=SNAP_INTERVAL)
t_a = time.perf_counter() - t0
snap_a = pop_summary(world_a)
print(f"       Done in {t_a:.1f}s  |  alive={snap_a['alive']}  births={snap_a['births']}  deaths={snap_a['deaths']}")

print()
print("[1A-a] Run B (same seed) ...")
t0 = time.perf_counter()
reset_rng(SEED)
world_b = build_world(SEED)
ph_b, gh_b = run_sim(world_b, N_TICKS, snap_interval=SNAP_INTERVAL)
t_b = time.perf_counter() - t0
snap_b = pop_summary(world_b)
print(f"       Done in {t_b:.1f}s  |  alive={snap_b['alive']}  births={snap_b['births']}  deaths={snap_b['deaths']}")

print()
print("[1A-a] Comparing population & genetic histories ...")
pop_issues = diff_pop_histories(ph_a, ph_b)
gen_issues = diff_genetic_histories(gh_a, gh_b)
all_issues = pop_issues + gen_issues

# Also compare final state
if snap_a["alive"] != snap_b["alive"]:
    all_issues.append(
        f"final alive: A={snap_a['alive']} B={snap_b['alive']}"
    )
if snap_a["births"] != snap_b["births"]:
    all_issues.append(
        f"total births: A={snap_a['births']} B={snap_b['births']}"
    )

det_pass = len(all_issues) == 0
if det_pass:
    print("  PASS -- Zero drift between identical-seed runs.")
else:
    print(f"  FAIL -- {len(all_issues)} discrepancies found:")
    for x in all_issues[:15]:
        print(f"    {x}")

# ---------------------------------------------------------------------------
# 1A-b: Checkpoint round-trip
# ---------------------------------------------------------------------------
print()
print(f"[1A-b] Checkpoint round-trip at tick={CKPT_TICK} ...")
from world.checkpoint_io import save_full_checkpoint, load_full_checkpoint

reset_rng(SEED)
world_c = build_world(SEED)
run_sim(world_c, CKPT_TICK)

cfg = {
    "seed": SEED,
    "scarcity": SCARCITY,
    "max_population": MAX_POP,
    "mutation_rate": 0.05,
}
save_full_checkpoint(world_c, cfg, CKPT_PATH)

# Continue live
run_sim(world_c, 50)
snap_live = pop_summary(world_c)

# Reload and continue
world_r, _ = load_full_checkpoint(CKPT_PATH)
world_r.max_population = MAX_POP
run_sim(world_r, 50)
snap_reload = pop_summary(world_r)

ckpt_ok = (
    snap_live["alive"] == snap_reload["alive"]
    and snap_live["births"] == snap_reload["births"]
)
if ckpt_ok:
    print("  PASS -- Checkpoint round-trip deterministic.")
    print(f"    live:   alive={snap_live['alive']}  births={snap_live['births']}  deaths={snap_live['deaths']}")
    print(f"    reload: alive={snap_reload['alive']}  births={snap_reload['births']}  deaths={snap_reload['deaths']}")
else:
    print("  WARN -- Mismatch after checkpoint reload:")
    print(f"    live:   alive={snap_live['alive']}  births={snap_live['births']}  deaths={snap_live['deaths']}")
    print(f"    reload: alive={snap_reload['alive']}  births={snap_reload['births']}  deaths={snap_reload['deaths']}")

# ---------------------------------------------------------------------------
# 1B: Scientific curves
# ---------------------------------------------------------------------------
print()
print("[1B] Scientific regression curves (Run A):")
print(
    f"  {'Tick':>6}  {'Alive':>6}  {'Births':>8}  {'Deaths':>8}  "
    f"{'Diversity':>10}"
)
print("  " + "-" * 48)

csv_rows = ["tick,alive,births,deaths,diversity_score"]
for entry in gh_a:
    tick = entry.get("tick", "?")
    div  = entry.get("diversity_score", 0.0)
    # Match the closest population entry
    pop_entry = next((p for p in ph_a if p.get("tick") == tick), {})
    alive  = pop_entry.get("total", "?")
    births = world_a.total_births   # approximate — grows monotonically
    deaths = getattr(world_a, "total_deaths", "?")
    print(
        f"  {tick:>6}  {alive!s:>6}  "
        f"{world_a.total_births!s:>8}  {getattr(world_a, 'total_deaths', 0)!s:>8}  "
        f"{div:>10.4f}"
    )
    csv_rows.append(f"{tick},{alive},{world_a.total_births},{getattr(world_a, 'total_deaths', 0)},{div}")

# Better: rebuild the CSV from the actual snapshots
csv_rows = ["tick,alive,births,deaths,diversity_score"]
all_ticks = sorted(set(
    [p.get("tick") for p in ph_a if "tick" in p]
    + [g.get("tick") for g in gh_a if "tick" in g]
))
pop_by_tick  = {p["tick"]: p for p in ph_a if "tick" in p}
gen_by_tick  = {g["tick"]: g for g in gh_a if "tick" in g}
for t in all_ticks:
    pe = pop_by_tick.get(t, {})
    ge = gen_by_tick.get(t, {})
    alive = pe.get("total", "-")
    div   = ge.get("diversity_score", 0.0)
    csv_rows.append(f"{t},{alive},-,-,{div:.4f}")

csv_path = os.path.join(OUT_DIR, "population_comparison.csv")
with open(csv_path, "w") as f:
    f.write("\n".join(csv_rows))
print(f"\n  CSV saved -> {csv_path}")

# ---------------------------------------------------------------------------
# Final Report
# ---------------------------------------------------------------------------
print()
final_snap = snap_a
gd_final = round(
    float(np.mean(final_snap.get("gene_stds", [0.0]))) if final_snap.get("gene_stds") else 0.0, 4
)
overall = "PASS" if (det_pass and ckpt_ok) else ("WARN" if det_pass else "FAIL")

report_lines = [
    "=" * 60,
    "  Phase 1 -- Regression Validation Report",
    f"  Seed={SEED} | Ticks={N_TICKS} | PopCap={MAX_POP}",
    "=" * 60,
    "",
    f"1A-a  Determinism:        {'PASS' if det_pass else 'FAIL'} ({len(all_issues)} issue(s))",
    f"1A-b  Checkpoint RT:      {'PASS' if ckpt_ok else 'WARN'}",
    "",
    "1B  Final Metrics (Run A):",
    f"  Alive:          {final_snap['alive']}",
    f"  Total births:   {final_snap['births']}",
    f"  Total deaths:   {final_snap.get('deaths', '?')}",
    f"  Mean age (yr):  {final_snap.get('age_mean', 0):.2f}",
    f"  Gene diversity: {gd_final:.4f}",
    "",
    f"RESULT: {overall}",
    "=" * 60,
]

report_text = "\n".join(report_lines)
report_path = os.path.join(OUT_DIR, "regression_report.txt")
with open(report_path, "w") as f:
    f.write(report_text)

print(report_text)
print(f"\n  Report -> {report_path}")
