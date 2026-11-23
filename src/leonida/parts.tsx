import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const svg = (props: IconProps) => ({
  viewBox: "0 0 24 24",
  width: 20,
  height: 20,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "data-slot": "icon",
  ...props,
});

const StarIcon = (props: IconProps) => (
  <svg aria-hidden="true" {...svg(props)} stroke="none" fill="currentColor">
    <path d="M12 1.8l3.05 6.6 7.2.8-5.37 4.88 1.5 7.1L12 17.55 5.62 21.18l1.5-7.1L1.75 9.2l7.2-.8z" />
  </svg>
);

const CloseIcon = (props: IconProps) => (
  <svg aria-hidden="true" {...svg(props)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const ChevronIcon = (props: IconProps) => (
  <svg aria-hidden="true" {...svg(props)}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const CheckIcon = (props: IconProps) => (
  <svg aria-hidden="true" {...svg(props)} strokeWidth={3}>
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);

const PlusIcon = (props: IconProps) => (
  <svg aria-hidden="true" {...svg(props)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const MinusIcon = (props: IconProps) => (
  <svg aria-hidden="true" {...svg(props)}>
    <path d="M5 12h14" />
  </svg>
);

const SearchIcon = (props: IconProps) => (
  <svg aria-hidden="true" {...svg(props)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

const ArrowIcon = (props: IconProps) => (
  <svg aria-hidden="true" {...svg(props)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const Kbd = ({ children }: { children: string }) => (
  <kbd className="ld-kbd" data-slot="kbd">
    {children}
  </kbd>
);

export { ArrowIcon, CheckIcon, ChevronIcon, CloseIcon, Kbd, MinusIcon, PlusIcon, SearchIcon, StarIcon };
