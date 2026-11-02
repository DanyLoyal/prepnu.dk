import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-stone-100 text-stone-700 ring-1 ring-stone-200",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  warning: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-1 ring-red-200",
  info: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  dark: "bg-olive-950 text-stone-50",
  orange: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: { tone?: keyof typeof tones } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
