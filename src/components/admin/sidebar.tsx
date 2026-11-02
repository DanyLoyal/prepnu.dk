"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboardIcon,
  PackageIcon,
  TruckIcon,
  RadioIcon,
  SettingsIcon,
  ShieldIcon,
} from "@/components/icons";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon, exact: true },
  { href: "/admin/produkter", label: "Produkter", icon: PackageIcon },
  { href: "/admin/ordrer", label: "Ordrer", icon: TruckIcon },
  { href: "/admin/leverandoerer", label: "Leverandører", icon: RadioIcon },
  { href: "/admin/indstillinger", label: "Indstillinger", icon: SettingsIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 flex-shrink-0 border-r border-olive-800 bg-olive-950 text-stone-200 lg:flex lg:flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <ShieldIcon className="h-6 w-6 text-orange-400" />
        <span className="heading-font text-sm font-semibold uppercase tracking-wide text-stone-50">
          Beredskab
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-olive-800 text-stone-50"
                  : "text-stone-300 hover:bg-olive-900 hover:text-stone-50",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 text-xs text-stone-500">
        <Link href="/" className="hover:text-orange-400">
          ← Til butikken
        </Link>
      </div>
    </aside>
  );
}
