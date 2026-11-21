import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createAgent } from "@ui-sdk/react/agent"
import { settle } from "@ui-sdk/core/testing"
import { PlaygroundView, staticPlayground, usePlayground } from "../src/site/playground"
import type { Demo as DemoType, Values } from "../src/gallery/types"
import { expect, test, vi } from "vitest"

const toast = vi.hoisted(() => Object.assign(vi.fn(), { success: vi.fn(), dismiss: vi.fn() }))
vi.mock("../src/leonida/mission-toast", () => ({ toast, LeonidaToasts: () => null, missionPassed: vi.fn() }))

const { coreDisplay } = await import("../src/gallery/core-display")
const { Progress } = await import("../src/ui/progress")

const agent = createAgent()

function demo(id: string): DemoType {
  const found = coreDisplay.find((item) => item.id === id)
  if (!found) throw new Error(`No demo ${id}`)
  return found
}

// A demo with its examples bar and controls panel, as on its detail page.
function Demo({ id }: { id: string }) {
  return <PlaygroundView demo={demo(id)} />
}

// A demo fixed at some values, like a catalogue card.
function At({ id, values = {} }: { id: string; values?: Values }) {
  const found = demo(id)
  const playground = staticPlayground(found)
  return found.render({ ...playground, values: { ...playground.values, ...values } })
}

// Just the stage, with live state behind it, so an agent's changes stick without the panel's own controls in the way.
function Live({ demo }: { demo: DemoType }) {
  return demo.render(usePlayground(demo))
}

function Page() {
  return (
    <>
      {coreDisplay.map((item) => (
        <section key={item.id}>
          <Live demo={item} />
        </section>
      ))}
    </>
  )
}

// The examples bar comes first, so its radio wins when a control option shares the label.
const example = (name: string) => screen.getAllByRole("radio", { name })[0]

test("every demo is a playground: controls, defaults, a few examples and a usage snippet", () => {
  for (const item of coreDisplay) {
    expect(item.controls?.length, item.id).toBeGreaterThan(0)
    for (const control of item.controls ?? []) expect(item.defaults, `${item.id} ${control.name}`).toHaveProperty(control.name)
    expect(item.examples?.length, item.id).toBeGreaterThanOrEqual(2)
    expect(item.examples?.length, item.id).toBeLessThanOrEqual(5)
    expect(item.code?.(item.defaults ?? {}).split("\n").length, item.id).toBeLessThanOrEqual(16)
  }
})

test("usage snippets spell out only the props that differ from the component's defaults", () => {
  const badge = demo("core-badges")
  expect(badge.code?.(badge.defaults ?? {})).toBe('<Badge variant="outline">\n  <BadgeDot />\n  New\n</Badge>')
  expect(badge.code?.({ ...badge.defaults, variant: "soft", tone: "neutral", dot: false, text: "Owned" })).toBe('<Badge tone="neutral">\n  Owned\n</Badge>')
  const tabs = demo("core-tabs")
  expect(tabs.code?.({ ...tabs.defaults, variant: "chips" })).toContain('<Tabs variant="chips" value="map"')
  expect(tabs.code?.(tabs.defaults ?? {})).toContain('<Tabs value="map"')
})

test("an agent can find every core display control by name", async () => {
  render(<Page />)
  await act(() => settle())
  const entries = agent.snapshot().filter((entry) => !entry.offPage && entry.component !== "more")
  for (const entry of entries) expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy()
  const labels = entries.map((entry) => entry.label)
  for (const label of ["Pause menu", "Help topics", "Results pages", "Game", "Quick menu", "Health", "Set destination"]) {
    expect(labels, `${label} is missing from the snapshot`).toContain(label)
  }
})

test("an agent can switch tabs, open a help topic, page results and open the save dialog", async () => {
  render(<Page />)
  await act(() => settle())
  const result = await agent.act({
    steps: [
      { ref: "Pause menu", action: "setValue", args: ["brief"] },
      { ref: "Help topics", action: "open", args: ["map"] },
      { ref: "Results pages", action: "setPage", args: [7] },
      { ref: "Game", action: "setOpen", args: [true] },
    ],
  })
  await act(() => settle())
  expect(result.ok, result.error?.message).toBe(true)
  expect(within(screen.getByRole("tablist", { name: "Pause menu" })).getByRole("tab", { name: "Brief" })).toHaveAttribute("aria-selected", "true")
  expect(within(screen.getByRole("heading", { name: "Map" })).getByRole("button")).toHaveAttribute("aria-expanded", "true")
  expect(document.querySelector(".cd-count")).toHaveTextContent("7 / 12")
  expect(await screen.findByRole("dialog", { name: "Save game" })).toBeInTheDocument()
})

