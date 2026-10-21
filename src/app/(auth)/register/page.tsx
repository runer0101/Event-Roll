import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = { title: "Crear cuenta" };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) {
    redirect(
      session.user.role === "OWNER"
        ? "/dashboard"
        : `/staff/event/${session.user.eventId}`,
    );
  }

  return <RegisterForm />;
}
