import Papa from "papaparse";
import { readSheet } from "read-excel-file/browser";
import { GuestSchema, type GuestInput } from "@/lib/validations/guests";

export type ParsedGuests = {
  rows: GuestInput[];
  errors: string[];
  total: number;
  headers: string[];
};

const MAX_ROWS = 5000;
const MAX_BYTES = 5 * 1024 * 1024;

const aliases: Record<keyof GuestInput, string[]> = {
  name: ["nombre", "name", "invitado", "guest", "asistente"],
  email: ["email", "correo", "correo_electronico", "e_mail", "mail"],
  phone: ["telefono", "phone", "celular", "whatsapp", "movil"],
  category: ["categoria", "category", "tipo", "type", "tipo_de_entrada"],
  plusOnes: [
    "acompanantes",
    "plus_ones",
    "plusones",
    "invitados_extra",
    "extras",
  ],
  table: ["mesa", "table"],
  notes: ["notas", "notes", "observaciones", "comentarios"],
};

function normalizeHeader(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function valueOf(row: unknown[], index: number | undefined): string {
  if (index === undefined) return "";
  const value = row[index];
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function parsePlusOnes(value: string): number {
  const parsed = Number.parseInt(value.replace(/\D/g, ""), 10);
  return Number.isFinite(parsed) ? Math.min(20, Math.max(0, parsed)) : 0;
}

export async function parseGuestFile(file: File): Promise<ParsedGuests> {
  const empty: ParsedGuests = { rows: [], errors: [], total: 0, headers: [] };
  if (file.size > MAX_BYTES) {
    return {
      ...empty,
      errors: ["El archivo supera los 5 MB. Divide la lista en partes."],
    };
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  let matrix: unknown[][];

  if (extension === "xlsx") {
    matrix = await readSheet(file);
  } else if (extension === "csv") {
    const parsed = await new Promise<Papa.ParseResult<string[]>>(
      (resolve, reject) => {
        Papa.parse<string[]>(file, {
          skipEmptyLines: "greedy",
          complete: resolve,
          error: reject,
        });
      },
    );
    matrix = parsed.data;
  } else {
    return {
      ...empty,
      errors: ["Formato no soportado. Usa un archivo .xlsx o .csv."],
    };
  }

  if (matrix.length === 0) {
    return { ...empty, errors: ["El archivo está vacío."] };
  }

  const headers = matrix[0].map((header) => String(header ?? ""));
  const normalizedHeaders = headers.map(normalizeHeader);
  const columns = {} as Record<keyof GuestInput, number | undefined>;

  for (const key of Object.keys(aliases) as Array<keyof GuestInput>) {
    columns[key] = normalizedHeaders.findIndex((header) =>
      aliases[key].includes(header),
    );
    if (columns[key] === -1) columns[key] = undefined;
  }

  if (columns.name === undefined) {
    return {
      ...empty,
      headers,
      errors: [
        "No encontramos una columna de nombre. Usa «Nombre» o «Name» como encabezado.",
      ],
    };
  }

  const dataRows = matrix.slice(1).filter((row) =>
    row.some((cell) => String(cell ?? "").trim() !== ""),
  );

  if (dataRows.length > MAX_ROWS) {
    return {
      ...empty,
      headers,
      errors: [`La lista tiene más de ${MAX_ROWS} filas. Divide el archivo.`],
    };
  }

  const rows: GuestInput[] = [];
  const errors: string[] = [];

  dataRows.forEach((row, index) => {
    const raw = {
      name: valueOf(row, columns.name),
      email: valueOf(row, columns.email),
      phone: valueOf(row, columns.phone),
      category: valueOf(row, columns.category),
      plusOnes: parsePlusOnes(valueOf(row, columns.plusOnes)),
      table: valueOf(row, columns.table),
      notes: valueOf(row, columns.notes),
    };

    const parsed = GuestSchema.safeParse(raw);
    if (!parsed.success) {
      const message =
        parsed.error.errors[0]?.message ?? "Datos inválidos en la fila";
      errors.push(`Fila ${index + 2}: ${message}`);
      return;
    }
    rows.push(parsed.data);
  });

  return { rows, errors, total: dataRows.length, headers };
}
