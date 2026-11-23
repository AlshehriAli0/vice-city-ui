import { ArrowDown, ArrowUp } from "lucide-react";

import { cssVariables } from "../../../shared/css-variables";
import { RATING, STATS, money, type Build, type Payment } from "./shop-inventory";

const BuckMeIcon = () => (
  <svg className="ld-shop__icon" data-pay="buckme" viewBox="0 0 32 32" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M6 2.5h5.6v8.6A9 9 0 1 1 6 19.4zm10.8 11.4a5.3 5.3 0 1 0 0 10.6 5.3 5.3 0 0 0 0-10.6z"
    />
    <path d="M2.5 9.2 17 4.6l1.1 3.3L3.6 12.5z" />
  </svg>
);

const WalletIcon = () => (
  <svg className="ld-shop__icon" data-pay="cash" viewBox="0 0 32 32" aria-hidden="true">
    <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h17A2.5 2.5 0 0 1 26 8.5V11h1.5a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H26v1.5a2.5 2.5 0 0 1-2.5 2.5h-17A2.5 2.5 0 0 1 4 23.5zM19 14.5a2.5 2.5 0 0 0 0 5h6.5v-5z" />
  </svg>
);

const CheckDisc = () => (
  <svg className="ld-shop__check" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="11" />
    <path d="m6.8 12.4 3.4 3.4 7-7.2" />
  </svg>
);

const PriceRow = ({ price, was, pay, short }: { price: number; was?: number; pay: Payment[]; short: boolean }) => (
  <p className="ld-shop__price" data-short={short || undefined}>
    {pay.includes("buckme") && <BuckMeIcon />}
    {pay.includes("cash") && <WalletIcon />}
    <span className="ld-shop__amount">{money(price)}</span>
    {was !== undefined && <s className="ld-shop__was">{money(was)}</s>}
  </p>
);

const Status = ({ owned, short }: { owned: boolean; short: boolean }) => {
  if (owned) {
    return (
      <p className="ld-shop__status" data-tone="applied">
        <CheckDisc />
        Applied
      </p>
    );
  }
  if (short) {
    return (
      <p className="ld-shop__status" data-tone="short">
        <span className="ld-shop__dollar" aria-hidden="true">
          $
        </span>
        Not enough BuckMe funds
      </p>
    );
  }
  return <p className="ld-shop__status">Not owned</p>;
};

const CarLayers = ({ src, mask }: { src: string; mask: string }) => (
  <>
    <img className="ld-shop__base" src={src} alt="" draggable={false} />
    <span className="ld-shop__paint" style={cssVariables({ "--mask": `url("${mask}")` })}>
      <img className="ld-shop__shade-layer" src={src} alt="" draggable={false} />
      <span className="ld-shop__tint" />
      <img className="ld-shop__gloss" src={src} alt="" draggable={false} />
    </span>
  </>
);

const ShopCar = ({ paint, metallic, view }: { paint: string; metallic: boolean; view: number }) => {
  const src = "/vc/modshop-cheetah.webp";
  const mask = "/vc/modshop-cheetah-body.webp";
  return (
    <div
      className="ld-shop__car"
      data-view={view}
      data-metallic={metallic || undefined}
      style={cssVariables({ "--paint": paint })}
      aria-hidden="true"
    >
      <span className="ld-shop__floor-shadow" />
      <span className="ld-shop__mirror">
        <CarLayers src={src} mask={mask} />
      </span>
      <span className="ld-shop__body">
        <CarLayers src={src} mask={mask} />
      </span>
    </div>
  );
};

const statsOf = (build: Build | undefined) =>
  STATS.map(stat => Math.round((stat.base + (build?.delta[stat.value] ?? 0)) * 10) / 10);
const ratingOf = (build: Build | undefined) => RATING.map((base, index) => base + (build?.rating[index] ?? 0));

const trendOf = (delta: number): "up" | "down" | undefined => {
  if (delta > 0) return "up";
  if (delta < 0) return "down";
  return undefined;
};

const Delta = ({ by, digits }: { by: number; digits: number }) => (
  <span className="ld-shop__delta" data-trend={by > 0 ? "up" : "down"}>
    {by > 0 ? <ArrowUp aria-hidden="true" /> : <ArrowDown aria-hidden="true" />}
    <span className="ld-sr">{by > 0 ? "up " : "down "}</span>
    {Math.abs(by).toFixed(digits)}
  </span>
);

const StatPanel = ({ current, preview }: { current: Build | undefined; preview: Build }) => {
  const now = statsOf(current);
  const next = statsOf(preview);
  const scoreNow = ratingOf(current);
  const scoreNext = ratingOf(preview);
  return (
    <div className="ld-shop__stats">
      <dl className="ld-shop__rows">
        {STATS.map((stat, index) => {
          const delta = Math.round((next[index] - now[index]) * 10) / 10;
          const trend = trendOf(delta);
          return (
            <div
              key={stat.value}
              className="ld-shop__stat"
              data-trend={trend}
              style={cssVariables({ "--base": now[index] / 10, "--next": next[index] / 10 })}
            >
              <dt>{stat.label}</dt>
              <dd>
                {trend && <Delta by={delta} digits={1} />}
                <span className="ld-shop__value">{next[index].toFixed(1)}</span>
              </dd>
              <span className="ld-shop__bar" aria-hidden="true">
                <span className="ld-shop__fill" />
                <span className="ld-shop__change" />
                <span className="ld-shop__tick" />
              </span>
            </div>
          );
        })}
      </dl>
      <p className="ld-shop__rating">
        <span className="ld-shop__rating-label">Rating</span>
        {RATING.map((_, index) => {
          const delta = scoreNext[index] - scoreNow[index];
          const name = index === 0 ? "Off-road" : "Asphalt";
          return (
            <span key={name} className="ld-shop__score">
              {delta !== 0 && <Delta by={delta} digits={0} />}
              {scoreNext[index]}
              <svg className="ld-shop__badge" viewBox="0 0 28 28" role="img" aria-label={name}>
                <rect width="28" height="28" rx="2" />
                {index === 0 ? (
                  <path d="m3 21 6-9 4 5 5-10 7 14" />
                ) : (
                  <path d="M11 4 4 24M17 4l7 20M14 6v4m0 4v4m0 4v2" />
                )}
              </svg>
            </span>
          );
        })}
      </p>
    </div>
  );
};

export { BuckMeIcon, CheckDisc, PriceRow, ShopCar, StatPanel, Status, WalletIcon };
