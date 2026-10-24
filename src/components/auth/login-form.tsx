"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { ArrowRight, Wand2 } from "lucide-react";
import { loginOrganizer } from "@/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEMO_EMAIL = "demo@event-roll.dev";
const DEMO_PASSWORD = "event-roll-demo";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await loginOrganizer({ email, password });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-medium tracking-tight text-stone-50">
        Entra a tu panel
      </h1>
      <p className="mt-1 text-sm text-stone-400">
        Gestiona la lista, el equipo y los accesos de tus eventos.
      </p>

      <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1.5"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1.5"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={pending}
        >
          {pending ? "Entrando…" : "Entrar"}
          {!pending && <ArrowRight className="h-4 w-4" aria-hidden />}
        </Button>
      </form>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3 w-full"
        onClick={() => {
          setEmail(DEMO_EMAIL);
          setPassword(DEMO_PASSWORD);
          setError(null);
        }}
      >
        <Wand2 className="h-3.5 w-3.5" aria-hidden />
        Usar credenciales de la demo
      </Button>

      <p className="mt-6 text-center text-sm text-stone-400">
        ¿Aún no tienes cuenta?{" "}
        <Link
          href="/register"
          className="font-medium text-amber-300 hover:underline"
        >
          Crea tu organización
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-stone-400">
        ¿Eres parte del equipo?{" "}
        <Link
          href="/staff"
          className="font-medium text-amber-300 hover:underline"
        >
          Entra con tu código
        </Link>
      </p>
    </div>
  );
}
