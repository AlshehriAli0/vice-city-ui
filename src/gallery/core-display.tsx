import { useState, type ReactElement } from "react"
import { Eye, Heart, Map as MapIcon, Save, SlidersVertical, Smartphone, Trash2, Zap } from "lucide-react"
import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from "../ui/accordion"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "../ui/alert"
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage, type AvatarProps } from "../ui/avatar"
import { Badge, BadgeDot, type BadgeProps } from "../ui/badge"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "../ui/breadcrumb"
import { Button } from "../ui/button"
import { Calendar } from "../ui/calendar"
import { Card, CardDescription, CardFooter, CardHeader, CardMedia, CardTitle, type CardProps } from "../ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogPrompt, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Switch } from "../ui/switch"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card"
import { Bumper, Glyph, Prompts } from "../ui/kbd"
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuContextTrigger,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuItemIcon,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "../ui/menu"
import { Meter, MeterIcon, MeterIndicator, MeterTrack } from "../ui/meter"
import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination"
import { Popover, PopoverClose, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "../ui/popover"
import { Progress, ProgressIcon, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue, type VitalTone } from "../ui/progress"
import { ScrollArea, ScrollAreaContent, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport } from "../ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetPrompt, SheetTitle, SheetTrigger } from "../ui/sheet"
import { Skeleton } from "../ui/skeleton"
import { Tabs, TabsBar, TabsList, TabsPanel, TabsTab, type TabsProps } from "../ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { ViceText } from "../ui/vice-text"
import { toast } from "../leonida/mission-toast"
import "./core-display.css"
import type { Demo, Playground, Value } from "./types"

type Side = "top" | "right" | "bottom" | "left"
type Align = "start" | "center" | "end"

const opts = (...list: [string, string][]) => list.map(([value, label]) => ({ value, label }))
const SIDES = opts(["top", "Top"], ["right", "Right"], ["bottom", "Bottom"], ["left", "Left"])
const ALIGNS = opts(["start", "Start"], ["center", "Center"], ["end", "End"])

// JSX props for a usage snippet, leaving out false, empty and default values.
function attrs(...list: [name: string, value: Value | undefined, fallback?: Value][]): string {
  return list
    .map(([name, value, fallback]) => {
      if (value === undefined || value === false || value === "" || value === fallback) return ""
      if (value === true) return ` ${name}`
      return typeof value === "number" ? ` ${name}={${value}}` : ` ${name}="${value}"`
    })
    .join("")
}

// Characters from the official pre-launch marketing only.
const CAST = [
  { id: "jason", name: "Jason Duval", place: "Leonida Keys", src: "/vc/art-jason.jpg", focus: "57% 0%", origin: "50% 28%", zoom: 2.3 },
  { id: "cal", name: "Cal Hampton", place: "Leonida Keys", src: "/vc/cut-cal.png", focus: "100% 0%", origin: "53% 24%", zoom: 3.2 },
  { id: "boobie", name: "Boobie Ike", place: "Vice City", src: "/vc/cut-boobie.png", focus: "100% 0%", origin: "51% 20%", zoom: 3.4 },
  { id: "raul", name: "Raul Bautista", place: "Vice City", src: "/vc/cut-raul.png", focus: "0% 0%", origin: "42% 20%", zoom: 3.4 },
]

const STATUS = { none: "", online: "Online", busy: "Busy", away: "Away", wanted: "Wanted" } as const

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function Portrait({ member, image = true, ...props }: { member: (typeof CAST)[number]; image?: boolean } & Omit<AvatarProps, "children">): ReactElement {
  return (
    <Avatar aria-label={member.name} {...props}>
      {image && <AvatarImage src={member.src} focus={member.focus} origin={member.origin} zoom={member.zoom} />}
      <AvatarFallback>{initials(member.name)}</AvatarFallback>
    </Avatar>
  )
}

/* Card */

function CardDemo({ values: v }: Playground): ReactElement {
  return (
    <div className="cd-center cd-center--card">
      <Card variant={v.variant as CardProps["variant"]} interactive={Boolean(v.interactive)} className="cd-card">
        {v.media && (
          <CardMedia ratio="4 / 3" focus="50% 60%">
            <img src="/vc/ue-grotti-cheetah.jpg" alt="" loading="lazy" />
          </CardMedia>
        )}
        <CardHeader>
          <CardTitle render={<h4 />}>{String(v.title)}</CardTitle>
          {v.description ? <CardDescription>{String(v.description)}</CardDescription> : null}
        </CardHeader>
        {v.footer && (
          <CardFooter>
            <Badge variant="outline">Owned</Badge>
            <Button size="sm" className="cd-push" onClick={() => toast("Waypoint set")}>
              Set waypoint
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

/* Vice text */

function ViceTextDemo({ values: v }: Playground): ReactElement {
  const text = String(v.text ?? "").trim() || "Your name"
  return (
    <div className="cd-vice">
      <ViceText className="cd-vice__text" style={{ fontSize: `min(${Number(v.size)}px, 30cqi)` }}>
        {text}
      </ViceText>
    </div>
  )
}

/* Badge */

function BadgeDemo({ values: v }: Playground): ReactElement {
  return (
    <div className="cd-list">
      <div className="cd-line">
        <span className="cd-line__main">
          Item name
          <small>Vice City</small>
        </span>
        <span className="cd-line__meta">
          <Badge variant={v.variant as BadgeProps["variant"]} tone={v.tone as BadgeProps["tone"]}>
            {v.dot && <BadgeDot />}
            {String(v.text)}
          </Badge>
        </span>
      </div>
    </div>
  )
}

/* Avatar */

function AvatarDemo({ values: v }: Playground): ReactElement {
  const size = v.size === "md" ? undefined : (v.size as AvatarProps["size"])
  const look = { shape: v.shape as AvatarProps["shape"], ring: v.ring as AvatarProps["ring"], image: Boolean(v.image) }
  if (v.group)
    return (
      <div className="cd-list cd-list--center">
        <AvatarGroup aria-label="Contacts" size={size}>
          {CAST.slice(0, 3).map((member) => (
            <Portrait key={member.id} member={member} {...look} />
          ))}
          <AvatarGroupCount aria-label={`${CAST.length - 3} more`}>+{CAST.length - 3}</AvatarGroupCount>
        </AvatarGroup>
      </div>
    )
  const member = CAST[0]
  const status = v.status === "none" ? undefined : (v.status as AvatarProps["status"])
  return (
    <div className="cd-list">
      <div className="cd-line" tabIndex={0}>
        <span className="cd-line__lead">
          <Portrait member={member} {...look} size={size} status={status} aria-label={status ? `${member.name}, ${status}` : member.name} />
          <span className="cd-line__main">
            {member.name}
            <small>{member.place}</small>
          </span>
        </span>
        <span className="cd-line__meta">{STATUS[v.status as keyof typeof STATUS]}</span>
      </div>
    </div>
  )
}

/* Alert */

function AlertDemo({ values: v }: Playground): ReactElement {
  return (
    <div className="cd-stack">
      <Alert tone={v.tone as "info"}>
        <AlertTitle>{String(v.title)}</AlertTitle>
        {v.description ? <AlertDescription>{String(v.description)}</AlertDescription> : null}
        {v.action && (
          <AlertAction>
            <Button size="sm" variant="outline" onClick={() => toast("Retrying")}>
              Retry
            </Button>
          </AlertAction>
        )}
      </Alert>
    </div>
  )
}

/* Tabs */

const TABS = opts(["map", "Map"], ["brief", "Brief"], ["progress", "Progress"])

function TabsDemo({ values: v, set }: Playground): ReactElement {
  return (
    <div className="cd-stack cd-stack--plum">
      <Tabs variant={v.variant as TabsProps["variant"]} value={String(v.tab)} onValueChange={(tab) => tab && set("tab", tab)}>
        <TabsBar>
          {v.bumpers && <Bumper>L1</Bumper>}
          <TabsList aria-label="Pause menu">
            {TABS.map((tab) => (
              <TabsTab key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTab>
            ))}
          </TabsList>
          {v.bumpers && <Bumper>R1</Bumper>}
        </TabsBar>
        {TABS.map((tab) => (
          <TabsPanel key={tab.value} value={tab.value} className="cd-panel">
            {tab.label} content.
          </TabsPanel>
        ))}
      </Tabs>
    </div>
  )
}

/* Accordion */

const TOPICS = [
  { value: "controls", title: "Controls", text: "Change the button layout and invert the camera in Settings, under Controller." },
  { value: "map", title: "Map", text: "Open the map from the pause menu. Set a destination and the route shows on the minimap." },
  { value: "access", title: "Accessibility", text: "Text size, subtitles and screen narration are in Settings, under UI." },
]

// The open items, kept in the panel as a comma list ("none" when every item is closed).
function openItems(value: Value | undefined): string[] {
  return !value || value === "none" ? [] : String(value).split(",")
}

function AccordionDemo({ values: v, set }: Playground): ReactElement {
  return (
    <div className="cd-list">
      <Accordion
        aria-label="Help topics"
        value={openItems(v.open)}
        onValueChange={(open) => set("open", open.join(",") || "none")}
        multiple={Boolean(v.multiple)}
        disabled={Boolean(v.disabled)}
      >
        {TOPICS.map((topic) => (
          <AccordionItem key={topic.value} value={topic.value}>
            <AccordionHeader render={<h4 />}>
              <AccordionTrigger>{topic.title}</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>{topic.text}</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

/* Pagination and breadcrumb */

const PAGES = 12

function NavDemo({ values: v, set }: Playground): ReactElement {
  if (v.component === "breadcrumb")
    return (
      <div className="cd-list">
        <Breadcrumb aria-label="Store">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#core-nav">Clothing store</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>{String(v.current).trim() || "T-shirts"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    )
  const page = Number(v.page)
  return (
    <div className="cd-list">
      <div className="cd-pager">
        <p className="cd-count">
          {page} <i>/</i> <i>{PAGES}</i>
        </p>
        <Pagination aria-label="Results pages" pageCount={PAGES} page={page} onPageChange={(next) => set("page", next)} disabled={Boolean(v.disabled)}>
          <PaginationList>
            {({ items }) => (
              <>
                <PaginationItem>
                  <PaginationPrevious />
                </PaginationItem>
                {items.map((item) => (
                  <PaginationItem key={item}>{typeof item === "number" ? <PaginationLink page={item} /> : <PaginationEllipsis />}</PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext />
                </PaginationItem>
              </>
            )}
          </PaginationList>
        </Pagination>
      </div>
    </div>
  )
}

/* Dialog and sheet */

function DialogDemo({ values: v, set }: Playground): ReactElement {
  const open = Boolean(v.open)
  const onOpenChange = (next: boolean) => set("open", next)
  if (v.component === "sheet")
    return (
      <div className="cd-center">
        <div className="cd-pause__rows">
          <Sheet side={v.side as "left"} open={open} onOpenChange={onOpenChange}>
            <SheetTrigger className="cd-pause__row">
              <SlidersVertical aria-hidden="true" />
              Settings
            </SheetTrigger>
            <SheetContent>
              <SheetTitle>Settings</SheetTitle>
              <SheetDescription>Quick settings for this session.</SheetDescription>
              <div className="vc-list">
                <Switch defaultChecked showState>
                  Subtitles
                </Switch>
                <Switch showState>Street Names</Switch>
                <Switch defaultChecked showState>
                  Bottom Right Prompts
                </Switch>
              </div>
              <SheetFooter>
                <SheetPrompt label="Back" glyph="circle" />
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    )
  return (
    <div className="cd-center">
      <div className="cd-pause__rows">
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogTrigger className="cd-pause__row">
            <Save aria-hidden="true" />
            Game
          </DialogTrigger>
          <DialogContent size={v.size as "md"}>
            <DialogTitle>Save game</DialogTitle>
            <DialogDescription>Your progress will be saved to this slot.</DialogDescription>
            <DialogFooter>
              <DialogPrompt label="Save" glyph="cross" onClick={() => toast.success("Game saved")} />
              <DialogPrompt label="Back" glyph="circle" />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

/* Popover, tooltip and hover card */

// The panel's Open switch owns these popups, so a press or focus outside them (on that switch, say) doesn't close them.
const KEEP_OPEN = new Set(["outside-press", "focus-out"])

function FloatingDemo({ values: v, set }: Playground): ReactElement {
  const open = Boolean(v.open)
  const onOpenChange = (next: boolean, details?: { reason: string }) => {
    if (!next && details && KEEP_OPEN.has(details.reason)) return
    set("open", next)
  }
  const place = { side: v.side as Side, align: v.align as Align }
  let body: ReactElement
  if (v.component === "tooltip")
    body = (
      <Tooltip open={open} onOpenChange={onOpenChange}>
        <TooltipTrigger render={<Button variant="secondary" size="sm" />}>Legend</TooltipTrigger>
        <TooltipContent {...place}>Your route is pink. Your own waypoints are cyan.</TooltipContent>
      </Tooltip>
    )
  else if (v.component === "hovercard")
    body = (
      <p className="cd-text cd-map__note">
        Contact{" "}
        <HoverCard open={open} onOpenChange={onOpenChange}>
          <HoverCardTrigger href="#core-floating">Jason Duval</HoverCardTrigger>
          <HoverCardContent {...place}>
            <div className="cd-hover">
              <Portrait member={CAST[0]} shape="square" />
              <div>
                <p className="cd-hover__name">Jason Duval</p>
                <p className="cd-hover__meta">Vice City</p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>{" "}
        is in your phone contacts.
      </p>
    )
  else
    body = (
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger render={<Button size="sm" />}>Set destination</PopoverTrigger>
        <PopoverContent {...place}>
          <PopoverTitle>Vice City</PopoverTitle>
          <PopoverDescription>1.86 mi from your position.</PopoverDescription>
          <Prompts>
            <PopoverClose className="vc-prompt-btn" onClick={() => toast("Destination set")}>
              Set destination
              <Glyph name="cross" />
            </PopoverClose>
          </Prompts>
        </PopoverContent>
      </Popover>
    )
  return (
    <div className="cd-map">
      <img className="cd-map__img" src="/vc/map-leonida.jpg" alt="" aria-hidden="true" />
      <div className="cd-map__center">{body}</div>
    </div>
  )
}

/* Menu */

function MenuDemo({ values: v, set }: Playground): ReactElement {
  // Opened from the panel rather than its trigger, the menu has no trigger to sit against yet, so it's anchored to it.
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const menu = { open: Boolean(v.open), onOpenChange: (next: boolean) => set("open", next) }
  const place = { side: v.side as Side, align: v.align as Align }
  if (v.trigger === "context")
    return (
      <div className="cd-list cd-list--menu">
        <Menu {...menu} onAction={(value) => toast(`${value} the photo`)}>
          <MenuContextTrigger tabIndex={0} aria-label="Photo options area">
            <img className="cd-thumb" src="/vc/shot-sea-sunset.jpg" alt="" />
            <span className="cd-line__main">
              Photo
              <small>Right-click, long-press or Shift F10</small>
            </span>
          </MenuContextTrigger>
          <MenuContent>
            <MenuItem value="Liked">Like</MenuItem>
            <MenuItem value="Shared">Share</MenuItem>
            <MenuSeparator />
            <MenuItem value="Deleted">
              <MenuItemIcon>
                <Trash2 />
              </MenuItemIcon>
              Delete
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    )
  return (
    <div className="cd-list cd-list--menu">
      <Menu {...menu} onAction={(value) => toast(`Chose ${value}`)}>
        <MenuTrigger ref={setAnchor} className="cd-line cd-line--button">
          Quick menu
        </MenuTrigger>
        <MenuContent anchor={anchor} {...place}>
          <MenuGroup>
            <MenuGroupLabel>Pause</MenuGroupLabel>
            <MenuItem value="map">
              <MenuItemIcon>
                <MapIcon />
              </MenuItemIcon>
              Map
            </MenuItem>
            <MenuItem value="phone">
              <MenuItemIcon>
                <Smartphone />
              </MenuItemIcon>
              Phone
            </MenuItem>
            <MenuSub>
              <MenuSubTrigger>
                <MenuItemIcon>
                  <SlidersVertical />
                </MenuItemIcon>
                Settings
              </MenuSubTrigger>
              <MenuSubContent>
                <MenuItem value="controller">Controller</MenuItem>
                <MenuItem value="display">Display</MenuItem>
                <MenuItem value="audio">Audio</MenuItem>
              </MenuSubContent>
            </MenuSub>
          </MenuGroup>
          <MenuSeparator />
          <MenuGroup>
            <MenuGroupLabel>HUD</MenuGroupLabel>
            <MenuCheckboxItem value="minimap" defaultChecked>
              Minimap
            </MenuCheckboxItem>
            <MenuCheckboxItem value="subtitles">Subtitles</MenuCheckboxItem>
          </MenuGroup>
          <MenuSeparator />
          <MenuRadioGroup defaultValue="default" aria-label="Text size">
            <MenuGroupLabel>Text size</MenuGroupLabel>
            <MenuRadioItem value="default">Default</MenuRadioItem>
            <MenuRadioItem value="large">Large</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
    </div>
  )
}

/* Meter, progress and skeleton */

const TONE_ICON = { health: Heart, stamina: Zap, focus: Eye }

/* A HUD vital: change the value and the bar brightens, then drops back to 40% after about three seconds. */
function VitalsDemo({ values: v }: Playground): ReactElement {
  if (v.component === "skeleton")
    return (
      <div className="cd-list">
        {[0, 1].map((row) => (
          <div key={row} className="cd-line cd-skeleton" aria-hidden="true">
            <Skeleton shape="circle" />
            <span className="cd-skeleton__text">
              <Skeleton width="55%" />
              <Skeleton width="80%" />
            </span>
          </div>
        ))}
      </div>
    )
  const tone = v.tone as VitalTone
  const Icon = TONE_ICON[tone]
  const vital = { value: Number(v.value), tone, segments: Number(v.segments) || undefined, dimWhenIdle: Boolean(v.dim) }
  const label = String(v.label).trim() || "Value"
  if (v.component === "progress")
    return (
      <div className="cd-list">
        <div className="cd-line cd-line--bar">
          <Progress {...vital}>
            <ProgressIcon>
              <Icon />
            </ProgressIcon>
            <ProgressLabel>{label}</ProgressLabel>
            <ProgressTrack>
              <ProgressIndicator />
            </ProgressTrack>
            <ProgressValue />
          </Progress>
        </div>
      </div>
    )
  return (
    <div className="cd-vitals">
      <div className="vc-vitals">
        <Meter aria-label={label} {...vital}>
          <MeterIcon>
            <Icon />
          </MeterIcon>
          <MeterTrack>
            <MeterIndicator />
          </MeterTrack>
        </Meter>
      </div>
    </div>
  )
}

/* Calendar and scroll area */

function DataDemo({ values: v }: Playground): ReactElement {
  if (v.component === "scroll")
    return (
      <div className="cd-data">
        <ScrollArea className="cd-log-scroll">
          <ScrollAreaViewport role="region" aria-label="Message log">
            <ScrollAreaContent>
              <ol className="cd-log">
                {Array.from({ length: Number(v.rows) }, (_, index) => (
                  <li key={index}>Message {index + 1}. Placeholder text for a log line.</li>
                ))}
              </ol>
            </ScrollAreaContent>
          </ScrollAreaViewport>
          <ScrollAreaScrollbar orientation="vertical">
            <ScrollAreaThumb />
          </ScrollAreaScrollbar>
        </ScrollArea>
      </div>
    )
  const shared = {
    headingLevel: 4 as const,
    defaultMonth: "2026-11",
    today: "2026-11-21",
    marked: ["2026-11-19"],
    weekStartsOn: v.monday ? 1 : undefined,
    showOutsideDays: Boolean(v.outside),
    disabled: Boolean(v.disabled),
  }
  return (
    <div className="cd-data">
      {v.multiple ? (
        <Calendar key="multiple" mode="multiple" defaultValue={["2026-11-21", "2026-11-24"]} {...shared} />
      ) : (
        <Calendar key="single" defaultValue="2026-11-21" {...shared} />
      )}
    </div>
  )
}

const coreDisplay: Demo[] = [
  {
    id: "core-cards",
    file: "ui/card",
    keys: [
      ["Tab", "Move between card actions"],
      ["Space / Enter", "Run an action"],
    ],
    name: "Info card",
    sdk: "Card",
    caption: "The map's info card: a 3px pink top rule over a dark body, 34px display title, 26px text.",
    wide: true,
    controls: [
      { type: "select", name: "variant", label: "Variant", options: opts(["glass", "Glass"], ["solid", "Solid"], ["sticker", "Sticker"], ["sunset", "Sunset"]) },
      { type: "boolean", name: "interactive", label: "Interactive" },
      { type: "boolean", name: "media", label: "Media" },
      { type: "boolean", name: "footer", label: "Footer" },
      { type: "text", name: "title", label: "Title" },
      { type: "text", name: "description", label: "Description" },
    ],
    defaults: { variant: "glass", interactive: true, media: true, footer: true, title: "Vehicles", description: "Vice City" },
    examples: [
      { label: "Media card", values: {} },
      { label: "Text only", values: { interactive: false, media: false, footer: false, title: "Task name", description: "A short description of the place or task." } },
      { label: "Sticker", values: { variant: "sticker", media: false, footer: false, title: "Selected", description: "The focused tile takes a 3px light outline." } },
      { label: "Sunset", values: { variant: "sunset" } },
    ],
    code: (v) =>
      [
        `<Card${attrs(["variant", v.variant, "glass"], ["interactive", v.interactive])}>`,
        v.media && `  <CardMedia ratio="4 / 3">\n    <img src="/vc/ue-grotti-cheetah.jpg" alt="" />\n  </CardMedia>`,
        `  <CardHeader>\n    <CardTitle>${v.title}</CardTitle>`,
        v.description && `    <CardDescription>${v.description}</CardDescription>`,
        `  </CardHeader>`,
        v.footer && `  <CardFooter>\n    <Badge variant="outline">Owned</Badge>\n    <Button size="sm">Set waypoint</Button>\n  </CardFooter>`,
        `</Card>`,
      ]
        .filter(Boolean)
        .join("\n"),
    render: (playground) => <CardDemo {...playground} />,
  },
  {
    id: "core-vice-text",
    file: "ui/vice-text",
    name: "Vice text",
    sdk: "Primitive · SVG filter",
    caption: "Any text in the wordmark style: a sunset sky with palms the sun washes out, a white keyline and a purple edge that darkens outward. The outline scales with the font size.",
    wide: true,
    controls: [
      { type: "text", name: "text", label: "Text" },
      { type: "number", name: "size", label: "Size", min: 32, max: 160 },
    ],
    defaults: { text: "Jason", size: 120 },
    examples: [
      { label: "Jason", values: {} },
      { label: "Leonida", values: { text: "Leonida" } },
      { label: "Vice City", values: { text: "Vice City", size: 96 } },
      { label: "Small", values: { text: "Leonida", size: 40 } },
    ],
    code: (v) => `<ViceText style={{ fontSize: ${v.size} }}>${String(v.text).trim() || "Your name"}</ViceText>`,
    render: (playground) => <ViceTextDemo {...playground} />,
  },
  {
    id: "core-badges",
    file: "ui/badge",
    name: "Badge",
    sdk: "Badge",
    caption: "Square condensed caps for status, the store's Owned and Wearing. Pink and a diamond mark what's new.",
    controls: [
      { type: "select", name: "variant", label: "Variant", options: opts(["solid", "Solid"], ["soft", "Soft"], ["outline", "Outline"], ["neon", "Neon"], ["sunset", "Sunset"]) },
      {
        type: "select",
        name: "tone",
        label: "Tone",
        options: opts(["pink", "Pink"], ["teal", "Teal"], ["amber", "Amber"], ["cash", "Cash"], ["red", "Red"], ["violet", "Violet"], ["neutral", "Neutral"]),
      },
      { type: "boolean", name: "dot", label: "Dot" },
      { type: "text", name: "text", label: "Text" },
    ],
    defaults: { variant: "outline", tone: "pink", dot: true, text: "New" },
    examples: [
      { label: "New", values: {} },
      { label: "Owned", values: { variant: "soft", tone: "neutral", dot: false, text: "Owned" } },
      { label: "Wearing", values: { variant: "solid", tone: "neutral", dot: false, text: "Wearing" } },
      { label: "Not owned", values: { variant: "outline", tone: "neutral", dot: false, text: "Not owned" } },
    ],
    code: (v) => `<Badge${attrs(["variant", v.variant, "soft"], ["tone", v.tone, "pink"])}>\n${v.dot ? "  <BadgeDot />\n" : ""}  ${v.text}\n</Badge>`,
    render: (playground) => <BadgeDemo {...playground} />,
  },
  {
    id: "core-avatars",
    file: "ui/avatar",
    name: "Avatar",
    sdk: "Avatar",
    caption: "Contact rows with official marketing portraits.",
    controls: [
      { type: "select", name: "status", label: "Status", options: opts(["none", "None"], ["online", "Online"], ["busy", "Busy"], ["away", "Away"], ["wanted", "Wanted"]) },
      { type: "select", name: "size", label: "Size", options: opts(["xs", "XS"], ["sm", "S"], ["md", "M"], ["lg", "L"], ["xl", "XL"]) },
      { type: "select", name: "shape", label: "Shape", options: opts(["circle", "Circle"], ["square", "Square"]) },
      { type: "select", name: "ring", label: "Ring", options: opts(["none", "None"], ["sunset", "Sunset"], ["pink", "Pink"], ["teal", "Teal"]) },
      { type: "boolean", name: "image", label: "Image" },
      { type: "boolean", name: "group", label: "Group" },
    ],
    defaults: { status: "online", size: "md", shape: "circle", ring: "none", image: true, group: false },
    examples: [
      { label: "Contact", values: {} },
      { label: "Busy", values: { status: "busy", ring: "pink" } },
      { label: "Initials", values: { status: "none", image: false, size: "lg" } },
      { label: "Group", values: { group: true } },
    ],
    code: (v) => {
      const look = attrs(["shape", v.shape, "circle"], ["ring", v.ring, "none"])
      const size = attrs(["size", v.size, "md"])
      const image = v.image ? `    <AvatarImage src="/vc/art-jason.jpg" />\n` : ""
      if (v.group)
        return `<AvatarGroup aria-label="Contacts"${size}>\n  <Avatar aria-label="Jason Duval"${look}>\n${image}    <AvatarFallback>JD</AvatarFallback>\n  </Avatar>\n  {/* … */}\n  <AvatarGroupCount aria-label="1 more">+1</AvatarGroupCount>\n</AvatarGroup>`
      const status = v.status === "none" ? "" : String(v.status)
      return `<Avatar aria-label="Jason Duval${status ? `, ${status}` : ""}"${size}${look}${attrs(["status", status])}>\n${image.slice(2)}  <AvatarFallback>JD</AvatarFallback>\n</Avatar>`
    },
    render: (playground) => <AvatarDemo {...playground} />,
  },
  {
    id: "core-alerts",
    file: "ui/alert",
    name: "Alert",
    sdk: "Alert",
    caption: "The mission card as a notice: pink top rule, display title, one line of detail. Every tone draws the same; tone is a hook for your own styles.",
    controls: [
      { type: "select", name: "tone", label: "Tone", options: opts(["info", "Info"], ["success", "Success"], ["warning", "Warning"], ["danger", "Danger"]) },
      { type: "boolean", name: "action", label: "Action" },
      { type: "text", name: "title", label: "Title" },
      { type: "text", name: "description", label: "Description" },
    ],
    defaults: { tone: "warning", action: true, title: "Controller disconnected", description: "Reconnect your controller to continue." },
    examples: [
      { label: "Warning", values: {} },
      { label: "Info", values: { tone: "info", action: false, title: "Settings saved", description: "Your changes apply the next time you load." } },
      { label: "Success", values: { tone: "success", action: false, title: "Update installed", description: "" } },
    ],
    code: (v) =>
      [
        `<Alert${attrs(["tone", v.tone, "info"])}>`,
        `  <AlertTitle>${v.title}</AlertTitle>`,
        v.description && `  <AlertDescription>${v.description}</AlertDescription>`,
        v.action && `  <AlertAction>\n    <Button size="sm" variant="outline">Retry</Button>\n  </AlertAction>`,
        `</Alert>`,
      ]
        .filter(Boolean)
        .join("\n"),
    render: (playground) => <AlertDemo {...playground} />,
  },
  {
    id: "core-tabs",
    file: "ui/tabs",
    keys: [
      ["← →", "Previous or next tab"],
      ["Home / End", "First or last tab"],
    ],
    name: "Tabs",
    sdk: "Tabs",
    caption: "The map's tabs with the #ff6b9f underline, or the settings chips, with L1 / R1 keycaps. Tabs snap; content fades in over 167ms.",
    controls: [
      { type: "select", name: "variant", label: "Variant", options: opts(["underline", "Underline"], ["chips", "Chips"], ["pill", "Pill"], ["slant", "Slant"]) },
      { type: "select", name: "tab", label: "Selected tab", options: TABS },
      { type: "boolean", name: "bumpers", label: "Bumpers" },
    ],
    defaults: { variant: "underline", tab: "map", bumpers: true },
    examples: [
      { label: "Underline", values: {} },
      { label: "Chips", values: { variant: "chips" } },
      { label: "Pill", values: { variant: "pill" } },
      { label: "Slant", values: { variant: "slant" } },
    ],
    code: (v) => {
      const bumper = (key: string) => (v.bumpers ? `    <Bumper>${key}</Bumper>\n` : "")
      return `<Tabs${attrs(["variant", v.variant, "underline"])} value="${v.tab}" onValueChange={setTab}>
  <TabsBar>
${bumper("L1")}    <TabsList aria-label="Pause menu">
      <TabsTab value="map">Map</TabsTab>
      <TabsTab value="brief">Brief</TabsTab>
      <TabsTab value="progress">Progress</TabsTab>
    </TabsList>
${bumper("R1")}  </TabsBar>
  <TabsPanel value="map">Map content.</TabsPanel>
  {/* a TabsPanel for each tab */}
</Tabs>`
    },
    render: (playground) => <TabsDemo {...playground} />,
  },
  {
    id: "core-accordion",
    file: "ui/accordion",
    keys: [
      ["Tab", "Move between headers"],
      ["Space / Enter", "Open or close a section"],
    ],
    name: "Accordion",
    sdk: "Accordion",
    caption: "Settings rows that open. The selection bar snaps onto the focused row.",
    controls: [
      { type: "select", name: "open", label: "Open item", options: opts(["none", "None"], ["controls", "Controls"], ["map", "Map"], ["access", "Accessibility"]) },
      { type: "boolean", name: "multiple", label: "Multiple" },
      { type: "boolean", name: "disabled", label: "Disabled" },
    ],
    defaults: { open: "controls", multiple: false, disabled: false },
    examples: [
      { label: "One open", values: {} },
      { label: "All closed", values: { open: "none" } },
      { label: "Several open", values: { multiple: true, open: "controls,map" } },
    ],
    code: (v) => {
      const open = openItems(v.open)
      return `<Accordion value={[${open.map((item) => `"${item}"`).join(", ")}]} onValueChange={setOpen}${attrs(["multiple", v.multiple], ["disabled", v.disabled])}>
  <AccordionItem value="controls">
    <AccordionHeader>
      <AccordionTrigger>Controls</AccordionTrigger>
    </AccordionHeader>
    <AccordionPanel>Change the button layout…</AccordionPanel>
  </AccordionItem>
  {/* more AccordionItems */}
</Accordion>`
    },
    render: (playground) => <AccordionDemo {...playground} />,
  },
  {
    id: "core-nav",
    file: "ui/pagination",
    keys: [
      ["Tab", "Move between links and pages"],
      ["Enter", "Follow a link or go to a page"],
    ],
    name: "Navigation",
    sdk: "Pagination · Breadcrumb",
    caption: "The store's page counter with pagination, and its breadcrumb: dim levels with a slash, the current level bright.",
    controls: [
      { type: "select", name: "component", label: "Component", options: opts(["pagination", "Pagination"], ["breadcrumb", "Breadcrumb"]) },
      { type: "number", name: "page", label: "Page", min: 1, max: PAGES },
      { type: "boolean", name: "disabled", label: "Disabled" },
      { type: "text", name: "current", label: "Current page" },
    ],
    defaults: { component: "pagination", page: 4, disabled: false, current: "T-shirts" },
    examples: [
      { label: "Pagination", values: {} },
      { label: "Last page", values: { page: PAGES } },
      { label: "Breadcrumb", values: { component: "breadcrumb" } },
    ],
    code: (v) =>
      v.component === "breadcrumb"
        ? `<Breadcrumb aria-label="Store">
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/store">Clothing store</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbItem>
      <BreadcrumbPage>${String(v.current).trim() || "T-shirts"}</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`
        : `<Pagination aria-label="Results pages" pageCount={${PAGES}} page={${v.page}} onPageChange={setPage}${attrs(["disabled", v.disabled])}>
  <PaginationList>
    {({ items }) => <>
      <PaginationItem><PaginationPrevious /></PaginationItem>
      {items.map((item) => (
        <PaginationItem key={item}>
          {typeof item === "number" ? <PaginationLink page={item} /> : <PaginationEllipsis />}
        </PaginationItem>
      ))}
      <PaginationItem><PaginationNext /></PaginationItem>
    </>}
  </PaginationList>
</Pagination>`,
    render: (playground) => <NavDemo {...playground} />,
  },
  {
    id: "core-dialogs",
    file: "ui/dialog",
    keys: [
      ["Space / Enter", "Open the dialog or sheet"],
      ["Tab", "Cycle inside it"],
      ["Escape", "Close and return focus"],
    ],
    name: "Dialog & Sheet",
    sdk: "Dialog · Drawer",
    caption: "A pause row opens a settings-style dialog with prompts, or slides in the 544px side panel.",
    wide: true,
    controls: [
      { type: "select", name: "component", label: "Component", options: opts(["dialog", "Dialog"], ["sheet", "Sheet"]) },
      { type: "boolean", name: "open", label: "Open" },
      { type: "select", name: "size", label: "Dialog size", options: opts(["sm", "S"], ["md", "M"], ["lg", "L"]) },
      { type: "select", name: "side", label: "Sheet side", options: opts(["left", "Left"], ["right", "Right"], ["bottom", "Bottom"]) },
    ],
    defaults: { component: "dialog", open: false, size: "md", side: "left" },
    examples: [
      { label: "Dialog", values: { open: true } },
      { label: "Side sheet", values: { component: "sheet", open: true } },
      { label: "Bottom sheet", values: { component: "sheet", side: "bottom", open: true } },
    ],
    code: (v) =>
      v.component === "sheet"
        ? `<Sheet side="${v.side}" open={${v.open}} onOpenChange={setOpen}>
  <SheetTrigger>Settings</SheetTrigger>
  <SheetContent>
    <SheetTitle>Settings</SheetTitle>
    <SheetDescription>Quick settings for this session.</SheetDescription>
    <Switch showState>Subtitles</Switch>
    <SheetFooter>
      <SheetPrompt label="Back" glyph="circle" />
    </SheetFooter>
  </SheetContent>
</Sheet>`
        : `<Dialog open={${v.open}} onOpenChange={setOpen}>
  <DialogTrigger>Game</DialogTrigger>
  <DialogContent${attrs(["size", v.size, "md"])}>
    <DialogTitle>Save game</DialogTitle>
    <DialogDescription>Your progress will be saved to this slot.</DialogDescription>
    <DialogFooter>
      <DialogPrompt label="Save" glyph="cross" onClick={save} />
      <DialogPrompt label="Back" glyph="circle" />
    </DialogFooter>
  </DialogContent>
</Dialog>`,
    render: (playground) => <DialogDemo {...playground} />,
  },
  {
    id: "core-floating",
    file: "ui/popover",
    keys: [
      ["Space / Enter", "Open the popover"],
      ["Tab", "Show a tooltip on focus"],
      ["Escape", "Close"],
    ],
    name: "Popovers",
    sdk: "Popover · Tooltip · HoverCard",
    caption: "The map's hover card for popovers and hover cards; the HUD help box for tooltips.",
    controls: [
      { type: "select", name: "component", label: "Component", options: opts(["popover", "Popover"], ["tooltip", "Tooltip"], ["hovercard", "Hover card"]) },
      { type: "boolean", name: "open", label: "Open" },
      { type: "select", name: "side", label: "Side", options: SIDES },
      { type: "select", name: "align", label: "Align", options: ALIGNS },
    ],
    defaults: { component: "popover", open: false, side: "top", align: "center" },
    examples: [
      { label: "Popover", values: { open: true } },
      { label: "Tooltip", values: { component: "tooltip", open: true } },
      { label: "Hover card", values: { component: "hovercard", open: true, side: "bottom" } },
    ],
    code: (v) => {
      const place = attrs(["side", v.side, v.component === "tooltip" ? "top" : "bottom"], ["align", v.align, "center"])
      if (v.component === "tooltip")
        return `<Tooltip open={${v.open}} onOpenChange={setOpen}>
  <TooltipTrigger render={<Button variant="secondary" size="sm" />}>Legend</TooltipTrigger>
  <TooltipContent${place}>Your route is pink. Your own waypoints are cyan.</TooltipContent>
</Tooltip>`
      if (v.component === "hovercard")
        return `<HoverCard open={${v.open}} onOpenChange={setOpen}>
  <HoverCardTrigger href="/contacts/jason">Jason Duval</HoverCardTrigger>
  <HoverCardContent${place}>
    <Avatar aria-label="Jason Duval" shape="square">…</Avatar>
    Jason Duval
  </HoverCardContent>
</HoverCard>`
      return `<Popover open={${v.open}} onOpenChange={setOpen}>
  <PopoverTrigger render={<Button size="sm" />}>Set destination</PopoverTrigger>
  <PopoverContent${place}>
    <PopoverTitle>Vice City</PopoverTitle>
    <PopoverDescription>1.86 mi from your position.</PopoverDescription>
    <PopoverClose>Set destination</PopoverClose>
  </PopoverContent>
</Popover>`
    },
    render: (playground) => <FloatingDemo {...playground} />,
  },
  {
    id: "core-menu",
    file: "ui/menu",
    keys: [
      ["Space / Enter / ↓", "Open the menu"],
      ["↑ ↓", "Move through items"],
      ["→ / ←", "Open or close a submenu"],
      ["Shift+F10", "Open the context menu"],
      ["Escape", "Close"],
    ],
    name: "Dropdown menu",
    sdk: "Menu",
    caption: "The pause panel in miniature: 64px rows, icons that fill on focus, a submenu, checkboxes and radios. As a context menu, it opens where you right-click.",
    controls: [
      { type: "select", name: "trigger", label: "Trigger", options: opts(["button", "Button"], ["context", "Right-click"]) },
      { type: "boolean", name: "open", label: "Open" },
      { type: "select", name: "side", label: "Side", options: SIDES },
      { type: "select", name: "align", label: "Align", options: ALIGNS },
    ],
    defaults: { trigger: "button", open: false, side: "right", align: "start" },
    examples: [
      { label: "Dropdown", values: { open: true } },
      { label: "Below", values: { open: true, side: "bottom" } },
      { label: "Context menu", values: { trigger: "context" } },
    ],
    code: (v) =>
      v.trigger === "context"
        ? `<Menu onAction={run}>
  <MenuContextTrigger aria-label="Photo options area">…</MenuContextTrigger>
  <MenuContent>
    <MenuItem value="Liked">Like</MenuItem>
    <MenuItem value="Shared">Share</MenuItem>
    <MenuSeparator />
    <MenuItem value="Deleted">Delete</MenuItem>
  </MenuContent>
</Menu>`
        : `<Menu open={${v.open}} onOpenChange={setOpen} onAction={run}>
  <MenuTrigger>Quick menu</MenuTrigger>
  <MenuContent${attrs(["side", v.side, "bottom"], ["align", v.align, "start"])}>
    <MenuItem value="map">Map</MenuItem>
    <MenuSub>
      <MenuSubTrigger>Settings</MenuSubTrigger>
      <MenuSubContent>
        <MenuItem value="audio">Audio</MenuItem>
      </MenuSubContent>
    </MenuSub>
    <MenuSeparator />
    <MenuCheckboxItem value="minimap" defaultChecked>Minimap</MenuCheckboxItem>
  </MenuContent>
</Menu>`,
    render: (playground) => <MenuDemo {...playground} />,
  },
  {
    id: "core-feedback",
    file: "ui/progress",
    name: "Progress & Meter",
    sdk: "Progress · Meter",
    caption: "GTA VI's vitals: 10px square bars, segmented health, #F8B8D0, #60E0E0 and #A088F8, dimming to 40% when idle. Change the value and the bar brightens for about three seconds.",
    controls: [
      { type: "select", name: "component", label: "Component", options: opts(["meter", "Meter"], ["progress", "Progress"], ["skeleton", "Skeleton"]) },
      { type: "number", name: "value", label: "Value", min: 0, max: 100 },
      { type: "select", name: "tone", label: "Tone", options: opts(["health", "Health"], ["stamina", "Stamina"], ["focus", "Focus"]) },
      { type: "number", name: "segments", label: "Segments", min: 0, max: 5 },
      { type: "boolean", name: "dim", label: "Dim when idle" },
      { type: "text", name: "label", label: "Label" },
    ],
    defaults: { component: "meter", value: 80, tone: "health", segments: 2, dim: true, label: "Health" },
    examples: [
      { label: "Health", values: {} },
      { label: "Stamina", values: { tone: "stamina", value: 90, segments: 0, label: "Stamina" } },
      { label: "Install", values: { component: "progress", value: 41, segments: 0, dim: false, label: "Install" } },
      { label: "Loading", values: { component: "skeleton" } },
    ],
    code: (v) => {
      if (v.component === "skeleton") return `<Skeleton shape="circle" />\n<Skeleton width="55%" />\n<Skeleton width="80%" />`
      const props = `value={${v.value}}${attrs(["tone", v.tone, "health"], ["segments", Number(v.segments) || undefined], ["dimWhenIdle", v.dim])}`
      if (v.component === "progress")
        return `<Progress ${props}>
  <ProgressIcon><Heart /></ProgressIcon>
  <ProgressLabel>${v.label}</ProgressLabel>
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
  <ProgressValue />
</Progress>`
      return `<Meter aria-label="${v.label}" ${props}>
  <MeterIcon><Heart /></MeterIcon>
  <MeterTrack>
    <MeterIndicator />
  </MeterTrack>
</Meter>`
    },
    render: (playground) => <VitalsDemo {...playground} />,
  },
  {
    id: "core-data",
    file: "ui/calendar",
    keys: [
      ["Arrows", "Move between days"],
      ["Page Up / Page Down", "Previous or next month"],
      ["Enter", "Pick a day"],
      ["↑ ↓", "Scroll the list"],
    ],
    name: "Calendar & Scroll Area",
    sdk: "Calendar · Scroll Area",
    caption: "A month grid on the slate panel, and a list whose edges fade only where it scrolls.",
    wide: true,
    controls: [
      { type: "select", name: "component", label: "Component", options: opts(["calendar", "Calendar"], ["scroll", "Scroll area"]) },
      { type: "boolean", name: "multiple", label: "Several days" },
      { type: "boolean", name: "monday", label: "Weeks start Monday" },
      { type: "boolean", name: "outside", label: "Outside days" },
      { type: "boolean", name: "disabled", label: "Disabled" },
      { type: "number", name: "rows", label: "List rows", min: 3, max: 30 },
    ],
    defaults: { component: "calendar", multiple: false, monday: false, outside: true, disabled: false, rows: 9 },
    examples: [
      { label: "Calendar", values: {} },
      { label: "Several days", values: { multiple: true, monday: true } },
      { label: "Scroll area", values: { component: "scroll" } },
      { label: "Long list", values: { component: "scroll", rows: 30 } },
    ],
    code: (v) =>
      v.component === "scroll"
        ? `<ScrollArea>
  <ScrollAreaViewport role="region" aria-label="Message log">
    <ScrollAreaContent>
      <ol>{/* ${v.rows} rows */}</ol>
    </ScrollAreaContent>
  </ScrollAreaViewport>
  <ScrollAreaScrollbar orientation="vertical">
    <ScrollAreaThumb />
  </ScrollAreaScrollbar>
</ScrollArea>`
        : `<Calendar${attrs(["mode", v.multiple ? "multiple" : undefined])}
  value={${v.multiple ? "days" : "day"}}
  onValueChange={${v.multiple ? "setDays" : "setDay"}}
  marked={["2026-11-19"]}${v.monday ? "\n  weekStartsOn={1}" : ""}${v.outside ? "" : "\n  showOutsideDays={false}"}${v.disabled ? "\n  disabled" : ""}
/>`,
    render: (playground) => <DataDemo {...playground} />,
  },
]

export { coreDisplay }
