import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { settle } from "@ui-sdk/core/testing";
import { createAgent } from "@ui-sdk/react/agent";
import { StrictMode } from "react";
import { afterEach, expect, test, vi } from "vitest";

import { hud } from "../src/gallery/hud";
import { WEAPONS, menus } from "../src/gallery/menus";
import { official } from "../src/gallery/official";
import { phone } from "../src/gallery/phone";
import type { Demo } from "../src/gallery/types";
import { LeonidaToasts } from "../src/leonida/mission-toast";
import { call, endCall, message } from "../src/leonida/mission-toast.store";
import { RadioDial } from "../src/leonida/radio-dial";
import { WeaponWheel } from "../src/leonida/weapon-wheel";
import { PlaygroundView } from "../src/site/playground";
import { staticPlayground } from "../src/site/playground-state";

afterEach(() => {
  vi.useRealTimers();
});

const agent = createAgent({ allow: step => !step.confirm });

function Page({ demos }: { demos: Demo[] }) {
  return (
    <main>
      <LeonidaToasts />
      {demos.map(demo => (
        <section key={demo.id}>{demo.render(staticPlayground(demo))}</section>
      ))}
    </main>
  );
}

test("every game control is named and an agent can raise the wanted level", async () => {
  const { unmount } = render(
    <>
      {[...hud, ...phone, ...official].map(demo => (
        <PlaygroundView key={demo.id} demo={demo} />
      ))}
    </>
  );
  await act(() => settle());
  const entries = agent.snapshot().filter(entry => !entry.offPage && entry.component !== "more");
  for (const entry of entries) expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy();
  const labels = entries.map(entry => entry.label);
  for (const label of ["Wanted level", "Apps", "Locations", "Hotwire", "Reminders"]) {
    expect(
      labels.some(name => name?.includes(label)),
      `${label} is missing`
    ).toBe(true);
  }
  unmount();
  render(
    <>
      {["wanted-level", "postcard-tabs"].map(id => (
        <PlaygroundView key={id} demo={[...hud, ...phone, ...official].find(demo => demo.id === id)!} />
      ))}
    </>
  );
  await act(() => settle());
  const result = await agent.act({
    steps: [
      { ref: "Wanted level", action: "setValue", args: [5] },
      { ref: "Locations", action: "setValue", args: ["grassrivers"] },
    ],
  });
  expect(result.ok, result.error?.message).toBe(true);
  expect(await screen.findByText("5 stars, seen")).toBeInTheDocument();
  expect(screen.getByRole("slider", { name: "Stars" })).toHaveValue("5");
  expect(screen.getByRole("tab", { name: "Grassrivers" })).toHaveAttribute("aria-selected", "true");
});

test("arrow keys raise the wanted level right to left and the police state drives stars and evidence", async () => {
  const user = userEvent.setup();
  render(<PlaygroundView demo={hud.find(demo => demo.id === "wanted-level")!} />);
  screen.getByRole("radio", { name: "2 of 6 stars" }).focus();
  await user.keyboard("{ArrowLeft}{ArrowLeft}{ArrowLeft}");
  expect(screen.getByRole("radio", { name: "5 of 6 stars" })).toBeChecked();
  expect(screen.queryByRole("list", { name: "Evidence against you" })).not.toBeInTheDocument();
  await user.click(within(screen.getByRole("radiogroup", { name: "Police" })).getByRole("radio", { name: "Escaped" }));
  expect(screen.getByRole("radiogroup", { name: "Wanted level" })).toHaveAttribute("data-state", "escaped");
  expect(await screen.findByText("5 stars, escaped, still profiled")).toBeInTheDocument();
  expect(screen.getByRole("list", { name: "Evidence against you" })).toHaveTextContent("ClothingAppearance");
  await user.click(screen.getByRole("switch", { name: "Vehicle" }));
  expect(screen.getByRole("list", { name: "Evidence against you" })).toHaveTextContent("ClothingAppearanceVehicle");
});