test("demo copy stays placeholder: no invented features", () => {
  const { container } = render(
    <>
      {coreDisplay.map((item) =>
        [{}, ...(item.examples ?? []).map((preset) => preset.values)].map((values, index) => (
          <section key={`${item.id}-${index}`}>
            <At id={item.id} values={values} />
          </section>
        )),
      )}
    </>,
  )
  const text = container.textContent ?? ""
  for (const banned of ["heist", "vault", "explosive", "launder", "crew cut", "getaway", "penitentiary", "skill"]) {
    expect(text.toLowerCase()).not.toContain(banned)
  }
})

test("the save dialog opens from its pause row, saves and returns focus, and the Open control follows it", async () => {
  const user = userEvent.setup()
  render(<Demo id="core-dialogs" />)
  const open = screen.getByRole("switch", { name: "Open" })
  const trigger = screen.getByRole("button", { name: "Game" })
  await user.click(trigger)
  const dialog = await screen.findByRole("dialog", { name: "Save game" })
  expect(open).toBeChecked()
  await user.click(within(dialog).getByRole("button", { name: /Save/ }))
  await act(() => settle())
  expect(toast.success).toHaveBeenCalledWith("Game saved")
  expect(screen.queryByRole("dialog", { name: "Save game" })).toBeNull()
  expect(trigger).toHaveFocus()
  expect(open).not.toBeChecked()
})

test("Escape closes the save dialog and focus goes back", async () => {
  const user = userEvent.setup()
  render(<Demo id="core-dialogs" />)
  const trigger = screen.getByRole("button", { name: "Game" })
  await user.click(trigger)
  await screen.findByRole("dialog", { name: "Save game" })
  await user.keyboard("{Escape}")
  await act(() => settle())
  expect(screen.queryByRole("dialog", { name: "Save game" })).toBeNull()
  expect(trigger).toHaveFocus()
})

test("an example opens the side sheet without its trigger, on the side the panel picks", async () => {
  const user = userEvent.setup()
  render(<Demo id="core-dialogs" />)
  await user.click(example("Side sheet"))
  const sheet = await screen.findByRole("dialog", { name: "Settings" })
  expect(sheet).toHaveAttribute("data-side", "left")
  expect(screen.getByRole("switch", { name: "Open" })).toBeChecked()
})

test("the quick menu toggles a checkbox item and keeps the menu open", async () => {
  const user = userEvent.setup()
  render(<Demo id="core-menu" />)
  await user.click(screen.getByRole("button", { name: "Quick menu" }))
  const subtitles = await screen.findByRole("menuitemcheckbox", { name: "Subtitles" })
  expect(subtitles).toHaveAttribute("aria-checked", "false")
  await user.click(subtitles)
  expect(subtitles).toHaveAttribute("aria-checked", "true")
  await user.click(screen.getByRole("menuitem", { name: "Map" }))
  expect(toast).toHaveBeenCalledWith("Chose map")
})

test("the Open control shows the menu without pressing its trigger", async () => {
  const user = userEvent.setup()
  render(<Demo id="core-menu" />)
  expect(screen.queryByRole("menu")).toBeNull()
  await user.click(screen.getByRole("switch", { name: "Open" }))
  expect(await screen.findByRole("menuitem", { name: "Phone" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "Quick menu" })).toHaveAttribute("aria-expanded", "true")
})

// Browsers turn Shift+F10 into the same contextmenu event; jsdom only fires it for a right click.
test("a right click opens the photo's context menu and runs an item", async () => {
  const user = userEvent.setup()
  render(<Demo id="core-menu" />)
  await user.click(example("Context menu"))
  await user.pointer({ keys: "[MouseRight]", target: screen.getByLabelText("Photo options area") })
  await user.click(await screen.findByRole("menuitem", { name: "Delete" }))
  expect(toast).toHaveBeenCalledWith("Deleted the photo")
})

test("the Open control shows a popover, and a tooltip and hover card in turn", async () => {
  const user = userEvent.setup()
  render(<Demo id="core-floating" />)
  const open = screen.getByRole("switch", { name: "Open" })
  await user.click(open)
  expect(await screen.findByText("1.86 mi from your position.")).toBeInTheDocument()
  // Pressing the switch reaches it even though it sits outside the open popover.
  await user.click(open)
  await act(() => settle())
  expect(screen.queryByText("1.86 mi from your position.")).toBeNull()
  await user.click(example("Tooltip"))
  expect(await screen.findByText("Your route is pink. Your own waypoints are cyan.")).toBeInTheDocument()
  await user.click(example("Hover card"))
  expect(await screen.findByText("Vice City", { selector: ".cd-hover__meta" })).toBeInTheDocument()
})

