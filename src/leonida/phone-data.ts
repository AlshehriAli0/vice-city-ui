import { createContext, use } from "react";

import type { Glyph, Shoulder } from "./button-prompt";
import type { Weather } from "./phone-icons";

type AppId = "whatup" | "contacts" | "fitness" | "snapmatic" | "news" | "weather" | "waink" | "settings";

type Screen =
  | AppId
  | "home"
  | "reminders"
  | "thread"
  | "contacts-all"
  | "fitness-detail"
  | "comments"
  | "profile"
  | "article"
  | "wallpaper"
  | "ringtone";

type PhoneApp = "home" | AppId;

type Entry = { screen: Screen; focus: string | null; param?: string; sheet?: string };

type PromptKey = Glyph | Shoulder | "L3" | "R3" | "R" | "dpad-v" | "dpad-h";

type Prompt = { label: string; key: PromptKey; run?: () => void; muted?: boolean };

type Accent = "indigo" | "green" | "rose" | "white";

type App = { id: AppId; name: string; badge?: boolean };

const APPS: App[] = [
  { id: "whatup", name: "WhatUp", badge: true },
  { id: "contacts", name: "Contacts" },
  { id: "fitness", name: "Fitness", badge: true },
  { id: "snapmatic", name: "Snapmatic" },
  { id: "news", name: "News" },
  { id: "weather", name: "Weather" },
  { id: "waink", name: "WAiNK" },
  { id: "settings", name: "Settings" },
];

const ACCENT: Partial<Record<Screen, Accent>> = {
  contacts: "green",
  "contacts-all": "green",
  news: "rose",
  article: "rose",
  fitness: "white",
  "fitness-detail": "white",
};

type Contact = { id: string; name: string; tone: string; art?: string };

const CONTACTS: Contact[] = [
  { id: "alex", name: "Alex", tone: "#7f8fd8" },
  { id: "bailey", name: "Bailey", tone: "#d88f6f" },
  { id: "casey", name: "Casey", tone: "#6fb89a" },
  { id: "drew", name: "Drew", tone: "#b07fd0" },
  { id: "jordan", name: "Jordan", tone: "#d0a65a" },
  { id: "morgan", name: "Morgan", tone: "#5aa4d0" },
  { id: "riley", name: "Riley", tone: "#d06f8a" },
  { id: "sam", name: "Sam", tone: "#8a9a5a" },
  { id: "taylor", name: "Taylor", tone: "#6a7aa8" },
];

const OWNER_ART = "/vc/art-jason.jpg";

type Wallpaper = { id: string; name: string; art?: string };

const WALLPAPERS: Wallpaper[] = [
  { id: "default", name: "Circles" },
  { id: "spectrum", name: "Spectrum" },
  { id: "dusk", name: "Dusk" },
  { id: "beach", name: "Beach", art: "/vc/art-vice-city.jpg" },
  { id: "keys", name: "The Keys", art: "/vc/art-leonida-keys.jpg" },
  { id: "sunset", name: "Sea Sunset", art: "/vc/shot-sea-sunset.jpg" },
  { id: "glades", name: "Wetlands", art: "/vc/art-grassrivers.jpg" },
  { id: "harbour", name: "Harbour", art: "/vc/art-port-gellhorn.jpg" },
];

const RINGTONES = [
  "Silent",
  "Wind Chimes",
  "Dreamy",
  "Beeps",
  "Retro",
  "Beam Me Up",
  "Bugging",
  "Echo",
  "Samba Nights",
];

type PhoneState = {
  entry: Entry;
  depth: number;
  motion: "in" | "cut";
  owner: string;
  time: string;
  temperature: number;
  weather: Weather;
  inCar: boolean;
  wallpaper: string;
  ringtone: string;
  sent: string[];
  reminders: number;
  go: (entry: Omit<Entry, "focus"> & { focus?: string | null }) => void;
  back: () => void;
  setFocus: (focus: string | null) => void;
  update: (patch: Partial<Entry>) => void;
  setWallpaper: (id: string) => void;
  setRingtone: (name: string) => void;
  send: (thread: string) => void;
  call: (contact: Contact) => void;
  close: (hold?: number, then?: () => void) => void;
};

const PhoneContext = createContext<PhoneState | null>(null);

const usePhone = (): PhoneState => {
  "use memo";

  const phone = use(PhoneContext);
  if (!phone) throw new Error("Phone screens must be inside PhoneDrawer");
  return phone;
};

const findApp = (id: string | undefined): AppId | undefined => APPS.find(app => app.id === id)?.id;

const initial = (name: string) => name.slice(0, 1).toUpperCase();

const ownerFace = (owner: string) => ({ name: owner, tone: "#8c8794", art: OWNER_ART });

const contactById = (id: string | undefined) => CONTACTS.find(contact => contact.id === id) ?? CONTACTS[0];

export {
  contactById,
  ownerFace,
  ACCENT,
  APPS,
  CONTACTS,
  OWNER_ART,
  PhoneContext,
  RINGTONES,
  WALLPAPERS,
  findApp,
  initial,
  usePhone,
};
export type { Accent, App, AppId, Contact, Entry, PhoneApp, PhoneState, Prompt, PromptKey, Screen, Wallpaper };
