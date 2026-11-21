import { BookOpen, Car, Dumbbell, Navigation2, Shirt, Utensils, type LucideIcon } from "lucide-react";
import type { ReactElement } from "react";

// what: Pistol-gun by John Colburn and swap-bag by Lorc, game-icons.net, CC BY 3.0.
const PISTOL =
  "M79.238 115.768l-28.51 67.863h406.15l-.273-67.862h-263.83v55.605h-15v-55.605h-16.68v55.605H146.1v-55.605h-17.434v55.605h-15v-55.605H79.238zm387.834 15.96v40.66h18.688v-40.66h-18.688zM56.768 198.63l20.566 32.015L28.894 406.5l101.68 7.174 21.54-97.996h115.74l14.664-80.252 174.55-3.873-.13-32.922H56.767zM263.44 235.85l-11.17 61.142h-96.05l12.98-59.05 12.53-.278-2.224 35.5 14.262 13.576 1.003-33.65 24.69-16.264 43.98-.976z";
const BAG =
  "M363.783 23.545c-9.782.057-16.583 3.047-20.744 10.22-17.51 30.18-38.432 61.645-48.552 97.245 2.836.83 5.635 1.787 8.373 2.853 7.353 2.863 14.38 6.482 20.542 10.858 27.534-25.542 58.165-45.21 87.45-65.462 11.356-7.854 12.273-13.584 10.183-20.83-2.09-7.246-9.868-16.365-20.525-23.176-10.658-6.81-23.87-11.33-34.73-11.68-.68-.022-1.345-.03-1.997-.027zm-68.998.746c-10.02-.182-17.792 6.393-23.924 20.24-8.94 20.194-10.212 53.436-1.446 83.185.156-.008.31-.023.467-.03 1.99-.087 3.99-.072 6 .03 9.436-34.822 27.966-64.72 44.013-91.528-10.31-8.496-18.874-11.782-25.108-11.896zM197.5 82.5L187 97.97c14.82 10.04 29.056 19.725 39.813 31.374 3.916 4.24 7.37 8.722 10.31 13.607 3.77-4.73 8.51-8.378 13.69-10.792.407-.188.82-.355 1.228-.53-3.423-5.44-7.304-10.418-11.51-14.972C227.765 102.83 212.29 92.52 197.5 82.5zm223.77 12.27c-29.255 20.228-58.575 39.152-84.348 62.78.438.576.848 1.168 1.258 1.76 20.68-6.75 49.486-15.333 73.916-19.41 11.484-1.916 15.66-6.552 17.574-13.228 1.914-6.676.447-16.71-5.316-26.983-.924-1.647-1.96-3.29-3.083-4.92zm-223.938 47.87c-14.95.2-29.732 4.3-43.957 12.766l9.563 16.03c21.657-12.89 42.626-14.133 65.232-4.563.52-5.592 1.765-10.66 3.728-15.21.35-.806.73-1.586 1.123-2.354-11.87-4.52-23.83-6.827-35.688-6.67zm75.8 3.934c-5.578-.083-10.597.742-14.427 2.526-4.377 2.038-7.466 4.914-9.648 9.97-.884 2.047-1.572 4.54-1.985 7.494.456-.007.91-.03 1.365-.033 16.053-.084 32.587 2.77 49.313 9.19 7.714 2.96 15.062 7.453 22.047 13.184 3.217-2.445 4.99-4.72 5.773-6.535 1.21-2.798 1.095-5.184-.634-8.82-3.46-7.275-15.207-16.955-28.856-22.27-6.824-2.658-13.98-4.224-20.523-4.614-.818-.05-1.627-.08-2.424-.092zm-24.757 38.457c-22.982.075-44.722 7.386-65 19.782-32.445 19.835-60.565 53.124-80.344 90.032-19.777 36.908-31.133 77.41-31.186 110.53-.053 33.06 10.26 57.27 32.812 67.782.043.02.082.043.125.063h.032c24.872 11.51 65.616 19.337 108.407 20.092 42.79.756 87.79-5.457 121.874-20.187 21.96-9.49 34.545-28.452 40.5-54.156 5.954-25.705 4.518-57.657-2.375-89.314-6.894-31.657-19.2-63.06-34.095-87.875-14.894-24.814-32.614-42.664-48.063-48.593-14.664-5.627-28.898-8.2-42.687-8.156z";

function Glyph512({ d }: { d: string }): ReactElement {
  return (
    <svg viewBox="0 0 512 512" aria-hidden="true">
      <path d={d} fill="currentColor" />
    </svg>
  );
}

function PistolGlyph(): ReactElement {
  return <Glyph512 d={PISTOL} />;
}

type Category = { value: string; label: string; icon: ReactElement; title: string; text: string; isNew?: boolean };

const lucide = (Icon: LucideIcon, fill?: boolean) => (
  <Icon aria-hidden="true" strokeWidth={2.5} fill={fill ? "currentColor" : "none"} />
);

const MAP_CATEGORIES: Category[] = [
  {
    value: "nav",
    label: "Navigation",
    icon: lucide(Navigation2, true),
    title: "Waypoint",
    text: "Set a waypoint and the route shows on the minimap.",
  },
  {
    value: "story",
    label: "Story",
    icon: lucide(BookOpen),
    title: "Task Name",
    text: "Placeholder description of a story task.",
    isNew: true,
  },
  {
    value: "robberies",
    label: "Robberies",
    icon: <Glyph512 d={BAG} />,
    title: "Task Name",
    text: "Placeholder description of a robbery.",
  },
  {
    value: "activities",
    label: "Activities",
    icon: lucide(Dumbbell),
    title: "Gym",
    text: "Work out to build up strength.",
  },
  { value: "vehicles", label: "Vehicles", icon: lucide(Car), title: "Garage", text: "Store and repair your vehicles." },
  {
    value: "ammu",
    label: "Ammu-Nation",
    icon: <Glyph512 d={PISTOL} />,
    title: "Ammu-Nation",
    text: "Buy weapons, ammo and outfits.",
  },
  {
    value: "style",
    label: "Style",
    icon: lucide(Shirt, true),
    title: "Clothing Store",
    text: "Change your look and lose the heat on a known outfit.",
  },
  { value: "food", label: "Food & Drink", icon: lucide(Utensils), title: "Diner", text: "Eat to top up your health." },
];

const MAP_TABS = [
  { value: "characters", label: "Jason" },
  { value: "map", label: "Map" },
  { value: "brief", label: "Brief" },
  { value: "progress", label: "Progress" },
];

export { MAP_CATEGORIES, MAP_TABS, PistolGlyph };
export type { Category };