test("the HUD controls drive heat, sprinting, damage and the feed", async () => {
  const user = userEvent.setup();
  render(<PlaygroundView demo={hud.find(demo => demo.id === "hud-meters")!} />);
  await act(() => settle());
  const hudRegion = screen.getByRole("region", { name: "Game HUD" });
  expect(screen.getByRole("img", { name: "Police heat: 2 of 6 stars, seen" })).toBeInTheDocument();
  expect(screen.getByRole("figure", { name: /police can see you/ })).toBeInTheDocument();

  const heat = await agent.act({ steps: [{ ref: "Wanted level", action: "setValue", args: [0] }] });
  expect(heat.ok, heat.error?.message).toBe(true);
  expect(screen.queryByRole("img", { name: /Police heat/ })).not.toBeInTheDocument();
  expect(hudRegion).toHaveTextContent("Drive to the marina");

  const health = screen.getByRole("meter", { name: "Health" });
  const before = Number(health.getAttribute("aria-valuenow"));
  await user.click(screen.getByRole("button", { name: "Take damage" }));
  expect(Number(health.getAttribute("aria-valuenow"))).toBe(before - 18);

  await user.click(screen.getByRole("switch", { name: "Sprinting" }));
  expect(screen.queryByRole("meter", { name: "Health" })).not.toBeInTheDocument();
  expect(screen.getByRole("meter", { name: "Stamina" })).toBeInTheDocument();
  expect(screen.getByRole("switch", { name: "Driving" })).not.toBeChecked();

  expect(screen.queryByText("Crime reported", { selector: "[role=status]" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "New feed line" }));
  expect(hudRegion.querySelector('[data-slot="hud-feed"]')).toHaveTextContent("+ Painkillers");
  expect(await screen.findByText("+ Painkillers", { selector: "[role=status]" })).toBeInTheDocument();
});

test("help prompts are named by their action and described by their help text", async () => {
  render(<Page demos={hud} />);
  await act(() => settle());
  expect(screen.getByRole("button", { name: "Hotwire" })).toHaveAccessibleDescription(
    /Hold Square to hotwire the vehicle\./
  );
});

test("the help, prompt and notification playgrounds drive their components", async () => {
  const user = userEvent.setup();
  const { unmount } = render(<PlaygroundView demo={hud.find(demo => demo.id === "hint-tooltip")!} />);
  await user.click(within(screen.getByRole("radiogroup", { name: "Help shown" })).getByRole("radio", { name: "Heal" }));
  expect(document.querySelector('[data-slot="tooltip-content"][data-open]')).toHaveTextContent(
    /and press Square to heal\./
  );
  unmount();

  const prompts = render(<PlaygroundView demo={hud.find(demo => demo.id === "button-prompt")!} />);
  await user.clear(screen.getByRole("textbox", { name: "Label" }));
  await user.type(screen.getByRole("textbox", { name: "Label" }), "Buy");
  expect(screen.getByRole("button", { name: "Buy" })).toBeInTheDocument();
  await user.click(screen.getByRole("switch", { name: "Stacked" }));
  expect(screen.getByRole("group", { name: "Screen prompts" })).not.toHaveAttribute("data-stack");
  prompts.unmount();

  render(<PlaygroundView demo={phone.find(demo => demo.id === "mission-toast")!} />);
  expect(screen.queryByText("Incoming Call…")).not.toBeInTheDocument();
  await user.click(
    within(screen.getByRole("radiogroup", { name: "Examples" })).getByRole("radio", { name: "Incoming call" })
  );
  expect(await screen.findByText("Incoming Call…")).toBeInTheDocument();
  expect(screen.getByText("Jason")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Answer call" }));
  expect(await screen.findByText("00:00")).toBeInTheDocument();
  await user.click(within(screen.getByRole("group", { name: "Actions" })).getByRole("button", { name: "Hang up" }));
  expect(await screen.findByText("Call Ended")).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByText("Call Ended")).not.toBeInTheDocument(), { timeout: 2500 });
});

