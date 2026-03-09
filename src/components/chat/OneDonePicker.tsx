import { useState } from 'react';
import { useSignStore, type SignRecord } from '@/stores/signStore';
import { supabase } from '@/integrations/supabase/client';
import { PROFILE_DEFAULTS } from '@/lib/sign-constants';
import ProfileSelector from '@/components/chat/ProfileSelector';

const OneDonePicker = () => {
  const { uploadedFiles, sessionId, setSigns, setChatPhase } = useSignStore();
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = async (profile: string) => {
    if (submitting || !sessionId) return;
    setSubmitting(true);

    try {
      const defaults = PROFILE_DEFAULTS[profile] || {};
      const inserts = uploadedFiles.map((f, i) => ({
        session_id: sessionId,
        sign_name: f.name.replace(/\.[^/.]+$/, ''),
        page_ref: f.name,
        sort_order: i,
        status: 'draft',
        specs_source: 'one_done',
        profile_type: profile,
        ...defaults,
      }));

      const { data, error } = await supabase.from('review_signs').insert(inserts).select();
      if (error) throw error;

      if (data) {
        setSigns(
          data.map((d): SignRecord => ({
            id: d.id,
            session_id: d.session_id,
            sign_name: d.sign_name,
            page_ref: d.page_ref,
            sort_order: d.sort_order,
            profile_type: d.profile_type,
            metal_type: d.metal_type,
            finish: d.finish,
            depth: d.depth,
            led_color: d.led_color,
            mounting: d.mounting,
            back_type: d.back_type,
            acrylic_face: d.acrylic_face,
            lead_wires: d.lead_wires,
            ul_label: d.ul_label,
            wire_exit: d.wire_exit,
            specs_source: d.specs_source,
            status: d.status,
            price: d.price,
            customer_notes: d.customer_notes,
            flag_count: d.flag_count,
          }))
        );
      }

      setChatPhase('one_done_specs');
    } catch (err) {
      console.error('One & Done insert error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 mt-3">
      <p className="text-sm text-muted-foreground">
        Pick one profile — it will apply to all {uploadedFiles.length} uploaded file(s).
      </p>
      <ProfileSelector signName="All Signs" onSelect={handleSelect} />
    </div>
  );
};

export default OneDonePicker;
