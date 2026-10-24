/**
 * Escapes one CSV cell. Values that begin with a spreadsheet formula marker
 * are prefixed with an apostrophe so Excel/Sheets treat them as text.
 */
const FORMULA_PREFIX = /^[=+\-@\t\r\n]/

export function csvCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? '' : String(value)
  const safe = FORMULA_PREFIX.test(text) ? `'${text}` : text
  return `"${safe.replace(/"/g, '""')}"`
}
