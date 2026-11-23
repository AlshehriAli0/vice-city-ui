import type { ReactNode } from "react";

import type { Screen } from "../phone-data";
import { Fitness, FitnessDetail } from "./fitness";
import { WhatUp, ThreadView, Contacts, ContactsAll } from "./messages";
import { News, Article, Weather } from "./news";
import { Settings, WallpaperPicker, RingtonePicker, Reminders, Waink } from "./settings";
import { Snapmatic, Comments, Profile } from "./snapmatic";

const SCREENS: Partial<Record<Screen, () => ReactNode>> = {
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
