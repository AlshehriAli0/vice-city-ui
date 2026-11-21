import { act, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { expect, test, vi } from "vitest";

import { ViceText } from "../src/ui/vice-text";

const renderHeading = ({ children, ...props }: ComponentProps<"h2">) => <h2 {...props}>{children}</h2>;

test("the outline follows the rendered heading's font size and cleans up its observer", () => {
  const callbacks = new Map<Element, () => void>();
  const disconnect = vi.fn();

  class TestResizeObserver {
    readonly callback: () => void;

    constructor(callback: () => void) {
      this.callback = callback;
    }

    observe(target: Element) {
      callbacks.set(target, this.callback);
    }

    disconnect() {
      disconnect();
    }
  }

  vi.stubGlobal("ResizeObserver", TestResizeObserver);

  try {
    const { rerender, unmount } = render(
      <ViceText render={renderHeading} style={{ fontSize: "80px" }}>
        City guide
      </ViceText>
    );
    const heading = screen.getByRole("heading", { name: "City guide" });
    const edge = heading.querySelector('[result="edgeShape"]');
    const resize = callbacks.get(heading);

    expect(resize).toBeDefined();
    expect(Number(edge?.getAttribute("radius"))).toBeCloseTo(4.48);

    rerender(
      <ViceText render={renderHeading} style={{ fontSize: "100px" }}>
        City guide
      </ViceText>
    );
    act(() => resize?.());

    expect(Number(edge?.getAttribute("radius"))).toBeCloseTo(5.6);

    unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  } finally {
    vi.unstubAllGlobals();
  }
});
