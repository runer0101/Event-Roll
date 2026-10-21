"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Radio,
  RotateCcw,
  UserRound,
  Users,
} from "lucide-react";
import { undoCheckIn } from "@/actions/checkin";
import type { LiveData } from "@/lib/queries/live";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { initials } from "@/lib/utils";

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
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/live`, {
        cache: "no-store",
      });
      if (!response.ok) return;
      setData((await response.json()) as LiveData);
    } catch {
      // A failed poll should not break the dashboard.
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

  return (
    <div className="space-y-6">
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-stone-900">
            Accesos en vivo
          </h2>
          <p className="text-sm text-stone-500">
            Se actualiza automáticamente cada 3 segundos.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          En vivo
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Invitados" value={stats.total} icon={Users} />
        <StatCard
          label="Dentro"
          value={stats.checkedIn}
          hint={`${stats.rate}% del total`}
          icon={CheckCircle2}
          accent
        />
        <StatCard
          label="Pendientes"
          value={stats.pending}
          hint="Aún no han entrado"
          icon={Clock}
        />
        <StatCard
          label="Avance"
          value={`${stats.rate}%`}
          hint="Puerta en tiempo real"
          icon={Radio}
        />
      </div>

      <div>
        <div className="h-2.5 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
            style={{ width: `${stats.rate}%` }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
            <h3 className="text-sm font-semibold text-stone-900">
              Últimas entradas
            </h3>
            <span className="text-xs text-stone-500">
              {recent.length} movimientos recientes
            </span>
          </div>
          <div className="divide-y divide-stone-100">
            {recent.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-stone-500">
                Todavía no ha entrado nadie. Cuando un guardia marque una
                entrada, aparecerá aquí.
              </p>
            ) : (
              recent.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                    <UserRound className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-stone-900">
                      {item.guestName}
                    </p>
                    <p className="truncate text-xs text-stone-500">
                      {item.category ?? "General"} · {item.staffName} ·{" "}
                      {item.atLabel}
                    </p>
                  </div>
                  {canUndo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() => handleUndo(item.guestId)}
                      title="Deshacer check-in"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                      <span className="hidden sm:inline">Deshacer</span>
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
            <h3 className="text-sm font-semibold text-stone-900">
              Actividad del equipo
            </h3>
            <span className="text-xs text-stone-500">{staff.length}</span>
          </div>
          <div className="divide-y divide-stone-100">
            {staff.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-stone-500">
                Aún no hay ayudantes. Crea el primero en la pestaña Equipo.
              </p>
            ) : (
              staff.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-semibold text-stone-600">
                    {initials(member.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-stone-900">
                      {member.name}
                    </p>
                    <p className="text-xs text-stone-500">
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
