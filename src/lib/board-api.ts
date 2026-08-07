/**
 * Build-time client for the food-tracker board endpoint.
 *
 * This module runs only during `astro build` / `astro dev`. Nothing here ships
 * to the browser: the generated HTML contains the mapped values, never the URL
 * or the token.
 *
 * Every successful response is cached under .cache/, so repeat builds are
 * offline and an expired token doesn't break the build (it falls back to the
 * last good snapshot and warns).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { BoardResponse } from './board-types';
import { readEnv, readFlag } from './env';

const ENDPOINT = 'https://food-tracker.pht.space/api/v2/recommendation/calc/board/';
const CACHE_DIR = join(process.cwd(), '.cache');

/**
 * JWT for the `Authorization: Secret <token>` header. Kept in .env.
 * `FOOD_TRACKER_TOKEN` stays supported as an alias for the access token.
 */
const TOKEN: string | undefined =
  readEnv('FOOD_TRACKER_ACCESS_TOKEN') ?? readEnv('FOOD_TRACKER_TOKEN');

/** Reads a JWT's `exp` so an expired token can be reported before the request. */
function expiresAt(token: string): Date | null {
  try {
    const payload = token.split('.')[1];
    const { exp } = JSON.parse(Buffer.from(payload, 'base64').toString('utf8')) as { exp?: number };
    return exp ? new Date(exp * 1000) : null;
  } catch {
    return null;
  }
}

/** Set BOARD_OFFLINE=1 to skip the network and build from the cache. */
const OFFLINE = readFlag('BOARD_OFFLINE');

function cachePath(dates: string[], weekRender: number): string {
  return join(CACHE_DIR, `board-${dates[0]}_${dates[dates.length - 1]}_w${weekRender}.json`);
}

function readCache(file: string): BoardResponse | null {
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as BoardResponse;
  } catch {
    return null;
  }
}

function writeCache(file: string, data: BoardResponse): void {
  try {
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(file, JSON.stringify(data), 'utf8');
  } catch (error) {
    console.warn('[board] could not write cache:', (error as Error).message);
  }
}

async function request(dates: string[], weekRender: number): Promise<BoardResponse> {
  const url = `${ENDPOINT}?dates=${dates.join(',')}&week_render=${weekRender}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Secret ${TOKEN}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) {
    // The API answers `{ "error": ... }` with a 200 for some bad queries.
    throw new Error(`unexpected payload: ${JSON.stringify(payload).slice(0, 200)}`);
  }

  return payload as BoardResponse;
}

/**
 * Fetches the board for the given dates. Days without a logged report are
 * simply absent from the response — callers must handle the gaps.
 */
export async function fetchBoard(dates: string[], weekRender: number): Promise<BoardResponse> {
  const file = cachePath(dates, weekRender);

  if (OFFLINE) {
    const cached = readCache(file);
    if (cached) {
      console.info(`[board] BOARD_OFFLINE — using cache (${cached.length} day(s))`);
      return cached;
    }
    throw new Error(`[board] BOARD_OFFLINE is set but no cache exists at ${file}`);
  }

  if (!TOKEN) {
    const cached = readCache(file);
    if (cached) {
      console.warn(`[board] FOOD_TRACKER_TOKEN is not set — using cache (${cached.length} day(s))`);
      return cached;
    }
    throw new Error(
      '[board] FOOD_TRACKER_TOKEN is not set and no cache exists.\n' +
        '        Copy .env.example to .env and put a valid token in it.',
    );
  }

  const expiry = expiresAt(TOKEN);
  if (expiry && expiry.getTime() < Date.now()) {
    console.warn(
      `[board] ВНИМАНИЕ: access-токен истёк ${expiry.toISOString()} — нужен свежий в .env`,
    );
  }

  try {
    const data = await request(dates, weekRender);
    writeCache(file, data);
    console.info(`[board] fetched ${data.length} day(s) with data for ${dates.length} date(s)`);
    return data;
  } catch (error) {
    const message = (error as Error).message;
    const cached = readCache(file);
    if (cached) {
      console.warn(`[board] request failed (${message}) — falling back to cache`);
      return cached;
    }
    throw new Error(
      `[board] request failed: ${message}\n` +
        '        The access token is short-lived — it may have expired. Put a fresh one in .env.',
    );
  }
}

/** Display name from the token payload, so the profile isn't hardcoded. */
export function tokenOwner(): { firstName: string; lastName: string } | null {
  if (!TOKEN) return null;
  try {
    const [, payload] = TOKEN.split('.');
    const json = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    if (!json.first_name && !json.last_name) return null;
    return { firstName: json.first_name ?? '', lastName: json.last_name ?? '' };
  } catch {
    return null;
  }
}
