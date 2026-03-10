import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DraftQuote {
  id: string;
  user_email: string;
  title: string;
  profile_type: string | null;
  spec_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export function useDraftQuotes(userEmail: string | undefined) {
  const [drafts, setDrafts] = useState<DraftQuote[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDrafts = useCallback(async () => {
    if (!userEmail) return;
    setLoading(true);
    const { data } = await supabase
      .from('draft_quotes')
      .select('*')
      .eq('user_email', userEmail)
      .order('updated_at', { ascending: false });
    if (data) setDrafts(data as unknown as DraftQuote[]);
    setLoading(false);
  }, [userEmail]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const upsertDraft = useCallback(
    async (draft: Partial<DraftQuote> & { id?: string }) => {
      if (!userEmail) return null;
      const payload = {
        ...draft,
        user_email: userEmail,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('draft_quotes')
        .upsert(payload as any, { onConflict: 'id' })
        .select()
        .single();
      if (!error && data) {
        const typed = data as unknown as DraftQuote;
        setDrafts((prev) => {
          const exists = prev.find((d) => d.id === typed.id);
          if (exists) return prev.map((d) => (d.id === typed.id ? typed : d));
          return [typed, ...prev];
        });
        return typed;
      }
      return null;
    },
    [userEmail],
  );

  const deleteDraft = useCallback(
    async (id: string) => {
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      await supabase.from('draft_quotes').delete().eq('id', id);
    },
    [],
  );

  const updateTitle = useCallback(
    async (id: string, title: string) => {
      setDrafts((prev) =>
        prev.map((d) => (d.id === id ? { ...d, title } : d)),
      );
      await supabase
        .from('draft_quotes')
        .update({ title, updated_at: new Date().toISOString() } as any)
        .eq('id', id);
    },
    [],
  );

  return { drafts, loading, fetchDrafts, upsertDraft, deleteDraft, updateTitle };
}
