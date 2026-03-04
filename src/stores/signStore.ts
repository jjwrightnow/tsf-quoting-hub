import { create } from 'zustand';
import type { AutocompleteOption } from '@/stores/reviewStore';

export type ChatPhase =
  | 'welcome'
  | 'chat'
  | 'post_upload'
  | 'identify_signs'
  | 'spec_signs'
  | 'done';

export interface SignRecord {
  id: string;
  session_id: string;
  sign_name: string;
  page_ref: string | null;
  sort_order: number;
  profile_type: string | null;
  metal_type: string | null;
  finish: string | null;
  depth: string | null;
  led_color: string | null;
  mounting: string | null;
  back_type: string | null;
  acrylic_face: string | null;
  lead_wires: string | null;
  ul_label: string | null;
  wire_exit: string | null;
  specs_source: string | null;
  status: string | null;
  price: number | null;
  customer_notes: string | null;
  flag_count: number | null;
}

export interface UploadedFile {
  name: string;
  path: string;
}

interface SignState {
  chatPhase: ChatPhase;
  sessionId: string | null;
  uploadedFiles: UploadedFile[];
  signs: SignRecord[];
  currentSignIndex: number;
  userRole: 'customer' | 'assistant';
  autocompleteOptions: AutocompleteOption[];
  postUploadChoice: string | null;

  setChatPhase: (phase: ChatPhase) => void;
  setSessionId: (id: string | null) => void;
  addUploadedFile: (file: UploadedFile) => void;
  setUploadedFiles: (files: UploadedFile[]) => void;
  addSign: (sign: SignRecord) => void;
  updateSign: (id: string, fields: Partial<SignRecord>) => void;
  setSigns: (signs: SignRecord[]) => void;
  setCurrentSignIndex: (i: number) => void;
  setUserRole: (role: 'customer' | 'assistant') => void;
  setAutocompleteOptions: (opts: AutocompleteOption[]) => void;
  setPostUploadChoice: (choice: string | null) => void;
  reset: () => void;
}

const initialState = {
  chatPhase: 'welcome' as ChatPhase,
  sessionId: null as string | null,
  uploadedFiles: [] as UploadedFile[],
  signs: [] as SignRecord[],
  currentSignIndex: 0,
  userRole: 'customer' as const,
  autocompleteOptions: [] as AutocompleteOption[],
  postUploadChoice: null as string | null,
};

export const useSignStore = create<SignState>((set) => ({
  ...initialState,
  setChatPhase: (chatPhase) => set({ chatPhase }),
  setSessionId: (sessionId) => set({ sessionId }),
  addUploadedFile: (file) =>
    set((s) => ({ uploadedFiles: [...s.uploadedFiles, file] })),
  setUploadedFiles: (uploadedFiles) => set({ uploadedFiles }),
  addSign: (sign) => set((s) => ({ signs: [...s.signs, sign] })),
  updateSign: (id, fields) =>
    set((s) => ({
      signs: s.signs.map((sign) =>
        sign.id === id ? { ...sign, ...fields } : sign
      ),
    })),
  setSigns: (signs) => set({ signs }),
  setCurrentSignIndex: (currentSignIndex) => set({ currentSignIndex }),
  setUserRole: (userRole) => set({ userRole }),
  setAutocompleteOptions: (autocompleteOptions) => set({ autocompleteOptions }),
  setPostUploadChoice: (postUploadChoice) => set({ postUploadChoice }),
  reset: () => set(initialState),
}));
