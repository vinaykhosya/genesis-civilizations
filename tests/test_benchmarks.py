"""
test_benchmarks.py
===================
Unit testing suite for Project Genesis Benchmarking Framework.
"""

import os
import sys
import unittest
import numpy as np

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


from benchmarks.analysis import calculate_stats, analyze_concurrency_benchmarks, generate_scientific_recommendation
from benchmarks.core_affinity import get_cpu_info, allocate_core_mapping
from benchmarks.phase_detector import detect_phase
from benchmarks.subsystem_profiler import extract_subsystem_breakdown
from benchmarks.runner import parse_duration_str

class TestBenchmarkingFramework(unittest.TestCase):

    def test_duration_parsing(self):
        """Tests wall-clock duration string parsing."""
        self.assertEqual(parse_duration_str("30s"), 30.0)
        self.assertEqual(parse_duration_str("15m"), 900.0)
        self.assertEqual(parse_duration_str("2h"), 7200.0)
        self.assertEqual(parse_duration_str("120"), 120.0)
        with self.assertRaises(ValueError):
            parse_duration_str("invalid_duration")

    def test_cpu_core_mapping_allocation(self):
        """Tests core allocation pinning helper."""
        cores_1 = allocate_core_mapping(worker_index=0, total_workers=1, logical_cores=16)
        self.assertEqual(len(cores_1), 16)
        
        cores_2_0 = allocate_core_mapping(worker_index=0, total_workers=2, logical_cores=16)
        cores_2_1 = allocate_core_mapping(worker_index=1, total_workers=2, logical_cores=16)
        self.assertEqual(cores_2_0, [0, 1, 2, 3, 4, 5, 6, 7])
        self.assertEqual(cores_2_1, [8, 9, 10, 11, 12, 13, 14, 15])

    def test_phase_detection(self):
        """Tests simulation emergence phase detection."""
        self.assertEqual(detect_phase(100), "World Initialization")
        self.assertEqual(detect_phase(2000), "Founder Exploration")
        self.assertEqual(detect_phase(10000), "Population Expansion")
        self.assertEqual(detect_phase(50000), "Stable Civilization")
        self.assertEqual(detect_phase(150000), "Late-Game Congestion")

    def test_statistical_calculations(self):
        """Tests mean, stddev, and 95% confidence interval calculations."""
        data = [10.0, 12.0, 11.0, 13.0, 10.0]
        stats = calculate_stats(data)
        self.assertEqual(stats["mean"], 11.2)
        self.assertGreater(stats["stddev"], 0.0)
        self.assertGreater(stats["ci_95"], 0.0)

    def test_concurrency_analysis(self):
        """Tests scaling efficiency and slowdown calculations."""
        mock_results = {
            1: [
                {"avg_tps_per_process": 12.0, "total_tps": 12.0, "cpu_avg_percent": 25.0, "cpu_peak_percent": 30.0, "ram_avg_mb": 500.0}
            ],
            2: [
                {"avg_tps_per_process": 11.5, "total_tps": 23.0, "cpu_avg_percent": 48.0, "cpu_peak_percent": 55.0, "ram_avg_mb": 800.0}
            ]
        }
        res = analyze_concurrency_benchmarks(mock_results)
        self.assertIn("concurrency_summary", res)
        summary_2 = res["concurrency_summary"][2]
        self.assertEqual(summary_2["total_tps"], 23.0)
        self.assertEqual(summary_2["scaling_factor"], 1.92)
        self.assertAlmostEqual(summary_2["slowdown_pct"], 4.2, delta=0.5)

    def test_subsystem_profiler_extraction(self):
        """Tests subsystem profiling timing extraction."""
        mock_profiler = {
            "perception": {"calls": 100, "time": 50.0, "max": 2.0, "worst_tick": 10},
            "cognition": {"calls": 100, "time": 150.0, "max": 5.0, "worst_tick": 25}
        }
        extracted = extract_subsystem_breakdown(mock_profiler)
        self.assertTrue(extracted["available"])
        self.assertEqual(extracted["total_subsystem_time_ms"], 200.0)
        self.assertEqual(extracted["subsystems"]["perception"]["percentage"], 25.0)
        self.assertEqual(extracted["subsystems"]["cognition"]["percentage"], 75.0)

if __name__ == "__main__":
    unittest.main()
