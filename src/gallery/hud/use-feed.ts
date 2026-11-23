import { useState } from "react";

import type { FeedKind, FeedLine } from "../../leonida/hud/hud-feed";

const FEED = [
  { kind: "crime", text: "Crime reported" },
  { kind: "pickup", text: "Painkillers" },
  { kind: "map", text: "Map updated" },
] satisfies { kind: FeedKind; text: string }[];

const useFeed = (first: FeedKind) => {
  const [feed, setFeed] = useState(() => {
    const index = FEED.findIndex(item => item.kind === first);
    const lines: FeedLine[] = index < 0 ? [] : [{ id: "start-0", ...FEED[index] }];
    return { lines, next: index + 1 };
  });

  return {
    lines: feed.lines,
    push: () =>
      setFeed(({ lines, next }) => {
        const item = FEED[next % FEED.length];
        return { lines: [...lines.slice(-2), { id: `${item.kind}-${next}`, ...item }], next: next + 1 };
      }),
    done: (id: string) => setFeed(state => ({ ...state, lines: state.lines.filter(line => line.id !== id) })),
  };
};

export { useFeed };
