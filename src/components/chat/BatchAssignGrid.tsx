import { useState } from 'react';
import { useSignStore } from '@/stores/signStore';
import { supabase } from '@/integrations/supabase/client';
import { PROFILE_TYPES, PROFILE_DEFAULTS } from '@/lib/sign-constants';
import { Loader2 } from 'lucide-react';

interface BatchRow {
  fileName: string;
  filePath: string;
  pageRef: string;
  profileType: string;
}

interface BatchAssignGridProps {
  onDone: () => void;
}

const BatchAssignGrid = ({ onDone }: BatchAssignGridProps) => {
  const { uploadedFiles, sessionId } = useSignStore();
  const [rows, setRows] = useState<BatchRow[]>(() =>
    uploadedFiles.map((f) => ({
      fileName: f.name,
      filePath: f.path,
      pageRef: f.name.replace(/\.[^/.]+$/, ''),
      profileType: '',
    }))
  );
  const [submitting, setSubmitting] = useState(false);

  const allAssigned = rows.every((r) => r.profileType !== '');

  const updateProfile = (index: number, profileType: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, profileType } : r)));
  };

  const handleSubmit = async () => {
    if (!sessionId || !allAssigned) return;
    setSubmitting(true);

    try {
      const inserts = rows.map((r, i) => ({
        session_id: sessionId,
        sign_name: r.pageRef,
        page_ref: r.pageRef,
        sort_order: i,
        status: 'draft',
        specs_source: 'batch',
        profile_type: r.profileType,
        ...(PROFILE_DEFAULTS[r.profileType] || {}),
      }));

      const { error } = await supabase.from('review_signs').insert(inserts);
      if (error) throw error;

      await supabase.from('review_sessions').update({ status: 'submitted' }).eq('id', sessionId);
      onDone();
    } catch (err) {
      console.error('Batch assign error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 mt-3">
      {rows.map((row, i) => (
        <div
          key={row.filePath}
          className="flex items-center gap-3 rounded-md border border-border bg-card p-3"
        >
          <span className="flex-1 truncate text-sm text-foreground">{row.fileName}</span>
          <select
            value={row.profileType}
            onChange={(e) => updateProfile(i, e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="" disabled>
              Select profile…
            </option>
            {PROFILE_TYPES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={!allAssigned || submitting}
        className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-primary hover:shadow-[0_0_12px_hsl(var(--primary)/0.25)] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? 'Submitting…' : 'Submit All'}
      </button>
    </div>
  );
};

export default BatchAssignGrid;
