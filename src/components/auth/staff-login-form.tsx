"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { ArrowRight, KeyRound } from "lucide-react";
import { loginStaff } from "@/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StaffLoginForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await loginStaff({ code });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-stone-50">
        Entra con tu código
      </h1>
      <p className="mt-1 text-sm text-stone-400">
        Tu organizador te dio un código único para este evento. Escríbelo tal
        cual, sin espacios.
      </p>

      <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}

        <div>
          <Label htmlFor="code">Código de ayudante</Label>
          <Input
            id="code"
            name="code"
            type="text"
            autoComplete="one-time-code"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="STF-XXXXXXXX"
            required
            className="mt-1.5 h-12 font-mono text-lg tracking-widest"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={pending || code.trim().length < 4}
        >
          {pending ? "Entrando…" : "Entrar a la puerta"}
          {!pending && <ArrowRight className="h-4 w-4" aria-hidden />}
        </Button>
      </form>

      <div className="mt-6 rounded-xl border border-stone-800 bg-stone-950 p-4 text-sm text-stone-300">
        <p className="flex items-center gap-2 font-medium text-stone-100">
          <KeyRound className="h-4 w-4 text-amber-300" aria-hidden />
          ¿No tienes código?
        </p>
        <p className="mt-1.5 leading-relaxed">
          Pídeselo al organizador del evento. Cada ayudante tiene el suyo y
          puede regenerarse en cualquier momento.
        </p>
      </div>

      <p className="mt-6 text-center text-sm text-stone-400">
        ¿Eres el organizador?{" "}
        <Link
          href="/login"
          className="font-medium text-amber-300 hover:underline"
        >
          Entra a tu panel
        </Link>
      </p>
    </div>
  );
}
