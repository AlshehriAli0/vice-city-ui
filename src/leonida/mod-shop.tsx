import { Button } from "@ui-sdk/react/button";
import { Radio, RadioGroup } from "@ui-sdk/react/radio";
import { useShortcut } from "@ui-sdk/react/shortcuts";
import { Tabs, TabsPanel } from "@ui-sdk/react/tabs";
import { useRef, useState, type KeyboardEvent, type ReactElement } from "react";

import { ButtonPrompt, ButtonPrompts, PadGlyph } from "./button-prompt";
import { GameScreen } from "./game-screen";
import { BUILDS, PAINT_TYPES, SECTIONS } from "./mod-shop.data";
import { BuckMeIcon, PriceRow, ShopCar, StatPanel, Status, WalletIcon, money } from "./mod-shop.parts";
import { useModShop, type ModShopProps, type ModShopState } from "./mod-shop.state";
import { FamilyTabs, SwatchStrip } from "./mod-shop.strip";
import { FAMILIES } from "./mod-shop.swatches";
import { DpadGlyph } from "./phone-icons";
import { useAnnouncement } from "./use-announcement";

import "./mod-shop.css";

const VIEWS = ["Front three-quarter", "Side", "Front"];

function Wallet({ cash, buckme }: { cash: number; buckme: number }): ReactElement {
  return (
    <dl className="ld-shop__wallet" aria-label="Balance">
      <div>
        <dt className="ld-sr">BuckMe</dt>
        <dd>
          {money(buckme)}
          <BuckMeIcon />
        </dd>
      </div>
      <div>
        <dt className="ld-sr">Cash</dt>
        <dd>
          {money(cash)}
          <WalletIcon />
        </dd>
      </div>
    </dl>
  );
}

function Respray({ shop }: { shop: ModShopState }): ReactElement {
  const { family, swatch, type, item, owned, short } = shop;
  return (
    <>
      <div className="ld-shop__item">
        {!owned && <PriceRow price={item.price} pay={item.pay} short={short} />}
        <p className="ld-shop__name">{swatch.label}</p>
        <p className="ld-shop__type">
          <DpadGlyph axis="vertical" />
          {type.label}
        </p>
      </div>
      <Tabs className="ld-shop__families" value={family.value} onValueChange={shop.changeFamily}>
        {FAMILIES.map(entry => (
          <TabsPanel key={entry.value} value={entry.value} className="ld-shop__panel">
            {entry === family && (
              <SwatchStrip
                family={entry}
                value={swatch.value}
                onValueChange={shop.changeSwatch}
                appliedSwatch={shop.appliedSwatch}
                counted={shop.counted}
                onPaintStep={shop.stepPaint}
                onBuy={shop.buy}
                focusOnMount={shop.refocus}
              />
            )}
          </TabsPanel>
        ))}
        <div className="ld-shop__tabbar">
          <Button className="ld-shop__bumper" aria-label="Previous family" onClick={() => shop.bump(-1)}>
            <PadGlyph glyph="L1" />
          </Button>
          <FamilyTabs family={family.value} />
          <Button className="ld-shop__bumper" aria-label="Next family" onClick={() => shop.bump(1)}>
            <PadGlyph glyph="R1" />
          </Button>
        </div>
      </Tabs>
    </>
  );
}

function FullKits({ shop }: { shop: ModShopState }): ReactElement {
  const { build, item, owned, short } = shop;
  const onKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") shop.buy();
  };
  return (
    <div className="ld-shop__item" data-kind="build">
      <span className="ld-shop__chip">Exclusive</span>
      {!owned && <PriceRow price={item.price} was={build.was} pay={item.pay} short={short} />}
      <RadioGroup
        className="ld-shop__builds"
        aria-label="Full kit"
        value={build.value}
        onValueChange={next => next && shop.changeBuild(next)}
        onKeyDownCapture={onKeyDownCapture}
      >
        {BUILDS.map(entry => (
          <Radio key={entry.value} value={entry.value} className="ld-shop__build">
            {entry.label}
          </Radio>
        ))}
      </RadioGroup>
      <p className="ld-shop__desc">{build.description}</p>
      <p className="ld-shop__step">
        <DpadGlyph axis="horizontal" />
        {BUILDS.indexOf(build) + 1}
        <span>/</span>
        {BUILDS.length}
      </p>
    </div>
  );
}

