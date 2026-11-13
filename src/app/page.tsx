import Link from "next/link";
import type { CSSProperties } from "react";
import { Magnetic } from "@/components/motion/magnetic";
import { buttonClasses } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/** One ring for every link on this page; the buttons already bring their own. */
const focusRing =
  "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-4 focus-visible:ring-offset-stone-950";

const features: Array<{
  glyph: string;
  title: string;
  text: string;
}> = [
  {
    glyph: "fileTable",
    title: "Importa tu Excel",
    text: "Sube la lista que ya tienes en .xlsx o .csv. Detectamos las columnas, avisamos de duplicados y la dejamos lista en segundos.",
  },
  {
    glyph: "key",
    title: "Un código por ayudante",
    text: "Cada persona entra con su código único. Sin emails, sin invitaciones, sin contraseñas que olvidar.",
  },
  {
    glyph: "shieldCheck",
    title: "Permisos por persona",
    text: "Decide quién ve teléfonos, quién puede editar invitados y quién solo puede marcar entradas.",
  },
  {
    glyph: "accessPoint",
    title: "Todo en vivo",
    text: "El organizador ve cada entrada al instante: invitado, hora y qué asistente lo validó.",
  },
  {
    glyph: "qrScan",
    title: "Sin dobles entradas",
    text: "Una entrada solo puede marcarse una vez. Si dos asistentes la validan a la vez, uno recibe el aviso.",
  },
  {
    glyph: "calendarCheck",
    title: "Varios eventos",
    text: "Cada evento tiene su lista, su equipo y su historial. Cambia de evento sin mezclar datos.",
  },
  {
    glyph: "chair",
    title: "Mesas y sillas",
    text: "Crea mesas, marca una silla como ocupada con un clic y mira la mesa completa en rojo al instante.",
  },
  {
    glyph: "calendarClock",
    title: "Cronograma por roles",
    text: "Asigna tareas con hora a cocina, música, decoración o puerta. Cada persona marca lo que completa.",
  },
];

const steps = [
  {
    number: "01",
    title: "Importa la lista",
    text: "Sube el Excel del cliente o agrega invitados a mano. Cada uno recibe un código de invitación.",
  },
  {
    number: "02",
    title: "Arma tu equipo",
    text: "Crea ayudantes, asígnales un código y elige exactamente qué pueden ver y hacer.",
  },
  {
    number: "03",
    title: "Controla la puerta",
    text: "Los asistentes buscan al invitado y marcan la entrada. Tú lo ves en vivo desde el panel.",
  },
  {
    number: "04",
    title: "Organiza el salón",
    text: "Crea mesas, marca sillas ocupadas y reparte tareas por hora entre todo el equipo.",
  },
];

const problems = [
  {
    number: "01",
    text: "La lista vive en tres archivos y nadie sabe cuál es el bueno.",
  },
  {
    number: "02",
    text: "El asistente marca entradas en una libreta y el organizador se entera tarde.",
  },
  {
    number: "03",
    text: "Cada ayudante ve información que no debería ver.",
  },
];

const roles: Array<{
  glyph: string;
  title: string;
  text: string;
}> = [
  {
    glyph: "accountGroup",
    title: "Organizador",
    text: "Control total: evento, lista, equipo, permisos y accesos. Es el único que puede cerrar o borrar el evento.",
  },
  {
    glyph: "shieldCheck",
    title: "Ayudantes",
    text: "Coordinan la lista y la puerta con los permisos que tú les des. No ven lo que no les corresponde.",
  },
  {
    glyph: "doorOpen",
    title: "Asistentes de puerta",
    text: "Entran con su código, buscan al invitado y marcan la entrada. Sin acceso al resto del evento.",
  },
  {
    glyph: "chefHat",
    title: "Cocina, música y decoración",
    text: "Cada rol recibe su código y su cronograma. No necesitan ver la lista de invitados para hacer su parte.",
  },
];

/** Wordmark: type only, no badge, no glyph. */
function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={`flex items-baseline ${focusRing}`}>
      <span
        className={`font-display font-semibold tracking-tight text-stone-50 ${
          compact ? "text-lg" : "text-xl"
        }`}
      >
        Event-Roll<span className="text-stone-400">.</span>
      </span>
    </Link>
  );
}

function NavLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      className={`group relative text-sm text-stone-300 transition-colors hover:text-amber-100 ${focusRing}`}
    >
      {children}
      <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-stone-400 transition-all duration-300 group-hover:w-full" />
    </a>
  );
}

