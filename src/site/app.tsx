import { useEffect, useLayoutEffect, useRef } from "react";

import { ViceText } from "../ui/display/vice-text";
import { BY_ID } from "./catalogue/catalogue";
import { HomePage } from "./catalogue/catalogue-page";
import { DetailPage } from "./catalogue/component-page";
import { hrefOf, useRoute } from "./catalogue/hash-route";
import githubMark from "./github-mark.svg";
import { Search } from "./search/search";
import { SiteOverlays } from "./site-overlays";

const App = () => {
  const route = useRoute();
  const homeScroll = useRef(0);
  const lastId = useRef<string | null>(null);
  const isHome = route.page === "home";

  useLayoutEffect(() => {
    if (route.page === "component") {
      lastId.current = route.id;
      document.title = `${BY_ID.get(route.id)?.name ?? "Component"} · Vice City UI`;
      return;
    }
    document.title = "Vice City UI";
    if (!lastId.current) return;
    window.scrollTo(0, homeScroll.current);
    const card = document.querySelector<HTMLAnchorElement>(`.cat-card__link[href="${hrefOf(lastId.current)}"]`);
    if (card) card.focus({ preventScroll: true });
    else document.getElementById("home-title")?.focus({ preventScroll: true });
  }, [route]);

  useEffect(() => {
    if (!isHome) return undefined;
    const remember = () => {
      homeScroll.current = window.scrollY;
    };
    window.addEventListener("scroll", remember, { passive: true });
    return () => window.removeEventListener("scroll", remember);
  }, [isHome]);

  return (
    <>
      <SiteOverlays />
      <a
        className="skip"
        href="#main"
        onClick={event => {
          event.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="topbar">
        <ViceText render={<a className="brand" href="#/" aria-label="Vice City UI" />}>Vice City UI</ViceText>
        <Search />
      </header>

      <main id="main" tabIndex={-1}>
        {route.page === "component" ? <DetailPage id={route.id} /> : <HomePage />}
      </main>

      <footer className="footer">
        <a href="https://github.com/AlshehriAli0/vice-city-ui" aria-label="Vice City UI on GitHub">
          <img src={githubMark} alt="" width={24} height={24} />
        </a>
      </footer>
    </>
  );
};

export { App };
