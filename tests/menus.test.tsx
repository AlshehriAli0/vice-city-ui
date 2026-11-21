import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createAgent } from "@ui-sdk/react/agent";
import { afterEach, expect, test, vi } from "vitest";

import { menus } from "../src/gallery/menus";
import { MapScreen } from "../src/leonida/map-screen";
import { NeonSwitch } from "../src/leonida/neon-switch";
import { PauseMenu } from "../src/leonida/pause-menu";
import {
  SettingsList,
  SettingsScreen,
  SettingsSection,
  SettingsSlider,
  SettingsSwitch,
} from "../src/leonida/settings-screen";
import { SunsetButton } from "../src/leonida/sunset-button";
import { PlaygroundView } from "../src/site/playground";

afterEach(() => {
  vi.useRealTimers();
  delete document.documentElement.dataset.motion;
});

const agent = createAgent({ allow: step => !step.confirm });

function Page({ onSelect }: { onSelect?: (value: string) => void }) {
  return (
    <>
      <PauseMenu onSelect={onSelect} />
      <SettingsScreen defaultValue="ui" />
      <MapScreen />
    </>
  );
}

test("an agent can find and drive the pause menu, settings and map", async () => {
  const onSelect = vi.fn();
  render(<Page onSelect={onSelect} />);
  const entries = agent.snapshot().filter(entry => !entry.offPage && entry.component !== "more");
  for (const entry of entries) expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy();
  const labels = entries.map(entry => entry.label);
  for (const label of [
    "Pause menu",
    "Settings categories",
    "Mini Game UI",
    "Reticle Shape",
    "Map menu",
    "Map legend",
    "Retry Checkpoint",
  ]) {
    expect(labels, `${label} is missing from the snapshot`).toContain(label);
  }

  const result = await agent.act({
    steps: [
      { ref: "Pause menu", action: "press", args: ["Settings"] },
      { ref: "Mini Game UI", action: "setChecked", args: [false] },
      { ref: "Reticle Shape", action: "setValue", args: ["Dot"] },
      { ref: "Map legend", action: "setValue", args: ["style"] },
    ],
  });
  expect(result.ok, result.error?.message).toBe(true);
  expect(onSelect).toHaveBeenCalledWith("settings");
  expect(screen.getByRole("switch", { name: "Mini Game UI" })).not.toBeChecked();
  expect(screen.getByRole("radio", { name: "Dot" })).toBeChecked();

  const audio = await agent.act({ steps: [{ ref: "Settings categories", action: "setValue", args: ["audio"] }] });
  expect(audio.ok, audio.error?.message).toBe(true);
  const volume = await agent.act({ steps: [{ ref: "Media", action: "setValue", args: [3] }] });
  expect(volume.ok, volume.error?.message).toBe(true);
  expect(screen.getByRole("slider", { name: "Media" })).toHaveValue("3");
});

test("pause rows are one tab stop: arrows move the bar, Enter, Space and Select open the row", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  const onValueChange = vi.fn();
  render(<PauseMenu onSelect={onSelect} onValueChange={onValueChange} />);
  const rows = within(screen.getByRole("toolbar", { name: "Pause menu" })).getAllByRole("button");
  expect(rows.map(row => row.textContent)).toEqual(["Map", "Game", "Store", "Help", "Photo Studio", "Settings"]);
  expect(rows[0]).toHaveAttribute("data-current");
  await user.tab();
  expect(rows[0]).toHaveFocus();
  await user.keyboard("{ArrowDown}{ArrowDown}");
  expect(rows[2]).toHaveFocus();
  expect(rows[2]).toHaveAttribute("data-current");
  expect(rows[0]).not.toHaveAttribute("data-current");
  expect(onValueChange).toHaveBeenLastCalledWith("store");
  await user.keyboard("{Enter}");
  expect(onSelect).toHaveBeenLastCalledWith("store");
  await user.keyboard("{End} ");
  expect(onSelect).toHaveBeenLastCalledWith("settings");
  await user.tab();
  expect(rows.filter(row => row.tabIndex === 0)).toEqual([rows[5]]);
  expect(rows[5]).toHaveAttribute("data-current");
  const prompts = within(screen.getByRole("group", { name: "Pause menu prompts" }));
  await user.click(prompts.getByRole("button", { name: "Select" }));
  expect(onSelect).toHaveBeenLastCalledWith("settings");
  await user.click(prompts.getByRole("button", { name: "Photo Studio" }));
  expect(onSelect).toHaveBeenLastCalledWith("photo");
  await user.click(rows[1]);
  expect(onSelect).toHaveBeenLastCalledWith("game");
});

