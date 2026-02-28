import { useState } from 'react';
import { useWizardStore } from '@/stores/wizardStore';

const StepDimensions = () => {
  const { letterHeight, signWidth, quantity, setDimensions, completeStep, setCurrentStep } = useWizardStore();
  const [h, setH] = useState(letterHeight?.toString() || '');
  const [w, setW] = useState(signWidth?.toString() || '');
  const [q, setQ] = useState(quantity?.toString() || '1');

  const canConfirm = h && Number(h) > 0 && Number(q) >= 1;

  const handleConfirm = () => {
    setDimensions(Number(h), w ? Number(w) : null, Number(q) || 1);
    completeStep(5);
    setCurrentStep(6);
  };

  return (
    <div className="space-y-3 py-2">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
            Letter Height *
          </label>
          <input
            type="number"
            value={h}
            onChange={(e) => setH(e.target.value)}
            placeholder='e.g. 24"'
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
            Sign Width
          </label>
          <input
            type="number"
            value={w}
            onChange={(e) => setW(e.target.value)}
            placeholder="Optional"
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
            Quantity *
          </label>
          <input
            type="number"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            min={1}
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>
      <button
        onClick={handleConfirm}
        disabled={!canConfirm}
        className="rounded-lg px-4 py-2 text-sm font-medium gradient-pink-blue text-foreground transition-all duration-300 disabled:opacity-30"
      >
        Confirm Dimensions
      </button>
    </div>
  );
};

export default StepDimensions;
