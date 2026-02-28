import { useEffect, useRef } from 'react';
import { getQuotePortal } from '@/lib/supabase-functions';
import { useAppStore } from '@/stores/appStore';

export function useQuotePolling(enabled: boolean) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const setQuotesList = useAppStore((s) => s.setQuotesList);

  useEffect(() => {
    if (!enabled) return;

    const poll = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const data = await getQuotePortal({ action: 'list' });
        if (data?.quotes) {
          setQuotesList(
            data.quotes.map((q: Record<string, string>) => ({
              quoteId: q.id,
              projectName: q.project_name,
              status: q.status,
              quoteDisplayId: q.quote_display_id,
              updatedAt: q.updated_at || q.created_at,
            }))
          );
        }
      } catch {
        // silent
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 90000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, setQuotesList]);
}