test("Back fades the pause menu, then resumes", async () => {
  vi.useFakeTimers();
  const onResume = vi.fn();
  render(<PauseMenu onResume={onResume} />);
  act(() => screen.getByRole("button", { name: "Back" }).click());
  expect(document.querySelector(".ld-pause")).toHaveAttribute("data-closing");
  expect(onResume).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(600));
  expect(onResume).toHaveBeenCalledOnce();
  vi.useRealTimers();
});

test("settings rows: Up and Down move between rows, Left and Right flip a toggle, Restore Default resets it", async () => {
  const user = userEvent.setup();
  render(<SettingsScreen defaultValue="gameplay" />);
  const helmet = screen.getByRole("switch", { name: "Auto Equip Helmet" });
  act(() => screen.getByRole("switch", { name: "Simplified Mini Games" }).focus());
  await user.keyboard("{ArrowDown}{ArrowDown}");
  expect(helmet).toHaveFocus();
  expect(helmet.closest("[data-slot=settings-row]")).toHaveAttribute("data-active");
  expect(screen.getByRole("heading", { name: "Auto Equip Helmet" })).toBeInTheDocument();
  const restore = screen.getByRole("button", { name: "Restore Default" });
  expect(restore).toBeDisabled();
  await user.keyboard("{ArrowRight}");
  expect(helmet).toBeChecked();
  expect(restore).toBeEnabled();
  await user.keyboard("{ArrowLeft}");
  expect(helmet).not.toBeChecked();
  await user.keyboard("{ArrowRight}");
  await user.click(restore);
  expect(helmet).not.toBeChecked();
});

test("Up and Down cross sliders, cycles and switches without changing them, and stop at the ends", async () => {
  const user = userEvent.setup();
  render(<SettingsScreen defaultValue="controller" />);
  const look = screen.getByRole("slider", { name: "Look Sensitivity" });
  act(() => look.focus());
  await user.keyboard("{ArrowUp}");
  expect(look).toHaveFocus();
  expect(look).toHaveValue("7");
  await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
  const invert = screen.getByRole("radiogroup", { name: "Look" });
  expect(invert).toContainElement(document.activeElement as HTMLElement);
  expect(within(invert).getByRole("radio", { checked: true })).toHaveAccessibleName("Default");
  expect(screen.getByText("4", { selector: ".ld-set__count b" })).toBeInTheDocument();
  await user.keyboard("{ArrowRight}");
  expect(within(invert).getByRole("radio", { checked: true })).toHaveAccessibleName("Inverted X");
  await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
  expect(screen.getByRole("switch", { name: "Aircraft Movement" })).toHaveFocus();
  await user.keyboard("{End}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}");
  expect(screen.getByRole("slider", { name: "Trigger Effect Intensity" })).toHaveFocus();
});

test("a cycle's chevrons step its value through the segmented control", async () => {
  render(<SettingsScreen defaultValue="controller" />);
  const movement = screen.getByRole("radiogroup", { name: "Movement" });
  const [prev, next] = movement.parentElement!.querySelectorAll<HTMLElement>(".ld-set__chevrons > span");
  fireEvent.click(next);
  expect(within(movement).getByRole("radio", { checked: true })).toHaveAccessibleName("Inverted X");
  fireEvent.click(prev);
  fireEvent.click(prev);
  expect(within(movement).getByRole("radio", { checked: true })).toHaveAccessibleName("Inverted X & Y");
});

test("radio rows move the bar without choosing, and Space chooses", async () => {
  const user = userEvent.setup();
  render(<SettingsScreen defaultValue="scheme" />);
  act(() =>
    screen
      .getByRole("radiogroup", { name: "Control Scheme" })
      .querySelector<HTMLElement>("[aria-checked=true]")!
      .focus()
  );
  await user.keyboard("{ArrowDown}{ArrowDown}");
  const aiming = screen.getByRole("radio", { name: "Aiming" });
  expect(aiming).toHaveFocus();
  expect(aiming).not.toBeChecked();
  expect(screen.getByRole("radio", { name: "On Foot" })).toBeChecked();
  expect(aiming.closest("[data-slot=settings-row]")).toHaveAttribute("data-active");
  await user.keyboard(" ");
  expect(aiming).toBeChecked();
});

