import { defineMcp } from "@lovable.dev/mcp-js";
import listCivilizationsTool from "./tools/list-civilizations";
import getCivilizationTool from "./tools/get-civilization";
import listChronicleEventsTool from "./tools/list-chronicle-events";

export default defineMcp({
  name: "genesis-mcp",
  title: "Genesis — Civilization Archive",
  version: "0.1.0",
  instructions:
    "Read-only access to the Genesis public research archive: list and inspect published civilization records, and browse their narrative chronicle events. All data returned is already public on genesis-civilizations.lovable.app.",
  tools: [listCivilizationsTool, getCivilizationTool, listChronicleEventsTool],
});
