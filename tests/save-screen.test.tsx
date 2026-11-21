import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createAgent } from "@ui-sdk/react/agent";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { saveScreenDemos } from "../src/gallery/save-screen";
import { GameMenu } from "../src/leonida/game-menu";
import { PauseMenu } from "../src/leonida/pause-menu";
import { SaveScreen } from "../src/leonida/save-screen";
import { DEMO_AUTOSAVE, DEMO_SAVES } from "../src/leonida/save-screen.data";
import { PlaygroundView } from "../src/site/playground";

let approve = false;
const agent = createAgent({ allow: step => !step.confirm || approve });
const now = () => new Date(2026, 10, 21, 9, 5);

beforeEach(() => {
  document.documentElement.dataset.motion = "still";
});

afterEach(() => {
  delete document.documentElement.dataset.motion;
  approve = false;
});

const slots = () => screen.getByRole("listbox", { name: "Save slots" });
const option = (name: RegExp | string) => within(slots()).getByRole("option", { name });
const prompts = (label = "Save prompts") =>
  within(screen.getByRole("group", { name: label }))
    .getAllByRole("button")
    .map(button => button.textContent);
const count = () => document.querySelector(".ld-save__count")?.textContent;

test("slot rows: arrows move the bar and the counter, Home and End jump, the list scrolls past row nine", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<SaveScreen onValueChange={onValueChange} />);

  const options = within(slots()).getAllByRole("option");
  expect(options).toHaveLength(15);
  expect(options.map(row => row.textContent.replace(/\d\d\/.*/, ""))).toEqual([
    "Chapter 6 (21%)",
    "Chapter 5 (17%)",
    "Chapter 4 (12%)",
    "Chapter 3 (9%)",
    "Chapter 2 (6%)",
    "Chapter 1 (3%)",
    ...Array.from({ length: 9 }, () => "Empty Slot"),
  ]);
  expect(options[0].textContent).toBe("Chapter 6 (21%)11/20/26  21:16");
  expect(count()).toBe("1 / 15");

  await user.tab();
  expect(options[0]).toHaveFocus();
  await user.keyboard("{ArrowDown}{ArrowDown}");
  expect(options[2]).toHaveFocus();
  expect(options[2]).toHaveAttribute("aria-selected", "true");
  expect(onValueChange).toHaveBeenLastCalledWith("c4");
  expect(count()).toBe("3 / 15");
  expect(screen.getByRole("heading", { name: "Chapter 4 (12%)" })).toBeInTheDocument();

  const view = document.querySelector<HTMLElement>(".ld-save__view")!;
  expect(view).toHaveAttribute("data-more-below");
  expect(view.style.getPropertyValue("--scroll")).toBe("0");
  await user.keyboard("{End}");
  expect(options[14]).toHaveFocus();
  expect(count()).toBe("15 / 15");
  expect(view.style.getPropertyValue("--scroll")).toBe("5");
  expect(view).not.toHaveAttribute("data-more-below");
  expect(screen.getByRole("heading", { name: "Empty Slot" })).toBeInTheDocument();
  expect(screen.getByText("Save your progress in a new slot.")).toBeInTheDocument();

  await user.keyboard("{Home}");
  expect(options[0]).toHaveFocus();
  expect(view.style.getPropertyValue("--scroll")).toBe("0");
  await user.keyboard("{ArrowUp}");
  expect(options[0]).toHaveFocus();
});

test("Enter on an empty slot saves without asking: a flat hold, then the new save on top with focus", async () => {
  const user = userEvent.setup();
  const onSave = vi.fn();
  const onSavesChange = vi.fn();
  render(<SaveScreen defaultValue="empty-1" now={now} onSave={onSave} onSavesChange={onSavesChange} />);

  await user.tab();
  expect(within(slots()).getAllByRole("option")[6]).toHaveFocus();
  expect(prompts()).toEqual(["Save", "Back"]);
  await user.keyboard("{Enter}");
  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  expect(document.querySelector(".ld-save")).toHaveAttribute("data-phase", "saving");
  expect(screen.getByRole("region", { name: "Save game" })).toHaveAttribute("aria-busy", "true");

  await waitFor(() => expect(document.querySelector(".ld-save")).toHaveAttribute("data-phase", "idle"));
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({ title: "Chapter 7", completion: 24, date: "2026-11-21T09:05" })
  );
  expect(onSavesChange).toHaveBeenCalledWith(expect.any(Array), expect.objectContaining({ reason: "save" }));
  const first = within(slots()).getAllByRole("option")[0];
  expect(first.textContent).toBe("Chapter 7 (24%)11/21/26  09:05");
  expect(first).toHaveAttribute("aria-selected", "true");
  expect(count()).toBe("1 / 15");
  expect(
    within(slots())
      .getAllByRole("option")
      .filter(row => row.textContent === "Empty Slot")
  ).toHaveLength(8);
});

