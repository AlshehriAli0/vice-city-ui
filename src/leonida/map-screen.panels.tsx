import { Radio, RadioGroup } from "@ui-sdk/react/radio";
import { TabsPanel } from "@ui-sdk/react/tabs";
import { useState, type ReactElement } from "react";

import { cssVariables } from "../ui/css-variables";
import { FormattedText } from "./formatted-text";
import { PistolGlyph } from "./map-screen.data";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "dialogue", label: "Dialogue" },
  { value: "help", label: "Help Text" },
  { value: "objective", label: "Objective Text" },
];

const LOG = [
  { id: "l1", type: "objective", text: "Go to the *marker*." },
  { id: "l2", type: "dialogue", text: "Character: Placeholder line of dialogue." },
  { id: "l3", type: "help", text: "Hold the stick to *sprint*." },
  { id: "l4", type: "dialogue", text: "Character: Another placeholder line." },
  { id: "l5", type: "objective", text: "Lose the *cops*." },
  { id: "l6", type: "help", text: "Changing your outfit lowers *heat*." },
];

const TILES = [
  { value: "stats", label: "Stats", image: "/vc/art-vice-city.jpg" },
  { value: "vehicles", label: "Vehicles", image: "/vc/ue-vapid-stanier.jpg" },
  { value: "weapons", label: "Weapons" },
  { value: "animals", label: "Animals", image: "/vc/art-port-gellhorn.jpg" },
];

const STATS = [
  ["Time played", "12h 40m"],
  ["Distance travelled", "84.2 mi"],
  ["Cash earned", "$12,400"],
  ["Vehicles stolen", "23"],
  ["Times wanted", "17"],
  ["Photos taken", "41"],
];

function BriefPanel(): ReactElement {
  const [filter, setFilter] = useState("all");
  return (
    <TabsPanel value="brief" className="ld-map__panel ld-map__panel--plum">
      <RadioGroup
        className="ld-map__filters"
        aria-label="Brief filter"
        value={filter}
        onValueChange={next => next && setFilter(next)}
      >
        {FILTERS.map(item => (
          <label key={item.value} className="ld-map__filter" data-active={item.value === filter || undefined}>
            <Radio value={item.value} className="ld-map__filter-radio" />
            {item.label}
          </label>
        ))}
      </RadioGroup>
      <ul className="ld-map__log">
        {LOG.filter(entry => filter === "all" || entry.type === filter).map(entry => (
          <li key={entry.id}>
            <FormattedText text={entry.text} />
          </li>
        ))}
      </ul>
    </TabsPanel>
  );
}

function ProgressPanel(): ReactElement {
  const [tile, setTile] = useState("stats");
  const tileAt = TILES.findIndex(item => item.value === tile);
  return (
    <TabsPanel value="progress" className="ld-map__panel ld-map__panel--plum">
      <RadioGroup
        className="ld-map__tiles"
        aria-label="Progress"
        value={tile}
        onValueChange={next => next && setTile(next)}
      >
        <div className="ld-map__strip" style={cssVariables({ "--at": Math.max(0, tileAt - 2) })}>
          {TILES.map(item => (
            <Radio key={item.value} value={item.value} className="ld-map__tile" aria-label={item.label}>
              {item.image ? <img src={item.image} alt="" /> : <PistolGlyph />}
              <span>{item.label}</span>
            </Radio>
          ))}
        </div>
      </RadioGroup>
      <p className="ld-map__count" aria-hidden="true">
        <b>{tileAt + 1}</b> <i>/</i> {TILES.length}
      </p>
    </TabsPanel>
  );
}

function CharacterPanel(): ReactElement {
  return (
    <TabsPanel value="characters" className="ld-map__panel ld-map__panel--plum">
      <div className="ld-map__people" aria-hidden="true">
        <img src="/vc/art-jason.jpg" alt="" />
      </div>
      <table className="ld-map__stats">
        <caption>Stats</caption>
        <tbody>
          {STATS.map(([label, value]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TabsPanel>
  );
}

export { BriefPanel, CharacterPanel, ProgressPanel };
