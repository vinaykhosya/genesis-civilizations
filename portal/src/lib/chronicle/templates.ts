import { ChronicleEvent, ChronicleProse } from "./types";

export function formatEventToProse(evt: ChronicleEvent): ChronicleProse | null {
  const { tick, type, metadata, description } = evt;
  let text = "";
  let affectedAgents: number[] = [];

  switch (type) {
    case "Birth": {
      const child = metadata.child_id;
      const colony = metadata.colony_name || `Colony ${metadata.colony_id}`;
      const gen = metadata.generation || 1;
      text = `A new generation took root: Agent #${child} was born to ${colony} (Generation ${gen}).`;
      affectedAgents = [child];
      if (metadata.parent_a_id) affectedAgents.push(metadata.parent_a_id);
      if (metadata.parent_b_id) affectedAgents.push(metadata.parent_b_id);
      break;
    }
    case "Death": {
      const agent = metadata.agent_id;
      const cause = metadata.cause || "natural causes";
      const ageY = Math.floor((metadata.age_ticks || 0) / 360);
      text = `Agent #${agent} expired due to ${cause.replace("_", " ")} at age ${ageY} simulation years.`;
      affectedAgents = [agent];
      break;
    }
    case "Dispute": {
      const a = metadata.agent_a_id;
      const b = metadata.agent_b_id;
      const outcome = metadata.outcome || "retreat";
      text = `Territorial friction peaked: Agent #${a} and Agent #${b} clashed, resulting in a ${outcome.replace("_", " ")}.`;
      affectedAgents = [a, b];
      break;
    }
    case "Disaster": {
      const disaster = metadata.disaster_type || "natural disaster";
      const severity = Math.round((metadata.severity || 0) * 100);
      text = `Environmental volatility: A severe ${disaster} struck the ecosystem with ${severity}% severity index.`;
      break;
    }
    case "ClimateEpoch": {
      const epoch = metadata.epoch_name || "New Epoch";
      const tempDelta = metadata.temperature_delta || 0;
      text = `The climate shifted into the '${epoch}' epoch, shifting temperatures by ${tempDelta > 0 ? "+" : ""}${tempDelta.toFixed(1)}°C.`;
      break;
    }
    case "Extinction": {
      const colony = metadata.colony_name || `Colony ${metadata.colony_id}`;
      const lifespans = Math.floor((metadata.tick_extinct - metadata.tick_founded) / 360);
      text = `A lineage ended: ${colony} collapsed completely, after persisting for ${lifespans} years.`;
      break;
    }
    case "Milestone":
    default: {
      text = description || "A significant developmental milestone was documented.";
      break;
    }
  }

  return {
    tick,
    text,
    eventType: type,
    affectedAgents,
  };
}
