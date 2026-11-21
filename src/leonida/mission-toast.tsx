import { Button } from "@ui-sdk/react/button";
import { useShortcut } from "@ui-sdk/react/shortcuts";
import { Toast, ToastAction, ToastDescription, ToastRegion, ToastTitle } from "@ui-sdk/react/toast";
import { Phone } from "lucide-react";
import { useEffect, useState, type ComponentProps, type ReactElement, type ReactNode } from "react";

import { merge } from "../ui/cx";
import { ButtonGlyph } from "./button-prompt";
import { toast, type CallHandlers, type CallState, type SlotData } from "./mission-toast.store";

import "./game-ui.css";
import "./mission-toast.css";

function CallLine({ data }: { data: Pick<SlotData, "state" | "since"> }): ReactElement {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (data.state !== "connected") return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [data.state]);
  if (data.state === "dialing") return <span>Dialing…</span>;
  if (data.state === "incoming") return <span>Incoming Call…</span>;
  if (data.state === "ended") return <span>Call Ended</span>;
  const seconds = Math.max(0, Math.floor((now - (data.since ?? now)) / 1000));
  return (
    <span className="ld-call__clock">
      {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
    </span>
  );
}

function DpadHint(): ReactElement {
  return (
    <span className="ld-text__hint" data-slot="notification-hint" aria-hidden="true">
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M9 1h6v7l-3 3-3-3z" fill="#fff" />
        <path d="M9 23h6v-7l-3-3-3 3zM1 9v6h7l3-3-3-3zM23 9v6h-7l-3-3 3-3z" fill="rgb(255 255 255 / 0.4)" />
      </svg>
    </span>
  );
}

type ToastProps = ComponentProps<typeof Toast>;

function TextNotification({
  avatar,
  name,
  className,
  children,
  ...props
}: Omit<ToastProps, "children"> & { avatar?: string; name?: string; children?: ReactNode }): ReactElement {
  return (
    <Toast {...props} className={merge("ld-text", className)}>
      <DpadHint />
      <span className="ld-text__head" data-slot="notification-head">
        <span className="ld-text__avatar" data-slot="notification-avatar" aria-hidden="true">
          {avatar ? <img src={avatar} alt="" /> : name?.slice(0, 1)}
        </span>
        <ToastTitle className="ld-text__name" />
      </span>
      <ToastDescription className="ld-text__body" />
      <ToastAction className="ld-text__action" />
      {children}
    </Toast>
  );
}

function CallNotification({
  state = "dialing",
  since,
  avatar,
  name,
  onAnswer,
  onHangUp,
  className,
  ...props
}: Omit<ToastProps, "children"> & {
  state?: CallState;
  since?: number;
  avatar?: string;
  name?: string;
} & CallHandlers): ReactElement {
  useShortcut("arrowup", () => onAnswer?.(), {
    when: () => state === "incoming" && Boolean(onAnswer),
    description: "Answer (D-pad Up)",
  });
  const face = state !== "dialing";
  return (
    <Toast {...props} className={merge("ld-call", className)} data-state={state}>
      {state === "incoming" && onAnswer && (
        <Button className="ld-call__key" aria-label="Answer call" onClick={onAnswer}>
          <DpadUp />
        </Button>
      )}
      {(state === "dialing" || state === "connected") && onHangUp && (
        <Button className="ld-call__key" aria-label="Hang up" onClick={onHangUp}>
          <ButtonGlyph shape="circle" />
        </Button>
      )}
      <span className="ld-call__icon" data-slot="notification-avatar" data-face={face || undefined} aria-hidden="true">
        {face && (avatar ? <img src={avatar} alt="" /> : <b>{name?.slice(0, 1)}</b>)}
        <i>
          <Phone />
        </i>
      </span>
      <span className="ld-call__copy" data-slot="notification-copy">
        <ToastTitle className="ld-call__name" />
        <CallLine data={{ state, since }} />
      </span>
    </Toast>
  );
}

function DpadUp(): ReactElement {
  return (
    <svg className="ld-call__dpad" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M12.6 3h6.8v7.4L16 13.8l-3.4-3.4z" data-on="" />
      <path d="M12.6 29h6.8v-7.4L16 18.2l-3.4 3.4zM3 12.6v6.8h7.4l3.4-3.4-3.4-3.4zM29 12.6v6.8h-7.4L18.2 16l3.4-3.4z" />
    </svg>
  );
}

function renderNotification(item: { title?: unknown; data?: unknown }): ReactElement {
  const data = (item.data ?? {}) as SlotData;
  const name = typeof item.title === "string" ? item.title : "";
  if (data.kind === "call")
    return (
      <CallNotification
        state={data.state}
        since={data.since}
        avatar={data.avatar}
        name={name}
        onAnswer={data.onAnswer}
        onHangUp={data.onHangUp}
      />
    );
  return <TextNotification avatar={data.avatar} name={name} />;
}

type NotificationSlotProps = Omit<ComponentProps<typeof ToastRegion>, "children"> & {
  inline?: boolean;
  children?: ComponentProps<typeof ToastRegion>["children"];
};

function NotificationSlot({
  toaster = toast,
  inline,
  className,
  children = renderNotification,
  ...props
}: NotificationSlotProps): ReactElement {
  return (
    <ToastRegion
      side="bottom"
      align="end"
      maxVisible={1}
      shortcut={inline ? null : undefined}
      aria-label="Notifications"
      data-agent-hidden
      {...props}
      toaster={toaster}
      className={merge("ld-slot", className)}
      data-inline={inline ? true : undefined}
    >
      {children}
    </ToastRegion>
  );
}

function TextCardStill({ name, body }: { name: string; body: string }): ReactElement {
  return (
    <div className="ld-slot" data-slot="notification-still" data-inline="" data-still="" aria-hidden="true">
      <div className="ld-text">
        <DpadHint />
        <span className="ld-text__head" data-slot="notification-head">
          <span className="ld-text__avatar" data-slot="notification-avatar">
            {name.slice(0, 1)}
          </span>
          <b className="ld-text__name">{name}</b>
        </span>
        <p className="ld-text__body">{body}</p>
      </div>
    </div>
  );
}

function LeonidaToasts(): ReactElement {
  return <NotificationSlot />;
}

export { CallNotification, LeonidaToasts, NotificationSlot, TextCardStill, TextNotification };
