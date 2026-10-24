import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

/**
 * 1.9 KB subset of Symbols Nerd Font with only the decorative glyphs the site
 * uses. `block` avoids a flash of tofu in the logo badges; the file is
 * preloaded by next/font.
 */
const nerdSymbols = localFont({
  src: "./fonts/nerd-symbols.woff2",
  variable: "--font-nerd",
  display: "block",
  preload: true,
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Event-Roll — Control de acceso y lista de invitados en vivo",
    template: "%s · Event-Roll",
  },
  description:
    "Organiza la lista de invitados de tu evento, asigna códigos a tus ayudantes y controla en vivo quién entra y quién no.",
  openGraph: {
    title: "Event-Roll — Control de acceso y lista de invitados en vivo",
    description:
      "Importa tu lista desde Excel, asigna códigos a tu equipo y mira los accesos en tiempo real.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${cormorant.variable} ${nerdSymbols.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
