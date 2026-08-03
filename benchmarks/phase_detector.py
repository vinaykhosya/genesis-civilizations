"""
phase_detector.py
=================
Simulation Phase Detection Engine for Project Genesis Benchmarks.
Tracks and correlates simulation life-cycle stages with performance metrics.
"""

from typing import Dict, Any, List

PHASES = [
    (0, 1000, "World Initialization", "Initializing terrain, biomes, seasonal noise, and founding agents"),
    (1000, 5000, "Founder Exploration", "Initial survival, resource discovery, shelter establishment"),
    (5000, 25000, "Population Expansion", "Reproduction boom, multi-colony growth, territory competition"),
    (25000, 100000, "Stable Civilization", "Social networks, trade, mature shelter networks, steady population"),
    (100000, float("inf"), "Late-Game Congestion", "High agent density, deep memory history, dense pathfinding interactions")
]

def detect_phase(tick: int) -> str:
    """Returns the phase name for a given simulation tick."""
    for start, end, name, _ in PHASES:
        if start <= tick < end:
            return name
    return "Late-Game Congestion"

def get_all_phase_definitions() -> List[Dict[str, Any]]:
    """Returns all defined simulation phase metadata."""
    return [
        {
            "name": name,
            "tick_range": [start, "inf" if end == float("inf") else end],
            "description": desc
        }
        for start, end, name, desc in PHASES
    ]
