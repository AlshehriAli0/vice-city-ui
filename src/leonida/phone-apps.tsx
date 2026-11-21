import { Avatar, AvatarFallback, AvatarImage } from "@ui-sdk/react/avatar"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"
import { Check, ChevronLeft, ChevronRight, Eye, Hourglass, House, Heart, Lock, MapPin, MessageSquare, Phone as PhoneIcon, Play, SquareArrowOutUpRight, Users, Zap, Sun, Cloud } from "lucide-react"
import { useRef, type CSSProperties, type ReactElement, type ReactNode } from "react"
import { cx } from "../ui/cx"
import { AppMark, Pinwheel } from "./phone-icons"
import { CONTACTS, OWNER_ART, RINGTONES, WALLPAPERS, initial, usePhone, type Contact, type Screen } from "./phone-data"
import { PhoneMenu, PhoneMenuItem, type PhoneMenuProps } from "./phone-menu"

// Text in every app is one of these tags, so it can fade in after the empty background and re-fade on a list jump.
const TEXT = "b, small, p, h2, h3, em, time"

function refade(root: HTMLElement | null) {
  root?.querySelectorAll<HTMLElement>(TEXT).forEach((el) => el.animate?.([{ opacity: 0.38 }, { opacity: 1 }], { duration: 130, easing: "linear" }))
}

/* A list area. It jumps to keep focus in view (the browser's own focus scroll), and its text re-fades on each jump. */
function Scroll({ className, children, label }: { className?: string; children: ReactNode; label?: string }): ReactElement {
  const ref = useRef<HTMLDivElement>(null)
  const keyAt = useRef(-1e9)
  return (
    <div
      ref={ref}
      className={cx("ld-app__scroll", className)}
      data-slot="phone-scroll"
      aria-label={label}
      onKeyDownCapture={() => (keyAt.current = performance.now())}
      onScroll={() => {
        if (performance.now() - keyAt.current < 150) refade(ref.current)
      }}
    >
      {children}
    </div>
  )
}

/* The D-pad list or grid of the screen showing, its focus kept on the stack entry so Back lands where it left. */
function AppMenu({ label, ...props }: Omit<PhoneMenuProps, "value" | "onValueChange"> & { label: string }): ReactElement | null {
  const { entry, setFocus } = usePhone()
  return <PhoneMenu {...props} aria-label={label} value={entry.focus} onValueChange={(value) => setFocus(value)} />
}

function Face({ contact, size = "md" }: { contact: Pick<Contact, "name" | "tone" | "art">; size?: "sm" | "md" | "lg" }): ReactElement {
  return (
    <Avatar className="ld-face" data-size={size} aria-hidden="true" style={{ "--tone": contact.tone } as CSSProperties}>
      {contact.art && <AvatarImage className="ld-face__img ld-pic" src={contact.art} alt="" />}
      <AvatarFallback className="ld-face__fallback">{initial(contact.name)}</AvatarFallback>
    </Avatar>
  )
}

const ME = (owner: string) => ({ name: owner, tone: "#8c8794", art: OWNER_ART })

/* White header bar: a decorative chevron (Back is Circle), the bold title, and an optional avatar. */
function AppHeader({ title, end, tone = "light" }: { title: string; end?: ReactNode; tone?: "light" | "dark" }): ReactElement {
  return (
    <header className="ld-app__head" data-slot="phone-app-header" data-tone={tone}>
      <ChevronLeft className="ld-app__chev" aria-hidden="true" />
      <h2>{title}</h2>
      <span className="ld-app__head-end">{end}</span>
    </header>
  )
}

function App({ screen, tone, children }: { screen: Screen; tone?: "dark" | "blue" | "pink"; children: ReactNode }): ReactElement {
  return (
    <div className="ld-app" data-slot="phone-app" data-app={screen} data-tone={tone}>
      {children}
    </div>
  )
}

const byId = (id: string | undefined) => CONTACTS.find((contact) => contact.id === id) ?? CONTACTS[0]

/* ─ WhatUp ─ */

type Thread = { id: string; section: "suggested" | "messages"; pending?: boolean; pin?: boolean; unread?: boolean }

