"""
metrics_collector.py
====================
System & Process Metric Collector for Project Genesis Benchmarks.
Uses psutil to sample high-frequency CPU (per-core), RAM, Disk I/O, context switches, and process state.
"""

import time
import threading
import sys
import psutil
from typing import List, Dict, Any, Optional

class SystemMetricsCollector:
    """
    Background threaded metrics collector.
    Samples system performance counters and target worker processes at regular intervals (default 0.5s).
    """

    def __init__(self, target_pids: Optional[List[int]] = None, sample_interval: float = 0.5):
        self.target_pids = target_pids or []
        self.sample_interval = sample_interval
        self._running = False
        self._thread: Optional[threading.Thread] = None
        self.samples: List[Dict[str, Any]] = []

        # Disk initial state baseline
        try:
            self._disk_base = psutil.disk_io_counters()
            self._disk_available = self._disk_base is not None
        except Exception:
            self._disk_base = None
            self._disk_available = False

        self._start_time = 0.0

    def add_target_pid(self, pid: int):
        if pid not in self.target_pids:
            self.target_pids.append(pid)

    def start(self):
        """Starts background metric collection loop."""
        self._running = True
        self._start_time = time.perf_counter()
        self.samples = []
        self._thread = threading.Thread(target=self._collect_loop, daemon=True)
        self._thread.start()

    def stop(self):
        """Stops background metric collection loop and joins thread."""
        self._running = False
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=2.0)

    def _collect_loop(self):
        # Warmup psutil CPU percent calculation
        psutil.cpu_percent(percpu=True)
        prev_time = time.perf_counter()

        prev_disk = psutil.disk_io_counters() if self._disk_available else None

        while self._running:
            t_now = time.perf_counter()
            elapsed = t_now - self._start_time
            dt = t_now - prev_time if t_now > prev_time else self.sample_interval
            prev_time = t_now

            # 1. CPU Metrics
            cpu_per_core = psutil.cpu_percent(percpu=True)
            cpu_total = sum(cpu_per_core) / max(1, len(cpu_per_core))

            # 2. CPU Freq & Context Switches
            try:
                cpu_freq = psutil.cpu_freq()
                current_freq_mhz = cpu_freq.current if cpu_freq else 0.0
            except Exception:
                current_freq_mhz = 0.0

            # 3. RAM Metrics
            vm = psutil.virtual_memory()
            ram_used_mb = vm.used / (1024 * 1024)
            ram_total_mb = vm.total / (1024 * 1024)
            ram_pct = vm.percent

            # 4. Disk Metrics
            disk_read_rate_mb = 0.0
            disk_write_rate_mb = 0.0
            total_read_mb = 0.0
            total_write_mb = 0.0

            if self._disk_available:
                try:
                    curr_disk = psutil.disk_io_counters()
                    if curr_disk and prev_disk and dt > 0:
                        read_bytes_diff = max(0, curr_disk.read_bytes - prev_disk.read_bytes)
                        write_bytes_diff = max(0, curr_disk.write_bytes - prev_disk.write_bytes)
                        disk_read_rate_mb = (read_bytes_diff / (1024 * 1024)) / dt
                        disk_write_rate_mb = (write_bytes_diff / (1024 * 1024)) / dt

                    if curr_disk and self._disk_base:
                        total_read_mb = max(0, curr_disk.read_bytes - self._disk_base.read_bytes) / (1024 * 1024)
                        total_write_mb = max(0, curr_disk.write_bytes - self._disk_base.write_bytes) / (1024 * 1024)

                    prev_disk = curr_disk
                except Exception:
                    self._disk_available = False

            # 5. Process Specific Metrics
            proc_metrics = {}
            total_proc_cpu = 0.0
            total_proc_ram_rss_mb = 0.0
            total_voluntary_ctx = 0
            total_involuntary_ctx = 0

            for pid in self.target_pids:
                try:
                    p = psutil.Process(pid)
                    with p.oneshot():
                        p_cpu = p.cpu_percent(interval=None)
                        p_mem = p.memory_info()
                        rss_mb = p_mem.rss / (1024 * 1024)
                        vms_mb = p_mem.vms / (1024 * 1024)

                        ctx = p.num_ctx_switches() if hasattr(p, "num_ctx_switches") else None
                        vol_ctx = ctx.voluntary if ctx else 0
                        invol_ctx = ctx.involuntary if ctx else 0

                        proc_metrics[str(pid)] = {
                            "cpu_percent": p_cpu,
                            "ram_rss_mb": round(rss_mb, 2),
                            "ram_vms_mb": round(vms_mb, 2),
                            "voluntary_ctx_switches": vol_ctx,
                            "involuntary_ctx_switches": invol_ctx
                        }
                        total_proc_cpu += p_cpu
                        total_proc_ram_rss_mb += rss_mb
                        total_voluntary_ctx += vol_ctx
                        total_involuntary_ctx += invol_ctx
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass

            sample = {
                "elapsed_sec": round(elapsed, 3),
                "cpu_total_percent": round(cpu_total, 2),
                "cpu_per_core": [round(c, 2) for c in cpu_per_core],
                "cpu_freq_mhz": round(current_freq_mhz, 1),
                "ram_used_mb": round(ram_used_mb, 2),
                "ram_total_mb": round(ram_total_mb, 2),
                "ram_percent": round(ram_pct, 2),
                "disk_read_rate_mb_s": round(disk_read_rate_mb, 3),
                "disk_write_rate_mb_s": round(disk_write_rate_mb, 3),
                "total_disk_read_mb": round(total_read_mb, 2),
                "total_disk_write_mb": round(total_write_mb, 2),
                "disk_metrics_available": self._disk_available,
                "process_total_cpu_percent": round(total_proc_cpu, 2),
                "process_total_ram_rss_mb": round(total_proc_ram_rss_mb, 2),
                "total_voluntary_ctx": total_voluntary_ctx,
                "total_involuntary_ctx": total_involuntary_ctx,
                "processes": proc_metrics
            }

            self.samples.append(sample)
            time.sleep(self.sample_interval)

    def get_summary(self) -> Dict[str, Any]:
        """Calculates statistical summary across all collected samples."""
        if not self.samples:
            return {}

        cpu_vals = [s["cpu_total_percent"] for s in self.samples]
        ram_vals = [s["ram_used_mb"] for s in self.samples]
        disk_r_vals = [s["disk_read_rate_mb_s"] for s in self.samples]
        disk_w_vals = [s["disk_write_rate_mb_s"] for s in self.samples]

        # Per core average
        n_cores = len(self.samples[0]["cpu_per_core"])
        per_core_avg = []
        for c_idx in range(n_cores):
            c_vals = [s["cpu_per_core"][c_idx] for s in self.samples if c_idx < len(s["cpu_per_core"])]
            per_core_avg.append(round(sum(c_vals) / max(1, len(c_vals)), 2))

        last_sample = self.samples[-1]

        return {
            "duration_sec": round(self.samples[-1]["elapsed_sec"], 2),
            "sample_count": len(self.samples),
            "cpu_avg_percent": round(sum(cpu_vals) / len(cpu_vals), 2),
            "cpu_peak_percent": round(max(cpu_vals), 2),
            "cpu_per_core_avg": per_core_avg,
            "ram_avg_mb": round(sum(ram_vals) / len(ram_vals), 2),
            "ram_peak_mb": round(max(ram_vals), 2),
            "disk_avg_read_rate_mb_s": round(sum(disk_r_vals) / len(disk_r_vals), 3),
            "disk_avg_write_rate_mb_s": round(sum(disk_w_vals) / len(disk_w_vals), 3),
            "total_disk_read_mb": last_sample.get("total_disk_read_mb", 0.0),
            "total_disk_write_mb": last_sample.get("total_disk_write_mb", 0.0),
            "disk_metrics_available": last_sample.get("disk_metrics_available", True),
            "total_voluntary_ctx": last_sample.get("total_voluntary_ctx", 0),
            "total_involuntary_ctx": last_sample.get("total_involuntary_ctx", 0)
        }
