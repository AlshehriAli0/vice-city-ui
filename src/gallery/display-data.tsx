import { Eye, Heart, Zap } from "lucide-react";
import type { ReactElement } from "react";

import { Calendar } from "../ui/calendar";
import { Meter, MeterIcon, MeterIndicator, MeterTrack } from "../ui/meter";
import { Progress, ProgressIcon, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue } from "../ui/progress";
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import { attrs } from "./display-options";
import { optionValue, options as opts } from "./options";
import type { Demo, Playground } from "./types";

const TONE_ICON = { health: Heart, stamina: Zap, focus: Eye };

const VITAL_TONES = opts(["health", "Health"], ["stamina", "Stamina"], ["focus", "Focus"]);

function VitalsDemo({ values: v }: Playground): ReactElement {
  if (v.component === "skeleton")
    return (
      <div className="cd-list">
        {[0, 1].map(row => (
          <div key={row} className="cd-line cd-skeleton" aria-hidden="true">
            <Skeleton shape="circle" />
            <span className="cd-skeleton__text">
              <Skeleton width="55%" />
              <Skeleton width="80%" />
            </span>
          </div>
        ))}
      </div>
    );
  const tone = optionValue(v.tone, VITAL_TONES) ?? "health";
  const Icon = TONE_ICON[tone];
  const vital = {
    value: Number(v.value),
    tone,
    segments: Number(v.segments) || undefined,
    dimWhenIdle: Boolean(v.dim),
  };
  const label = String(v.label).trim() || "Value";
  if (v.component === "progress")
    return (
      <div className="cd-list">
        <div className="cd-line cd-line--bar">
          <Progress {...vital}>
            <ProgressIcon>
              <Icon />
            </ProgressIcon>
            <ProgressLabel>{label}</ProgressLabel>
            <ProgressTrack>
              <ProgressIndicator />
            </ProgressTrack>
            <ProgressValue />
          </Progress>
        </div>
      </div>
    );
  return (
    <div className="cd-vitals">
      <div className="vc-vitals">
        <Meter aria-label={label} {...vital}>
          <MeterIcon>
            <Icon />
          </MeterIcon>
          <MeterTrack>
            <MeterIndicator />
          </MeterTrack>
        </Meter>
      </div>
    </div>
  );
}

