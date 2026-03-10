import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SpecOptionRow {
  profile_type: string;
  field_name: string;
  label: string;
  options: string[];
  sort_order: number;
  required: boolean;
}

/**
 * Fetches spec_options on mount. Returns a map keyed by profile_type,
 * each containing an ordered array of field specs.
 */
export function useSpecOptions() {
  const [specsByProfile, setSpecsByProfile] = useState<Record<string, SpecOptionRow[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      const { data, error } = await supabase
        .from('spec_options')
        .select('profile_type, field_name, label, options, sort_order, required')
        .order('sort_order', { ascending: true });

      if (cancelled) return;

      if (error) {
        console.error('[useSpecOptions] fetch error:', error);
        setLoading(false);
        return;
      }

      const map: Record<string, SpecOptionRow[]> = {};
      for (const row of data || []) {
        const pt = row.profile_type;
        if (!map[pt]) map[pt] = [];
        map[pt].push({
          ...row,
          options: Array.isArray(row.options) ? (row.options as string[]) : [],
        });
      }
      setSpecsByProfile(map);
      setLoading(false);
    };

    fetch();
    return () => { cancelled = true; };
  }, []);

  return { specsByProfile, loading };
}
