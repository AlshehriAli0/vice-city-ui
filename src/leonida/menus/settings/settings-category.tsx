import type { CSSProperties } from "react";

import { cssVariables } from "../../../shared/css-variables";
import type { Category, Row, Value } from "./categories";
import { SettingsCycle } from "./settings-cycle";
import { SettingsList } from "./settings-list";
import { SettingsRadio, SettingsRadioGroup, SettingsSection, SettingsSlider, SettingsSwitch } from "./settings-rows";

type Change = (id: string, value: Value) => void;

const SettingRow = ({
  row,
  value,
  onChange,
  style,
}: {
  row: Row;
  value: Value;
  onChange: Change;
  style: CSSProperties;
}) => {
  const common = { id: row.id, label: row.label, disabled: row.disabled, style };
  if (row.kind === "toggle")
    return (
      <SettingsSwitch
        {...common}
        checked={typeof value === "boolean" ? value : row.start}
        onCheckedChange={next => onChange(row.id, next)}
      />
    );
  if (row.kind === "slider")
    return (
      <SettingsSlider
        {...common}
        value={typeof value === "number" ? value : row.start}
        min={row.min ?? 0}
        max={row.max ?? 10}
        onValueChange={next => onChange(row.id, next)}
      />
    );
  return (
    <SettingsCycle
      {...common}
      options={row.options}
      value={typeof value === "string" ? value : row.start}
      onValueChange={next => onChange(row.id, next)}
    />
  );
};

type SettingsCategoryProps = {
  category: Category;
  active: string | null;
  onActiveChange: (key: string | null) => void;
  values: Record<string, Value>;
  change: Change;
};

const sectionOffsets = (category: Category): number[] => {
  const offsets: number[] = [];
  let index = 0;
  for (const section of category.sections) {
    offsets.push(index);
    index += 1 + ("radio" in section ? section.radio.options.length : section.rows.length);
  }
  return offsets;
};

const choiceValue = (value: Value, fallback: string): string => (typeof value === "string" ? value : fallback);

const SettingsCategory = ({ category, active, onActiveChange, values, change }: SettingsCategoryProps) => {
  const offsets = sectionOffsets(category);
  const stagger = (index: number) => cssVariables({ "--i": Math.min(index, 12) });
  return (
    <SettingsList value={active} onValueChange={onActiveChange}>
      {category.sections.map((section, sectionIndex) => (
        <SettingsSection key={section.title} title={section.title} style={stagger(offsets[sectionIndex])}>
          {"radio" in section ? (
            <SettingsRadioGroup
              id={section.radio.id}
              label={section.radio.label}
              value={choiceValue(values[section.radio.id], section.radio.start)}
              onValueChange={next => change(section.radio.id, next)}
            >
              {section.radio.options.map((choice, index) => (
                <SettingsRadio
                  key={choice.value}
                  value={choice.value}
                  style={stagger(offsets[sectionIndex] + index + 1)}
                >
                  {choice.label}
                </SettingsRadio>
              ))}
            </SettingsRadioGroup>
          ) : (
            section.rows.map((row, index) => (
              <SettingRow
                key={row.id}
                row={row}
                value={values[row.id]}
                onChange={change}
                style={stagger(offsets[sectionIndex] + index + 1)}
              />
            ))
          )}
        </SettingsSection>
      ))}
    </SettingsList>
  );
};

export { SettingsCategory };
export type { Change };
