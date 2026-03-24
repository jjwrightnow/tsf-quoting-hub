import { create } from 'zustand';
import type { AutocompleteOption } from '@/stores/reviewStore';

export type ChatPhase =
  | 'welcome'
  | 'access_request'
  | 'verify_email'
  | 'access_submitted'
  | 'chat'
  | 'post_upload'
  | 'batch_assign'
  | 'one_done_pick'
  | 'one_done_specs'
  | 'identify_signs'
  | 'pick_profile'
  | 'spec_signs'
  | 'done';

/** Tracks the pending sign name before profile is picked */
export interface PendingSign {
  name: string;
}

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

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
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
  pendingSignName: string | null;
  uploadPath: 'dump_run' | 'tag_go' | 'one_done' | 'letterman_assist' | null;
  cannedHistory: { q: string; a: string }[];
  aiMessages: AiChatMessage[];

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
  setPendingSignName: (name: string | null) => void;
  setUploadPath: (path: SignState['uploadPath']) => void;
  addCannedEntry: (entry: { q: string; a: string }) => void;
  addAiMessage: (msg: AiChatMessage) => void;
  updateLastAiMessage: (content: string) => void;
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
  pendingSignName: null as string | null,
  uploadPath: null as SignState['uploadPath'],
  cannedHistory: [] as { q: string; a: string }[],
  aiMessages: [] as AiChatMessage[],
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
  setPendingSignName: (pendingSignName) => set({ pendingSignName }),
  setUploadPath: (uploadPath) => set({ uploadPath }),
  addCannedEntry: (entry) =>
    set((s) => ({ cannedHistory: [...s.cannedHistory, entry] })),
  addAiMessage: (msg) =>
    set((s) => ({ aiMessages: [...s.aiMessages, msg] })),
  updateLastAiMessage: (content) =>
    set((s) => {
      const msgs = [...s.aiMessages];
      if (msgs.length > 0 && msgs[msgs.length - 1].role === 'assistant') {
        msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content };
      }
      return { aiMessages: msgs };
    }),
  reset: () => set(initialState),
}));
