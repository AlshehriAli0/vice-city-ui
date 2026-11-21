import type { Category } from "./settings-screen.types";

const HOLD = ["Hold", "Press"];

const GAMEPLAY: Category = {
  value: "gameplay",
  label: "Gameplay",
  sections: [
    {
      title: "Targeting",
      rows: [
        {
          kind: "cycle",
          id: "holster",
          label: "Holster in Vehicle",
          options: ["Automatic", "Manual"],
          start: "Automatic",
          info: "Whether your weapon is put away when you get into a vehicle.",
        },
      ],
    },
    {
      title: "Movement",
      rows: [
        {
          kind: "cycle",
          id: "move-speed",
          label: "Movement Speed",
          options: ["Walk", "Jog", "Run", "Sprint"],
          start: "Walk",
          info: "Your default speed on foot.",
        },
        {
          kind: "cycle",
          id: "combat-speed",
          label: "Combat Movement Speed",
          options: ["Walk", "Fast Walk", "Jog"],
          start: "Fast Walk",
          info: "Your default speed on foot while armed.",
        },
        {
          kind: "toggle",
          id: "stand-sprint",
          label: "Stand & Sprint",
          start: false,
          info: "Sprint without holding the button down.",
        },
      ],
    },
    {
      title: "Accessibility",
      rows: [
        {
          kind: "cycle",
          id: "tap-assist",
          label: "Tap Assist",
          options: ["Off", "2x", "3x", "4x", "Hold"],
          start: "2x",
          info: "Choose how to complete actions requiring repeated presses.\n\nA single press can register as *2*, *3*, or *4* presses, or can be swapped to a *hold*.",
        },
        {
          kind: "cycle",
          id: "hold-delay",
          label: "Hold Delay",
          options: ["Off", "0.1s", "0.2s", "0.3s", "0.4s", "0.5s", "0.6s", "0.7s", "0.8s", "0.9s", "1.0s"],
          start: "Off",
          info: "Adds a delay before a held button registers.",
        },
        {
          kind: "cycle",
          id: "hold-assist",
          label: "Hold Assist",
          options: ["1x", "2x", "3x", "4x"],
          start: "4x",
          info: "Shortens how long actions have to be held.",
        },
        {
          kind: "cycle",
          id: "directional",
          label: "Directional Button Actions",
          options: HOLD,
          start: "Hold",
          info: "Choose whether you hold or press the directional buttons.",
        },
        {
          kind: "cycle",
          id: "aiming",
          label: "Aiming",
          options: HOLD,
          start: "Hold",
          info: "Choose whether you hold or press to aim.",
        },
        {
          kind: "cycle",
          id: "interact",
          label: "Interact",
          options: HOLD,
          start: "Hold",
          info: "Choose whether you hold or press to interact.",
        },
        {
          kind: "cycle",
          id: "loadout",
          label: "Loadout",
          options: HOLD,
          start: "Hold",
          info: "Choose whether you hold or press to open the loadout.",
        },
        {
          kind: "cycle",
          id: "fishing",
          label: "Fishing",
          options: ["Rotate", "Tap", "Hold"],
          start: "Rotate",
          info: "How you reel in a catch.",
        },
        {
          kind: "cycle",
          id: "nitrous",
          label: "Nitrous",
          options: HOLD,
          start: "Hold",
          info: "Choose whether you hold or press when using the vehicle nitrous.",
        },
        {
          kind: "toggle",
          id: "simple-games",
          label: "Simplified Mini Games",
          start: true,
          info: "Makes mini games easier to complete.",
        },
        {
          kind: "cycle",
          id: "auto-drive",
          label: "Auto Drive",
          options: ["Restricted", "Full"],
          start: "Restricted",
          info: "Lets the vehicle drive itself to your waypoint.",
        },
        {
          kind: "toggle",
          id: "helmet",
          label: "Auto Equip Helmet",
          start: false,
          info: "Puts a helmet on when you get on a bike.",
        },
        {
          kind: "toggle",
          id: "accessible-combat",
          label: "Accessible Combat",
          start: false,
          info: "Simplifies the inputs used in combat.",
        },
        {
          kind: "toggle",
          id: "vehicle-damage",
          label: "Reduced Vehicle Damage",
          start: false,
          info: "Reduces damage taken by your vehicle.\n\n*Warning:* This will significantly change the balance and experience of gameplay.",
        },
      ],
    },
  ],
};

export { GAMEPLAY };
