import {
  checkedAttrs,
  createChange,
  createRovingFocus,
  definePrimitive,
  elements,
  labelOf,
  type ChangeDetails,
  type RovingFocus,
} from "@ui-sdk/core";

type CycleValueChangeReason = "item-press" | "list-navigation" | "previous-press" | "next-press" | "imperative";

type CycleOptions = {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string, details: ChangeDetails<CycleValueChangeReason>) => void;
  disabled?: boolean;
  name?: string;
};

const cycle = definePrimitive({
  name: "cycle",
  options: { value: "string", defaultValue: "string", onValueChange: "callback", disabled: "boolean", name: "string" },
  controlled: ["value"],
  state: (options: CycleOptions) => ({
    value: options.value ?? options.defaultValue ?? null,
    focused: null as string | null,
    order: [] as string[],
    disabled: options.disabled ?? false,
    name: options.name,
  }),
  sync: options => ({
    ...(options.value === undefined ? {} : { value: options.value }),
    disabled: options.disabled ?? false,
    name: options.name,
  }),
  api: context => {
    const { store } = context;
    const change = createChange(context);
    const roving: RovingFocus = createRovingFocus(context, {
      slot: "value",
      key: "focused",
      remember: false,
      orientation: () => "both",
      loop: () => true,
      disabled: () => store.get().disabled,
      preferred: item => item.key === store.get().value,
      claims: (state, item) => state.value === null || item.key === state.value,
      onItemsChange: () => store.set({ order: elements(context, "value").map(part => part.key) }),
    });
    const step = (by: number, reason: "previous-press" | "next-press", event?: Event) => {
      const { order, value, disabled } = store.get();
      if (disabled || order.length === 0) return false;
      const at = value === null ? -1 : order.indexOf(value);
      const next = order[(at + by + order.length) % order.length];
      return change("value", next, { reason, event });
    };
    return {
      roving,
      items: () =>
        elements<{ value: string }>(context, "value").map(part => ({ value: part.key, label: labelOf(part.el) })),
      setValue: (value: string) => change("value", value, { reason: "imperative" }),
      next: (event?: Event) => step(1, "next-press", event),
      previous: (event?: Event) => step(-1, "previous-press", event),
      choose: (value: string, event?: Event) => change("value", value, { reason: "item-press", event }),
      keydown(event: KeyboardEvent, el: HTMLElement) {
        const moved = roving.keydown(event, el);
        if (moved && moved.key !== moved.from) change("value", moved.key, { reason: "list-navigation", event });
      },
    };
  },
  slots: slot => ({
    root: slot({
      role: "radiogroup",
      keys: { none: "Each radio handles the arrows." },
      attrs: state => ({
        "aria-disabled": state.disabled ? "true" : undefined,
        "data-disabled": state.disabled ? "" : undefined,
      }),
    }),
    value: slot<{ value: string }>({
      role: "radio",
      focus: "roving",
      props: { value: "string" },
      attrs: (state, part) => ({
        type: "button",
        "aria-checked": String(state.value === part.key),
        tabindex: part.api.roving.tabIndex(state, part),
        disabled: state.disabled ? "" : undefined,
        ...checkedAttrs(state.value === part.key),
      }),
      press: ({ api, key }, event) => api.choose(key, event),
      on: { keydown: (event, { el, api }) => el && api.keydown(event, el) },
      bind: (el, part) => part.api.roving.bind(el, part),
    }),
    previous: slot({
      attrs: state => ({ "aria-hidden": "true", "data-disabled": state.disabled ? "" : undefined }),
      press: ({ api }, event) => api.previous(event),
    }),
    next: slot({
      attrs: state => ({ "aria-hidden": "true", "data-disabled": state.disabled ? "" : undefined }),
      press: ({ api }, event) => api.next(event),
    }),
    count: slot<{ id?: string }, { index: number; total: number }>({
      state: state => ({
        index: state.value === null ? 0 : state.order.indexOf(state.value) + 1,
        total: state.order.length,
      }),
      attrs: () => ({ "aria-hidden": "true" }),
    }),
    input: slot({
      present: state => Boolean(state.name),
      attrs: state => ({ type: "hidden", name: state.name, value: state.value ?? "" }),
    }),
  }),
  agent: { actions: ["setValue", "next", "previous"], closed: true, items: api => api.items() },
});

export { cycle };
export type { CycleOptions, CycleValueChangeReason };
