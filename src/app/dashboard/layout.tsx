import Link from "next/link";
import { ExternalLink, LayoutDashboard, LogOut } from "lucide-react";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { NerdGlyph } from "@/components/ui/nerd-glyph";
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
      <header className="sticky top-0 z-30 border-b border-stone-800/70 bg-stone-950/80 backdrop-blur-xl">
        <div className="h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-5">
            <Link href="/dashboard" className="group flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-300/40 bg-gradient-to-b from-amber-200 to-amber-500 text-stone-950 shadow-[0_8px_24px_-12px_rgba(212,175,55,0.8)] transition-transform duration-500 group-hover:rotate-3">
                <NerdGlyph name="ticket" className="text-[1.2rem]" />
              </span>
              <span className="font-display hidden text-xl font-semibold tracking-tight text-stone-50 sm:block">
                Event-Roll<span className="text-amber-400">.</span>
              </span>
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
              className="hidden items-center gap-1.5 rounded-xl border border-stone-700/80 bg-stone-900/60 px-3 py-2 text-xs font-medium text-stone-200 backdrop-blur-sm transition hover:border-amber-400/50 hover:bg-stone-800/80 hover:text-amber-100 sm:inline-flex"
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
