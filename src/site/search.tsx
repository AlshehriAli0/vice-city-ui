import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ui-sdk/react/command";
import { Search as SearchIcon } from "lucide-react";
import { useEffect, useState, type ReactElement } from "react";

import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Kbd } from "../ui/kbd";
import { entriesOf, sections, type Entry } from "./catalog";
import { hrefOf } from "./route";
import { rank } from "./search-ranking";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
function Item({ entry, chapter }: { entry: Entry; chapter?: boolean }): ReactElement {
  return (
    <CommandItem value={entry.id} className="search__item">
      <span className="search__name">{entry.name}</span>
      <span className="search__sdk">{chapter ? entry.section.title : entry.sdk}</span>
    </CommandItem>
  );
}

function Search(): ReactElement {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = query.trim() ? rank(query) : null;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(value => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <DialogTrigger
        render={<Button variant="secondary" size="sm" className="topbar__search" />}
        aria-label="Search components"
      >
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
          onAction={id => {
            setOpen(false);
            window.location.hash = hrefOf(id);
          }}
        >
          <CommandInput className="search__input" aria-label="Search components" placeholder="Wanted, phone, select…" />
          <CommandEmpty className="search__empty">Nothing matches that.</CommandEmpty>
          <CommandList className="search__list">
            {results
              ? results.length > 0 && (
                  <CommandGroup className="search__group">
                    <CommandGroupLabel className="search__group-label">Best matches</CommandGroupLabel>
                    {results.map(entry => (
                      <Item key={entry.id} entry={entry} chapter />
                    ))}
                  </CommandGroup>
                )
              : sections.map(section => (
                  <CommandGroup key={section.id} className="search__group">
                    <CommandGroupLabel className="search__group-label">{section.title}</CommandGroupLabel>
                    {entriesOf(section).map(entry => (
                      <Item key={entry.id} entry={entry} />
                    ))}
                  </CommandGroup>
                ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export { Search };
