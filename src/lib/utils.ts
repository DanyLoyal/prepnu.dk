type ClassValue = string | number | null | undefined | false | Record<string, boolean | undefined>;

export function cn(...inputs: ClassValue[]): string {
  const parts: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === "string" || typeof input === "number") {
      parts.push(String(input));
      continue;
    }
    for (const [key, value] of Object.entries(input)) {
      if (value) parts.push(key);
    }
  }
  return parts.join(" ");
}
