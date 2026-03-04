import { useState } from 'react';
import { useSignStore, type SignRecord } from '@/stores/signStore';
import { supabase } from '@/integrations/supabase/client';

const SignIdentifier = () => {
  const [signName, setSignName] = useState('');
  const [pendingSigns, setPendingSigns] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const sessionId = useSignStore((s) => s.sessionId);
  const setSigns = useSignStore((s) => s.setSigns);
  const setChatPhase = useSignStore((s) => s.setChatPhase);
  const setCurrentSignIndex = useSignStore((s) => s.setCurrentSignIndex);

  const handleAdd = () => {
    const trimmed = signName.trim();
    if (!trimmed) return;
    // Support comma-separated or single entry
    const names = trimmed.includes(',')
      ? trimmed.split(',').map((n) => n.trim()).filter(Boolean)
      : [trimmed];
    setPendingSigns((prev) => [...prev, ...names]);
    setSignName('');
  };

  const handleRemove = (index: number) => {
    setPendingSigns((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleDone = async () => {
    if (pendingSigns.length === 0 || !sessionId) return;
    setSaving(true);

    try {
      const inserts = pendingSigns.map((name, i) => ({
        session_id: sessionId,
        sign_name: name,
        sort_order: i,
        status: 'draft',
        specs_source: 'draft',
      }));

      const { data, error } = await supabase
        .from('review_signs')
        .insert(inserts)
        .select();

      if (error) {
        console.error('Error creating signs:', error);
        setSaving(false);
        return;
      }

      const signs: SignRecord[] = (data || []).map((row) => ({
        id: row.id,
        session_id: row.session_id,
        sign_name: row.sign_name,
        page_ref: row.page_ref,
        sort_order: row.sort_order,
        profile_type: row.profile_type,
        metal_type: row.metal_type,
        finish: row.finish,
        depth: row.depth,
        led_color: row.led_color,
        mounting: row.mounting,
        back_type: row.back_type,
        acrylic_face: row.acrylic_face,
        lead_wires: row.lead_wires,
        ul_label: row.ul_label,
        wire_exit: row.wire_exit,
        specs_source: row.specs_source,
        status: row.status,
        price: row.price,
        customer_notes: row.customer_notes,
        flag_count: row.flag_count,
      }));

      setSigns(signs);
      setCurrentSignIndex(0);
      setChatPhase('spec_signs');
    } catch (err) {
      console.error('Sign creation error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      {/* Sign list */}
      {pendingSigns.length > 0 && (
        <div className="space-y-1.5">
          {pendingSigns.map((name, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-md border border-border bg-secondary px-3 py-2 text-sm"
            >
              <span className="text-foreground">{name}</span>
              <button
                onClick={() => handleRemove(i)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={signName}
          onChange={(e) => setSignName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Main Entrance, Suite 200, Directory Board"
          className="flex-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <button
          onClick={handleAdd}
          disabled={!signName.trim()}
          className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground hover:border-primary transition-all disabled:opacity-30"
        >
          Add
        </button>
      </div>

      {/* Done button */}
      {pendingSigns.length > 0 && (
        <button
          onClick={handleDone}
          disabled={saving}
          className="w-full rounded-lg gradient-pink-blue px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-300 hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : `Done adding signs (${pendingSigns.length})`}
        </button>
      )}
    </div>
  );
};

export default SignIdentifier;