test("the weapon wheel jumps by arrow, labels a beat later, and Escape equips and closes", async () => {
  const user = userEvent.setup();
  const wait = (ms: number) => act(() => new Promise(done => setTimeout(done, ms)));
  const equip = vi.fn();
  render(<WeaponWheel weapons={WEAPONS} defaultValue="pistol" onEquip={equip} />);
  const pistol = screen.getByRole("radio", { name: "Pistol, Sidearm" });
  act(() => pistol.focus());
  await user.keyboard("{ArrowLeft}");
  const empty = screen.getByRole("radio", { name: "Empty Longarm" });
  expect(empty).toHaveAttribute("aria-checked", "true");
  await wait(70);
  expect(screen.getByText("Empty")).toBeInTheDocument();
  await user.keyboard("{ArrowRight}");
  await wait(70);
  expect(screen.getByText("Service pistol")).toBeInTheDocument();
  await user.keyboard("{ArrowRight}{ArrowRight}");
  await wait(70);
  expect(screen.getByText("In hand")).toBeInTheDocument();
  await user.keyboard("{ArrowLeft}{Escape}");
  expect(equip).toHaveBeenCalledWith("compact");
  await wait(560);
  expect(screen.queryByRole("radiogroup", { name: "Weapon wheel" })).not.toBeInTheDocument();
});

test("rapid wheel moves never queue the label: it shows the current slot 50ms after the burst starts", async () => {
  const user = userEvent.setup();
  const wait = (ms: number) => act(() => new Promise(done => setTimeout(done, ms)));
  render(<WeaponWheel weapons={WEAPONS} defaultValue="pistol" />);
  act(() => screen.getByRole("radio", { name: "Pistol, Sidearm" }).focus());
  await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}");
  await wait(70);
  expect(screen.getByRole("radio", { name: "Knife, Melee" })).toHaveAttribute("aria-checked", "true");
  expect(screen.getByText("Melee")).toBeInTheDocument();
});

test("under StrictMode the wheel label swaps 50–67ms after the outline moves", async () => {
  const user = userEvent.setup();
  const wait = (ms: number) => act(() => new Promise(done => setTimeout(done, ms)));
  render(
    <StrictMode>
      <WeaponWheel weapons={WEAPONS} defaultValue="pistol" />
    </StrictMode>
  );
  act(() => screen.getByRole("radio", { name: "Pistol, Sidearm" }).focus());
  await user.keyboard("{ArrowLeft}");
  expect(screen.getByRole("radio", { name: "Empty Longarm" })).toHaveAttribute("aria-checked", "true");
  expect(screen.queryByText("Empty")).not.toBeInTheDocument();
  await wait(67);
  expect(screen.getByText("Empty")).toBeInTheDocument();
  await user.keyboard("{ArrowLeft}");
  expect(document.querySelector(".ld-wheel__label b")).toHaveTextContent("Empty");
  await wait(67);
  expect(document.querySelector(".ld-wheel__label b")).toHaveTextContent("Small game rifle");
});

test("an agent can pick a weapon slot on the card preview", async () => {
  render(<Page demos={menus.filter(demo => demo.id === "weapon-wheel")} />);
  await act(() => settle());
  const pick = await agent.act({ steps: [{ ref: "Weapon wheel", action: "setValue", args: ["knife"] }] });
  expect(pick.ok, pick.error?.message).toBe(true);
  expect(screen.getByRole("radio", { name: "Knife, Melee" })).toHaveAttribute("aria-checked", "true");
});

