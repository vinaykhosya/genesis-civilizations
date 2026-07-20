export interface BiomeInfo {
  id: number;
  label: string;
  color: string;
}

export const BIOME_COLORS: BiomeInfo[] = [
  { id: 0, label: "Ocean", color: "#0F2541" },
  { id: 1, label: "Glacier", color: "#E1EEF5" },
  { id: 2, label: "Tundra", color: "#969B8C" },
  { id: 3, label: "Taiga", color: "#224938" },
  { id: 4, label: "Forest", color: "#2E7548" },
  { id: 5, label: "Grassland", color: "#ACB86A" },
  { id: 6, label: "Desert", color: "#E0BB73" },
  { id: 7, label: "Rainforest", color: "#0C552D" },
];
