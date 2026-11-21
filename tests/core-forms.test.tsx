import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { checkDirection, checkPattern, checkServer, mount } from "@ui-sdk/core/testing";
import { createAgent } from "@ui-sdk/react/agent";
import { Suspense, useState } from "react";
import { describe, expect, test } from "vitest";

import { coreForms } from "../src/gallery/core-forms";
import { PlaygroundView } from "../src/site/playground";
import { staticPlayground } from "../src/site/playground-state";
import { Calendar } from "../src/ui/calendar";
import { Cycle, CycleCount, CycleNext, CyclePrevious, CycleValue } from "../src/ui/cycle";
import { cycle } from "../src/ui/cycle.primitive";
import {
  Checkbox,
  CheckboxGroup,
  CheckboxIndicator,
  CheckboxLabel,
  Field,
  FieldLabel,
  Slider,
  Switch,
} from "../src/ui/forms";

const agent = createAgent();

const tick = () => act(() => new Promise(resolve => setTimeout(resolve, 0)));

function demoOf(id: string) {
  const demo = coreForms.find(item => item.id === id);
  if (!demo) throw new Error(`No demo ${id}`);
  return demo;
}

function Demo({ id }: { id: string }) {
  const demo = demoOf(id);
  return demo.render(staticPlayground(demo));
}

const renderPlayground = (id: string) => render(<PlaygroundView demo={demoOf(id)} />);
const example = (label: string) =>
  userEvent
    .setup()
    .click(within(screen.getByRole("radiogroup", { name: "Examples" })).getByRole("radio", { name: label }));

function All() {
  return (
    <>
      {coreForms.map(demo => (
        <section key={demo.id}>
          <Suspense>{demo.render(staticPlayground(demo))}</Suspense>
        </section>
      ))}
    </>
  );
}

const cycleRow = (label: string) => screen.getByRole("radiogroup", { name: label });

