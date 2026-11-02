import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const headingFont = Oswald({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Beredskab — udstyr til kriser og nødsituationer",
    template: "%s | Beredskab",
  },
  description:
    "Dansk webshop med beredskabsudstyr: nødmad, vand, strøm, varme og førstehjælp. Hurtig levering, sikker betaling.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="da"
      className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
