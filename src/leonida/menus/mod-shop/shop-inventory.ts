import { FAMILIES, type Family, type Swatch } from "./swatches";

type PaintType = "gloss" | "metallic";
type Payment = "buckme" | "cash";
type Stat = { value: string; label: string; base: number };
type Build = {
  value: string;
  label: string;
  description: string;
  price: number;
  was?: number;
  pay: Payment[];
  paint: string;
  delta: Record<string, number>;
  rating: [number, number];
};
type Section = "respray" | "full-kits";

const PAINT_TYPES: { value: PaintType; label: string; price: number }[] = [
  { value: "gloss", label: "Gloss", price: 400 },
  { value: "metallic", label: "Solid Metallic", price: 825 },
];

const STATS: Stat[] = [
  { value: "speed", label: "Speed", base: 4.7 },
  { value: "acceleration", label: "Acceleration", base: 5.3 },
  { value: "asphalt", label: "Asphalt Handling", base: 3.6 },
  { value: "offroad", label: "Off-Road Handling", base: 4.5 },
  { value: "strength", label: "Strength", base: 3.0 },
];

const RATING: [number, number] = [330, 458];

const BUILDS: Build[] = [
  {
    value: "retro-elite",
    label: "Retro Build - Elite",
    description: "Retro build with a custom paint job and interior, and a modded engine.",
    price: 840,
    pay: ["buckme", "cash"],
    paint: "#4fc4b0",
    delta: { speed: 0.1, acceleration: 0.2, asphalt: 0.3, offroad: -0.3 },
    rating: [-20, 24],
  },
  {
    value: "racing-standard",
    label: "Racing Build - Standard",
    description: "Track racing build with a custom paint job and performance tuning.",
    price: 3288,
    was: 3655,
    pay: ["buckme"],
    paint: "#b9bfc7",
    delta: { speed: 0.4, acceleration: 0.8, asphalt: 1.3, offroad: -2.8 },
    rating: [-263, 88],
  },
  {
    value: "racing-advanced",
    label: "Racing Build - Advanced",
    description: "Track racing build with a custom paint job, and enhanced performance and aerodynamics.",
    price: 14865,
    was: 16520,
    pay: ["buckme"],
    paint: "#c4161c",
    delta: { speed: 0.8, acceleration: 2.1, asphalt: 1.3, offroad: -2.8 },
    rating: [-263, 149],
  },
];

const SECTIONS: { value: Section; parent: string; label: string }[] = [
  { value: "respray", parent: "Cosmetics", label: "Respray" },
  { value: "full-kits", parent: "Pro Builds", label: "Full Kits" },
];

const paintKey = (swatch: string, type: PaintType) => `${swatch}/${type}`;

const money = (amount: number) => `$${amount.toLocaleString("en-US")}`;

export { money, BUILDS, FAMILIES, PAINT_TYPES, RATING, SECTIONS, STATS, paintKey };
export type { Build, Family, PaintType, Payment, Section, Stat, Swatch };
