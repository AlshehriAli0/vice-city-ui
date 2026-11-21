import { announce } from "@ui-sdk/core";
import { useEffect, useEffectEvent, useState } from "react";

import {
  DEMO_PROGRESS,
  DEMO_SAVES,
  SLOT_COUNT,
  VISIBLE_ROWS,
  calm,
  saveLabel,
  slotRows,
  toLocalIso,
  type SaveGame,
  type SaveMode,
  type SaveProgress,
} from "./save-screen.data";

type SaveChangeReason = "save" | "overwrite" | "delete";
type ConfirmKind = "overwrite" | "delete" | "load";
type Confirm = { kind: ConfirmKind; save: SaveGame; open: boolean };
type SaveStage = "out" | "hold" | "in";

type Phase =
  | { kind: "idle" }
  | { kind: "saving"; stage: SaveStage; target: SaveGame | null; cut: boolean }
  | { kind: "loading"; save: SaveGame }
  | { kind: "leaving" };

type SaveScreenProps = {
  mode?: SaveMode;
  saves?: SaveGame[];
  defaultSaves?: SaveGame[];
  onSavesChange?: (saves: SaveGame[], details: { reason: SaveChangeReason; save: SaveGame }) => void;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (id: string) => void;
  progress?: SaveProgress;
  slots?: number;
  saving?: boolean;
  intro?: "dip" | "fade" | "none";
  now?: () => Date;
  autoFocus?: boolean;
  onSave?: (save: SaveGame) => void;
  onLoad?: (save: SaveGame) => void;
  onBack?: () => void;
};

const IDLE: Phase = { kind: "idle" };
const SAVE_STAGE_MS: Record<SaveStage, number> = { out: 430, hold: 600, in: 300 };
const NEXT_STAGE: Record<SaveStage, SaveStage | null> = { out: "hold", hold: "in", in: null };
const EXIT_MS = { loading: 300, leaving: 230 };

const waitOf = (phase: Phase): number | null => {
  if (phase.kind === "idle") return null;
  return phase.kind === "saving" ? SAVE_STAGE_MS[phase.stage] : EXIT_MS[phase.kind];
};

const currentTime = () => new Date();

const scrollFor = (index: number, from: number, total: number) => {
  let next = from;
  if (index > next + VISIBLE_ROWS - 2) next = index - (VISIBLE_ROWS - 2);
  if (index < next + 1) next = index - 1;
  return Math.min(Math.max(0, next), Math.max(0, total - VISIBLE_ROWS));
};

const contentHidden = (phase: Phase) =>
  phase.kind === "loading" ||
  phase.kind === "leaving" ||
  (phase.kind === "saving" && phase.cut && phase.stage !== "in");

const useSaveScreen = (props: SaveScreenProps) => {
  const { mode = "save", slots = SLOT_COUNT, progress = DEMO_PROGRESS, now = currentTime } = props;
  const [ownSaves, setOwnSaves] = useState(props.defaultSaves ?? DEMO_SAVES);
  const [ownValue, setOwnValue] = useState(props.defaultValue ?? null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [phase, setPhase] = useState<Phase>(IDLE);
  const [scroll, setScroll] = useState(0);
  const saves = props.saves ?? ownSaves;
  const rows = slotRows(mode, saves, slots);
  const wanted = props.value === undefined ? ownValue : props.value;
  const current = rows.find(row => row.id === wanted) ?? rows.at(0) ?? null;
  const index = current ? rows.indexOf(current) : 0;
  const top = scrollFor(index, scroll, rows.length);
  if (top !== scroll) setScroll(top);
  const asking = confirm?.open ? confirm : null;
  const busy = phase.kind !== "idle" || asking !== null || Boolean(props.saving);

  const select = (id: string) => {
    setOwnValue(id);
    if (id !== current?.id) props.onValueChange?.(id);
  };

  const change = (next: SaveGame[], reason: SaveChangeReason, save: SaveGame) => {
    setOwnSaves(next);
    props.onSavesChange?.(next, { reason, save });
  };

  const startSave = (target: SaveGame | null, cut: boolean) => {
    announce("Saving");
    setPhase({ kind: "saving", stage: "out", target, cut });
  };

  const commit = useEffectEvent((target: SaveGame | null) => {
    const created: SaveGame = { ...progress, id: target?.id ?? `save-${now().getTime()}`, date: toLocalIso(now()) };
    const next = target ? saves.map(save => (save.id === target.id ? created : save)) : [...saves, created];
    change(next, target ? "overwrite" : "save", created);
    select(created.id);
    props.onSave?.(created);
    announce(`Saved ${saveLabel(created)}`);
  });

  const advance = useEffectEvent(() => {
    if (phase.kind === "loading") props.onLoad?.(phase.save);
    if (phase.kind === "leaving") props.onBack?.();
    if (phase.kind !== "saving") return;
    if (phase.stage === "out") commit(phase.target);
    const stage = NEXT_STAGE[phase.stage];
    setPhase(stage ? { ...phase, stage } : IDLE);
  });

  useEffect(() => {
    const wait = waitOf(phase);
    if (wait === null) return undefined;
    const timer = setTimeout(() => advance(), calm() ? 0 : wait);
    return () => clearTimeout(timer);
  }, [phase]);

  const ask = (kind: ConfirmKind, save: SaveGame) => setConfirm({ kind, save, open: true });

  const remove = (save: SaveGame) => {
    const next = saves.filter(entry => entry.id !== save.id);
    change(next, "delete", save);
    const stay = slotRows(mode, next, slots).at(index) ?? slotRows(mode, next, slots).at(-1);
    if (stay) select(stay.id);
    announce(`Deleted ${saveLabel(save)}`);
  };

  const resolve = (asked: Confirm) => {
    if (asked.kind === "overwrite") startSave(asked.save, true);
    if (asked.kind === "delete") remove(asked.save);
    if (asked.kind !== "load") return;
    announce(`Loading ${saveLabel(asked.save)}`);
    setPhase({ kind: "loading", save: asked.save });
  };

  return {
    mode,
    slots,
    saves,
    rows,
    current,
    index,
    top,
    asking,
    confirm,
    busy,
    phase,
    hidden: contentHidden(phase),
    select,
    primary: () => {
      if (!current || busy) return;
      if (current.save) ask(mode === "load" ? "load" : "overwrite", current.save);
      else if (mode === "save") startSave(null, false);
    },
    remove: () => {
      if (current?.save && !busy) ask("delete", current.save);
    },
    back: () => {
      if (!busy) setPhase({ kind: "leaving" });
    },
    answer: (yes: boolean) => {
      if (!asking) return;
      setConfirm({ ...asking, open: false });
      if (yes) resolve(asking);
    },
  };
};

type SaveScreenState = ReturnType<typeof useSaveScreen>;

export { useSaveScreen };
export type { Confirm, SaveChangeReason, SaveScreenProps, SaveScreenState };
