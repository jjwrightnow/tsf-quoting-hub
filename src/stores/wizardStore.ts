import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WizardState {
  artworkPath: string | null;
  profileId: string | null;
  profileName: string | null;
  illuminationId: string | null;
  illuminationName: string | null;
  materialId: string | null;
  materialName: string | null;
  finishId: string | null;
  finishName: string | null;
  letterHeight: number | null;
  signWidth: number | null;
  quantity: number;
  projectName: string;
  location: string;
  accountType: 'Sign Pro' | 'Retail' | null;
  currentStep: number;
  completedSteps: number[];
  submittedQuoteId: string | null;
}

interface WizardActions {
  setArtwork: (path: string | null) => void;
  setProfile: (id: string | null, name: string | null) => void;
  setIllumination: (id: string | null, name: string | null) => void;
  setMaterial: (id: string | null, name: string | null) => void;
  setFinish: (id: string | null, name: string | null) => void;
  setDimensions: (letterHeight: number | null, signWidth: number | null, quantity: number) => void;
  setProjectDetails: (projectName: string, location: string, accountType: 'Sign Pro' | 'Retail' | null) => void;
  setCurrentStep: (step: number) => void;
  completeStep: (step: number) => void;
  goToStep: (step: number) => void;
  setSubmittedQuoteId: (id: string | null) => void;
  resetWizard: () => void;
  hasDraft: () => boolean;
}

const initialState: WizardState = {
  artworkPath: null,
  profileId: null,
  profileName: null,
  illuminationId: null,
  illuminationName: null,
  materialId: null,
  materialName: null,
  finishId: null,
  finishName: null,
  letterHeight: null,
  signWidth: null,
  quantity: 1,
  projectName: '',
  location: '',
  accountType: null,
  currentStep: 0,
  completedSteps: [],
  submittedQuoteId: null,
};

export const useWizardStore = create<WizardState & WizardActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setArtwork: (path) => set({ artworkPath: path }),
      setProfile: (id, name) => set({ profileId: id, profileName: name }),
      setIllumination: (id, name) => set({ illuminationId: id, illuminationName: name }),
      setMaterial: (id, name) => set({ materialId: id, materialName: name }),
      setFinish: (id, name) => set({ finishId: id, finishName: name }),
      setDimensions: (letterHeight, signWidth, quantity) =>
        set({ letterHeight, signWidth, quantity }),
      setProjectDetails: (projectName, location, accountType) =>
        set({ projectName, location, accountType }),
      setCurrentStep: (step) => set({ currentStep: step }),
      completeStep: (step) => {
        const completed = get().completedSteps;
        if (!completed.includes(step)) {
          set({ completedSteps: [...completed, step] });
        }
      },
      goToStep: (step) => set({ currentStep: step }),
      setSubmittedQuoteId: (id) => set({ submittedQuoteId: id }),
      resetWizard: () => set(initialState),
      hasDraft: () => {
        const state = get();
        return state.currentStep > 0 && state.submittedQuoteId === null;
      },
    }),
    {
      name: 'tsf-wizard-draft',
    }
  )
);
