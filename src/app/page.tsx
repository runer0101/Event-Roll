import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  DoorOpen,
  FileSpreadsheet,
  KeyRound,
  Radio,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

const features = [
  {
    icon: FileSpreadsheet,
    title: "Importa tu Excel",
    text: "Sube la lista que ya tienes en .xlsx o .csv. Detectamos las columnas, avisamos de duplicados y la dejamos lista en segundos.",
  },
  {
    icon: KeyRound,
    title: "Un código por ayudante",
    text: "Cada persona de tu equipo entra con su código único. Sin emails, sin invitaciones, sin contraseñas que olvidar.",
  },
  {
    icon: ShieldCheck,
    title: "Permisos por persona",
    text: "Decide quién ve teléfonos, quién puede editar invitados y quién solo puede marcar entradas.",
  },
  {
    icon: Radio,
    title: "Todo en vivo",
    text: "El organizador ve cada entrada al instante: invitado, hora y qué guardia lo validó.",
  },
  {
    icon: ScanLine,
    title: "Check-in atómico",
    text: "Una entrada solo puede marcarse una vez. Si dos guardias la validan a la vez, uno recibe el aviso.",
  },
  {
    icon: CalendarCheck,
    title: "Varios eventos",
    text: "Cada evento tiene su lista, su equipo y su historial. Cambia de evento sin mezclar datos.",
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
];

const roles = [
  {
    icon: Users,
    title: "Organizador root",
    text: "Control total: evento, lista, equipo, permisos y accesos. Es el único que puede cerrar o borrar el evento.",
  },
  {
    icon: ShieldCheck,
    title: "Ayudantes",
    text: "Coordinan la lista y la puerta con los permisos que tú les des. No ven lo que no les corresponde.",
  },
  {
    icon: DoorOpen,
    title: "Guardias",
    text: "Entran con su código, buscan al invitado y marcan la entrada. Sin acceso al resto del evento.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <section className="relative overflow-hidden bg-stone-950 text-stone-50">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-[-10%] h-[32rem] w-[32rem] rounded-full bg-orange-600/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-[-18rem] left-[-8rem] h-[28rem] w-[28rem] rounded-full bg-amber-400/10 blur-3xl"
        />

        <header className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-stone-950">
              <ScanLine className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Event-Roll
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-stone-300 md:flex">
            <a href="#como-funciona" className="hover:text-white">
              Cómo funciona
            </a>
            <a href="#funciones" className="hover:text-white">
              Funciones
            </a>
            <a href="#roles" className="hover:text-white">
              Roles
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-xl px-3 py-2 text-sm font-medium text-stone-300 transition hover:text-white sm:block"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className={buttonClasses(
                "accent",
                "sm",
                "bg-orange-500 text-stone-950 hover:bg-orange-400",
              )}
            >
              Crear cuenta
            </Link>
          </div>
        </header>

        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:px-8 lg:pb-28 lg:pt-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-stone-700 bg-stone-900/80 px-3 py-1 text-xs font-medium text-stone-300">
              <Sparkles className="h-3.5 w-3.5 text-orange-400" aria-hidden />
              Control de acceso en vivo
            </span>
            <h1 className="mt-5 max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              La lista de invitados que se actualiza{" "}
              <span className="text-orange-400">mientras la puerta trabaja.</span>
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-stone-300 sm:text-lg">
              Importa el Excel del cliente, asigna un código a cada ayudante y
              mira en vivo quién entra, a qué hora y quién lo validó. Sin
              planillas paralelas, sin gritos por WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className={buttonClasses(
                  "accent",
                  "lg",
                  "bg-orange-500 text-stone-950 hover:bg-orange-400",
                )}
              >
                Empezar gratis
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/staff"
                className={buttonClasses(
                  "outline",
                  "lg",
                  "border-stone-700 bg-stone-900 text-stone-100 hover:border-stone-500 hover:bg-stone-800",
                )}
              >
                Entrar como guardia
              </Link>
            </div>
            <p className="mt-4 text-xs text-stone-400">
              Sin tarjeta. Demo con datos de ejemplo incluida.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-orange-500/20 via-transparent to-amber-300/10 blur-2xl" />
            <div className="relative rounded-[1.6rem] border border-stone-700/80 bg-stone-900/90 p-4 shadow-2xl shadow-black/40 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-500">
                    Evento en vivo
                  </p>
                  <p className="mt-1 text-lg font-semibold">Sunset Fest 2026</p>
                  <p className="text-xs text-stone-400">
                    Plaza Mayor · Puerta principal
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  En vivo
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  { label: "Invitados", value: "128" },
                  { label: "Dentro", value: "87" },
                  { label: "Pendientes", value: "41" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-stone-700/70 bg-stone-950/60 px-3 py-2.5"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-stone-500">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-xl font-semibold">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>Avance de la puerta</span>
                  <span className="font-medium text-stone-200">68%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-800">
                  <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-orange-500 to-amber-300" />
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {[
                  { name: "Lucía Fernández", meta: "VIP · 2 acompañantes", time: "20:41", guard: "Carla" },
                  { name: "Mateo Ríos", meta: "General", time: "20:39", guard: "Carla" },
                  { name: "Ana Vega", meta: "Prensa", time: "20:37", guard: "Diego" },
                ].map((entry) => (
                  <div
                    key={entry.name}
                    className="flex items-center gap-3 rounded-xl border border-stone-800 bg-stone-950/50 px-3 py-2.5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{entry.name}</p>
                      <p className="truncate text-[11px] text-stone-500">
                        {entry.meta} · {entry.guard}
                      </p>
                    </div>
                    <span className="text-xs tabular-nums text-stone-400">
                      {entry.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-6 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">
              El problema
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-stone-900">
              El Excel funciona hasta que llega la puerta.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              "La lista vive en tres archivos y nadie sabe cuál es el bueno.",
              "El guardia marca entradas en una libreta y el organizador se entera tarde.",
              "Cada ayudante ve información que no debería ver.",
            ].map((text) => (
              <div
                key={text}
                className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-relaxed text-stone-600"
              >
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">
              Cómo funciona
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              De la lista del cliente a la puerta, en tres pasos.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-stone-200 bg-stone-50 p-6"
              >
                <span className="text-sm font-semibold text-orange-600">
                  {step.number}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-stone-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="funciones" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">
            Funciones
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            Todo lo que pasa en la puerta, sin planillas paralelas.
          </h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm shadow-stone-900/[0.03]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600 ring-1 ring-orange-100">
                <feature.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-semibold text-stone-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="roles" className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">
                Roles
              </p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                Cada persona ve exactamente lo que necesita.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-stone-600">
                El organizador principal es el root: controla permisos, equipo y
                accesos. Los ayudantes y guardias solo ven la parte que les
                toca, con un código único por persona.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {roles.map((role) => (
                <div
                  key={role.title}
                  className="rounded-2xl border border-stone-200 bg-stone-50 p-5"
                >
                  <role.icon className="h-5 w-5 text-orange-600" aria-hidden />
                  <h3 className="mt-4 text-sm font-semibold text-stone-900">
                    {role.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-stone-600">
                    {role.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-stone-950 px-8 py-12 text-stone-50 sm:px-12 sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl"
          />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Tu próximo evento empieza con una lista ordenada.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-300">
                Crea tu cuenta, importa el Excel y comparte el primer código con
                tu equipo. En menos de cinco minutos.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className={buttonClasses(
                  "accent",
                  "lg",
                  "bg-orange-500 text-stone-950 hover:bg-orange-400",
                )}
              >
                Crear mi cuenta
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/login"
                className={buttonClasses(
                  "outline",
                  "lg",
                  "border-stone-700 bg-transparent text-stone-100 hover:border-stone-500 hover:bg-stone-900",
                )}
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-stone-500 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>
            <span className="font-semibold text-stone-900">Event-Roll</span> ·
            Lista de invitados y control de acceso en vivo.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/login" className="hover:text-stone-900">
              Organizadores
            </Link>
            <Link href="/staff" className="hover:text-stone-900">
              Guardias
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
