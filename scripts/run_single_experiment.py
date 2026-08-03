"""
run_single_experiment.py
========================
Worker script executed inside an independent Command Prompt window.
Supports automatic checkpoint saving every `sample_interval` ticks,
seamless auto-resumption, and detailed failure classification.
"""

import os
import sys
import json
import time
import datetime
import traceback
import argparse
import numpy as np

# Ensure project root is in python path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from world.generator import generate_world
from world.predictor import predict_settlements
from world.agents.simulation import run_simulation
from world.checkpoint_io import save_full_checkpoint, load_full_checkpoint
from main import export_experiment_assets, save_simulation_data


def parse_args():
    parser = argparse.ArgumentParser(description="Single Experiment CMD Window Runner")
    parser.add_argument("--config", type=str, required=True, help="Path to experiment configuration JSON file")
    return parser.parse_args()


def main():
    args = parse_args()
    if not os.path.exists(args.config):
        print(f"[Error] Configuration file not found: {args.config}")
        sys.exit(1)

    with open(args.config, "r") as f:
        cfg = json.load(f)

    exp_id = cfg.get("exp_id", 1)
    exp_name = cfg.get("experiment_name", f"experiment_{exp_id}")
    seed = cfg.get("seed", 1720)
    ticks_target = cfg.get("ticks", 1_000_000)
    scarcity = cfg.get("scarcity", 1.0)
    max_population = cfg.get("max_population", 300)
    mutation_rate = cfg.get("mutation_rate", 0.05)
    reproduction_enabled = cfg.get("reproduction_enabled", True)
    disputes_enabled = cfg.get("disputes_enabled", False)
    disasters_enabled = cfg.get("disasters_enabled", True)
    healing_speed_mult = cfg.get("healing_speed_mult", 1.0)
    shelter_build_speed_mult = cfg.get("shelter_build_speed_mult", 1.0)
    shelter_search_dist = cfg.get("shelter_search_dist", 100.0)
    spawn_mode = cfg.get("spawn_mode", "fixed")
    world_preset = cfg.get("world_preset", "None")
    climate_epoch_mode = cfg.get("climate_epoch_mode", "legacy")
    long_run = cfg.get("long_run", True)
    sample_interval = cfg.get("sample_interval", 5000) # Checkpoint auto-save every 5000 ticks (~83 seconds)
    save_paths = cfg.get("save_paths", False)
    save_epochs = cfg.get("save_epochs", True)

    exp_folder = cfg.get("exp_folder")
    if not exp_folder:
        exp_folder = os.path.join(PROJECT_ROOT, "experiments", exp_name)
    os.makedirs(exp_folder, exist_ok=True)

    chk_meta_path = os.path.join(exp_folder, "checkpoint_meta.json")
    latest_chk_path = os.path.join(exp_folder, "latest_checkpoint.json")

    # Fast skip check if already complete
    if os.path.exists(chk_meta_path):
        try:
            with open(chk_meta_path, "r") as f:
                meta_data = json.load(f)
            if meta_data.get("completed", False) and meta_data.get("current_tick", 0) >= ticks_target:
                print("=" * 80)
                print(f"  [SKIPPED] Experiment #{exp_id:04d} ({exp_name}) ALREADY COMPLETE!")
                print(f"  Final Ticks: {meta_data.get('current_tick'):,}/{ticks_target:,}")
                print("=" * 80)
                sys.exit(0)
        except Exception:
            pass

    world = None
    start_tick = 0

    try:
        # Check for auto-resume checkpoint
        if os.path.exists(latest_chk_path):
            print("=" * 80)
            print(f"  🔄 [AUTO-RESUME] Found existing checkpoint for Experiment #{exp_id:04d} ({exp_name})")
            print(f"  Loading state from: {latest_chk_path}")
            try:
                world, restored_cfg = load_full_checkpoint(latest_chk_path)
                start_tick = world.tick
                print(f"  ✓ Resuming from Tick {start_tick:,} / {ticks_target:,}")
                print("=" * 80)
                print()
            except Exception as e:
                print(f"  ⚠️ Failed to load checkpoint ({e}). Starting fresh simulation...")
                world = None

        if world is None:
            timestamp_str = datetime.datetime.now().strftime("%Y-%m-%d_%H%M%S")
            print("=" * 80)
            print(f"  PROJECT GENESIS — EXPERIMENT #{exp_id:04d}: {exp_name}")
            print(f"  Folder: {exp_folder}")
            print(f"  Seed: {seed} | Target Ticks: {ticks_target:,} | Max Pop: {max_population}")
            print(f"  Disputes: {disputes_enabled} | Disasters: {disasters_enabled} | Healing Mult: {healing_speed_mult}")
            print(f"  Scarcity: {scarcity} | World Preset: {world_preset} | Spawn Mode: {spawn_mode}")
            print("=" * 80)
            print()

            # 1. Generate World
            t_gen_start = time.perf_counter()
            world = generate_world(width=1024, height=1024, seed=seed, world_preset=world_preset)
            t_gen = time.perf_counter() - t_gen_start
            print(f"World generated in {t_gen:.2f}s")

        # 2. Re-apply World Parameters
        world.max_population = max_population
        world.mutation_rate = mutation_rate
        world.reproduction_enabled = reproduction_enabled
        world.disputes_enabled = disputes_enabled
        world.disasters_enabled = disasters_enabled
        world.healing_speed_mult = healing_speed_mult
        world.shelter_build_speed_mult = shelter_build_speed_mult
        world.shelter_search_dist = shelter_search_dist
        world.climate_epoch_mode = climate_epoch_mode
        world.spawn_mode = spawn_mode
        world.colony_spawn_locations = {"Alpha": 1, "Beta": 2, "Gamma": 3, "Delta": 4}
        world.exp_folder = exp_folder

        # Save metadata.json
        metadata = {
            "experiment_id": exp_id,
            "experiment_name": exp_name,
            "study": cfg.get("study", "Study A — Environmental & Social Factorial Screening"),
            "design": cfg.get("design", "2x2x2x2 factorial"),
            "condition_id": cfg.get("condition_id"),
            "condition_label": cfg.get("condition_label"),
            "block_seed": cfg.get("block_seed", seed),
            "seed": seed,
            "ticks_planned": ticks_target,
            "scarcity": scarcity,
            "max_population": max_population,
            "disputes_enabled": disputes_enabled,
            "disasters_enabled": disasters_enabled,
            "healing_speed_mult": healing_speed_mult,
            "world_preset": world_preset,
            "spawn_mode": spawn_mode,
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d_%H%M%S")
        }
        with open(os.path.join(exp_folder, "metadata.json"), "w") as f:
            json.dump(metadata, f, indent=2)

        # 3. Predict Settlements
        settlements = predict_settlements(world, count=10, exclusion_radius=45.0)

        remaining_ticks = ticks_target - start_tick
        if remaining_ticks <= 0:
            print(f"Simulation already reached target tick ({start_tick:,} >= {ticks_target:,}). Exiting.")
            sys.exit(0)

        t_sim_start = time.perf_counter()
        t_last_checkpoint = t_sim_start

        # 4. Live Callback & Auto-Checkpointing every sample_interval (5000 ticks)
        def live_cb(tick, epoch_stats):
            nonlocal t_last_checkpoint
            alive_count = sum(1 for a in world.agents if not a.dead)
            now = time.perf_counter()
            elapsed_chunk = now - t_last_checkpoint
            tps = (sample_interval / elapsed_chunk) if elapsed_chunk > 0 else 0.0
            t_last_checkpoint = now

            print(f"[{exp_name}] Tick {world.tick:,}/{ticks_target:,} | Pop: {alive_count}/{len(world.agents)} | Speed: {tps:.1f} TPS")

            # Save checkpoint (signature: save_full_checkpoint(world, config, path))
            if tick > 0 and tick % sample_interval == 0:
                save_full_checkpoint(world, cfg, latest_chk_path)
                chk_meta = {
                    "experiment_id": exp_id,
                    "experiment_name": exp_name,
                    "current_tick": world.tick,
                    "ticks_planned": ticks_target,
                    "completed": False,
                    "failed": False,
                    "tps": round(tps, 2),
                    "alive_population": alive_count,
                    "total_agents_historical": len(world.agents),
                    "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }
                with open(chk_meta_path, "w") as f:
                    json.dump(chk_meta, f, indent=2)

        # 5. Run Simulation Loop
        print(f"\nRunning simulation loop for {remaining_ticks:,} remaining ticks (Tick {start_tick:,} → {ticks_target:,})...")
        run_simulation(
            world,
            ticks=remaining_ticks,
            experiment_type="default",
            scarcity_level=scarcity,
            save_paths=save_paths,
            save_epochs=save_epochs,
            sample_interval=sample_interval,
            live_callback=live_cb,
            long_run=long_run
        )
        t_sim_total = time.perf_counter() - t_sim_start

        # Final completed save
        save_full_checkpoint(world, cfg, latest_chk_path)
        final_alive = sum(1 for a in world.agents if not a.dead)
        chk_meta = {
            "experiment_id": exp_id,
            "experiment_name": exp_name,
            "current_tick": world.tick,
            "ticks_planned": ticks_target,
            "completed": True,
            "failed": False,
            "runtime_seconds": round(t_sim_total, 2),
            "final_alive_population": final_alive,
            "total_agents_historical": len(world.agents),
            "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        with open(chk_meta_path, "w") as f:
            json.dump(chk_meta, f, indent=2)

        print("\n" + "=" * 80)
        print(f"  EXPERIMENT #{exp_id:04d} ({exp_name}) COMPLETED IN {t_sim_total:.2f}s!")
        print(f"  Final Ticks: {world.tick:,} | Output Folder: {exp_folder}")
        print("=" * 80)

        # Export assets
        export_experiment_assets(world, exp_folder, settlements=settlements, include_traces=True)
        save_simulation_data(world, exp_name, scarcity, os.path.join(exp_folder, "simulation_data.js"))

    except Exception as exc:
        err_type = type(exc).__name__
        err_msg = str(exc)
        tb_str = traceback.format_exc()

        print("\n" + "!" * 80)
        print(f"  ❌ EXPERIMENT #{exp_id:04d} FAILED: [{err_type}] {err_msg}")
        print("!" * 80)

        # Record failure classification log
        failure_info = {
            "experiment_id": exp_id,
            "experiment_name": exp_name,
            "error_type": err_type,
            "error_message": err_msg,
            "traceback": tb_str,
            "tick_failed_at": world.tick if world else start_tick,
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        with open(os.path.join(exp_folder, "failure_info.json"), "w") as f:
            json.dump(failure_info, f, indent=2)

        chk_meta = {
            "experiment_id": exp_id,
            "experiment_name": exp_name,
            "current_tick": world.tick if world else start_tick,
            "ticks_planned": ticks_target,
            "completed": False,
            "failed": True,
            "failure_reason": err_type,
            "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        with open(chk_meta_path, "w") as f:
            json.dump(chk_meta, f, indent=2)

        sys.exit(1)


if __name__ == "__main__":
    main()
