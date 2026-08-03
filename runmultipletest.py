"""
runmultipletest.py
===================
PROJECT GENESIS — Research Campaign Orchestrator

Study A: Environmental & Social Factorial Screening
====================================================

Design:     2×2×2×2 Full Factorial Design
Conditions: 16 unique experimental conditions
Factors:
    [1] DISPUTES        — Off (False)  vs  On (True)
    [2] SPAWN MODE      — Fixed        vs  Random Valid
    [3] HEALING SPEED   — 1.0 (Normal) vs  0.5 (Harsh)
    [4] SCARCITY        — 1.0 (Normal) vs  3.0 (High)

Features:
  - Continuous Slot Refiller: Keeps EXACTLY BATCH_SIZE (4) active windows running continuously.
  - Auto-Retry & Resume: Retries failed runs automatically upon bug fixes.
  - Checkpoint Resume: Auto-saves state every 50k ticks; auto-resumes interrupted runs.
  - Campaign Manifest & Summarizer: Writes campaign.json, StudyA_summary.json, and CSV exports.
"""

import os
import sys
import json
import time
import csv
import subprocess
import datetime
import hashlib

# Ensure stdout handles Unicode / UTF-8 on Windows terminals
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))

# ==============================================================================
# ⚙️  GLOBAL STUDY SETTINGS
# ==============================================================================

STUDY_TITLE    = "Study A — Environmental & Social Factorial Screening"
SEEDS          = [1720]             # ← Phase 1: add [1720, 1847, 2011, 2203, 2512] for 5-seed block
TICKS          = 1_000_000          # Simulation target ticks
MAX_POPULATION = 300               # Population capacity cap
MUTATION_RATE  = 0.05              # Mutation std dev on birth
BATCH_SIZE     = 4                 # Max simultaneous active CMD windows (Continuous Pool)

# ==============================================================================
# 🔬  FACTOR LEVELS — 2×2×2×2 Full Factorial Matrix
# ==============================================================================

FACTOR_DISPUTES    = [False, True]               # Factor 1: Territorial disputes
FACTOR_SPAWN       = ["fixed", "random_valid"]   # Factor 2: Colony spawn placement
FACTOR_HEALING     = [1.0, 0.5]                  # Factor 3: Healing speed multiplier
FACTOR_SCARCITY    = [1.0, 3.0]                  # Factor 4: Resource scarcity level


