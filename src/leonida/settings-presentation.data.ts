import type { Category } from "./settings-screen.types";

const DISPLAY: Category = {
  value: "display",
  label: "Display",
  sections: [
    {
      title: "Display",
      rows: [
        {
          kind: "slider",
          id: "brightness",
          label: "Brightness",
          start: 5,
          info: "Raise it until the dark corners of the city just show.",
        },
      ],
    },
    {
      title: "Visual Effects",
      rows: [
        {
          kind: "slider",
          id: "motion-blur",
          label: "Motion Blur",
          start: 5,
          info: "How much the picture blurs when the camera moves.",
        },
        {
          kind: "slider",
          id: "flash",
          label: "Flash Effects Intensity",
          start: 10,
          info: "The strength of bright flashes on screen, such as *explosions* and *camera flashes*.",
          preview: "flash",
        },
        {
          kind: "slider",
          id: "hit-effects",
          label: "Hit Effects Intensity",
          start: 10,
          info: "The strength of the effects when you take damage.",
          preview: "hits",
        },
      ],
    },
  ],
};

const AUDIO: Category = {
  value: "audio",
  label: "Audio",
  sections: [
    {
      title: "Audio",
      rows: [
        {
          kind: "cycle",
          id: "vehicle-radio",
          label: "Vehicle Radio",
          options: ["Default", "On", "Off"],
          start: "Default",
          info: "Choose whether the radio is on or off when you enter a vehicle.",
        },
      ],
    },
    {
      title: "Volume",
      rows: [
        { kind: "slider", id: "master", label: "Master Volume", start: 10, info: "The overall volume of the game." },
        { kind: "slider", id: "sfx", label: "SFX", start: 10, info: "The volume of sound effects." },
        { kind: "slider", id: "ui-volume", label: "UI", start: 10, info: "The volume of menu sounds." },
        { kind: "slider", id: "dialogue", label: "Dialogue", start: 10, info: "The volume of speech." },
        { kind: "slider", id: "music", label: "Music", start: 10, info: "The volume of the score and the radio." },
        {
          kind: "slider",
          id: "media",
          label: "Media",
          start: 10,
          info: "The volume of in-world media, such as the *TV* and *radio*.",
        },
      ],
    },
    {
      title: "Narration",
      rows: [
        {
          kind: "toggle",
          id: "narration",
          label: "Screen Narration",
          start: false,
          info: "Reads menus and on-screen text aloud.",
        },
      ],
    },
  ],
};

export { DISPLAY, AUDIO };
