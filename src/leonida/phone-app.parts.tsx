import { Avatar, AvatarFallback, AvatarImage } from "@ui-sdk/react/avatar";
import { ChevronLeft } from "lucide-react";
import { useRef, type ReactElement, type ReactNode } from "react";

import { cssVariables } from "../ui/css-variables";
import { cx } from "../ui/cx";
import { initial, usePhone, type Contact, type Screen } from "./phone-data";
import { PhoneMenu, type PhoneMenuProps } from "./phone-menu";

const TEXT = "b, small, p, h2, h3, em, time";

function refade(root: HTMLElement | null) {
  root?.querySelectorAll<HTMLElement>(TEXT).forEach(el => {
    if (typeof el.animate === "function")
      el.animate([{ opacity: 0.38 }, { opacity: 1 }], { duration: 130, easing: "linear" });
  });
}

function Scroll({
  className,
  children,
  label,
}: {
  className?: string;
  children: ReactNode;
  label?: string;
}): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const keyAt = useRef(-1e9);
  return (
    <div
      ref={ref}
      className={cx("ld-app__scroll", className)}
      data-slot="phone-scroll"
      aria-label={label}
      onKeyDownCapture={() => {
        keyAt.current = performance.now();
      }}
      onScroll={() => {
        if (performance.now() - keyAt.current < 150) refade(ref.current);
      }}
    >
      {children}
    </div>
  );
}

function AppMenu({
  label,
  ...props
}: Omit<PhoneMenuProps, "value" | "onValueChange"> & { label: string }): ReactElement | null {
  const { entry, setFocus } = usePhone();
  return <PhoneMenu {...props} aria-label={label} value={entry.focus} onValueChange={value => setFocus(value)} />;
}

function Face({
  contact,
  size = "md",
}: {
  contact: Pick<Contact, "name" | "tone" | "art">;
  size?: "sm" | "md" | "lg";
}): ReactElement {
  return (
    <Avatar className="ld-face" data-size={size} aria-hidden="true" style={cssVariables({ "--tone": contact.tone })}>
      {contact.art && <AvatarImage className="ld-face__img ld-pic" src={contact.art} alt="" />}
      <AvatarFallback className="ld-face__fallback" delay={contact.art ? 600 : undefined}>
        {initial(contact.name)}
      </AvatarFallback>
    </Avatar>
  );
}

function AppHeader({
  title,
  end,
  tone = "light",
}: {
  title: string;
  end?: ReactNode;
  tone?: "light" | "dark";
}): ReactElement {
  return (
    <header className="ld-app__head" data-slot="phone-app-header" data-tone={tone}>
      <ChevronLeft className="ld-app__chev" aria-hidden="true" />
      <h2>{title}</h2>
      <span className="ld-app__head-end">{end}</span>
    </header>
  );
}

function App({
  screen,
  tone,
  children,
}: {
  screen: Screen;
  tone?: "dark" | "blue" | "pink";
  children: ReactNode;
}): ReactElement {
  return (
    <div className="ld-app" data-slot="phone-app" data-app={screen} data-tone={tone}>
      {children}
    </div>
  );
}

export { App, AppHeader, AppMenu, Face, Scroll };
