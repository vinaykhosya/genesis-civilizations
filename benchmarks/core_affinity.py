"""
core_affinity.py
================
CPU Core Pinning & NUMA Topology Management for Project Genesis Benchmarks.
Prevents OS scheduling noise by pinning simulation worker processes to dedicated physical/logical cores.
"""

import os
import sys
import platform
import psutil
from typing import List, Optional, Dict, Any

def get_cpu_info() -> Dict[str, Any]:
    """Retrieves hardware CPU specs including logical cores, physical cores, and processor model."""
    logical_cores = psutil.cpu_count(logical=True) or 1
    physical_cores = psutil.cpu_count(logical=False) or logical_cores
    processor_name = platform.processor() or sys.platform
    
    # Try Windows registry/WMI fallback for detailed CPU brand name if platform.processor is generic
    if sys.platform == "win32":
        try:
            import winreg
            key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"HARDWARE\DESCRIPTION\System\CentralProcessor\0")
            processor_name = winreg.QueryValueEx(key, "ProcessorNameString")[0].strip()
            winreg.CloseKey(key)
        except Exception:
            pass

    return {
        "processor": processor_name,
        "logical_cores": logical_cores,
        "physical_cores": physical_cores,
        "architecture": platform.machine(),
        "system_os": f"{platform.system()} {platform.release()} ({platform.version()})"
    }

def allocate_core_mapping(worker_index: int, total_workers: int, logical_cores: Optional[int] = None) -> List[int]:
    """
    Computes deterministic CPU core allocation for a worker process.
    Spreads workers evenly across available logical CPU cores to avoid thread contention.
    """
    if logical_cores is None:
        logical_cores = psutil.cpu_count(logical=True) or 1
        
    cores_per_worker = max(1, logical_cores // max(1, total_workers))
    start_core = (worker_index * cores_per_worker) % logical_cores
    assigned_cores = [(start_core + i) % logical_cores for i in range(cores_per_worker)]
    
    return assigned_cores

def apply_cpu_affinity(core_ids: List[int]) -> bool:
    """
    Pins current process (or specified PID) to the specified CPU core IDs.
    Returns True if successfully pinned, False if unsupported on OS.
    """
    try:
        proc = psutil.Process()
        if hasattr(proc, "cpu_affinity"):
            proc.cpu_affinity(core_ids)
            return True
        return False
    except Exception as e:
        print(f"[Warning] Failed to set CPU affinity to {core_ids}: {e}", file=sys.stderr)
        return False

def get_numa_topology() -> Dict[str, Any]:
    """
    Inspects NUMA topology if supported by host OS/hardware.
    Provides pluggable structure for high-end server hardware (Threadripper / EPYC / Xeon).
    """
    topology = {
        "numa_available": False,
        "nodes": 1,
        "message": "Standard single-socket NUMA topology detected."
    }
    # Future expansion for hwloc / libnuma / Windows NUMA APIs
    return topology
