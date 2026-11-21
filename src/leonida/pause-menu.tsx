import { Button } from "@ui-sdk/react/button"
import { Toolbar, ToolbarButton } from "@ui-sdk/react/toolbar"
import { Camera, CircleQuestionMark, Map, Save, SlidersVertical, Tag, type LucideIcon } from "lucide-react"
import { useEffect, useState, type CSSProperties, type ReactElement } from "react"
import { ButtonPrompt, ButtonPrompts } from "./button-prompt"
import { GameScreen } from "./game-screen"
import "./pause-menu.css"

type Row = { value: string; label: string; Icon: LucideIcon }

const ROWS: Row[] = [
  { value: "map", label: "Map", Icon: Map },
  { value: "game", label: "Game", Icon: Save },
  { value: "store", label: "Store", Icon: Tag },
  { value: "help", label: "Help", Icon: CircleQuestionMark },
  { value: "photo", label: "Photo Studio", Icon: Camera },
  { value: "settings", label: "Settings", Icon: SlidersVertical },
]

type PauseMenuProps = {
  // The row with the bar: the one focused last.
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  chapter?: string
  title?: string
  // Select (×, Enter, Space or a click) on a row.
  onSelect?: (value: string) => void
  onAction?: (action: "retry" | "restart") => void
  // Back: the menu fades out, then this runs once the game would be back.
  onResume?: () => void
  // Rows with something new get the yellow dot.
  badges?: string[]
}

/* The world behind the menu: a neutral CSS scene, blurred, split and vignetted. Not a screenshot. */
function World(): ReactElement {
  return (
    <div className="ld-pause__world" aria-hidden="true">
      <div className="ld-pause__sky" />
      <div className="ld-pause__lights">
        <i data-l="1" />
        <i data-l="2" />
        <i data-l="3" />
        <i data-l="4" />
        <i data-l="5" />
      </div>
    </div>
  )
}

function Status({ chapter, title, onAction }: Pick<PauseMenuProps, "chapter" | "title" | "onAction">): ReactElement {
  return (
    <div className="ld-pause__status">
      <p className="ld-pause__chapter">{chapter}</p>
      <h2 className="ld-pause__title">{title}</h2>
      <div className="ld-pause__actions" role="group" aria-label="Mission">
        <Button className="ld-pause__action" onClick={() => onAction?.("retry")}>
          Retry Checkpoint
        </Button>
        <Button className="ld-pause__action" onClick={() => onAction?.("restart")}>
          Restart Mission
        </Button>
      </div>
    </div>
  )
}

function PauseMenu({
  value,
  defaultValue = "map",
  onValueChange,
  chapter = "Chapter 1",
  title = "Mission Title",
  onSelect,
  onAction,
  onResume,
  badges = [],
}: PauseMenuProps): ReactElement {
  const [ownValue, setOwnValue] = useState(defaultValue)
  const [closing, setClosing] = useState(false)
  const current = value ?? ownValue

  useEffect(() => {
    if (!closing) return
    // Panel fades over 130ms, then the game cuts back about 470ms later.
    const timer = setTimeout(() => onResume?.(), 600)
    return () => clearTimeout(timer)
  }, [closing, onResume])

  const point = (next: string) => {
    if (next === current) return
    setOwnValue(next)
    onValueChange?.(next)
  }

  return (
    <GameScreen className="ld-pause" data-closing={closing || undefined}>
      <World />
      <div className="ld-pause__body">
        <div className="ld-pause__panel">
          <span className="ld-pause__mark" aria-hidden="true">
            VC
          </span>
          <Toolbar className="ld-pause__list" orientation="vertical" aria-label="Pause menu">
            {ROWS.map(({ value: row, label, Icon }, index) => (
              <ToolbarButton
                key={row}
                className="ld-pause__row"
                data-current={row === current || undefined}
                style={{ "--i": index } as CSSProperties}
                onFocus={() => point(row)}
                onClick={() => onSelect?.(row)}
              >
                <span className="ld-pause__icon" data-icon={row} aria-hidden="true">
                  <Icon absoluteStrokeWidth strokeWidth={2.4} />
                  {badges.includes(row) && <span className="ld-pause__badge" />}
                </span>
                {label}
              </ToolbarButton>
            ))}
          </Toolbar>
        </div>
        <div className="ld-pause__right">
          <Status chapter={chapter} title={title} onAction={onAction} />
        </div>
      </div>
      <ButtonPrompts label="Pause menu prompts">
        <ButtonPrompt glyph="square" onClick={() => onSelect?.("photo")}>
          Photo Studio
        </ButtonPrompt>
        <ButtonPrompt glyph="cross" onClick={() => onSelect?.(current)}>
          Select
        </ButtonPrompt>
        <ButtonPrompt glyph="circle" onClick={() => setClosing(true)}>
          Back
        </ButtonPrompt>
      </ButtonPrompts>
    </GameScreen>
  )
}

export { PauseMenu, ROWS as PAUSE_ROWS }
export type { PauseMenuProps }
