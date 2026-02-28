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

interface AppState {
  quotesList: QuoteListItem[];
  catalogBundle: CatalogBundle | null;
  activeQuoteId: string | null;
  wizardActive: boolean;
  sidebarOpen: boolean;
}

interface AppActions {
  setQuotesList: (quotes: QuoteListItem[]) => void;
  addGhostQuote: (quote: QuoteListItem) => void;
  removeGhostQuote: () => void;
  replaceGhostQuote: (realQuote: QuoteListItem) => void;
  setCatalogBundle: (bundle: CatalogBundle) => void;
  setActiveQuoteId: (id: string | null) => void;
  setWizardActive: (active: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState & AppActions>((set) => ({
  quotesList: [],
  catalogBundle: null,
  activeQuoteId: null,
  wizardActive: false,
  sidebarOpen: true,

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
  setActiveQuoteId: (id) => set({ activeQuoteId: id, wizardActive: false }),
  setWizardActive: (active) =>
    set({ wizardActive: active, activeQuoteId: active ? null : null }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