const THREADS: Thread[] = [
  { id: "alex", section: "suggested", pending: true, unread: true },
  { id: "bailey", section: "suggested", pending: true },
  { id: "casey", section: "suggested", pin: true },
  { id: "drew", section: "messages", unread: true },
  { id: "jordan", section: "messages" },
  { id: "morgan", section: "messages" },
  { id: "riley", section: "messages" },
]

function ThreadRow({ thread }: { thread: Thread }): ReactElement {
  const contact = byId(thread.id)
  return (
    <PhoneMenuItem value={thread.id} className="ld-app__card ld-whatup__row" aria-label={`${contact.name}${thread.unread ? ", unread" : ""}`} data-unread={thread.unread || undefined}>
      <Face contact={contact} />
      <span className="ld-app__lines">
        <b>{contact.name}</b>
        <small>Message preview that runs past the edge of the row</small>
      </span>
      {thread.pending && (
        <i className="ld-whatup__send" aria-hidden="true">
          <Play />
        </i>
      )}
      {thread.pin && <MapPin className="ld-whatup__pin" aria-hidden="true" />}
    </PhoneMenuItem>
  )
}

function WhatUp(): ReactElement {
  const { go } = usePhone()
  return (
    <App screen="whatup">
      <Scroll>
        <AppMenu label="Messages" onOpen={(id) => go({ screen: "thread", param: id })}>
          <h3 className="ld-app__section">
            <Pinwheel className="ld-app__pinwheel" />
            Suggested
          </h3>
          {THREADS.filter((thread) => thread.section === "suggested").map((thread) => (
            <ThreadRow key={thread.id} thread={thread} />
          ))}
          <h3 className="ld-app__section">Messages</h3>
          {THREADS.filter((thread) => thread.section === "messages").map((thread) => (
            <ThreadRow key={thread.id} thread={thread} />
          ))}
        </AppMenu>
      </Scroll>
    </App>
  )
}

const REPLY = "Reply option"

function ThreadView(): ReactElement {
  const { entry, sent, send } = usePhone()
  const thread = THREADS.find((item) => item.id === entry.param) ?? THREADS[0]
  const contact = byId(thread.id)
  const done = sent.includes(thread.id)
  return (
    <App screen="thread">
      <AppHeader title={contact.name} end={<Face contact={contact} size="sm" />} />
      <Scroll className="ld-thread">
        <p className="ld-thread__lock">
          <Lock aria-hidden="true" />
          Messages encrypted
        </p>
        <div className="ld-bubble" data-from="them">
          <p>Placeholder message from this contact. It wraps over a few lines like a real one.</p>
          {thread.pin && (
            <span className="ld-bubble__place">
              <MapPin aria-hidden="true" />
              <b>Place name</b>
            </span>
          )}
        </div>
        <div className="ld-bubble" data-from="me">
          <p>Earlier reply.</p>
        </div>
        {done && (
          <div className="ld-bubble" data-from="me">
            <p>{REPLY}</p>
          </div>
        )}
        {thread.pending && !done && (
          <AppMenu label="Reply" className="ld-thread__reply" onOpen={() => send(thread.id)}>
            <PhoneMenuItem value="reply" className="ld-bubble" data-from="pending" aria-label={`Send: ${REPLY}`}>
              <p>{REPLY}</p>
            </PhoneMenuItem>
            <i className="ld-whatup__send" aria-hidden="true">
              <Play />
            </i>
          </AppMenu>
        )}
      </Scroll>
    </App>
  )
}

/* ─ Contacts ─ */

function Contacts(): ReactElement {
  const { go } = usePhone()
  return (
    <App screen="contacts">
      <Scroll>
        <AppMenu label="Contacts" onOpen={() => go({ screen: "contacts-all" })}>
          <PhoneMenuItem value="all" className="ld-app__card ld-contacts__all">
            <i className="ld-contacts__people" aria-hidden="true">
              <Users />
            </i>
            <b>All Contacts</b>
          </PhoneMenuItem>
        </AppMenu>
      </Scroll>
    </App>
  )
}

const SECTIONS = [...new Set(CONTACTS.map((contact) => initial(contact.name)))]

const SHEET = [
  { id: "call", label: "Call" },
  { id: "whatup", label: "Open WhatUp" },
  { id: "snapmatic", label: "Open Snapmatic" },
]

