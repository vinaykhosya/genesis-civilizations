"""
graph_generator.py
===================
Publication-Quality Multi-Format Visualizer for Project Genesis Benchmarks.
Exports PNG, SVG, and PDF charts for direct LaTeX inclusion.
"""

import os
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt
import numpy as np
from typing import List, Dict, Any, Optional

# Visual Theme Configuration
plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
COLOR_PALETTE = ["#2563EB", "#7C3AED", "#059669", "#DC2626", "#D97706", "#2563EB"]

def save_plot_formats(fig, base_path_no_ext: str):
    """Saves matplotlib figure in PNG, SVG, and PDF formats."""
    for fmt in ["png", "svg", "pdf"]:
        filepath = f"{base_path_no_ext}.{fmt}"
        dpi = 300 if fmt == "png" else None
        fig.savefig(filepath, format=fmt, dpi=dpi, bbox_inches="tight")
    plt.close(fig)

def generate_all_benchmark_graphs(
    output_dir: str,
    time_series_data: List[Dict[str, Any]],
    concurrency_summary: List[Dict[str, Any]],
    subsystem_data: Optional[Dict[str, Any]] = None,
    phase_tps_data: Optional[Dict[str, Any]] = None
):
    """Generates all 7 required visualization charts in PNG, SVG, and PDF formats."""
    os.makedirs(output_dir, exist_ok=True)

    # 1. CPU Usage Over Time
    _plot_cpu_over_time(output_dir, time_series_data)

    # 2. RAM Usage Over Time
    _plot_ram_over_time(output_dir, time_series_data)

    # 3. TPS Over Time
    _plot_tps_over_time(output_dir, time_series_data)

    # 4. Total Throughput vs Concurrent Runs
    _plot_total_throughput(output_dir, concurrency_summary)

    # 5. Scaling Efficiency vs Concurrent Runs
    _plot_scaling_efficiency(output_dir, concurrency_summary)

    # 6. Subsystem Breakdown
    if subsystem_data and subsystem_data.get("available"):
        _plot_subsystem_breakdown(output_dir, subsystem_data)

    # 7. Simulation Phase vs TPS Correlation
    if phase_tps_data:
        _plot_phase_tps(output_dir, phase_tps_data)

def _plot_cpu_over_time(output_dir: str, time_series_data: List[Dict[str, Any]]):
    fig, ax = plt.subplots(figsize=(8, 4.5))
    for idx, run in enumerate(time_series_data):
        c = run.get("concurrency", idx + 1)
        times = [s["elapsed_sec"] for s in run["samples"]]
        cpus = [s["cpu_total_percent"] for s in run["samples"]]
        ax.plot(times, cpus, label=f"{c} Concurrent Run(s)", color=COLOR_PALETTE[idx % len(COLOR_PALETTE)], linewidth=1.8)

    ax.set_title("System CPU Utilization Over Time", fontsize=12, fontweight="bold", pad=12)
    ax.set_xlabel("Elapsed Time (seconds)", fontsize=10)
    ax.set_ylabel("CPU Utilization (%)", fontsize=10)
    ax.set_ylim(0, 105)
    ax.legend(loc="upper right", frameon=True)
    ax.grid(True, linestyle="--", alpha=0.6)
    save_plot_formats(fig, os.path.join(output_dir, "cpu_utilization_over_time"))

def _plot_ram_over_time(output_dir: str, time_series_data: List[Dict[str, Any]]):
    fig, ax = plt.subplots(figsize=(8, 4.5))
    for idx, run in enumerate(time_series_data):
        c = run.get("concurrency", idx + 1)
        times = [s["elapsed_sec"] for s in run["samples"]]
        rams = [s["ram_used_mb"] for s in run["samples"]]
        ax.plot(times, rams, label=f"{c} Concurrent Run(s)", color=COLOR_PALETTE[idx % len(COLOR_PALETTE)], linewidth=1.8)

    ax.set_title("System RAM Memory Footprint Over Time", fontsize=12, fontweight="bold", pad=12)
    ax.set_xlabel("Elapsed Time (seconds)", fontsize=10)
    ax.set_ylabel("RAM Usage (MB)", fontsize=10)
    ax.legend(loc="upper left", frameon=True)
    ax.grid(True, linestyle="--", alpha=0.6)
    save_plot_formats(fig, os.path.join(output_dir, "ram_usage_over_time"))

def _plot_tps_over_time(output_dir: str, time_series_data: List[Dict[str, Any]]):
    fig, ax = plt.subplots(figsize=(8, 4.5))
    for idx, run in enumerate(time_series_data):
        c = run.get("concurrency", idx + 1)
        times = run.get("tps_times", [])
        tps_vals = run.get("tps_values", [])
        if times and tps_vals:
            ax.plot(times, tps_vals, label=f"{c} Concurrent Run(s)", color=COLOR_PALETTE[idx % len(COLOR_PALETTE)], linewidth=1.8)

    ax.set_title("Simulation Instantaneous Throughput (TPS) Over Time", fontsize=12, fontweight="bold", pad=12)
    ax.set_xlabel("Elapsed Time (seconds)", fontsize=10)
    ax.set_ylabel("Aggregate Ticks Per Second (TPS)", fontsize=10)
    ax.legend(loc="upper right", frameon=True)
    ax.grid(True, linestyle="--", alpha=0.6)
    save_plot_formats(fig, os.path.join(output_dir, "tps_over_time"))

