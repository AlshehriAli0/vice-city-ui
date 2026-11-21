import {
  ScrollArea as ScrollAreaRoot,
  ScrollAreaContent as ScrollAreaContentRoot,
  ScrollAreaCorner,
  ScrollAreaScrollbar as ScrollAreaScrollbarRoot,
  ScrollAreaThumb as ScrollAreaThumbRoot,
  ScrollAreaViewport as ScrollAreaViewportRoot,
} from "@ui-sdk/react/scroll-area"
import { styled } from "./cx"
import "./base.css"
import "./scroll-area.css"

const ScrollArea = styled(ScrollAreaRoot, "vc-scroll")
const ScrollAreaViewport = styled(ScrollAreaViewportRoot, "vc-scroll__viewport")
const ScrollAreaContent = styled(ScrollAreaContentRoot, "vc-scroll__content")
const ScrollAreaScrollbar = styled(ScrollAreaScrollbarRoot, "vc-scroll__bar")
const ScrollAreaThumb = styled(ScrollAreaThumbRoot, "vc-scroll__thumb")

export { ScrollArea, ScrollAreaContent, ScrollAreaCorner, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport }
