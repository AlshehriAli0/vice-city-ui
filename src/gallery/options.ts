import type { Value } from "./types";

const options = <T extends string>(...pairs: [T, string][]): { value: T; label: string }[] =>
  pairs.map(([value, label]) => ({ value, label }));

const optionValue = <T extends string>(value: Value | undefined, choices: readonly { value: T }[]): T | undefined =>
  choices.find(choice => choice.value === value)?.value;

export { options, optionValue };