function ContactsAll(): ReactElement {
  const { entry, update, go, call } = usePhone()
  const active = initial(byId(entry.focus ?? undefined).name)
  const sheet = entry.sheet ? byId(entry.sheet) : undefined
  return (
    <App screen="contacts-all">
      <AppHeader title="All Contacts" />
      <div className="ld-contacts__index" aria-hidden="true">
        {SECTIONS.map((letter) => (
          <i key={letter} data-active={letter === active || undefined}>
            {letter}
          </i>
        ))}
      </div>
      <Scroll>
        <AppMenu label="All contacts" onOpen={(id) => update({ sheet: id })}>
          {SECTIONS.map((letter) => (
            <section key={letter} className="ld-contacts__section">
              <h3>{letter}</h3>
              {CONTACTS.filter((contact) => initial(contact.name) === letter).map((contact) => (
                <PhoneMenuItem key={contact.id} value={contact.id} className="ld-app__card ld-contacts__row" aria-label={contact.name}>
                  <Face contact={contact} />
                  <span>{contact.name}</span>
                </PhoneMenuItem>
              ))}
            </section>
          ))}
        </AppMenu>
      </Scroll>
      {sheet && (
        <div className="ld-sheet" data-slot="phone-sheet">
          <i className="ld-sheet__grab" aria-hidden="true" />
          <PhoneMenu
            aria-label={`${sheet.name} actions`}
            defaultValue="call"
            onOpen={(id) => {
              if (id === "call") call(sheet)
              else if (id === "whatup") go({ screen: "thread", param: sheet.id })
              else go({ screen: "profile", param: sheet.id })
            }}
          >
            {SHEET.map((row) => (
              <PhoneMenuItem key={row.id} value={row.id} className="ld-sheet__row" aria-label={`${row.label}${row.id === "call" ? ` ${sheet.name}` : ""}`}>
                <span className="ld-sheet__icon" data-app={row.id === "call" ? "contacts" : row.id} data-slot="phone-app-icon">
                  {row.id === "call" ? <PhoneIcon /> : <AppMark app={row.id} />}
                </span>
                <span>{row.label}</span>
                <SquareArrowOutUpRight className="ld-sheet__out" aria-hidden="true" />
              </PhoneMenuItem>
            ))}
          </PhoneMenu>
        </div>
      )}
    </App>
  )
}

/* ─ Fitness ─ */

type Skill = { id: string; title: string; accent: string; level: number; ring: number; glyph: "heart" | "bolt" | "eye"; window?: number }

const SKILLS: Skill[] = [
  { id: "strength", title: "Strength Workout", accent: "#e58ac8", level: 1, ring: 0.32, glyph: "heart", window: 0.24 },
  { id: "cardio", title: "Cardio Workout", accent: "#7fe0cf", level: 2, ring: 0.62, glyph: "bolt", window: 0.88 },
  { id: "focus", title: "Focus", accent: "#9b7bf0", level: 1, ring: 0.38, glyph: "eye" },
]

function SkillGlyph({ glyph }: { glyph: Skill["glyph"] }): ReactElement {
  if (glyph === "heart") return <Heart fill="currentColor" strokeWidth={0} />
  if (glyph === "bolt") return <Zap fill="currentColor" strokeWidth={0} />
  return <Eye />
}

function Ring({ value, glyph }: { value: number; glyph: Skill["glyph"] }): ReactElement {
  return (
    <span className="ld-ring" aria-hidden="true">
      <svg viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="18" pathLength="100" className="ld-ring__track" />
        <circle cx="22" cy="22" r="18" pathLength="100" className="ld-ring__fill" strokeDasharray={`${value * 100} 100`} />
      </svg>
      <SkillGlyph glyph={glyph} />
    </span>
  )
}

const BODY = [
  { id: "build", title: "Build", lines: ["Build summary", "Muscle placeholder", "Body fat placeholder"] },
  { id: "calories", title: "Calorie Balance", lines: ["Calorie summary placeholder"] },
]

