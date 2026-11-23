import { Lock, MapPin, Phone as PhoneIcon, Play, SquareArrowOutUpRight, Users } from "lucide-react";

import { App, AppHeader, AppMenu, Face, Scroll } from "./phone-app.parts";
import { CONTACTS, contactById, initial, usePhone } from "./phone-data";
import { AppMark, Pinwheel } from "./phone-icons";
import { PhoneMenu, PhoneMenuItem } from "./phone-menu";

type Thread = { id: string; section: "suggested" | "messages"; pending?: boolean; pin?: boolean; unread?: boolean };

const THREADS: Thread[] = [
  { id: "alex", section: "suggested", pending: true, unread: true },
  { id: "bailey", section: "suggested", pending: true },
  { id: "casey", section: "suggested", pin: true },
  { id: "drew", section: "messages", unread: true },
  { id: "jordan", section: "messages" },
  { id: "morgan", section: "messages" },
  { id: "riley", section: "messages" },
];

const ThreadRow = ({ thread }: { thread: Thread }) => {
  const contact = contactById(thread.id);
  return (
    <PhoneMenuItem
      value={thread.id}
      className="ld-app__card ld-whatup__row"
      aria-label={`${contact.name}${thread.unread ? ", unread" : ""}`}
      data-unread={thread.unread ? true : undefined}
    >
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
  );
};

const WhatUp = () => {
  const { go } = usePhone();
  return (
    <App screen="whatup">
      <Scroll>
        <AppMenu label="Messages" onOpen={id => go({ screen: "thread", param: id })}>
          <h3 className="ld-app__section">
            <Pinwheel className="ld-app__pinwheel" />
            Suggested
          </h3>
          {THREADS.filter(thread => thread.section === "suggested").map(thread => (
            <ThreadRow key={thread.id} thread={thread} />
          ))}
          <h3 className="ld-app__section">Messages</h3>
          {THREADS.filter(thread => thread.section === "messages").map(thread => (
            <ThreadRow key={thread.id} thread={thread} />
          ))}
        </AppMenu>
      </Scroll>
    </App>
  );
};

const REPLY = "Reply option";

const ThreadView = () => {
  const { entry, sent, send } = usePhone();
  const thread = THREADS.find(item => item.id === entry.param) ?? THREADS[0];
  const contact = contactById(thread.id);
  const done = sent.includes(thread.id);
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
  );
};

const Contacts = () => {
  const { go } = usePhone();
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
  );
};

const SECTIONS = [...new Set(CONTACTS.map(contact => initial(contact.name)))];

const SHEET = [
  { id: "call", label: "Call" },
  { id: "whatup", label: "Open WhatUp" },
  { id: "snapmatic", label: "Open Snapmatic" },
];

const ContactsAll = () => {
  const { entry, update, go, call } = usePhone();
  const active = initial(contactById(entry.focus ?? undefined).name);
  const sheet = entry.sheet ? contactById(entry.sheet) : undefined;
  return (
    <App screen="contacts-all">
      <AppHeader title="All Contacts" />
      <div className="ld-contacts__index" aria-hidden="true">
        {SECTIONS.map(letter => (
          <i key={letter} data-active={letter === active || undefined}>
            {letter}
          </i>
        ))}
      </div>
      <Scroll>
        <AppMenu label="All contacts" onOpen={id => update({ sheet: id })}>
          {SECTIONS.map(letter => (
            <section key={letter} className="ld-contacts__section">
              <h3>{letter}</h3>
              {CONTACTS.filter(contact => initial(contact.name) === letter).map(contact => (
                <PhoneMenuItem
                  key={contact.id}
                  value={contact.id}
                  className="ld-app__card ld-contacts__row"
                  aria-label={contact.name}
                >
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
            onOpen={id => {
              if (id === "call") call(sheet);
              else if (id === "whatup") go({ screen: "thread", param: sheet.id });
              else go({ screen: "profile", param: sheet.id });
            }}
          >
            {SHEET.map(row => (
              <PhoneMenuItem
                key={row.id}
                value={row.id}
                className="ld-sheet__row"
                aria-label={`${row.label}${row.id === "call" ? ` ${sheet.name}` : ""}`}
              >
                <span
                  className="ld-sheet__icon"
                  data-app={row.id === "call" ? "contacts" : row.id}
                  data-slot="phone-app-icon"
                >
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
  );
};

export { WhatUp, ThreadView, Contacts, ContactsAll };
