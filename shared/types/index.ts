export interface ExperimentConfig {
  seed: number;
  ticks: number;
  scarcity: number;
  max_population: number;
  mutation_rate: number;
  reproduction_enabled: boolean;
  disputes_enabled: boolean;
  disasters_enabled: boolean;
  healing_speed_mult: number;
  shelter_build_speed_mult: number;
  shelter_search_dist: number;
  planner_enabled: boolean;
  sleep_consolidation_enabled: boolean;
  checkpoint_interval: number;
  world_preset: 'island_chains' | 'arid_continent' | 'green_continent' | 'boreal_highlands' | 'tropical_ring' | null;
  climate_epoch_mode: 'legacy' | 'stable' | 'slow_change' | 'rapid_change' | 'random';
  ecology_ablation: {
    dehydration_ramp: boolean;
    memory_fidelity: boolean;
    water_caching: boolean;
    deposit_utility_fix: boolean;
  };
}

export interface ColonyEntry {
  founder_id: number;
  colony_id: number;
  size: number;
  longevity_ticks: number;
  max_generation: number;
  avg_health: number;
  avg_prediction_accuracy: number;
}

export interface ExperimentSummary {
  timestamp: string;
  experiment: string;
  seed: number;
  ticks: number;
  scarcity: number;
  survivors: string;
  avg_radius: number;
  avg_discoveries: number;
  tests_passed: boolean;
  max_generation: number;
  derived_metrics: {
    avg_generation_interval: number;
    population_doubling_time: number;
    colony_lifespans: { [colonyName: string]: number };
    avg_genetic_diversity: number;
    food_efficiency: number;
    water_efficiency: number;
    energy_efficiency: number;
    avg_prediction_error: number;
    concept_formation_rate: number;
    procedure_creation_rate: number;
    avg_children: number;
    avg_grandchildren: number;
    avg_descendants: number;
    avg_distance_from_birthplace: number;
    avg_shelter_occupancy: number;
    avg_social_degree: number;
    avg_cooperation_score: number;
    avg_conflict_score: number;
  };
  distributions: {
    lifespan: { [bucket: string]: number };
    children: { [bucket: string]: number };
    shelter: { [level: string]: number };
    generation: { [gen: string]: number };
    prediction_confidence: { [range: string]: number };
    concepts: { [range: string]: number };
  };
  leaderboards: {
    longest_surviving: ColonyEntry[];
    largest_size: ColonyEntry[];
    highest_health: ColonyEntry[];
    most_generations: ColonyEntry[];
    cognitive_mastery: ColonyEntry[];
  };
}

export interface GenesisExperimentExport {
  schema_version: string;
  engine_version: string;
  export_version: string;
  config: ExperimentConfig;
  summary: ExperimentSummary;
}