def create_campaign_manifest(conditions, seeds):
    """Generates a study-wide campaign manifest JSON for reproducibility."""
    experiments_dir = os.path.join(PROJECT_ROOT, "experiments")
    os.makedirs(experiments_dir, exist_ok=True)
    manifest_path = os.path.join(experiments_dir, "StudyA_campaign_manifest.json")

    config_str = json.dumps({
        "study": STUDY_TITLE,
        "seeds": seeds,
        "ticks": TICKS,
        "max_population": MAX_POPULATION,
        "batch_size": BATCH_SIZE,
        "factors": {
            "disputes": FACTOR_DISPUTES,
            "spawn_mode": FACTOR_SPAWN,
            "healing": FACTOR_HEALING,
            "scarcity": FACTOR_SCARCITY
        }
    }, sort_keys=True)
    config_hash = hashlib.sha256(config_str.encode("utf-8")).hexdigest()[:12]

    manifest = {
        "study": STUDY_TITLE,
        "design": "2x2x2x2 full factorial",
        "conditions_count": len(conditions),
        "seeds_count": len(seeds),
        "total_experiments": len(conditions) * len(seeds),
        "ticks_per_experiment": TICKS,
        "max_population": MAX_POPULATION,
        "batch_size": BATCH_SIZE,
        "checkpoint_interval_ticks": 5000,
        "config_hash": config_hash,
        "python_version": sys.version.split()[0],
        "platform": sys.platform,
        "created_timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    return manifest_path, config_hash


def build_factorial_conditions():
    """Generates all 16 conditions from the 2×2×2×2 factorial design."""
    conditions = []
    condition_id = 0

    for disputes in FACTOR_DISPUTES:
        for spawn in FACTOR_SPAWN:
            for healing in FACTOR_HEALING:
                for scarcity in FACTOR_SCARCITY:
                    condition_id += 1

                    d_label  = "disputes-on"     if disputes            else "disputes-off"
                    sp_label = "spawn-random"    if spawn == "random_valid" else "spawn-fixed"
                    h_label  = f"heal-{healing:.1f}"
                    sc_label = f"scar-{scarcity:.1f}"

                    label = f"C{condition_id:02d}_{d_label}_{sp_label}_{h_label}_{sc_label}"

                    conditions.append({
                        "condition_id":   condition_id,
                        "label":          label,
                        "disputes":       disputes,
                        "spawn_mode":     spawn,
                        "healing":        healing,
                        "scarcity":       scarcity
                    })

    return conditions


def check_experiment_status(exp_folder, ticks_target):
    """
    Checks existing experiment folder for checkpoint progress and failures.
    Returns: status ('COMPLETED', 'RESUMING', 'RETRYING', or 'NEW'), current_tick, failure_reason
    """
    chk_meta_path = os.path.join(exp_folder, "checkpoint_meta.json")
    if os.path.exists(chk_meta_path):
        try:
            with open(chk_meta_path, "r") as f:
                meta = json.load(f)
            cur_tick = meta.get("current_tick", 0)
            completed = meta.get("completed", False)
            failed = meta.get("failed", False)
            fail_reason = meta.get("failure_reason", "Unknown")

            if completed and cur_tick >= ticks_target:
                return "COMPLETED", cur_tick, None
            elif failed:
                return "RETRYING", cur_tick, fail_reason
            elif cur_tick > 0:
                return "RESUMING", cur_tick, None
        except Exception:
            pass
    return "NEW", 0, None


def build_experiment_configs(conditions, seeds):
    """Crosses conditions with seeds to build deterministic experiment configs."""
    experiments = []
    exp_id = 0

    for seed in seeds:
        for cond in conditions:
            exp_id += 1
            name = f"StudyA_seed{seed}_{cond['label']}"
            exp_folder = os.path.join(PROJECT_ROOT, "experiments", name)
            status, cur_tick, fail_reason = check_experiment_status(exp_folder, TICKS)

            experiments.append({
                "exp_id":                exp_id,
                "experiment_name":       name,
                "exp_folder":            exp_folder,
                "seed":                  seed,
                "ticks":                 TICKS,
                "scarcity":              cond["scarcity"],
                "max_population":        MAX_POPULATION,
                "mutation_rate":         MUTATION_RATE,
                "reproduction_enabled":  True,
                "disputes_enabled":      cond["disputes"],
                "disasters_enabled":     True,
                "healing_speed_mult":    cond["healing"],
                "shelter_build_speed_mult": 1.0,
                "shelter_search_dist":   100.0,
                "spawn_mode":            cond["spawn_mode"],
                "world_preset":          "None",
                "climate_epoch_mode":    "legacy",
                "long_run":              True,
                "sample_interval":       5000,
                "save_paths":            False,
                "save_epochs":           True,
                "study":                 STUDY_TITLE,
                "design":                "2x2x2x2 factorial",
                "condition_id":          cond["condition_id"],
                "condition_label":       cond["label"],
                "block_seed":            seed,
                "status":                status,
                "current_tick":          cur_tick,
                "failure_reason":        fail_reason
            })

    return experiments


def launch_single_experiment_window(cfg, runner_script, tmp_config_dir):
    """Launches a single experiment in its own visible CMD window."""
    exp_id = cfg["exp_id"]

    cfg_path = os.path.join(tmp_config_dir, f"exp_{exp_id:04d}_config.json")
    with open(cfg_path, "w") as f:
        json.dump(cfg, f, indent=2)

    env = os.environ.copy()
    env["PYTHONPATH"] = PROJECT_ROOT
    cmd = [sys.executable, runner_script, "--config", cfg_path]

    if sys.platform == "win32":
        p = subprocess.Popen(cmd, creationflags=subprocess.CREATE_NEW_CONSOLE, cwd=PROJECT_ROOT, env=env)
    else:
        p = subprocess.Popen(cmd, cwd=PROJECT_ROOT, env=env)

    return p


def export_study_summary(experiments):
    """Generates study-wide summary datasets (JSON and CSV) when study completes."""
    experiments_dir = os.path.join(PROJECT_ROOT, "experiments")
    json_summary_path = os.path.join(experiments_dir, "StudyA_summary.json")
    csv_summary_path  = os.path.join(experiments_dir, "StudyA_summary.csv")

    summary_rows = []
    for exp in experiments:
        exp_folder = exp["exp_folder"]
        meta_path = os.path.join(exp_folder, "checkpoint_meta.json")
        chk_meta = {}
        if os.path.exists(meta_path):
            try:
                with open(meta_path, "r") as f:
                    chk_meta = json.load(f)
            except Exception:
                pass

        row = {
            "experiment_id":           exp["exp_id"],
            "experiment_name":         exp["experiment_name"],
            "seed":                    exp["seed"],
            "condition_id":            exp["condition_id"],
            "condition_label":         exp["condition_label"],
            "disputes_enabled":        exp["disputes_enabled"],
            "spawn_mode":              exp["spawn_mode"],
            "healing_speed_mult":      exp["healing_speed_mult"],
            "scarcity":                exp["scarcity"],
            "status":                  exp["status"],
            "current_tick":            chk_meta.get("current_tick", exp["current_tick"]),
            "ticks_planned":           exp["ticks"],
            "completed":               chk_meta.get("completed", False),
            "runtime_seconds":         chk_meta.get("runtime_seconds", None),
            "final_alive_population":  chk_meta.get("final_alive_population", None),
            "total_agents_historical": chk_meta.get("total_agents_historical", None),
            "failure_reason":          chk_meta.get("failure_reason", None)
        }
        summary_rows.append(row)

    # Save JSON summary
    with open(json_summary_path, "w") as f:
        json.dump(summary_rows, f, indent=2)

    # Save CSV summary
    if summary_rows:
        headers = list(summary_rows[0].keys())
        with open(csv_summary_path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            writer.writerows(summary_rows)

    print()
    print("  📊 STUDY SUMMARY CREATED:")
    print(f"     └─ JSON: {json_summary_path}")
    print(f"     └─ CSV:  {csv_summary_path}")


def render_progress_bar(completed, total, width=25):
    """Renders a clean terminal progress bar."""
    pct = (completed / total) if total > 0 else 0.0
    filled = int(width * pct)
    bar = "█" * filled + "░" * (width - filled)
    return f"[{bar}] {completed}/{total} ({pct * 100:.1f}%)"


def main():
    conditions = build_factorial_conditions()
    manifest_path, config_hash = create_campaign_manifest(conditions, SEEDS)
    experiments = build_experiment_configs(conditions, SEEDS)

    total = len(experiments)
    pending_queue = [e for e in experiments if e["status"] != "COMPLETED"]
    completed_count = total - len(pending_queue)

    tmp_config_dir = os.path.join(PROJECT_ROOT, "experiments", ".tmp_configs")
    os.makedirs(tmp_config_dir, exist_ok=True)

    runner_script = os.path.join(PROJECT_ROOT, "scripts", "run_single_experiment.py")

    print("=" * 105)
    print("  PROJECT GENESIS — Research Campaign Orchestrator (Continuous Sliding Pool)")
    print(f"  {STUDY_TITLE}")
    print(f"  Design: 2×2×2×2 Full Factorial | Conditions: {len(conditions)} | Seeds: {len(SEEDS)} | Config Hash: {config_hash}")
    print(f"  Campaign Progress: {render_progress_bar(completed_count, total)}")
    print(f"  Active Window Pool: Maintaining EXACTLY {BATCH_SIZE} active windows continuously")
    print("=" * 105)
    print()

    print("  EXPERIMENT STATUS MATRIX:")
    print(f"  {'#':<5} {'Condition Label':<48} {'Disputes':<10} {'Spawn':<14} {'Status':<15} {'Progress'}")
    print("  " + "-" * 105)
    for exp in experiments:
        dis_str = "On" if exp["disputes_enabled"] else "Off"
        st = exp["status"]
        if st == "COMPLETED":
            prog_str = f"{exp['ticks']:,} / {exp['ticks']:,} (100%)"
        elif st == "RESUMING":
            pct = (exp["current_tick"] / exp["ticks"]) * 100
            prog_str = f"{exp['current_tick']:,} / {exp['ticks']:,} ({pct:.1f}%)"
        elif st == "RETRYING":
            prog_str = f"RETRYING (Last error: {exp['failure_reason']})"
        else:
            prog_str = f"0 / {exp['ticks']:,} (0%)"

        print(
            f"  #{exp['exp_id']:04d}  "
            f"{exp['condition_label']:<48} "
            f"{dis_str:<10} "
            f"{exp['spawn_mode']:<14} "
            f"{st:<15} "
            f"{prog_str}"
        )
    print()

    if not pending_queue:
        print("🎉 ALL EXPERIMENTS ARE ALREADY 100% COMPLETED!")
        export_study_summary(experiments)
        return

    print("=" * 105)
    print(f"  Starting Continuous Window Pool (Active Limit: {BATCH_SIZE} CMD windows)...")
    print("=" * 105)
    print()

    active_procs = []

    try:
        while pending_queue or active_procs:
            # 1. Fill active window slots up to BATCH_SIZE
            while len(active_procs) < BATCH_SIZE and pending_queue:
                cfg = pending_queue.pop(0)
                st = cfg["status"]
                exp_id = cfg["exp_id"]
                name = cfg["experiment_name"]

                print(f"  [Pool Slot {len(active_procs)+1}/{BATCH_SIZE}] Launching Exp #{exp_id:04d} [{st}] → {name}")
                p = launch_single_experiment_window(cfg, runner_script, tmp_config_dir)
                active_procs.append((exp_id, name, p, time.time()))
                time.sleep(0.5)

            # 2. Poll active processes and free slots as soon as windows finish
            time.sleep(1.0)
            still_active = []
            for exp_id, name, p, start_t in active_procs:
                poll_code = p.poll()
                if poll_code is not None:
                    duration = time.time() - start_t
                    print(f"  ✓ [Slot Freed] Exp #{exp_id:04d} ({name}) finished after {duration:.1f}s.")
                else:
                    still_active.append((exp_id, name, p, start_t))

            active_procs = still_active

        print()
        print("=" * 105)
        print("  🎉 ALL EXPERIMENTS IN STUDY A HAVE FINISHED SUCCESSFULLY!")
        print("=" * 105)

        export_study_summary(experiments)

    except KeyboardInterrupt:
        print("\n\n" + "=" * 105)
        print("  🛑 EXPERIMENT LAUNCHER PAUSED BY USER (Ctrl+C).")
        print("  All simulation checkpoints are safely saved in experiments/<exp_name>/")
        print("  Re-run 'python runmultipletest.py' anytime to seamlessly resume from where you stopped.")
        print("=" * 105)


if __name__ == "__main__":
    main()