def _plot_total_throughput(output_dir: str, concurrency_summary: List[Dict[str, Any]]):
    fig, ax = plt.subplots(figsize=(7, 4.5))
    concs = [r["concurrency"] for r in concurrency_summary]
    tps = [r["total_tps"] for r in concurrency_summary]
    cis = [r.get("total_tps_ci", 0.0) for r in concurrency_summary]

    bars = ax.bar([str(c) for c in concs], tps, yerr=cis, capsize=5, color="#2563EB", edgecolor="#1D4ED8", width=0.5)

    for bar, val in zip(bars, tps):
        ax.text(bar.get_x() + bar.get_width()/2.0, bar.get_height() + (max(tps)*0.02), f"{val:.1f} TPS", ha="center", va="bottom", fontweight="bold", fontsize=9)

    ax.set_title("Total Aggregate Simulation Throughput vs Concurrency", fontsize=12, fontweight="bold", pad=12)
    ax.set_xlabel("Concurrent Simulation Processes", fontsize=10)
    ax.set_ylabel("Total Ticks Per Second (TPS)", fontsize=10)
    ax.set_ylim(0, max(tps) * 1.25 if tps else 10)
    ax.grid(True, linestyle="--", alpha=0.5, axis="y")
    save_plot_formats(fig, os.path.join(output_dir, "total_throughput_vs_concurrency"))

def _plot_scaling_efficiency(output_dir: str, concurrency_summary: List[Dict[str, Any]]):
    fig, ax = plt.subplots(figsize=(7, 4.5))
    concs = [r["concurrency"] for r in concurrency_summary]
    actual_scaling = [r["scaling_factor"] for r in concurrency_summary]
    ideal_scaling = [float(c) for c in concs]

    ax.plot(concs, ideal_scaling, "--", color="#9CA3AF", label="Ideal Linear Scaling (1.0x/run)", linewidth=1.5)
    ax.plot(concs, actual_scaling, "o-", color="#059669", label="Measured Scaling Factor", linewidth=2.2, markersize=7)

    for c, val in zip(concs, actual_scaling):
        ax.text(c, val + 0.08, f"{val:.2f}x", ha="center", va="bottom", fontweight="bold", color="#047857", fontsize=9)

    ax.set_title("Scaling Efficiency vs Parallel Concurrency", fontsize=12, fontweight="bold", pad=12)
    ax.set_xlabel("Concurrent Simulation Processes", fontsize=10)
    ax.set_ylabel("Scaling Factor (Relative to 1 Run)", fontsize=10)
    ax.set_xticks(concs)
    ax.legend(loc="upper left", frameon=True)
    ax.grid(True, linestyle="--", alpha=0.6)
    save_plot_formats(fig, os.path.join(output_dir, "scaling_efficiency_vs_concurrency"))

def _plot_subsystem_breakdown(output_dir: str, subsystem_data: Dict[str, Any]):
    subsys = subsystem_data.get("subsystems", {})
    if not subsys:
        return

    labels = [k.replace("_", " ").title() for k in subsys.keys()]
    pcts = [v["percentage"] for v in subsys.values()]

    fig, ax = plt.subplots(figsize=(7, 4.5))
    wedges, texts, autotexts = ax.pie(
        pcts,
        labels=labels,
        autopct="%1.1f%%",
        startangle=140,
        colors=COLOR_PALETTE[:len(labels)],
        textprops=dict(color="black", fontsize=9)
    )
    plt.setp(autotexts, size=9, weight="bold")
    ax.set_title("Subsystem Execution Time Attribution (%)", fontsize=12, fontweight="bold", pad=12)
    save_plot_formats(fig, os.path.join(output_dir, "subsystem_breakdown"))

def _plot_phase_tps(output_dir: str, phase_tps_data: Dict[str, Any]):
    phases = list(phase_tps_data.keys())
    tps_means = [phase_tps_data[p].get("mean", 0.0) for p in phases]

    fig, ax = plt.subplots(figsize=(8, 4.5))
    bars = ax.barh(phases, tps_means, color="#7C3AED", edgecolor="#6D28D9", height=0.5)

    for bar, val in zip(bars, tps_means):
        ax.text(bar.get_width() + 0.5, bar.get_y() + bar.get_height()/2.0, f"{val:.1f} TPS", ha="left", va="center", fontweight="bold", fontsize=9)

    ax.set_title("Throughput Across Simulation Emergence Phases", fontsize=12, fontweight="bold", pad=12)
    ax.set_xlabel("Average Ticks Per Second (TPS)", fontsize=10)
    ax.set_ylabel("Simulation Phase", fontsize=10)
    ax.grid(True, linestyle="--", alpha=0.5, axis="x")
    save_plot_formats(fig, os.path.join(output_dir, "phase_tps_correlation"))
