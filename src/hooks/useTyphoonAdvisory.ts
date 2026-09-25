import { useEffect, useState } from 'react';
import {
  fetchActiveTyphoonAdvisory,
  type TyphoonAdvisory,
} from '../lib/typhoonAdvisory';

const POLL_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const CACHE_KEY = 'betteraparri:typhoon-advisory-cache';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CachedAdvisory {
  advisory: TyphoonAdvisory | null;
  fetchedAt: number;
}

function readCache(): CachedAdvisory | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedAdvisory;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(advisory: TyphoonAdvisory | null) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ advisory, fetchedAt: Date.now() })
    );
  } catch {
    // sessionStorage unavailable (private mode, etc.) — safe to skip.
  }
}

/**
 * Polls GDACS for an active Orange/Red tropical cyclone advisory
 * affecting the Philippines, for the sitewide banner. Short-lived
 * sessionStorage cache avoids re-fetching on every page navigation.
 */
export function useTyphoonAdvisory() {
  const [advisory, setAdvisory] = useState<TyphoonAdvisory | null>(
    () => readCache()?.advisory ?? null
  );
  const [hasLoaded, setHasLoaded] = useState(() => readCache() !== null);

  useEffect(() => {
    const abortController = new AbortController();

    const load = async () => {
      try {
        const result = await fetchActiveTyphoonAdvisory(abortController.signal);
        setAdvisory(result);
        writeCache(result);
      } catch (error) {
        if ((error as DOMException).name !== 'AbortError') {
          // Fail quietly: a missing advisory banner is not worth
          // surfacing a site-wide error state over.
          console.warn('Unable to load typhoon advisory', error);
        }
      } finally {
        setHasLoaded(true);
      }
    };

    const cached = readCache();
    if (cached) {
      setAdvisory(cached.advisory);
      setHasLoaded(true);
    } else {
      load();
    }

    const intervalId = setInterval(load, POLL_INTERVAL_MS);

    return () => {
      abortController.abort();
      clearInterval(intervalId);
    };
  }, []);

  return { advisory, hasLoaded };
}
