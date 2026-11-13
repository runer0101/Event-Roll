import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

/**
 * Both families are self-hosted latin subsets with a variable weight axis. They
 * used to come from `next/font/google`, which downloads from fonts.gstatic.com
 * during `next build`: a failed request there surfaces as the misleading
 * "Module not found: @vercel/turbopack-next/internal/font/google/font" and
 * takes the whole build down. See src/app/fonts/README.md.
 */
const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

const cormorant = localFont({
  src: "./fonts/cormorant-garamond-latin.woff2",
  variable: "--font-cormorant",
  display: "swap",
  weight: "300 700",
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

// Applies the stored theme before the first paint, so the page never flashes
// the wrong one. Kept as a string: it has to run ahead of React.
const themeScript = `(function(){try{var s=localStorage.getItem("event-roll-theme");var t=(s==="light"||s==="dark")?s:(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      data-theme="dark"
      suppressHydrationWarning
      className={`${inter.variable} ${cormorant.variable} ${nerdSymbols.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
