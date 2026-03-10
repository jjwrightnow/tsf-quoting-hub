import { useEffect, useRef } from 'react';
import { useWizardStore } from '@/stores/wizardStore';
import { useAppStore } from '@/stores/appStore';
import { useDraftQuotes } from '@/hooks/useDraftQuotes';

/**
 * Auto-saves wizard state to draft_quotes whenever a step is completed.
 * Must be rendered inside a component that has access to userEmail.
 */
export function useWizardAutoSave(userEmail: string | undefined) {
  const { upsertDraft } = useDraftQuotes(userEmail);
  const lastSavedStep = useRef(-1);

  useEffect(() => {
    if (!userEmail) return;

    const unsub = useWizardStore.subscribe((state, prev) => {
      // Only save when completedSteps changes (a step was completed)
      if (state.completedSteps.length <= prev.completedSteps.length) return;
      if (state.submittedQuoteId) return; // Already submitted, don't save draft

      const latestStep = Math.max(...state.completedSteps);
      if (latestStep === lastSavedStep.current) return;
      lastSavedStep.current = latestStep;

      const draftId = useAppStore.getState().activeDraftId;
      const profileName = state.profileName || '';
      const now = new Date();
      const title = `Quote – ${profileName || 'New'} – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

      const specData = {
        artworkPath: state.artworkPath,
        profileId: state.profileId,
        profileName: state.profileName,
        illuminationId: state.illuminationId,
        illuminationName: state.illuminationName,
        materialId: state.materialId,
        materialName: state.materialName,
        finishId: state.finishId,
        finishName: state.finishName,
        letterHeight: state.letterHeight,
        signWidth: state.signWidth,
        quantity: state.quantity,
        projectName: state.projectName,
        location: state.location,
        accountType: state.accountType,
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
      };

      const payload: Record<string, unknown> = {
        title,
        profile_type: state.profileName,
        spec_data: specData,
      };
      if (draftId) payload.id = draftId;

      upsertDraft(payload as any).then((saved) => {
        if (saved && !draftId) {
          useAppStore.getState().setActiveDraftId(saved.id);
        }
      });
    });

    return unsub;
  }, [userEmail, upsertDraft]);
}
