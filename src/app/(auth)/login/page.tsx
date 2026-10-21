import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Entrar" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect(
      session.user.role === "OWNER"
        ? "/dashboard"
        : `/staff/event/${session.user.eventId}`,
    );
  }

  return <LoginForm />;
}
