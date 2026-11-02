import Link from "next/link";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const variants = {
  primary: "bg-orange-600 text-white hover:bg-orange-700 focus-visible:ring-orange-500",
  dark: "bg-olive-950 text-stone-50 hover:bg-olive-900 focus-visible:ring-olive-700",
  outline:
    "border border-stone-300 bg-white text-olive-900 hover:border-orange-400 hover:text-orange-600 focus-visible:ring-orange-400",
  "outline-light":
    "border border-white/30 text-stone-50 hover:border-orange-400 hover:text-orange-400 focus-visible:ring-orange-400",
  ghost: "text-olive-800 hover:bg-stone-100 focus-visible:ring-stone-300",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

interface ButtonOwnProps {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonOwnProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  href,
  ...props
}: ButtonOwnProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}
