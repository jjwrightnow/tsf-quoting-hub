import { create } from 'zustand';

export interface OperatorConfig {
  brand_name: string | null;
  chatbot_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  support_email: string | null;
  canned_questions: { q: string; a: string }[];
  context_instruction: string | null;
}

interface AppState {
  userTier: 0 | 1 | 2;
  operatorConfig: OperatorConfig | null;
}

interface AppActions {
  setUserTier: (tier: 0 | 1 | 2) => void;
  setOperatorConfig: (config: OperatorConfig) => void;
}

export const useAppStore = create<AppState & AppActions>((set) => ({
  userTier: 0,
  operatorConfig: null,
  setUserTier: (tier) => set({ userTier: tier }),
  setOperatorConfig: (config) => set({ operatorConfig: config }),
}));
