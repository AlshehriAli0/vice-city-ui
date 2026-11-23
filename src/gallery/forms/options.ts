import type { Value } from "../demo";
import { options as labeledOptions } from "../shared/options";

const SIZES = labeledOptions(["sm", "Small"], ["md", "Medium"], ["lg", "Large"]);

const str = (name: string, value: Value | undefined, skip?: Value) =>
  value === "" || value === undefined || value === skip ? "" : ` ${name}="${value}"`;

const flag = (name: string, on: Value | undefined) => (on ? ` ${name}` : "");

type Choice = { value: string; label: string; art?: string };

const PLACES: Choice[] = [
  { value: "vice-city", label: "Vice City" },
  { value: "leonida-keys", label: "Leonida Keys" },
  { value: "grassrivers", label: "Grassrivers" },
  { value: "port-gellhorn", label: "Port Gellhorn" },
  { value: "ambrosia", label: "Ambrosia" },
  { value: "kalaga", label: "Mount Kalaga" },
].map(({ value, label }) => ({ value, label, art: `art-${value}` }));

const labelIn = (list: Choice[]) => (value: string) => list.find(item => item.value === value)?.label ?? value;

export { SIZES, PLACES, flag, labelIn, str };
export type { Choice };
