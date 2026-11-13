import Link from "next/link";
import { Brand } from "@/components/ui/brand";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden overflow-hidden border-r border-stone-800/60 bg-stone-950 p-12 text-stone-50 lg:flex lg:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        <Link href="/" className="group relative flex items-center gap-2.5">
          <Brand size="md" />
        </Link>

        <div className="relative mt-auto max-w-md">
          <p className="eyebrow">Control de acceso</p>
          <p className="mt-4 font-display text-4xl font-medium leading-[1.05] tracking-tight">
            La puerta de tu evento,
            <span className="block text-stone-400">en una sola pantalla.</span>
          </p>
          <p className="mt-5 text-sm leading-relaxed text-stone-300">
            Importa la lista, asigna códigos a tu equipo y sigue los accesos en
            vivo. El organizador principal conserva el control; cada ayudante ve
            solo lo que le corresponde.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-stone-300">
            {[
              "Un código único por ayudante",
              "Permisos granulares por persona",
              "Cada entrada se marca una sola vez",
              "Panel del organizador en vivo",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span aria-hidden className="h-px w-4 bg-stone-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative mt-auto pt-12 text-xs text-stone-500">
          Event-Roll · Control de acceso para eventos
        </p>
      </aside>

      <main className="relative flex items-center justify-center overflow-hidden px-4 py-10 sm:px-8">
        <div className="absolute right-4 top-4 sm:right-8">
          <ThemeToggle />
        </div>
        <div className="relative w-full max-w-md">
          <Link href="/" className="group mb-10 flex items-center gap-2.5 lg:hidden">
            <Brand size="md" />
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
