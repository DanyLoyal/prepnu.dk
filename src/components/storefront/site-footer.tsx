import Link from "next/link";
import { CurrentYear } from "./current-year";
import { ShieldIcon, LockIcon, RotateIcon, TruckIcon } from "@/components/icons";

const shopLinks = [
  { href: "/kategori/toerlager-og-noedmad", label: "Nødmad" },
  { href: "/kategori/vand", label: "Vand" },
  { href: "/kategori/stroem", label: "Strøm" },
  { href: "/kategori/varme", label: "Varme" },
  { href: "/kategori/faerdige-beredskabspakker", label: "Færdige pakker" },
];

const legalLinks = [
  { href: "/handelsbetingelser", label: "Handelsbetingelser" },
  { href: "/fortrydelsesret", label: "Fortrydelsesret" },
  { href: "/privatlivspolitik", label: "Privatlivspolitik" },
  { href: "/cookiepolitik", label: "Cookiepolitik" },
  { href: "/om-os", label: "Om os" },
];

const trustItems = [
  { icon: LockIcon, text: "Sikker betaling med Stripe, MobilePay, Apple Pay og Google Pay" },
  { icon: RotateIcon, text: "14 dages fortrydelsesret" },
  { icon: TruckIcon, text: "Leverance med GLS, PostNord og DAO" },
];

export function SiteFooter() {
  return (
    <footer className="bg-olive-950 text-stone-300">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <ul className="grid gap-4 border-b border-olive-800 pb-8 text-sm sm:grid-cols-3">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.text} className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-400" />
                <span>{item.text}</span>
              </li>
            );
          })}
        </ul>

        <div className="grid gap-8 py-8 sm:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 text-stone-50">
              <ShieldIcon className="h-5 w-5 text-orange-400" />
              <span className="heading-font text-sm font-semibold uppercase tracking-wide">
                Beredskab
              </span>
            </div>
            <p className="mt-3 text-sm text-stone-400">
              Dansk beredskabsudstyr til hjemmet — nødmad, vand, strøm, varme og førstehjælp.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Butik</p>
            <nav className="mt-3 flex flex-col gap-2 text-sm">
              {shopLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition hover:text-orange-400">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Information</p>
            <nav className="mt-3 flex flex-col gap-2 text-sm">
              {legalLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition hover:text-orange-400">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Kontakt</p>
            <p className="mt-3 text-sm text-stone-400">kontakt@[UDFYLD].dk</p>
            <p className="mt-1 text-sm text-stone-400">CVR [UDFYLD]</p>
          </div>
        </div>

        <p className="border-t border-olive-800 pt-6 text-xs text-stone-500">
          © <CurrentYear /> Beredskab. Alle rettigheder forbeholdes.
        </p>
      </div>
    </footer>
  );
}
