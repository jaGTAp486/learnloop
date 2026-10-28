import { useCallback, useEffect, useRef, useState } from 'react';
import { loadData, saveData } from '@/lib/storage';
import { fetchAppData, saveAppData } from '@/lib/db';
import type { AppData } from '@/types';
import { emptyAppData } from '@/types';

export function useAppData(userId: string | undefined) {
  const [data, setData] = useState<AppData>(emptyAppData);
  const [loading, setLoading] = useState(true);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');

  // Load data when user changes
  useEffect(() => {
    if (!userId) {
      setData(emptyAppData);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      // Load from localStorage first for instant display, then sync with Supabase
      const local = loadData();
      if (!cancelled) setData(local);

      try {
        const remote = await fetchAppData();
        if (!cancelled) {
          setData(remote);
          // Also update localStorage as a cache
          saveData(remote);
        }
      } catch {
        // Supabase fetch failed — keep local data
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userId]);

  // Debounced save to Supabase whenever data changes (and user is logged in)
  useEffect(() => {
    if (!userId || loading) return;

    const serialized = JSON.stringify(data);
    if (serialized === lastSavedRef.current) return;

    // Always update localStorage immediately (fast, synchronous)
    saveData(data);

    // Debounce Supabase sync to avoid too many calls
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      lastSavedRef.current = serialized;
      saveAppData(data).catch(() => {
        // Silently fail — localStorage has the data as fallback
      });
    }, 800);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [data, userId, loading]);

  const update = useCallback((updater: (d: AppData) => AppData) => {
    setData((prev) => updater(prev));
  }, []);

  return { data, update, loading };
}
