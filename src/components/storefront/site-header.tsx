import Link from "next/link";

const navLinks = [
  { href: "/kategori/toerlager-og-noedmad", label: "Nødmad" },
  { href: "/kategori/vand", label: "Vand" },
  { href: "/kategori/stroem", label: "Strøm" },
  { href: "/kategori/varme", label: "Varme" },
  { href: "/kategori/faerdige-beredskabspakker", label: "Pakker" },
  { href: "/beredskabsberegner", label: "Beredskabsberegner" },
];

export function SiteHeader() {
  return (
    <header className="bg-olive-950 text-stone-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="heading-font text-xl font-semibold tracking-wide uppercase">
          Beredskab
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
        <div className="flex items-center gap-4">
          <form action="/soegning" method="get" className="hidden sm:block">
            <input
              type="search"
              name="q"
              placeholder="Søg..."
              aria-label="Søg i butikken"
              className="w-40 rounded-md border border-olive-700 bg-olive-900 px-3 py-1.5 text-sm text-stone-50 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-orange-400 lg:w-56"
            />
          </form>
          <Link
            href="/kurv"
            className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-olive-950 transition hover:bg-orange-400"
          >
            Kurv
          </Link>
        </div>
      </div>
    </header>
  );
}
