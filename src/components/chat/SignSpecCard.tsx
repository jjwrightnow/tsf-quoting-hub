import { useState } from 'react';
import { useSignStore, type SignRecord } from '@/stores/signStore';
import { supabase } from '@/integrations/supabase/client';
import { useSpecOptions } from '@/hooks/useSpecOptions';
import {
  FIELD_LABELS,
  CATEGORY_MAP,
} from '@/lib/sign-constants';
import SpecExamplePlaceholder from '@/components/chat/SpecExamplePlaceholder';

interface SignSpecCardProps {
  sign: SignRecord;
  onSaved: () => void;
  onAddAnother: () => void;
  onDone: () => void;
}

const SignSpecCard = ({ sign, onSaved, onAddAnother, onDone }: SignSpecCardProps) => {
  const updateSign = useSignStore((s) => s.updateSign);
  const userRole = useSignStore((s) => s.userRole);
  const { specsByProfile, loading: specsLoading } = useSpecOptions();

  const isCollapsed = sign.status === 'saved';

  // Derive fields from DB-driven spec_options
  const profileSpecs = specsByProfile[sign.profile_type || ''] || [];
  const fieldNames = profileSpecs.map((s) => s.field_name);

  const buildSpecs = (s: SignRecord): Record<string, string> => {
    const specs: Record<string, string> = {};
    const allPossible = ['metal_type', 'finish', 'depth', 'led_color', 'mounting', 'back_type', 'acrylic_face', 'lead_wires', 'ul_label', 'wire_exit'];
    allPossible.forEach((f) => {
      specs[f] = (s as unknown as Record<string, unknown>)[f] as string || '';
    });
    return specs;
  };

  const [localSpecs, setLocalSpecs] = useState<Record<string, string>>(() => buildSpecs(sign));
  const [prevSignId, setPrevSignId] = useState(sign.id);

  if (sign.id !== prevSignId) {
    setPrevSignId(sign.id);
    setLocalSpecs(buildSpecs(sign));
  }
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleSpecChange = (field: string, value: string) => {
    setLocalSpecs((prev) => ({ ...prev, [field]: value }));
    setOpenDropdown(null);
  };

  const getOptionsForField = (field: string): string[] => {
    const spec = profileSpecs.find((s) => s.field_name === field);
    return spec?.options || [];
  };

  const saveSign = async (extraFields: Partial<SignRecord> = {}) => {
    setSaving(true);
    try {
      const updates: Record<string, unknown> = {
        profile_type: sign.profile_type,
        ...localSpecs,
        ...extraFields,
      };
      const { error } = await supabase
        .from('review_signs')
        .update(updates)
        .eq('id', sign.id);

      if (error) {
        console.error('Error saving sign:', error);
        return;
      }
      updateSign(sign.id, updates as Partial<SignRecord>);
      setEditing(false);
    } catch (err) {
      console.error('Save sign error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLooksGood = async () => {
    await saveSign({ specs_source: 'customer_entered', status: 'saved' });
    onSaved();
  };

  const handleSpecsInArtwork = async () => {
    await saveSign({ specs_source: 'in_artwork', status: 'saved' });
    onSaved();
  };

  const handleAddAnother = async () => {
    await saveSign({ specs_source: 'customer_entered', status: 'saved' });
    onAddAnother();
  };

  const handleDone = async () => {
    await saveSign({ specs_source: 'customer_entered', status: 'saved' });
    onDone();
  };

  // === COLLAPSED STATE ===
  if (isCollapsed && !editing) {
    const specSummary = [
      sign.profile_type,
      localSpecs.metal_type,
      localSpecs.finish,
      localSpecs.depth,
    ].filter(Boolean).join(', ');

    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">
            ✅ {sign.sign_name} — {specSummary}
          </span>
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-primary hover:underline"
          >
            Edit
          </button>
        </div>
      </div>
    );
  }

  // === SPECS EDITING STATE ===
  const fields = fieldNames;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <h4 className="text-sm font-medium text-foreground">{sign.sign_name}</h4>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {sign.profile_type}
        </span>
      </div>

      {/* Spec fields */}
      <div className="space-y-3 mb-6">
        {fields.map((field) => {
          const options = getOptionsForField(field);
          const isOpen = openDropdown === field;

          return (
            <div key={field} className="py-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {profileSpecs.find((s) => s.field_name === field)?.label || FIELD_LABELS[field] || field}
                </span>
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdown(isOpen ? null : field)}
                    className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs text-foreground hover:border-primary transition-colors"
                  >
                    {localSpecs[field] || '—'}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {isOpen && options.length > 0 && (
                    <div className="absolute right-0 top-full z-20 mt-1 max-h-48 w-52 overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
                      {options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleSpecChange(field, opt)}
                          className="w-full px-3 py-2 text-left text-xs text-foreground hover:bg-secondary transition-colors"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {isOpen && options.length === 0 && (
                    <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-border bg-card p-3 shadow-lg">
                      <input
                        type="text"
                        defaultValue={localSpecs[field] || ''}
                        onBlur={(e) => handleSpecChange(field, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSpecChange(field, (e.target as HTMLInputElement).value);
                        }}
                        className="w-full rounded border border-border bg-transparent px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </div>
              <SpecExamplePlaceholder fieldName={profileSpecs.find((s) => s.field_name === field)?.label || FIELD_LABELS[field] || field} />
            </div>
          );
        })}
      </div>

      {/* Assistant-only: Price input */}
      {userRole === 'assistant' && (
        <div className="flex items-center justify-between text-sm mb-6 pt-3 border-t border-border">
          <span className="text-muted-foreground">Price</span>
          <input
            type="number"
            placeholder="$0.00"
            className="w-24 rounded border border-border bg-transparent px-2 py-1.5 text-xs text-foreground text-right focus:border-primary focus:outline-none"
            onChange={(e) => {
              const price = parseFloat(e.target.value) || null;
              updateSign(sign.id, { price });
            }}
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleLooksGood}
          disabled={saving}
          className="w-full rounded-lg gradient-pink-blue px-4 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Looks good ✓'}
        </button>
        <button
          onClick={handleSpecsInArtwork}
          disabled={saving}
          className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all hover:border-primary disabled:opacity-50"
        >
          Specs are in the artwork
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleAddAnother}
            disabled={saving}
            className="flex-1 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all hover:border-primary disabled:opacity-50"
          >
            Add another sign
          </button>
          <button
            onClick={handleDone}
            disabled={saving}
            className="flex-1 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:border-primary disabled:opacity-50"
          >
            I'm done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignSpecCard;