test("overwriting a filled slot asks first: No keeps it, Yes replaces it with the current progress", async () => {
  const user = userEvent.setup();
  const onSavesChange = vi.fn();
  render(<SaveScreen defaultValue="c5" now={now} onSavesChange={onSavesChange} />);

  expect(prompts()).toEqual(["Delete", "Overwrite", "Back"]);
  await user.tab();
  await user.keyboard("{Enter}");
  const dialog = await screen.findByRole("alertdialog", { name: "Overwrite saved game?" });
  expect(dialog).toHaveAccessibleDescription(
    '"Chapter 5 (17%)" (11/20/26 16:49) will be permanently overwritten with your new save.'
  );
  expect(document.querySelector(".ld-save")).toHaveAttribute("data-confirm", "overwrite");
  expect(within(dialog).getByRole("button", { name: "Yes" })).toHaveFocus();

  await user.click(within(dialog).getByRole("button", { name: "No" }));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  expect(onSavesChange).not.toHaveBeenCalled();
  expect(option(/Chapter 5 \(17%\)/)).toHaveAttribute("aria-selected", "true");

  await user.click(screen.getByRole("button", { name: "Overwrite" }));
  await user.keyboard("{Enter}");
  await waitFor(() => expect(onSavesChange).toHaveBeenCalledOnce());
  const [next, details] = onSavesChange.mock.calls[0];
  expect(details).toMatchObject({ reason: "overwrite", save: { id: "c5", title: "Chapter 7" } });
  expect(next).toHaveLength(DEMO_SAVES.length);
  await waitFor(() => expect(document.querySelector(".ld-save")).toHaveAttribute("data-phase", "idle"));
  expect(within(slots()).getAllByRole("option")[0]).toHaveTextContent("Chapter 7 (24%)");
});

test("Square deletes after a confirm, and the bar stays on the same row", async () => {
  const user = userEvent.setup();
  render(<SaveScreen defaultValue="c4" />);
  await user.tab();
  await user.keyboard("x");
  const dialog = await screen.findByRole("alertdialog", { name: "Delete saved game?" });
  expect(dialog).toHaveAccessibleDescription('"Chapter 4 (12%)" (11/19/26 19:44) will be permanently deleted.');
  await user.click(within(dialog).getByRole("button", { name: "Yes" }));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  expect(within(slots()).queryByRole("option", { name: /Chapter 4/ })).not.toBeInTheDocument();
  expect(option(/Chapter 3 \(9%\)/)).toHaveAttribute("aria-selected", "true");
  expect(count()).toBe("3 / 15");
});

test("load lists the autosave with the saves, asks on a sheet, and Yes loads", async () => {
  const user = userEvent.setup();
  const onLoad = vi.fn();
  render(<SaveScreen mode="load" defaultSaves={[DEMO_AUTOSAVE, ...DEMO_SAVES]} onLoad={onLoad} />);

  const games = screen.getByRole("listbox", { name: "Saved games" });
  const rows = within(games).getAllByRole("option");
  expect(rows).toHaveLength(7);
  expect(rows[1].textContent).toBe("(Autosave) Chapter 6 (21%)11/20/26  21:15");
  expect(within(games).queryByRole("option", { name: /Empty Slot/ })).not.toBeInTheDocument();
  expect(document.querySelector(".ld-save__count")).toBeNull();
  expect(prompts("Load prompts")).toEqual(["Delete", "Load", "Back"]);

  await user.click(screen.getByRole("button", { name: "Load" }));
  const dialog = await screen.findByRole("alertdialog", { name: "Load saved game?" });
  expect(dialog).toHaveAttribute("data-variant", "sheet");
  expect(dialog).toHaveAccessibleDescription(
    'Loading this save will cause any unsaved progress from your current session and "(Autosave) Chapter 6 (21%)" to be lost.'
  );
  expect(document.querySelector(".ld-save")).toHaveAttribute("data-confirm", "load");
  await user.click(within(dialog).getByRole("button", { name: "Yes" }));
  await waitFor(() => expect(onLoad).toHaveBeenCalledWith(expect.objectContaining({ id: "c6" })));
  expect(document.querySelector(".ld-save")).toHaveAttribute("data-phase", "loading");
});

