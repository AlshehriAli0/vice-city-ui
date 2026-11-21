import {
  HoverCard,
  HoverCardArrow,
  HoverCardContent as HoverCardContentRoot,
  HoverCardTrigger as HoverCardTriggerRoot,
} from "@ui-sdk/react/hover-card"
import type { ComponentProps, ReactElement, ReactNode } from "react"
import { merge, styled } from "./cx"
import "./base.css"
import "./hover-card.css"

const HoverCardTrigger = styled(HoverCardTriggerRoot, "vc-hovercard-trigger")

type HoverCardContentProps = Omit<ComponentProps<typeof HoverCardContentRoot>, "children"> & { children?: ReactNode }

function HoverCardContent({ className, children, sideOffset = 10, ...props }: HoverCardContentProps): ReactElement {
  return (
    <HoverCardContentRoot {...props} sideOffset={sideOffset} className={merge("vc-hovercard vc-surface", className)}>
      <HoverCardArrow className="vc-arrow" />
      {children}
    </HoverCardContentRoot>
  )
}

export { HoverCard, HoverCardContent, HoverCardTrigger }
