import type { Category } from "./settings-screen.types";

const INVERT = ["Default", "Inverted X", "Inverted Y", "Inverted X & Y"];

const SCHEME: Category = {
  value: "scheme",
  label: "Control Scheme",
  sections: [
    {
      title: "Control Scheme",
      rows: [
        {
          kind: "cycle",
          id: "scheme",
          label: "Control Scheme",
          options: ["Default", "Classic", "Left-handed"],
          start: "Default",
          info: "The layout of actions across your controller.",
          preview: "controller",
        },
      ],
    },
    {
      title: "Preview",
      radio: {
        id: "scheme-preview",
        label: "Preview",
        start: "foot",
        preview: "controller",
        info: "Shows the controls for this situation with the current scheme.",
        options: [
          { value: "foot", label: "On Foot" },
          { value: "aiming", label: "Aiming" },
          { value: "melee", label: "Melee" },
          { value: "vehicles", label: "Land / Water Vehicles" },
          { value: "aircraft", label: "Aircraft" },
          { value: "bicycle", label: "Bicycle" },
        ],
      },
    },
  ],
};

const CONTROLLER: Category = {
  value: "controller",
  label: "Controller",
  sections: [
    {
      title: "Sensitivity",
      rows: [
        {
          kind: "slider",
          id: "look-sens",
          label: "Look Sensitivity",
          start: 7,
          info: "How fast the camera turns with the right stick.",
          min: 1,
          max: 14,
        },
        {
          kind: "slider",
          id: "aim-sens",
          label: "Aim Sensitivity",
          start: 7,
          info: "How fast the camera turns while aiming.",
          min: 1,
          max: 14,
        },
        {
          kind: "slider",
          id: "vehicle-sens",
          label: "Vehicle Look Sensitivity",
          start: 7,
          info: "How fast the camera turns in a vehicle.",
          min: 1,
          max: 14,
        },
      ],
    },
    {
      title: "Inverted Controls",
      rows: [
        {
          kind: "cycle",
          id: "invert-look",
          label: "Look",
          options: INVERT,
          start: "Default",
          info: "Flips the look axes on foot.",
        },
        {
          kind: "cycle",
          id: "invert-move",
          label: "Movement",
          options: INVERT,
          start: "Default",
          info: "Flips the movement axes.",
        },
        {
          kind: "cycle",
          id: "invert-map",
          label: "3D Map Rotation",
          options: INVERT,
          start: "Default",
          info: "Flips the axes when you rotate the 3D map.",
        },
        {
          kind: "toggle",
          id: "aircraft-move",
          label: "Aircraft Movement",
          start: true,
          info: "Pushing forward pitches the nose down, as in a real aircraft.",
        },
      ],
    },
    {
      title: "Controller Features",
      rows: [
        {
          kind: "slider",
          id: "vibration",
          label: "Vibration & Haptics Strength",
          start: 10,
          info: "The strength of vibration from your controller.",
        },
        {
          kind: "slider",
          id: "dead-left",
          label: "Deadzone (Left Stick)",
          start: 4,
          info: "How far the left stick moves before it registers.",
        },
        {
          kind: "slider",
          id: "dead-right",
          label: "Deadzone (Right Stick)",
          start: 4,
          info: "How far the right stick moves before it registers.",
        },
        {
          kind: "slider",
          id: "trigger",
          label: "Trigger Effect Intensity",
          start: 10,
          info: "The resistance in the adaptive triggers.",
        },
      ],
    },
  ],
};

const CAMERA: Category = {
  value: "camera",
  label: "Camera",
  sections: [
    {
      title: "Land & Water Vehicles",
      rows: [
        {
          kind: "cycle",
          id: "cam-height",
          label: "Height (All Vehicles)",
          options: ["Low", "Medium", "High"],
          start: "High",
          info: "How high the camera sits behind a vehicle.",
        },
        {
          kind: "slider",
          id: "h-follow-driver",
          label: "Horizontal Follow Speed (Driver)",
          start: 10,
          info: "How quickly the camera swings behind you while driving.",
        },
        {
          kind: "slider",
          id: "v-follow-driver",
          label: "Vertical Follow Speed (Driver)",
          start: 10,
          info: "How quickly the camera levels out while driving.",
        },
        {
          kind: "slider",
          id: "delay-driver",
          label: "Follow Delay (Driver)",
          start: 0,
          info: "The follow speed delay before the camera returns behind your character as a driver.",
        },
        {
          kind: "slider",
          id: "h-follow-passenger",
          label: "Horizontal Follow Speed (Passenger)",
          start: 4,
          info: "How quickly the camera swings behind you as a passenger.",
        },
        {
          kind: "slider",
          id: "v-follow-passenger",
          label: "Vertical Follow Speed (Passenger)",
          start: 4,
          info: "How quickly the camera levels out as a passenger.",
        },
        {
          kind: "slider",
          id: "delay-passenger",
          label: "Follow Delay (Passenger)",
          start: 10,
          info: "The follow speed delay before the camera returns behind your character as a passenger in a land or water vehicle.",
        },
      ],
    },
    {
      title: "Comfort",
      rows: [
        {
          kind: "slider",
          id: "cam-shake",
          label: "Camera Shake",
          start: 10,
          info: "How much the camera shakes on impacts and explosions.",
        },
        {
          kind: "toggle",
          id: "auto-center",
          label: "Auto Center",
          start: true,
          info: "Returns the camera behind you after you stop looking around.",
        },
      ],
    },
  ],
};

export { SCHEME, CONTROLLER, CAMERA };
