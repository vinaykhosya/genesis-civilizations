export interface ChronicleEvent {
  tick: number;
  year: number;
  day: number;
  type: "Birth" | "Death" | "Milestone" | "Disaster" | "Dispute" | "ClimateEpoch" | "Extinction";
  description: string;
  metadata: any;
}

export interface ChronicleProse {
  tick: number;
  text: string;
  eventType: string;
  affectedAgents: number[];
}

export interface ChronicleChapter {
  name: string;
  title: string;
  description: string;
  startTick: number;
  endTick: number;
  prose: ChronicleProse[];
}
