import { renderElement, type PartProps } from "@ui-sdk/react/primitive";
import type { JSX } from "react";

import { merge } from "./cx";

type Tag = keyof JSX.IntrinsicElements;

const plain = <T extends Tag>(tag: T, slot: string, base: string) => {
  const Plain = ({ render, className, ...props }: PartProps<T>) => {
    "use memo";

    return renderElement(tag, { ...props, className: merge(base, className), "data-slot": slot }, render);
  };
  Plain.displayName = `Plain(${slot})`;
  return Plain;
};

export { plain };
