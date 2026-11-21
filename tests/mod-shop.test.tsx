import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { settle } from "@ui-sdk/core/testing";
import { createAgent } from "@ui-sdk/react/agent";
import { expect, test, vi } from "vitest";

import { modShopDemos } from "../src/gallery/mod-shop";
import { ModShop } from "../src/leonida/mod-shop";
import { PlaygroundView } from "../src/site/playground";

let approve = false;
const agent = createAgent({ allow: step => !step.confirm || approve });

const item = () => document.querySelector<HTMLElement>(".ld-shop__item")!;
const status = () => document.querySelector<HTMLElement>(".ld-shop__status")!;
const wallet = () => document.querySelector<HTMLElement>(".ld-shop__wallet")!;
const counter = () => document.querySelector(".ld-shop__count")?.textContent;
const swatch = (name: string) => screen.getByRole("radio", { name });
const buyButton = () => screen.getByRole("button", { name: "Buy" });

test("arrows move the swatch focus, wrap at both ends and show the counter after the first move", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<ModShop onValueChange={onValueChange} />);

  expect(swatch("Sea Wash")).toHaveAttribute("aria-checked", "true");
  expect(counter()).toBeUndefined();
  swatch("Sea Wash").focus();

  await user.keyboard("{ArrowRight}");
  expect(swatch("Seafoam")).toHaveFocus();
  expect(swatch("Seafoam")).toHaveAttribute("aria-checked", "true");
  expect(within(item()).getByText("Seafoam")).toBeInTheDocument();
  expect(counter()).toBe("2 / 8");

  await user.keyboard("{ArrowLeft}{ArrowLeft}");
  expect(swatch("Oil")).toHaveFocus();
  expect(counter()).toBe("8 / 8");
  expect(document.querySelector(".ld-shop__strip")).toHaveAttribute("data-before");

  await user.keyboard("{ArrowRight}");
  expect(swatch("Sea Wash")).toHaveFocus();
  expect(counter()).toBe("1 / 8");
  expect(onValueChange.mock.calls.map(([value]) => value)).toEqual(["seafoam", "sea-wash", "oil", "sea-wash"]);
});

test("up and down switch the paint type without moving the swatch, and the price follows", async () => {
  const user = userEvent.setup();
  render(<ModShop />);
  expect(within(item()).getByText("$400")).toBeInTheDocument();
  expect(within(item()).getByText("Gloss")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Paint type \(1\/2\)/ })).toBeInTheDocument();

  swatch("Sea Wash").focus();
  await user.keyboard("{ArrowUp}");
  expect(swatch("Sea Wash")).toHaveFocus();
  expect(within(item()).getByText("$825")).toBeInTheDocument();
  expect(within(item()).getByText("Solid Metallic")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Paint type \(2\/2\)/ })).toBeInTheDocument();

  await user.keyboard("{ArrowDown}");
  expect(within(item()).getByText("$400")).toBeInTheDocument();
});

test("Q and E, like the bumpers, switch colour families and focus the first swatch of each", async () => {
  const user = userEvent.setup();
  const onFamilyChange = vi.fn();
  render(<ModShop onFamilyChange={onFamilyChange} />);
  const tabs = () => screen.getByRole("tablist", { name: "Paint families" });

  swatch("Sea Wash").focus();
  await user.keyboard("e");
  expect(within(tabs()).getByRole("tab", { name: "Black" })).toHaveAttribute("aria-selected", "true");
  expect(swatch("Phantom")).toHaveAttribute("aria-checked", "true");
  expect(screen.queryByRole("radio", { name: "Sea Wash" })).toBeNull();
  expect(counter()).toBeUndefined();

  expect(swatch("Phantom")).toHaveFocus();
  await user.keyboard("q");
  expect(swatch("Sea Wash")).toHaveFocus();
  await user.keyboard("q");
  expect(within(tabs()).getByRole("tab", { name: "Green" })).toHaveAttribute("aria-selected", "true");
  expect(swatch("Parakeet")).toHaveAttribute("aria-checked", "true");

  await user.click(screen.getByRole("button", { name: "Next family" }));
  expect(within(tabs()).getByRole("tab", { name: "Recommended" })).toHaveAttribute("aria-selected", "true");
  await user.click(screen.getByRole("button", { name: "Previous family" }));
  expect(onFamilyChange.mock.calls.map(([value]) => value)).toEqual([
    "black",
    "recommended",
    "green",
    "recommended",
    "green",
  ]);
});

