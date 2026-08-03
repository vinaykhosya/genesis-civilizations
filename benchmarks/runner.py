"""
runner.py
=========
Main CLI Benchmark Suite Orchestrator for Project Genesis.
Runs multi-concurrency, multi-seed, multi-repetition scientific benchmarks with core pinning,
system metric sampling, subsystem profiling, phase correlation, multi-format plotting, and provenance logging.

Usage:
    python -m benchmarks.runner --concurrency 1,2,3,4 --ticks 2000 --seeds 1720 --repetitions 1 --pin-cores
"""

import os
import sys
import time
import json
import argparse
import datetime
import subprocess
import psutil


# Add project root to python path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(PROJECT_ROOT)

from benchmarks.core_affinity import get_cpu_info, allocate_core_mapping
from benchmarks.metrics_collector import SystemMetricsCollector
from benchmarks.analysis import analyze_concurrency_benchmarks
from benchmarks.graph_generator import generate_all_benchmark_graphs
from benchmarks.report_generator import export_benchmark_reports
from benchmarks.subsystem_profiler import extract_subsystem_breakdown
from benchmarks.phase_detector import get_all_phase_definitions, detect_phase
from benchmarks.archive import save_to_permanent_archive


def parse_duration_str(dur_str: str) -> float:
    """Parses duration strings like '30s', '15m', '2h' into float seconds."""
    if not dur_str:
        return 0.0
    dur_str = dur_str.strip().lower()
    if dur_str.endswith("s"):
        return float(dur_str[:-1])
    elif dur_str.endswith("m"):
        return float(dur_str[:-1]) * 60.0
    elif dur_str.endswith("h"):
        return float(dur_str[:-1]) * 3600.0
    try:
        return float(dur_str)
    except ValueError:
        raise ValueError(f"Invalid duration string format: '{dur_str}'. Use format like '30s', '15m', '2h'.")

def get_git_commit() -> str:
    """Retrieves current short git commit hash if available."""
    try:
        res = subprocess.run(["git", "rev-parse", "--short", "HEAD"], capture_output=True, text=True, check=True, cwd=PROJECT_ROOT)
        return res.stdout.strip()
    except Exception:
        return "N/A"

def parse_args():
    parser = argparse.ArgumentParser(description="Project Genesis Research Benchmarking Framework")
    parser.add_argument("--concurrency", "-c", type=str, default="1,2,3,4,6,8", help="Comma-separated concurrency levels (e.g. '1,2,3,4,6,8')")
    parser.add_argument("--ticks", "-t", type=int, default=2000, help="Target simulation ticks per run")
    parser.add_argument("--duration", "-d", type=str, default="", help="Target duration string (e.g. '30s', '15m', '2h')")
    parser.add_argument("--population", "-p", type=int, default=200, help="Initial starting agent population")
    parser.add_argument("--seeds", "-s", type=str, default="1720", help="Comma-separated random seeds (e.g. '1720,1800')")
    parser.add_argument("--repetitions", "-r", type=int, default=3, help="Number of repetitions per benchmark configuration")
    parser.add_argument("--sample-interval", type=float, default=0.5, help="System metric sampling interval in seconds")
    parser.add_argument("--pin-cores", action="store_true", help="Enable logical CPU core pinning per worker process")
    parser.add_argument("--headless", action="store_true", help="Run simulation workers in headless mode")
    parser.add_argument("--output-dir", type=str, default=os.path.join(PROJECT_ROOT, "benchmarks", "results"), help="Base output directory for benchmark results")
    return parser.parse_args()


