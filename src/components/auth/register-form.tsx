"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { registerOrganizer } from "@/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await registerOrganizer({
        name: data.get("name"),
        organizationName: data.get("organizationName"),
        email: data.get("email"),
        password: data.get("password"),
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
        Crea tu cuenta
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        Un panel para tus eventos, tu lista de invitados y tu equipo de puerta.
      </p>

      <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}

        <div>
          <Label htmlFor="organizationName">Nombre de tu organización</Label>
          <Input
            id="organizationName"
            name="organizationName"
            type="text"
            autoComplete="organization"
            placeholder="Ej. La Buena Fiesta"
            required
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="name">Tu nombre</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Ej. Carla Méndez"
            required
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            required
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            minLength={8}
            required
            className="mt-1.5"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={pending}
        >
          {pending ? "Creando cuenta…" : "Crear cuenta"}
          {!pending && <ArrowRight className="h-4 w-4" aria-hidden />}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-orange-700 hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
