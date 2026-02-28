import { useWizardStore } from '@/stores/wizardStore';

const StepArtwork = () => {
  const { artworkPath, setArtwork, completeStep, setCurrentStep } = useWizardStore();

  const handleSkip = () => {
    setArtwork(null);
    completeStep(1);
    setCurrentStep(2);
  };

  const handleContinue = () => {
    completeStep(1);
    setCurrentStep(2);
  };

  return (
    <div className="flex gap-3 mt-2">
      {artworkPath ? (
        <button
          onClick={handleContinue}
          className="rounded-lg px-4 py-2 text-sm font-medium gradient-pink-blue text-foreground transition-all duration-300"
        >
          Continue with uploaded file
        </button>
      ) : (
        <button
          onClick={handleSkip}
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-all duration-300"
        >
          Skip -- no artwork yet
        </button>
      )}
    </div>
  );
};

export default StepArtwork;
