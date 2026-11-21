import { Input as InputRoot, InputClear as InputClearRoot, InputGroup as InputGroupRoot } from "@ui-sdk/react/input"
import { Textarea as TextareaRoot } from "@ui-sdk/react/textarea"
import type { ComponentProps, ReactElement } from "react"
import { cx, merge, styled } from "./cx"
import { Close } from "./icons"
import "./ui.css"
import "./input.css"

type Size = "sm" | "md" | "lg"

type InputProps = Omit<ComponentProps<typeof InputRoot>, "size"> & { size?: Size }

function Input({ className, size, ...props }: InputProps): ReactElement {
  return <InputRoot {...props} className={merge("vc-control vc-input", className)} data-size={size} />
}

type InputGroupProps = ComponentProps<typeof InputGroupRoot> & { size?: Size }

function InputGroup({ className, size, ...props }: InputGroupProps): ReactElement {
  return <InputGroupRoot {...props} className={merge("vc-control vc-input-group", className)} data-size={size} />
}

// Static text beside the input, like a currency sign.
function InputAffix({ className, ...props }: ComponentProps<"span">): ReactElement {
  return <span {...props} className={cx("vc-affix", className)} />
}

function InputClear({ className, children, ...props }: ComponentProps<typeof InputClearRoot>): ReactElement {
  return (
    <InputClearRoot {...props} className={merge("vc-input-clear", className)}>
      {children ?? <Close />}
    </InputClearRoot>
  )
}

const Textarea = styled(TextareaRoot, "vc-control vc-textarea")

export { Input, InputAffix, InputClear, InputGroup, Textarea }
export type { InputGroupProps, InputProps }
