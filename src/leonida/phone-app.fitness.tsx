import { Eye, Hourglass, Heart, Zap } from "lucide-react";
import type { ReactElement } from "react";

import { cssVariables } from "../ui/css-variables";
import { App, AppHeader, AppMenu, Face, Scroll } from "./phone-app.parts";
import { ownerFace, usePhone } from "./phone-data";
import { PhoneMenuItem } from "./phone-menu";

type Skill = {
  id: string;
  title: string;
  accent: string;
  level: number;
  ring: number;
  glyph: "heart" | "bolt" | "eye";
  window?: number;
};

const SKILLS: Skill[] = [
  { id: "strength", title: "Strength Workout", accent: "#e58ac8", level: 1, ring: 0.32, glyph: "heart", window: 0.24 },
  { id: "cardio", title: "Cardio Workout", accent: "#7fe0cf", level: 2, ring: 0.62, glyph: "bolt", window: 0.88 },
  { id: "focus", title: "Focus", accent: "#9b7bf0", level: 1, ring: 0.38, glyph: "eye" },
];

function SkillGlyph({ glyph }: { glyph: Skill["glyph"] }): ReactElement {
  if (glyph === "heart") return <Heart fill="currentColor" strokeWidth={0} />;
  if (glyph === "bolt") return <Zap fill="currentColor" strokeWidth={0} />;
  return <Eye />;
}

function Ring({ value, glyph }: { value: number; glyph: Skill["glyph"] }): ReactElement {
  return (
    <span className="ld-ring" aria-hidden="true">
      <svg aria-hidden="true" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="18" pathLength="100" className="ld-ring__track" />
        <circle
          cx="22"
          cy="22"
          r="18"
          pathLength="100"
          className="ld-ring__fill"
          strokeDasharray={`${value * 100} 100`}
        />
      </svg>
      <SkillGlyph glyph={glyph} />
    </span>
  );
}

const BODY = [
  { id: "build", title: "Build", lines: ["Build summary", "Muscle placeholder", "Body fat placeholder"] },
  { id: "calories", title: "Calorie Balance", lines: ["Calorie summary placeholder"] },
];

function Fitness(): ReactElement {
  const { owner, go } = usePhone();
  return (
    <App screen="fitness" tone="dark">
      <Scroll>
        <header className="ld-fit__head">
          <span className="ld-app__lines">
            <b>{owner}</b>
            <small>Healthy</small>
          </span>
          <Face contact={ownerFace(owner)} />
        </header>
        <AppMenu label="Fitness" onOpen={id => go({ screen: "fitness-detail", param: id })}>
          <h3 className="ld-app__section">Fitness</h3>
          {SKILLS.map(skill => (
            <PhoneMenuItem
              key={skill.id}
              value={skill.id}
              className="ld-fit__card"
              data-kind="skill"
              aria-label={`${skill.title}, level ${skill.level} of 4`}
              style={cssVariables({ "--skill": skill.accent })}
            >
              <span className="ld-fit__top">
                <span className="ld-app__lines">
                  <b>{skill.title}</b>
                  <small>Level {skill.level}/4</small>
                </span>
                <Ring value={skill.ring} glyph={skill.glyph} />
              </span>
              {skill.window !== undefined && (
                <span className="ld-fit__window">
                  <small>Workout window</small>
                  <Hourglass aria-hidden="true" />
                  <i style={cssVariables({ "--p": skill.window })} />
                </span>
              )}
            </PhoneMenuItem>
          ))}
          <h3 className="ld-app__section">Body &amp; Nutrition</h3>
          {BODY.map(card => (
            <PhoneMenuItem key={card.id} value={card.id} className="ld-fit__card" aria-label={card.title}>
              <span className="ld-app__lines">
                <b>{card.title}</b>
                {card.lines.map(line => (
                  <small key={line}>{line}</small>
                ))}
              </span>
            </PhoneMenuItem>
          ))}
        </AppMenu>
      </Scroll>
    </App>
  );
}

function FitnessDetail(): ReactElement {
  const { entry } = usePhone();
  const skill = SKILLS.find(item => item.id === entry.param);
  const title = skill?.title ?? BODY.find(item => item.id === entry.param)?.title ?? "Fitness";
  return (
    <App screen="fitness-detail" tone="dark">
      <AppHeader
        title={title}
        tone="dark"
        end={
          skill && (
            <span style={{ color: skill.accent }}>
              <SkillGlyph glyph={skill.glyph} />
            </span>
          )
        }
      />
      <Scroll className="ld-fit__detail">
        <p>
          Placeholder text about this skill. <strong>Keyword</strong> in bold, then a line on how it{" "}
          <strong>levels up</strong>.
        </p>
        <p>
          A second paragraph of placeholder copy with one more <strong>keyword</strong>.
        </p>
      </Scroll>
    </App>
  );
}

export { Fitness, FitnessDetail };
