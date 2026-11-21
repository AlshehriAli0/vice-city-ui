type Evidence = "clothing" | "face" | "vehicle" | "cctv" | "weapon" | "witness";
type WantedState = "seen" | "lost" | "search" | "escaped";

const EVIDENCE_LABEL: Record<Evidence, string> = {
  clothing: "Clothing",
  face: "Appearance",
  vehicle: "Vehicle",
  cctv: "CCTV",
  weapon: "Weapon",
  witness: "Accomplice",
};

const STATE_LABEL: Record<WantedState, string> = {
  seen: "Seen",
  lost: "Lost sight",
  search: "Searching",
  escaped: "Escaped, still profiled",
};

export { EVIDENCE_LABEL, STATE_LABEL };
export type { Evidence, WantedState };