function DataDemo({ values: v }: Playground): ReactElement {
  if (v.component === "scroll")
    return (
      <div className="cd-data">
        <ScrollArea className="cd-log-scroll">
          <ScrollAreaViewport role="region" aria-label="Message log">
            <ScrollAreaContent>
              <ol className="cd-log">
                {Array.from(
                  { length: Number(v.rows) },
                  (_, index) => `Message ${index + 1}. Placeholder text for a log line.`
                ).map(line => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </ScrollAreaContent>
          </ScrollAreaViewport>
          <ScrollAreaScrollbar orientation="vertical">
            <ScrollAreaThumb />
          </ScrollAreaScrollbar>
        </ScrollArea>
      </div>
    );
  const shared = {
    headingLevel: 4 as const,
    defaultMonth: "2026-11",
    today: "2026-11-21",
    marked: ["2026-11-19"],
    weekStartsOn: v.monday ? 1 : undefined,
    showOutsideDays: Boolean(v.outside),
    disabled: Boolean(v.disabled),
  };
  return (
    <div className="cd-data">
      {v.multiple ? (
        <Calendar key="multiple" mode="multiple" defaultValue={["2026-11-21", "2026-11-24"]} {...shared} />
      ) : (
        <Calendar key="single" defaultValue="2026-11-21" {...shared} />
      )}
    </div>
  );
}

function dataCode(v: Playground["values"]): string {
  if (v.component === "scroll")
    return `<ScrollArea>
  <ScrollAreaViewport role="region" aria-label="Message log">
    <ScrollAreaContent>
      <ol>{/* ${v.rows} rows */}</ol>
    </ScrollAreaContent>
  </ScrollAreaViewport>
  <ScrollAreaScrollbar orientation="vertical">
    <ScrollAreaThumb />
  </ScrollAreaScrollbar>
</ScrollArea>`;

  const day = v.multiple ? "days" : "day";
  const setter = v.multiple ? "setDays" : "setDay";
  return `<Calendar${attrs(["mode", v.multiple ? "multiple" : undefined])}
  value={${day}}
  onValueChange={${setter}}
  marked={["2026-11-19"]}${v.monday ? "\n  weekStartsOn={1}" : ""}${v.outside ? "" : "\n  showOutsideDays={false}"}${v.disabled ? "\n  disabled" : ""}
/>`;
}

const displayDataDemos: Demo[] = [
  {
    id: "core-feedback",
    file: "ui/progress",
    name: "Progress & Meter",
    sdk: "Progress · Meter",
    caption:
      "GTA VI's vitals: 10px square bars, segmented health, #F8B8D0, #60E0E0 and #A088F8, dimming to 40% when idle. Change the value and the bar brightens for about three seconds.",
    controls: [
      {
        type: "select",
        name: "component",
        label: "Component",
        options: opts(["meter", "Meter"], ["progress", "Progress"], ["skeleton", "Skeleton"]),
      },
      { type: "number", name: "value", label: "Value", min: 0, max: 100 },
      { type: "select", name: "tone", label: "Tone", options: VITAL_TONES },
      { type: "number", name: "segments", label: "Segments", min: 0, max: 5 },
      { type: "boolean", name: "dim", label: "Dim when idle" },
      { type: "text", name: "label", label: "Label" },
    ],
    defaults: { component: "meter", value: 80, tone: "health", segments: 2, dim: true, label: "Health" },
    examples: [
      { label: "Health", values: {} },
      { label: "Stamina", values: { tone: "stamina", value: 90, segments: 0, label: "Stamina" } },
      { label: "Install", values: { component: "progress", value: 41, segments: 0, dim: false, label: "Install" } },
      { label: "Loading", values: { component: "skeleton" } },
    ],
    code: v => {
      if (v.component === "skeleton")
        return `<Skeleton shape="circle" />\n<Skeleton width="55%" />\n<Skeleton width="80%" />`;
      const props = `value={${v.value}}${attrs(["tone", v.tone, "health"], ["segments", Number(v.segments) || undefined], ["dimWhenIdle", v.dim])}`;
      if (v.component === "progress")
        return `<Progress ${props}>
  <ProgressIcon><Heart /></ProgressIcon>
  <ProgressLabel>${v.label}</ProgressLabel>
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
  <ProgressValue />
</Progress>`;
      return `<Meter aria-label="${v.label}" ${props}>
  <MeterIcon><Heart /></MeterIcon>
  <MeterTrack>
    <MeterIndicator />
  </MeterTrack>
</Meter>`;
    },
    render: playground => <VitalsDemo {...playground} />,
  },
  {
    id: "core-data",
    file: "ui/calendar",
    keys: [
      ["Arrows", "Move between days"],
      ["Page Up / Page Down", "Previous or next month"],
      ["Enter", "Pick a day"],
      ["↑ ↓", "Scroll the list"],
    ],
    name: "Calendar & Scroll Area",
    sdk: "Calendar · Scroll Area",
    caption: "A month grid on the slate panel, and a list whose edges fade only where it scrolls.",
    wide: true,
    controls: [
      {
        type: "select",
        name: "component",
        label: "Component",
        options: opts(["calendar", "Calendar"], ["scroll", "Scroll area"]),
      },
      { type: "boolean", name: "multiple", label: "Several days" },
      { type: "boolean", name: "monday", label: "Weeks start Monday" },
      { type: "boolean", name: "outside", label: "Outside days" },
      { type: "boolean", name: "disabled", label: "Disabled" },
      { type: "number", name: "rows", label: "List rows", min: 3, max: 30 },
    ],
    defaults: { component: "calendar", multiple: false, monday: false, outside: true, disabled: false, rows: 9 },
    examples: [
      { label: "Calendar", values: {} },
      { label: "Several days", values: { multiple: true, monday: true } },
      { label: "Scroll area", values: { component: "scroll" } },
      { label: "Long list", values: { component: "scroll", rows: 30 } },
    ],
    code: dataCode,
    render: playground => <DataDemo {...playground} />,
  },
];

export { displayDataDemos };
