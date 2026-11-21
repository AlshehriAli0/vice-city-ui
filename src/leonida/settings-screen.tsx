import { Button } from "@ui-sdk/react/button";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";
import { useState, type ReactElement } from "react";

import { ButtonPrompt, ButtonPrompts, PadGlyph } from "./button-prompt";
import { FormattedText } from "./formatted-text";
import { GameScreen } from "./game-screen";
import { SettingsCategory, type Change } from "./settings-category";
import { CATEGORIES, defaults, type Category, type Preview, type Value } from "./settings-screen.data";
import { Controller, Legend, PreviewArt } from "./settings-screen.previews";

import "./settings-screen.css";

type Detail = { key: string; id: string; label: string; info: string; preview?: Preview };

function details(category: Category): Detail[] {
  return category.sections.flatMap(section =>
    "radio" in section
      ? section.radio.options.map(choice => ({
          key: `${section.radio.id}:${choice.value}`,
          id: section.radio.id,
          label: choice.label,
          info: section.radio.info,
          preview: section.radio.preview,
        }))
      : section.rows.map(row => ({ key: row.id, id: row.id, label: row.label, info: row.info, preview: row.preview }))
  );
}

const paragraphsWithPositions = (text: string) => {
  let offset = 0;
  return text.split("\n\n").map(paragraph => {
    const position = offset;
    offset += paragraph.length + 2;
    return { paragraph, position };
  });
};

function SettingsText({ text }: { text: string }): ReactElement {
  return (
    <>
      {paragraphsWithPositions(text).map(({ paragraph, position }) => (
        <p key={position}>
          <FormattedText text={paragraph} emphasis="strong" />
        </p>
      ))}
    </>
  );
}

type SettingsScreenProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onBack?: () => void;
};

const INITIAL_VALUES = defaults();

function SettingsScreen({
  value,
  defaultValue = "controller",
  onValueChange,
  onBack,
}: SettingsScreenProps): ReactElement {
  const [ownTab, setOwnTab] = useState(defaultValue);
  const tab = value ?? ownTab;
  const [values, setValues] = useState<Record<string, Value>>(defaults);
  const category = CATEGORIES.find(item => item.value === tab) ?? CATEGORIES[0];
  const at = CATEGORIES.indexOf(category);
  const rows = details(category);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const active = rows.find(row => row.key === activeKey) ?? rows.at(0);
  const index = active ? rows.indexOf(active) : -1;

  const change: Change = (id, next) =>
    setValues(current => (current[id] === next ? current : { ...current, [id]: next }));

  const select = (next: string) => {
    setOwnTab(next);
    setActiveKey(null);
    onValueChange?.(next);
  };
  const bump = (by: number) => select(CATEGORIES[(at + by + CATEGORIES.length) % CATEGORIES.length].value);

  const activeId = active?.id ?? "";
  const isDefault = values[activeId] === INITIAL_VALUES[activeId];
  const scheme = tab === "scheme";
  const schemeTitle =
    CATEGORIES[0].sections
      .flatMap(section => ("radio" in section ? section.radio.options : []))
      .find(choice => choice.value === values["scheme-preview"])?.label ?? "";

  return (
    <GameScreen className="ld-set" data-tab={tab}>
      <img className="ld-set__palms" src="/vc/ui-palms.webp" alt="" aria-hidden="true" />
      <p className="ld-set__title" aria-hidden="true">
        Settings
      </p>
      <Tabs className="ld-set__tabs" value={tab} onValueChange={next => next && select(next)}>
        <div className="ld-set__strip">
          <Button className="ld-set__bumper" aria-label="Previous category" onClick={() => bump(-1)}>
            <PadGlyph glyph="L1" />
          </Button>
          <div className="ld-set__clip">
            <TabsList className="ld-set__chips" aria-label="Settings categories">
              {CATEGORIES.map(item => (
                <TabsTab key={item.value} value={item.value} className="ld-set__chip">
                  {item.label}
                </TabsTab>
              ))}
            </TabsList>
            <span className="ld-set__chip" aria-hidden="true">
              Account
            </span>
          </div>
          <Button className="ld-set__bumper" aria-label="Next category" onClick={() => bump(1)}>
            <PadGlyph glyph="R1" />
          </Button>
        </div>
        {CATEGORIES.map(item =>
          item === category ? (
            <TabsPanel key={item.value} value={item.value} className="ld-set__panel">
              <SettingsCategory
                category={item}
                active={active?.key ?? null}
                onActiveChange={setActiveKey}
                values={values}
                change={change}
              />
              <p className="ld-set__count" aria-hidden="true" hidden={!active}>
                <b>{index + 1}</b> <i>/</i> {rows.length}
              </p>
            </TabsPanel>
          ) : (
            <TabsPanel key={item.value} value={item.value} />
          )
        )}
      </Tabs>

      <aside key={tab} className="ld-set__detail" aria-live="polite">
        {active && scheme && <Controller title={schemeTitle} />}
        {active && !scheme && (
          <>
            <h2 className="ld-set__detail-title">{active.label}</h2>
            {active.preview && active.preview !== "legend" && (
              <div className="ld-set__preview">
                <PreviewArt kind={active.preview} value={String(values[activeId])} />
              </div>
            )}
            <div className="ld-set__desc">
              <SettingsText text={active.info} />
            </div>
            {active.preview === "legend" && <Legend />}
          </>
        )}
      </aside>

      <ButtonPrompts label="Settings prompts">
        <ButtonPrompt glyph="triangle" onClick={() => setValues(defaults())}>
          Restore All
        </ButtonPrompt>
        <ButtonPrompt
          glyph="square"
          muted={isDefault}
          disabled={isDefault}
          onClick={() => change(activeId, INITIAL_VALUES[activeId])}
        >
          Restore Default
        </ButtonPrompt>
        <ButtonPrompt glyph="circle" onClick={() => onBack?.()}>
          Back
        </ButtonPrompt>
      </ButtonPrompts>
    </GameScreen>
  );
}

export { SettingsList } from "./settings-list";
export { SettingsCycle } from "./settings-cycle";
export { SettingsRadio, SettingsRadioGroup, SettingsSection, SettingsSlider, SettingsSwitch } from "./settings-rows";
export { SettingsScreen };
export type { SettingsListProps } from "./settings-list";
export type { SettingsScreenProps };
