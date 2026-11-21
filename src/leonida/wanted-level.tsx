import type { ChangeDetails } from "@ui-sdk/core";
import { Rating, RatingItem, type RatingValueChangeReason } from "@ui-sdk/react/rating";
import { CarFront, Cctv, UsersRound, type LucideIcon } from "lucide-react";
import { useState, type ComponentProps, type HTMLAttributes, type ReactElement } from "react";

import { cssVariables } from "../ui/css-variables";
import { cx, merge } from "../ui/cx";
import { GAME_ICON } from "./hud-icons";
import { EVIDENCE_LABEL, STATE_LABEL, type Evidence, type WantedState } from "./wanted-level.data";

import "./wanted-level.css";

const STAR = "M16 2.2l3.62 8.6 9.3.73-7.08 6.07 2.17 9.08L16 21.8l-8.01 4.88 2.17-9.08-7.08-6.07 9.3-.73z";

function StarGlyph({ className }: { className?: string }): ReactElement {
  return (
    <svg className={className} viewBox="2.9 1.6 26.2 26.2" aria-hidden="true">
      <path d={STAR} />
    </svg>
  );
}

function Hanger(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 6a2 2 0 1 1 2 2v2" />
      <path d="M12 10l-8.5 6.5h17z" />
    </svg>
  );
}

function Pistol(): ReactElement {
  return (
    <svg aria-hidden="true" viewBox="40 90 440 330" fill="currentColor">
      <path d={GAME_ICON.weapon} />
    </svg>
  );
}

function Head(): ReactElement {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <ellipse cx="12" cy="9" rx="5" ry="6.2" />
      <path d="M5.5 22c0-3.6 2.9-5.6 6.5-5.6s6.5 2 6.5 5.6z" />
    </svg>
  );
}

const FILLED: Partial<Record<Evidence, LucideIcon>> = { vehicle: CarFront, cctv: Cctv, witness: UsersRound };

const OUTLINED = { clothing: Hanger, face: Head, weapon: Pistol };

function EvidenceDisc({ item, className = "ld-evidence__disc" }: { item: Evidence; className?: string }): ReactElement {
  const FilledIcon = FILLED[item];
  const Icon = item === "clothing" || item === "face" || item === "weapon" ? OUTLINED[item] : undefined;
  return (
    <span className={className} data-slot="evidence-disc" data-evidence={item} aria-hidden="true">
      {FilledIcon && <FilledIcon fill="currentColor" stroke="var(--disc)" strokeWidth={1.4} />}
      {Icon && <Icon />}
    </span>
  );
}

function WantedHud({ className, ...props }: HTMLAttributes<HTMLDivElement>): ReactElement {
  return <div {...props} className={cx("ld-wanted-hud", className)} data-slot="wanted-hud" />;
}

type RatingProps = ComponentProps<typeof Rating>;

type WantedLevelProps = Omit<RatingProps, "value" | "defaultValue" | "onValueChange"> & {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number, details: ChangeDetails<RatingValueChangeReason>) => void;
  state?: WantedState;
};

function WantedLevel({
  value,
  defaultValue = 0,
  onValueChange,
  state = "seen",
  readOnly,
  max = 6,
  dir = "rtl",
  deselectable = true,
  "aria-label": label = "Wanted level",
  getValueLabel,
  className,
  style,
  children,
  ...props
}: WantedLevelProps): ReactElement {
  const [own, setOwn] = useState(defaultValue);
  const heat = value ?? own;
  const [shown, setShown] = useState(heat);
  const [from, setFrom] = useState(0);
  if (heat !== shown) {
    setShown(heat);
    setFrom(Math.min(shown, heat));
  }
  return (
    <Rating
      {...props}
      className={merge("ld-wanted", className)}
      style={rating => cssVariables({ ...(typeof style === "function" ? style(rating) : style), "--from": from })}
      dir={dir}
      aria-label={readOnly ? undefined : label}
      max={max}
      value={heat}
      readOnly={readOnly}
      deselectable={deselectable}
      data-state={state}
      data-wanted={heat > 0 || undefined}
      getValueLabel={
        getValueLabel ??
        ((score, top) =>
          readOnly
            ? `${label}: ${score} of ${top} stars, ${STATE_LABEL[state].toLowerCase()}`
            : `${score} of ${top} stars`)
      }
      onValueChange={(next, details) => {
        setOwn(next ?? 0);
        onValueChange?.(next ?? 0, details);
      }}
    >
      {children ?? <WantedLevelStar />}
    </Rating>
  );
}

function WantedLevelStar({ className, style, children, ...props }: ComponentProps<typeof RatingItem>): ReactElement {
  return (
    <RatingItem
      {...props}
      className={merge("ld-wanted__star", className)}
      style={star => cssVariables({ ...(typeof style === "function" ? style(star) : style), "--i": star.index - 1 })}
    >
      {children ?? <StarGlyph className="ld-wanted__glyph" />}
    </RatingItem>
  );
}

function WantedEvidence({
  className,
  "aria-label": label = "Evidence against you",
  ...props
}: HTMLAttributes<HTMLUListElement>): ReactElement {
  return <ul {...props} className={cx("ld-evidence", className)} data-slot="wanted-evidence" aria-label={label} />;
}

function WantedEvidenceItem({
  value,
  className,
  ...props
}: HTMLAttributes<HTMLLIElement> & { value: Evidence }): ReactElement {
  return (
    <li
      {...props}
      className={cx("ld-evidence__item", className)}
      data-slot="wanted-evidence-item"
      data-evidence={value}
    >
      <EvidenceDisc item={value} />
      <span className="ld-sr">{EVIDENCE_LABEL[value]}</span>
    </li>
  );
}

export { EvidenceDisc, StarGlyph, WantedEvidence, WantedEvidenceItem, WantedHud, WantedLevel, WantedLevelStar };
export type { Evidence, WantedState } from "./wanted-level.data";
