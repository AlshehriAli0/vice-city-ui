import { useEffect, useState, type ReactElement } from "react";

import { ButtonPrompt, ButtonPrompts } from "../leonida/button-prompt";
import { HelpBox, HelpButton, HelpEvidence, HelpStar } from "../leonida/hint-tooltip";
import { HudFeed, Objective, Subtitle } from "../leonida/hud-feed";
import { HudAmmo, HudCash, HudVitals } from "../leonida/hud-meters";
import { HudMinimap, TurnCard, type Blip } from "../leonida/hud-minimap";
import { HudStage } from "../leonida/hud-stage";
import { WantedEvidence, WantedEvidenceItem, WantedHud, WantedLevel, type WantedState } from "../leonida/wanted-level";
import { policeState, washOf } from "./hud-wanted";
import type { Playground } from "./types";
import { useAction } from "./use-action";
import { useFeed } from "./use-feed";

const BLIPS: Blip[] = [
  { id: "goal", bearing: 72, kind: "destination", label: "Destination" },
  { id: "store", bearing: 290, kind: "store", label: "Store" },
  { id: "car", bearing: 125, kind: "vehicle", label: "Your vehicle" },
];

function FullHudVitals({
  sprinting,
  subscribeAction,
}: {
  sprinting: boolean;
  subscribeAction: Playground["subscribeAction"];
}): ReactElement {
  const [health, setHealth] = useState(78);
  const [stamina, setStamina] = useState(100);
  const recovering = !sprinting && stamina < 100;

  useAction(subscribeAction, "damage", () => setHealth(value => Math.max(0, value - 18)));
  useAction(subscribeAction, "heal", () => setHealth(100));

  useEffect(() => {
    if (!sprinting && !recovering) return undefined;

    const timer = setInterval(() => {
      setStamina(value => (sprinting ? Math.max(0, value - 2) : Math.min(100, value + 4)));
    }, 100);
    return () => clearInterval(timer);
  }, [sprinting, recovering]);

  return (
    <div data-hud="vitals">
      <HudVitals
        health={health}
        stamina={stamina}
        focus={100}
        show={sprinting ? "stamina" : "all"}
        length={{ stamina: 128, focus: 118 }}
      />
    </div>
  );
}

function FullHudFeed({ subscribeAction }: { subscribeAction: Playground["subscribeAction"] }): ReactElement {
  const feed = useFeed("crime");
  useAction(subscribeAction, "feed", feed.push);
  return <HudFeed lines={feed.lines} onDone={feed.done} />;
}

function HudHelp({ profiled }: { profiled: boolean }): ReactElement {
  return (
    <div data-hud="help">
      {profiled ? (
        <HelpBox>
          Out of sight for now. Change your look <HelpEvidence items={["face", "clothing"]} /> and wait out the search{" "}
          <HelpStar />
        </HelpBox>
      ) : (
        <HelpBox>
          Hold <HelpButton glyph="L1" /> and press <HelpButton glyph="square" /> to heal.
        </HelpBox>
      )}
    </div>
  );
}

function HudStatus({ heat, state, profiled }: { heat: number; state: WantedState; profiled: boolean }): ReactElement {
  const wanted = heat > 0;
  return (
    <div data-hud="right">
      {wanted && (
        <WantedHud>
          <WantedLevel aria-label="Police heat" value={heat} state={state} readOnly />
          {profiled && (
            <WantedEvidence>
              <WantedEvidenceItem value="clothing" />
              <WantedEvidenceItem value="face" />
            </WantedEvidence>
          )}
        </WantedHud>
      )}
      <div className="hud-demo__money" data-wanted={wanted || undefined}>
        <HudCash wallet={407} bank={2480} />
      </div>
      <div className="hud-demo__ammo">
        <HudAmmo clip={12} reserve={48} />
      </div>
    </div>
  );
}

function DrivingTurnCard({ driving }: { driving: boolean }): ReactElement | null {
  const [feet, setFeet] = useState(448);

  useEffect(() => {
    if (!driving) return undefined;

    const timer = setInterval(() => setFeet(value => (value <= -200 ? 448 : value - 6)), 100);
    return () => clearInterval(timer);
  }, [driving]);

  if (!driving || feet <= 0) return null;
  return (
    <div className="hud-demo__turn">
      <TurnCard turn="right" distance={`${feet} ft`} />
    </div>
  );
}

function HudMissionObjective({ wanted }: { wanted: boolean }): ReactElement {
  if (wanted)
    return (
      <Objective>
        Leave the <em>search area</em>
      </Objective>
    );
  return (
    <Objective>
      Drive to the <em>marina</em>
    </Objective>
  );
}

function FullHud({ values, set, subscribeAction }: Playground): ReactElement {
  const heat = Number(values.heat);
  const state = policeState(values.police);
  const sprinting = Boolean(values.sprinting);
  const driving = Boolean(values.driving) && !sprinting;
  const profiled = heat > 0 && state !== "seen";

  return (
    <div className="hud-demo">
      <HudStage>
        <FullHudVitals sprinting={sprinting} subscribeAction={subscribeAction} />
        {!sprinting && <HudHelp profiled={profiled} />}
        <HudStatus heat={heat} state={state} profiled={profiled} />
        <FullHudFeed subscribeAction={subscribeAction} />
        <div data-hud="map">
          <DrivingTurnCard driving={driving} />
          <HudMinimap
            heading={driving ? 0 : 160}
            wash={washOf(heat, state)}
            route={driving ? "mission" : "none"}
            distance="0.69 mi"
            blips={BLIPS}
          />
        </div>
        <Subtitle speaker="Jason" color="#f0a040">
          Keep it steady. We don&apos;t want any more attention tonight.
        </Subtitle>
        <HudMissionObjective wanted={heat > 0} />
        {driving && (
          <div data-hud="prompts">
            <ButtonPrompts label="Vehicle prompts" stack>
              <ButtonPrompt glyph="triangle" onClick={() => set("driving", false)}>
                Exit vehicle
              </ButtonPrompt>
            </ButtonPrompts>
          </div>
        )}
      </HudStage>
    </div>
  );
}

export { FullHud };
