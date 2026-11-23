import { PLACES, Postcard, PostcardTab, PostcardTabs, PostcardTabsList } from "../../leonida/postcards/postcard-tabs";

import "../shared/overlays.css";
import type { Demo } from "../demo";

const official: Demo[] = [
  {
    id: "postcard-tabs",
    source: {
      "postcard-tabs.tsx": () => import("../../leonida/postcards/postcard-tabs.tsx?raw"),
      "postcard-tabs.css": () => import("../../leonida/postcards/postcard-tabs.css?raw"),
    },
    blurb: "Six regions, six postcards. Greetings from Leonida.",
    name: "Postcards",
    sdk: "Tabs",
    caption: 'The official "Visit Leonida" postcards, one per region. Arrow keys flip through them.',
    wide: true,
    keys: [
      ["← →", "Previous or next region"],
      ["Home / End", "First or last region"],
      ["Tab", "Into the postcard"],
    ],
    controls: [
      {
        type: "select",
        name: "place",
        label: "Region",
        options: PLACES.map(place => ({ value: place.value, label: place.name })),
      },
    ],
    defaults: { place: "vice-city" },
    examples: [
      { label: "Vice City", values: {} },
      { label: "Grassrivers", values: { place: "grassrivers" } },
      { label: "Mount Kalaga", values: { place: "mount-kalaga" } },
    ],
    code: v => `<PostcardTabs defaultValue="${v.place}">
  <PostcardTabsList aria-label="Locations">
    {PLACES.map((place) => (
      <PostcardTab key={place.value} value={place.value}>{place.name}</PostcardTab>
    ))}
  </PostcardTabsList>
  {PLACES.map((place) => <Postcard key={place.value} place={place} />)}
</PostcardTabs>`,
    render: ({ values, set }) => (
      <PostcardTabs value={String(values.place)} onValueChange={next => set("place", String(next))}>
        <PostcardTabsList aria-label="Locations">
          {PLACES.map(place => (
            <PostcardTab key={place.value} value={place.value}>
              {place.name}
            </PostcardTab>
          ))}
        </PostcardTabsList>
        {PLACES.map(place => (
          <Postcard key={place.value} place={place} />
        ))}
      </PostcardTabs>
    ),
  },
];

export { official };
