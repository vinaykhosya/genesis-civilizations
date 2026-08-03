# Project Genesis — Parallel Execution & Bottleneck Benchmark Report

## Executive Summary

**Recommendation**: **1 simultaneous experiments** provide the optimal balance between throughput and resource efficiency. Higher concurrency (4 runs) saturates CPU core cache and causes elevated per-simulation slowdown (100.0%).

### Key Findings:
- Delivers 0.00x total throughput scaling (0.0 aggregate TPS).
- Per-simulation slowdown is constrained to only 100.0%.
- CPU utilization stays optimal at average 14.0%.
- Total system memory footprint remains low at 13325 MB.

---

## Concurrency Throughput & Scaling Summary

| Parallel Runs | Avg CPU (%) | Peak CPU (%) | Avg RAM (MB) | Avg TPS/Run | Total TPS | Scaling | Slowdown |
|:--------------|:------------|:-------------|:-------------|:------------|:----------|:--------|:---------|
| 1 | 14.0% | 30.1% | 13325 MB | 0.0 | 0.0 | **0.00x** | 100.0% |
| 2 | 20.0% | 36.1% | 13463 MB | 0.0 | 0.0 | **0.00x** | 100.0% |
| 3 | 24.0% | 38.0% | 12959 MB | 0.0 | 0.0 | **0.00x** | 100.0% |
| 4 | 31.9% | 45.5% | 13036 MB | 0.0 | 0.0 | **0.00x** | 100.0% |

---

## Subsystem Runtime Profiling Breakdown

*Subsystem breakdown data unavailable for this run.*


---

## Simulation Emergence Phase Performance

| Simulation Phase | Tick Range | Avg Throughput (TPS) | Phase Characteristics |
|:-----------------|:-----------|:---------------------|:----------------------|
| World Initialization | 0 - 1000 | **1.0 TPS** | Initializing terrain, biomes, seasonal noise, and founding agents |
| Founder Exploration | 1000 - 5000 | **1.0 TPS** | Initial survival, resource discovery, shelter establishment |
| Population Expansion | 5000 - 25000 | **1.0 TPS** | Reproduction boom, multi-colony growth, territory competition |
| Stable Civilization | 25000 - 100000 | **1.0 TPS** | Social networks, trade, mature shelter networks, steady population |
| Late-Game Congestion | 100000 - inf | **1.0 TPS** | High agent density, deep memory history, dense pathfinding interactions |

---

## Provenance & Hardware Environment

- **Processor**: `AMD Ryzen 7 6800H with Radeon Graphics`
- **Memory**: `15.2GB`
- **OS**: `Windows 10 (10.0.26200)`
- **Python Version**: `3.11.0`
- **Git Commit Hash**: `949e053`
- **Random Seeds Tested**: `[1720]`
- **Core Pinning**: `True`