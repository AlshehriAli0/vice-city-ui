import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { settle } from "@ui-sdk/core/testing";
import { createAgent } from "@ui-sdk/react/agent";
import { beforeEach, expect, test, vi } from "vitest";

import { App } from "../src/app";
import { DemoBoundary } from "../src/site/boundary";
import { ENTRIES, sections } from "../src/site/catalog";

import wantedLevelStyles from "../src/leonida/wanted-level.css?raw";

const agent = createAgent();

beforeEach(() => {
  window.location.hash = "#/";
});

async function go(hash: string) {
  await act(async () => {
    window.location.hash = hash;
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    await settle();
  });
}

test("home lists every component as a link", async () => {
  render(<App />);
  const catalogue = screen.getByRole("region", { name: "Catalogue" });
  for (const entry of ENTRIES) {
    expect(within(catalogue).getByRole("link", { name: entry.name, hidden: false }).getAttribute("href")).toBe(
      `#/c/${entry.id}`
    );
  }
});

test("a card opens its detail page with the title focused, and prev/next move through the catalogue", async () => {
  render(<App />);
  await go("#/c/wanted-level");
  const title = screen.getByRole("heading", { level: 1, name: "Wanted Level" });
  expect(title).toHaveFocus();
  expect(document.title).toBe("Wanted Level · Vice City UI");
  expect(screen.getByRole("table")).toBeInTheDocument();

  const next = screen.getByRole("link", { name: /Next HUD/ });
  await go(next.getAttribute("href")!);
  expect(screen.getByRole("heading", { level: 1, name: "HUD" })).toHaveFocus();
  const prev = screen.getByRole("link", { name: /Previous Wanted Level/ });
  expect(prev).toHaveAttribute("href", "#/c/wanted-level");
});

test("an unknown component goes back to the catalogue", async () => {
  render(<App />);
  await go("#/c/not-a-thing");
  await act(() => settle());
  expect(window.location.hash).toBe("#/");
});

test("the search palette finds Wanted and navigates there", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.keyboard("{Control>}k{/Control}");
  const input = await screen.findByRole("combobox", { name: "Search components" });
  await user.type(input, "Wanted");
  await user.keyboard("{Enter}");
  await act(() => settle());
  expect(window.location.hash).toBe("#/c/wanted-level");
});

test("every control an agent can see on the catalogue and a detail page is named", async () => {
  render(<App />);
  await act(() => settle());
  const check = () => {
    const entries = agent.snapshot().filter(entry => !entry.offPage && entry.component !== "more");
    for (const entry of entries) expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy();
    return entries.map(entry => entry.label);
  };
  expect(check()).toContain("Time of day");
  await go("#/c/settings-screen");
  expect(check()).toEqual(expect.arrayContaining(["Source files", "Copy", "Copy settings-screen.tsx"]));
});

test("Usage and each Source file use the same copy control and copy the displayed code", async ({ onTestFinished }) => {
  const user = userEvent.setup();
  const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
  onTestFinished(() => writeText.mockRestore());
  render(<App />);
  await go("#/c/wanted-level");

  const usage = screen.getByRole("region", { name: "Usage" });
  const source = screen.getByRole("region", { name: "Source" });
  const usageCopy = within(usage).getByRole("button", { name: "Copy" });

  expect(usageCopy).toHaveAttribute("data-size", "sm");
  expect(usageCopy).toHaveAttribute("data-variant", "ghost");
  usageCopy.focus();
  await user.keyboard("{Enter}");
  expect(writeText).toHaveBeenLastCalledWith(usage.querySelector("code")?.textContent);
  expect(usageCopy).toHaveTextContent("Copied");

  const checkSourceCopy = async (name: string, text: string) => {
    await user.click(await within(source).findByRole("tab", { name }));
    const sourceCopy = within(source).getByRole("button", { name: `Copy ${name}` });
    const viewer = within(source).getByRole("region", { name: `${name} source` });
    expect(viewer.querySelector("code")?.textContent).toBe(text);
    expect(sourceCopy.className).toBe(usageCopy.className);
    expect(sourceCopy).toHaveAttribute("data-size", "sm");
    expect(sourceCopy).toHaveAttribute("data-variant", "ghost");
    await user.click(sourceCopy);
    expect(writeText).toHaveBeenLastCalledWith(text);
    expect(sourceCopy).toHaveTextContent("Copied");
  };

  const { default: wantedLevelSource } = await import("../src/leonida/wanted-level.tsx?raw");
  await checkSourceCopy("wanted-level.tsx", wantedLevelSource);
  await checkSourceCopy("wanted-level.css", wantedLevelStyles);
});

