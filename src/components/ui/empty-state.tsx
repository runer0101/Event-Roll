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
    <Card className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
      <p className="max-w-md text-sm text-stone-500">{description}</p>
      {action}
    </Card>
  );
}
