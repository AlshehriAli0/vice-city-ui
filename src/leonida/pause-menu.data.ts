import { Camera, CircleQuestionMark, Map, Save, SlidersVertical, Tag, type LucideIcon } from "lucide-react";

type Row = { value: string; label: string; Icon: LucideIcon };

const PAUSE_ROWS: Row[] = [
  { value: "map", label: "Map", Icon: Map },
  { value: "game", label: "Game", Icon: Save },
  { value: "store", label: "Store", Icon: Tag },
  { value: "help", label: "Help", Icon: CircleQuestionMark },
  { value: "photo", label: "Photo Studio", Icon: Camera },
  { value: "settings", label: "Settings", Icon: SlidersVertical },
];

export { PAUSE_ROWS };