test("the wheel playground: tabs, closing and equipping stay in sync with the panel", async () => {
  const user = userEvent.setup();
  const wait = (ms: number) => act(() => new Promise(done => setTimeout(done, ms)));
  render(<PlaygroundView demo={menus.find(demo => demo.id === "weapon-wheel")!} />);
  const panel = within(screen.getByRole("region", { name: "Controls" }));
  await user.click(screen.getByRole("tab", { name: "Items" }));
  expect(screen.getByRole("radio", { name: "Sunglasses, Eyewear" })).toBeInTheDocument();
  expect(panel.getByRole("radio", { name: "Items" })).toBeChecked();
  await user.click(panel.getByRole("radio", { name: "Weapons" }));
  expect(screen.getByRole("tab", { name: "Weapons" })).toHaveAttribute("aria-selected", "true");
  act(() => screen.getByRole("radio", { name: "Pistol, Sidearm" }).focus());
  await user.keyboard("{Escape}");
  expect(panel.getByRole("switch", { name: "Open" })).not.toBeChecked();
  expect(panel.getByRole("combobox", { name: "In hand" })).toHaveTextContent("Pistol");
  await wait(560);
  expect(screen.queryByRole("radiogroup", { name: "Weapon wheel" })).not.toBeInTheDocument();
  await user.click(panel.getByRole("switch", { name: "Open" }));
  expect(await screen.findByRole("radiogroup", { name: "Weapon wheel" })).toBeInTheDocument();
  await user.click(within(screen.getByRole("radiogroup", { name: "Examples" })).getByRole("radio", { name: "Items" }));
  expect(screen.getByRole("tab", { name: "Items" })).toHaveAttribute("aria-selected", "true");
});

