import type { ReactElement } from "react";

import { Fitness, FitnessDetail } from "./phone-app.fitness";
import { WhatUp, ThreadView, Contacts, ContactsAll } from "./phone-app.messages";
import { News, Article, Weather } from "./phone-app.news";
import { Settings, WallpaperPicker, RingtonePicker, Reminders, Waink } from "./phone-app.settings";
import { Snapmatic, Comments, Profile } from "./phone-app.snapmatic";
import type { Screen } from "./phone-data";

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
};

export { SCREENS };