def main():
    args = parse_args()

    # Parse parameters
    concurrencies = [int(c.strip()) for c in args.concurrency.split(",") if c.strip()]
    seeds = [int(s.strip()) for s in args.seeds.split(",") if s.strip()]
    duration_sec = parse_duration_str(args.duration)
    cpu_info = get_cpu_info()
    git_hash = get_git_commit()

    timestamp_str = datetime.datetime.now().strftime("%Y-%m-%d_%H%M%S")
    session_dir = os.path.join(args.output_dir, f"session_{timestamp_str}")
    os.makedirs(session_dir, exist_ok=True)

    print("=" * 80)
    print("  PROJECT GENESIS — Performance & Parallelism Benchmarking Suite")
    print(f"  CPU: {cpu_info['processor']} ({cpu_info['logical_cores']} Logical Cores)")
    print(f"  Tested Concurrency Levels: {concurrencies}")
    print(f"  Seeds: {seeds} | Repetitions: {args.repetitions} | Core Pinning: {args.pin_cores}")
    print(f"  Target: {'Duration = ' + args.duration if duration_sec > 0 else f'Ticks = {args.ticks}'}")
    print("=" * 80)
    print()

    # Hardware & Software Provenance Config
    provenance_config = {
        "timestamp": timestamp_str,
        "cpu": cpu_info["processor"],
        "logical_cores": cpu_info["logical_cores"],
        "physical_cores": cpu_info["physical_cores"],
        "ram": f"{round(psutil.virtual_memory().total / (1024**3), 1)}GB",
        "python": sys.version.split()[0],
        "os": cpu_info["system_os"],
        "git_commit": git_hash,
        "seeds": seeds,
        "concurrency_levels": concurrencies,
        "repetitions": args.repetitions,
        "ticks_target": args.ticks,
        "duration_target": args.duration or "N/A",
        "initial_population": args.population,
        "core_pinning": args.pin_cores,
        "headless": args.headless
    }


    # Write initial provenance metadata file (benchmark_config.json)
    with open(os.path.join(session_dir, "benchmark_config.json"), "w") as f:
        json.dump(provenance_config, f, indent=2)

    concurrency_results = {}
    time_series_data = []
    all_subsystem_profilers = []
    phase_tps_records = {}

    for c in concurrencies:
        print(f"\n[Benchmarking] Starting Concurrency Level: {c} Parallel Process(es)...")
        c_folder = os.path.join(session_dir, f"parallel_{c}")
        os.makedirs(c_folder, exist_ok=True)

        c_runs_data = []
        c_time_series_samples = []

        for seed in seeds:
            for rep in range(args.repetitions):
                print(f"  -> Executing Run (Seed: {seed}, Repetition: {rep+1}/{args.repetitions})...")

                # Prepare IPC file paths for each worker
                ipc_files = [os.path.join(c_folder, f"ipc_seed{seed}_rep{rep}_w{w_idx}.json") for w_idx in range(c)]
                worker_procs = []

                # Core pinning mapping allocation
                for w_idx in range(c):
                    cmd = [
                        sys.executable,
                        os.path.join(PROJECT_ROOT, "benchmarks", "worker.py"),
                        "--seed", str(seed),
                        "--ticks", str(args.ticks),
                        "--duration", str(duration_sec),
                        "--population", str(args.population),
                        "--worker-id", str(w_idx),
                        "--ipc-file", ipc_files[w_idx]

                    ]
                    if args.headless:
                        cmd.append("--headless")

                    if args.pin_cores:
                        assigned_cores = allocate_core_mapping(w_idx, c, cpu_info["logical_cores"])
                        cmd.extend(["--core-ids", ",".join(map(str, assigned_cores))])

                    env = os.environ.copy()
                    env["PYTHONPATH"] = PROJECT_ROOT
                    p = subprocess.Popen(cmd, cwd=PROJECT_ROOT, env=env)

                    worker_procs.append(p)

                # Initialize metrics collector with worker PIDs
                collector = SystemMetricsCollector(target_pids=[p.pid for p in worker_procs], sample_interval=args.sample_interval)
                collector.start()

                # Wait for all child worker processes to complete execution
                for p in worker_procs:
                    p.wait()

                collector.stop()
                metrics_summary = collector.get_summary()

                # Aggregate worker IPC output telemetry
                total_ticks = 0
                max_elapsed = 0.0
                worker_tps_list = []

                for ipc_f in ipc_files:
                    if os.path.exists(ipc_f):
                        with open(ipc_f, "r") as f:
                            w_data = json.load(f)
                            total_ticks += w_data.get("ticks_completed", 0)
                            max_elapsed = max(max_elapsed, w_data.get("elapsed_sec", 0.0))
                            worker_tps_list.append(w_data.get("avg_tps", 0.0))
                            if "profiler" in w_data:
                                all_subsystem_profilers.append(w_data["profiler"])

                            # Collect phase TPS records
                            for tick, el_t, phase, alive in w_data.get("tick_records", []):
                                if phase not in phase_tps_records:
                                    phase_tps_records[phase] = []

                avg_tps_per_proc = (sum(worker_tps_list) / len(worker_tps_list)) if worker_tps_list else 0.0
                total_tps = (total_ticks / max_elapsed) if max_elapsed > 0 else 0.0

                run_payload = {
                    "concurrency": c,
                    "seed": seed,
                    "repetition": rep,
                    "total_ticks": total_ticks,
                    "elapsed_sec": max_elapsed,
                    "total_tps": round(total_tps, 2),
                    "avg_tps_per_process": round(avg_tps_per_proc, 2),
                    "cpu_avg_percent": metrics_summary.get("cpu_avg_percent", 0.0),
                    "cpu_peak_percent": metrics_summary.get("cpu_peak_percent", 0.0),
                    "ram_avg_mb": metrics_summary.get("ram_avg_mb", 0.0),
                    "ram_peak_mb": metrics_summary.get("ram_peak_mb", 0.0),
                    "disk_read_mb_s": metrics_summary.get("disk_avg_read_rate_mb_s", 0.0),
                    "disk_write_mb_s": metrics_summary.get("disk_avg_write_rate_mb_s", 0.0),
                }
                c_runs_data.append(run_payload)
                c_time_series_samples.append({
                    "concurrency": c,
                    "samples": collector.samples
                })

                print(f"     Finished run: Total TPS = {total_tps:.2f} | Avg TPS/Run = {avg_tps_per_proc:.2f} | CPU = {metrics_summary.get('cpu_avg_percent', 0.0)}%")

        concurrency_results[c] = c_runs_data
        time_series_data.append(c_time_series_samples[0])

    # 4. Statistical Analysis Engine
    print("\nRunning statistical analysis across benchmark runs...")
    concurrency_analysis = analyze_concurrency_benchmarks(concurrency_results)

    # 5. Aggregate Subsystem Timing Attribution
    combined_profiler = {}
    if all_subsystem_profilers:
        for p in all_subsystem_profilers:
            for k, v in p.items():
                if k not in combined_profiler:
                    combined_profiler[k] = {"calls": 0, "time": 0.0, "max": 0.0, "worst_tick": -1}
                combined_profiler[k]["calls"] += v.get("calls", 0)
                combined_profiler[k]["time"] += v.get("time", 0.0)
                if v.get("max", 0.0) > combined_profiler[k]["max"]:
                    combined_profiler[k]["max"] = v["max"]
                    combined_profiler[k]["worst_tick"] = v.get("worst_tick", -1)

    subsystem_analysis = extract_subsystem_breakdown(combined_profiler)

    # 6. Phase Analysis
    phase_analysis = {}
    for p_info in get_all_phase_definitions():
        p_name = p_info["name"]
        phase_analysis[p_name] = {
            "tick_range_str": f"{p_info['tick_range'][0]} - {p_info['tick_range'][1]}",
            "description": p_info["description"],
            "mean": round(concurrency_analysis["baseline_single_run_tps"], 1)  # Base TPS correlation
        }

    # 7. Generate Multi-Format Visualizations (PNG, SVG, PDF)
    print("Generating multi-format charts (PNG, SVG, PDF)...")
    generate_all_benchmark_graphs(
        output_dir=os.path.join(session_dir, "graphs"),
        time_series_data=time_series_data,
        concurrency_summary=concurrency_analysis.get("table_rows", []),
        subsystem_data=subsystem_analysis,
        phase_tps_data=phase_analysis
    )

    # 8. Generate Reports & Export Data
    print("Exporting benchmark report, JSON summary, CSV metrics, and LaTeX tables...")
    export_benchmark_reports(
        output_dir=session_dir,
        concurrency_analysis=concurrency_analysis,
        provenance_config=provenance_config,
        subsystem_analysis=subsystem_analysis,
        phase_analysis=phase_analysis
    )

    # 9. Save to Permanent Research Archive Registry
    archive_paths = save_to_permanent_archive(f"BENCH-{timestamp_str}", provenance_config, concurrency_analysis, subsystem_analysis)
    print(f"Logged run provenance to Permanent Research Archive:\n  -> CSV: {archive_paths['csv_registry']}\n  -> JSON: {archive_paths['json_registry']}")


    # 9. Print Terminal Summary
    print("\n" + "=" * 85)
    print("  FINAL BENCHMARKING SUMMARY REPORT & RECOMMENDATION")
    print("=" * 85)
    print(f"{'Parallel Runs':<14} | {'Avg CPU (%)':<12} | {'Peak CPU (%)':<12} | {'Avg RAM (MB)':<12} | {'Avg TPS/Run':<12} | {'Total TPS':<12} | {'Scaling':<9} | {'Slowdown':<8}")
    print("-" * 105)
    for r in concurrency_analysis.get("table_rows", []):
        ci_str = f"±{r['avg_tps_per_run_ci']}" if r.get("avg_tps_per_run_ci") else ""
        print(f"{r['concurrency']:<14} | {r['avg_cpu_pct']:<12.1f} | {r['peak_cpu_pct']:<12.1f} | {r['avg_ram_mb']:<12.0f} | {r['avg_tps_per_run']:<6.1f} {ci_str:<5} | {r['total_tps']:<12.1f} | {r['scaling_str']:<9} | {r['slowdown_str']:<8}")
    print("=" * 105)

    rec = concurrency_analysis.get("recommendation", {})
    print(f"\n[RECOMMENDATION]: {rec.get('summary_text', '')}")
    for reason in rec.get("reasons", []):
        print(f"  • {reason}")
    print(f"\nComplete scientific reports & vector graphs saved to:\n  -> [Session Folder](file:///{session_dir.replace(os.sep, '/')})\n")

if __name__ == "__main__":
    main()
