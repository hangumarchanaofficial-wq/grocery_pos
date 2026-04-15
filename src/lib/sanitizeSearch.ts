/**
 * Strip characters that break PostgREST `.or()` / `ilike` patterns or inject extra clauses.
 * Commas split OR conditions; % and _ are wildcards in SQL LIKE.
 */
export function sanitizeIlikePattern(raw: string): string {
  return raw
    .replace(/,/g, '')
    .replace(/[%_\\]/g, '')
    .trim()
    .slice(0, 200);
}
