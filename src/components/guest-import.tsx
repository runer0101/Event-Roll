"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { FileSpreadsheet, Upload, X } from "lucide-react";
import { importGuests } from "@/actions/guests";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  parseGuestFile,
  type ParsedGuests,
} from "@/lib/import/guests";

export function GuestImport({ eventId }: { eventId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParsedGuests | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setFileName("");
    setParsed(null);
    setError(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setResult(null);
    setFileName(file.name);
    try {
      setParsed(await parseGuestFile(file));
    } catch {
      setError("No pudimos leer el archivo. Revisa que no esté dañado.");
    }
  }

  function handleImport() {
    if (!parsed?.rows.length) return;
    setError(null);
    startTransition(async () => {
      const response = await importGuests(eventId, {
        eventId,
        rows: parsed.rows,
      });
      if (response?.error) {
        setError(response.error);
        return;
      }
      setResult(
        `${response.imported ?? 0} invitados importados${
          response.skipped ? ` · ${response.skipped} duplicados omitidos` : ""
        }.`,
      );
      router.refresh();
    });
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" aria-hidden />
        Importar Excel/CSV
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-title"
        >
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="import-title"
                  className="text-lg font-semibold text-stone-50"
                >
                  Importar lista de invitados
                </h2>
                <p className="mt-1 text-sm text-stone-400">
                  Acepta .xlsx y .csv. Reconoce columnas como nombre, email,
                  teléfono, categoría, acompañantes, mesa y notas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                className="rounded-lg p-1 text-stone-500 hover:bg-stone-800 hover:text-stone-200"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {error && <Alert variant="danger">{error}</Alert>}
              {result && <Alert variant="success">{result}</Alert>}

              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-700 bg-stone-950 px-6 py-8 text-center transition hover:border-amber-300 hover:bg-amber-400/5">
                <FileSpreadsheet className="h-8 w-8 text-amber-300" aria-hidden />
                <span className="text-sm font-medium text-stone-100">
                  {fileName || "Selecciona tu archivo"}
                </span>
                <span className="text-xs text-stone-400">
                  .xlsx o .csv · máximo 5 MB
                </span>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.csv"
                  className="sr-only"
                  onChange={(event) => void handleFile(event.target.files?.[0])}
                />
              </label>

              {parsed && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <p className="text-stone-300">
                      <span className="font-semibold text-stone-50">
                        {parsed.rows.length}
                      </span>{" "}
                      filas listas de {parsed.total}
                    </p>
                    {parsed.errors.length > 0 && (
                      <p className="text-amber-300">
                        {parsed.errors.length} filas con problemas
                      </p>
                    )}
                  </div>

                  {parsed.errors.length > 0 && (
                    <Alert variant="info">
                      <ul className="list-disc space-y-1 pl-4">
                        {parsed.errors.slice(0, 4).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </Alert>
                  )}

                  {parsed.rows.length > 0 && (
                    <div className="overflow-x-auto rounded-xl border border-stone-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-950 text-stone-400">
                          <tr>
                            <th className="px-3 py-2">Nombre</th>
                            <th className="px-3 py-2">Email</th>
                            <th className="px-3 py-2">Categoría</th>
                            <th className="px-3 py-2">Acompañantes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-800">
                          {parsed.rows.slice(0, 6).map((row, index) => (
                            <tr key={`${row.name}-${index}`}>
                              <td className="px-3 py-2 font-medium text-stone-50">
                                {row.name}
                              </td>
                              <td className="px-3 py-2 text-stone-300">
                                {row.email || "—"}
                              </td>
                              <td className="px-3 py-2 text-stone-300">
                                {row.category || "—"}
                              </td>
                              <td className="px-3 py-2 text-stone-300">
                                {row.plusOnes}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setOpen(false);
                    reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={pending || !parsed?.rows.length}
                >
                  {pending
                    ? "Importando…"
                    : `Importar ${parsed?.rows.length ?? 0} invitados`}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