test("the applied paint shows Applied with no price, a check on its swatch and a disabled Buy", async () => {
  const user = userEvent.setup();
  render(<ModShop defaultApplied={["sea-wash/gloss"]} />);

  expect(status()).toHaveTextContent("Applied");
  expect(document.querySelector(".ld-shop__price")).toBeNull();
  expect(swatch("Sea Wash").querySelector(".ld-shop__check")).not.toBeNull();
  expect(buyButton()).toHaveAttribute("aria-disabled", "true");

  swatch("Sea Wash").focus();
  await user.keyboard("{ArrowUp}");
  expect(status()).toHaveTextContent("Not owned");
  expect(swatch("Sea Wash").querySelector(".ld-shop__check")).toBeNull();

  await user.keyboard("{ArrowDown}{ArrowRight}");
  expect(status()).toHaveTextContent("Not owned");
  expect(within(item()).getByText("$400")).toBeInTheDocument();
  expect(buyButton()).not.toHaveAttribute("aria-disabled");
});

test("buying deducts cash, marks the paint Applied and announces it; Enter on a swatch buys too", async () => {
  const user = userEvent.setup();
  const onPurchase = vi.fn();
  render(<ModShop onPurchase={onPurchase} />);

  await user.click(buyButton());
  expect(onPurchase).toHaveBeenCalledWith({
    section: "respray",
    value: "sea-wash",
    label: "Sea Wash",
    price: 400,
    paidWith: "cash",
  });
  const balance = wallet();
  expect(balance).toHaveTextContent("$2,005");
  expect(balance).toHaveTextContent("$747");
  expect(status()).toHaveTextContent("Applied");
  await waitFor(() => expect(document.body).toHaveTextContent("Bought Sea Wash for $400. Applied."));

  swatch("Sea Wash").focus();
  await user.keyboard("{ArrowRight}{Enter}");
  expect(onPurchase).toHaveBeenLastCalledWith(expect.objectContaining({ value: "seafoam", price: 400 }));
  expect(balance).toHaveTextContent("$347");
  expect(swatch("Seafoam").querySelector(".ld-shop__check")).not.toBeNull();
  expect(swatch("Sea Wash").querySelector(".ld-shop__check")).toBeNull();
});

test("short of cash it pays from BuckMe, and with neither it greys the price and blocks Buy", async () => {
  const user = userEvent.setup();
  const onPurchase = vi.fn();
  const { unmount } = render(<ModShop defaultCash={100} defaultBuckme={500} onPurchase={onPurchase} />);
  await user.click(buyButton());
  expect(onPurchase).toHaveBeenCalledWith(expect.objectContaining({ paidWith: "buckme" }));
  expect(wallet()).toHaveTextContent("BuckMe$100Cash$100");
  unmount();

  render(<ModShop defaultCash={100} defaultBuckme={50} onPurchase={onPurchase} />);
  expect(status()).toHaveTextContent("Not enough BuckMe funds");
  expect(document.querySelector(".ld-shop__price")).toHaveAttribute("data-short");
  expect(buyButton()).toHaveAttribute("aria-disabled", "true");
  await user.click(buyButton());
  expect(onPurchase).toHaveBeenCalledTimes(1);
  expect(wallet()).toHaveTextContent("BuckMe$50Cash$100");
  swatch("Sea Wash").focus();
  await user.keyboard("{ArrowRight}");
  await waitFor(() => expect(document.body).toHaveTextContent("Seafoam, Gloss, $400, not enough BuckMe funds"));
});

