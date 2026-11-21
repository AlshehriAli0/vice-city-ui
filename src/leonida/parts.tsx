import type { ReactElement, SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement>

const svg = (props: IconProps) => ({
  viewBox: "0 0 24 24",
  width: 20,
  height: 20,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  "data-slot": "icon",
  ...props,
})

function StarIcon(props: IconProps): ReactElement {
  return (
    <svg {...svg(props)} stroke="none" fill="currentColor">
      <path d="M12 1.8l3.05 6.6 7.2.8-5.37 4.88 1.5 7.1L12 17.55 5.62 21.18l1.5-7.1L1.75 9.2l7.2-.8z" />
    </svg>
  )
}

function CloseIcon(props: IconProps): ReactElement {
  return (
    <svg {...svg(props)}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function ChevronIcon(props: IconProps): ReactElement {
  return (
    <svg {...svg(props)}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function CheckIcon(props: IconProps): ReactElement {
  return (
    <svg {...svg(props)} strokeWidth={3}>
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  )
}

function PlusIcon(props: IconProps): ReactElement {
  return (
    <svg {...svg(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function MinusIcon(props: IconProps): ReactElement {
  return (
    <svg {...svg(props)}>
      <path d="M5 12h14" />
    </svg>
  )
}

function SearchIcon(props: IconProps): ReactElement {
  return (
    <svg {...svg(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}

function ArrowIcon(props: IconProps): ReactElement {
  return (
    <svg {...svg(props)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function Kbd({ children }: { children: string }): ReactElement {
  return (
    <kbd className="ld-kbd" data-slot="kbd">
      {children}
    </kbd>
  )
}

export {
  ArrowIcon,
  CheckIcon,
  ChevronIcon,
  CloseIcon,
  Kbd,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
}