test("load with no saves shows the empty slot copy and only Back", () => {
  render(<SaveScreen mode="load" defaultSaves={[]} />);
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Empty Slot" })).toBeInTheDocument();
  expect(prompts("Load prompts")).toEqual(["Back"]);
});

test("the Game menu: three rows, Save and Load open their screens, New Game asks, Back leaves", async () => {
  const user = userEvent.setup();
  const onNewGame = vi.fn();
  const onBack = vi.fn();
  const onScreenChange = vi.fn();
  render(<GameMenu autoFocus onNewGame={onNewGame} onBack={onBack} onScreenChange={onScreenChange} />);

  const menu = screen.getByRole("toolbar", { name: "Game menu" });
  const rows = within(menu).getAllByRole("button");
  expect(rows.map(row => row.textContent)).toEqual(["Save Game", "Load Game", "New Game"]);
  expect(rows[0]).toHaveFocus();
  expect(rows[0]).toHaveAttribute("data-current");
  expect(prompts("Game menu prompts")).toEqual(["Select", "Back"]);

  await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
  const dialog = await screen.findByRole("alertdialog", { name: "Start new game?" });
  expect(dialog).toHaveAccessibleDescription("Any unsaved progress will be lost.");
  await user.click(within(dialog).getByRole("button", { name: "No" }));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  expect(onNewGame).not.toHaveBeenCalled();
  await waitFor(() => expect(within(menu).getByRole("button", { name: "New Game" })).toHaveFocus());

  await user.keyboard("{Enter}");
  await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Yes" }));
  await waitFor(() => expect(onNewGame).toHaveBeenCalledOnce());

  await user.click(
    within(screen.getByRole("toolbar", { name: "Game menu" })).getByRole("button", { name: "Load Game" })
  );
  expect(onScreenChange).toHaveBeenLastCalledWith("load");
  expect(await screen.findByRole("listbox", { name: "Saved games" })).toBeInTheDocument();
  await waitFor(() => expect(within(screen.getByRole("listbox")).getAllByRole("option")[0]).toHaveFocus());
  await user.keyboard("{Backspace}");
  await waitFor(() => expect(screen.getByRole("toolbar", { name: "Game menu" })).toBeInTheDocument());
  expect(onScreenChange).toHaveBeenLastCalledWith("menu");
  await waitFor(() =>
    expect(
      within(screen.getByRole("toolbar", { name: "Game menu" })).getByRole("button", { name: "Load Game" })
    ).toHaveFocus()
  );
  await user.keyboard("{Backspace}");
  expect(onBack).toHaveBeenCalledOnce();
});

test("Save Game stays focusable but does nothing during a mission", async () => {
  const user = userEvent.setup();
  const onScreenChange = vi.fn();
  render(<GameMenu autoFocus saveDisabled onScreenChange={onScreenChange} />);
  const save = screen.getByRole("button", { name: "Save Game" });
  expect(save).toHaveFocus();
  expect(save).toHaveAttribute("aria-disabled", "true");
  await user.keyboard("{Enter}");
  await user.click(screen.getByRole("button", { name: "Select" }));
  expect(onScreenChange).not.toHaveBeenCalled();
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
});

test("the pause menu opens Game in place and comes back to the Game row", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(<PauseMenu onSelect={onSelect} />);
  await user.click(screen.getByRole("button", { name: "Game" }));
  expect(onSelect).toHaveBeenCalledWith("game");
  expect(screen.queryByRole("toolbar", { name: "Pause menu" })).not.toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole("button", { name: "Save Game" })).toHaveFocus());
  await user.click(screen.getByRole("button", { name: "Back" }));
  const pause = screen.getByRole("toolbar", { name: "Pause menu" });
  await waitFor(() => expect(within(pause).getByRole("button", { name: "Game" })).toHaveFocus());
  expect(document.querySelector(".ld-pause")).toHaveAttribute("data-return");

  render(<PauseMenu game={false} onSelect={onSelect} />);
  const plain = screen.getAllByRole("toolbar", { name: "Pause menu" })[1];
  await user.click(within(plain).getByRole("button", { name: "Game" }));
  expect(screen.getAllByRole("toolbar", { name: "Pause menu" })).toHaveLength(2);
});

