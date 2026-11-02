import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3Z" />
      <path d="M9.5 12l1.8 1.8L14.5 10" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export function CartIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function AlertTriangleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5 21.5 20h-19L12 3.5Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PackageIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M21 8l-9-5-9 5 9 5 9-5Z" />
      <path d="M3 8v9l9 5 9-5V8" />
      <path d="M12 13v9" />
    </svg>
  );
}

export function TruckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 7h11v9H3V7Z" />
      <path d="M14 11h4l3 3v2h-7v-5Z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17.5" cy="18" r="1.6" />
    </svg>
  );
}

export function DropletIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3s6 6.5 6 10.5a6 6 0 1 1-12 0C6 9.5 12 3 12 3Z" />
    </svg>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 2c1 3-3 4-3 7.5a3.5 3.5 0 0 0 7 0c0-1-0.3-1.8-1-2.5 1.2 1 2 2.7 2 4.5a5 5 0 1 1-10 0C7 7 9 5 12 2Z" />
    </svg>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

export function FirstAidIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M8 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
      <path d="M12 10v6M9 13h6" />
    </svg>
  );
}

export function RadioIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="14" r="3" />
      <path d="M4 10 12 4l8 6" />
      <path d="M2 14a10 10 0 0 1 20 0" />
    </svg>
  );
}

export function LayersIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="M3 13l9 5 9-5" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function RotateIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 10a8 8 0 0 1 14.5-4.5M20 14a8 8 0 0 1-14.5 4.5" />
      <path d="M4 4v5h5M20 20v-5h-5" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8" r="3" />
      <path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" />
      <circle cx="17.5" cy="8.5" r="2.3" />
      <path d="M16.5 14.2c2.5.4 4.5 2.6 4.5 5.8" />
    </svg>
  );
}

export function LayoutDashboardIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="11" width="8" height="10" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.8 1.8 0 0 0 .4 2l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1 1.6V20a2 2 0 1 1-4 0v-.1a1.8 1.8 0 0 0-1-1.7 1.8 1.8 0 0 0-2 .4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.6-1H4a2 2 0 1 1 0-4h.1a1.8 1.8 0 0 0 1.7-1 1.8 1.8 0 0 0-.4-2l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.8 1.8 0 0 0 2 .4h.1a1.8 1.8 0 0 0 1-1.6V4a2 2 0 1 1 4 0v.1a1.8 1.8 0 0 0 1 1.6h.1a1.8 1.8 0 0 0 2-.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.8 1.8 0 0 0-.4 2v.1a1.8 1.8 0 0 0 1.6 1H20a2 2 0 1 1 0 4h-.1a1.8 1.8 0 0 0-1.6 1Z" />
    </svg>
  );
}

export function LogOutIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
