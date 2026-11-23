import { CarFront, DoorOpen, Lamp, Lightbulb, TriangleAlert, type LucideIcon } from "lucide-react";

type Station = { value: string; name: string; genre: string; art: string; track: [string, string] };

const STATIONS: Station[] = [
  {
    value: "cocoteo",
    name: "Cocoteo FM",
    genre: "Latin and reggaeton",
    art: "radio-cocoteo-fm",
    track: ["EoO", "Bad Bunny"],
  },
  {
    value: "dirty-south",
    name: "Dirty South Classics",
    genre: "Southern rap",
    art: "radio-dirty-south-classics",
    track: ["Like A Pimp", "David Banner ft. Lil' Flip"],
  },
  {
    value: "flash",
    name: "Flash FM",
    genre: "Pop hits, past and present",
    art: "radio-flash-fm",
    track: ["Good Ones", "Charli xcx"],
  },
  { value: "afrobank", name: "AfroBank FM", genre: "Afrobeats", art: "radio-afrobank-fm", track: ["Joha", "Asake"] },
  {
    value: "circoloco",
    name: "Circoloco Records Radio",
    genre: "House and techno",
    art: "radio-circoloco-records-radio",
    track: ["Baby", "Prospa & Murda Beatz"],
  },
  {
    value: "back-country",
    name: "Back Country Radio",
    genre: "Country",
    art: "radio-back-country-radio",
    track: ["Need a Little Time Off for Bad Behavior", "David Allan Coe"],
  },
  {
    value: "chamber",
    name: "The Chamber 106.6",
    genre: "Late-night cuts",
    art: "radio-the-chamber-106",
    track: ["I", "Black Sabbath"],
  },
];

type Feature = { value: string; name: string; icon: LucideIcon; states: [string, string]; action: [string, string] };

const FEATURES: Feature[] = [
  {
    value: "headlights",
    name: "Headlights",
    icon: Lightbulb,
    states: ["Off", "Low beam"],
    action: ["Turn on", "Turn on - high"],
  },
  { value: "hazards", name: "Hazards", icon: TriangleAlert, states: ["Off", "On"], action: ["Turn on", "Turn off"] },
  { value: "doors", name: "Doors", icon: DoorOpen, states: ["Closed", "Open"], action: ["Toggle", "Toggle"] },
  { value: "interior", name: "Interior light", icon: Lamp, states: ["Off", "On"], action: ["Turn on", "Turn off"] },
  { value: "engine", name: "Engine", icon: CarFront, states: ["Running", "Off"], action: ["Toggle", "Toggle"] },
];

const SHOWS = [
  { value: "show-1", name: "Leonida Talk", cover: "a" },
  { value: "show-2", name: "Night Desk", cover: "b" },
  { value: "show-3", name: "Keys Hour", cover: "c" },
  { value: "show-4", name: "The Weekly", cover: "d" },
  { value: "show-5", name: "Vice City Tonight", cover: "e" },
];

type Source = "vehicle" | "radio" | "demand";

const SOURCES: [Source, string][] = [
  ["vehicle", "Vehicle"],
  ["radio", "Radio"],
  ["demand", "On demand"],
];

const NOUNS: Record<Source, string> = { vehicle: "feature", radio: "station", demand: "show" };

const offset = (index: number, focus: number, count: number): number => {
  const half = Math.floor(count / 2);
  return ((index - focus + count + half) % count) - half;
};

export { offset, FEATURES, NOUNS, SHOWS, SOURCES, STATIONS };
export type { Source, Station };
