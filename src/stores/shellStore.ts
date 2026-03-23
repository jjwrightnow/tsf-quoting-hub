import { create } from 'zustand';

export type ShellState = 'explore' | 'verified' | 'in_project';

export interface PortalProject {
  id: string;
  project_name: string;
  status: string;
  quote_ref: string | null;
  contact_id: string | null;
  account_id: string | null;
  created_at: string;
  updated_at: string;
  sign_count?: number;
}

export interface PortalSign {
  id: string;
  project_id: string;
  sign_name: string;
  profile_code: string | null;
  profile_type: string | null;
  spec_data: Record<string, unknown> | null;
  height: string | null;
  metal_type: string | null;
  finish: string | null;
  mounting: string | null;
  back_type: string | null;
  notes: string | null;
  sort_order: number | null;
  is_complete: boolean | null;
}

interface ShellStore {
  shellState: ShellState;
  userEmail: string | null;
  contactId: string | null;
  accountId: string | null;
  projects: PortalProject[];
  activeProject: PortalProject | null;
  activeSigns: PortalSign[];
  editingSignId: string | null;
  loading: boolean;
  identityError: string | null;

  setShellState: (state: ShellState) => void;
  setUserEmail: (email: string | null) => void;
  setContactId: (id: string | null) => void;
  setAccountId: (id: string | null) => void;
  setProjects: (projects: PortalProject[]) => void;
  setActiveProject: (project: PortalProject | null) => void;
  setActiveSigns: (signs: PortalSign[]) => void;
  setEditingSignId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setIdentityError: (error: string | null) => void;
  signOut: () => void;
}

export const useShellStore = create<ShellStore>((set) => ({
  shellState: 'explore',
  userEmail: null,
  contactId: null,
  accountId: null,
  projects: [],
  activeProject: null,
  activeSigns: [],
  editingSignId: null,
  loading: false,
  identityError: null,

  setShellState: (shellState) => set({ shellState }),
  setUserEmail: (userEmail) => set({ userEmail }),
  setContactId: (contactId) => set({ contactId }),
  setAccountId: (accountId) => set({ accountId }),
  setProjects: (projects) => set({ projects }),
  setActiveProject: (activeProject) => set({ activeProject }),
  setActiveSigns: (activeSigns) => set({ activeSigns }),
  setEditingSignId: (editingSignId) => set({ editingSignId }),
  setLoading: (loading) => set({ loading }),
  setIdentityError: (identityError) => set({ identityError }),
  signOut: () => {
    localStorage.removeItem('signmaker_user_email');
    set({
      shellState: 'explore',
      userEmail: null,
      contactId: null,
      accountId: null,
      projects: [],
      activeProject: null,
      activeSigns: [],
      editingSignId: null,
      identityError: null,
    });
  },
}));
