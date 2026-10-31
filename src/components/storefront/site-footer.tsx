import Link from "next/link";
import { CurrentYear } from "./current-year";

const legalLinks = [
  { href: "/handelsbetingelser", label: "Handelsbetingelser" },
  { href: "/fortrydelsesret", label: "Fortrydelsesret" },
  { href: "/privatlivspolitik", label: "Privatlivspolitik" },
  { href: "/cookiepolitik", label: "Cookiepolitik" },
  { href: "/om-os", label: "Om os" },
];

const trustItems = [
  "Sikker betaling med Stripe, MobilePay, Apple Pay og Google Pay",
  "14 dages fortrydelsesret",
  "Leverance med GLS, PostNord og DAO",
];

export function SiteFooter() {
  return (
    <footer className="bg-olive-950 text-stone-200">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <ul className="grid gap-3 border-b border-olive-700 pb-8 text-sm sm:grid-cols-3">
          {trustItems.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span aria-hidden className="text-orange-400">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="heading-font text-sm uppercase tracking-wide text-stone-50">
            Beredskab
          </p>
          <nav className="flex flex-wrap gap-4 text-sm">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-stone-300 transition hover:text-orange-400"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-6 text-xs text-stone-400">
          © <CurrentYear /> Beredskab. CVR [UDFYLD].
        </p>
      </div>
    </footer>
  );
}
