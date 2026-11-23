import { createToaster } from "@ui-sdk/react/toast";
import type { ReactNode } from "react";

type CallState = "dialing" | "incoming" | "connected" | "ended";

type CallHandlers = { onAnswer?: () => void; onHangUp?: () => void };

type SlotData = { kind?: "message" | "call"; avatar?: string; state?: CallState; since?: number } & CallHandlers;

type CallOptions = { avatar?: string };

type Slot = {
  toaster: ReturnType<typeof createToaster<ReactNode>>;
  message: (name: string, body: string, options?: { avatar?: string }) => string;
  call: (name: string, state?: CallState, options?: CallOptions) => string;
  dial: (name: string, options?: CallOptions & { pickup?: number }) => string;
  ring: (name: string, options?: CallOptions) => string;
  answer: () => void;
  endCall: () => void;
};

const createSlot = (): Slot => {
  const toaster = createToaster({ duration: 5500 });
  toaster.subscribe(() => {
    const [, ...older] = toaster.toasts();
    for (const item of older) toaster.dismiss(item.id);
  });
  let timer: ReturnType<typeof setTimeout> | undefined;
  let current: { name: string; avatar?: string } = { name: "" };
  const call: Slot["call"] = (name, state = "dialing", options = {}) => {
    clearTimeout(timer);
    current = { name, avatar: options.avatar };
    const handlers: CallHandlers = {};
    if (state === "incoming") handlers.onAnswer = answer;
    else if (state !== "ended") handlers.onHangUp = endCall;
    return toaster({
      id: "call",
      title: name,
      duration: Infinity,
      data: {
        kind: "call",
        state,
        avatar: options.avatar,
        since: state === "connected" ? Date.now() : undefined,
        ...handlers,
      } satisfies SlotData,
    });
  };
  const answer = () => {
    if (toaster.toasts().some(item => item.id === "call")) call(current.name, "connected", current);
  };
  const endCall = () => {
    if (!toaster.toasts().some(item => item.id === "call")) return;
    call(current.name, "ended", current);
    timer = setTimeout(() => toaster.dismiss("call"), 1200);
  };
  return {
    toaster,
    message: (name, body, options = {}) =>
      toaster({ title: name, description: body, data: { kind: "message", avatar: options.avatar } satisfies SlotData }),
    call,
    dial: (name, { pickup = 2000, ...options } = {}) => {
      const id = call(name, "dialing", options);
      timer = setTimeout(() => call(name, "connected", options), pickup);
      return id;
    },
    ring: (name, options) => call(name, "incoming", options),
    answer,
    endCall,
  };
};

const main = createSlot();
const toast = main.toaster;
const { message, call, dial, ring, answer, endCall } = main;

export { answer, call, createSlot, dial, endCall, message, ring, toast };
export type { CallHandlers, CallState, Slot, SlotData };