test("settings rows compose into a list of your own", async () => {
  const user = userEvent.setup();
  const onCheckedChange = vi.fn();
  render(
    <SettingsList aria-label="Audio">
      <SettingsSection title="Volume">
        <SettingsSlider id="music" label="Music" defaultValue={4} />
        <SettingsSwitch id="narration" label="Screen Narration" onCheckedChange={onCheckedChange} />
      </SettingsSection>
    </SettingsList>
  );
  const music = screen.getByRole("slider", { name: "Music" });
  act(() => music.focus());
  expect(music.closest("[data-slot=settings-row]")).toHaveAttribute("data-active");
  await user.keyboard("{ArrowRight}");
  expect(music).toHaveValue("5");
  await user.keyboard("{ArrowDown}{ArrowRight}");
  expect(screen.getByRole("switch", { name: "Screen Narration" })).toBeChecked();
  expect(onCheckedChange).toHaveBeenCalledWith(true);
});

test("settings shows seven reachable categories with Account clipped, and the bumpers cycle them", async () => {
  const user = userEvent.setup();
  render(<SettingsScreen />);
  const tabs = within(screen.getByRole("tablist", { name: "Settings categories" })).getAllByRole("tab");
  expect(tabs.map(tab => tab.textContent)).toEqual([
    "Control Scheme",
    "Controller",
    "Gameplay",
    "Display",
    "UI",
    "Camera",
    "Audio",
  ]);
  expect(screen.queryByRole("tab", { name: "Account" })).toBeNull();
  await user.click(screen.getByRole("button", { name: "Previous category" }));
  expect(screen.getByRole("tab", { name: "Control Scheme" })).toHaveAttribute("aria-selected", "true");
  await user.click(screen.getByRole("button", { name: "Previous category" }));
  expect(screen.getByRole("tab", { name: "Audio" })).toHaveAttribute("aria-selected", "true");
  await user.click(screen.getByRole("button", { name: "Next category" }));
  await user.click(screen.getByRole("radio", { name: "Aircraft" }));
  expect(screen.getByRole("radio", { name: "Aircraft" })).toBeChecked();
});

test("the map switches tabs with R1 and toggles the 2D view", async () => {
  const user = userEvent.setup();
  render(<MapScreen />);
  expect(screen.getByRole("tab", { name: "Map" })).toHaveAttribute("aria-selected", "true");
  await user.click(screen.getByRole("button", { name: "2D View" }));
  expect(screen.getByRole("button", { name: "3D View" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Next tab" }));
  expect(screen.getByRole("tab", { name: "Brief" })).toHaveAttribute("aria-selected", "true");
  await user.click(screen.getByRole("radio", { name: "Help Text" }));
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
});

test("the menu row and settings toggle parts", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  const onChecked = vi.fn();
  render(
    <>
      <SunsetButton variant="row" onClick={onClick}>
        Map
      </SunsetButton>
      <NeonSwitch className="extra" name="mini-games" onCheckedChange={onChecked}>
        Mini Game UI
      </NeonSwitch>
    </>
  );
  await user.click(screen.getByRole("button", { name: "Map" }));
  expect(onClick).toHaveBeenCalledOnce();
  const toggle = screen.getByRole("switch", { name: "Mini Game UI" });
  expect(toggle).toHaveClass("ld-toggle__track", "extra");
  await user.click(screen.getByText("Mini Game UI"));
  expect(toggle).toBeChecked();
  expect(onChecked).toHaveBeenCalledWith(true, expect.objectContaining({ reason: "press" }));
});

test("the map hover card hides while the camera pans to the next blip, then shows over it", async () => {
  vi.useFakeTimers();
  render(<MapScreen />);
  expect(screen.getAllByRole("heading", { name: "Task Name" })).toHaveLength(2);
  act(() => screen.getByRole("radio", { name: "Food & Drink" }).click());
  expect(document.querySelector(".ld-map__hover")).toBeNull();
  act(() => vi.advanceTimersByTime(200));
  expect(document.querySelector(".ld-map__hover")).toBeNull();
  act(() => vi.advanceTimersByTime(250));
  expect(screen.getByRole("heading", { name: "Diner" })).toBeInTheDocument();
  expect(document.querySelector(".ld-map__blip[data-active]")).toBeInTheDocument();
  vi.useRealTimers();
});

const layer = () => document.querySelector<HTMLElement>(".ld-map__layer")!;
function cameraOf(): number[] {
  const [, translate, zoom] = layer().style.transform.match(/translate\(([^)]*)\) scale\(([^)]*)\)/)!;
  const [x, y = "0"] = translate.split(",");
  return [parseFloat(x), parseFloat(y), Number(zoom)];
}
const map = () => screen.getByRole("application", { name: "Map" });

