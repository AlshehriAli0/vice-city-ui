import { Radio, RadioGroup } from "@ui-sdk/react/radio";
import { TabsList, TabsTab } from "@ui-sdk/react/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactElement } from "react";

import { cssVariables } from "../ui/css-variables";
import { CheckDisc } from "./mod-shop.parts";
import { FAMILIES, type Family } from "./mod-shop.swatches";

function SwatchStrip({
  family,
  value,
  onValueChange,
  appliedSwatch,
  counted,
  onPaintStep,
  onBuy,
  focusOnMount,
}: {
  family: Family;
  value: string;
  onValueChange: (value: string) => void;
  appliedSwatch: string | null;
  counted: boolean;
  onPaintStep: () => void;
  onBuy: () => void;
  focusOnMount: boolean;
}): ReactElement {
  const list = family.swatches;
  const index = Math.max(
    0,
    list.findIndex(swatch => swatch.value === value)
  );
  const strip = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(0);
  useLayoutEffect(() => {
    if (focusOnMount) strip.current?.querySelector<HTMLElement>("[data-checked]")?.focus();
  }, [focusOnMount]);
  let first = start;
  if (index < first) first = index;
  else if (index > first + 5) first = index - 5;
  if (first !== start) setStart(first);

  const onKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") onBuy();
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    event.stopPropagation();
    onPaintStep();
  };

  return (
    <div
      ref={strip}
      className="ld-shop__strip"
      data-before={first > 0 || undefined}
      data-after={first + 6 < list.length || undefined}
      onKeyDownCapture={onKeyDownCapture}
      style={cssVariables({
        "--first": first,
        "--count": list.length,
        "--shift": first === 0 ? "0px" : `${3 - first * 120}px`,
      })}
    >
      {counted && (
        <p className="ld-shop__count" aria-hidden="true">
          {index + 1}
          <span> / {list.length}</span>
        </p>
      )}
      <ChevronLeft className="ld-shop__chevron" data-side="start" aria-hidden="true" />
      <div className="ld-shop__window">
        <RadioGroup
          className="ld-shop__swatches"
          aria-label="Swatches"
          value={list[index].value}
          onValueChange={next => next && onValueChange(next)}
        >
          {list.map((swatch, at) => (
            <Radio
              key={swatch.value}
              value={swatch.value}
              className="ld-shop__swatch"
              style={cssVariables({ "--swatch": swatch.color, "--i": Math.max(0, at - first) })}
            >
              <span className="ld-sr">{swatch.label}</span>
              {swatch.value === appliedSwatch && <CheckDisc />}
              <svg className="ld-shop__updown" viewBox="0 0 18 30" aria-hidden="true">
                <path d="M4 11 9 6l5 5M4 19l5 5 5-5" />
              </svg>
            </Radio>
          ))}
        </RadioGroup>
      </div>
      <ChevronRight className="ld-shop__chevron" data-side="end" aria-hidden="true" />
      {list.length > 6 && <span className="ld-shop__scroll" aria-hidden="true" />}
    </div>
  );
}

function FamilyTabs({ family }: { family: string }): ReactElement {
  const clip = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);
  useLayoutEffect(() => {
    const tab = clip.current?.querySelector<HTMLElement>(`[data-value="${family}"]`);
    if (!clip.current || !tab) return;
    setShift(Math.max(0, tab.offsetLeft + tab.offsetWidth - clip.current.clientWidth));
  }, [family]);
  return (
    <div ref={clip} className="ld-shop__tabclip" data-shifted={shift > 0 || undefined}>
      <TabsList
        className="ld-shop__tabs"
        aria-label="Paint families"
        style={cssVariables({ "--tabs-shift": `${-shift}px` })}
      >
        {FAMILIES.map(item => (
          <TabsTab key={item.value} value={item.value} className="ld-shop__tab" data-value={item.value}>
            {item.label}
          </TabsTab>
        ))}
      </TabsList>
    </div>
  );
}

export { FamilyTabs, SwatchStrip };