test("Full Kits previews each build's stat change with green and red deltas, relative to the applied build", async () => {
  const user = userEvent.setup();
  render(<ModShop section="full-kits" />);
  const row = (label: string) => screen.getByText(label, { selector: "dt" }).parentElement!;

  expect(within(item()).getByText("Exclusive")).toBeInTheDocument();
  expect(row("Speed")).toHaveAttribute("data-trend", "up");
  expect(row("Speed")).toHaveTextContent("up 0.14.8");
  expect(row("Off-Road Handling")).toHaveAttribute("data-trend", "down");
  expect(row("Off-Road Handling")).toHaveTextContent("down 0.34.2");
  expect(row("Strength")).not.toHaveAttribute("data-trend");
  expect(document.querySelector(".ld-shop__rating")).toHaveTextContent("down 20310");
  expect(document.querySelector(".ld-shop__rating")).toHaveTextContent("up 24482");
  expect(document.querySelector(".ld-shop__step")).toHaveTextContent("1/3");

  screen.getByRole("radio", { name: "Retro Build - Elite" }).focus();
  await user.keyboard("{ArrowRight}{ArrowRight}");
  expect(screen.getByRole("radio", { name: "Racing Build - Advanced" })).toHaveAttribute("aria-checked", "true");
  expect(row("Acceleration")).toHaveTextContent("up 2.17.4");
  expect(within(item()).getByText("$16,520")).toBeInTheDocument();
  expect(status()).toHaveTextContent("Not enough BuckMe funds");

  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("radio", { name: "Retro Build - Elite" })).toHaveAttribute("aria-checked", "true");
  await user.keyboard("{Enter}");
  expect(status()).toHaveTextContent("Applied");
  expect(row("Speed")).not.toHaveAttribute("data-trend");
  expect(row("Speed")).toHaveTextContent("4.8");
  expect(wallet()).toHaveTextContent("$307");

  await user.keyboard("{ArrowRight}");
  expect(row("Acceleration")).toHaveTextContent("up 0.66.1");
  expect(row("Off-Road Handling")).toHaveTextContent("down 2.51.7");
});

test("Backspace goes back while the shop has focus", async () => {
  const user = userEvent.setup();
  const onBack = vi.fn();
  render(<ModShop onBack={onBack} />);
  await user.keyboard("{Backspace}");
  expect(onBack).not.toHaveBeenCalled();
  swatch("Sea Wash").focus();
  await user.keyboard("{Backspace}");
  expect(onBack).toHaveBeenCalledTimes(1);
  await user.click(screen.getByRole("button", { name: "Back" }));
  expect(onBack).toHaveBeenCalledTimes(2);
});

test("an agent can find the shop, pick a family and a colour, and needs a person to buy", async () => {
  approve = false;
  render(<PlaygroundView demo={modShopDemos[0]} />);
  await screen.findByRole("radiogroup", { name: "Swatches" });
  await act(() => settle());

  const entries = agent.snapshot().filter(entry => !entry.offPage && entry.component !== "more");
  for (const entry of entries) expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy();
  const labels = entries.map(entry => entry.label);
  for (const label of ["Paint families", "Swatches", "Buy", "Back", "Previous family", "Next family", "Camera view"]) {
    expect(
      labels.some(name => name?.includes(label)),
      `${label} is missing`
    ).toBe(true);
  }
  expect(labels.some(name => name?.startsWith("Paint type ("))).toBe(true);

  const pick = await agent.act({
    steps: [
      { ref: "Paint families", action: "setValue", args: ["blue"] },
      { ref: "Swatches", action: "setValue", args: ["cosmic"] },
    ],
  });
  expect(pick.ok, pick.error?.message).toBe(true);
  expect(swatch("Cosmic")).toHaveAttribute("aria-checked", "true");
  expect(within(item()).getByText("Cosmic")).toBeInTheDocument();

  const buy = { steps: [{ ref: "Buy", action: "press" }] };
  const refused = await agent.act(buy);
  expect(refused.ok).toBe(false);
  expect(status()).toHaveTextContent("Not owned");
  expect(wallet()).toHaveTextContent("$1,147");

  approve = true;
  const bought = await agent.act(buy);
  expect(bought.ok, bought.error?.message).toBe(true);
  await waitFor(() => expect(status()).toHaveTextContent("Applied"));
  expect(wallet()).toHaveTextContent("$747");
  expect(screen.getByRole("switch", { name: "Owned" })).toBeChecked();
  approve = false;
});
