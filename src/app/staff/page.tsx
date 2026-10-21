import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StaffLoginForm } from "@/components/auth/staff-login-form";

export const metadata = { title: "Acceso de guardia" };

export default async function StaffLoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect(
      session.user.role === "OWNER"
        ? "/dashboard"
        : `/staff/event/${session.user.eventId}`,
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-12">
      <StaffLoginForm />
    </div>
  );
}
