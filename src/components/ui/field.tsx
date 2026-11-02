import type {
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-olive-950 placeholder:text-stone-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:bg-stone-50 disabled:text-stone-500";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-sm font-medium text-stone-700", className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldBase, "pr-8", className)} {...props} />;
}

export function FieldGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1.5", className)} {...props} />;
}

export function FieldHint({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-stone-500", className)} {...props} />;
}

export function FieldError({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs font-medium text-red-600", className)} {...props} />;
}
