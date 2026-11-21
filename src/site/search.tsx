import { Command, CommandEmpty, CommandGroup, CommandGroupLabel, CommandInput, CommandItem, CommandList } from "@ui-sdk/react/command"
import { Search as SearchIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Kbd } from "../ui/kbd"
import { useEffect, useMemo, useState, type ReactElement } from "react"
import { ENTRIES, entriesOf, sections, type Entry } from "./catalog"
import { hrefOf } from "./route"

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)
const OPEN = "vc:search"

function openSearch(): void {
  window.dispatchEvent(new Event(OPEN))
}

// Damerau edit distance (swaps count as one edit) with a cut-off, for typos like "phne" or "radoi".
function within(a: string, b: string, limit: number): boolean {
  if (Math.abs(a.length - b.length) > limit) return false
  const d = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)))
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
    }
  }
  return d[a.length][b.length] <= limit
}

function subsequence(needle: string, hay: string): boolean {
  let at = 0
  for (const char of hay) if (char === needle[at]) at += 1
  return at === needle.length
}

// Exact name, then prefix, then a word, then anywhere in the name, then a typo or scattered letters, then the SDK parts,
// then the chapter name, which only counts when no title matches at all.
function score(entry: Entry, query: string): number {
  const name = entry.name.toLowerCase()
  const words = name.split(/[\s/&,]+/).filter(Boolean)
  if (name === query) return 7
  if (name.startsWith(query)) return 6
  if (words.some((word) => word.startsWith(query))) return 5
  if (name.includes(query)) return 4
  const limit = query.length > 5 ? 2 : 1
  if (query.length >= 3 && words.some((word) => within(query, word.slice(0, query.length + limit), limit))) return 3
  if (query.length >= 3 && subsequence(query, name)) return 2
  if (entry.sdk.toLowerCase().includes(query)) return 1
  if (entry.section.title.toLowerCase().includes(query)) return 0.5
  return 0
}

function rank(query: string): Entry[] {
  const needle = query.trim().toLowerCase()
  const scored = ENTRIES.map((entry) => [entry, score(entry, needle)] as const).filter(([, points]) => points > 0)
  const titled = scored.some(([, points]) => points >= 2)
  return scored
    .filter(([, points]) => !titled || points >= 1)
    .sort((a, b) => b[1] - a[1] || a[0].number - b[0].number)
    .map(([entry]) => entry)
}

function Item({ entry, chapter }: { entry: Entry; chapter?: boolean }): ReactElement {
  return (
    <CommandItem value={entry.id} className="search__item">
      <span className="search__name">{entry.name}</span>
      <span className="search__sdk">{chapter ? entry.section.title : entry.sdk}</span>
    </CommandItem>
  )
}

/* ⌘K / Ctrl+K opens a palette that jumps to any component. */
function Search(): ReactElement {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const results = useMemo(() => (query.trim() ? rank(query) : null), [query])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener("keydown", onKey)
    window.addEventListener(OPEN, onOpen)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener(OPEN, onOpen)
    }
  }, [])
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery("")
      }}
    >
      <DialogTrigger render={<Button variant="secondary" size="sm" className="topbar__search" />} aria-label="Search components">
        <SearchIcon aria-hidden="true" />
        <span className="topbar__search-text">Search components</span>
        <Kbd className="topbar__kbd">{isMac ? "⌘K" : "Ctrl K"}</Kbd>
      </DialogTrigger>
      <DialogContent className="search" size="md">
        <DialogTitle className="search__title">Search</DialogTitle>
        <Command
          className="search__command"
          filter={false}
          query={query}
          onQueryChange={setQuery}
          onAction={(id) => {
            setOpen(false)
            window.location.hash = hrefOf(id)
          }}
        >
          <CommandInput className="search__input" aria-label="Search components" placeholder="Wanted, phone, select…" />
          <CommandEmpty className="search__empty">Nothing matches that.</CommandEmpty>
          <CommandList className="search__list">
            {results ? (
              results.length > 0 && (
                <CommandGroup className="search__group">
                  <CommandGroupLabel className="search__group-label">Best matches</CommandGroupLabel>
                  {results.map((entry) => (
                    <Item key={entry.id} entry={entry} chapter />
                  ))}
                </CommandGroup>
              )
            ) : (
              sections.map((section) => (
                <CommandGroup key={section.id} className="search__group">
                  <CommandGroupLabel className="search__group-label">{section.title}</CommandGroupLabel>
                  {entriesOf(section).map((entry) => (
                    <Item key={entry.id} entry={entry} />
                  ))}
                </CommandGroup>
              ))
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

export { openSearch, Search }