function Fitness(): ReactElement {
  const { owner, go } = usePhone()
  return (
    <App screen="fitness" tone="dark">
      <Scroll>
        <header className="ld-fit__head">
          <span className="ld-app__lines">
            <b>{owner}</b>
            <small>Healthy</small>
          </span>
          <Face contact={ME(owner)} />
        </header>
        <AppMenu label="Fitness" onOpen={(id) => go({ screen: "fitness-detail", param: id })}>
          <h3 className="ld-app__section">Fitness</h3>
          {SKILLS.map((skill) => (
            <PhoneMenuItem key={skill.id} value={skill.id} className="ld-fit__card" data-kind="skill" aria-label={`${skill.title}, level ${skill.level} of 4`} style={{ "--skill": skill.accent } as CSSProperties}>
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
                  <i style={{ "--p": skill.window } as CSSProperties} />
                </span>
              )}
            </PhoneMenuItem>
          ))}
          <h3 className="ld-app__section">Body &amp; Nutrition</h3>
          {BODY.map((card) => (
            <PhoneMenuItem key={card.id} value={card.id} className="ld-fit__card" aria-label={card.title}>
              <span className="ld-app__lines">
                <b>{card.title}</b>
                {card.lines.map((line) => (
                  <small key={line}>{line}</small>
                ))}
              </span>
            </PhoneMenuItem>
          ))}
        </AppMenu>
      </Scroll>
    </App>
  )
}

function FitnessDetail(): ReactElement {
  const { entry } = usePhone()
  const skill = SKILLS.find((item) => item.id === entry.param)
  const title = skill?.title ?? BODY.find((item) => item.id === entry.param)?.title ?? "Fitness"
  return (
    <App screen="fitness-detail" tone="dark">
      <AppHeader title={title} tone="dark" end={skill && <span style={{ color: skill.accent }}><SkillGlyph glyph={skill.glyph} /></span>} />
      <Scroll className="ld-fit__detail">
        <p>
          Placeholder text about this skill. <strong>Keyword</strong> in bold, then a line on how it <strong>levels up</strong>.
        </p>
        <p>
          A second paragraph of placeholder copy with one more <strong>keyword</strong>.
        </p>
      </Scroll>
    </App>
  )
}

/* ─ Snapmatic ─ */

type Post = { id: string; handle: string; likes: number; comments: number; video?: boolean; tone: string }

const POSTS: Post[] = [
  { id: "p1", handle: "@handle_one", likes: 403, comments: 4, tone: "linear-gradient(160deg,#c98a5e,#5a4a6e)" },
  { id: "p2", handle: "@handle_two", likes: 1280, comments: 37, video: true, tone: "linear-gradient(160deg,#d6456e,#3a2350)" },
  { id: "p3", handle: "@handle_three", likes: 96, comments: 2, tone: "linear-gradient(160deg,#5fb2c9,#2c4f7a)" },
]

const TABS = [
  { value: "home", label: "Home", icon: House },
  { value: "explore", label: "Explore", icon: Eye },
  { value: "liked", label: "Liked", icon: Heart },
]

function PostCard({ post }: { post: Post }): ReactElement {
  return (
    <PhoneMenuItem value={post.id} className="ld-snap__post" aria-label={`Post by ${post.handle}`}>
      <span className="ld-snap__media ld-pic" style={{ "--media": post.tone } as CSSProperties}>
        {post.video && (
          <i className="ld-snap__play" aria-hidden="true">
            <Play fill="currentColor" />
          </i>
        )}
      </span>
      <span className="ld-snap__meta">
        <b className="ld-snap__handle">
          <i className="ld-snap__dot" aria-hidden="true" />
          {post.handle}
        </b>
        <small>Caption placeholder that runs on past the end of the line</small>
        <em className="ld-snap__counts">
          <Heart aria-hidden="true" /> {post.likes}
          <MessageSquare aria-hidden="true" /> {post.comments}
        </em>
      </span>
    </PhoneMenuItem>
  )
}

const OPTIONS = [
  { id: "like", group: "Post", label: "Like" },
  { id: "comments", group: "View", label: "Comments" },
  { id: "profile", group: "View", label: "Profile" },
]

