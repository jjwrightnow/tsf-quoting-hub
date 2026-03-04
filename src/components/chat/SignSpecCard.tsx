import { useState } from 'react';
import { useSignStore, type SignRecord } from '@/stores/signStore';
import { supabase } from '@/integrations/supabase/client';
import {
  SPEC_FIELDS_BY_PROFILE,
  FIELD_LABELS,
  CATEGORY_MAP,
  PROFILE_DEFAULTS,
  PROFILE_TYPES,
} from '@/lib/sign-constants';

interface SignSpecCardProps {
  sign: SignRecord;
  onSaved: () => void;
  onAddAnother: () => void;
  onDone: () => void;
}

type CardState = 'profile' | 'specs' | 'collapsed';

const SignSpecCard = ({ sign, onSaved, onAddAnother, onDone }: SignSpecCardProps) => {
  const updateSign = useSignStore((s) => s.updateSign);
  const userRole = useSignStore((s) => s.userRole);
  const autocompleteOptions = useSignStore((s) => s.autocompleteOptions);

  const [cardState, setCardState] = useState<CardState>(
    sign.profile_type ? (sign.status === 'saved' ? 'collapsed' : 'specs') : 'profile'
  );
  const [localSpecs, setLocalSpecs] = useState<Record<string, string>>(() => {
    if (sign.profile_type) {
      const fields = SPEC_FIELDS_BY_PROFILE[sign.profile_type] || [];
      const specs: Record<string, string> = {};
      fields.forEach((f) => {
        specs[f] = (sign as unknown as Record<string, unknown>)[f] as string || '';
      });
      return specs;
    }
    return {};
  });
  const [selectedProfile, setSelectedProfile] = useState(sign.profile_type || '');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSelectProfile = (profile: string) => {
    setSelectedProfile(profile);
    const defaults = PROFILE_DEFAULTS[profile] || {};
    setLocalSpecs({ ...defaults });
    setCardState('specs');
  };

  const handleSpecChange = (field: string, value: string) => {
    setLocalSpecs((prev) => ({ ...prev, [field]: value }));
    setOpenDropdown(null);
  };

  const getOptionsForField = (field: string) => {
    const category = CATEGORY_MAP[field];
    if (!category) return [];
    return autocompleteOptions.filter((o) => o.category === category);
  };

  const saveSign = async (extraFields: Partial<SignRecord> = {}) => {
    setSaving(true);
    try {
      const updates: Record<string, unknown> = {
        profile_type: selectedProfile,
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
      setCardState('collapsed');
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
  if (cardState === 'collapsed') {
    const specSummary = selectedProfile
      ? [
          selectedProfile,
          localSpecs.metal_type,
          localSpecs.finish,
          localSpecs.depth,
        ]
          .filter(Boolean)
          .join(', ')
      : 'No profile';

    return (
      <div className="mt-3 rounded-lg border border-border bg-card p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">
            ✅ {sign.sign_name} — {specSummary}
          </span>
          <button
            onClick={() => setCardState(selectedProfile ? 'specs' : 'profile')}
            className="text-xs text-primary hover:underline"
          >
            Edit
          </button>
        </div>
      </div>
    );
  }

  // === PROFILE SELECTION STATE ===
  if (cardState === 'profile') {
    return (
      <div className="mt-3 rounded-lg border border-border bg-card p-4">
        <h4 className="text-sm font-medium text-foreground mb-1">
          {sign.sign_name}
          {sign.page_ref && (
            <span className="text-muted-foreground ml-1">(Page {sign.page_ref})</span>
          )}
        </h4>
        <p className="text-xs text-muted-foreground mb-3">Select a profile type</p>
        <div className="grid grid-cols-2 gap-2">
          {PROFILE_TYPES.map((profile) => (
            <button
              key={profile}
              onClick={() => handleSelectProfile(profile)}
              className="rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground transition-all duration-200 hover:border-primary hover:shadow-[0_0_12px_rgba(0,170,255,0.15)]"
            >
              {profile}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // === SPECS EDITING STATE ===
  const fields = SPEC_FIELDS_BY_PROFILE[selectedProfile] || [];

  return (
    <div className="mt-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <h4 className="text-sm font-medium text-foreground">{sign.sign_name}</h4>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {selectedProfile}
        </span>
      </div>

      {/* Spec fields */}
      <div className="space-y-2 mb-4">
        {fields.map((field) => {
          const options = getOptionsForField(field);
          const isOpen = openDropdown === field;

          return (
            <div key={field} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{FIELD_LABELS[field] || field}</span>
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(isOpen ? null : field)}
                  className="flex items-center gap-1 rounded-md border border-border bg-secondary px-2.5 py-1 text-xs text-foreground hover:border-primary transition-colors"
                >
                  {localSpecs[field] || '—'}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isOpen && options.length > 0 && (
                  <div className="absolute right-0 top-full z-20 mt-1 max-h-48 w-48 overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
                    {options.map((opt) => (
                      <button
                        key={opt.option_value}
                        onClick={() => handleSpecChange(field, opt.option_value)}
                        className="w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-secondary transition-colors"
                      >
                        {opt.display_label}
                      </button>
                    ))}
                  </div>
                )}

                {isOpen && options.length === 0 && (
                  <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-border bg-card p-3 shadow-lg">
                    <input
                      type="text"
                      defaultValue={localSpecs[field] || ''}
                      onBlur={(e) => handleSpecChange(field, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSpecChange(field, (e.target as HTMLInputElement).value);
                      }}
                      className="w-full rounded border border-border bg-transparent px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Assistant-only: Price input */}
      {userRole === 'assistant' && (
        <div className="flex items-center justify-between text-sm mb-4 pt-2 border-t border-border">
          <span className="text-muted-foreground">Price</span>
          <input
            type="number"
            placeholder="$0.00"
            className="w-24 rounded border border-border bg-transparent px-2 py-1 text-xs text-foreground text-right focus:border-primary focus:outline-none"
            onChange={(e) => {
              const price = parseFloat(e.target.value) || null;
              setLocalSpecs((prev) => ({ ...prev }));
              updateSign(sign.id, { price });
            }}
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleLooksGood}
          disabled={saving}
          className="w-full rounded-lg gradient-pink-blue px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-300 hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Looks good'}
        </button>
        <button
          onClick={handleSpecsInArtwork}
          disabled={saving}
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:border-primary disabled:opacity-50"
        >
          Specs are in the artwork
        </button>
        <button
          onClick={handleAddAnother}
          disabled={saving}
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:border-primary disabled:opacity-50"
        >
          Add another sign
        </button>
        <button
          onClick={handleDone}
          disabled={saving}
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:border-primary disabled:opacity-50"
        >
          I'm done
        </button>
      </div>
    </div>
  );
};

export default SignSpecCard;
