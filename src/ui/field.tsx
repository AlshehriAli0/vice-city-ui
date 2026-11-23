import {
  Field as FieldRoot,
  FieldDescription as FieldDescriptionRoot,
  FieldError as FieldErrorRoot,
  FieldGroup as FieldGroupRoot,
  FieldLabel as FieldLabelRoot,
  FieldLegend as FieldLegendRoot,
  FieldSet as FieldSetRoot,
} from "@ui-sdk/react/field";
import type { ComponentProps } from "react";

import { cx, merge, styled } from "./cx";

import "./ui.css";
import "./field.css";

type FieldProps = ComponentProps<typeof FieldRoot> & {
  layout?: "row" | "stack" | "choice";
};

const Field = ({ className, layout = "row", ...props }: FieldProps) => (
  <FieldRoot {...props} className={merge("vc-field", className)} data-layout={layout} />
);

const FieldLabel = styled(FieldLabelRoot, "vc-label");
const FieldDescription = styled(FieldDescriptionRoot, "vc-description");
const FieldError = styled(FieldErrorRoot, "vc-error");
const FieldSet = styled(FieldSetRoot, "vc-fieldset");
const FieldLegend = styled(FieldLegendRoot, "vc-legend");
const FieldGroup = styled(FieldGroupRoot, "vc-field-group");

const FieldList = ({ className, ...props }: ComponentProps<"div">) => (
  <div {...props} className={cx("vc-list vc-stagger", className)} />
);

const FieldListTitle = ({ className, ...props }: ComponentProps<"p">) => (
  <p {...props} className={cx("vc-list__title", className)} />
);

export {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldList,
  FieldListTitle,
  FieldSet,
};
export type { FieldProps };