function Snapmatic(): ReactElement {
  const { entry, update, go } = usePhone()
  const tab = entry.param ?? "explore"
  const post = POSTS.find((item) => item.id === entry.focus) ?? POSTS[0]
  return (
    <App screen="snapmatic">
      <Tabs className="ld-snap" value={tab} onValueChange={(value) => value && update({ param: String(value), focus: null })}>
        {TABS.map(({ value }) => (
          <TabsPanel key={value} value={value} className="ld-snap__panel">
            {value === "liked" ? (
              <div className="ld-snap__empty">
                <Heart aria-hidden="true" />
                <p>Like posts to see them here.</p>
              </div>
            ) : (
              <Scroll>
                <AppMenu label={value === "home" ? "Home feed" : "Explore feed"} onOpen={(id) => go({ screen: "comments", param: id })}>
                  {(value === "home" ? [...POSTS].reverse() : POSTS).map((item) => (
                    <PostCard key={item.id} post={item} />
                  ))}
                </AppMenu>
                <p className="ld-snap__end">All Caught Up!</p>
              </Scroll>
            )}
          </TabsPanel>
        ))}
        <TabsList className="ld-snap__tabs" aria-label="Snapmatic tabs">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTab key={value} value={value} className="ld-snap__tab" aria-label={label}>
              <Icon aria-hidden="true" />
            </TabsTab>
          ))}
        </TabsList>
      </Tabs>
      {entry.sheet && (
        <div className="ld-snap__sheet" data-slot="phone-sheet">
          <PhoneMenu
            aria-label="Post options"
            defaultValue="like"
            onOpen={(id) => {
              if (id === "like") update({ sheet: undefined })
              else go({ screen: id === "comments" ? "comments" : "profile", param: id === "comments" ? post.id : post.handle })
            }}
          >
            {OPTIONS.map((option, index) => (
              <div key={option.id} className="ld-snap__group">
                {OPTIONS[index - 1]?.group !== option.group && <h3>{option.group}</h3>}
                <PhoneMenuItem value={option.id} className="ld-snap__option">
                  {option.id === "like" && (
                    <i className="ld-snap__like" aria-hidden="true">
                      <Heart />
                    </i>
                  )}
                  <span>{option.label}</span>
                  {option.group === "View" && <ChevronRight className="ld-snap__chev" aria-hidden="true" />}
                </PhoneMenuItem>
              </div>
            ))}
          </PhoneMenu>
        </div>
      )}
    </App>
  )
}

function Comments(): ReactElement {
  return (
    <App screen="comments">
      <AppHeader title="Comments" />
      <Scroll>
        {["@handle_four", "@handle_five", "@handle_six"].map((handle) => (
          <div key={handle} className="ld-app__card ld-snap__comment">
            <b>{handle}</b>
            <p>Comment placeholder text.</p>
          </div>
        ))}
      </Scroll>
    </App>
  )
}

function Profile(): ReactElement {
  const { entry } = usePhone()
  const contact = CONTACTS.find((item) => item.id === entry.param)
  const handle = contact ? `@${contact.id}` : (entry.param ?? "@handle")
  return (
    <App screen="profile">
      <AppHeader title={handle} />
      <Scroll>
        <div className="ld-snap__profile">
          <span className="ld-snap__ring">
            <Face contact={contact ?? { name: handle.slice(1), tone: "#8a7fd0" }} size="lg" />
          </span>
          <span className="ld-snap__stats">
            <b>120</b>
            <small>Followers</small>
          </span>
          <span className="ld-snap__stats">
            <b>80</b>
            <small>Following</small>
          </span>
        </div>
        <AppMenu label="Profile">
          <PhoneMenuItem value="bio" className="ld-app__card ld-snap__bio" aria-label="View bio">
            <small>Bio placeholder</small>
            <ChevronRight aria-hidden="true" />
          </PhoneMenuItem>
        </AppMenu>
      </Scroll>
    </App>
  )
}

/* ─ News ─ */

const STORIES = [
  { id: "s1", tone: "linear-gradient(150deg,#6f8a5a,#2f3a2a)" },
  { id: "s2", tone: "linear-gradient(150deg,#5a7ab0,#2a3550)" },
  { id: "s3", tone: "linear-gradient(150deg,#b05ad0,#3a2a60)" },
  { id: "s4", tone: "linear-gradient(150deg,#a0a0a8,#4a4a58)" },
  { id: "s5", tone: "linear-gradient(150deg,#3a4a7a,#1a2040)" },
  { id: "s6", tone: "linear-gradient(150deg,#c8a070,#6a4a30)" },
]

function Source(): ReactElement {
  return (
    <small className="ld-news__source">
      <i aria-hidden="true" />
      News outlet
    </small>
  )
}

