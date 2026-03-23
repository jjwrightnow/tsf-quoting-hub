import { create } from 'zustand';

export interface QuoteListItem {
  quoteId: string;
  projectName: string | null;
  status: string | null;
  quoteDisplayId: string | null;
  updatedAt: string;
  isPending?: boolean;
}

export interface CatalogItem {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
}

export interface CatalogBundle {
  profiles: CatalogItem[];
  illumination: CatalogItem[];
  materials: CatalogItem[];
  finishes: CatalogItem[];
}

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
  quotesList: QuoteListItem[];
  catalogBundle: CatalogBundle | null;
  activeQuoteId: string | null;
  activeDraftId: string | null;
  activeProjectId: string | null;
  activeSignId: string | null;
  wizardActive: boolean;
  sidebarOpen: boolean;
  userTier: 0 | 1 | 2;
  operatorConfig: OperatorConfig | null;
}

interface AppActions {
  setQuotesList: (quotes: QuoteListItem[]) => void;
  addGhostQuote: (quote: QuoteListItem) => void;
  removeGhostQuote: () => void;
  replaceGhostQuote: (realQuote: QuoteListItem) => void;
  setCatalogBundle: (bundle: CatalogBundle) => void;
  setActiveQuoteId: (id: string | null) => void;
  setActiveDraftId: (id: string | null) => void;
  setActiveProjectId: (id: string | null) => void;
  setActiveSignId: (projectId: string | null, signId: string | null) => void;
  setWizardActive: (active: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setUserTier: (tier: 0 | 1 | 2) => void;
  setOperatorConfig: (config: OperatorConfig) => void;
}

export const useAppStore = create<AppState & AppActions>((set) => ({
  quotesList: [],
  catalogBundle: null,
  activeQuoteId: null,
  activeDraftId: null,
  activeProjectId: null,
  activeSignId: null,
  wizardActive: false,
  sidebarOpen: true,
  userTier: 0,
  operatorConfig: null,

  setQuotesList: (quotes) => set({ quotesList: quotes }),
  addGhostQuote: (quote) =>
    set((state) => ({ quotesList: [quote, ...state.quotesList] })),
  removeGhostQuote: () =>
    set((state) => ({
      quotesList: state.quotesList.filter((q) => !q.isPending),
    })),
  replaceGhostQuote: (realQuote) =>
    set((state) => ({
      quotesList: state.quotesList.map((q) =>
        q.isPending ? realQuote : q
      ),
    })),
  setCatalogBundle: (bundle) => set({ catalogBundle: bundle }),
  setActiveQuoteId: (id) => set({ activeQuoteId: id, wizardActive: false, activeDraftId: null }),
  setActiveDraftId: (id) => set({ activeDraftId: id }),
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  setActiveSignId: (projectId, signId) =>
    set({ activeProjectId: projectId, activeSignId: signId, wizardActive: !!signId }),
  setWizardActive: (active) =>
    set({ wizardActive: active, activeQuoteId: active ? null : null }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setUserTier: (tier) => set({ userTier: tier }),
  setOperatorConfig: (config) => set({ operatorConfig: config }),
}));
