import { useReviewStore } from '@/stores/reviewStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMemo } from 'react';

const SPEC_FIELDS = [
  'Metal Type', 'Finish', 'Mounting', 'LED', 'Depth', 'Back Type', 'Acrylic', 'UL Label', 'Wire Exit',
];

interface FlagFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
}

const FlagForm = ({ onSave, onCancel }: FlagFormProps) => {
  const formState = useReviewStore((s) => s.flagFormState);
  const setFlagFormState = useReviewStore((s) => s.setFlagFormState);
  const autocompleteOptions = useReviewStore((s) => s.autocompleteOptions);

  const recommendSuggestions = useMemo(() => {
    if (!formState?.spec_field || !formState?.recommended_value) return [];
    const q = formState.recommended_value.toLowerCase();
    return autocompleteOptions
      .filter((o) => o.category.toLowerCase().includes(formState.spec_field!.toLowerCase()))
      .filter((o) => o.display_label.toLowerCase().includes(q))
      .slice(0, 5);
  }, [formState?.spec_field, formState?.recommended_value, autocompleteOptions]);

  if (!formState) return null;

  const update = (partial: Partial<typeof formState>) => {
    setFlagFormState({ ...formState, ...partial });
  };

  const handleSave = () => {
    onSave({
      issue_description: formState.issue_description,
      flag_type: formState.flag_type || 'note',
      sign_page_ref: formState.sign_page_ref || null,
      reason_code: formState.reason_code,
      spec_field: formState.spec_field,
      customer_value: formState.customer_value || null,
      recommended_value: formState.recommended_value || null,
      screenshot_path: formState.screenshot_path,
    });
  };

  return (
    <div className="space-y-3 border-t border-border bg-secondary/50 p-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">New Flag</p>

      {/* Step 1: Page ref */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Which sign or page?</label>
        <Input
          value={formState.sign_page_ref}
          onChange={(e) => update({ sign_page_ref: e.target.value })}
          className="h-8 text-sm"
        />
      </div>

      {/* Step 2: Type */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={formState.flag_type === 'spec_change' ? 'default' : 'outline'}
          onClick={() => update({ flag_type: 'spec_change', step: 3 })}
        >
          Spec Change
        </Button>
        <Button
          size="sm"
          variant={formState.flag_type === 'note' ? 'default' : 'outline'}
          onClick={() => update({ flag_type: 'note', step: 5 })}
        >
          Note
        </Button>
      </div>

      {/* Step 3: Spec details */}
      {formState.flag_type === 'spec_change' && (
        <div className="space-y-2">
          <Select value={formState.spec_field || ''} onValueChange={(v) => update({ spec_field: v })}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Which spec?" />
            </SelectTrigger>
            <SelectContent>
              {SPEC_FIELDS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input
            placeholder="Customer requested:"
            value={formState.customer_value}
            onChange={(e) => update({ customer_value: e.target.value })}
            className="h-8 text-sm"
          />
          <div className="relative">
            <Input
              placeholder="Recommend:"
              value={formState.recommended_value}
              onChange={(e) => update({ recommended_value: e.target.value })}
              className="h-8 text-sm"
            />
            {recommendSuggestions.length > 0 && formState.recommended_value && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded border border-border bg-popover shadow-lg">
                {recommendSuggestions.map((s) => (
                  <button
                    key={s.option_value}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-accent"
                    onClick={() => update({ recommended_value: s.display_label })}
                  >
                    {s.display_label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleSave}>Add Flag</Button>
        <button onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
      </div>
    </div>
  );
};

export default FlagForm;
