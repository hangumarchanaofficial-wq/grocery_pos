const CSV_DANGEROUS_START = /^[=+\-@\t\r]/;

/** Prevent CSV/formula injection when opening in Excel. */
export function sanitizeCsvCell(value: string): string {
  const s = String(value ?? '');
  if (CSV_DANGEROUS_START.test(s)) {
    return `'${s}`;
  }
  return s;
}
