import Link from "next/link";
import { GoldParticles } from "@/components/motion/gold-particles";
import { NerdGlyph } from "@/components/ui/nerd-glyph";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden overflow-hidden border-r border-stone-800/60 bg-stone-950 p-12 text-stone-50 lg:flex lg:flex-col">
        <div aria-hidden className="absolute inset-0">
          <div className="rays absolute -left-40 -top-72 h-[48rem] w-[48rem] opacity-70" />
          <GoldParticles count={30} />
          <div className="absolute -right-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-stone-950" />
        </div>

        <Link href="/" className="group relative flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-300/40 bg-gradient-to-b from-amber-200 to-amber-500 text-stone-950 shadow-[0_8px_24px_-12px_rgba(212,175,55,0.8)] transition-transform duration-500 group-hover:rotate-3">
            <NerdGlyph name="ticket" className="text-[1.2rem]" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">
            Event-Roll<span className="text-amber-400">.</span>
          </span>
        </Link>

        <div className="relative mt-auto max-w-md">
          <p className="eyebrow">Control de acceso</p>
          <p className="mt-4 font-display text-4xl font-medium leading-[1.05] tracking-tight">
            La puerta de tu evento,
            <span className="block italic text-gold">en una sola pantalla.</span>
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
              "Check-in atómico, sin dobles entradas",
              "Panel del organizador en vivo",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rotate-45 bg-amber-400" />
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
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-amber-400/5 blur-3xl"
        />
        <div className="relative w-full max-w-md">
          <Link href="/" className="group mb-10 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-300/40 bg-gradient-to-b from-amber-200 to-amber-500 text-stone-950">
              <NerdGlyph name="ticket" className="text-[1.2rem]" />
            </span>
            <span className="font-display text-xl font-semibold tracking-tight text-stone-50">
              Event-Roll<span className="text-amber-400">.</span>
            </span>
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