test("arrow keys move between tabs and the panel follows the selected tab", async () => {
  const user = userEvent.setup()
  render(<Demo id="core-tabs" />)
  const list = screen.getByRole("tablist", { name: "Pause menu" })
  within(list).getByRole("tab", { name: "Map" }).focus()
  await user.keyboard("{ArrowRight}")
  expect(within(list).getByRole("tab", { name: "Brief" })).toHaveAttribute("aria-selected", "true")
  expect(screen.getByText("Brief content.")).toBeVisible()
  expect(screen.getByRole("radio", { name: "Brief" })).toBeChecked()
  await user.keyboard("{ArrowLeft}{ArrowLeft}")
  expect(within(list).getByRole("tab", { name: "Progress" })).toHaveAttribute("aria-selected", "true")
})

test("the variant example restyles the tabs and the bumpers come and go", async () => {
  const user = userEvent.setup()
  render(<Demo id="core-tabs" />)
  await user.click(example("Chips"))
  expect(screen.getByRole("tablist", { name: "Pause menu" }).closest("[data-variant]")).toHaveAttribute("data-variant", "chips")
  expect(screen.getByText("L1")).toBeInTheDocument()
  await user.click(screen.getByRole("switch", { name: "Bumpers" }))
  expect(screen.queryByText("L1")).toBeNull()
})

test("accordion items open and close under their own headings, and the panel shows which is open", async () => {
  const user = userEvent.setup()
  render(<Demo id="core-accordion" />)
  expect(screen.getAllByRole("heading", { level: 4 }).map((heading) => heading.textContent)).toEqual(["Controls", "Map", "Accessibility"])
  const map = screen.getByRole("button", { name: "Map" })
  expect(map).toHaveAttribute("aria-expanded", "false")
  await user.click(map)
  expect(map).toHaveAttribute("aria-expanded", "true")
  expect(screen.getByRole("button", { name: "Controls" })).toHaveAttribute("aria-expanded", "false")
  expect(screen.getByRole("radio", { name: "Map" })).toBeChecked()
  map.focus()
  await user.keyboard(" ")
  expect(map).toHaveAttribute("aria-expanded", "false")
  expect(screen.getByRole("radio", { name: "None" })).toBeChecked()
})

test("pagination moves pages, marks the current one and keeps the Page control in step", async () => {
  const user = userEvent.setup()
  render(<Demo id="core-nav" />)
  const nav = screen.getByRole("navigation", { name: "Results pages" })
  await user.click(within(nav).getByRole("button", { name: "Next page" }))
  expect(document.querySelector(".cd-count")).toHaveTextContent("5 / 12")
  expect(within(nav).getByText("5").closest("[aria-current]")).toHaveAttribute("aria-current", "page")
  expect(screen.getByRole("slider", { name: "Page" })).toHaveValue("5")
  await user.click(within(nav).getByRole("button", { name: "Previous page" }))
  await user.click(within(nav).getByRole("button", { name: "Previous page" }))
  expect(document.querySelector(".cd-count")).toHaveTextContent("3 / 12")
})

test("the breadcrumb links the level above and marks the current page from the panel", async () => {
  const user = userEvent.setup()
  render(<Demo id="core-nav" />)
  await user.click(example("Breadcrumb"))
  const crumbs = screen.getByRole("navigation", { name: "Store" })
  expect(within(crumbs).getByRole("link", { name: "Clothing store" })).toHaveAttribute("href", "#core-nav")
  expect(within(crumbs).getByText("T-shirts")).toHaveAttribute("aria-current", "page")
  expect(within(crumbs).getAllByRole("listitem")).toHaveLength(2)
  const current = screen.getByRole("textbox", { name: "Current page" })
  await user.clear(current)
  await user.type(current, "Shoes")
  expect(within(crumbs).getByText("Shoes")).toHaveAttribute("aria-current", "page")
})

test("avatars are named images that carry their status, and a group counts the rest", async () => {
  const user = userEvent.setup()
  render(<Demo id="core-avatars" />)
  const jason = screen.getByRole("img", { name: "Jason Duval, online" })
  expect(jason).toHaveAttribute("data-status", "online")
  expect(jason).not.toHaveAttribute("data-size")
  await user.click(example("Busy"))
  expect(screen.getByRole("img", { name: "Jason Duval, busy" })).toHaveAttribute("data-ring", "pink")
  await user.click(example("Group"))
  const group = screen.getByRole("group", { name: "Contacts" })
  expect(within(group).getAllByRole("img")).toHaveLength(4)
  expect(within(group).getByRole("img", { name: "1 more" })).toHaveTextContent("+1")
})

