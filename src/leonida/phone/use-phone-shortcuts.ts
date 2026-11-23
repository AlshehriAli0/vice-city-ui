import { useShortcut } from "@ui-sdk/react/shortcuts";
import type { RefObject } from "react";

import type { PhoneState } from "./phone-data";

const usePhoneShortcuts = (content: RefObject<HTMLDivElement | null>, phone: PhoneState) => {
  const { entry } = phone;
  const square = () => {
    if (entry.screen === "home") phone.go({ screen: "reminders" });
    else if (entry.screen === "snapmatic" && entry.param !== "liked") phone.update({ sheet: "options" });
  };
  const tab = (by: number) => {
    if (entry.screen !== "snapmatic" || entry.sheet) return;
    const tabs = ["home", "explore", "liked"];
    const at = tabs.indexOf(entry.param ?? "explore");
    const next = tabs[Math.min(tabs.length - 1, Math.max(0, at + by))];
    if (next !== tabs[at]) phone.update({ param: next, focus: null });
  };
  const layer = { layer: () => content.current };
  useShortcut("backspace", () => phone.back(), { ...layer, description: "Back (Circle)" });
  useShortcut("x", square, { ...layer, description: "Reminders or options (Square)" });
  useShortcut("q", () => tab(-1), { ...layer, description: "Previous tab (L1)" });
  useShortcut("e", () => tab(1), { ...layer, description: "Next tab (R1)" });

  return square;
};

export { usePhoneShortcuts };
