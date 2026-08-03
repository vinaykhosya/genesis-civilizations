"""
archive.py
==========
Permanent Research Benchmark Archive & Registry for Project Genesis.
Maintains historical provenance tracking across engine versions, CPU hardware upgrades, and algorithm iterations.
"""

import os
import json
import csv
import datetime
from typing import Dict, Any, List

ARCHIVE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "benchmarks", "archive")

def save_to_permanent_archive(
    session_id: str,
    provenance_config: Dict[str, Any],
    concurrency_analysis: Dict[str, Any],
    subsystem_analysis: Dict[str, Any]
) -> Dict[str, str]:
    """
    Appends benchmark session metrics to permanent historical registry (JSON index & CSV table).
    Allows comparing throughput and scaling efficiency across engine versions (e.g. v1.8 vs v2.3).
    """
    os.makedirs(ARCHIVE_DIR, exist_ok=True)

    json_registry_path = os.path.join(ARCHIVE_DIR, "index.json")
    csv_registry_path = os.path.join(ARCHIVE_DIR, "registry.csv")

    # 1. Load existing JSON index
    registry = {}
    if os.path.exists(json_registry_path):
        try:
            with open(json_registry_path, "r") as f:
                registry = json.load(f)
        except Exception:
            registry = {}

    benchmark_entry = {
        "benchmark_id": session_id,
        "date": datetime.datetime.now().isoformat(),
        "hardware": {
            "cpu": provenance_config.get("cpu"),
            "logical_cores": provenance_config.get("logical_cores"),
            "ram": provenance_config.get("ram"),
            "os": provenance_config.get("os")
        },
        "software": {
            "python": provenance_config.get("python"),
            "git_commit": provenance_config.get("git_commit"),
            "core_pinning": provenance_config.get("core_pinning")
        },
        "experiment_config": {
            "seeds": provenance_config.get("seeds"),
            "ticks_target": provenance_config.get("ticks_target"),
            "duration_target": provenance_config.get("duration_target"),
            "initial_population": provenance_config.get("initial_population", 200),
            "repetitions": provenance_config.get("repetitions")
        },
        "concurrency_summary": concurrency_analysis.get("table_rows", []),
        "recommendation": concurrency_analysis.get("recommendation", {}),
        "subsystem_profiling": subsystem_analysis
    }

    registry[session_id] = benchmark_entry

    with open(json_registry_path, "w") as f:
        json.dump(registry, f, indent=2)

    # 2. Append to CSV Registry
    file_exists = os.path.exists(csv_registry_path)
    fieldnames = [
        "benchmark_id", "date", "cpu", "logical_cores", "ram", "python", "git_commit",
        "ticks_target", "duration_target", "initial_population", "optimal_concurrency",
        "total_tps", "scaling_factor", "slowdown_pct"
    ]

    rec = concurrency_analysis.get("recommendation", {})

    row = {
        "benchmark_id": session_id,
        "date": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "cpu": provenance_config.get("cpu"),
        "logical_cores": provenance_config.get("logical_cores"),
        "ram": provenance_config.get("ram"),
        "python": provenance_config.get("python"),
        "git_commit": provenance_config.get("git_commit"),
        "ticks_target": provenance_config.get("ticks_target"),
        "duration_target": provenance_config.get("duration_target"),
        "initial_population": provenance_config.get("initial_population", 200),
        "optimal_concurrency": rec.get("optimal_concurrency", 1),
        "total_tps": rec.get("total_tps", 0.0),
        "scaling_factor": rec.get("scaling_str", "1.0x"),
        "slowdown_pct": rec.get("slowdown_str", "0.0%")
    }

    with open(csv_registry_path, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()
        writer.writerow(row)

    return {
        "json_registry": json_registry_path,
        "csv_registry": csv_registry_path
    }
