import type { PhoneApp } from "../leonida/phone-data";

const APP_OPTIONS: { value: PhoneApp; label: string }[] = [
  { value: "home", label: "Home" },
  { value: "whatup", label: "WhatUp" },
  { value: "contacts", label: "Contacts" },
  { value: "fitness", label: "Fitness" },
  { value: "snapmatic", label: "Snapmatic" },
  { value: "news", label: "News" },
  { value: "weather", label: "Weather" },
  { value: "waink", label: "WAiNK" },
  { value: "settings", label: "Settings" },
];

export { APP_OPTIONS };
