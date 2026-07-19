import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement>

function base(props: IconProps) {
  return {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  }
}

export function PencilIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 20h4L18.5 9.5a2 2 0 0 0-2.83-2.83L5 17.2V20Z" />
      <path d="M14 6.5 17.5 10" />
    </svg>
  )
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9" />
    </svg>
  )
}

export function RouteIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="5" r="2" />
      <path d="M7 19h6a4 4 0 0 0 4-4V9a4 4 0 0 1 4-4" strokeDasharray="1 3.2" />
    </svg>
  )
}

export function TrendingUpIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m4 16 5.5-6 4 4L20 6" />
      <path d="M15 6h5v5" />
    </svg>
  )
}

export function AssetChartIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M4 20h16" />
    </svg>
  )
}

export function FlagIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 3v18" />
      <path d="M6 4h11l-2.5 3.5L17 11H6" />
    </svg>
  )
}

export function FileTextIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v4h4" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  )
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10.5 8.5 15.5 12l-5 3.5Z" />
    </svg>
  )
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13a7.97 7.97 0 0 0 0-2l2-1.5-2-3.4-2.4.7a8 8 0 0 0-1.7-1L14.8 3h-3.6l-.5 2.8a8 8 0 0 0-1.7 1l-2.4-.7-2 3.4L6.6 11a7.97 7.97 0 0 0 0 2l-2 1.5 2 3.4 2.4-.7a8 8 0 0 0 1.7 1l.5 2.8h3.6l.5-2.8a8 8 0 0 0 1.7-1l2.4.7 2-3.4Z" />
    </svg>
  )
}

export function BellIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  )
}

export function RefreshIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12a8 8 0 0 1 14-5.2M20 12a8 8 0 0 1-14 5.2" />
      <path d="M18 3v4h-4M6 21v-4h4" />
    </svg>
  )
}

export function CompassIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m14.5 9.5-2 5-5 2 2-5 5-2Z" />
    </svg>
  )
}

export function LighthouseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 3h4l1 4h-6l1-4Z" />
      <path d="M9 7h6l1.5 13a1 1 0 0 1-1 1.1H8.5a1 1 0 0 1-1-1.1L9 7Z" />
      <path d="M8.2 12h7.6M7.7 16.5h8.6" />
      <path d="M4 9l2.5 1.5M4 15l2.5-1M20 9l-2.5 1.5M20 15l-2.5-1" />
    </svg>
  )
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function MinusIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14" />
    </svg>
  )
}

export function LocateIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </svg>
  )
}

export function InfoIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 8v.01" />
    </svg>
  )
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 6H6a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-3" />
      <path d="M14 4h6v6M20 4 11 13" />
    </svg>
  )
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s7-6.4 7-11.5A7 7 0 0 0 5 9.5C5 14.6 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  )
}

export function WarningTriangleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4 2.5 20h19L12 4Z" />
      <path d="M12 10.5v4M12 17.5v.01" />
    </svg>
  )
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="5.5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </svg>
  )
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5" />
    </svg>
  )
}

export function WalletIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 8a2 2 0 0 1 2-2h11a1 1 0 0 1 1 1v2" />
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M16 14.5h2.5" />
    </svg>
  )
}

export function ReceiptIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5Z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  )
}

export function PiggyBankIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12a6 6 0 0 1 6-6h4a5 5 0 0 1 5 3h1.5L20 11v3l-2 .5a5 5 0 0 1-1 1.7V18a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-.5H9V18a1 1 0 0 1-1 1H6.5a1 1 0 0 1-1-1v-2A6 6 0 0 1 4 12Z" />
      <path d="M9 9V7M17 12h.01" />
    </svg>
  )
}
