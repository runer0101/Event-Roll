import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StaffLoginForm } from "@/components/auth/staff-login-form";
import { GoldParticles } from "@/components/motion/gold-particles";
import { NerdGlyph } from "@/components/ui/nerd-glyph";
import { getStaffForSession } from "@/lib/queries/staff";

export const metadata = { title: "Acceso de guardia" };

export default async function StaffLoginPage() {
  const session = await auth();
  if (session?.user?.role === "OWNER") {
    redirect("/dashboard");
  }

  // A staff token can outlive a regenerated code or a deactivated helper.
  // Only redirect when the database still recognizes this session; otherwise
  // let them sign in again instead of bouncing in a redirect loop.
  if (session?.user?.role === "STAFF" && session.user.staffId) {
    const staff = await getStaffForSession(
      session.user.staffId,
      session.user.staffSessionVersion ?? -1,
    );
    if (staff?.active) {
      redirect(`/staff/event/${staff.eventId}`);
    }
  }

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden px-4 py-12">
      <div aria-hidden className="absolute inset-0">
        <div className="rays absolute left-1/2 top-[-30rem] h-[60rem] w-[60rem] -translate-x-1/2 opacity-60" />
        <GoldParticles count={26} />
      </div>
      <div className="relative w-full max-w-md">
        <Link href="/" className="group mb-8 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-300/40 bg-gradient-to-b from-amber-200 to-amber-500 text-stone-950 shadow-[0_8px_24px_-12px_rgba(212,175,55,0.8)] transition-transform duration-500 group-hover:rotate-3">
            <NerdGlyph name="ticket" className="text-[1.2rem]" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-stone-50">
            Event-Roll<span className="text-amber-400">.</span>
          </span>
        </Link>
        <div className="surface p-7 sm:p-8">
          <StaffLoginForm />
        </div>
      </div>
    </div>
  );
}
