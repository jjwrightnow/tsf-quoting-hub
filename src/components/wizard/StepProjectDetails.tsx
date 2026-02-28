import { useState } from 'react';
import { useWizardStore } from '@/stores/wizardStore';

const StepProjectDetails = () => {
  const wizard = useWizardStore();
  const [name, setName] = useState(wizard.projectName || '');
  const [loc, setLoc] = useState(wizard.location || '');
  const [type, setType] = useState<'Sign Pro' | 'Retail' | null>(wizard.accountType);
  const [showSummary, setShowSummary] = useState(false);

  const canSubmit = name.trim() && loc.trim();

  const handleComplete = () => {
    wizard.setProjectDetails(name, loc, type);
    wizard.completeStep(6);
  };

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-3">
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
            Project Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Main Street Storefront"
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
            Location / City, State *
          </label>
          <input
            type="text"
            value={loc}
            onChange={(e) => setLoc(e.target.value)}
            placeholder="e.g. Austin, TX"
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
            Account Type
          </label>
          <div className="mt-1 flex gap-3">
            {(['Sign Pro', 'Retail'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-md border px-4 py-2 text-sm transition-all duration-300 ${
                  type === t
                    ? 'border-accent text-foreground neon-border-pink'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-primary'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary toggle */}
      <button
        onClick={() => setShowSummary(!showSummary)}
        className="text-xs text-primary hover:underline"
      >
        {showSummary ? 'Hide' : 'Review'} quote summary
      </button>

      {showSummary && (
        <div className="rounded-lg border border-border bg-secondary p-4 text-sm space-y-2 animate-fade-in-up">
          <SummaryRow label="Artwork" value={wizard.artworkPath ? wizard.artworkPath.split('/').pop()! : 'None'} step={1} />
          <SummaryRow label="Profile" value={wizard.profileName || 'Not selected'} step={2} />
          <SummaryRow label="Illumination" value={wizard.illuminationName || 'Not selected'} step={3} />
          <SummaryRow label="Material" value={wizard.materialName || 'Not selected'} step={4} />
          <SummaryRow label="Finish" value={wizard.finishName || 'Not selected'} step={4} />
          <SummaryRow label="Height" value={wizard.letterHeight ? `${wizard.letterHeight}"` : 'N/A'} step={5} />
          <SummaryRow label="Quantity" value={String(wizard.quantity)} step={5} />
        </div>
      )}

      {/* Complete step (submit button rendered in ChatThread) */}
      {canSubmit && !wizard.completedSteps.includes(6) && (
        <button
          onClick={handleComplete}
          className="w-full rounded-lg py-3 text-sm font-semibold gradient-pink-blue text-foreground transition-all duration-300 hover:opacity-90"
        >
          Send Quote Request
        </button>
      )}
    </div>
  );
};

const SummaryRow = ({ label, value, step }: { label: string; value: string; step: number }) => {
  const goToStep = useWizardStore((s) => s.goToStep);
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-foreground">{value}</span>
        <button
          onClick={() => goToStep(step)}
          className="text-[10px] text-primary hover:underline"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default StepProjectDetails;
