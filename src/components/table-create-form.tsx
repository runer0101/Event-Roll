"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { createTable } from "@/actions/tables";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TableCreateForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createTable(eventId, {
        name: data.get("name"),
        capacity: data.get("capacity"),
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      event.currentTarget.reset();
      router.refresh();
    });
  }

  return (
    <Card className="p-5">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Label htmlFor="table-name">Nueva mesa</Label>
          <Input
            id="table-name"
            name="name"
            placeholder="Ej. Mesa 7 o Mesa VIP"
            required
            className="mt-1.5"
          />
        </div>
        <div className="w-full sm:w-32">
          <Label htmlFor="table-capacity">Sillas</Label>
          <Input
            id="table-capacity"
            name="capacity"
            type="number"
            min={1}
            max={20}
            defaultValue={8}
            required
            className="mt-1.5"
          />
        </div>
        <Button type="submit" disabled={pending}>
          <Plus className="h-4 w-4" aria-hidden />
          {pending ? "Creando…" : "Crear mesa"}
        </Button>
      </form>
      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}
    </Card>
  );
}