function still(run: () => void | Promise<void>) {
  return async () => {
    document.documentElement.dataset.motion = "still";
    try {
      await run();
    } finally {
      delete document.documentElement.dataset.motion;
    }
  };
}

test("dragging the map pans it under the cursor, and it stops at the map's edges", async () => {
  render(<MapScreen />);
  expect(cameraOf()).toEqual([-53, -260, 1]);
  expect(screen.getAllByRole("heading", { name: "Task Name" })).toHaveLength(2);
  fireEvent.pointerDown(map(), { pointerId: 1, button: 0, clientX: 500, clientY: 500, pointerType: "mouse" });
  expect(map()).toHaveAttribute("data-dragging");
  fireEvent.pointerMove(map(), { pointerId: 1, clientX: 380, clientY: 440, pointerType: "mouse" });
  expect(cameraOf()).toEqual([-173, -320, 1]);
  expect(document.querySelector(".ld-map__hover")).toBeNull();
  fireEvent.pointerMove(map(), { pointerId: 1, clientX: 5000, clientY: 5000, pointerType: "mouse" });
  expect(cameraOf()).toEqual([0, 0, 1]);
  fireEvent.pointerMove(map(), { pointerId: 1, clientX: -9000, clientY: -9000, pointerType: "mouse" });
  expect(cameraOf()).toEqual([1920 - 2880, 1080 - 1620, 1]);
  fireEvent.pointerUp(window, { pointerId: 1, pointerType: "mouse" });
  expect(map()).not.toHaveAttribute("data-dragging");
  fireEvent.pointerDown(map(), { pointerId: 2, button: 2, clientX: 500, clientY: 500, pointerType: "mouse" });
  expect(map()).not.toHaveAttribute("data-dragging");
});

test("a quick drag keeps gliding after release, then settles", async () => {
  vi.useFakeTimers();
  render(<MapScreen />);
  const at = (x: number) => ({ pointerId: 1, clientX: x, clientY: 500, pointerType: "mouse" });
  fireEvent.pointerDown(map(), { ...at(500), button: 0 });
  for (const x of [480, 460, 440, 420]) {
    vi.advanceTimersByTime(8);
    fireEvent.pointerMove(map(), at(x));
  }
  vi.advanceTimersByTime(8);
  fireEvent.pointerUp(window, at(400));
  const released = cameraOf()[0];
  act(() => vi.advanceTimersByTime(200));
  const later = cameraOf()[0];
  expect(later).toBeLessThan(released);
  act(() => vi.advanceTimersByTime(2000));
  const settled = cameraOf()[0];
  act(() => vi.advanceTimersByTime(500));
  expect(cameraOf()[0]).toBe(settled);
  vi.useRealTimers();
});

test(
  "the wheel zooms between two thirds and 2.5, and reports each zoom",
  still(() => {
    const onZoomChange = vi.fn();
    render(<MapScreen onZoomChange={onZoomChange} />);
    expect(fireEvent.wheel(map(), { deltaY: -100, clientX: 0, clientY: 0 }), "the page must not scroll").toBe(false);
    expect(onZoomChange).toHaveBeenLastCalledWith(Math.exp(0.2));
    expect(cameraOf()[2]).toBeCloseTo(Math.exp(0.2));
    for (let i = 0; i < 20; i++) fireEvent.wheel(map(), { deltaY: -100 });
    expect(cameraOf()[2]).toBe(2.5);
    expect(onZoomChange).toHaveBeenLastCalledWith(2.5);
    for (let i = 0; i < 40; i++) fireEvent.wheel(map(), { deltaY: 3, deltaMode: 1 });
    expect(cameraOf()[2]).toBeCloseTo(2 / 3);
    const [x, y] = cameraOf();
    expect([x, y]).toEqual([0, 0]);
    const calls = onZoomChange.mock.calls.length;
    fireEvent.wheel(map(), { deltaY: 100 });
    expect(onZoomChange).toHaveBeenCalledTimes(calls);
  })
);

