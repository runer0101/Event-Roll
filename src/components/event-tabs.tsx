"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { segment: "", label: "Resumen" },
  { segment: "/guests", label: "Invitados" },
  { segment: "/tables", label: "Mesas" },
  { segment: "/staff", label: "Equipo" },
  { segment: "/schedule", label: "Cronograma" },
  { segment: "/settings", label: "Ajustes" },
];

export function EventTabs({ eventId }: { eventId: string }) {
  const pathname = usePathname();
  const base = `/dashboard/events/${eventId}`;

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-stone-800">
      {tabs.map((tab) => {
        const href = `${base}${tab.segment}`;
        const active =
          tab.segment === ""
            ? pathname === base
            : pathname.startsWith(href);
        return (
          <Link
            key={tab.segment}
            href={href}
            className={cn(
              "relative whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "text-stone-50"
                : "text-stone-400 hover:text-stone-100",
            )}
          >
            {tab.label}
            {active && (
              <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-amber-400" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