test("an agent can pick a slot and save, but overwrite, delete and load need a person", async () => {
  const onSavesChange = vi.fn();
  const onLoad = vi.fn();
  render(
    <>
      <SaveScreen now={now} onSavesChange={onSavesChange} />
      <SaveScreen mode="load" onLoad={onLoad} />
    </>
  );
  const entries = agent.snapshot().filter(entry => !entry.offPage && entry.component !== "more");
  for (const entry of entries) expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy();
  const labels = entries.map(entry => entry.label);
  for (const label of ["Save slots", "Saved games", "Overwrite", "Load", "Back"]) {
    expect(labels, `${label} is missing from the snapshot`).toContain(label);
  }

  const pick = await agent.act({ steps: [{ ref: "Save slots", action: "setValue", args: ["c3"] }] });
  expect(pick.ok, pick.error?.message).toBe(true);
  expect(option(/Chapter 3/)).toHaveAttribute("aria-selected", "true");

  const overwrite = {
    steps: [
      { ref: "Overwrite", action: "press" },
      { ref: "Overwrite saved game?", action: "press", args: ["Yes"] },
    ],
  };
  expect((await agent.act(overwrite)).ok).toBe(false);
  const no = await agent.act({ steps: [{ ref: "Overwrite saved game?", action: "press", args: ["No"] }] });
  expect(no.ok, no.error?.message).toBe(true);
  await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  expect(onSavesChange).not.toHaveBeenCalled();

  approve = true;
  const approved = await agent.act(overwrite);
  expect(approved.ok, approved.error?.message).toBe(true);
  await waitFor(() =>
    expect(onSavesChange).toHaveBeenCalledWith(expect.any(Array), expect.objectContaining({ reason: "overwrite" }))
  );
  await waitFor(() => expect(document.querySelector(".ld-save")).toHaveAttribute("data-phase", "idle"));

  approve = false;
  const load = {
    steps: [
      { ref: "Load", action: "press" },
      { ref: "Load saved game?", action: "press", args: ["Yes"] },
    ],
  };
  expect((await agent.act(load)).ok).toBe(false);
  expect(onLoad).not.toHaveBeenCalled();
  await agent.act({ steps: [{ ref: "Load saved game?", action: "press", args: ["No"] }] });
  await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  approve = true;
  const loaded = await agent.act(load);
  expect(loaded.ok, loaded.error?.message).toBe(true);
  await waitFor(() => expect(onLoad).toHaveBeenCalledOnce());
});

test("the save playground drives the screen, slot, used slots, autosave and saving state", async () => {
  const user = userEvent.setup();
  const demo = saveScreenDemos[0];
  render(<PlaygroundView demo={demo} />);
  expect(await screen.findByRole("toolbar", { name: "Game menu" })).toBeInTheDocument();
  const examples = within(screen.getByRole("radiogroup", { name: "Examples" }));

  await user.click(examples.getByRole("radio", { name: "Empty slot" }));
  expect(await screen.findByRole("listbox", { name: "Save slots" })).toBeInTheDocument();
  expect(within(slots()).getAllByRole("option")[6]).toHaveAttribute("aria-selected", "true");
  expect(count()).toBe("7 / 15");

  await user.click(examples.getByRole("radio", { name: "Load" }));
  const games = await screen.findByRole("listbox", { name: "Saved games" });
  expect(within(games).getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true");
  expect(within(games).getAllByRole("option")[1]).toHaveTextContent("(Autosave) Chapter 6");

  await user.click(examples.getByRole("radio", { name: "No saves" }));
  await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());

  await user.click(examples.getByRole("radio", { name: "Saving" }));
  await waitFor(() => expect(document.querySelector(".ld-save")).toHaveAttribute("data-phase", "saving"));

  expect(demo.code?.(demo.defaults ?? {}).split("\n").length).toBeLessThanOrEqual(15);
});
