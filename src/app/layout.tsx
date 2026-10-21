import type { Metadata } from "next";
import "./globals.css";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
