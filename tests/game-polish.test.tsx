import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";

import { hud } from "../src/gallery/hud";
import { WEAPONS } from "../src/gallery/menus";
import { LeonidaToasts } from "../src/leonida/mission-toast";
import { message, toast } from "../src/leonida/mission-toast.store";
import { RadioDial } from "../src/leonida/radio-dial";
import { WeaponWheel } from "../src/leonida/weapon-wheel";
import { staticPlayground } from "../src/site/playground-state";

test("closing the weapon wheel from a slot keeps focus on the wheel instead of dropping it", async () => {
  const user = userEvent.setup();
  render(<WeaponWheel weapons={WEAPONS} defaultValue="pistol" />);
  act(() => screen.getByRole("radio", { name: "Pistol, Sidearm" }).focus());
  await user.keyboard("{Escape}");
  expect(document.activeElement).toBe(document.querySelector(".ld-wheel__stage"));
});

test("closing the radio from a station keeps focus on the radio instead of dropping it", async () => {
  const user = userEvent.setup();
  render(<RadioDial defaultValue="flash" />);
  act(() => screen.getByRole("radio", { name: "Flash FM" }).focus());
  await user.keyboard("{Escape}");
  expect(document.activeElement).toBe(document.querySelector(".ld-radio__stage"));
});

test("a plain notice has no contact avatar or D-pad hint; a text message keeps both", async () => {
  render(<LeonidaToasts />);
  act(() => {
    toast("Back to the last checkpoint");
  });
  const notice = (await screen.findByText("Back to the last checkpoint")).closest(".ld-text")!;
  expect(notice.querySelector('[data-slot="notification-avatar"]')).toBeNull();
  expect(notice.querySelector('[data-slot="notification-hint"]')).toBeNull();
  act(() => {
    message("Alex", "On my way");
  });
  const text = (await screen.findByText("On my way")).closest(".ld-text")!;
  expect(text.querySelector('[data-slot="notification-avatar"]')).toHaveTextContent("A");
  expect(text.querySelector('[data-slot="notification-hint"]')).not.toBeNull();
});

test("the Reminders prompt answers where the cropped prompts demo can show it", async () => {
  const user = userEvent.setup();
  const demo = hud.find(item => item.id === "button-prompt")!;
  render(
    <>
      <LeonidaToasts />
      {demo.render(staticPlayground(demo))}
    </>
  );
  await user.click(screen.getByRole("button", { name: "Reminders" }));
  expect(await screen.findByText("Reminders", { selector: '[data-slot="toast-title"]' })).toBeInTheDocument();
});
