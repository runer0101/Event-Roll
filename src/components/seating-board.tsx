"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Armchair,
  CheckCircle2,
  Circle,
  RefreshCw,
  Table2,
  Trash2,
} from "lucide-react";
import {
  deleteTable,
  resetTable,
  toggleChair,
} from "@/actions/tables";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { cn } from "@/lib/utils";

type ChairView = {
  id: string;
  number: number;
  occupied: boolean;
};

type TableView = {
  id: string;
  name: string;
  capacity: number;
  chairs: ChairView[];
};

export function SeatingBoard({ initial }: { initial: TableView[] }) {
  const router = useRouter();
  const [tables, setTables] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const totalChairs = tables.reduce((sum, table) => sum + table.chairs.length, 0);
  const occupied = tables.reduce(
    (sum, table) => sum + table.chairs.filter((chair) => chair.occupied).length,
    0,
  );

  function toggle(tableId: string, chair: ChairView) {
    setError(null);
    const next = !chair.occupied;
    setTables((current) =>
      current.map((table) =>
        table.id === tableId
          ? {
              ...table,
              chairs: table.chairs.map((item) =>
                item.id === chair.id ? { ...item, occupied: next } : item,
              ),
            }
          : table,
      ),
    );

    startTransition(async () => {
      const result = await toggleChair(chair.id);
      if (result?.error) {
        setError(result.error);
        setTables((current) =>
          current.map((table) =>
            table.id === tableId
              ? {
                  ...table,
                  chairs: table.chairs.map((item) =>
                    item.id === chair.id
                      ? { ...item, occupied: chair.occupied }
                      : item,
                  ),
                }
              : table,
          ),
        );
        return;
      }
      router.refresh();
    });
  }

  function remove(table: TableView) {
    if (
      !window.confirm(
        `¿Eliminar ${table.name} y sus ${table.chairs.length} sillas?`,
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteTable(table.id);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setTables((current) => current.filter((item) => item.id !== table.id));
      router.refresh();
    });
  }

  function reset(table: TableView) {
    setError(null);
    setTables((current) =>
      current.map((item) =>
        item.id === table.id
          ? {
              ...item,
              chairs: item.chairs.map((chair) => ({
                ...chair,
                occupied: false,
              })),
            }
          : item,
      ),
    );
    startTransition(async () => {
      const result = await resetTable(table.id);
      if (result?.error) {
        setError(result.error);
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Mesas" value={tables.length} icon={Table2} />
        <StatCard label="Sillas" value={totalChairs} icon={Armchair} />
        <StatCard
          label="Ocupadas"
          value={occupied}
          hint="Marcadas en rojo"
          icon={CheckCircle2}
          accent
        />
        <StatCard
          label="Disponibles"
          value={totalChairs - occupied}
          icon={Circle}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-stone-600 bg-stone-800" />
          Disponible
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-red-400 bg-red-500" />
          Ocupada
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-red-500/60 bg-red-950/40" />
          Mesa llena
        </span>
      </div>

      {tables.length === 0 ? (
        <Card className="p-10 text-center">
          <Table2 className="mx-auto h-8 w-8 text-amber-300" aria-hidden />
          <h3 className="mt-3 text-lg font-semibold text-stone-50">
            Todavía no hay mesas
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-stone-400">
            Crea la primera mesa arriba, elige cuántas sillas tiene y empieza a
            marcar la distribución.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tables.map((table) => {
            const occupiedCount = table.chairs.filter(
              (chair) => chair.occupied,
            ).length;
            const full =
              table.chairs.length > 0 && occupiedCount === table.chairs.length;

            return (
              <Card
                key={table.id}
                className={cn(
                  "overflow-hidden transition-colors",
                  full
                    ? "border-red-500/50 bg-red-950/20"
                    : "border-stone-800 bg-stone-900",
                )}
              >
                <div className="flex items-start justify-between gap-3 border-b border-stone-800 px-4 py-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={cn(
                          "text-sm font-semibold",
                          full ? "text-red-300" : "text-stone-50",
                        )}
                      >
                        {table.name}
                      </h3>
                      <Badge variant={full ? "danger" : "success"}>
                        {full ? "Llena" : "Disponible"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-stone-400">
                      {occupiedCount} de {table.chairs.length} sillas ocupadas
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => reset(table)}
                      disabled={pending || occupiedCount === 0}
                      title="Liberar todas las sillas"
                    >
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(table)}
                      disabled={pending}
                      title="Eliminar mesa"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400" aria-hidden />
                    </Button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                    {table.chairs.map((chair) => (
                      <button
                        key={chair.id}
                        type="button"
                        onClick={() => toggle(table.id, chair)}
                        className={cn(
                          "flex aspect-square items-center justify-center rounded-lg border text-xs font-semibold transition-all",
                          chair.occupied
                            ? "border-red-400 bg-red-500 text-white shadow-sm shadow-red-500/30 hover:bg-red-400"
                            : "border-stone-700 bg-stone-800 text-stone-300 hover:border-amber-400 hover:bg-stone-700 hover:text-amber-300",
                        )}
                        aria-label={`${table.name}, silla ${chair.number}, ${
                          chair.occupied ? "ocupada" : "disponible"
                        }`}
                        aria-pressed={chair.occupied}
                      >
                        {chair.number}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
