import { useState } from 'react';
import { useSignStore } from '@/stores/signStore';
import { saveFlag } from '@/lib/review-functions';

interface AssistantFlagFormProps {
  signPageRef: string;
}

const AssistantFlagForm = ({ signPageRef }: AssistantFlagFormProps) => {
  const sessionId = useSignStore((s) => s.sessionId);
  const autocompleteOptions = useSignStore((s) => s.autocompleteOptions);

  const [description, setDescription] = useState('');
  const [flagType, setFlagType] = useState<'spec_change' | 'note'>('note');
  const [specField, setSpecField] = useState('');
  const [customerValue, setCustomerValue] = useState('');
  const [recommendedValue, setRecommendedValue] = useState('');
  const [reasonCode, setReasonCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const reasonOptions = autocompleteOptions.filter((o) => o.category === 'reason_code');

  const handleSave = async () => {
    if (!sessionId || !description.trim()) return;
    setSaving(true);
    try {
      await saveFlag({
        session_id: sessionId,
        sign_page_ref: signPageRef,
        issue_description: description,
        flag_type: flagType,
        reason_code: reasonCode || undefined,
        spec_field: flagType === 'spec_change' ? specField || undefined : undefined,
        customer_value: flagType === 'spec_change' ? customerValue || undefined : undefined,
        recommended_value: flagType === 'spec_change' ? recommendedValue || undefined : undefined,
      });
      setSaved(true);
      setDescription('');
      setReasonCode('');
      setSpecField('');
      setCustomerValue('');
      setRecommendedValue('');
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save flag error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 p-3 space-y-2">
      <p className="text-xs font-medium text-accent">Flag Issue</p>

      {/* Flag type toggle */}
      <div className="flex gap-1">
        {(['note', 'spec_change'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFlagType(t)}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              flagType === t
                ? 'bg-accent text-accent-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'note' ? 'Note' : 'Spec Change'}
          </button>
        ))}
      </div>

      {/* Issue description with reason code autocomplete */}
      <div className="relative">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Issue description..."
          className="w-full rounded border border-border bg-transparent px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          list="reason-codes"
        />
        <datalist id="reason-codes">
          {reasonOptions.map((o) => (
            <option key={o.option_value} value={o.display_label} />
          ))}
        </datalist>
      </div>

      {/* Reason code */}
      <input
        type="text"
        value={reasonCode}
        onChange={(e) => setReasonCode(e.target.value)}
        placeholder="Reason code"
        className="w-full rounded border border-border bg-transparent px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />

      {/* Spec change fields */}
      {flagType === 'spec_change' && (
        <div className="grid grid-cols-3 gap-1.5">
          <input
            type="text"
            value={specField}
            onChange={(e) => setSpecField(e.target.value)}
            placeholder="Spec field"
            className="rounded border border-border bg-transparent px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <input
            type="text"
            value={customerValue}
            onChange={(e) => setCustomerValue(e.target.value)}
            placeholder="Customer val"
            className="rounded border border-border bg-transparent px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <input
            type="text"
            value={recommendedValue}
            onChange={(e) => setRecommendedValue(e.target.value)}
            placeholder="Recommended"
            className="rounded border border-border bg-transparent px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || !description.trim()}
        className="rounded px-3 py-1.5 text-xs font-medium bg-accent text-accent-foreground hover:opacity-90 transition-all disabled:opacity-30"
      >
        {saved ? '✓ Saved' : saving ? 'Saving...' : 'Add Flag'}
      </button>
    </div>
  );
};

export default AssistantFlagForm;