/** Mono label used where the old eyebrow used to sit; no pill, no amber caps. */
function SectionIndex({ children }: { children: string }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-400">
      {children}
    </span>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-svh overflow-x-hidden bg-stone-950">
      <header
        className="intro-rise sticky top-0 z-40 border-b border-white/5 bg-stone-950/70 backdrop-blur-xl"
        style={{ "--intro-delay": "280ms" } as CSSProperties}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Wordmark />

          <nav className="hidden items-center gap-8 md:flex">
            <NavLink href="#como-funciona">Cómo funciona</NavLink>
            <NavLink href="#funciones">Funciones</NavLink>
            <NavLink href="#roles">Roles</NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className={`hidden px-3 py-2 text-sm font-medium text-stone-300 transition hover:text-amber-100 sm:block ${focusRing}`}
            >
              Entrar
            </Link>
            <Link href="/register" className={buttonClasses("primary", "sm")}>
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>

      <div aria-hidden className="rule-draw h-px bg-stone-800" />

      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="hero-halo -z-10" />
        <div aria-hidden className="hero-grid -z-10" />
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-16 pt-14 text-center sm:px-6 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20">
          <div>
            <h1 className="font-display text-[clamp(2.2rem,6.2vw,4.2rem)] font-medium leading-[1.02] text-stone-50">
              <span className="line-mask">
                <span style={{ "--i": 0 } as CSSProperties}>Cada invitado,</span>
              </span>
              <span className="line-mask">
                <span style={{ "--i": 1 } as CSSProperties}>una entrada,</span>
              </span>
              <span className="line-mask">
                <span style={{ "--i": 2 } as CSSProperties}>todo en vivo.</span>
              </span>
            </h1>

            <p
              className="intro-rise mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-stone-300 sm:text-lg"
              style={{ "--intro-delay": "500ms" } as CSSProperties}
            >
              Importa el Excel del cliente, asigna un código a cada miembro del
              equipo, organiza mesas y cronograma, y mira en vivo quién entra y
              quién lo validó. Sin planillas paralelas, sin gritos por WhatsApp.
            </p>

            <div
              className="intro-rise mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
              style={{ "--intro-delay": "580ms" } as CSSProperties}
            >
              <Magnetic>
                <Link
                  href="/register"
                  className={buttonClasses("primary", "lg", "px-7")}
                >
                  Empezar gratis
                </Link>
              </Magnetic>
              <Link
                href="/staff"
                className={`text-sm font-medium text-stone-300 underline decoration-stone-500 underline-offset-4 transition hover:text-stone-50 hover:decoration-stone-300 ${focusRing}`}
              >
                Entrar como asistente
              </Link>
            </div>
          </div>

        </div>
      </section>

      <section className="relative border-b border-stone-800/70 bg-stone-900/40">
        <div className="grid gap-10 px-4 py-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20 lg:px-16 lg:py-20 xl:px-24">
          <div data-reveal className="lg:sticky lg:top-28 lg:self-start">
            <div className="flex items-center gap-4">
              <span aria-hidden className="h-px flex-1 bg-stone-800" />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-400">
                El problema
              </span>
            </div>
            <h2 className="mt-8 max-w-lg text-balance font-display text-[clamp(1.8rem,3.4vw,2.9rem)] font-medium leading-[1.05] text-stone-50">
              El Excel funciona
              <span className="mt-2 block text-stone-400">
                hasta que llega la puerta.
              </span>
            </h2>
          </div>

          <ol className="border-t border-stone-800/70">
            {problems.map((problem) => (
              <li
                key={problem.number}
                className="row-accent group flex items-baseline gap-5 border-b border-stone-800/70 py-5 sm:gap-8 sm:py-6"
              >
                <span className="font-display text-3xl font-medium leading-none tabular-nums text-stone-700 transition-colors duration-300 group-hover:text-amber-300 sm:text-4xl">
                  {problem.number}
                </span>
                <p className="max-w-md text-sm leading-relaxed text-stone-300 transition-colors duration-300 group-hover:text-stone-100 sm:text-base">
                  {problem.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="como-funciona" className="relative scroll-mt-24">
        <div className="mx-auto max-w-[92rem] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
          <div
            data-reveal
            className="flex flex-col gap-5 border-t border-stone-800/70 pt-8 lg:flex-row lg:items-end lg:justify-between"
          >
            <h2 className="max-w-2xl text-balance font-display text-[clamp(1.9rem,4vw,3rem)] font-medium leading-[1.05] text-stone-50">
              De la lista del cliente a la puerta,
              <span className="text-stone-400"> en cuatro pasos.</span>
            </h2>
            <SectionIndex>Cómo funciona</SectionIndex>
          </div>

          <div
            data-reveal="clip"
            className="mt-12 grid gap-px border border-stone-800/70 bg-stone-800/70 sm:grid-cols-2 lg:grid-cols-4"
          >
            {steps.map((step) => (
              <div
                key={step.number}
                className="group relative overflow-hidden bg-stone-950 p-6 transition-colors duration-300 hover:bg-stone-900/70 sm:p-8"
              >
                <span className="font-mono text-[11px] tabular-nums text-stone-500 transition-colors duration-300 group-hover:text-amber-300">
                  {step.number}
                </span>
                <h3 className="relative mt-3 font-display text-xl font-medium text-stone-50">
                  {step.title}
                </h3>
                <p className="relative mt-2 max-w-sm text-sm leading-relaxed text-stone-300">
                  {step.text}
                </p>
                <span
                  aria-hidden
                  className="absolute bottom-0 left-0 h-px w-0 bg-stone-400 transition-all duration-500 group-hover:w-full"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="funciones"
        className="mx-auto max-w-[92rem] scroll-mt-24 px-4 py-16 sm:px-6 lg:px-10 lg:py-24"
      >
        <div data-reveal className="relative border-t border-stone-800/70 pt-8">
          <h2 className="relative max-w-3xl text-balance font-display text-[clamp(1.9rem,4vw,3rem)] font-medium leading-[1.05] text-stone-50">
            Todo lo que pasa en la puerta,
            <span className="text-stone-400"> sin planillas paralelas.</span>
          </h2>
        </div>

        <div className="mt-10 grid border-t border-stone-800/70 sm:grid-cols-2">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="row-accent group border-b border-stone-800/70 px-5 py-7"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-xl font-medium text-stone-50">
                  {feature.title}
                </h3>
                <span className="font-mono text-[10px] tabular-nums text-stone-600 transition-colors duration-300 group-hover:text-amber-300/80">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone-400">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="roles"
        className="border-y border-stone-800/70 bg-stone-900/30"
      >
        <div className="grid gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-16 lg:px-10 lg:py-24">
          <div data-reveal className="lg:sticky lg:top-28">
            <SectionIndex>Roles</SectionIndex>
            <h2 className="mt-5 text-balance font-display text-[clamp(1.9rem,4vw,3rem)] font-medium leading-[1.05] text-stone-50">
              Cada persona ve exactamente
              <span className="text-stone-400"> lo que necesita.</span>
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-stone-300">
              Usted organiza: la lista, el equipo y quién puede entrar. Los
              ayudantes y asistentes solo ven la parte que les toca, con un
              código único por persona.
            </p>
            <div className="mt-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-stone-400">
              <span aria-hidden className="h-px w-10 bg-amber-400/50" />
              Un código no abre el evento de otro.
            </div>
          </div>

          <ul className="border-y border-stone-800/70">
            {roles.map((role, index) => (
              <li
                key={role.title}
                data-reveal
                style={{ "--reveal-delay": `${index * 70}ms` } as CSSProperties}
                className="row-accent group border-b border-stone-800/70 last:border-b-0"
              >
                <div className="flex items-start gap-4 px-4 py-6 sm:gap-6 sm:px-6">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-display text-xl font-medium text-stone-50">
                        {role.title}
                      </h3>
                      <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-stone-600 transition-colors duration-300 group-hover:text-amber-300/70">
                        0{index + 1}
                      </span>
                    </div>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-300">
                      {role.text}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The page ends in one inverted band: flat amber, black type, no glow. */}
      <section className="border-b border-amber-500/30 bg-amber-300 text-stone-950">
        <div
          data-reveal="clip"
          className="px-4 py-16 sm:px-8 lg:px-16 lg:py-24 xl:px-24"
        >
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div className="max-w-xl">
              <h2 className="text-balance font-display text-[clamp(2.1rem,5vw,3.8rem)] font-medium leading-[1.02]">
                Empieza con una lista
                <span className="mt-1 block text-stone-950/60">ordenada.</span>
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-stone-900/80">
                Crea tu cuenta, importa el Excel y comparte el primer código con
                tu equipo. En menos de cinco minutos.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 lg:pb-2">
              <Link
                href="/register"
                className={`inline-flex h-12 items-center rounded-sm bg-stone-950 px-7 text-base font-medium text-stone-50 transition hover:bg-stone-800 ${focusRing}`}
              >
                Crear mi cuenta
              </Link>
              <Link
                href="/login"
                className={`text-sm font-medium underline decoration-stone-950/40 underline-offset-4 transition hover:decoration-stone-950 ${focusRing}`}
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-800/70 bg-stone-950/80">
        <div className="h-px bg-stone-800" />
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-4 py-10 text-sm text-stone-400 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Wordmark compact />
            <span className="hidden h-4 w-px bg-stone-700 sm:block" />
            <p className="hidden sm:block">
              Lista de invitados y control de acceso en vivo.
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <Link
              href="/login"
              className={`transition hover:text-amber-100 ${focusRing}`}
            >
              Organizadores
            </Link>
            <Link
              href="/staff"
              className={`transition hover:text-amber-100 ${focusRing}`}
            >
              Asistentes
            </Link>
            <span className="text-stone-600">MIT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
