"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  UserRound,
} from "lucide-react";
import { toggleScheduleItem } from "@/actions/schedule";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StaffScheduleItem = {
  id: string;
  title: string;
  description: string | null;
  startLabel: string;
  status: "PENDING" | "DONE";
  assigneeName: string;
  assigneeRole: string;
};

export function StaffSchedule({
  items: initial,
  title = "Mi cronograma",
}: {
  items: StaffScheduleItem[];
  title?: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(item: StaffScheduleItem) {
    setError(null);
    const next = item.status === "DONE" ? "PENDING" : "DONE";
    setItems((current) =>
      current.map((row) =>
        row.id === item.id ? { ...row, status: next } : row,
      ),
    );
    startTransition(async () => {
      const result = await toggleScheduleItem(item.id);
      if (result?.error) {
        setError(result.error);
        setItems((current) =>
          current.map((row) =>
            row.id === item.id ? { ...row, status: item.status } : row,
          ),
        );
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-stone-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-stone-50">{title}</h2>
        <span className="text-xs text-stone-400">
          {items.filter((item) => item.status === "DONE").length}/{items.length}{" "}
          completadas
        </span>
      </div>
      {error && (
        <div className="px-4 pt-3">
          <Alert variant="danger">{error}</Alert>
        </div>
      )}
      <div className="divide-y divide-stone-800">
        {items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-stone-400">
            No tienes tareas asignadas todavía. El organizador las agregará al
            cronograma.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex flex-wrap items-start justify-between gap-3 px-4 py-3.5",
                item.status === "DONE" && "bg-emerald-500/5",
              )}
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/10 text-amber-300">
                  <Clock className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-amber-300">
                      {item.startLabel}
                    </span>
                    <Badge
                      variant={item.status === "DONE" ? "success" : "warning"}
                    >
                      {item.status === "DONE" ? "Hecha" : "Pendiente"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-stone-50">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="mt-0.5 text-xs text-stone-400">
                      {item.description}
                    </p>
                  )}
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-400">
                    <UserRound className="h-3.5 w-3.5" aria-hidden />
                    {item.assigneeName} · {item.assigneeRole}
                  </p>
                </div>
              </div>
              <Button
                variant={item.status === "DONE" ? "ghost" : "outline"}
                size="sm"
                onClick={() => toggle(item)}
                disabled={pending}
              >
                {item.status === "DONE" ? (
                  <>
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                    Reabrir
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    Marcar hecha
                  </>
                )}
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
