import type { Ref } from "react";

const attach = <T>(node: T, ref: Ref<T>): (() => void) | undefined => {
  if (!ref) return undefined;

  if (typeof ref === "function") {
    return (
      ref(node) ??
      (() => {
        ref(null);
      })
    );
  }

  ref.current = node;
  return () => {
    ref.current = null;
  };
};

export const attachPartRefs = <T>(node: T | null, first: Ref<T>, second: Ref<T>): (() => void) | undefined => {
  if (node === null) return undefined;

  const clearFirst = attach(node, first);
  const clearSecond = attach(node, second);
  return () => {
    clearFirst?.();
    clearSecond?.();
  };
};
