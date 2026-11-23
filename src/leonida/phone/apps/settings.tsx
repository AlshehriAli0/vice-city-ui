import { Check } from "lucide-react";

import { ownerFace, RINGTONES, WALLPAPERS, usePhone } from "../phone-data";
import { AppMark } from "../phone-icons";
import { PhoneMenuItem } from "../phone-menu";
import { App, AppHeader, AppMenu, Face, Scroll } from "./app-layout";

const Settings = () => {
  const { owner, go, wallpaper, ringtone } = usePhone();
  return (
    <App screen="settings">
      <header className="ld-set__profile">
        <Face contact={ownerFace(owner)} />
        <span className="ld-app__lines">
          <b>{owner}</b>
          <small>iFruit</small>
        </span>
      </header>
      <Scroll>
        <AppMenu
          label="Settings"
          onOpen={id => {
            if (id === "ringtone") go({ screen: id, focus: ringtone });
            if (id === "wallpaper") go({ screen: id, focus: wallpaper });
          }}
        >
          <PhoneMenuItem value="wallpaper" className="ld-app__card ld-set__row">
            <span>Wallpaper</span>
          </PhoneMenuItem>
          <PhoneMenuItem value="ringtone" className="ld-app__card ld-set__row">
            <span>Ringtone</span>
          </PhoneMenuItem>
        </AppMenu>
      </Scroll>
    </App>
  );
};

const WallpaperPicker = () => {
  const { entry, wallpaper, setWallpaper } = usePhone();
  const focused =
    WALLPAPERS.find(item => item.id === entry.focus) ?? WALLPAPERS.find(item => item.id === wallpaper) ?? WALLPAPERS[0];
  return (
    <App screen="wallpaper">
      <AppHeader title="Wallpaper" />
      <Scroll>
        <AppMenu label="Wallpapers" columns={2} className="ld-wall__grid" onOpen={setWallpaper}>
          {WALLPAPERS.map(item => (
            <PhoneMenuItem
              key={item.id}
              value={item.id}
              className="ld-wall__thumb"
              aria-label={`${item.name}${item.id === wallpaper ? ", current" : ""}`}
            >
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
  );
};

const RingtonePicker = () => {
  const { ringtone, setRingtone } = usePhone();
  return (
    <App screen="ringtone">
      <AppHeader title="Ringtone" />
      <Scroll>
        <AppMenu label="Ringtones" onOpen={setRingtone}>
          {RINGTONES.map(name => (
            <PhoneMenuItem
              key={name}
              value={name}
              className="ld-app__card ld-set__row"
              aria-label={`${name}${name === ringtone ? ", selected" : ""}`}
            >
              <span>{name}</span>
              <i className="ld-radio-dot" data-checked={name === ringtone || undefined} aria-hidden="true" />
            </PhoneMenuItem>
          ))}
        </AppMenu>
      </Scroll>
    </App>
  );
};

const REMINDERS = [
  { id: "call", app: "contacts", title: "Missed call", line: "Contact name", opens: "contacts" },
  { id: "text", app: "whatup", title: "Unread message", line: "Message preview", opens: "whatup" },
  { id: "news", app: "news", title: "Breaking news", line: "Headline placeholder", opens: "news" },
  { id: "post", app: "snapmatic", title: "New post", line: "Post preview", opens: "snapmatic" },
] as const;

const Reminders = () => {
  const { go } = usePhone();
  return (
    <App screen="reminders">
      <AppHeader title="Reminders" />
      <Scroll>
        <AppMenu
          label="Reminders"
          onOpen={id => {
            const reminder = REMINDERS.find(item => item.id === id);
            if (reminder) go({ screen: reminder.opens });
          }}
        >
          {REMINDERS.map(item => (
            <PhoneMenuItem
              key={item.id}
              value={item.id}
              className="ld-app__card ld-rem__row"
              aria-label={`${item.title}: ${item.line}`}
            >
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
  );
};

const Waink = () => (
  <App screen="waink" tone="pink">
    <div className="ld-waink">
      <span className="ld-waink__icon" data-slot="phone-app-icon" data-app="waink">
        <AppMark app="waink" />
      </span>
      <h2>WAiNK</h2>
    </div>
  </App>
);

export { Settings, WallpaperPicker, RingtonePicker, Reminders, Waink };
