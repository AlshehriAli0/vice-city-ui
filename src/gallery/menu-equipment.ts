import type { Weapon } from "../leonida/weapon-wheel";

const WEAPONS: Weapon[] = [
  {
    value: "pistol",
    category: "Sidearm",
    name: "Pistol",
    kind: "Service pistol",
    icon: "pistol",
    paint: "gunmetal",
    clip: 15,
    reserve: 69,
    rarity: "teal",
    stats: { damage: 4.2, accuracy: 5.2, handling: 8.4, range: 4.4 },
  },
  {
    value: "compact",
    category: "Sidearm",
    name: "Compact pistol",
    kind: "Sub-compact",
    icon: "pistol2",
    paint: "gunmetal",
    clip: 7,
    reserve: 53,
    rarity: "yellow",
    stats: { damage: 3.1, accuracy: 4.6, handling: 9.0, range: 3.2 },
  },
  { value: "unarmed", category: "Unarmed", name: "Unarmed", icon: "fist", paint: "skin" },
  { value: "binoculars", category: "Equipment", name: "Binoculars", icon: "binoculars", paint: "gunmetal" },
  { value: "explosives", category: "Explosives" },
  { value: "knife", category: "Melee", name: "Knife", icon: "knife", paint: "steel" },
  {
    value: "rifle",
    category: "Longarm",
    name: "Small game rifle",
    kind: "Bolt-action",
    icon: "rifle",
    paint: "wood",
    clip: 11,
    reserve: 170,
    rarity: "yellow",
    stats: { damage: 1.5, accuracy: 8.4, handling: 5.4, range: 6.7 },
  },
  { value: "longarm", category: "Longarm" },
];

const ITEMS: Weapon[] = [
  { value: "item-1", category: "Item" },
  { value: "item-2", category: "Item" },
  { value: "cap", category: "Headwear", name: "Cap", icon: "cap", paint: "red", worn: false },
  { value: "outfit", category: "Outfit", name: "Outfit", icon: "hanger", paint: "gunmetal", equipped: true },
  { value: "item-5", category: "Item" },
  { value: "item-6", category: "Item" },
  { value: "shades", category: "Eyewear", name: "Sunglasses", icon: "sunglasses", paint: "red", worn: false },
  { value: "item-8", category: "Item" },
];

export { WEAPONS, ITEMS };
