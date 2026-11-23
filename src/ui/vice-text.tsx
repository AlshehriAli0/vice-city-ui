import { renderElement, type PartProps } from "@ui-sdk/react/primitive";
import { useId, useState, type ReactNode } from "react";

import type { CssVariables } from "./css-variables";
import { merge } from "./cx";

import "./vice-text.css";

type ViceTextProps = Omit<PartProps<"span">, "children"> & { children?: ReactNode };

const edgesFor = (size: number) => ({
  key: Math.max(0.8, size * 0.019),
  band: Math.max(1.5, size * 0.0375),
  edge: Math.max(2.4, size * 0.056),
});

const ViceText = ({ render, className, children, style, ...props }: ViceTextProps) => {
  const id = `vice-edge-${useId().replace(/[^a-z0-9]/gi, "")}`;
  const filterStyle: CssVariables = {
    ...(typeof style === "function" ? style({}) : style),
    "--vice-edge": `url(#${id})`,
  };

  return renderElement(
    "span",
    {
      ...props,
      className: merge("vc-vice-text", className),
      "data-slot": "vice-text",
      style: filterStyle,
      children: (
        <>
          <span data-slot="vice-text-fill">{children}</span>
          <ViceTextOutline id={id} />
        </>
      ),
    },
    render
  );
};

const ViceTextOutline = ({ id }: { id: string }) => {
  const [size, setSize] = useState(48);
  const { key, band, edge } = edgesFor(size);

  const measureFontSize = (element: SVGSVGElement | null): (() => void) | undefined => {
    const el = element?.closest('[data-slot="vice-text"]');
    if (!el) return undefined;

    const read = () => {
      const fontSize = Number.parseFloat(getComputedStyle(el).fontSize);
      setSize(fontSize > 0 ? fontSize : 48);
    };

    read();
    if (typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver(read);
    observer.observe(el);

    return () => observer.disconnect();
  };

  return (
    <svg ref={measureFontSize} data-slot="vice-text-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <filter id={id} x="-10%" y="-40%" width="120%" height="180%" colorInterpolationFilters="sRGB">
        <feMorphology in="SourceAlpha" operator="dilate" radius={edge} result="edgeShape" />
        <feFlood floodColor="#1f002d" />
        <feComposite in2="edgeShape" operator="in" result="edge" />
        <feMorphology in="SourceGraphic" operator="dilate" radius={band} result="spread" />
        <feColorMatrix in="spread" type="matrix" values="0.46 0 0.12 0 0  0 0.08 0 0 0  0.26 0 0.5 0 0  0 0 0 1 0" />
        <feGaussianBlur stdDeviation={band * 0.25} />
        <feComposite in2="edgeShape" operator="in" result="band" />
        <feMorphology in="SourceAlpha" operator="dilate" radius={key} result="keyShape" />
        <feFlood floodColor="#fff" />
        <feComposite in2="keyShape" operator="in" result="keyline" />
        <feMerge>
          <feMergeNode in="edge" />
          <feMergeNode in="band" />
          <feMergeNode in="keyline" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </svg>
  );
};

export { ViceText };
export type { ViceTextProps };
