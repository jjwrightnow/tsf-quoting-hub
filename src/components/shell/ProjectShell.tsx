import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useShellStore, type PortalProject, type PortalSign } from '@/stores/shellStore';

/* ─── Icons ─── */
const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const CheckCircle = ({ filled }: { filled: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'hsl(157,100%,50%)' : 'none'} stroke={filled ? 'hsl(157,100%,50%)' : 'hsl(240,17%,60%)'} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />{filled && <polyline points="9 12 11.5 14.5 16 9.5" stroke="hsl(240,20%,4%)" strokeWidth="2.5" />}
  </svg>
);

/* ─── Status badge helper ─── */
const statusBadgeClass: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  ready: 'bg-primary/20 text-primary',
  submitted: 'bg-[hsl(157,100%,50%)]/20 text-[hsl(157,100%,50%)]',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${statusBadgeClass[status] || statusBadgeClass.draft}`}>
      {status}
    </span>
  );
}

/* ─── Identity Gate (inline panel) ─── */
function IdentityGate() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const store = useShellStore();

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setSubmitting(true);
    setMessage(null);
    const normalized = email.toLowerCase().trim();

    try {
      // Check verified_customers
      const { data: customer } = await supabase
        .from('verified_customers')
        .select('id')
        .eq('email', normalized)
        .limit(1)
        .maybeSingle();

      if (customer) {
        localStorage.setItem('signmaker_user_email', normalized);
        store.setUserEmail(normalized);

        // Get effective role (handles temp_pro 48hr pass)
        const { data: effectiveRole } = await supabase
          .rpc('get_effective_user_role', { p_email: normalized });
        const role = effectiveRole || 'guest';
        store.setUserRole(role === 'temp_pro' ? 'pro' : role);

        // If on temp pass, show a toast so they know it's time-limited
        if (role === 'temp_pro') {
          const { data: vc } = await supabase
            .from('verified_customers')
            .select('temp_pro_expires_at')
            .eq('email', normalized)
            .single();
          if (vc?.temp_pro_expires_at) {
            const hours = Math.ceil(
              (new Date(vc.temp_pro_expires_at).getTime() - Date.now()) / 3600000
            );
            toast.info(`Pro access active for ${hours} more hours. Complete your application to keep it.`);
          }
        }

        await loadUserData(normalized, store);
        store.setShellState('verified');
      } else {
        // Check if access request already exists
        const { data: existing } = await supabase
          .from('access_requests')
          .select('id, status')
          .eq('email', normalized)
          .limit(1)
          .maybeSingle();

        if (existing) {
          setMessage('Your access request is pending — we\'ll email you when approved.');
        } else {
          await supabase.from('access_requests').insert({
            email: normalized,
            full_name: '',
            company_name: '',
            status: 'pending',
          } as any);
          setMessage('Thanks — we\'ll verify your account and email you within 24 hours.');
        }
      }
    } catch {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 animate-fade-in-up">
      <p className="text-sm font-medium text-foreground mb-3">Sign In or Create Account</p>
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          onClick={handleSubmit}
          disabled={submitting || !email.trim()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {submitting ? '...' : 'Continue'}
        </button>
      </div>
      {message && (
        <p className="mt-3 text-xs text-muted-foreground">{message}</p>
      )}
    </div>
  );
}

/* ─── Data loading helpers ─── */
async function loadUserData(
  email: string,
  store: ReturnType<typeof useShellStore.getState>,
) {
  store.setLoading(true);

  // Get or create contact via RPC
  const { data: contact, error } = await supabase
    .rpc('get_or_create_contact', { p_email: email })
    .single();

  if (error || !contact) {
    store.setLoading(false);
    return;
  }

  const { contact_id, account_id } = contact as { contact_id: string; account_id: string };
  store.setContactId(contact_id);
  store.setAccountId(account_id);

  // Get projects
  const { data: projects } = await supabase
    .from('portal_projects')
    .select('*')
    .eq('contact_id', contact_id)
    .neq('status', 'submitted')
    .order('created_at', { ascending: false });

  if (projects) {
    const projectList: PortalProject[] = [];
    for (const p of projects as any[]) {
      const { count } = await supabase
        .from('portal_signs')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', p.id);
      projectList.push({ ...p, sign_count: count || 0 });
    }
    store.setProjects(projectList);
  }

  store.setLoading(false);
}

async function loadProjectSigns(projectId: string, store: ReturnType<typeof useShellStore.getState>) {
  const { data } = await supabase
    .from('portal_signs')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true });

  if (data) {
    store.setActiveSigns(data as unknown as PortalSign[]);
  }
}

/* ─── Explore Banner ─── */
function ExploreBanner({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card/60 px-4 py-2.5">
      <span className="text-xs text-muted-foreground">
        Exploring as guest — save your build to a project
      </span>
      <button
        onClick={onOpen}
        className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Sign In or Create Account
      </button>
    </div>
  );
}

/* ─── Project Dashboard ─── */
function ProjectDashboard() {
  const store = useShellStore();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = async () => {
    if (!newName.trim() || !store.contactId) return;
    const { data, error } = await supabase
      .from('portal_projects')
      .insert({
        project_name: newName.trim(),
        status: 'draft',
        contact_id: store.contactId,
        account_id: store.accountId,
      } as any)
      .select()
      .single();

    if (!error && data) {
      const project = { ...(data as any), sign_count: 0 } as PortalProject;
      store.setProjects([project, ...store.projects]);
      store.setActiveProject(project);
      store.setActiveSigns([]);
      store.setShellState('in_project');
      setNewName('');
      setCreating(false);
    }
  };

  const openProject = async (project: PortalProject) => {
    store.setActiveProject(project);
    await loadProjectSigns(project.id, store);
    store.setShellState('in_project');
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 animate-fade-in-up">
      {/* User bar */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted-foreground truncate">{store.userEmail}</span>
        <button
          onClick={() => store.signOut()}
          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-foreground">Your Projects</span>
        <button
          onClick={() => setCreating(true)}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          New Project
        </button>
      </div>

      {/* Inline create */}
      {creating && (
        <div className="flex gap-2 mb-3">
          <input
            autoFocus
            placeholder="Project name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button onClick={handleCreate} disabled={!newName.trim()} className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
            Create
          </button>
          <button onClick={() => { setCreating(false); setNewName(''); }} className="text-xs text-muted-foreground hover:text-foreground">
            Cancel
          </button>
        </div>
      )}

      {/* Project list */}
      {store.loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <div key={i} className="h-12 rounded-md shimmer-skeleton" />)}
        </div>
      ) : store.projects.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">No projects yet. Create one to get started.</p>
      ) : (
        <ul className="space-y-1.5">
          {store.projects.map((p) => (
            <li key={p.id} className="flex items-center justify-between rounded-md border border-border bg-secondary/30 px-3 py-2.5 hover:bg-secondary/60 transition-colors">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{p.project_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <StatusBadge status={p.status} />
                  <span className="text-[10px] text-muted-foreground">{p.sign_count ?? 0} sign{(p.sign_count ?? 0) !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <button
                onClick={() => openProject(p)}
                className="rounded-md border border-border px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Open
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─── Project Context Bar ─── */
function ProjectContextBar() {
  const store = useShellStore();
  const project = store.activeProject;
  if (!project) return null;

  const hasComplete = store.activeSigns.some((s) => s.is_complete);

  const goBack = () => {
    store.setActiveProject(null);
    store.setActiveSigns([]);
    store.setEditingSignId(null);
    store.setShellState('verified');
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <button onClick={goBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft />
        </button>
        <span className="text-sm font-semibold text-foreground truncate">{project.project_name}</span>
        <StatusBadge status={project.status} />
      </div>
      <button
        disabled={!hasComplete}
        className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-colors"
      >
        Submit Project for Quote
      </button>
    </div>
  );
}

/* ─── Sign List (below configurator) ─── */
function SignList() {
  const store = useShellStore();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const addSign = async () => {
    if (!store.activeProject) return;
    const sortOrder = store.activeSigns.length;
    const { data, error } = await supabase
      .from('portal_signs')
      .insert({
        project_id: store.activeProject.id,
        sign_name: `Sign ${String.fromCharCode(65 + sortOrder)}`,
        sort_order: sortOrder,
      } as any)
      .select()
      .single();

    if (!error && data) {
      store.setActiveSigns([...store.activeSigns, data as unknown as PortalSign]);
    }
  };

  const duplicateSign = async (sign: PortalSign) => {
    if (!store.activeProject) return;
    const sortOrder = store.activeSigns.length;
    const { data, error } = await supabase
      .from('portal_signs')
      .insert({
        project_id: store.activeProject.id,
        sign_name: `${sign.sign_name} (copy)`,
        profile_code: sign.profile_code,
        profile_type: sign.profile_type,
        spec_data: sign.spec_data,
        height: sign.height,
        metal_type: sign.metal_type,
        finish: sign.finish,
        mounting: sign.mounting,
        back_type: sign.back_type,
        notes: sign.notes,
        sort_order: sortOrder,
      } as any)
      .select()
      .single();

    if (!error && data) {
      store.setActiveSigns([...store.activeSigns, data as unknown as PortalSign]);
    }
  };

  const deleteSign = async (signId: string) => {
    await supabase.from('portal_signs').delete().eq('id', signId);
    store.setActiveSigns(store.activeSigns.filter((s) => s.id !== signId));
    if (store.editingSignId === signId) store.setEditingSignId(null);
    setDeleteConfirm(null);
  };

  const editSign = (sign: PortalSign) => {
    store.setEditingSignId(sign.id);
    store.setEditingSign(sign);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Signs</span>
        <button
          onClick={addSign}
          className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
        >
          + Add Sign
        </button>
      </div>

      {store.activeSigns.length === 0 ? (
        <p className="text-xs text-muted-foreground py-3 text-center">No signs yet. Add one to start configuring.</p>
      ) : (
        <ul className="space-y-1.5">
          {store.activeSigns.map((sign) => (
            <li
              key={sign.id}
              className={`flex items-center gap-3 rounded-md border px-3 py-2 transition-colors ${
                store.editingSignId === sign.id
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border bg-secondary/20 hover:bg-secondary/40'
              }`}
            >
              <CheckCircle filled={!!sign.is_complete} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{sign.sign_name}</p>
                {sign.profile_code && (
                  <span className="text-[10px] font-mono text-primary">{sign.profile_code}</span>
                )}
                {(sign.height_inches || sign.height) && (
                  <span className="text-[10px] text-muted-foreground ml-1">
                    {sign.height_inches ? `${sign.height_inches}"` : sign.height}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => editSign(sign)} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Edit">
                  <EditIcon />
                </button>
                <button onClick={() => duplicateSign(sign)} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Duplicate">
                  <CopyIcon />
                </button>
                {deleteConfirm === sign.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => deleteSign(sign.id)} className="text-[10px] text-destructive font-medium">Yes</button>
                    <button onClick={() => setDeleteConfirm(null)} className="text-[10px] text-muted-foreground">No</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(sign.id)} className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
                    <TrashIcon />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─── Main Shell ─── */