test("held arrows and WASD pan like the stick, held + and − zoom at the cursor, and a zoom key announces the level", async () => {
  vi.useFakeTimers();
  const onZoomChange = vi.fn();
  render(<MapScreen onZoomChange={onZoomChange} />);
  act(() => map().focus());
  fireEvent.keyDown(map(), { key: "ArrowRight" });
  act(() => vi.advanceTimersByTime(500));
  fireEvent.keyUp(map(), { key: "ArrowRight" });
  act(() => vi.advanceTimersByTime(500));
  const [x, y] = cameraOf();
  expect(x).toBeLessThan(-53 - 300);
  expect(y).toBe(-260);
  fireEvent.keyDown(map(), { key: "W" });
  act(() => vi.advanceTimersByTime(300));
  fireEvent.keyUp(map(), { key: "w" });
  act(() => vi.advanceTimersByTime(500));
  expect(cameraOf()[1]).toBeGreaterThan(-260);
  const centre = (([cx, cy, z]) => [(960 - cx) / z, (540 - cy) / z])(cameraOf());
  fireEvent.keyDown(map(), { key: "+" });
  act(() => vi.advanceTimersByTime(850));
  fireEvent.keyUp(map(), { key: "+" });
  act(() => vi.advanceTimersByTime(500));
  const [cx, cy, zoom] = cameraOf();
  expect(zoom).toBeGreaterThan(1.6);
  expect(zoom).toBeLessThan(2.1);
  expect((960 - cx) / zoom).toBeCloseTo(centre[0], 0);
  expect((540 - cy) / zoom).toBeCloseTo(centre[1], 0);
  expect(onZoomChange.mock.lastCall?.[0]).toBeCloseTo(zoom, 4);
  expect(document.body).toHaveTextContent(`Map zoom ${Math.round(zoom * 100)}%`);
  fireEvent.keyDown(map(), { key: "-" });
  act(() => vi.advanceTimersByTime(3000));
  fireEvent.keyUp(map(), { key: "-" });
  act(() => vi.advanceTimersByTime(500));
  expect(cameraOf()[2]).toBeCloseTo(2 / 3);
  fireEvent.keyDown(map(), { key: "ArrowLeft", ctrlKey: true });
  act(() => vi.advanceTimersByTime(300));
  expect(cameraOf()[2]).toBeCloseTo(2 / 3);
  vi.useRealTimers();
});

test(
  "with motion off, an arrow press steps the map and a legend pick jumps straight to its blip",
  still(async () => {
    render(<MapScreen />);
    act(() => map().focus());
    fireEvent.keyDown(map(), { key: "ArrowDown" });
    expect(cameraOf()).toEqual([-53, -380, 1]);
    act(() => screen.getByRole("radio", { name: "Food & Drink" }).click());
    expect(screen.getByRole("heading", { name: "Diner" })).toBeInTheDocument();
    expect(cameraOf()).toEqual([960 - 1434, 540 - 664, 1]);
  })
);

test(
  "the cursor wraps the blip it touches; Set Destination routes to it, turns the cursor teal and becomes Remove Destination",
  still(async () => {
    const user = userEvent.setup();
    const onDestinationChange = vi.fn();
    render(<MapScreen onDestinationChange={onDestinationChange} />);
    const cursor = document.querySelector<HTMLElement>(".ld-map__cursor")!;
    expect(cursor).toHaveAttribute("data-hovering");
    expect(screen.getByText(/^\d+\.\d\d mi$/)).toBeInTheDocument();
    const addMarker = screen.getByRole("button", { name: "Add Marker" });
    expect(addMarker).toHaveAttribute("aria-disabled", "true");
    expect(addMarker).toHaveAttribute("data-muted");
    expect(document.querySelector(".ld-map__route")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Set Destination" }));
    expect(onDestinationChange).toHaveBeenLastCalledWith("story");
    expect(document.querySelector(".ld-map__route path")?.getAttribute("d")).toMatch(/^M\d+ \d+( L\d+ \d+){3,}$/);
    expect(cursor).toHaveAttribute("data-destination");
    await user.click(screen.getByRole("button", { name: "Remove Destination" }));
    expect(onDestinationChange).toHaveBeenLastCalledWith(null);
    expect(document.querySelector(".ld-map__route")).toBeNull();

    fireEvent.pointerDown(map(), { pointerId: 1, button: 0, clientX: 0, clientY: 0, pointerType: "mouse" });
    fireEvent.pointerMove(map(), { pointerId: 1, clientX: 30, clientY: 0, pointerType: "mouse" });
    expect(cursor.style.translate).toMatch(/^30px( 0px)?$/);
    fireEvent.pointerMove(map(), { pointerId: 1, clientX: 300, clientY: 0, pointerType: "mouse" });
    fireEvent.pointerUp(window, { pointerId: 1, pointerType: "mouse" });
    expect(cursor).not.toHaveAttribute("data-hovering");
    expect(cursor.style.translate).toMatch(/^0px( 0px)?$/);
    expect(document.querySelector(".ld-map__hover")).toBeNull();
    expect(addMarker).not.toHaveAttribute("aria-disabled");

    await user.click(screen.getByRole("button", { name: "Set Destination" }));
    expect(onDestinationChange).toHaveBeenLastCalledWith("marker");
    expect(document.querySelector(".ld-map__marker")).toBeInTheDocument();
    expect(document.querySelector(".ld-map__route")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove Destination" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove Marker" }));
    expect(onDestinationChange).toHaveBeenLastCalledWith(null);
    expect(document.querySelector(".ld-map__marker")).toBeNull();
  })
);

