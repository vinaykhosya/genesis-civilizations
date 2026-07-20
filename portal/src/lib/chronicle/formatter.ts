import { ChronicleEvent, ChronicleChapter } from "./types";
import { compileChapters } from "./chapters";

export function formatChronicle(events: any[], totalTicks: number): ChronicleChapter[] {
  // Map raw events safely to ChronicleEvent interfaces
  const typedEvents: ChronicleEvent[] = events.map((evt) => ({
    tick: parseInt(evt.tick, 10),
    year: parseInt(evt.year, 10) || 0,
    day: parseInt(evt.day, 10) || 0,
    type: evt.type || evt.event_type || "Milestone",
    description: evt.description || "",
    metadata: evt.metadata || {},
  }));

  return compileChapters(typedEvents, totalTicks);
}
