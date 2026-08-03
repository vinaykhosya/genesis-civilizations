"""
worker.py
=========
Isolated Worker Process Execution Wrapper for Project Genesis Benchmarks.
Applies core pinning, populates initial starting population (default 200 agents),
measures pure tick simulation time (excluding setup noise), and streams IPC performance telemetry.
"""

import os
import sys
import time
import json
import argparse
import numpy as np

# Add project root to python path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from benchmarks.core_affinity import apply_cpu_affinity
from benchmarks.phase_detector import detect_phase

def parse_args():
    parser = argparse.ArgumentParser(description="Genesis Benchmark Worker")
    parser.add_argument("--seed", type=int, default=1720, help="Random seed for world generation")
    parser.add_argument("--ticks", type=int, default=2000, help="Target simulation ticks")
    parser.add_argument("--duration", type=float, default=0.0, help="Target duration in seconds (0 = use ticks)")
    parser.add_argument("--population", type=int, default=200, help="Initial starting agent population")
    parser.add_argument("--worker-id", type=int, default=0, help="Worker index ID")
    parser.add_argument("--core-ids", type=str, default="", help="Comma-separated logical core IDs to pin process to")
    parser.add_argument("--headless", action="store_true", help="Run in headless mode")
    parser.add_argument("--ipc-file", type=str, required=True, help="IPC JSON output file path")
    return parser.parse_args()

def main():
    args = parse_args()

    # 1. Apply CPU Core Affinity if specified
    if args.core_ids:
        try:
            cores = [int(c.strip()) for c in args.core_ids.split(",") if c.strip()]
            if cores:
                apply_cpu_affinity(cores)
        except Exception as e:
            print(f"[Worker {args.worker_id}] Core affinity warning: {e}", file=sys.stderr)

    # 2. Initialize World Generation & Setup Timing
    t_setup_start = time.perf_counter()
    from world.generator import generate_world
    from world.predictor import predict_settlements
    from world.agents.genetics import create_genome
    from world.agents.agent import Agent
    from world.agents.simulation import run_simulation

    world = generate_world(width=1024, height=1024, seed=args.seed, world_preset="None")

    # Configure benchmark environment settings
    world.max_population = max(200, args.population)
    world.reproduction_enabled = True
    world.disasters_enabled = True
    world.healing_speed_mult = 2_000_000.0
    world.shelter_build_speed_mult = 1.0
    world.shelter_search_dist = 100.0
    world.climate_epoch_mode = "legacy"
    world.spawn_mode = "fixed"
    world.colony_spawn_locations = {"Alpha": 1, "Beta": 2, "Gamma": 3, "Delta": 4}

    # Populate initial starting agent population if requested (default 200 agents)
    if args.population > 0:
        np.random.seed(args.seed + args.worker_id * 100)
        spots = predict_settlements(world, count=4, exclusion_radius=45.0)
        agents = []
        agent_id = 0
        agents_per_spot = max(1, args.population // max(1, len(spots)))
        for spot_idx, spot in enumerate(spots):
            colony_id = spot_idx % 4
            for _ in range(agents_per_spot):
                genome = create_genome()
                agent = Agent(agent_id=agent_id, location=(spot["y"], spot["x"]), genome=genome)
                start_age = float(np.random.uniform(20, 40))
                agent.age = int(start_age * 360)
                agent.max_age = int(np.random.normal(70, 10)) * 360
                agent.colony_id = colony_id
                agent.generation = 0
                agent.born_tick = 0
                agent.sampled_path_history = [[
                    int(agent.location[1]), int(agent.location[0]), 0,
                    float(agent.health), float(agent.hunger), float(agent.thirst),
                    float(agent.energy), 0
                ]]
                agents.append(agent)
                agent_id += 1
        world.agents = agents

    # Initialize profiler dictionary
    world.profiler = {
        "perception":           {"calls": 0, "time": 0.0, "max": 0.0, "worst_tick": -1},
        "decision":             {"calls": 0, "time": 0.0, "max": 0.0, "worst_tick": -1},
        "movement":             {"calls": 0, "time": 0.0, "max": 0.0, "worst_tick": -1},
        "drives_relationships": {"calls": 0, "time": 0.0, "max": 0.0, "worst_tick": -1},
        "shelter":              {"calls": 0, "time": 0.0, "max": 0.0, "worst_tick": -1},
        "ecology":              {"calls": 0, "time": 0.0, "max": 0.0, "worst_tick": -1},
        "genetics":             {"calls": 0, "time": 0.0, "max": 0.0, "worst_tick": -1},
        "saving":               {"calls": 0, "time": 0.0, "max": 0.0, "worst_tick": -1},
        "telemetry":            {"calls": 0, "time": 0.0, "max": 0.0, "worst_tick": -1},
        "callback":             {"calls": 0, "time": 0.0, "max": 0.0, "worst_tick": -1},
    }

    t_setup_end = time.perf_counter()
    setup_duration = t_setup_end - t_setup_start

    tick_records = []
    t_sim_start = None
    stop_simulation = False

    def live_callback(tick_or_world, stats=None):
        nonlocal t_sim_start, stop_simulation
        t_now = time.perf_counter()
        if t_sim_start is None:
            t_sim_start = t_now  # Start timer on first tick to exclude setup noise

        elapsed = t_now - t_sim_start

        if isinstance(tick_or_world, int):
            current_tick = tick_or_world
        elif hasattr(tick_or_world, "tick"):
            current_tick = tick_or_world.tick
        else:
            current_tick = 0

        phase = detect_phase(current_tick)
        alive_count = sum(1 for a in world.agents if not a.dead) if hasattr(world, "agents") else 0
        tick_records.append((current_tick, round(elapsed, 4), phase, alive_count))

        # Check duration-based termination condition if requested
        if args.duration > 0 and elapsed >= args.duration:
            stop_simulation = True

    # 3. Execute Simulation Run
    run_simulation(
        world,
        ticks=args.ticks,
        experiment_type="default",
        scarcity_level=3.0,
        save_paths=False,
        save_epochs=False,
        live_callback=live_callback
    )

    t_sim_end = time.perf_counter()
    pure_sim_duration = (t_sim_end - t_sim_start) if t_sim_start is not None else (t_sim_end - t_setup_end)
    final_tick = getattr(world, "tick", args.ticks)
    avg_tps = (final_tick / pure_sim_duration) if pure_sim_duration > 0 else 0.0

    # 4. Compile IPC telemetry output payload
    ipc_payload = {
        "worker_id": args.worker_id,
        "pid": os.getpid(),
        "seed": args.seed,
        "initial_population": len(world.agents),
        "ticks_completed": final_tick,
        "setup_duration_sec": round(setup_duration, 4),
        "elapsed_sec": round(pure_sim_duration, 4),
        "avg_tps": round(avg_tps, 2),
        "tick_records": tick_records,
        "profiler": getattr(world, "profiler", {})
    }

    # Save to IPC file
    with open(args.ipc_file, "w") as f:
        json.dump(ipc_payload, f, indent=2)

if __name__ == "__main__":
    main()
