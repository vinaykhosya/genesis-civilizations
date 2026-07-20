import { ChronicleEvent, ChronicleChapter } from "./types";
import { formatEventToProse } from "./templates";

export interface ChapterTrigger {
  name: string;
  title: string;
  description: string;
  startTick: number;
}

export function compileChapters(events: ChronicleEvent[], totalTicks: number): ChronicleChapter[] {
  // Sort events chronologically by tick
  const sortedEvents = [...events].sort((a, b) => a.tick - b.tick);

  // 1. Identify dynamic trigger ticks
  let expansionTick = -1;
  let conflictTick = -1;
  let declineTick = -1;
  let collapseTick = -1;

  // Track counts to detect triggers
  let birthsSeen = 0;
  let maxPopulation = 0;
  let currentPopulation = 0;

  // Pass 1: Scan events for thresholds
  for (const evt of sortedEvents) {
    if (evt.type === "Birth") {
      birthsSeen++;
      currentPopulation++;
      if (currentPopulation > maxPopulation) {
        maxPopulation = currentPopulation;
      }
      // Trigger Expansion on 5th birth or when population is growing
      if (birthsSeen >= 5 && expansionTick === -1) {
        expansionTick = evt.tick;
      }
    } else if (evt.type === "Death") {
      currentPopulation = Math.max(0, currentPopulation - 1);
    } else if (evt.type === "Dispute" && conflictTick === -1) {
      conflictTick = evt.tick;
    }

    // Trigger Decline if population drops below 50% of peak (once peak is significant)
    if (maxPopulation >= 10 && currentPopulation <= maxPopulation * 0.5 && declineTick === -1) {
      declineTick = evt.tick;
    }

    // Trigger Collapse if population drops to near zero
    if (maxPopulation >= 5 && currentPopulation <= 1 && collapseTick === -1) {
      collapseTick = evt.tick;
    }
  }

  // Fallbacks if thresholds were never met
  if (expansionTick === -1 && totalTicks > 500) expansionTick = Math.min(totalTicks, 1000);
  if (declineTick === -1 && totalTicks > 2000) declineTick = Math.floor(totalTicks * 0.7);
  if (collapseTick === -1 && currentPopulation === 0) {
    const lastDeath = sortedEvents.filter((e) => e.type === "Death").pop();
    collapseTick = lastDeath ? lastDeath.tick : Math.floor(totalTicks * 0.9);
  }

  // Compile triggers list
  const triggers: ChapterTrigger[] = [
    {
      name: "founding",
      title: "The Founding",
      description:
        "The initial colonizers arrive in the untouched landscape, exploring boundaries and searching for sources of water.",
      startTick: 0,
    },
  ];

  if (expansionTick > 0 && expansionTick < totalTicks) {
    triggers.push({
      name: "expansion",
      title: "The Expansion Era",
      description:
        "Growth begins as shelters are constructed and localized populations consolidate their territories.",
      startTick: expansionTick,
    });
  }

  if (conflictTick > 0 && conflictTick < totalTicks && conflictTick > expansionTick) {
    triggers.push({
      name: "conflict",
      title: "The Friction Years",
      description:
        "Resource borders tighten. Colony boundaries touch, leading to localized disputes and combat pressures.",
      startTick: conflictTick,
    });
  }

  if (
    declineTick > 0 &&
    declineTick < totalTicks &&
    declineTick > Math.max(expansionTick, conflictTick)
  ) {
    triggers.push({
      name: "decline",
      title: "The Long Decline",
      description:
        " senescent mortality rises and resources thin out, starting a downward spiral in population counts.",
      startTick: declineTick,
    });
  }

  if (collapseTick > 0 && collapseTick < totalTicks && collapseTick > declineTick) {
    triggers.push({
      name: "collapse",
      title: "The Final Collapse",
      description:
        "Births cease entirely. The last surviving organisms face absolute carrying capacity constraints.",
      startTick: collapseTick,
    });
  }

  // Sort triggers by tick
  triggers.sort((a, b) => a.startTick - b.startTick);

  // 2. Map events to chapters
  const chapters: ChronicleChapter[] = [];

  for (let i = 0; i < triggers.length; i++) {
    const current = triggers[i];
    const next = triggers[i + 1];
    const endTick = next ? next.startTick - 1 : totalTicks;

    const chapterEvents = sortedEvents.filter(
      (evt) => evt.tick >= current.startTick && evt.tick <= endTick,
    );

    const proseEntries = chapterEvents.map(formatEventToProse).filter((p): p is any => p !== null);

    chapters.push({
      name: current.name,
      title: current.title,
      description: current.description,
      startTick: current.startTick,
      endTick,
      prose: proseEntries,
    });
  }

  return chapters;
}