test(
  "2D and 3D keep the same spot under the cursor, and Recenter goes back to the player",
  still(async () => {
    const user = userEvent.setup();
    render(<MapScreen />);
    await user.click(screen.getByRole("button", { name: "2D View" }));
    const [fx, fy] = cameraOf();
    expect(fx).toBeCloseTo(960 - 1084, -1);
    expect(fy).toBeCloseTo(540 - 774, -1);
    expect(document.querySelector(".ld-map__cursor")).toHaveAttribute("data-hovering");
    await user.click(screen.getByRole("button", { name: "Recenter" }));
    expect(cameraOf()).toEqual([960 - 1081, 540 - 987, 1]);
    await user.click(screen.getByRole("button", { name: "3D View" }));
    const [x, y] = cameraOf();
    expect(x).toBeCloseTo(960 - 1009, -1);
    expect(y).toBeCloseTo(540 - 981, -1);
  })
);

test(
  "an agent can zoom the map and set a destination by name",
  still(async () => {
    const onZoomChange = vi.fn();
    const onDestinationChange = vi.fn();
    render(<MapScreen onZoomChange={onZoomChange} onDestinationChange={onDestinationChange} />);
    const entry = agent.snapshot().find(item => item.label === "Map");
    expect(entry).toMatchObject({ component: "map-camera", zoom: 1, destination: null });
    expect(entry?.actions).toEqual(expect.arrayContaining(["setZoom", "zoomIn", "zoomOut", "setDestination"]));
    const result = await agent.act({
      steps: [
        { ref: "Map", action: "setZoom", args: [2] },
        { ref: "Map", action: "setDestination", args: ["food"] },
      ],
    });
    expect(result.ok, result.error?.message).toBe(true);
    expect(cameraOf()[2]).toBe(2);
    expect(onZoomChange).toHaveBeenLastCalledWith(2);
    expect(onDestinationChange).toHaveBeenLastCalledWith("food");
    expect(document.querySelector(".ld-map__route")).toBeInTheDocument();
    const zoomOut = await agent.act({ steps: [{ ref: "Map", action: "zoomOut" }] });
    expect(zoomOut.ok, zoomOut.error?.message).toBe(true);
    expect(cameraOf()[2]).toBeCloseTo(4 / 3);
    const bad = await agent.act({ steps: [{ ref: "Map", action: "setZoom", args: ["far"] }] });
    expect(bad.ok).toBe(false);
  })
);

const demo = (id: string) => menus.find(item => item.id === id)!;
const panel = () => within(screen.getByRole("region", { name: "Controls" }));
const examples = () => within(screen.getByRole("radiogroup", { name: "Examples" }));

async function choose(user: ReturnType<typeof userEvent.setup>, label: string, option: string) {
  await user.click(panel().getByRole("combobox", { name: label }));
  await user.click(await screen.findByRole("option", { name: option }));
}

test("every menu demo has a clean stage, a controls panel, examples and a usage snippet", () => {
  for (const item of menus) {
    expect(item.controls?.length, item.id).toBeTruthy();
    expect(item.examples?.length, item.id).toBeGreaterThanOrEqual(2);
    expect(item.states, item.id).toBeUndefined();
    expect(item.code?.(item.defaults ?? {}).split("\n").length, item.id).toBeLessThanOrEqual(15);
  }
});

