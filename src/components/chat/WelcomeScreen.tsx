import { useAppStore } from '@/stores/appStore';
import { useWizardStore } from '@/stores/wizardStore';

const CHIPS = [
  'Channel Letter Sign',
  'Illuminated Cabinet',
  'Dimensional Letters',
  'Custom Monument Sign',
];

const WelcomeScreen = () => {
  const setWizardActive = useAppStore((s) => s.setWizardActive);
  const wizardStore = useWizardStore();

  const hasDraft = wizardStore.currentStep > 0 && wizardStore.submittedQuoteId === null;

  const handleResume = () => {
    setWizardActive(true);
  };

  const handleDiscard = () => {
    wizardStore.resetWizard();
  };

  const handleChip = () => {
    wizardStore.resetWizard();
    setWizardActive(true);
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--tsf-text-muted)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.03,
        }}
      />

      <div className="relative z-10 max-w-lg text-center animate-fade-in-up">
        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">
          The Signage Factory
        </h1>
        <p className="text-base text-muted-foreground mb-8">
          Describe your sign project or upload your artwork to get started
        </p>

        {/* Draft banner */}
        {hasDraft && (
          <div className="mb-8 rounded-lg border border-border bg-card p-4 animate-fade-in-up">
            <p className="text-sm text-foreground mb-3">
              You have an unfinished quote. Resume where you left off.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleResume}
                className="rounded-lg px-4 py-2 text-sm font-medium gradient-pink-blue text-foreground transition-all duration-300 hover:opacity-90"
              >
                Resume
              </button>
              <button
                onClick={handleDiscard}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground transition-all duration-300"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Suggestion chips */}
        <div className="flex flex-wrap gap-3 justify-center">
          {CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={handleChip}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-all duration-300 hover:text-foreground hover:border-primary hover:shadow-[0_0_12px_rgba(0,170,255,0.2)]"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
