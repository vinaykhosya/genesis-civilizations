"""
subsystem_profiler.py
=====================
Attributes engine simulation runtime across distinct computational subsystems.
Guides optimization by highlighting percentage runtime breakdown without modifying simulation code.
"""

from typing import Dict, Any

SUBSYSTEM_NAMES = [
    "perception",
    "decision",
    "movement",
    "drives_relationships",
    "shelter",
    "ecology",
    "genetics",
    "saving",
    "telemetry"
]

def extract_subsystem_breakdown(world_profiler_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extracts subsystem timing breakdown from world profiler object.
    Computes total elapsed time, subsystem call counts, max call times, and percentages.
    """
    if not world_profiler_dict or not isinstance(world_profiler_dict, dict):
        return {
            "available": False,
            "message": "Subsystem profiler data unavailable in world object.",
            "subsystems": {}
        }
        
    total_time_ms = 0.0
    subsystems_raw = {}
    
    for key, data in world_profiler_dict.items():
        if isinstance(data, dict) and "time" in data:
            t_ms = float(data.get("time", 0.0))
            calls = int(data.get("calls", 0))
            max_ms = float(data.get("max", 0.0))
            subsystems_raw[key] = {
                "time_ms": t_ms,
                "calls": calls,
                "max_ms": max_ms,
                "worst_tick": int(data.get("worst_tick", -1))
            }
            total_time_ms += t_ms

    subsystems_formatted = {}
    for key, item in subsystems_raw.items():
        pct = (item["time_ms"] / total_time_ms * 100.0) if total_time_ms > 0 else 0.0
        subsystems_formatted[key] = {
            "time_ms": round(item["time_ms"], 2),
            "percentage": round(pct, 2),
            "calls": item["calls"],
            "max_ms": round(item["max_ms"], 2),
            "worst_tick": item["worst_tick"]
        }

    return {
        "available": True,
        "total_subsystem_time_ms": round(total_time_ms, 2),
        "subsystems": subsystems_formatted
    }
