import os
import sys
import glob
import json
import time

# Ensure workspace root is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import run_test

# Overrides for rapid execution & path capture
run_test.LIVE_PACING_DELAY = 0.0
run_test.SAVE_PATHS = True
run_test.SAVE_EPOCHS = True
run_test.LONG_RUN = True

flagships = {
    "GEN-0001": {
        "SEED": 1720,
        "TICKS": 15384,
        "SCARCITY": 3.0,
        "MAX_POPULATION": 200,
        "MUTATION_RATE": 0.05,
        "REPRODUCTION_ENABLED": True,
        "DISPUTES_ENABLED": False,
        "DISASTERS_ENABLED": True,
        "HEALING_SPEED_MULT": 2000000.0,
        "WORLD_PRESET": "None",
        "CLIMATE_EPOCH_MODE": "legacy",
        "EXPERIMENT_NAME": "emergence_social_bonds_accelerated"
    },
    "GEN-0002": {
        "SEED": 1720,
        "TICKS": 13371,
        "SCARCITY": 3.0,
        "MAX_POPULATION": 200,
        "MUTATION_RATE": 0.05,
        "REPRODUCTION_ENABLED": True,
        "DISPUTES_ENABLED": False,
        "DISASTERS_ENABLED": True,
        "HEALING_SPEED_MULT": 1.0,
        "WORLD_PRESET": "None",
        "CLIMATE_EPOCH_MODE": "legacy",
        "EXPERIMENT_NAME": "baseline_social_dynamics"
    },
    "GEN-0003": {
        "SEED": 65654,
        "TICKS": 1000000, # Runs up to 1M ticks, but will terminate early due to extinction
        "SCARCITY": 5.0,
        "MAX_POPULATION": 200,
        "MUTATION_RATE": 0.05,
        "REPRODUCTION_ENABLED": True,
        "DISPUTES_ENABLED": True,
        "DISASTERS_ENABLED": True,
        "HEALING_SPEED_MULT": 2.0,
        "WORLD_PRESET": "green_continent",
        "CLIMATE_EPOCH_MODE": "slow_change",
        "EXPERIMENT_NAME": "continental_collapse_high_scarcity"
    },
    "GEN-0004": {
        "SEED": 65654,
        "TICKS": 1000000, # Runs up to 1M ticks, but will terminate early due to extinction
        "SCARCITY": 5.0,
        "MAX_POPULATION": 200,
        "MUTATION_RATE": 0.05,
        "REPRODUCTION_ENABLED": True,
        "DISPUTES_ENABLED": True,
        "DISASTERS_ENABLED": True,
        "HEALING_SPEED_MULT": 2.0,
        "WORLD_PRESET": "island_chains",
        "CLIMATE_EPOCH_MODE": "slow_change",
        "EXPERIMENT_NAME": "island_fragmentation_extinction"
    }
}

mapping = {}

for fid, params in flagships.items():
    print(f"\n================ Running Flagship {fid}: {params['EXPERIMENT_NAME']} ================")
    
    # Apply parameters
    run_test.SEED = params["SEED"]
    run_test.TICKS = params["TICKS"]
    run_test.SCARCITY = params["SCARCITY"]
    run_test.MAX_POPULATION = params["MAX_POPULATION"]
    run_test.MUTATION_RATE = params["MUTATION_RATE"]
    run_test.REPRODUCTION_ENABLED = params["REPRODUCTION_ENABLED"]
    run_test.DISPUTES_ENABLED = params["DISPUTES_ENABLED"]
    run_test.DISASTERS_ENABLED = params["DISASTERS_ENABLED"]
    run_test.HEALING_SPEED_MULT = params["HEALING_SPEED_MULT"]
    run_test.WORLD_PRESET = params["WORLD_PRESET"]
    run_test.CLIMATE_EPOCH_MODE = params["CLIMATE_EPOCH_MODE"]
    run_test.EXPERIMENT_NAME = params["EXPERIMENT_NAME"]
    
    # Capture folder candidates before run
    existing_folders = set(glob.glob("experiments/*"))
    
    # Run simulation
    run_test.main()
    
    # Find generated folder
    new_folders = set(glob.glob("experiments/*")) - existing_folders
    generated_folders = [f for f in new_folders if os.path.isdir(f)]
    if not generated_folders:
        print(f"Error: Could not find generated folder for {fid}")
        sys.exit(1)
        
    folder_path = generated_folders[0]
    print(f"--> Flagship {fid} output: {folder_path}")
    mapping[fid] = os.path.basename(folder_path)
    
# Save generated folders mapping
with open("experiments_mapping.json", "w") as f:
    json.dump(mapping, f, indent=2)

print("\nAll flagship experiments executed successfully!")
print("Mapping saved to experiments_mapping.json:")
print(json.dumps(mapping, indent=2))