function News(): ReactElement {
  const { go } = usePhone()
  return (
    <App screen="news">
      <Scroll>
        <AppMenu label="Headlines" onOpen={(id) => go({ screen: "article", param: id })}>
          {STORIES.map((story, index) => (
            <PhoneMenuItem key={story.id} value={story.id} className="ld-app__card ld-news__row" aria-label={`Headline ${index + 1}`}>
              <span className="ld-app__lines">
                <p>Headline placeholder that runs on to a second line</p>
                <Source />
              </span>
              <span className="ld-news__thumb ld-pic" style={{ "--media": story.tone } as CSSProperties} />
            </PhoneMenuItem>
          ))}
        </AppMenu>
      </Scroll>
    </App>
  )
}

function Article(): ReactElement {
  const { entry } = usePhone()
  const story = STORIES.find((item) => item.id === entry.param) ?? STORIES[0]
  return (
    <App screen="article">
      <Scroll className="ld-news__article">
        <em className="ld-news__back">
          <ChevronLeft aria-hidden="true" /> Back
        </em>
        <h2>Headline placeholder that runs on to a second and third line</h2>
        <span className="ld-news__hero ld-pic" style={{ "--media": story.tone } as CSSProperties} />
        <Source />
        <small>By Reporter name</small>
        <p>Body copy placeholder. The article text runs here in short paragraphs.</p>
        <p>A second paragraph of placeholder body copy.</p>
      </Scroll>
    </App>
  )
}

/* ─ Weather ─ */

const HOURS = [
  ["10", "AM", 78],
  ["11", "AM", 80],
  ["12", "PM", 82],
  ["1", "PM", 81],
  ["2", "PM", 81],
] as const

function Weather(): ReactElement {
  const { temperature, weather } = usePhone()
  const Glyph = weather === "cloud" ? Cloud : Sun
  const word = weather === "cloud" ? "Cloudy" : weather === "partly" ? "Partly Cloudy" : "Clear"
  return (
    <App screen="weather" tone="blue">
      <div className="ld-wx">
        <h2 className="ld-wx__place">
          <MapPin aria-hidden="true" fill="currentColor" stroke="#2a5aa0" />
          Vice City
        </h2>
        <div className="ld-wx__now">
          <small>Now</small>
          <b>{temperature}°</b>
          <em>{word}</em>
          <Glyph className="ld-wx__big" aria-hidden="true" fill="currentColor" />
        </div>
        <div className="ld-wx__hours">
          {HOURS.map(([hour, half, degrees]) => (
            <span key={hour}>
              <time>
                {hour}
                <sup>{half}</sup>
              </time>
              <Sun className="ld-wx__icon" aria-hidden="true" fill="currentColor" />
              <b>{degrees}°</b>
            </span>
          ))}
        </div>
        <div className="ld-wx__band">
          <h3>2 Day Forecast</h3>
          <p>
            Today <Sun className="ld-wx__icon" aria-hidden="true" fill="currentColor" /> <b>{temperature}°</b>
          </p>
          <p>
            Tomorrow <Sun className="ld-wx__icon" aria-hidden="true" fill="currentColor" /> <b>{temperature + 1}°</b>
          </p>
        </div>
        <p className="ld-wx__sunset">
          Sunset{" "}
          <time>
            6:15<sup>PM</sup>
          </time>
        </p>
      </div>
    </App>
  )
}

/* ─ Settings ─ */

function Settings(): ReactElement {
  const { owner, go } = usePhone()
  return (
    <App screen="settings">
      <header className="ld-set__profile">
        <Face contact={ME(owner)} />
        <span className="ld-app__lines">
          <b>{owner}</b>
          <small>iFruit</small>
        </span>
      </header>
      <Scroll>
        <AppMenu label="Settings" onOpen={(id) => go({ screen: id as Screen })}>
          <PhoneMenuItem value="wallpaper" className="ld-app__card ld-set__row">
            <span>Wallpaper</span>
          </PhoneMenuItem>
          <PhoneMenuItem value="ringtone" className="ld-app__card ld-set__row">
            <span>Ringtone</span>
          </PhoneMenuItem>
        </AppMenu>
      </Scroll>
    </App>
  )
}

