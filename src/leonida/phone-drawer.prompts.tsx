import type { ReactElement } from "react";

import type { PhoneState, Prompt } from "./phone-data";
import { PhonePrompts } from "./phone-prompts";

function promptsFor(phone: PhoneState, select: () => void, square: () => void): Prompt[] {
  const { entry } = phone;
  const back: Prompt = { label: "Back", key: "circle", run: phone.back };
  const pick: Prompt = { label: "Select", key: "cross", run: select };
  if (entry.screen === "home")
    return [
      { label: "Reminders", key: "square", run: square },
      pick,
      { label: "Exit", key: "circle", run: () => phone.close() },
    ];
  if (entry.sheet) return [pick, back];
  switch (entry.screen) {
    case "thread":
      return [
        { label: "Scroll", key: "R" },
        ...(phone.sent.includes(entry.param ?? "") || entry.focus === null
          ? []
          : [{ label: "Send", key: "cross", run: select } as Prompt]),
        back,
      ];
    case "snapmatic":
      return entry.param === "liked"
        ? [{ label: "Tab", key: "L1" }, back]
        : [
            { label: "Tab", key: "L1" },
            { label: "Options", key: "square", run: square },
            { label: "View comments", key: "cross", run: select },
            back,
          ];
    case "profile":
      return [{ label: "View bio", key: "cross", run: select }, back];
    case "weather":
    case "article":
    case "comments":
    case "fitness-detail":
    case "waink":
      return [back];
    default:
      return [pick, back];
  }
}

function DrawerPrompts({
  phone,
  onSelect,
  onSquare,
}: {
  phone: PhoneState;
  onSelect: () => void;
  onSquare: () => void;
}): ReactElement {
  return <PhonePrompts label="Phone prompts" rows={promptsFor(phone, onSelect, onSquare)} />;
}

export { DrawerPrompts };
