import {
  Field as FieldRoot,
  FieldDescription as FieldDescriptionRoot,
  FieldError as FieldErrorRoot,
  FieldGroup as FieldGroupRoot,
  FieldLabel as FieldLabelRoot,
  FieldLegend as FieldLegendRoot,
  FieldSet as FieldSetRoot,
} from "@ui-sdk/react/field"
import type { ComponentProps, ReactElement } from "react"
import { cx, merge, styled } from "./cx"
import "./ui.css"
import "./field.css"

type FieldProps = ComponentProps<typeof FieldRoot> & {
  // "row" is the settings-screen row: label left, control right. "stack" puts the label on top.
  // "choice" is a checkbox or radio with its label beside it and the description under the label.
  layout?: "row" | "stack" | "choice"
}

function Field({ className, layout = "row", ...props }: FieldProps): ReactElement {
  return <FieldRoot {...props} className={merge("vc-field", className)} data-layout={layout} />
}

const FieldLabel = styled(FieldLabelRoot, "vc-label")
const FieldDescription = styled(FieldDescriptionRoot, "vc-description")
const FieldError = styled(FieldErrorRoot, "vc-error")
const FieldSet = styled(FieldSetRoot, "vc-fieldset")
const FieldLegend = styled(FieldLegendRoot, "vc-legend")
const FieldGroup = styled(FieldGroupRoot, "vc-field-group")

// A settings list: rows stacked on hairlines, under an optional FieldListTitle.
function FieldList({ className, ...props }: ComponentProps<"div">): ReactElement {
  return <div {...props} className={cx("vc-list vc-stagger", className)} />
}

function FieldListTitle({ className, ...props }: ComponentProps<"p">): ReactElement {
  return <p {...props} className={cx("vc-list__title", className)} />
}

export { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldList, FieldListTitle, FieldSet }
export type { FieldProps }
