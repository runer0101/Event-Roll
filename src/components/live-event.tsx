"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { undoCheckIn } from "@/actions/checkin";
import type { LiveData } from "@/lib/queries/live";
import {
  INITIAL_LIVE_POLL,
  applyPollResult,
  liveBadge,
} from "@/lib/live-status";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { cn, initials } from "@/lib/utils";

export function LiveEvent({
  eventId,
  initial,
  canUndo,
}: {
  eventId: string;
  initial: LiveData;
  canUndo: boolean;
}) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  // A refreshed server prop has to replace what `useState(initial)` captured
  // on mount, or the panel keeps showing the first render forever.
  const [syncedInitial, setSyncedInitial] = useState(initial);
  if (syncedInitial !== initial) {
    setSyncedInitial(initial);
    setData(initial);
  }
  const [poll, setPoll] = useState(INITIAL_LIVE_POLL);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/live`, {
        cache: "no-store",
      });
      if (!response.ok) {
        // Keep polling, but stop claiming the numbers are current.
        setPoll((current) =>
          applyPollResult(current, { ok: false, at: Date.now() }),
        );
        return;
      }
      setData((await response.json()) as LiveData);
      setPoll((current) =>
        applyPollResult(current, { ok: true, at: Date.now() }),
      );
    } catch {
      // A failed poll must not break the dashboard, and it must not look live.
      setPoll((current) =>
        applyPollResult(current, { ok: false, at: Date.now() }),
      );
    }
  }, [eventId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden) void load();
    }, 3000);
    return () => window.clearInterval(timer);
  }, [load]);

  function handleUndo(guestId: string) {
    setError(null);
    startTransition(async () => {
      const result = await undoCheckIn(guestId);
      if (result?.error) {
        setError(result.error);
        return;
      }
      await load();
      router.refresh();
    });
  }

  const { stats, recent, staff } = data;
  const badge = liveBadge(poll);

  return (
    <div className="space-y-6">
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-medium tracking-tight text-stone-50">
            Accesos en vivo
          </h2>
          <p className="text-sm text-stone-400">{badge.caption}</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-2 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]",
            badge.tone === "live"
              ? "border-emerald-500/40 text-emerald-300"
              : "border-amber-500/40 text-amber-200",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "h-1.5 w-1.5",
              badge.tone === "live" ? "bg-emerald-500" : "bg-amber-400",
            )}
          />
          {badge.label}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Invitados" value={stats.total} />
        <StatCard
          label="Dentro"
          value={stats.checkedIn}
          hint={`${stats.rate}% del total`}
          accent
        />
        <StatCard
          label="Pendientes"
          value={stats.pending}
          hint="Aún no han entrado"
        />
        <StatCard
          label="Avance"
          value={`${stats.rate}%`}
          hint="Puerta en tiempo real"
        />
      </div>

      <div>
        <div className="h-px bg-stone-800">
          <div
            className="h-px bg-amber-400 transition-all duration-500"
            style={{ width: `${stats.rate}%` }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-800 px-5 py-4">
            <h3 className="text-sm font-semibold text-stone-50">
              Movimientos recientes
            </h3>
            <span className="text-xs text-stone-400">
              {recent.length} movimientos
            </span>
          </div>
          <div className="divide-y divide-stone-800">
            {recent.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-stone-400">
                Todavía no ha entrado nadie. Cuando un asistente marque una
                entrada, aparecerá aquí.
              </p>
            ) : (
              recent.map((item) => {
                const isUndo = item.action === "UNDO_CHECK_IN";
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <span
                      className={cn(
                        "w-14 shrink-0 font-mono text-[10px] uppercase tracking-[0.12em]",
                        isUndo ? "text-red-300" : "text-emerald-300",
                      )}
                    >
                      {isUndo ? "Fuera" : "Dentro"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-stone-50">
                        {item.guestName}
                      </p>
                      <p className="truncate text-xs text-stone-400">
                        {isUndo ? "Check-in deshecho" : item.category ?? "General"}{" "}
                        · {item.staffName} · {item.atLabel}
                      </p>
                    </div>
                    {canUndo && !isUndo && item.guestId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={pending}
                        onClick={() => handleUndo(item.guestId!)}
                        title="Deshacer check-in"
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                        <span className="hidden sm:inline">Deshacer</span>
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-800 px-5 py-4">
            <h3 className="text-sm font-semibold text-stone-50">
              Actividad del equipo
            </h3>
            <span className="text-xs text-stone-400">{staff.length}</span>
          </div>
          <div className="divide-y divide-stone-800">
            {staff.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-stone-400">
                Aún no hay ayudantes. Crea el primero en la pestaña Equipo.
              </p>
            ) : (
              staff.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-stone-800 font-mono text-[10px] text-stone-400">
                    {initials(member.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-stone-50">
                      {member.name}
                    </p>
                    <p className="text-xs text-stone-400">
                      {member.checkIns} entrada
                      {member.checkIns !== 1 ? "s" : ""}
                      {member.lastLabel ? ` · última ${member.lastLabel}` : ""}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
