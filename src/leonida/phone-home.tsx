import { APPS, WALLPAPERS, findApp, usePhone } from "./phone-data";
import { AppMark, Pinwheel, WeatherGlyph } from "./phone-icons";
import { PhoneMenu, PhoneMenuItem } from "./phone-menu";

const Wallpaper = ({ id }: { id: string }) => {
  const art = WALLPAPERS.find(item => item.id === id)?.art;
  return (
    <div className="ld-home__wall ld-wallpaper" data-wallpaper={id} aria-hidden="true">
      {art && <img src={art} alt="" />}
    </div>
  );
};

const HomeScreen = () => {
  const phone = usePhone();
  const focused = APPS.find(app => app.id === phone.entry.focus) ?? APPS[0];
  return (
    <div className="ld-home" data-slot="phone-home">
      <Wallpaper id={phone.wallpaper} />
      <div className="ld-home__status" data-slot="phone-status">
        <time>{phone.time}</time>
        <span className="ld-home__temp">
          <WeatherGlyph weather={phone.weather} className="ld-home__weather" />
          {phone.temperature}°
        </span>
      </div>
      <div className="ld-home__widget" data-slot="phone-reminders">
        <Pinwheel className="ld-home__pinwheel" />
        <b>Reminders</b>
        <small>{phone.reminders} Notifications</small>
      </div>
      <PhoneMenu
        className="ld-home__grid"
        aria-label="Apps"
        columns={4}
        value={phone.entry.focus}
        onValueChange={value => phone.setFocus(value)}
        onOpen={id => {
          const screen = findApp(id);
          if (screen) phone.go({ screen });
        }}
      >
        {APPS.map(app => (
          <PhoneMenuItem key={app.id} value={app.id} className="ld-home__app" aria-label={app.name}>
            <span className="ld-app-icon" data-slot="phone-app-icon" data-app={app.id}>
              <AppMark app={app.id} />
              {app.badge && <i className="ld-app-icon__badge" />}
            </span>
          </PhoneMenuItem>
        ))}
      </PhoneMenu>
      <span className="ld-home__pill" data-slot="phone-app-name" aria-hidden="true">
        {focused.name}
      </span>
    </div>
  );
};

export { HomeScreen };
