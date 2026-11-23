import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { settle } from "@ui-sdk/core/testing";
import { createAgent } from "@ui-sdk/react/agent";
import { beforeEach, expect, test, vi } from "vitest";

import { App } from "../../src/site/app";
import { ENTRIES } from "../../src/site/catalogue/catalogue";
import { DemoBoundary } from "../../src/site/playground/demo-boundary";

import wantedLevelStyles from "../../src/leonida/hud/wanted-level.css?raw";

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

test("the footer links to the project on GitHub", () => {
  render(<App />);
  const footer = screen.getByRole("contentinfo");
  const repository = within(footer).getByRole("link", { name: "Vice City UI on GitHub" });
  expect(repository).toHaveAttribute("href", "https://github.com/AlshehriAli0/vice-city-ui");
});

test("a card opens its detail page with the title focused, and prev/next move through the catalogue", async () => {
  render(<App />);
  await go("#/c/wanted-level");
  const title = screen.getByRole("heading", { level: 1, name: "Wanted Level" });
  expect(title).toHaveFocus();
  expect(document.title).toBe("Wanted Level · Vice City UI");
  expect(screen.getByRole("table")).toBeInTheDocument();
  const sidebar = screen.getByRole("navigation", { name: "Components" });

  const next = screen.getByRole("link", { name: /Next HUD/ });
  await go(next.getAttribute("href")!);
  expect(screen.getByRole("heading", { level: 1, name: "HUD" })).toHaveFocus();
  expect(screen.getByRole("navigation", { name: "Components" })).toBe(sidebar);
  expect(within(sidebar).getByRole("link", { current: "page" })).toHaveAttribute("href", "#/c/hud-meters");
  const prev = screen.getByRole("link", { name: /Previous Wanted Level/ });
  expect(prev).toHaveAttribute("href", "#/c/wanted-level");

  await go("#/");
  expect(screen.getByRole("link", { name: "HUD" })).toHaveFocus();
});

test.each(["#/c/not-a-thing", "#/c/%22%5D"])("an unknown component at %s goes back to the catalogue", async hash => {
  render(<App />);
  await go(hash);
  await act(() => settle());
  expect(window.location.hash).toBe("#/");
  expect(screen.getByRole("heading", { level: 1, name: "Vice City UI" })).toHaveFocus();
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
  expect(check()).toContain("Search components");
  await go("#/c/settings-screen");
  await screen.findByRole("tablist", { name: "Source files" });
  expect(check()).toEqual(expect.arrayContaining(["Source files", "Copy", "Copy settings-screen.tsx"]));
});

test("Usage and each Source file copy the displayed code", async ({ onTestFinished }) => {
  const user = userEvent.setup();
  const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
  onTestFinished(() => writeText.mockRestore());
  render(<App />);
  await go("#/c/wanted-level");

  const usage = screen.getByRole("region", { name: "Usage" });
  const source = screen.getByRole("region", { name: "Source" });
  const usageCopy = within(usage).getByRole("button", { name: "Copy" });

  usageCopy.focus();
  await user.keyboard("{Enter}");
  expect(writeText).toHaveBeenLastCalledWith(usage.querySelector("code")?.textContent);
  expect(usageCopy).toHaveTextContent("Copied");

  const checkSourceCopy = async (name: string, text: string) => {
    await user.click(await within(source).findByRole("tab", { name }));
    const sourceCopy = within(source).getByRole("button", { name: `Copy ${name}` });
    const viewer = within(source).getByRole("region", { name: `${name} source` });
    expect(viewer.querySelector("code")?.textContent).toBe(text);
    await user.click(sourceCopy);
    expect(writeText).toHaveBeenLastCalledWith(text);
    expect(sourceCopy).toHaveTextContent("Copied");
  };

  const { default: wantedLevelSource } = await import("../../src/leonida/hud/wanted-level.tsx?raw");
  await checkSourceCopy("wanted-level.tsx", wantedLevelSource);
  await checkSourceCopy("wanted-level.css", wantedLevelStyles);
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

test("the detail page shows the title, base and pitch, with a sidebar list of every component", async () => {
  render(<App />);
  await go("#/c/weapon-wheel");
  expect(screen.getByText(ENTRIES.find(entry => entry.id === "weapon-wheel")!.pitch)).toBeInTheDocument();
  const nav = screen.getByRole("navigation", { name: "Components" });
  expect(within(nav).getByRole("link", { name: /Weapon Wheel/ })).toHaveAttribute("aria-current", "page");
  expect(within(nav).getAllByRole("link")).toHaveLength(ENTRIES.length);
});

const PREVIEWS = import.meta.glob("/public/previews/*.webp");

test("every catalogue link opens a distinct component and has its captured preview", () => {
  render(<App />);
  const catalogue = screen.getByRole("region", { name: "Catalogue" });
  const links = within(catalogue).getAllByRole("link");
  const destinations = new Set(links.map(link => link.getAttribute("href")));
  expect(destinations.size).toBe(links.length);
  expect(links).toHaveLength(ENTRIES.length);

  for (const link of links) {
    const id = link.getAttribute("href")?.replace("#/c/", "");
    const card = link.closest("article");
    const path = card?.querySelector("img")?.getAttribute("src");
    expect(path, link.textContent).toBe(`/previews/${id}.webp`);
    expect(Object.keys(PREVIEWS), link.textContent).toContain(`/public${path}`);
    expect(card?.querySelector("button, input, select"), link.textContent).toBeNull();
  }
});

test("the Menus and Wheel & radio chapters expose their demos in browsing order", () => {
  render(<App />);
  const chapterLinks = (chapter: string) =>
    within(screen.getByRole("region", { name: chapter }))
      .getAllByRole("link")
      .map(link => link.getAttribute("href"));
  expect(chapterLinks("Menus")).toEqual([
    "#/c/pause-menu",
    "#/c/save-screen",
    "#/c/settings-screen",
    "#/c/map-screen",
    "#/c/mod-shop",
  ]);
  expect(chapterLinks("Wheel & radio")).toEqual(["#/c/weapon-wheel", "#/c/radio-dial"]);
});
