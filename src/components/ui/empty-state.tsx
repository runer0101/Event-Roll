import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span aria-hidden className="mb-1 h-px w-16 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
      <h3 className="font-display text-2xl font-semibold text-stone-50">{title}</h3>
      <p className="max-w-md text-sm text-stone-400">{description}</p>
      {action}
    </Card>
  );
}