interface ProjectShellProps {
  children: React.ReactNode;
}

export default function ProjectShell({ children }: ProjectShellProps) {
  const store = useShellStore();
  const [gateOpen, setGateOpen] = useState(false);

  // Restore session on mount
  useEffect(() => {
    const saved = localStorage.getItem('signmaker_user_email');
    if (saved) {
      (async () => {
        const { data } = await supabase
          .from('verified_customers')
          .select('id')
          .eq('email', saved)
          .limit(1)
          .maybeSingle();

        if (data) {
          store.setUserEmail(saved);
          await loadUserData(saved, store);
          store.setShellState('verified');
        } else {
          localStorage.removeItem('signmaker_user_email');
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-3 p-3 h-full overflow-y-auto">
      {/* Top bar — state-dependent */}
      {store.shellState === 'explore' && !gateOpen && (
        <ExploreBanner onOpen={() => setGateOpen(true)} />
      )}
      {store.shellState === 'explore' && gateOpen && (
        <IdentityGate />
      )}
      {store.shellState === 'verified' && (
        <ProjectDashboard />
      )}
      {store.shellState === 'in_project' && (
        <ProjectContextBar />
      )}

      {/* Configurator / main content */}
      <div className="flex-1 min-h-0">
        {children}
      </div>

      {/* Sign list — only in IN_PROJECT state */}
      {store.shellState === 'in_project' && (
        <SignList />
      )}
    </div>
  );
}
