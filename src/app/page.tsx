import Link from "next/link";
import { Fragment, type CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { GoldParticles } from "@/components/motion/gold-particles";
import { Magnetic } from "@/components/motion/magnetic";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { buttonClasses } from "@/components/ui/button";
import { NerdGlyph, type NerdGlyphName } from "@/components/ui/nerd-glyph";

const features: Array<{
  glyph: NerdGlyphName;
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
    text: "El organizador ve cada entrada al instante: invitado, hora y qué guardia lo validó.",
  },
  {
    glyph: "qrScan",
    title: "Check-in atómico",
    text: "Una entrada solo puede marcarse una vez. Si dos guardias la validan a la vez, uno recibe el aviso.",
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
    text: "Los guardias buscan al invitado y marcan la entrada. Tú lo ves en vivo desde el panel.",
  },
  {
    number: "04",
    title: "Organiza el salón",
    text: "Crea mesas, marca sillas ocupadas y reparte tareas por hora entre todo el equipo.",
  },
];

const roles: Array<{
  glyph: NerdGlyphName;
  title: string;
  text: string;
}> = [
  {
    glyph: "accountGroup",
    title: "Organizador root",
    text: "Control total: evento, lista, equipo, permisos y accesos. Es el único que puede cerrar o borrar el evento.",
  },
  {
    glyph: "shieldCheck",
    title: "Ayudantes",
    text: "Coordinan la lista y la puerta con los permisos que tú les des. No ven lo que no les corresponde.",
  },
  {
    glyph: "doorOpen",
    title: "Guardias",
    text: "Entran con su código, buscan al invitado y marcan la entrada. Sin acceso al resto del evento.",
  },
  {
    glyph: "chefHat",
    title: "Cocina, música y decoración",
    text: "Cada rol recibe su código y su cronograma. No necesitan ver la lista de invitados para hacer su parte.",
  },
];

const marquee = [
  "Puerta",
  "Coordinación",
  "Cocina",
  "Música",
  "Decoración",
  "Invitados",
  "Mesas",
  "Cronograma",
];

function HeroWords({
  text,
  start,
  gold = false,
}: {
  text: string;
  start: number;
  gold?: boolean;
}) {
  return (
    <>
      {text.split(" ").map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span
            className={`hero-word ${gold ? "text-gold" : ""}`}
            style={{ animationDelay: `${start + index * 55}ms` }}
          >
            {word}
          </span>{" "}
        </Fragment>
      ))}
    </>
  );
}

/** Pure-CSS landing intro: two ink panels part like a door. */
function DoorIntro() {
  return (
    <div aria-hidden className="door-intro">
      <div className="door-panel door-panel-left" />
      <div className="door-panel door-panel-right" />
      <span className="door-seam" />
      <span className="door-mark">
        <NerdGlyph
          name="doorOpen"
          className="text-gold text-[clamp(2.2rem,7vw,3.4rem)]"
        />
      </span>
    </div>
  );
}

function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-amber-300/40 bg-gradient-to-b from-amber-200 to-amber-500 text-stone-950 shadow-[0_8px_24px_-12px_rgba(212,175,55,0.8)] transition-transform duration-500 group-hover:rotate-3">
        <NerdGlyph name="ticket" className="text-[1.2rem]" />
      </span>
      <span
        className={`font-display font-semibold tracking-tight text-stone-50 ${
          compact ? "text-lg" : "text-xl"
        }`}
      >
        Event-Roll
        <span className="text-amber-400">.</span>
      </span>
    </Link>
  );
}

function NavLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      className="group relative text-sm text-stone-300 transition-colors hover:text-amber-100"
    >
      {children}
      <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gradient-to-r from-amber-400 to-transparent transition-all duration-300 group-hover:w-full" />
    </a>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-svh overflow-x-hidden bg-stone-950">
      <DoorIntro />

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

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-xl px-3 py-2 text-sm font-medium text-stone-300 transition hover:text-amber-100 sm:block"
            >
              Entrar
            </Link>
            <Link href="/register" className={buttonClasses("primary", "sm")}>
              Crear cuenta
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="rays absolute left-1/2 top-[-38rem] h-[78rem] w-[78rem] -translate-x-1/2 opacity-70" />
          <GoldParticles count={48} />
          <div className="absolute -right-40 top-10 h-[28rem] w-[28rem] rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute -left-40 bottom-0 h-[24rem] w-[24rem] rounded-full bg-amber-300/5 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-10 sm:gap-16 sm:px-6 sm:pb-24 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:px-8 lg:pb-32 lg:pt-20">
          <div>
            <span
              className="intro-rise inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/5 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-amber-200"
              style={{ "--intro-delay": "300ms" } as CSSProperties}
            >
              <NerdGlyph
                name="accessPoint"
                className="text-[0.95rem] text-amber-300"
              />
              Control de acceso en vivo
            </span>

            <h1 className="mt-7 font-display text-[clamp(2.4rem,8.7vw,4.6rem)] font-medium leading-[0.98] text-stone-50">
              <span className="block">
                <HeroWords text="Cada invitado," start={340} />
              </span>
              <span className="block">
                <HeroWords text="una entrada," start={470} />
              </span>
              <span className="block italic">
                <HeroWords text="todo en vivo." start={600} gold />
              </span>
            </h1>

            <p
              className="intro-rise mt-6 max-w-xl text-pretty text-base leading-relaxed text-stone-300 sm:text-lg"
              style={{ "--intro-delay": "500ms" } as CSSProperties}
            >
              Importa el Excel del cliente, asigna un código a cada miembro del
              equipo, organiza mesas y cronograma, y mira en vivo quién entra y
              quién lo validó. Sin planillas paralelas, sin gritos por WhatsApp.
            </p>

            <div
              className="intro-rise mt-9 flex flex-wrap items-center gap-3"
              style={{ "--intro-delay": "580ms" } as CSSProperties}
            >
              <Magnetic>
                <Link
                  href="/register"
                  className={buttonClasses("primary", "lg", "px-7")}
                >
                  Empezar gratis
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Magnetic>
              <Link
                href="/staff"
                className={buttonClasses("outline", "lg", "px-7")}
              >
                Entrar como guardia
              </Link>
            </div>

            <div
              className="intro-rise mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone-400"
              style={{ "--intro-delay": "650ms" } as CSSProperties}
            >
              <span className="flex items-center gap-2">
                <NerdGlyph name="checkCircle" className="text-[0.9rem] text-amber-400" />
                Sin tarjeta
              </span>
              <span className="flex items-center gap-2">
                <NerdGlyph name="checkCircle" className="text-[0.9rem] text-amber-400" />
                Demo con datos incluida
              </span>
              <span className="flex items-center gap-2">
                <NerdGlyph name="checkCircle" className="text-[0.9rem] text-amber-400" />
                Códigos únicos por persona
              </span>
            </div>
          </div>

          <div
            className="intro-panel relative mx-auto w-full max-w-lg lg:max-w-none"
            style={{ "--intro-delay": "420ms" } as CSSProperties}
          >
            <div className="absolute -inset-4 rounded-[2.2rem] bg-gradient-to-br from-amber-400/15 via-transparent to-amber-300/5 blur-2xl" />

            <div className="relative rounded-[1.85rem] bg-gradient-to-b from-amber-300/35 via-stone-700/30 to-transparent p-px shadow-[0_40px_120px_-50px_rgba(0,0,0,1)]">
              <div className="relative overflow-hidden rounded-[1.8rem] border border-stone-800/80 bg-stone-950/90 p-5 backdrop-blur-xl sm:p-6">
                <span
                  aria-hidden
                  className="scan-line pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/70 to-transparent"
                />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Evento en vivo</p>
                    <p className="mt-2 font-display text-2xl font-semibold text-stone-50">
                      Sunset Fest 2026
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-400">
                      <NerdGlyph name="mapMarker" className="text-[0.9rem]" />
                      Plaza Mayor · Puerta principal
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-gold" />
                    En vivo
                  </span>
                </div>

                <div className="mt-6 flex items-center gap-4 rounded-2xl border border-stone-800/80 bg-stone-900/40 p-4 sm:gap-5">
                  <div className="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24">
                    <svg
                      viewBox="0 0 120 120"
                      className="h-20 w-20 -rotate-90 sm:h-24 sm:w-24"
                      aria-hidden
                    >
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="rgba(255,255,255,0.07)"
                        strokeWidth="7"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="url(#gold-ring)"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 52}
                        strokeDashoffset={2 * Math.PI * 52 * (1 - 0.68)}
                      />
                      <defs>
                        <linearGradient
                          id="gold-ring"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#f6e3a1" />
                          <stop offset="55%" stopColor="#d4af37" />
                          <stop offset="100%" stopColor="#8f6d1f" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display text-2xl font-semibold text-stone-50">
                        68%
                      </span>
                      <span className="text-[9px] uppercase tracking-[0.18em] text-stone-400">
                        Avance
                      </span>
                    </div>
                  </div>

                  <div className="grid flex-1 grid-cols-3 gap-2">
                    {[
                      { label: "Invitados", value: "128" },
                      { label: "Dentro", value: "87" },
                      { label: "Pendientes", value: "41" },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <p className="text-[9px] uppercase tracking-[0.16em] text-stone-400">
                          {stat.label}
                        </p>
                        <p className="mt-1 font-display text-xl font-semibold text-stone-50">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {[
                    {
                      name: "Lucía Fernández",
                      meta: "VIP · 2 acompañantes",
                      time: "20:41",
                      guard: "Carla",
                    },
                    {
                      name: "Mateo Ríos",
                      meta: "General",
                      time: "20:39",
                      guard: "Carla",
                    },
                    {
                      name: "Ana Vega",
                      meta: "Prensa",
                      time: "20:37",
                      guard: "Diego",
                    },
                  ].map((entry, index) => (
                    <div
                      key={entry.name}
                      className="animate-fade-up flex items-center gap-3 rounded-xl border border-stone-800/80 bg-stone-900/40 px-3 py-2.5"
                      style={{ animationDelay: `${400 + index * 110}ms` }}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20">
                        <NerdGlyph name="checkCircle" className="text-[1rem]" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-stone-50">
                          {entry.name}
                        </p>
                        <p className="truncate text-[11px] text-stone-400">
                          {entry.meta} · {entry.guard}
                        </p>
                      </div>
                      <span className="flex items-center gap-1 text-[11px] tabular-nums text-stone-500">
                        <NerdGlyph name="clock" className="text-[0.75rem]" />
                        {entry.time}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-stone-800/70 pt-4 text-[11px] text-stone-400">
                  <span className="flex items-center gap-1.5">
                    <NerdGlyph
                      name="accessPoint"
                      className="text-[0.9rem] text-amber-300"
                    />
                    Actualizado cada 3 s
                  </span>
                  <span className="font-mono text-[10px] text-stone-500">
                    STF-GUARD01
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute -left-4 -top-4 hidden items-center gap-2 rounded-full border border-amber-400/20 bg-stone-950/90 px-3 py-1.5 text-[11px] text-amber-100 shadow-xl backdrop-blur sm:flex">
              <NerdGlyph
                name="shieldCheck"
                className="text-[0.9rem] text-amber-300"
              />
              Check-in atómico
            </div>
            <div className="animate-float-slow absolute -bottom-5 -right-4 hidden items-center gap-2 rounded-full border border-stone-700/70 bg-stone-950/90 px-3 py-1.5 text-[11px] text-stone-200 shadow-xl backdrop-blur sm:flex">
              <NerdGlyph
                name="doorOpen"
                className="text-[0.9rem] text-emerald-300"
              />
              87 dentro · 41 pendientes
            </div>
          </div>
        </div>
      </section>

      <div className="marquee relative overflow-hidden border-y border-stone-800/70 bg-stone-950/60 py-4">
        <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap">
          {[...marquee, ...marquee].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="flex items-center gap-10 text-[10px] uppercase tracking-[0.32em] text-stone-500"
            >
              {item}
              <NerdGlyph name="sparkle" className="text-[9px] text-amber-400/70" />
            </span>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div
          data-reveal
          className="surface relative overflow-hidden p-8 sm:p-12"
        >
          <div
            aria-hidden
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl"
          />
          <div className="relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="eyebrow">El problema</p>
              <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-stone-50 sm:text-5xl">
                El Excel funciona
                <span className="block italic text-gold">
                  hasta que llega la puerta.
                </span>
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  number: "01",
                  text: "La lista vive en tres archivos y nadie sabe cuál es el bueno.",
                },
                {
                  number: "02",
                  text: "El guardia marca entradas en una libreta y el organizador se entera tarde.",
                },
                {
                  number: "03",
                  text: "Cada ayudante ve información que no debería ver.",
                },
              ].map((problem, index) => (
                <div
                  key={problem.number}
                  data-reveal
                  style={
                    {
                      "--reveal-delay": `${index * 90}ms`,
                    } as CSSProperties
                  }
                  className="rounded-2xl border border-stone-800/80 bg-stone-950/50 p-5"
                >
                  <span className="font-display text-2xl text-amber-400">
                    {problem.number}
                  </span>
                  <p className="mt-3 text-sm leading-relaxed text-stone-300">
                    {problem.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="como-funciona"
        className="border-y border-stone-800/70 bg-stone-900/30"
      >
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div data-reveal className="max-w-2xl">
            <p className="eyebrow">Cómo funciona</p>
            <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-stone-50 sm:text-5xl">
              De la lista del cliente a la puerta,
              <span className="italic text-gold"> en cuatro pasos.</span>
            </h2>
          </div>

          <div className="relative mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <span
              aria-hidden
              className="absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-amber-400/25 to-transparent lg:block"
            />
            {steps.map((step, index) => (
              <div
                key={step.number}
                data-reveal
                style={
                  {
                    "--reveal-delay": `${index * 80}ms`,
                  } as CSSProperties
                }
                className="group relative"
              >
                <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/25 bg-stone-950 font-display text-2xl text-amber-300 shadow-[0_0_40px_-18px_rgba(212,175,55,0.8)] transition-transform duration-500 group-hover:-translate-y-1">
                  {step.number}
                </span>
                <h3 className="mt-5 font-display text-2xl font-medium text-stone-50">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-300">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="funciones"
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
      >
        <div data-reveal className="max-w-2xl">
          <p className="eyebrow">Funciones</p>
          <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-stone-50 sm:text-5xl">
            Todo lo que pasa en la puerta,
            <span className="italic text-gold"> sin planillas paralelas.</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <SpotlightCard
              key={feature.title}
              className="group card-hover rounded-2xl border border-stone-800/80 bg-stone-900/40 p-5"
            >
              <div
                data-reveal
                style={
                  {
                    "--reveal-delay": `${(index % 4) * 70}ms`,
                  } as CSSProperties
                }
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/20 bg-gradient-to-b from-amber-400/15 to-transparent text-amber-200 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:rotate-3">
                  <NerdGlyph
                    name={feature.glyph}
                    className="text-[1.35rem]"
                  />
                </span>
                <h3 className="mt-4 font-display text-xl font-medium text-stone-50">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-300">
                  {feature.text}
                </p>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>

      <section
        id="roles"
        className="border-y border-stone-800/70 bg-stone-900/30"
      >
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div data-reveal>
              <p className="eyebrow">Roles</p>
              <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-stone-50 sm:text-5xl">
                Cada persona ve exactamente
                <span className="italic text-gold"> lo que necesita.</span>
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-stone-300">
                El organizador principal es el root: controla permisos, equipo y
                accesos. Los ayudantes y guardias solo ven la parte que les toca,
                con un código único por persona.
              </p>
              <div className="mt-8 flex items-center gap-3 text-xs text-stone-400">
                <span className="h-px w-10 bg-amber-400/50" />
                Un código no abre el evento de otro.
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {roles.map((role, index) => (
                <div
                  key={role.title}
                  data-reveal
                  style={
                    {
                      "--reveal-delay": `${index * 80}ms`,
                    } as CSSProperties
                  }
                  className="card-hover rounded-2xl border border-stone-800/80 bg-stone-950/50 p-6"
                >
                  <div className="flex items-center justify-between">
                    <NerdGlyph
                      name={role.glyph}
                      className="text-[1.35rem] text-amber-300"
                    />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-stone-600">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-medium text-stone-50">
                    {role.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-300">
                    {role.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div
          data-reveal
          className="relative overflow-hidden rounded-[2rem] border border-amber-400/20 bg-gradient-to-br from-amber-400/10 via-stone-900/60 to-stone-950 px-8 py-14 sm:px-14 sm:py-20"
        >
          <div aria-hidden className="absolute inset-0">
            <div className="rays absolute -top-72 left-1/2 h-[48rem] w-[48rem] -translate-x-1/2 opacity-60" />
            <GoldParticles count={26} />
          </div>
          <div className="relative flex flex-col items-start justify-between gap-9 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <p className="eyebrow">Tu próximo evento</p>
              <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-stone-50 sm:text-5xl">
                Empieza con una lista
                <span className="italic text-gold"> ordenada.</span>
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-stone-300">
                Crea tu cuenta, importa el Excel y comparte el primer código con
                tu equipo. En menos de cinco minutos.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Magnetic strength={10}>
                <Link
                  href="/register"
                  className={buttonClasses("primary", "lg", "px-7")}
                >
                  Crear mi cuenta
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Magnetic>
              <Link
                href="/login"
                className={buttonClasses("outline", "lg", "px-7")}
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-800/70 bg-stone-950/80">
        <div className="gold-rule" />
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-4 py-10 text-sm text-stone-400 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Wordmark compact />
            <span className="hidden h-4 w-px bg-stone-700 sm:block" />
            <p className="hidden sm:block">
              Lista de invitados y control de acceso en vivo.
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <Link href="/login" className="transition hover:text-amber-100">
              Organizadores
            </Link>
            <Link href="/staff" className="transition hover:text-amber-100">
              Guardias
            </Link>
            <span className="text-stone-600">MIT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
