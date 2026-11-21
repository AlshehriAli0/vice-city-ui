import { renderElement, type PartProps } from "@ui-sdk/react/primitive"
import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from "react"
import { merge } from "./cx"
import "./vice-text.css"

type ViceTextProps = Omit<PartProps<"span">, "children"> & { children?: ReactNode }

// Outline radii as a share of the font size, with floors so small text keeps a readable edge.
function edgesFor(size: number) {
  return { key: Math.max(0.8, size * 0.019), band: Math.max(1.5, size * 0.0375), edge: Math.max(2.4, size * 0.056) }
}

/* Any text in the wordmark style: the sunset fill with palms, a white keyline, then a purple band tinted from the
   fill that darkens outward. Strokes can't take a gradient, so the outline is grown from the text by a filter. */
function ViceText({ render, className, children, style, ...props }: ViceTextProps): ReactElement {
  const id = `vice-edge-${useId().replace(/[^a-z0-9]/gi, "")}`
  const ref = useRef<HTMLElement>(null)
  const [size, setSize] = useState(48)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const read = () => setSize(parseFloat(getComputedStyle(el).fontSize) || 48)
    read()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(read)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const { key, band, edge } = edgesFor(size)
  return renderElement(
    "span",
    {
      ...props,
      ref,
      className: merge("vc-vice-text", className),
      "data-slot": "vice-text",
      style: { ...style, "--vice-edge": `url(#${id})` } as CSSProperties,
      children: (
        <>
          <span data-slot="vice-text-fill">{children}</span>
          <svg data-slot="vice-text-defs" width="0" height="0" aria-hidden="true" focusable="false">
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
        </>
      ),
    },
    render,
  )
}

export { ViceText }
export type { ViceTextProps }
