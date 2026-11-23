import type { Wash } from "../../leonida/hud/hud-minimap";
import type { Evidence, WantedState } from "../../leonida/hud/wanted-level";
import { EVIDENCE_LABEL, STATE_LABEL } from "../../leonida/hud/wanted-states";
import type { Value } from "../demo";
import { optionValue, options } from "../shared/options";

const STATES = options(
  ["seen", STATE_LABEL.seen],
  ["lost", STATE_LABEL.lost],
  ["search", STATE_LABEL.search],
  ["escaped", STATE_LABEL.escaped.split(",")[0]]
);
const EVIDENCE: Evidence[] = ["clothing", "face", "vehicle", "cctv", "weapon"];
const EVIDENCE_CONTROLS = EVIDENCE.map(item => ({ type: "boolean" as const, name: item, label: EVIDENCE_LABEL[item] }));

const policeState = (value: Value | undefined): WantedState => optionValue(value, STATES) ?? "seen";

const washOf = (heat: number, state: WantedState): Wash => {
  if (heat === 0 || state === "escaped") return "none";
  return state === "seen" ? "seen" : "search";
};

export { EVIDENCE, EVIDENCE_CONTROLS, STATES, policeState, washOf };
