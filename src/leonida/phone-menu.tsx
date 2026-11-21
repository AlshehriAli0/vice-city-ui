import { createChange, createRovingFocus, definePrimitive, elements, labelOf, type ChangeDetails, type RovingFocus } from "@ui-sdk/core"
import { createParts, usePart, usePrimitive, type PartProps } from "@ui-sdk/react/primitive"
import type { ComponentProps, ReactElement } from "react"

// The phone's D-pad focus: one tab stop, arrows move it, Enter (Cross) opens the focused item.
// `columns` lays items out in rows; a list is one column. Focus never wraps (not seen in the game).
type PhoneMenuValueChangeReason = "list-navigation" | "item-press" | "imperative"

type PhoneMenuOptions = {
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string, details: ChangeDetails<PhoneMenuValueChangeReason>) => void
  onOpen?: (value: string) => void
  columns?: number
}

type ItemProps = { value: string; disabled?: boolean }

const phoneMenu = definePrimitive({
  name: "phone-menu",
  options: { value: "string", defaultValue: "string", onValueChange: "callback", onOpen: "callback", columns: "number" },
  controlled: ["value"],
  state: (options: PhoneMenuOptions) => ({
    value: options.value ?? options.defaultValue ?? null,
    focused: null as string | null,
    columns: options.columns ?? 1,
  }),
  sync: (options) => ({ ...(options.value === undefined ? {} : { value: options.value }), columns: options.columns ?? 1 }),
  api: (context) => {
    const { store } = context
    const change = createChange(context)
    const roving: RovingFocus = createRovingFocus<ReturnType<typeof store.get>, ItemProps>(context, {
      slot: "item",
      key: "focused",
      remember: false,
      preferred: (item) => item.key === store.get().value,
      claims: (state, item) => state.value === null || item.key === state.value,
      move: (event, { from, items, rtl }) => {
        const columns = store.get().columns
        const at = items.findIndex((item) => item.key === from.key)
        const side = columns > 1 ? 1 : undefined
        const by = (
          {
            ArrowDown: columns,
            ArrowUp: -columns,
            ArrowRight: side && (rtl ? -1 : 1),
            ArrowLeft: side && (rtl ? 1 : -1),
            Home: -at,
            End: items.length - 1 - at,
          } as Record<string, number | undefined>
        )[event.key]
        if (by === undefined) return undefined
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          const row = Math.floor(at / columns)
          const target = at + by
          return Math.floor(target / columns) === row && items[target] ? items[target].key : from.key
        }
        const target = items[at + by]
        if (target) return target.key
        // Down from a column the short last row lacks lands on its last item.
        if (event.key === "ArrowDown" && Math.floor(at / columns) < Math.floor((items.length - 1) / columns)) return items[items.length - 1].key
        return from.key
      },
    })
    const items = () => elements<ItemProps>(context, "item").map((part) => ({ value: part.key, label: labelOf(part.el) }))
    const find = (name: string) => items().find((item) => item.value === name || item.label.toLowerCase() === name.toLowerCase())?.value
    return {
      roving,
      items,
      highlight: (value: string) => {
        if (store.get().value !== value) change("value", value, { reason: "list-navigation" })
      },
      focusItem: (name: string) => {
        const value = find(name)
        if (!value) throw new Error(`No item "${name}". Items: ${items().map((item) => item.label).join(", ")}.`)
        change("value", value, { reason: "imperative" })
        roving.focus(value)
        return true
      },
      open: (name: string, event?: Event) => {
        const value = find(name)
        if (!value) throw new Error(`No item "${name}". Items: ${items().map((item) => item.label).join(", ")}.`)
        if (context.props<ItemProps>("item", value)?.disabled) return false
        if (store.get().value !== value) change("value", value, { reason: "item-press", event: event as MouseEvent | undefined })
        context.options().onOpen?.(value)
        return true
      },
    }
  },
  slots: (slot) => ({
    root: slot({
      role: "menu",
      keys: { none: "Each item handles the arrows." },
    }),
    item: slot<ItemProps>({
      role: "menuitem",
      focus: "roving",
      props: { value: "string", disabled: "boolean" },
      attrs: (state, part) => ({
        type: "button",
        tabindex: part.api.roving.tabIndex(state, part),
        "aria-disabled": part.props.disabled ? "true" : undefined,
        "data-focused": state.value === part.key ? "" : undefined,
      }),
      press: ({ api, key }, event) => api.open(key, event),
      on: {
        keydown: (event, { el, api }) => el && api.roving.keydown(event as KeyboardEvent, el),
        focus: (_event, { api, key }) => api.highlight(key),
      },
      bind: (el, part) => part.api.roving.bind(el, part),
    }),
  }),
  agent: { actions: ["open", "focusItem"], items: (api) => api.items() },
})

const parts = createParts(phoneMenu, { item: "button" })

type PhoneMenuProps = PhoneMenuOptions & Omit<PartProps<"div">, "defaultValue" | "onChange">

function PhoneMenu({ value, defaultValue, onValueChange, onOpen, columns, ...props }: PhoneMenuProps): ReactElement | null {
  const handle = usePrimitive(phoneMenu, { value, defaultValue, onValueChange, onOpen, columns })
  return usePart(handle, "root", {}, props, "div")
}

function PhoneMenuItem(props: ComponentProps<typeof parts.Item>): ReactElement {
  return <parts.Item {...props} />
}

export { PhoneMenu, PhoneMenuItem, phoneMenu }
export type { PhoneMenuOptions, PhoneMenuProps, PhoneMenuValueChangeReason }
