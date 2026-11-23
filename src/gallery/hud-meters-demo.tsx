import { HudMinimap } from "../leonida/hud-minimap";
import { HudStage } from "../leonida/hud-stage";
import { useAnnouncement } from "../leonida/use-announcement";
import { WantedEvidence, WantedEvidenceItem, WantedHud, WantedLevel } from "../leonida/wanted-level";
import { STATE_LABEL } from "../leonida/wanted-level.data";
import { FullHud } from "./full-hud";
import { EVIDENCE, EVIDENCE_CONTROLS, STATES, policeState, washOf } from "./hud-wanted";
import type { Demo, Playground, Value, Values } from "./types";

const WantedDemo = ({ values, set }: Playground) => {
  const heat = Number(values.heat);
  const state = policeState(values.police);
  const shown = heat > 0 && state !== "seen" ? EVIDENCE.filter(item => values[item]) : [];
  useAnnouncement(
    heat === 0 ? "Not wanted" : `${heat} ${heat === 1 ? "star" : "stars"}, ${STATE_LABEL[state].toLowerCase()}`
  );
  return (
    <div className="hud-demo">
      <HudStage label="Wanted level demo">
        <div data-hud="right">
          <WantedHud>
            <WantedLevel value={heat} onValueChange={next => set("heat", next)} state={state} />
            {shown.length > 0 && (
              <WantedEvidence>
                {shown.map(item => (
                  <WantedEvidenceItem key={item} value={item} />
                ))}
              </WantedEvidence>
            )}
          </WantedHud>
        </div>
        <div data-hud="map">
          <HudMinimap heading={160} wash={washOf(heat, state)} />
        </div>
      </HudStage>
    </div>
  );
};

const updateHudControl = (values: Values, name: string, value: Value): Values => {
  const next = { ...values, [name]: value };
  if (name === "driving" && value) next.sprinting = false;
  if (name === "sprinting" && value) next.driving = false;
  return next;
};

const hudMetersDemos: Demo[] = [
  {
    id: "wanted-level",
    file: "leonida/wanted-level",
    name: "Wanted Level",
    sdk: "Rating",
    caption:
      "Six star slots that fill from the right. White with a bloom while seen, grey when they lose you, a slow pulse while they search, dark red with evidence discs once you escape.",
    wide: true,
    frame: false,
    keys: [
      ["← →", "Raise or lower the wanted level (it fills from the right)"],
      ["Home / End", "Go to one star or six"],
      ["Space", "On the current level, clear it"],
    ],
    controls: [
      { type: "number", name: "heat", label: "Stars", min: 0, max: 6 },
      { type: "select", name: "police", label: "Police", options: STATES },
      ...EVIDENCE_CONTROLS,
    ],
    defaults: { heat: 2, police: "seen", clothing: true, face: true, vehicle: false, cctv: false, weapon: false },
    examples: [
      { label: "Seen", values: {} },
      { label: "Lost sight", values: { police: "lost" } },
      { label: "Searching", values: { heat: 3, police: "search" } },
      { label: "Escaped", values: { heat: 3, police: "escaped", vehicle: true } },
    ],
    code: v => {
      const items = Number(v.heat) > 0 && v.police !== "seen" ? EVIDENCE.filter(item => v[item]) : [];
      const evidence = items.length
        ? `\n  <WantedEvidence>\n${items.map(item => `    <WantedEvidenceItem value="${item}" />`).join("\n")}\n  </WantedEvidence>`
        : "";
      return `<WantedHud>\n  <WantedLevel value={${v.heat}} onValueChange={setLevel} state="${v.police}" />${evidence}\n</WantedHud>`;
    },
    render: playground => <WantedDemo {...playground} />,
  },
  {
    id: "hud-meters",
    file: "leonida/hud-meters",
    frame: false,
    name: "HUD",
    sdk: "Meter",
    wide: true,
    caption:
      "The full 1080p HUD: vitals, help box, stars, cash and ammo, the right-edge feed, the tilted minimap with its turn card, subtitles and the objective. Sprinting hides everything but stamina.",
    controls: [
      { type: "number", name: "heat", label: "Wanted level", min: 0, max: 6 },
      { type: "select", name: "police", label: "Police", options: STATES },
      { type: "boolean", name: "driving", label: "Driving" },
      { type: "boolean", name: "sprinting", label: "Sprinting" },
    ],
    defaults: { heat: 2, police: "seen", driving: true, sprinting: false },
    update: updateHudControl,
    actions: [
      { name: "damage", label: "Take damage" },
      { name: "heal", label: "Heal" },
      { name: "feed", label: "New feed line" },
    ],
    examples: [
      { label: "Driving", values: {} },
      { label: "Calm", values: { heat: 0, driving: false } },
      { label: "Searching", values: { heat: 3, police: "search", driving: false } },
      { label: "Sprinting", values: { heat: 0, driving: false, sprinting: true } },
    ],
    code: v => `<HudStage>
  <HudVitals health={78} stamina={100} focus={100}${v.sprinting ? ' show="stamina"' : ""} />
${Number(v.heat) > 0 ? `  <WantedHud>\n    <WantedLevel aria-label="Police heat" value={${v.heat}} state="${v.police}" readOnly />\n  </WantedHud>\n` : ""}  <HudCash wallet={407} bank={2480} />
  <HudAmmo clip={12} reserve={48} />
  <HudMinimap heading={${v.driving ? 0 : 160}} route="${v.driving ? "mission" : "none"}" />
</HudStage>`,
    render: playground => <FullHud {...playground} />,
  },
];

export { hudMetersDemos };
