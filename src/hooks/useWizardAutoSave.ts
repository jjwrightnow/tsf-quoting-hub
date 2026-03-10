import { useEffect, useRef } from 'react';
import { useWizardStore } from '@/stores/wizardStore';
import { useAppStore } from '@/stores/appStore';
import { supabase } from '@/integrations/supabase/client';

/**
 * Auto-saves wizard state to the signs table whenever a step is completed.
 * Uses activeSignId from appStore as the target record.
 */
export function useWizardAutoSave() {
  const lastSavedStep = useRef(-1);

  useEffect(() => {
    const unsub = useWizardStore.subscribe((state, prev) => {
      // Only save when completedSteps changes (a step was completed)
      if (state.completedSteps.length <= prev.completedSteps.length) return;
      if (state.submittedQuoteId) return;

      const latestStep = Math.max(...state.completedSteps);
      if (latestStep === lastSavedStep.current) return;
      lastSavedStep.current = latestStep;

      const activeSignId = useAppStore.getState().activeSignId;
      if (!activeSignId) return;

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

      supabase
        .from('signs')
        .update({
          spec_data: specData as any,
          profile_type: state.profileName,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', activeSignId)
        .then(({ error }) => {
          if (error) console.error('[useWizardAutoSave] save failed:', error);
        });
    });

    return unsub;
  }, []);
}