test("the radio playground: examples, power, station and source stay in sync with the panel", async () => {
  const user = userEvent.setup();
  render(<PlaygroundView demo={menus.find(demo => demo.id === "radio-dial")!} />);
  const panel = within(screen.getByRole("region", { name: "Controls" }));
  expect(screen.getByText("Good Ones")).toBeInTheDocument();
  await user.click(within(screen.getByRole("radiogroup", { name: "Examples" })).getByRole("radio", { name: "Off" }));
  expect(screen.getByText("Off", { selector: ".ld-radio__now span" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /Turn on/ }));
  expect(panel.getByRole("switch", { name: "Radio on" })).toBeChecked();
  await user.click(panel.getByRole("combobox", { name: "Station" }));
  await user.click(await screen.findByRole("option", { name: "AfroBank FM" }));
  expect(screen.getByRole("radio", { name: "AfroBank FM" })).toHaveAttribute("aria-checked", "true");
  expect(screen.getByText("Joha")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Next station" }));
  expect(panel.getByRole("combobox", { name: "Station" })).toHaveTextContent("Circoloco Records Radio");
  await user.click(within(screen.getByRole("radiogroup", { name: "Source" })).getByRole("radio", { name: "Vehicle" }));
  expect(panel.getByRole("radio", { name: "Vehicle" })).toBeChecked();
  await user.click(panel.getByRole("radio", { name: "On demand" }));
  expect(screen.getByRole("radiogroup", { name: "On demand" })).toBeInTheDocument();
});

test("the radio steps stations, powers on and switches source", async () => {
  const user = userEvent.setup();
  render(<RadioDial defaultValue="flash" />);
  expect(screen.getByText("Off")).toBeInTheDocument();
  act(() => screen.getByRole("radio", { name: "Flash FM" }).focus());
  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("radio", { name: "AfroBank FM" })).toHaveAttribute("aria-checked", "true");
  await user.click(screen.getByRole("button", { name: /Turn on/ }));
  expect(screen.getByRole("button", { name: /Turn off/ })).toBeInTheDocument();
  expect(screen.getByText("Joha")).toBeInTheDocument();
  expect(screen.getByText("Asake")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Next station" }));
  expect(screen.getByRole("radio", { name: "Circoloco Records Radio" })).toHaveAttribute("aria-checked", "true");
  await user.click(screen.getByRole("radio", { name: "Vehicle" }));
  expect(screen.getByRole("radiogroup", { name: "Vehicle" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Next feature" })).toBeInTheDocument();
  expect(screen.getByText("Low beam")).toBeInTheDocument();
});

test("Enter equips and closes the wheel, and Escape closes it wherever focus is", async () => {
  const user = userEvent.setup();
  const equip = vi.fn();
  const openChange = vi.fn();
  const { unmount } = render(
    <WeaponWheel weapons={WEAPONS} defaultValue="pistol" onEquip={equip} onOpenChange={openChange} />
  );
  act(() => screen.getByRole("radio", { name: "Pistol, Sidearm" }).focus());
  await user.keyboard("{ArrowRight}{Enter}");
  expect(equip).toHaveBeenLastCalledWith("compact");
  expect(openChange).toHaveBeenLastCalledWith(false);
  unmount();
  render(<WeaponWheel weapons={WEAPONS} defaultValue="rifle" onEquip={equip} onOpenChange={openChange} />);
  await user.keyboard("{Escape}");
  expect(equip).toHaveBeenLastCalledWith("rifle");
});

test("the pointer picks a wheel slot by its angle from the centre, like the stick", async () => {
  const user = userEvent.setup();
  render(<WeaponWheel weapons={WEAPONS} defaultValue="pistol" />);
  const stage = document.querySelector<HTMLElement>(".ld-wheel__stage")!;
  stage.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1920, height: 1080 }) as DOMRect;
  await user.pointer({ target: stage, coords: { clientX: 1200, clientY: 526 } });
  expect(screen.getByRole("radio", { name: "Unarmed, Unarmed" })).toHaveAttribute("aria-checked", "true");
  await user.pointer({ target: stage, coords: { clientX: 980, clientY: 540 } });
  expect(screen.getByRole("radio", { name: "Unarmed, Unarmed" })).toHaveAttribute("aria-checked", "true");
  await user.pointer({ target: stage, coords: { clientX: 700, clientY: 300 } });
  expect(screen.getByRole("radio", { name: "Empty Longarm" })).toHaveAttribute("aria-checked", "true");
});

test("Q and E step the radio like L1 and R1, Escape closes it, and an agent can tune it", async () => {
  const user = userEvent.setup();
  const openChange = vi.fn();
  render(<RadioDial defaultValue="flash" onOpenChange={openChange} />);
  await user.keyboard("e");
  expect(screen.getByRole("radio", { name: "AfroBank FM" })).toHaveAttribute("aria-checked", "true");
  await user.keyboard("qq");
  expect(screen.getByRole("radio", { name: "Dirty South Classics" })).toHaveAttribute("aria-checked", "true");
  const tune = await agent.act({ steps: [{ ref: "Radio station", action: "setValue", args: ["chamber"] }] });
  expect(tune.ok, tune.error?.message).toBe(true);
  expect(screen.getByRole("radio", { name: "The Chamber 106.6" })).toHaveAttribute("aria-checked", "true");
  await user.keyboard("{Escape}");
  expect(openChange).toHaveBeenLastCalledWith(false);
});

test("the notification slot holds one card: a new text replaces the old, a call counts up", async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  render(<LeonidaToasts />);
  act(() => {
    message("Alex", "First");
    message("Sam", "Second");
  });
  await act(() => vi.advanceTimersByTimeAsync(400));
  expect(screen.queryByText("First")).not.toBeInTheDocument();
  expect(screen.getByText("Second")).toBeInTheDocument();
  act(() => {
    call("Sam", "dialing");
  });
  await act(() => vi.advanceTimersByTimeAsync(400));
  expect(screen.getByText("Dialing…")).toBeInTheDocument();
  expect(screen.queryByText("Second")).not.toBeInTheDocument();
  act(() => {
    call("Sam", "connected");
  });
  await act(() => vi.advanceTimersByTimeAsync(2100));
  expect(screen.getByText("00:02")).toBeInTheDocument();
  act(() => endCall());
  vi.useRealTimers();
});
