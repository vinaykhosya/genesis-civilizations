# Project Genesis — Parallel Execution & Bottleneck Benchmark Report

## Executive Summary

**Recommendation**: **4 simultaneous experiments** provide the optimal balance between throughput and resource efficiency.

### Key Findings:
- Delivers 4.11x total throughput scaling (223.3 aggregate TPS).
- Per-simulation slowdown is constrained to only 0.0%.
- CPU utilization stays optimal at average 30.8%.
- Total system memory footprint remains low at 12863 MB.

---

## Concurrency Throughput & Scaling Summary

| Parallel Runs | Avg CPU (%) | Peak CPU (%) | Avg RAM (MB) | Avg TPS/Run | Total TPS | Scaling | Slowdown |
|:--------------|:------------|:-------------|:-------------|:------------|:----------|:--------|:---------|
| 1 | 13.0% | 26.9% | 12404 MB | 54.4 | 54.4 | **1.00x** | 0.0% |
| 2 | 16.9% | 27.7% | 12447 MB | 60.7 | 111.9 | **2.06x** | 0.0% |
| 3 | 23.8% | 51.0% | 12675 MB | 60.6 | 176.6 | **3.25x** | 0.0% |
| 4 | 30.8% | 43.9% | 12863 MB | 57.6 | 223.3 | **4.11x** | 0.0% |

---

## Subsystem Runtime Profiling Breakdown

| Subsystem | Execution Time (ms) | Runtime Share (%) | Call Count | Max Tick Time (ms) | Worst Tick |
|:----------|:-------------------|:------------------|:-----------|:-------------------|:-----------|
| Perception | 12353.9 | **32.1%** | 61995 | 1.2 | Tick 129 |
| Decision | 19593.2 | **51.0%** | 35481 | 1.4 | Tick 120 |
| Movement | 1369.8 | **3.6%** | 61995 | 0.7 | Tick 217 |
| Drives Relationships | 1993.6 | **5.2%** | 61995 | 0.8 | Tick 124 |
| Emotion Clock | 66.7 | **0.2%** | 2086 | 0.1 | Tick 60 |
| Relationship Clock | 5.8 | **0.0%** | 431 | 0.1 | Tick 240 |
| Motivation Clock | 0.0 | **0.0%** | 0 | 0.0 | Tick -1 |
| Neural Predictor | 511.4 | **1.3%** | 12120 | 0.0 | Tick -1 |
| Memory Pruning | 0.0 | **0.0%** | 0 | 0.0 | Tick -1 |
| Reproduction | 83.8 | **0.2%** | 3000 | 0.7 | Tick 1 |
| Ecology | 2437.2 | **6.3%** | 3000 | 22.5 | Tick 121 |
| Logging | 1.8 | **0.0%** | 3000 | 0.0 | Tick 100 |
| Callback | 25.9 | **0.1%** | 3000 | 0.0 | Tick 29 |

---

## Simulation Emergence Phase Performance

| Simulation Phase | Tick Range | Avg Throughput (TPS) | Phase Characteristics |
|:-----------------|:-----------|:---------------------|:----------------------|
| World Initialization | 0 - 1000 | **54.4 TPS** | Initializing terrain, biomes, seasonal noise, and founding agents |
| Founder Exploration | 1000 - 5000 | **54.4 TPS** | Initial survival, resource discovery, shelter establishment |
| Population Expansion | 5000 - 25000 | **54.4 TPS** | Reproduction boom, multi-colony growth, territory competition |
| Stable Civilization | 25000 - 100000 | **54.4 TPS** | Social networks, trade, mature shelter networks, steady population |
| Late-Game Congestion | 100000 - inf | **54.4 TPS** | High agent density, deep memory history, dense pathfinding interactions |

---

## Provenance & Hardware Environment

- **Processor**: `AMD Ryzen 7 6800H with Radeon Graphics`
- **Memory**: `15.2GB`
- **OS**: `Windows 10 (10.0.26200)`
- **Python Version**: `3.11.0`
- **Git Commit Hash**: `949e053`
- **Random Seeds Tested**: `[1720]`
- **Core Pinning**: `True`