test("Still marks the page still", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "Still" }));
  expect(document.documentElement.dataset.motion).toBe("still");
});

test("a demo that throws is contained to its own card", () => {
  const Broken = () => {
    throw new Error("boom");
  };
  const error = console.error;
  console.error = () => {};
  render(
    <DemoBoundary name="Broken demo">
      <Broken />
    </DemoBoundary>
  );
  console.error = error;
  expect(screen.getByText("Broken demo couldn't render.")).toBeInTheDocument();
});

test("search puts an exact name first, then the names that start with it", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.keyboard("{Control>}k{/Control}");
  const input = await screen.findByRole("combobox", { name: "Search components" });
  await user.type(input, "map");
  const options = screen.getAllByRole("option").map(option => option.textContent);
  expect(options[0]).toMatch(/^Map/);
  await user.clear(input);
  await user.type(input, "wa");
  const names = screen.getAllByRole("option").map(option => option.querySelector(".search__name")?.textContent);
  expect(names[0]).toBe("Wanted Level");
});

test("search forgives a typo", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.keyboard("{Control>}k{/Control}");
  const input = await screen.findByRole("combobox", { name: "Search components" });
  await user.type(input, "phne");
  expect(screen.getAllByRole("option")[0].querySelector(".search__name")).toHaveTextContent("Phone");
});

test("game previews show only the component's crop box", () => {
  render(<App />);
  for (const entry of ENTRIES.filter(item => item.crop)) {
    const card = document.querySelector(`[data-id="${entry.id}"]`)!;
    expect(card.querySelector(".crop"), entry.id).not.toBeNull();
  }
});

test("search counts a swapped pair as one typo, and titles beat chapter names", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.keyboard("{Control>}k{/Control}");
  const input = await screen.findByRole("combobox", { name: "Search components" });
  const names = () => screen.getAllByRole("option").map(option => option.querySelector(".search__name")?.textContent);
  await user.type(input, "radoi");
  expect(names()[0]).toBe("Radio");
  await user.clear(input);
  await user.type(input, "wheel");
  expect(names()).toEqual(["Weapon Wheel"]);
});

test("a cropped detail stage puts the demo's settings in the controls panel, not on the stage", async () => {
  render(<App />);
  await go("#/c/radio-dial");
  const stage = document.querySelector(".detail__stage")!;
  expect(stage.querySelector(".frame-crop")).not.toBeNull();
  expect(screen.getByRole("region", { name: "Controls" })).toBeInTheDocument();
  await go("#/c/pause-menu");
  expect(document.querySelector(".detail__stage .frame-crop")).toBeNull();
});

test("home is a calm catalogue: each section is a heading with its number range over equal cards", () => {
  render(<App />);
  for (const section of sections) {
    const region = screen.getByRole("region", { name: section.title });
    const cards = region.querySelectorAll(".cat-card");
    expect(cards.length).toBe(section.demos.length);
    expect(region.querySelector(".family__range")?.textContent).toMatch(/^\d{2}–\d{2}$/);
    for (const card of cards) {
      expect(card.querySelector(".cat-card__no")).not.toBeNull();
      expect(card.querySelector(".cat-card__caption")?.textContent).toBeTruthy();
    }
  }
  expect(document.querySelector(".sky, .cursor-light")).toBeNull();
});

test("the detail page shows the title, base and pitch, with a sidebar list of every component", async () => {
  render(<App />);
  await go("#/c/weapon-wheel");
  expect(screen.getByText(ENTRIES.find(entry => entry.id === "weapon-wheel")!.pitch)).toBeInTheDocument();
  const nav = screen.getByRole("navigation", { name: "Components" });
  expect(within(nav).getByRole("link", { name: /Weapon Wheel/ })).toHaveAttribute("aria-current", "page");
  expect(within(nav).getAllByRole("link")).toHaveLength(ENTRIES.length);
});

test("no two components share a name, and the kit's titles are generic", () => {
  const names = ENTRIES.map(entry => entry.name.toLowerCase());
  expect(new Set(names).size).toBe(names.length);
  for (const name of ["radio group", "toggle switch", "dropdown menu"]) expect(names).toContain(name);
});
