import { ChevronLeft, MapPin, Sun, Cloud } from "lucide-react";

import { cssVariables } from "../../../shared/css-variables";
import { usePhone } from "../phone-data";
import { PhoneMenuItem } from "../phone-menu";
import { App, AppMenu, Scroll } from "./app-layout";

const STORIES = [
  { id: "s1", tone: "linear-gradient(150deg,#6f8a5a,#2f3a2a)" },
  { id: "s2", tone: "linear-gradient(150deg,#5a7ab0,#2a3550)" },
  { id: "s3", tone: "linear-gradient(150deg,#b05ad0,#3a2a60)" },
  { id: "s4", tone: "linear-gradient(150deg,#a0a0a8,#4a4a58)" },
  { id: "s5", tone: "linear-gradient(150deg,#3a4a7a,#1a2040)" },
  { id: "s6", tone: "linear-gradient(150deg,#c8a070,#6a4a30)" },
];

const Source = () => (
  <small className="ld-news__source">
    <i aria-hidden="true" />
    News outlet
  </small>
);

const News = () => {
  const { go } = usePhone();
  return (
    <App screen="news">
      <Scroll>
        <AppMenu label="Headlines" onOpen={id => go({ screen: "article", param: id })}>
          {STORIES.map((story, index) => (
            <PhoneMenuItem
              key={story.id}
              value={story.id}
              className="ld-app__card ld-news__row"
              aria-label={`Headline ${index + 1}`}
            >
              <span className="ld-app__lines">
                <p>Headline placeholder that runs on to a second line</p>
                <Source />
              </span>
              <span className="ld-news__thumb ld-pic" style={cssVariables({ "--media": story.tone })} />
            </PhoneMenuItem>
          ))}
        </AppMenu>
      </Scroll>
    </App>
  );
};

const Article = () => {
  const { entry } = usePhone();
  const story = STORIES.find(item => item.id === entry.param) ?? STORIES[0];
  return (
    <App screen="article">
      <Scroll className="ld-news__article">
        <em className="ld-news__back">
          <ChevronLeft aria-hidden="true" /> Back
        </em>
        <h2>Headline placeholder that runs on to a second and third line</h2>
        <span className="ld-news__hero ld-pic" style={cssVariables({ "--media": story.tone })} />
        <Source />
        <small>By Reporter name</small>
        <p>Body copy placeholder. The article text runs here in short paragraphs.</p>
        <p>A second paragraph of placeholder body copy.</p>
      </Scroll>
    </App>
  );
};

const HOURS = [
  ["10", "AM", 78],
  ["11", "AM", 80],
  ["12", "PM", 82],
  ["1", "PM", 81],
  ["2", "PM", 81],
] as const;

const WEATHER_WORD = { cloud: "Cloudy", partly: "Partly Cloudy", sun: "Clear" };

const Weather = () => {
  const { temperature, weather } = usePhone();
  const Glyph = weather === "cloud" ? Cloud : Sun;
  const word = WEATHER_WORD[weather];
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
  );
};

export { News, Article, Weather };
