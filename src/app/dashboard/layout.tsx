import Link from "next/link";
import { ExternalLink, LayoutDashboard, LogOut } from "lucide-react";
import { logout } from "@/actions/auth";
import { Brand } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
    <div className="min-h-svh bg-stone-950">
      <header className="sticky top-0 z-30 border-b border-stone-800/70 bg-stone-950/80 ">
        <div className="h-px bg-stone-800" />
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-5">
            <Link href="/dashboard" className="group flex items-center gap-2.5">
              <Brand size="md" wordmarkClassName="hidden sm:block" />
            </Link>
            <span className="hidden h-6 w-px bg-stone-800 sm:block" />
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 text-sm font-medium text-stone-300 transition hover:text-amber-100"
            >
              <LayoutDashboard className="h-4 w-4 text-amber-300/80" aria-hidden />
              <span className="hidden sm:inline">Eventos</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right md:block">
              <p className="font-display max-w-[14rem] truncate text-base font-medium text-stone-50">
                {organization?.name ?? owner.name}
              </p>
              <p className="text-xs text-stone-400">{owner.email}</p>
            </div>
            <Link
              href="/staff"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5  border border-stone-700/80 bg-stone-900/60 px-3 py-2 text-xs font-medium text-stone-200  transition hover:border-amber-400/50 hover:bg-stone-800/80 hover:text-amber-100 sm:inline-flex"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              Vista asistente
            </Link>
            <ThemeToggle />
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