test("presentational parts expose data-slot and state attributes to style from", () => {
  render(
    <>
      <At id="core-cards" />
      <At id="core-alerts" />
      <At id="core-badges" />
      <At id="core-feedback" values={{ component: "skeleton" }} />
    </>,
  )
  const vehicles = screen.getByRole("heading", { name: "Vehicles", level: 4 }).closest('[data-slot="card"]')
  expect(vehicles).toHaveAttribute("data-interactive")
  expect(vehicles).toHaveAttribute("data-variant", "glass")
  expect(vehicles?.querySelector('[data-slot="card-media"] img')).toHaveAttribute("src", "/vc/ue-grotti-cheetah.jpg")
  const warning = screen.getByText("Controller disconnected").closest('[data-slot="alert"]')
  expect(warning).toHaveAttribute("data-tone", "warning")
  expect(within(warning as HTMLElement).getByRole("button", { name: "Retry" }).closest('[data-slot="alert-action"]')).not.toBeNull()
  const fresh = screen.getByText("New").closest('[data-slot="badge"]')
  expect(fresh).toHaveAttribute("data-variant", "outline")
  expect(fresh?.querySelector('[data-slot="badge-dot"]')).not.toBeNull()
  const skeletons = document.querySelectorAll('[data-slot="skeleton"]')
  expect(skeletons).toHaveLength(6)
  for (const skeleton of skeletons) expect(skeleton).toHaveAttribute("aria-hidden", "true")
})

test("card controls change the variant and drop the media and footer", async () => {
  const user = userEvent.setup()
  render(<Demo id="core-cards" />)
  await user.click(example("Sticker"))
  const card = screen.getByRole("heading", { name: "Selected", level: 4 }).closest('[data-slot="card"]')
  expect(card).toHaveAttribute("data-variant", "sticker")
  expect(card?.querySelector('[data-slot="card-media"]')).toBeNull()
  expect(card?.querySelector('[data-slot="card-footer"]')).toBeNull()
})

test("vitals are 10px HUD bars with a named value, segmented for health", async () => {
  const user = userEvent.setup()
  render(<Demo id="core-feedback" />)
  const health = screen.getByRole("meter", { name: "Health" })
  expect(health).toHaveAttribute("aria-valuenow", "80")
  expect(health).toHaveAttribute("data-tone", "health")
  expect(health).toHaveAttribute("data-segmented")
  await user.click(example("Stamina"))
  const stamina = screen.getByRole("meter", { name: "Stamina" })
  expect(stamina).toHaveAttribute("data-tone", "stamina")
  expect(stamina).not.toHaveAttribute("data-segmented")
  await user.click(example("Install"))
  const install = screen.getByRole("progressbar", { name: "Install" })
  expect(install).toHaveAttribute("aria-valuenow", "41")
  expect(install.querySelector('[data-slot="progress-value"]')).toHaveTextContent("41%")
})

test("an idle vital dims, and brightens for three seconds when its value changes", () => {
  vi.useFakeTimers()
  try {
    const { rerender } = render(<Progress aria-label="Health" value={50} dimWhenIdle />)
    const bar = screen.getByRole("progressbar", { name: "Health" })
    expect(bar).not.toHaveAttribute("data-idle")
    act(() => vi.advanceTimersByTime(3000))
    expect(bar).toHaveAttribute("data-idle")
    rerender(<Progress aria-label="Health" value={40} dimWhenIdle />)
    expect(bar).not.toHaveAttribute("data-idle")
    act(() => vi.advanceTimersByTime(3000))
    expect(bar).toHaveAttribute("data-idle")
  } finally {
    vi.useRealTimers()
  }
})

test("the calendar switches to several days, and the scroll area takes its row count from the panel", async () => {
  const user = userEvent.setup()
  render(<Demo id="core-data" />)
  expect(screen.getByRole("grid")).toBeInTheDocument()
  await user.click(example("Long list"))
  const log = screen.getByRole("region", { name: "Message log" })
  expect(within(log).getAllByRole("listitem")).toHaveLength(30)
  expect(screen.queryByRole("grid")).toBeNull()
})

test("vice text renders the Text control in the wordmark style at the Size control's size, outlined by its own filter", async () => {
  const user = userEvent.setup()
  render(<Demo id="core-vice-text" />)
  const text = document.querySelector('[data-slot="vice-text"]') as HTMLElement
  expect(text).toHaveTextContent("Jason")
  expect(text.style.fontSize).toContain("120px")
  const input = screen.getByRole("textbox", { name: "Text" })
  await user.clear(input)
  await user.type(input, "Leonida")
  expect(text).toHaveTextContent("Leonida")
  const filter = text.style.getPropertyValue("--vice-edge").match(/#([^)]+)/)?.[1]
  expect(filter && document.getElementById(filter)?.tagName.toLowerCase()).toBe("filter")
  await user.clear(input)
  expect(text).toHaveTextContent("Your name")
  await user.click(example("Vice City"))
  expect(text).toHaveTextContent("Vice City")
  expect(text.style.fontSize).toContain("96px")
  expect(screen.getByRole("slider", { name: "Size" })).toHaveValue("96")
})
