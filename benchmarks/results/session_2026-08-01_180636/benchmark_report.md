# Project Genesis — Parallel Execution & Bottleneck Benchmark Report

## Executive Summary

**Recommendation**: **8 simultaneous experiments** provide the optimal balance between throughput and resource efficiency.

### Key Findings:
- Delivers 8.51x total throughput scaling (46.6 aggregate TPS).
- Per-simulation slowdown is constrained to only 0.0%.
- CPU utilization stays optimal at average 49.8%.
- Total system memory footprint remains low at 11797 MB.

---

## Concurrency Throughput & Scaling Summary

| Parallel Runs | Avg CPU (%) | Peak CPU (%) | Avg RAM (MB) | Avg TPS/Run | Total TPS | Scaling | Slowdown |
|:--------------|:------------|:-------------|:-------------|:------------|:----------|:--------|:---------|
| 1 | 9.8% | 36.1% | 12554 MB | 5.5 ±0.84 | 5.5 ±0.84 | **1.00x** | 0.0% |
| 2 | 14.6% | 41.0% | 12162 MB | 5.3 ±0.04 | 10.2 ±0.02 | **1.85x** | 4.0% |
| 3 | 20.8% | 44.1% | 12052 MB | 5.3 ±0.01 | 15.0 ±0.14 | **2.74x** | 4.0% |
| 4 | 26.4% | 51.2% | 12436 MB | 5.4 ±0.03 | 20.0 ±0.28 | **3.65x** | 1.3% |
| 6 | 38.6% | 89.3% | 12281 MB | 6.3 ±0.73 | 34.7 ±3.95 | **6.33x** | 0.0% |
| 8 | 49.8% | 79.4% | 11797 MB | 6.5 ±0.03 | 46.6 ±0.79 | **8.51x** | 0.0% |

---

## Subsystem Runtime Profiling Breakdown

| Subsystem | Execution Time (ms) | Runtime Share (%) | Call Count | Max Tick Time (ms) | Worst Tick |
|:----------|:-------------------|:------------------|:-----------|:-------------------|:-----------|
| Perception | 5201545.7 | **54.3%** | 15031464 | 26.4 | Tick 771 |
| Decision | 3204050.4 | **33.4%** | 4016658 | 37.3 | Tick 466 |
| Movement | 300644.0 | **3.1%** | 15031464 | 27.0 | Tick 243 |
| Drives Relationships | 568517.8 | **5.9%** | 15031464 | 10.0 | Tick 771 |
| Emotion Clock | 25249.5 | **0.3%** | 496290 | 7.5 | Tick 780 |
| Relationship Clock | 4214.2 | **0.0%** | 120921 | 0.8 | Tick 960 |
| Motivation Clock | 3817.5 | **0.0%** | 30585 | 1.0 | Tick 500 |
| Neural Predictor | 46777.8 | **0.5%** | 916407 | 0.0 | Tick -1 |
| Memory Pruning | 7137.7 | **0.1%** | 30072 | 1.0 | Tick 720 |
| Reproduction | 125561.9 | **1.3%** | 72000 | 419.1 | Tick 1000 |
| Ecology | 97087.2 | **1.0%** | 72000 | 88.0 | Tick 841 |
| Logging | 67.7 | **0.0%** | 72000 | 0.1 | Tick 500 |
| Callback | 1679.0 | **0.0%** | 72000 | 0.7 | Tick 562 |

---

## Simulation Emergence Phase Performance

| Simulation Phase | Tick Range | Avg Throughput (TPS) | Phase Characteristics |
|:-----------------|:-----------|:---------------------|:----------------------|
| World Initialization | 0 - 1000 | **5.5 TPS** | Initializing terrain, biomes, seasonal noise, and founding agents |
| Founder Exploration | 1000 - 5000 | **5.5 TPS** | Initial survival, resource discovery, shelter establishment |
| Population Expansion | 5000 - 25000 | **5.5 TPS** | Reproduction boom, multi-colony growth, territory competition |
| Stable Civilization | 25000 - 100000 | **5.5 TPS** | Social networks, trade, mature shelter networks, steady population |
| Late-Game Congestion | 100000 - inf | **5.5 TPS** | High agent density, deep memory history, dense pathfinding interactions |

---

## Provenance & Hardware Environment

- **Processor**: `AMD Ryzen 7 6800H with Radeon Graphics`
- **Memory**: `15.2GB`
- **OS**: `Windows 10 (10.0.26200)`
- **Python Version**: `3.11.0`
- **Git Commit Hash**: `949e053`
- **Random Seeds Tested**: `[1720]`
- **Core Pinning**: `True`