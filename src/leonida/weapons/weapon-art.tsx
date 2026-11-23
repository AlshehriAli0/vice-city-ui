import { useId } from "react";

import { ICONS, type IconName } from "./weapon-icons";

type WheelTab = "weapons" | "items";

type Paint = "steel" | "gunmetal" | "wood" | "skin" | "teal" | "glass" | "red" | "fabric" | "khaki";

type Slot = {
  value: string;
  category: string;
  name?: string;
  kind?: string;
  icon?: IconName;
  paint?: Paint;
  clip?: number;
  reserve?: number;
  worn?: boolean;
  equipped?: boolean;
  rarity?: "teal" | "yellow";
  stats?: { damage: number; accuracy: number; handling: number; range: number };
};

const PAINTS: Record<Paint, [string, string, string]> = {
  steel: ["#f1f2f4", "#a9adb5", "#5d6069"],
  gunmetal: ["#9a9ea8", "#55585f", "#26272c"],
  wood: ["#c98a55", "#8a5129", "#4a2a14"],
  skin: ["#f7cdb6", "#d9937a", "#9b5844"],
  teal: ["#9de8de", "#3c9a91", "#1b4f4c"],
  glass: ["#bfe3d9", "#6aa597", "#2e5049"],
  red: ["#ff7a6e", "#d0302c", "#7a1214"],
  fabric: ["#c7c9d1", "#7d808b", "#3b3d45"],
  khaki: ["#c7b48a", "#8b7650", "#4d3f26"],
};

const GameIcon = ({ name, paint = "steel" }: { name: IconName; paint?: Paint }) => {
  const id = useId();
  const icon = ICONS[name];
  const [hi, mid, lo] = PAINTS[paint];
  return (
    <svg className="ld-icon" viewBox={icon.box} data-icon={name} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor={hi} />
          <stop offset="0.45" stopColor={mid} />
          <stop offset="1" stopColor={lo} />
        </linearGradient>
        <radialGradient id={`${id}h`} cx="0.25" cy="0.1" r="0.7">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={`rotate(${icon.rotate} 256 256)`}>
        <path
          d={icon.d}
          fill={`url(#${id}f)`}
          stroke="#141216"
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
          paintOrder="stroke"
        />
        <path d={icon.d} fill={`url(#${id}h)`} />
      </g>
    </svg>
  );
};

const PillBottle = () => (
  <svg className="ld-heal-art" viewBox="0 0 40 60" aria-hidden="true">
    <defs>
      <linearGradient id="ld-bottle" x1="0" x2="1">
        <stop offset="0" stopColor="#7a0f14" />
        <stop offset="0.3" stopColor="#e2343a" />
        <stop offset="0.55" stopColor="#c81e25" />
        <stop offset="1" stopColor="#5c0a0e" />
      </linearGradient>
      <linearGradient id="ld-cap" x1="0" x2="1">
        <stop offset="0" stopColor="#bdbdc2" />
        <stop offset="0.35" stopColor="#ffffff" />
        <stop offset="1" stopColor="#9a9aa2" />
      </linearGradient>
      <linearGradient id="ld-label" x1="0" x2="1">
        <stop offset="0" stopColor="#c9c7c4" />
        <stop offset="0.35" stopColor="#f6f4f0" />
        <stop offset="1" stopColor="#b2afab" />
      </linearGradient>
    </defs>
    <ellipse cx="20" cy="57.5" rx="13" ry="2" fill="rgb(0 0 0 / 0.35)" />
    <rect x="7" y="13" width="26" height="44" rx="4" fill="url(#ld-bottle)" />
    <rect x="9" y="10" width="22" height="5" rx="1.5" fill="#8e1218" />
    <rect x="8" y="2" width="24" height="10" rx="2" fill="url(#ld-cap)" />
    <path d="M10 4.5h20M10 7h20M10 9.5h20" stroke="rgb(0 0 0 / 0.12)" strokeWidth="0.8" />
    <rect x="7" y="27" width="26" height="18" fill="url(#ld-label)" />
    <rect x="11" y="31" width="12" height="2.2" fill="#c81e25" />
    <rect x="11" y="35" width="17" height="1.4" fill="#8a8784" />
    <rect x="11" y="38" width="14" height="1.4" fill="#8a8784" />
    <rect x="11.5" y="15" width="3" height="40" rx="1.5" fill="#fff" opacity="0.35" />
  </svg>
);

const AdrenalinePen = () => (
  <svg className="ld-heal-art" viewBox="0 0 40 60" aria-hidden="true">
    <defs>
      <linearGradient id="ld-pen" x1="0" x2="1">
        <stop offset="0" stopColor="#4a4b52" />
        <stop offset="0.35" stopColor="#c9cad0" />
        <stop offset="0.6" stopColor="#8d8e96" />
        <stop offset="1" stopColor="#3a3b41" />
      </linearGradient>
      <linearGradient id="ld-pen-cap" x1="0" x2="1">
        <stop offset="0" stopColor="#2a2b30" />
        <stop offset="0.4" stopColor="#6b6c74" />
        <stop offset="1" stopColor="#1e1f23" />
      </linearGradient>
    </defs>
    <ellipse cx="20" cy="57.5" rx="7" ry="1.6" fill="rgb(0 0 0 / 0.35)" />
    <rect x="15" y="1" width="10" height="12" rx="2.5" fill="url(#ld-pen-cap)" />
    <rect x="14" y="12" width="12" height="44" rx="3" fill="url(#ld-pen)" />
    <rect x="14" y="48" width="12" height="5" fill="#e0782c" />
    <rect x="14" y="24" width="12" height="10" fill="rgb(255 255 255 / 0.25)" />
    <rect x="16.5" y="14" width="2" height="40" rx="1" fill="#fff" opacity="0.4" />
  </svg>
);

export { AdrenalinePen, GameIcon, PillBottle };
export type { Slot, WheelTab };
