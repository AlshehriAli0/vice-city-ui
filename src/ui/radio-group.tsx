import {
  Radio as RadioRoot,
  RadioGroup as RadioGroupRoot,
  RadioIndicator as RadioIndicatorRoot,
} from "@ui-sdk/react/radio";
import { createContext, use, useId, useState, type ComponentProps } from "react";

import { attachPartRefs } from "./attach-part-refs";
import { cx, merge, styled } from "./cx";

import "./ui.css";
import "./radio-group.css";

type RadioGroupProps = ComponentProps<typeof RadioGroupRoot> & { variant?: "stacked" | "inline" | "cards" };

const RadioGroup = ({ variant = "stacked", className, ...props }: RadioGroupProps) => (
  <RadioGroupRoot {...props} className={merge("vc-radios", className)} data-variant={variant} />
);

type ItemContext = { id: string; setDescribed: (described: boolean) => void };

const RadioItemContext = createContext<ItemContext | null>(null);
const RadioItemDescribedContext = createContext(false);

const RadioItem = ({ className, htmlFor, ...props }: ComponentProps<"label">) => {
  const id = useId();
  const [described, setDescribed] = useState(false);

  return (
    <RadioItemContext value={{ id, setDescribed }}>
      <RadioItemDescribedContext value={described}>
        <label {...props} htmlFor={htmlFor} className={cx("vc-radio-item", className)} />
      </RadioItemDescribedContext>
    </RadioItemContext>
  );
};

const Radio = ({ className, ...props }: ComponentProps<typeof RadioRoot>) => {
  const item = use(RadioItemContext);
  const described = use(RadioItemDescribedContext);

  return (
    <RadioRoot
      aria-labelledby={item ? `${item.id}-label` : undefined}
      aria-describedby={item && described ? `${item.id}-hint` : undefined}
      {...props}
      className={merge("vc-radio", className)}
    />
  );
};

const RadioIndicator = styled(RadioIndicatorRoot, "vc-radio__dot");

const RadioItemText = ({ className, ...props }: ComponentProps<"span">) => (
  <span {...props} className={cx("vc-radio-item__text", className)} />
);

const RadioItemLabel = ({ className, ...props }: ComponentProps<"span">) => {
  const item = use(RadioItemContext);
  return (
    <span id={item ? `${item.id}-label` : undefined} {...props} className={cx("vc-radio-item__label", className)} />
  );
};

const RadioItemDescription = ({ className, ref, ...props }: ComponentProps<"span">) => {
  const item = use(RadioItemContext);
  const setDescribed = item?.setDescribed;
  const describe = (node: HTMLSpanElement | null) => setDescribed?.(node !== null);
  const attach = (node: HTMLSpanElement | null) => attachPartRefs(node, ref ?? null, describe);

  return (
    <span
      id={item ? `${item.id}-hint` : undefined}
      {...props}
      ref={attach}
      className={cx("vc-radio-item__hint", className)}
    />
  );
};

const RadioItemMeta = ({ className, ...props }: ComponentProps<"span">) => (
  <span {...props} className={cx("vc-radio-item__meta", className)} />
);

const RadioItemMedia = ({ className, ...props }: ComponentProps<"span">) => (
  <span aria-hidden="true" {...props} className={cx("vc-radio-item__media", className)} />
);

export {
  Radio,
  RadioGroup,
  RadioIndicator,
  RadioItem,
  RadioItemDescription,
  RadioItemLabel,
  RadioItemMedia,
  RadioItemMeta,
  RadioItemText,
};
export type { RadioGroupProps };
