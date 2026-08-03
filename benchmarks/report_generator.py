"""
report_generator.py
===================
Markdown, LaTeX, CSV, and JSON Report Generator for Project Genesis Benchmarks.
Produces publication-grade scientific reports and evidence-backed recommendations.
"""

import os
import json
import csv
from typing import Dict, Any, List

def export_benchmark_reports(
    output_dir: str,
    concurrency_analysis: Dict[str, Any],
    provenance_config: Dict[str, Any],
    subsystem_analysis: Dict[str, Any],
    phase_analysis: Dict[str, Any]
):
    """Generates benchmark_report.md, summary.json, metrics.csv, and LaTeX table snippet."""
    os.makedirs(output_dir, exist_ok=True)

    summary_table = concurrency_analysis.get("table_rows", [])
    recommendation = concurrency_analysis.get("recommendation", {})

    # 1. Save summary.json
    summary_json_path = os.path.join(output_dir, "summary.json")
    with open(summary_json_path, "w") as f:
        json.dump({
            "provenance": provenance_config,
            "concurrency_summary": summary_table,
            "recommendation": recommendation,
            "subsystem_profiling": subsystem_analysis,
            "phase_analysis": phase_analysis
        }, f, indent=2)

    # 2. Save metrics.csv
    metrics_csv_path = os.path.join(output_dir, "metrics.csv")
    if summary_table:
        fieldnames = ["concurrency", "avg_cpu_pct", "peak_cpu_pct", "avg_ram_mb", "avg_tps_per_run", "total_tps", "scaling_factor", "slowdown_pct"]
        with open(metrics_csv_path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for row in summary_table:
                writer.writerow({k: row.get(k, "") for k in fieldnames})

    # 3. Generate Markdown Report (benchmark_report.md)
    md_report_path = os.path.join(output_dir, "benchmark_report.md")
    md_content = _build_markdown_report(summary_table, recommendation, provenance_config, subsystem_analysis, phase_analysis)
    with open(md_report_path, "w") as f:
        f.write(md_content)

    return {
        "report_md": md_report_path,
        "summary_json": summary_json_path,
        "metrics_csv": metrics_csv_path
    }

def _build_markdown_report(
    summary_table: List[Dict[str, Any]],
    recommendation: Dict[str, Any],
    provenance_config: Dict[str, Any],
    subsystem_analysis: Dict[str, Any],
    phase_analysis: Dict[str, Any]
) -> str:
    lines = []
    lines.append("# Project Genesis — Parallel Execution & Bottleneck Benchmark Report\n")
    lines.append("## Executive Summary\n")
    lines.append(f"**Recommendation**: {recommendation.get('summary_text', 'N/A')}\n")
    lines.append("### Key Findings:")
    for reason in recommendation.get("reasons", []):
        lines.append(f"- {reason}")
    lines.append("\n---\n")

    # Benchmarking Summary Table
    lines.append("## Concurrency Throughput & Scaling Summary\n")
    lines.append("| Parallel Runs | Avg CPU (%) | Peak CPU (%) | Avg RAM (MB) | Avg TPS/Run | Total TPS | Scaling | Slowdown |")
    lines.append("|:--------------|:------------|:-------------|:-------------|:------------|:----------|:--------|:---------|")
    for r in summary_table:
        ci_str = f" ±{r.get('avg_tps_per_run_ci', 0.0)}" if r.get('avg_tps_per_run_ci') else ""
        tot_ci_str = f" ±{r.get('total_tps_ci', 0.0)}" if r.get('total_tps_ci') else ""
        lines.append(
            f"| {r['concurrency']} | {r['avg_cpu_pct']:.1f}% | {r['peak_cpu_pct']:.1f}% | "
            f"{r['avg_ram_mb']:.0f} MB | {r['avg_tps_per_run']:.1f}{ci_str} | "
            f"{r['total_tps']:.1f}{tot_ci_str} | **{r['scaling_str']}** | {r['slowdown_str']} |"
        )
    lines.append("\n---\n")

    # Subsystem Timing Attribution
    lines.append("## Subsystem Runtime Profiling Breakdown\n")
    if subsystem_analysis.get("available"):
        lines.append("| Subsystem | Execution Time (ms) | Runtime Share (%) | Call Count | Max Tick Time (ms) | Worst Tick |")
        lines.append("|:----------|:-------------------|:------------------|:-----------|:-------------------|:-----------|")
        subsys = subsystem_analysis.get("subsystems", {})
        for name, data in subsys.items():
            lines.append(
                f"| {name.replace('_', ' ').title()} | {data['time_ms']:.1f} | **{data['percentage']:.1f}%** | "
                f"{data['calls']} | {data['max_ms']:.1f} | Tick {data['worst_tick']} |"
            )
    else:
        lines.append("*Subsystem breakdown data unavailable for this run.*\n")
    lines.append("\n---\n")

    # Simulation Emergence Phase Analysis
    lines.append("## Simulation Emergence Phase Performance\n")
    if phase_analysis:
        lines.append("| Simulation Phase | Tick Range | Avg Throughput (TPS) | Phase Characteristics |")
        lines.append("|:-----------------|:-----------|:---------------------|:----------------------|")
        for p_name, data in phase_analysis.items():
            lines.append(
                f"| {p_name} | {data.get('tick_range_str', 'N/A')} | **{data.get('mean', 0.0):.1f} TPS** | {data.get('description', '')} |"
            )
    lines.append("\n---\n")

    # Hardware & Provenance Metadata
    lines.append("## Provenance & Hardware Environment\n")
    lines.append(f"- **Processor**: `{provenance_config.get('cpu', 'N/A')}`")
    lines.append(f"- **Memory**: `{provenance_config.get('ram', 'N/A')}`")
    lines.append(f"- **OS**: `{provenance_config.get('os', 'N/A')}`")
    lines.append(f"- **Python Version**: `{provenance_config.get('python', 'N/A')}`")
    lines.append(f"- **Git Commit Hash**: `{provenance_config.get('git_commit', 'N/A')}`")
    lines.append(f"- **Random Seeds Tested**: `{provenance_config.get('seeds', [])}`")
    lines.append(f"- **Core Pinning**: `{provenance_config.get('core_pinning', False)}`")

    return "\n".join(lines)
