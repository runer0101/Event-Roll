import Link from "next/link";
import { ExternalLink, LayoutDashboard, LogOut, ScanLine } from "lucide-react";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { getOrganizationForOwner } from "@/lib/queries/events";
import { requireOwner } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const owner = await requireOwner();
  const organization = await getOrganizationForOwner(owner.userId);

  return (
    <div className="min-h-screen bg-stone-950">
      <header className="sticky top-0 z-30 border-b border-stone-800 bg-stone-900/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-5">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-stone-950">
                <ScanLine className="h-5 w-5" aria-hidden />
              </span>
              <span className="hidden text-lg font-semibold tracking-tight sm:block">
                Event-Roll
              </span>
            </Link>
            <span className="hidden h-6 w-px bg-stone-700 sm:block" />
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm font-medium text-stone-300 transition hover:text-stone-50"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Eventos</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right md:block">
              <p className="max-w-[14rem] truncate text-sm font-medium text-stone-50">
                {organization?.name ?? owner.name}
              </p>
              <p className="text-xs text-stone-400">{owner.email}</p>
            </div>
            <Link
              href="/staff"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-xs font-medium text-stone-200 transition hover:border-stone-400 hover:bg-stone-800 sm:inline-flex"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              Vista guardia
            </Link>
            <form action={logout}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
