"""
analysis.py
===========
Statistical Analysis Engine for Project Genesis Benchmarks.
Calculates TPS throughput scaling, slowdown %, 95% confidence intervals, and decision-grade recommendations.
"""

import math
import numpy as np
from typing import List, Dict, Any, Tuple

def calculate_stats(data: List[float]) -> Dict[str, float]:
    """Calculates mean, stddev, min, max, and 95% confidence interval for a numerical list."""
    if not data:
        return {"mean": 0.0, "stddev": 0.0, "min": 0.0, "max": 0.0, "ci_95": 0.0}

    n = len(data)
    mean = float(np.mean(data))
    stddev = float(np.std(data, ddof=1)) if n > 1 else 0.0
    sem = stddev / math.sqrt(n) if n > 0 else 0.0
    ci_95 = 1.96 * sem

    return {
        "mean": round(mean, 2),
        "stddev": round(stddev, 2),
        "min": round(float(np.min(data)), 2),
        "max": round(float(np.max(data)), 2),
        "ci_95": round(ci_95, 2)
    }

def analyze_concurrency_benchmarks(concurrency_results: Dict[int, List[Dict[str, Any]]]) -> Dict[str, Any]:
    """
    Analyzes benchmark runs across concurrency levels (e.g. N = 1, 2, 3, 4).
    Computes single-run baseline, total throughput, scaling factor, and slowdown percentage.
    """
    sorted_concurrencies = sorted(concurrency_results.keys())
    if not sorted_concurrencies:
        return {}

    # Find single-run baseline (N = 1)
    baseline_concurrency = sorted_concurrencies[0]
    baseline_runs = concurrency_results[baseline_concurrency]

    # Baseline TPS per process
    baseline_tps_list = [run["avg_tps_per_process"] for run in baseline_runs]
    baseline_stats = calculate_stats(baseline_tps_list)
    baseline_tps = baseline_stats["mean"] if baseline_stats["mean"] > 0 else 1.0

    table_rows = []
    concurrency_summary = {}

    for c in sorted_concurrencies:
        runs = concurrency_results[c]

        # Extract metrics across repetitions/seeds
        avg_tps_per_run_list = [r["avg_tps_per_process"] for r in runs]
        total_tps_list = [r["total_tps"] for r in runs]
        cpu_avg_list = [r["cpu_avg_percent"] for r in runs]
        cpu_peak_list = [r["cpu_peak_percent"] for r in runs]
        ram_avg_list = [r["ram_avg_mb"] for r in runs]

        avg_tps_stats = calculate_stats(avg_tps_per_run_list)
        total_tps_stats = calculate_stats(total_tps_list)
        cpu_avg_stats = calculate_stats(cpu_avg_list)
        cpu_peak_stats = calculate_stats(cpu_peak_list)
        ram_avg_stats = calculate_stats(ram_avg_list)

        # Throughput scaling: Total TPS / Single Run Baseline TPS
        scaling_factor = total_tps_stats["mean"] / baseline_tps if baseline_tps > 0 else 1.0

        # Slowdown %: (Baseline TPS - Avg TPS per process) / Baseline TPS * 100
        slowdown_pct = ((baseline_tps - avg_tps_stats["mean"]) / baseline_tps * 100.0) if baseline_tps > 0 else 0.0
        slowdown_pct = max(0.0, slowdown_pct)

        row = {
            "concurrency": c,
            "avg_cpu_pct": cpu_avg_stats["mean"],
            "peak_cpu_pct": cpu_peak_stats["max"],
            "avg_ram_mb": ram_avg_stats["mean"],
            "avg_tps_per_run": avg_tps_stats["mean"],
            "avg_tps_per_run_ci": avg_tps_stats["ci_95"],
            "total_tps": total_tps_stats["mean"],
            "total_tps_ci": total_tps_stats["ci_95"],
            "scaling_factor": round(scaling_factor, 2),
            "scaling_str": f"{scaling_factor:.2f}x",
            "slowdown_pct": round(slowdown_pct, 1),
            "slowdown_str": f"{slowdown_pct:.1f}%"
        }
        table_rows.append(row)
        concurrency_summary[c] = row

    # Produce Scientific Recommendation based strictly on empirical measurements
    recommendation = generate_scientific_recommendation(table_rows)

    return {
        "baseline_single_run_tps": baseline_tps,
        "concurrency_summary": concurrency_summary,
        "table_rows": table_rows,
        "recommendation": recommendation
    }

def generate_scientific_recommendation(table_rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generates an empirical, data-backed recommendation for optimal simulation parallelism."""
    if not table_rows:
        return {"optimal_concurrency": 1, "reasoning": "Insufficient benchmark data."}

    # Find highest total throughput run
    best_throughput_row = max(table_rows, key=lambda r: r["total_tps"])

    # Find optimal balance (maximum scaling efficiency where slowdown <= 15%)
    efficient_rows = [r for r in table_rows if r["slowdown_pct"] <= 15.0]
    optimal_balance_row = max(efficient_rows, key=lambda r: r["scaling_factor"]) if efficient_rows else best_throughput_row

    opt_c = optimal_balance_row["concurrency"]
    opt_scaling = optimal_balance_row["scaling_str"]
    opt_slowdown = optimal_balance_row["slowdown_str"]
    opt_tps = optimal_balance_row["total_tps"]
    opt_cpu = optimal_balance_row["avg_cpu_pct"]
    opt_ram = optimal_balance_row["avg_ram_mb"]

    reasons = [
        f"Delivers {opt_scaling} total throughput scaling ({opt_tps:.1f} aggregate TPS).",
        f"Per-simulation slowdown is constrained to only {opt_slowdown}.",
        f"CPU utilization stays optimal at average {opt_cpu:.1f}%.",
        f"Total system memory footprint remains low at {opt_ram:.0f} MB."
    ]

    summary_text = (
        f"**{opt_c} simultaneous experiments** provide the optimal balance between throughput and resource efficiency."
    )

    if opt_c < len(table_rows) and table_rows[-1]["slowdown_pct"] > 20.0:
        summary_text += f" Higher concurrency ({table_rows[-1]['concurrency']} runs) saturates CPU core cache and causes elevated per-simulation slowdown ({table_rows[-1]['slowdown_str']})."

    return {
        "optimal_concurrency": opt_c,
        "scaling_str": opt_scaling,
        "slowdown_str": opt_slowdown,
        "total_tps": opt_tps,
        "avg_cpu_pct": opt_cpu,
        "avg_ram_mb": opt_ram,
        "summary_text": summary_text,
        "reasons": reasons
    }
