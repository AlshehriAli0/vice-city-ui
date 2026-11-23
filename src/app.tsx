import { OverlayHost } from "@ui-sdk/react/overlays";
import { useEffect, useLayoutEffect, useRef } from "react";

import { LeonidaToasts } from "./leonida/mission-toast";
import { BY_ID } from "./site/catalog";
import { DetailPage } from "./site/detail";
import { HomePage } from "./site/home";
import { useRoute } from "./site/route";
import { Search } from "./site/search";
import { ViceText } from "./ui/vice-text";

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
    const card = document.querySelector<HTMLAnchorElement>(`[data-id="${lastId.current}"] .cat-card__link`);
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
      <OverlayHost />
      <LeonidaToasts />
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
    </>
  );
};

export { App };
