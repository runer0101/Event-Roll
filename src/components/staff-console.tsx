"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  CheckCircle2,
  Clock,
  Download,
  LogOut,
  Radio,
  RotateCcw,
  Search,
  UserRound,
} from "lucide-react";
import { logout } from "@/actions/auth";
import { checkInGuest, searchGuests, undoCheckIn } from "@/actions/checkin";
import type { StaffGuestResult } from "@/actions/checkin";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  StaffSchedule,
  type StaffScheduleItem,
} from "@/components/staff-schedule";
import { StaffGuestEditor } from "@/components/staff/staff-guest-editor";
import { NerdGlyph } from "@/components/ui/nerd-glyph";
import { formatTime } from "@/lib/utils";

type Message = { variant: "success" | "danger"; text: string } | null;

export function StaffConsole({
  event,
  staff,
  counters,
  initialRecent,
  scheduleItems,
}: {
  event: {
    id: string;
    name: string;
    dateLabel: string;
    location: string;
  };
  staff: {
    id: string;
    name: string;
    roleLabel: string;
    canViewContact: boolean;
    canEditGuests: boolean;
    canExport: boolean;
    canUndoCheckIn: boolean;
    canViewStats: boolean;
  };
  counters?: { total: number; checkedIn: number; pending: number };
  initialRecent: Array<{ id: string; guestName: string; atLabel: string }>;
  scheduleItems: StaffScheduleItem[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StaffGuestResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const value = query.trim();
    if (!value) return;

    let active = true;
    const timer = window.setTimeout(async () => {
      const data = await searchGuests(value);
      if (active) {
        setResults(data);
        setSearching(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  function checkIn(guest: StaffGuestResult) {
    setMessage(null);
    startTransition(async () => {
      const result = await checkInGuest(guest.id);
      if (result?.error) {
        setMessage({ variant: "danger", text: result.error });
        return;
      }
      setMessage({
        variant: "success",
        text: `Entrada registrada para ${guest.name}.`,
      });
      setResults((current) =>
        current.map((item) =>
          item.id === guest.id
            ? {
                ...item,
                status: "CHECKED_IN",
                checkedInAt: new Date().toISOString(),
                checkedInByName: staff.name,
              }
            : item,
        ),
      );
      router.refresh();
    });
  }

  function handleGuestSaved(guest: {
    id: string;
    name: string;
    category: string | null;
    plusOnes: number;
  }) {
    setResults((current) =>
      current.map((item) =>
        item.id === guest.id ? { ...item, ...guest } : item,
      ),
    );
    setMessage({
      variant: "success",
      text: `Datos de ${guest.name} actualizados.`,
    });
    router.refresh();
  }

  function undo(guest: StaffGuestResult) {
    setMessage(null);
    startTransition(async () => {
      const result = await undoCheckIn(guest.id);
      if (result?.error) {
        setMessage({ variant: "danger", text: result.error });
        return;
      }
      setMessage({
        variant: "success",
        text: `Check-in deshecho para ${guest.name}.`,
      });
      setResults((current) =>
        current.map((item) =>
          item.id === guest.id
            ? { ...item, status: "INVITED", checkedInAt: null, checkedInByName: null }
            : item,
        ),
      );
      router.refresh();
    });
  }

  return (
    <div className="min-h-svh bg-stone-950">
      <header className="border-b border-stone-800/70 bg-stone-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-stone-950">
              <NerdGlyph name="ticket" className="text-[1.05rem]" />
            </span>
            <span className="hidden text-sm font-semibold sm:block">
              Event-Roll
            </span>
          </Link>
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-semibold text-stone-50">
              {event.name}
            </p>
            <p className="truncate text-xs text-stone-400">
              {event.dateLabel} · {event.location}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-right text-xs text-stone-400 sm:block">
              {staff.name} · {staff.roleLabel}
            </span>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="font-display text-3xl font-medium tracking-tight text-stone-50">
              Control de acceso
            </h1>
            <p className="text-sm text-stone-400">
              Busca al invitado y marca su entrada.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <Radio className="h-3.5 w-3.5" aria-hidden />
            Puerta abierta
          </span>
        </div>

        {staff.canViewStats && counters && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Invitados", value: counters.total },
              { label: "Dentro", value: counters.checkedIn },
              { label: "Pendientes", value: counters.pending },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-stone-800 bg-stone-900 px-3 py-2.5 text-center"
              >
                <p className="text-[10px] uppercase tracking-wider text-stone-400">
                  {item.label}
                </p>
                <p className="mt-1 text-lg font-semibold text-stone-50">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {message && <Alert variant={message.variant}>{message.text}</Alert>}

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(event) => {
              const value = event.target.value;
              setQuery(value);
              if (!value.trim()) {
                setResults([]);
                setSearching(false);
              } else {
                setSearching(true);
              }
            }}
            placeholder="Busca por nombre, código, email o teléfono…"
            autoFocus
            className="h-14 rounded-2xl border-stone-700/80 bg-stone-950/70 pl-12 text-base shadow-[0_0_0_1px_rgba(212,175,55,0.04)] focus:border-amber-400/70"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400">
          <span>
            {query.trim()
              ? searching
                ? "Buscando…"
                : `${results.length} resultado${results.length !== 1 ? "s" : ""}`
              : "Escribe al menos una letra para buscar."}
          </span>
          {staff.canExport && (
            <a
              href={`/api/events/${event.id}/export`}
              className="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-50"
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              Exportar lista
            </a>
          )}
        </div>

        {query.trim() && !searching && results.length === 0 && (
          <Card className="p-6 text-center text-sm text-stone-400">
            No encontramos a nadie con «{query.trim()}». Revisa la ortografía o
            pide ayuda al organizador.
          </Card>
        )}

        <div className="space-y-2">
          {results.map((guest) => {
            const checkedIn = guest.status === "CHECKED_IN";
            return (
              <Card
                key={guest.id}
                className="card-hover p-4 hover:border-amber-400/25"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={
                        checkedIn
                          ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-100"
                          : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-800 text-stone-300"
                      }
                    >
                      {checkedIn ? (
                        <CheckCircle2 className="h-5 w-5" aria-hidden />
                      ) : (
                        <UserRound className="h-5 w-5" aria-hidden />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-50">
                        {guest.name}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-stone-400">
                        <span>{guest.category || "General"}</span>
                        {guest.plusOnes > 0 && (
                          <span>+{guest.plusOnes} acompañantes</span>
                        )}
                        <span className="font-mono text-[10px] text-stone-500">
                          {guest.code}
                        </span>
                      </p>
                      {(guest.email || guest.phone) && (
                        <p className="mt-1 text-xs text-stone-400">
                          {[guest.email, guest.phone].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      {checkedIn && guest.checkedInAt && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-emerald-300">
                          <Clock className="h-3 w-3" aria-hidden />
                          Ya dentro · {formatTime(guest.checkedInAt)}
                          {guest.checkedInByName
                            ? ` · ${guest.checkedInByName}`
                            : ""}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {staff.canEditGuests && (
                      <StaffGuestEditor
                        guest={{
                          id: guest.id,
                          name: guest.name,
                          category: guest.category,
                          plusOnes: guest.plusOnes,
                          table: guest.table ?? null,
                          notes: guest.notes ?? null,
                        }}
                        onSaved={handleGuestSaved}
                      />
                    )}
                    {checkedIn ? (
                      <>
                        <Badge variant="success">Dentro</Badge>
                        {staff.canUndoCheckIn && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={pending}
                            onClick={() => undo(guest)}
                          >
                            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                            Deshacer
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        variant="accent"
                        size="sm"
                        disabled={pending}
                        onClick={() => checkIn(guest)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                        Marcar entrada
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-800 px-4 py-3">
            <h2 className="text-sm font-semibold text-stone-50">
              Tus últimas entradas
            </h2>
            <span className="text-xs text-stone-400">{staff.name}</span>
          </div>
          <div className="divide-y divide-stone-800">
            {initialRecent.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-stone-400">
                Todavía no has marcado ninguna entrada.
              </p>
            ) : (
              initialRecent.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                >
                  <span className="truncate text-stone-200">
                    {item.guestName}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-stone-500">
                    {item.atLabel}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        <StaffSchedule items={scheduleItems} />

        <p className="text-center text-xs text-stone-500">
          Una entrada solo puede marcarse una vez. Si algo falla, avisa al
          organizador.
        </p>
      </main>
    </div>
  );
}
