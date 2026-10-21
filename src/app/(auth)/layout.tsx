import Link from "next/link";
import { ScanLine } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden overflow-hidden bg-stone-950 p-12 text-stone-50 lg:flex lg:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-orange-600/20 blur-3xl"
        />
        <Link href="/" className="relative flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-stone-950">
            <ScanLine className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Event-Roll
          </span>
        </Link>

        <div className="relative mt-auto max-w-md">
          <p className="text-3xl font-semibold leading-tight tracking-tight">
            La puerta de tu evento, en una sola pantalla.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-stone-300">
            Importa la lista, asigna códigos a tu equipo y sigue los accesos en
            vivo. El organizador principal conserva el control; cada ayudante ve
            solo lo que le corresponde.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-stone-300">
            {[
              "Un código único por ayudante",
              "Permisos granulares por persona",
              "Check-in atómico, sin dobles entradas",
              "Panel del organizador en vivo",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative mt-auto pt-12 text-xs text-stone-500">
          Event-Roll · Control de acceso para eventos
        </p>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 flex items-center gap-2.5 lg:hidden"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-stone-950">
              <ScanLine className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Event-Roll
            </span>
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
