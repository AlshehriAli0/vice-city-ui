import { useState } from "react";

import {
  BUILDS,
  PAINT_TYPES,
  paintKey,
  money,
  type Build,
  type PaintType,
  type Payment,
  type Section,
} from "./shop-inventory";
import { FAMILIES, type Swatch } from "./swatches";

type Purchase = { section: Section; value: string; label: string; price: number; paidWith: Payment };

type ModShopProps = {
  section?: Section;
  family?: string;
  defaultFamily?: string;
  onFamilyChange?: (family: string) => void;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  build?: string;
  defaultBuild?: string;
  onBuildChange?: (build: string) => void;
  paintType?: PaintType;
  defaultPaintType?: PaintType;
  onPaintTypeChange?: (type: PaintType) => void;
  cash?: number;
  defaultCash?: number;
  onCashChange?: (cash: number) => void;
  buckme?: number;
  defaultBuckme?: number;
  onBuckmeChange?: (buckme: number) => void;
  applied?: string[];
  defaultApplied?: string[];
  onAppliedChange?: (applied: string[]) => void;
  onPurchase?: (purchase: Purchase) => void;
  onBack?: () => void;
};

type Item = {
  key: string;
  value: string;
  label: string;
  price: number;
  pay: Payment[];
  color: string;
  metallic: boolean;
};

const useControllable = <T>(value: T | undefined, initial: T, onChange?: (next: T) => void): [T, (next: T) => void] => {
  const [own, setOwn] = useState(initial);
  const set = (next: T) => {
    setOwn(next);
    onChange?.(next);
  };
  return [value ?? own, set];
};

const findOr = <T extends { value: string }>(list: T[], value: string | undefined): T =>
  list.find(item => item.value === value) ?? list[0];

const itemOf = (respray: boolean, swatch: Swatch, type: (typeof PAINT_TYPES)[number], build: Build): Item => {
  if (!respray) {
    const { value, label, price, pay, paint } = build;
    return { key: value, value, label, price, pay, color: paint, metallic: true };
  }
  return {
    key: paintKey(swatch.value, type.value),
    value: swatch.value,
    label: swatch.label,
    price: type.price,
    pay: ["buckme", "cash"],
    color: swatch.color,
    metallic: type.value === "metallic",
  };
};

const payerOf = ({ pay, price }: Item, cash: number, buckme: number): Payment | null => {
  if (pay.includes("cash") && cash >= price) return "cash";
  if (pay.includes("buckme") && buckme >= price) return "buckme";
  return null;
};

const describe = (item: Item, typeLabel: string | null, owned: boolean, short: boolean): string => {
  const name = typeLabel ? `${item.label}, ${typeLabel}` : item.label;
  if (owned) return `${name}, Applied`;
  return `${name}, ${money(item.price)}, ${short ? "not enough BuckMe funds" : "not owned"}`;
};

const isPaint = (key: string) => key.includes("/");

const useModShop = (props: ModShopProps) => {
  const section = props.section ?? "respray";
  const respray = section === "respray";
  const [familyValue, setFamily] = useControllable(
    props.family,
    props.defaultFamily ?? "recommended",
    props.onFamilyChange
  );
  const family = findOr(FAMILIES, familyValue);
  const [swatchValue, setSwatch] = useControllable(
    props.value,
    props.defaultValue ?? family.swatches[0].value,
    props.onValueChange
  );
  const swatch = findOr(family.swatches, swatchValue);
  const [buildValue, setBuild] = useControllable(
    props.build,
    props.defaultBuild ?? BUILDS[0].value,
    props.onBuildChange
  );
  const build = findOr(BUILDS, buildValue);
  const [typeValue, setType] = useControllable(
    props.paintType,
    props.defaultPaintType ?? "gloss",
    props.onPaintTypeChange
  );
  const type = findOr(PAINT_TYPES, typeValue);
  const [cash, setCash] = useControllable(props.cash, props.defaultCash ?? 1147, props.onCashChange);
  const [buckme, setBuckme] = useControllable(props.buckme, props.defaultBuckme ?? 2005, props.onBuckmeChange);
  const [applied, setApplied] = useControllable(props.applied, props.defaultApplied ?? [], props.onAppliedChange);
  const [counted, setCounted] = useState(false);
  const [refocus, setRefocus] = useState(false);
  const [lastBuy, setLastBuy] = useState<string | null>(null);

  const item = itemOf(respray, swatch, type, build);
  const payer = payerOf(item, cash, buckme);
  const owned = applied.includes(item.key);
  const short = !owned && payer === null;
  const paint = applied.find(isPaint)?.split("/");

  const changeFamily = (next: string | null) => {
    const target = FAMILIES.find(entry => entry.value === next);
    if (!target || target === family) return;
    setRefocus(Boolean(document.activeElement?.closest(".ld-shop__strip")));
    setFamily(target.value);
    setSwatch(target.swatches[0].value);
    setCounted(false);
    setLastBuy(null);
  };

  return {
    section,
    respray,
    family,
    swatch,
    build,
    type,
    typeIndex: PAINT_TYPES.indexOf(type),
    cash,
    buckme,
    item,
    owned,
    short,
    counted,
    refocus,
    appliedSwatch: paint?.[1] === type.value ? paint[0] : null,
    appliedBuild: BUILDS.find(entry => applied.includes(entry.value)),
    announcement: lastBuy ?? describe(item, respray ? type.label : null, owned, short),
    changeFamily,
    bump: (by: number) => {
      const at = FAMILIES.indexOf(family);
      changeFamily(FAMILIES[(at + by + FAMILIES.length) % FAMILIES.length].value);
    },
    changeSwatch: (next: string) => {
      setSwatch(next);
      setCounted(true);
      setLastBuy(null);
    },
    changeBuild: (next: string) => {
      setBuild(next);
      setLastBuy(null);
    },
    stepPaint: () => {
      setType(PAINT_TYPES[(PAINT_TYPES.indexOf(type) + 1) % PAINT_TYPES.length].value);
      setLastBuy(null);
    },
    buy: () => {
      if (owned || !payer) return;
      if (payer === "cash") setCash(cash - item.price);
      else setBuckme(buckme - item.price);
      setApplied([...applied.filter(key => isPaint(key) !== respray), item.key]);
      setLastBuy(`Bought ${item.label} for ${money(item.price)}. Applied.`);
      props.onPurchase?.({ section, value: item.value, label: item.label, price: item.price, paidWith: payer });
    },
  };
};

type ModShopState = ReturnType<typeof useModShop>;

export { useModShop };
export type { ModShopProps, ModShopState, Purchase };