function WallpaperPicker(): ReactElement {
  const { entry, wallpaper, setWallpaper } = usePhone()
  const focused = WALLPAPERS.find((item) => item.id === entry.focus) ?? WALLPAPERS.find((item) => item.id === wallpaper) ?? WALLPAPERS[0]
  return (
    <App screen="wallpaper">
      <AppHeader title="Wallpaper" />
      <Scroll>
        <AppMenu label="Wallpapers" columns={2} className="ld-wall__grid" onOpen={setWallpaper}>
          {WALLPAPERS.map((item) => (
            <PhoneMenuItem key={item.id} value={item.id} className="ld-wall__thumb" aria-label={`${item.name}${item.id === wallpaper ? ", current" : ""}`}>
              <span className="ld-wall__art ld-wallpaper" data-wallpaper={item.id}>
                {item.art && <img className="ld-pic" src={item.art} alt="" />}
              </span>
              {item.id === wallpaper && (
                <i className="ld-wall__check" aria-hidden="true">
                  <Check />
                </i>
              )}
            </PhoneMenuItem>
          ))}
        </AppMenu>
      </Scroll>
      <p className="ld-wall__caption">{focused.name}</p>
    </App>
  )
}

function RingtonePicker(): ReactElement {
  const { ringtone, setRingtone } = usePhone()
  return (
    <App screen="ringtone">
      <AppHeader title="Ringtone" />
      <Scroll>
        <AppMenu label="Ringtones" onOpen={setRingtone}>
          {RINGTONES.map((name) => (
            <PhoneMenuItem key={name} value={name} className="ld-app__card ld-set__row" aria-label={`${name}${name === ringtone ? ", selected" : ""}`}>
              <span>{name}</span>
              <i className="ld-radio-dot" data-checked={name === ringtone || undefined} aria-hidden="true" />
            </PhoneMenuItem>
          ))}
        </AppMenu>
      </Scroll>
    </App>
  )
}

/* ─ Reminders (Square from home). The list itself is unobserved, so it only routes to the apps it names. ─ */

const REMINDERS = [
  { id: "call", app: "contacts", title: "Missed call", line: "Contact name", opens: "contacts" },
  { id: "text", app: "whatup", title: "Unread message", line: "Message preview", opens: "whatup" },
  { id: "news", app: "news", title: "Breaking news", line: "Headline placeholder", opens: "news" },
  { id: "post", app: "snapmatic", title: "New post", line: "Post preview", opens: "snapmatic" },
] as const

function Reminders(): ReactElement {
  const { go } = usePhone()
  return (
    <App screen="reminders">
      <AppHeader title="Reminders" />
      <Scroll>
        <AppMenu label="Reminders" onOpen={(id) => go({ screen: REMINDERS.find((item) => item.id === id)!.opens })}>
          {REMINDERS.map((item) => (
            <PhoneMenuItem key={item.id} value={item.id} className="ld-app__card ld-rem__row" aria-label={`${item.title}: ${item.line}`}>
              <span className="ld-rem__icon" data-slot="phone-app-icon" data-app={item.app}>
                <AppMark app={item.app} />
              </span>
              <span className="ld-app__lines">
                <b>{item.title}</b>
                <small>{item.line}</small>
              </span>
            </PhoneMenuItem>
          ))}
        </AppMenu>
      </Scroll>
    </App>
  )
}

/* The vehicle scanner's own screen is undocumented: its icon opens a plain placeholder. */
function Waink(): ReactElement {
  return (
    <App screen="waink" tone="pink">
      <div className="ld-waink">
        <span className="ld-waink__icon" data-slot="phone-app-icon" data-app="waink">
          <AppMark app="waink" />
        </span>
        <h2>WAiNK</h2>
      </div>
    </App>
  )
}

const SCREENS: Partial<Record<Screen, () => ReactElement>> = {
  whatup: WhatUp,
  thread: ThreadView,
  contacts: Contacts,
  "contacts-all": ContactsAll,
  fitness: Fitness,
  "fitness-detail": FitnessDetail,
  snapmatic: Snapmatic,
  comments: Comments,
  profile: Profile,
  news: News,
  article: Article,
  weather: Weather,
  settings: Settings,
  wallpaper: WallpaperPicker,
  ringtone: RingtonePicker,
  reminders: Reminders,
  waink: Waink,
}

export { SCREENS }
