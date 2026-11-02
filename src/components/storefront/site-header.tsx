"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldIcon, SearchIcon, CartIcon, MenuIcon, XIcon } from "@/components/icons";
import { CartCount } from "./cart-count";

const navLinks = [
  { href: "/kategori/toerlager-og-noedmad", label: "Nødmad" },
  { href: "/kategori/vand", label: "Vand" },
  { href: "/kategori/stroem", label: "Strøm" },
  { href: "/kategori/varme", label: "Varme" },
  { href: "/kategori/faerdige-beredskabspakker", label: "Pakker" },
  { href: "/beredskabsberegner", label: "Beredskabsberegner" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-olive-800 bg-olive-950 text-stone-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <ShieldIcon className="h-6 w-6 text-orange-400" />
          <span className="heading-font text-lg font-semibold tracking-wide uppercase">
            Beredskab
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-stone-200 transition hover:text-orange-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <form action="/soegning" method="get" className="relative hidden sm:block">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              name="q"
              placeholder="Søg..."
              aria-label="Søg i butikken"
              className="w-40 rounded-md border border-olive-700 bg-olive-900 px-3 py-1.5 pl-8 text-sm text-stone-50 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-orange-400 lg:w-56"
            />
          </form>
          <Link
            href="/kurv"
            className="relative flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-olive-950 transition hover:bg-orange-400"
          >
            <CartIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Kurv</span>
            <CartCount />
          </Link>
          <button
            type="button"
            aria-label={mobileOpen ? "Luk menu" : "Åbn menu"}
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-md p-2 text-stone-200 hover:bg-olive-800 lg:hidden"
          >
            {mobileOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-olive-800 bg-olive-950 px-4 py-4 lg:hidden">
          <form action="/soegning" method="get" className="relative mb-4">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              name="q"
              placeholder="Søg..."
              aria-label="Søg i butikken"
              className="w-full rounded-md border border-olive-700 bg-olive-900 px-3 py-2 pl-8 text-sm text-stone-50 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </form>
          <nav className="flex flex-col gap-1 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2 py-2.5 text-stone-200 transition hover:bg-olive-800 hover:text-orange-400"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
