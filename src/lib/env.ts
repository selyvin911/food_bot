/**
 * Build-time config lookup.
 *
 * Vite fills `import.meta.env` from .env files only, so shell overrides
 * (`BOARD_DATE=2026-07-20 npm run build`) have to be read from process.env.
 * .env wins for nothing — the explicit shell value takes precedence.
 */
export function readEnv(key: string): string | undefined {
  const fromProcess = typeof process !== 'undefined' ? process.env?.[key] : undefined;
  const fromVite = (import.meta.env as Record<string, string | undefined>)[key];
  return fromProcess ?? fromVite;
}

export function readNumber(key: string, fallback: number): number {
  const raw = readEnv(key);
  const parsed = raw === undefined ? NaN : Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function readFlag(key: string): boolean {
  const raw = readEnv(key);
  return raw === '1' || raw === 'true';
}
