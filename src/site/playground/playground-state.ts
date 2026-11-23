import { useState } from "react";

import type { Demo, Playground, Value, Values } from "../../gallery/demo";

type PlaygroundState = Playground & {
  fire: (name: string) => void;
  apply: (values: Values) => void;
  reset: () => void;
};

const noop = () => {};

const staticPlayground = (demo: Pick<Demo, "defaults">): Playground => ({
  values: { ...demo.defaults },
  set: noop,
  subscribeAction: () => noop,
});

const createActions = () => {
  const subscriptions = new Map<string, Set<() => void>>();

  return {
    subscribeAction: (name: string, run: () => void) => {
      const listeners = subscriptions.get(name) ?? new Set<() => void>();
      listeners.add(run);
      subscriptions.set(name, listeners);
      return () => {
        listeners.delete(run);
        if (listeners.size === 0) subscriptions.delete(name);
      };
    },
    fire: (name: string) => {
      subscriptions.get(name)?.forEach(run => run());
    },
  };
};

const usePlayground = (demo: Demo): PlaygroundState => {
  const [values, setValues] = useState<Values>(() => ({ ...demo.defaults }));
  const [actions] = useState(createActions);

  const set = (name: string, value: Value) => {
    setValues(all => {
      if (all[name] === value) return all;
      return demo.update?.(all, name, value) ?? { ...all, [name]: value };
    });
  };

  return {
    ...actions,
    values,
    set,
    apply: preset => setValues({ ...demo.defaults, ...preset }),
    reset: () => setValues({ ...demo.defaults }),
  };
};

export { staticPlayground, usePlayground };
export type { PlaygroundState };