function Vehicle({ shop, view, onView }: { shop: ModShopState; view: number; onView: () => void }): ReactElement {
  return (
    <section className="ld-shop__vehicle" aria-label="Vehicle">
      <Button className="ld-shop__camera" aria-label={`Camera view, ${VIEWS[view]}`} onClick={onView}>
        {VIEWS.map((name, at) => (
          <span key={name} className="ld-shop__dot" data-active={at === view || undefined} />
        ))}
        <span className="ld-shop__stick">R</span>
      </Button>
      <div className="ld-shop__card">
        <p className="ld-shop__make">Grotti</p>
        <p className="ld-shop__model">{"Jason's Cheetah"}</p>
      </div>
      {!shop.respray && <StatPanel current={shop.appliedBuild} preview={shop.build} />}
    </section>
  );
}

function Prompts({ shop, onBack }: { shop: ModShopState; onBack?: () => void }): ReactElement {
  const { item, owned, short } = shop;
  return (
    <ButtonPrompts label="Mod shop prompts">
      {shop.respray && (
        <ButtonPrompt className="ld-shop__paint-prompt" onClick={shop.stepPaint}>
          <span className="ld-prompt__label">
            Paint type ({shop.typeIndex + 1}/{PAINT_TYPES.length})
          </span>
          <DpadGlyph axis="vertical" />
        </ButtonPrompt>
      )}
      <ButtonPrompt
        glyph="cross"
        onClick={shop.buy}
        muted={owned || short}
        disabled={owned || short}
        focusableWhenDisabled
        data-agent-confirm={`Spends ${money(item.price)} on ${item.label}`}
      >
        Buy
      </ButtonPrompt>
      <ButtonPrompt glyph="circle" onClick={() => onBack?.()}>
        Back
      </ButtonPrompt>
    </ButtonPrompts>
  );
}

function ModShop(props: ModShopProps): ReactElement {
  const root = useRef<HTMLDivElement>(null);
  const shop = useModShop(props);
  const [view, setView] = useState(0);
  const meta = SECTIONS.find(entry => entry.value === shop.section) ?? SECTIONS[0];
  useAnnouncement(shop.announcement);

  const inside = () => Boolean(root.current?.contains(document.activeElement));
  useShortcut("q", () => shop.bump(-1), { when: () => shop.respray && inside(), description: "Previous family (L1)" });
  useShortcut("e", () => shop.bump(1), { when: () => shop.respray && inside(), description: "Next family (R1)" });
  useShortcut("backspace", () => props.onBack?.(), { when: inside, description: "Back (Circle)" });

  return (
    <div ref={root} className="ld-shop-root">
      <GameScreen className="ld-shop" data-section={shop.section} role="region" aria-label="Coastal Auto Care">
        <div className="ld-shop__garage" aria-hidden="true" />
        <ShopCar key={shop.section} paint={shop.item.color} metallic={shop.item.metallic} view={view} />
        <div className="ld-shop__vignette" aria-hidden="true" />
        <header className="ld-shop__crumb">
          <p className="ld-shop__parent">{meta.parent} /</p>
          <h2 className="ld-shop__title">{meta.label}</h2>
        </header>
        <Wallet cash={shop.cash} buckme={shop.buckme} />
        {shop.respray ? <Respray shop={shop} /> : <FullKits shop={shop} />}
        <Status owned={shop.owned} short={shop.short} />
        <Vehicle shop={shop} view={view} onView={() => setView(now => (now + 1) % VIEWS.length)} />
        <Prompts shop={shop} onBack={props.onBack} />
      </GameScreen>
    </div>
  );
}

export { ModShop };
export type { ModShopProps, Purchase } from "./mod-shop.state";
