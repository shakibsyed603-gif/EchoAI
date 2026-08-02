/**
 * useStudies — shared studies data source
 *
 * Design guarantees:
 *  1. Fetches `studies` exactly ONCE when StudiesProvider first mounts.
 *  2. `hasMounted` ref survives React Strict Mode's double-invoke of effects
 *     (refs are NOT reset between the unmount/remount cycle in dev), so the
 *     second effect invocation is a no-op -> exactly one real network request.
 *  3. `isFetching` ref blocks any concurrent duplicate call (e.g. a rapid
 *     double-click on "Retry") from actually firing a second request.
 *  4. No setInterval, no recursive scheduling, no polling of any kind.
 *  5. refresh() is the only way to trigger a subsequent fetch, and only
 *     when no request is already in flight.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';

// --- Types -------------------------------------------------------------------

export interface Study {
  [key: string]: any;
}

interface StudiesState {
  studies: Study[];
  loading: boolean;
  error: string | null;
  /** Re-fetches from Supabase. No-op if a request is already in flight. */
  refresh: () => void;
}

// --- Context -----------------------------------------------------------------

const StudiesContext = createContext<StudiesState | null>(null);

// --- Provider ----------------------------------------------------------------

export function StudiesProvider({ children }: { children: ReactNode }) {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  /**
   * Guard 1 - React Strict Mode double-mount protection.
   * Refs persist across the artificial unmount/remount cycle that React runs
   * in development, so hasMounted.current remains true on the second
   * effect call, preventing a second network request.
   */
  const hasMounted  = useRef(false);

  /**
   * Guard 2 - Concurrent duplicate request protection.
   * If refresh() is called while a fetch is already in flight, the new call
   * returns immediately without firing another network request.
   */
  const isFetching  = useRef(false);

  // -- Core fetch function ----------------------------------------------------

  const fetchStudies = useCallback(async () => {
    // Reject duplicate concurrent requests
    if (isFetching.current) return;

    isFetching.current = true;
    setLoading(true);
    setError(null);

    try {
      const { data, error: sbError } = await supabase
        .from('studies')
        .select('*')
        .order('created_at', { ascending: false });

      if (sbError) {
        // Structured error log - includes every field Supabase provides
        console.error('[useStudies] Supabase query error:', {
          message: sbError.message,
          code:    sbError.code,
          details: sbError.details,
          hint:    sbError.hint,
        });
        setError(sbError.message ?? 'Failed to load studies');
        setStudies([]);
      } else {
        setStudies(data ?? []);
        setError(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('[useStudies] Unexpected fetch error:', err);
      setError(msg);
      setStudies([]);
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  }, []); // Stable - no reactive deps, no risk of re-creation

  // -- Mount effect - fires exactly once per provider lifetime ----------------

  useEffect(() => {
    // Strict Mode guard: skip the second synthetic invocation in development
    if (hasMounted.current) return;
    hasMounted.current = true;

    fetchStudies();

    // No cleanup, no interval, no recursive call.
    // The next fetch only happens when refresh() is explicitly called.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Empty dep array is intentional: we want exactly one automatic fetch.

  // ---------------------------------------------------------------------------

  return (
    <StudiesContext.Provider value={{ studies, loading, error, refresh: fetchStudies }}>
      {children}
    </StudiesContext.Provider>
  );
}

// --- Consumer hook -----------------------------------------------------------

export function useStudies(): StudiesState {
  const ctx = useContext(StudiesContext);
  if (ctx === null) {
    throw new Error('useStudies() must be called inside a <StudiesProvider>.');
  }
  return ctx;
}