describe("agents", () => {
  test("find every core form control by name and change them", async () => {
    render(<All />);
    await screen.findByRole("combobox", { name: "Destination" });
    await tick();
    const entries = agent.snapshot().filter(entry => !entry.offPage && entry.component !== "more");
    for (const entry of entries) expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy();
    const labels = entries.map(entry => entry.label);
    for (const label of [
      "Display name",
      "Radio station",
      "Destination",
      "Share usage data",
      "Text size",
      "Subtitles",
      "Music Volume",
      "Look",
      "Field of view",
      "Settings tab",
    ]) {
      expect(labels, `${label} is missing from the snapshot`).toContain(label);
    }

    const look = entries.find(entry => entry.label === "Look")!;
    expect(look.component).toBe("cycle");
    expect(look.actions).toEqual(expect.arrayContaining(["setValue", "next", "previous"]));

    const result = await agent.act({
      steps: [
        { ref: "Look", action: "setValue", args: ["Inverted Y"] },
        { ref: "Look", action: "next" },
        { ref: "Radio station", action: "setValue", args: ["Cocoteo FM"] },
        { ref: "Text size", action: "setValue", args: ["Large"] },
        { ref: "Subtitles", action: "setChecked", args: [false] },
        { ref: "Share usage data", action: "setChecked", args: [false] },
        { ref: "Display name", action: "setValue", args: ["Jason"] },
      ],
    });
    expect(result.ok, result.error?.message).toBe(true);
    expect(within(cycleRow("Look")).getByRole("radio", { checked: true })).toHaveTextContent("Inverted X & Y");
    expect(screen.getByRole("combobox", { name: "Radio station" })).toHaveTextContent("Cocoteo FM");
    expect(
      within(screen.getByRole("radiogroup", { name: "Text size" })).getByRole("radio", { name: "Large" })
    ).toBeChecked();
    expect(screen.getByRole("switch", { name: "Subtitles" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Share usage data" })).not.toBeChecked();
    expect(screen.getByLabelText<HTMLInputElement>("Display name").value).toBe("Jason");

    const refused = await agent.act({ steps: [{ ref: "Look", action: "setValue", args: ["Upside down"] }] });
    expect(refused.ok).toBe(false);
  });
});

describe("cycle", () => {
  test("chevrons wrap around and the count follows", async () => {
    const user = userEvent.setup();
    render(<Demo id="core-cycle" />);
    await tick();
    const look = cycleRow("Look");
    expect(look.querySelector("[data-slot=cycle-count]")).toHaveTextContent("1/4");
    await user.click(look.querySelector<HTMLElement>("[data-slot=cycle-previous]")!);
    expect(look.querySelector("[data-slot=cycle-count]")).toHaveTextContent("4/4");
    expect(within(look).getByRole("radio", { name: "Inverted X & Y" })).toBeChecked();
    await user.click(look.querySelector<HTMLElement>("[data-slot=cycle-next]")!);
    expect(within(look).getByRole("radio", { name: "Default" })).toBeChecked();
    expect(look.querySelector("[data-slot=cycle-count]")).toHaveTextContent("1/4");
  });

  test("arrow keys step the value, wrap, and keep one tab stop", async () => {
    const user = userEvent.setup();
    render(<Demo id="core-cycle" />);
    await tick();
    const look = cycleRow("Look");
    expect(
      within(look)
        .getAllByRole("radio")
        .filter(radio => radio.tabIndex === 0)
    ).toHaveLength(1);
    within(look).getByRole("radio", { name: "Default" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(within(look).getByRole("radio", { name: "Inverted X" })).toBeChecked();
    expect(within(look).getByRole("radio", { name: "Inverted X" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(within(look).getByRole("radio", { name: "Inverted X & Y" })).toBeChecked();
    expect(look.querySelector("[data-slot=cycle-previous]")).toHaveAttribute("aria-hidden", "true");
  });

  test("reports each change with its reason, and can be controlled", async () => {
    const user = userEvent.setup();
    const reasons: string[] = [];
    function Controlled() {
      const [value, setValue] = useState("b");
      return (
        <Field>
          <FieldLabel>Mode</FieldLabel>
          <Cycle
            value={value}
            name="mode"
            onValueChange={(next, details) => {
              reasons.push(details.reason);
              setValue(next);
            }}
          >
            <CycleValue value="a">A</CycleValue>
            <CycleValue value="b">B</CycleValue>
            <CycleCount />
            <CyclePrevious />
            <CycleNext />
          </Cycle>
        </Field>
      );
    }
    const { container } = render(<Controlled />);
    await tick();
    await user.click(container.querySelector<HTMLElement>("[data-slot=cycle-next]")!);
    screen.getByRole("radio", { name: "A" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(reasons).toEqual(["next-press", "list-navigation"]);
    expect(screen.getByRole("radio", { name: "B" })).toBeChecked();
    expect(container.querySelector<HTMLInputElement>("input[name=mode]")?.value).toBe("b");
  });

  test("a disabled field keeps its count and ignores the chevrons", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Field disabled>
        <FieldLabel>Mode</FieldLabel>
        <Cycle defaultValue="a">
          <CycleValue value="a">A</CycleValue>
          <CycleValue value="b">B</CycleValue>
          <CycleCount />
          <CyclePrevious />
          <CycleNext />
        </Cycle>
      </Field>
    );
    await tick();
    const mode = cycleRow("Mode");
    expect(mode).toHaveAttribute("aria-disabled", "true");
    expect(container.querySelector("[data-slot=cycle-count]")).toHaveTextContent("1/2");
    await user.click(container.querySelector<HTMLElement>("[data-slot=cycle-next]")!);
    expect(screen.getByRole("radio", { name: "A" })).toBeChecked();
  });

  test("is a radio group by the pattern", async () => {
    render(<Demo id="core-cycle" />);
    await tick();
    await checkPattern(cycleRow("Look"), "radio-group");
  });

  const markup = `<root aria-label="Mode"><value value="a">A</value><value value="b">B</value><value value="c">C</value><previous></previous><next></next><count></count></root>`;

  test("the primitive moves with keys and the chevrons", async () => {
    const view = mount(cycle, { defaultValue: "a" }, markup);
    try {
      await view.keys("Tab", "ArrowRight");
      expect(view.state.value).toBe("b");
      expect(view.changes.at(-1)).toMatchObject({ key: "value", reason: "list-navigation", source: "keyboard" });
      await view.keys("End");
      expect(view.state.value).toBe("c");
      await view.click(view.part("next")!);
      expect(view.state.value).toBe("a");
      expect(view.changes.at(-1)).toMatchObject({ reason: "next-press" });
      view.api.previous();
      expect(view.state.value).toBe("c");
    } finally {
      view.unmount();
    }
  });

  test("the primitive renders on the server and in both directions", async () => {
    checkServer(cycle, { defaultValue: "a" }, markup);
    await checkDirection(cycle, { defaultValue: "a" }, markup);
  });

  test("a disabled cycle ignores the chevrons", async () => {
    const view = mount(cycle, { defaultValue: "a", disabled: true }, markup);
    try {
      await view.click(view.part("next")!);
      expect(view.state.value).toBe("a");
      expect(view.root).toHaveAttribute("aria-disabled", "true");
    } finally {
      view.unmount();
    }
  });
});

describe("checkbox", () => {
  test("Space toggles the switch and the checkbox", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Demo id="core-switch" />
        <Demo id="core-checkbox" />
      </>
    );
    const toggles = [...screen.getAllByRole("switch"), ...screen.getAllByRole("checkbox")];
    expect(toggles).toHaveLength(2);
    const checkToggle = async (toggle: HTMLElement) => {
      const before = toggle.getAttribute("aria-checked");
      toggle.focus();
      await user.keyboard(" ");
      expect(toggle.getAttribute("aria-checked"), toggle.textContent).not.toBe(before);
    };
    await checkToggle(toggles[0]);
    await checkToggle(toggles[1]);
  });

  test("a parent checkbox goes mixed, then checks every item", async () => {
    const user = userEvent.setup();
    const terms = ["Terms of service", "Privacy policy", "End user licence"];
    function Legal() {
      const [accepted, setAccepted] = useState([terms[0]]);
      return (
        <CheckboxGroup aria-label="Legal" value={accepted} onValueChange={setAccepted} allValues={terms}>
          <CheckboxLabel>
            <Checkbox parent>
              <CheckboxIndicator />
            </Checkbox>
            Accept all
          </CheckboxLabel>
          {terms.map(term => (
            <CheckboxLabel key={term}>
              <Checkbox value={term}>
                <CheckboxIndicator />
              </Checkbox>
              {term}
            </CheckboxLabel>
          ))}
        </CheckboxGroup>
      );
    }
    render(<Legal />);
    await tick();
    const parent = screen.getByRole("checkbox", { name: "Accept all" });
    expect(parent).toHaveAttribute("aria-checked", "mixed");
    await user.click(parent);
    for (const name of terms) expect(screen.getByRole("checkbox", { name })).toBeChecked();
    expect(parent).toHaveAttribute("aria-checked", "true");
    await user.click(screen.getByText("Privacy policy"));
    expect(parent).toHaveAttribute("aria-checked", "mixed");
  });

  test("a field names and describes its checkbox, and the examples set its state", async () => {
    renderPlayground("core-checkbox");
    const share = screen.getByRole("checkbox", { name: "Share usage data" });
    expect(share).toHaveAccessibleDescription("Helps improve performance.");
    await example("Indeterminate");
    expect(screen.getByRole("checkbox", { name: "Accept all" })).toHaveAttribute("aria-checked", "mixed");
    await example("Disabled");
    expect(screen.getByRole("checkbox", { name: "Cross-progression" })).toBeDisabled();
  });
});

describe("radio group", () => {
  test("arrow keys move through the text size radios", async () => {
    const user = userEvent.setup();
    render(<Demo id="core-radio" />);
    const group = screen.getByRole("radiogroup", { name: "Text size" });
    within(group).getByRole("radio", { name: "Default" }).focus();
    await user.keyboard("{ArrowDown}");
    expect(within(group).getByRole("radio", { name: "Large" })).toBeChecked();
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(within(group).getByRole("radio", { name: "Small" })).toBeChecked();
  });

  test("an item's title names its radio and its description describes it", async () => {
    renderPlayground("core-radio");
    await tick();
    const sizes = () => screen.getByRole("radiogroup", { name: "Text size" });
    expect(within(sizes()).getByRole("radio", { name: "Large" })).toHaveAccessibleDescription(
      "Larger subtitles and menus."
    );
    await example("Labels only");
    expect(within(sizes()).getByRole("radio", { name: "Small" })).not.toHaveAttribute("aria-describedby");
  });
});

describe("switch", () => {
  test("a press on the row's label flips its switch, and the panel follows", async () => {
    const user = userEvent.setup();
    renderPlayground("core-switch");
    const subtitles = screen.getByRole("switch", { name: "Subtitles" });
    expect(subtitles).toBeChecked();
    await user.click(screen.getByText("Subtitles"));
    expect(subtitles).not.toBeChecked();
    expect(screen.getByRole("switch", { name: "Checked" })).not.toBeChecked();
    expect(
      within(screen.getByRole("radiogroup", { name: "Examples" })).getByRole("radio", { name: "Off" })
    ).toBeChecked();
    await example("Disabled");
    expect(screen.getByRole("switch", { name: "Photo Studio Grid" })).toBeDisabled();
  });

  test("the one-tag row still names its switch", async () => {
    const user = userEvent.setup();
    render(
      <Switch showState description="Shows street names on the map.">
        Street Names
      </Switch>
    );
    const street = screen.getByRole("switch", { name: "Street Names" });
    expect(street).toHaveAccessibleDescription("Shows street names on the map.");
    await user.click(screen.getByText("Street Names"));
    expect(street).toBeChecked();
  });
});

describe("compatible defaults", () => {
  test("a slider without parts renders a named thumb", () => {
    render(<Slider min={0} max={6} defaultValue={2} thumbLabels={["Heat level"]} />);
    expect(screen.getByRole("slider", { name: "Heat level" })).toHaveValue("2");
  });

  test("a calendar without parts marks days and reports a single date", async () => {
    const user = userEvent.setup();
    const picked: (string | null)[] = [];
    function Picker() {
      const [day, setDay] = useState<string | null>("2026-11-21");
      return (
        <Calendar
          headingLevel={4}
          value={day}
          onValueChange={next => {
            picked.push(next);
            setDay(next);
          }}
          defaultMonth="2026-11"
          today="2026-11-21"
          marked={["2026-11-19"]}
        />
      );
    }
    const { container } = render(<Picker />);
    expect(screen.getByRole("heading", { level: 4 })).toBeInTheDocument();
    expect(container.querySelector("[data-marked]")).toHaveTextContent("19");
    await user.click(screen.getByRole("gridcell", { name: /November 12, 2026/ }));
    expect(picked).toEqual(["2026-11-12"]);
  });
});

test("number input steps and the code reports when complete", async () => {
  const user = userEvent.setup();
  renderPlayground("core-entry");
  await user.click(screen.getByRole("button", { name: "Increase" }));
  expect(screen.getByLabelText<HTMLInputElement>("Field of view").value).toBe("75");
  await example("Code");
  const code = screen.getByLabelText("Verification code");
  code.focus();
  await user.keyboard("482913");
  expect(await screen.findByText("Code accepted.")).toBeInTheDocument();
});

describe("playground", () => {
  test("every demo has controls, defaults for each, examples and a usage snippet", () => {
    for (const demo of coreForms) {
      expect(demo.controls?.length, demo.id).toBeGreaterThan(0);
      for (const control of demo.controls!)
        expect(demo.defaults, `${demo.id} ${control.name}`).toHaveProperty(control.name);
      expect(demo.examples?.length, demo.id).toBeGreaterThanOrEqual(2);
      expect(demo.examples!.length, demo.id).toBeLessThanOrEqual(5);
      for (const preset of [{}, ...demo.examples!.map(item => item.values)]) {
        const code = demo.code!({ ...demo.defaults, ...preset });
        expect(code, demo.id).not.toMatch(/undefined|NaN|\[object/);
        expect(code.split("\n").length, demo.id).toBeLessThanOrEqual(24);
      }
    }
  });

  test("the panel drives the component's props", async () => {
    const user = userEvent.setup();
    renderPlayground("core-button");
    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).toHaveAttribute("data-variant", "primary");
    await example("Ghost");
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveAttribute("data-variant", "ghost");
    await user.click(screen.getByRole("switch", { name: "Disabled" }));
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  test("the stage writes back to the panel", async () => {
    const user = userEvent.setup();
    renderPlayground("core-radio");
    await tick();
    await user.click(
      within(screen.getByRole("radiogroup", { name: "Text size" })).getByRole("radio", { name: "Large" })
    );
    const value = screen.getAllByRole("radiogroup", { name: "Value" }).at(-1)!;
    expect(within(value).getByRole("radio", { name: "Large" })).toBeChecked();
    await user.click(within(value).getByRole("radio", { name: "Small" }));
    expect(
      within(screen.getByRole("radiogroup", { name: "Text size" })).getByRole("radio", { name: "Small" })
    ).toBeChecked();
  });
});