test("the pause playground: the panel moves the bar, a focused row moves the panel, replay reopens", async () => {
  const user = userEvent.setup();
  render(<PlaygroundView demo={demo("pause-menu")} />);
  await screen.findByRole("toolbar", { name: "Pause menu" });
  const rows = () => within(screen.getByRole("toolbar", { name: "Pause menu" })).getAllByRole("button");
  expect(rows()[0]).toHaveAttribute("data-current");
  await choose(user, "Selected row", "Help");
  expect(rows()[3]).toHaveAttribute("data-current");
  act(() => rows()[1].focus());
  expect(panel().getByRole("combobox", { name: "Selected row" })).toHaveTextContent("Game");
  await user.click(examples().getByRole("radio", { name: "Settings" }));
  expect(rows()[5]).toHaveAttribute("data-current");
  const before = rows()[5];
  await user.click(panel().getByRole("button", { name: "Replay open animation" }));
  expect(rows()[5]).not.toBe(before);
  expect(rows()[5]).toHaveAttribute("data-current");
  await user.clear(panel().getByRole("textbox", { name: "Mission title" }));
  await user.type(panel().getByRole("textbox", { name: "Mission title" }), "Night Run");
  expect(screen.getByRole("heading", { name: "Night Run" })).toBeInTheDocument();
});

test("the settings playground switches category both ways", async () => {
  const user = userEvent.setup();
  render(<PlaygroundView demo={demo("settings-screen")} />);
  expect(await screen.findByRole("tab", { name: "Controller" })).toHaveAttribute("aria-selected", "true");
  await user.click(examples().getByRole("radio", { name: "Display" }));
  expect(screen.getByRole("tab", { name: "Display" })).toHaveAttribute("aria-selected", "true");
  await user.click(screen.getByRole("tab", { name: "UI" }));
  expect(panel().getByRole("combobox", { name: "Category" })).toHaveTextContent("UI");
  await choose(user, "Category", "Audio");
  expect(screen.getByRole("tab", { name: "Audio" })).toHaveAttribute("aria-selected", "true");
});

test("the map playground drives the tab, cash, clock, zoom, destination and view, and the map drives the panel back", async () => {
  const user = userEvent.setup();
  document.documentElement.dataset.motion = "still";
  render(<PlaygroundView demo={demo("map-screen")} />);
  expect(await screen.findByLabelText("Cash $601")).toBeInTheDocument();
  const zoom = panel().getByRole("slider", { name: "Zoom" });
  expect(zoom).toHaveValue("1");
  act(() => zoom.focus());
  await user.keyboard("{ArrowRight}{ArrowRight}");
  expect(cameraOf()[2]).toBeCloseTo(1.1);
  fireEvent.wheel(map(), { deltaY: 100 });
  expect(Number(panel().getByRole<HTMLInputElement>("slider", { name: "Zoom" }).value)).toBeCloseTo(
    1.1 * Math.exp(-0.2),
    1
  );
  await choose(user, "Destination", "Food & Drink");
  expect(document.querySelector(".ld-map__route")).toBeInTheDocument();
  await user.click(screen.getByRole("radio", { name: "Style" }));
  await user.click(screen.getByRole("button", { name: "Set Destination" }));
  expect(panel().getByRole("combobox", { name: "Destination" })).toHaveTextContent("Style");
  await user.click(panel().getByRole("radio", { name: "2D" }));
  expect(screen.getByRole("button", { name: "3D View" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "3D View" }));
  expect(panel().getByRole("radio", { name: "3D" })).toBeChecked();
  await user.click(examples().getByRole("radio", { name: "Route" }));
  expect(panel().getByRole("combobox", { name: "Destination" })).toHaveTextContent("Food & Drink");
  await user.click(panel().getByRole("radio", { name: "Brief" }));
  expect(screen.getByRole("tab", { name: "Brief" })).toHaveAttribute("aria-selected", "true");
  await user.click(screen.getByRole("button", { name: "Next tab" }));
  expect(panel().getByRole("radio", { name: "Progress" })).toBeChecked();
  await user.click(examples().getByRole("radio", { name: "Map" }));
  await user.clear(panel().getByRole("textbox", { name: "Clock" }));
  await user.type(panel().getByRole("textbox", { name: "Clock" }), "9:40 pm");
  expect(screen.getByText("9:40 pm")).toBeInTheDocument();
  delete document.documentElement.dataset.motion;
});
