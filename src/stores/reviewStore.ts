import { create } from 'zustand';

export interface ReviewSession {
  id: string;
  pg_quote_number: string | null;
  account_id: string;
  customer_name: string;
  status: string;
}

export interface ArtworkFile {
  name: string;
  path: string;
  type: string;
  pageCount?: number;
}

export interface ReviewFlag {
  id: string;
  sort_order: number;
  sign_page_ref: string | null;
  issue_description: string;
  flag_type: string;
  reason_code?: string | null;
  spec_field?: string | null;
  customer_value?: string | null;
  recommended_value?: string | null;
  screenshot_path?: string | null;
}

export interface AutocompleteOption {
  category: string;
  option_value: string;
  display_label: string;
  search_terms: string | null;
}

export interface FlagFormState {
  visible: boolean;
  issue_description: string;
  step: number;
  sign_page_ref: string;
  flag_type: 'spec_change' | 'note' | 'warning' | null;
  spec_field: string | null;
  customer_value: string;
  recommended_value: string;
  reason_code: string | null;
  screenshot_path: string | null;
}

interface ReviewState {
  session: ReviewSession | null;
  artworkFiles: ArtworkFile[];
  currentFileIndex: number;
  currentPage: number;
  flags: ReviewFlag[];
  autocompleteOptions: AutocompleteOption[];
  flagFormState: FlagFormState | null;
  submitStatus: 'idle' | 'submitting' | 'success' | 'error';

  setSession: (s: ReviewSession | null) => void;
  setArtworkFiles: (files: ArtworkFile[]) => void;
  setCurrentFileIndex: (i: number) => void;
  setCurrentPage: (p: number) => void;
  addFlag: (flag: ReviewFlag) => void;
  removeFlag: (id: string) => void;
  setFlags: (flags: ReviewFlag[]) => void;
  setAutocompleteOptions: (opts: AutocompleteOption[]) => void;
  setFlagFormState: (state: FlagFormState | null) => void;
  setSubmitStatus: (s: 'idle' | 'submitting' | 'success' | 'error') => void;
  reset: () => void;
}

const initialState = {
  session: null,
  artworkFiles: [],
  currentFileIndex: 0,
  currentPage: 1,
  flags: [],
  autocompleteOptions: [],
  flagFormState: null,
  submitStatus: 'idle' as const,
};

export const useReviewStore = create<ReviewState>((set) => ({
  ...initialState,
  setSession: (session) => set({ session }),
  setArtworkFiles: (artworkFiles) => set({ artworkFiles }),
  setCurrentFileIndex: (currentFileIndex) => set({ currentFileIndex, currentPage: 1 }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  addFlag: (flag) => set((s) => ({ flags: [...s.flags, flag] })),
  removeFlag: (id) => set((s) => ({ flags: s.flags.filter((f) => f.id !== id) })),
  setFlags: (flags) => set({ flags }),
  setAutocompleteOptions: (autocompleteOptions) => set({ autocompleteOptions }),
  setFlagFormState: (flagFormState) => set({ flagFormState }),
  setSubmitStatus: (submitStatus) => set({ submitStatus }),
  reset: () => set(initialState),
}));
