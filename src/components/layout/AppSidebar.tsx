import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useWizardStore } from '@/stores/wizardStore';
import { useProjects, type Project, type Sign } from '@/hooks/useProjects';
import { isQuoteUnread, markQuoteSeen } from '@/lib/unread';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import type { QuoteListItem } from '@/stores/appStore';
import NewProjectModal from './NewProjectModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AppSidebarProps {
  open: boolean;
  onToggle: () => void;
  onSignOut: () => void;
}

const statusBadge: Record<string, { bg: string; label: string; lock?: boolean }> = {
  draft: { bg: 'bg-muted text-muted-foreground', label: 'Draft' },
  quoted: { bg: 'bg-tsf-status-review text-primary-foreground', label: 'Quoted' },
  ordered: { bg: 'bg-tsf-status-success text-primary-foreground', label: 'Ordered', lock: true },
  archived: { bg: 'bg-muted/50 text-muted-foreground/60', label: 'Archived' },
};

const quoteStatusColors: Record<string, string> = {
  'Intake Submitted': 'bg-primary text-primary-foreground',
  'In Review': 'bg-tsf-status-review text-primary-foreground',
  'Quoted': 'bg-tsf-status-success text-primary-foreground',
  'Sent': 'bg-tsf-status-success text-primary-foreground',
  'Revision Requested': 'bg-accent text-accent-foreground',
  'Approved': 'bg-tsf-status-success text-primary-foreground',
};

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline ml-1">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const AppSidebar = ({ open, onToggle, onSignOut }: AppSidebarProps) => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const userEmail = session?.user?.email;
  const isAdminUser = userEmail === 'jj@thesignagefactory.co';

  const quotesList = useAppStore((s) => s.quotesList);
  const activeQuoteId = useAppStore((s) => s.activeQuoteId);
  const activeProjectId = useAppStore((s) => s.activeProjectId);
  const activeSignId = useAppStore((s) => s.activeSignId);
  const setActiveQuoteId = useAppStore((s) => s.setActiveQuoteId);
  const setActiveSignId = useAppStore((s) => s.setActiveSignId);
  const setWizardActive = useAppStore((s) => s.setWizardActive);

  const {
    projects,
    signs,
    fetchSigns,
    createProject,
    deleteProject,
    createSign,
    deleteSign,
  } = useProjects(userEmail);

  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [showArchived, setShowArchived] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'project' | 'sign'; id: string; projectId?: string } | null>(null);

  // Toggle project expansion and lazy-load signs
  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
        if (!signs[projectId]) fetchSigns(projectId);
      }
      return next;
    });
  };

  const handleCreateProject = async (name: string) => {
    const project = await createProject(name);
    if (project) {
      setExpandedProjects((prev) => new Set(prev).add(project.id));
    }
  };

  const handleAddSign = async (projectId: string) => {
    const sign = await createSign(projectId);
    if (sign) {
      handleSelectSign(projectId, sign);
    }
  };

  const handleSelectSign = (projectId: string, sign: Sign) => {
    const project = projects.find((p) => p.id === projectId);
    if (project?.status === 'ordered') return; // read-only

    // Load spec_data into wizard
    const wizard = useWizardStore.getState();
    wizard.resetWizard();
    const spec = (sign.spec_data || {}) as Record<string, unknown>;
    if (spec.profileId) wizard.setProfile(spec.profileId as string, spec.profileName as string | null);
    if (spec.illuminationId) wizard.setIllumination(spec.illuminationId as string, spec.illuminationName as string | null);
    if (spec.materialId) wizard.setMaterial(spec.materialId as string, spec.materialName as string | null);
    if (spec.finishId) wizard.setFinish(spec.finishId as string, spec.finishName as string | null);
    if (spec.letterHeight || spec.signWidth) {
      wizard.setDimensions(
        (spec.letterHeight as number) || null,
        (spec.signWidth as number) || null,
        (spec.quantity as number) || 1,
      );
    }
    if (spec.projectName) wizard.setProjectDetails(spec.projectName as string, (spec.location as string) || '', (spec.accountType as any) || null);
    if (spec.artworkPath) wizard.setArtwork(spec.artworkPath as string);
    if (typeof spec.currentStep === 'number') wizard.setCurrentStep(spec.currentStep as number);
    if (Array.isArray(spec.completedSteps)) {
      (spec.completedSteps as number[]).forEach((s) => wizard.completeStep(s));
    }

    setActiveSignId(projectId, sign.id);
    if (window.innerWidth < 768) onToggle();
  };

  const handleSelectQuote = (quote: QuoteListItem) => {
    markQuoteSeen(quote.quoteId);
    setActiveQuoteId(quote.quoteId);
    if (window.innerWidth < 768) onToggle();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'project') {
      await deleteProject(deleteTarget.id);
    } else if (deleteTarget.projectId) {
      await deleteSign(deleteTarget.id, deleteTarget.projectId);
    }
    setDeleteTarget(null);
  };

  const visibleProjects = showArchived
    ? projects
    : projects.filter((p) => p.status !== 'archived');

  return (
    <>
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col
          bg-sidebar border-r border-sidebar-border
          transition-transform duration-300 ease-out
          md:relative md:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-sidebar-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-md gradient-pink-blue">
            <div className="h-3.5 w-3.5 rounded-sm bg-primary-foreground/90" />
          </div>
          <button
            onClick={onToggle}
            className="text-muted-foreground hover:text-foreground md:hidden"
            aria-label="Close sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* New Project */}
        <div className="px-4 py-4">
          <button
            onClick={() => setNewProjectOpen(true)}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-foreground gradient-pink-blue transition-all duration-300 hover:opacity-90 hover:shadow-lg"
          >
            + New Project
          </button>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-y-auto px-2">
          {/* Projects Section */}
          <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Projects
          </p>

          {!userEmail ? (
            <p className="px-3 py-4 text-xs text-muted-foreground italic">
              Sign in to manage projects
            </p>
          ) : visibleProjects.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              No projects yet.
            </p>
          ) : (
            <ul className="space-y-0.5 mb-4">
              {visibleProjects.map((project) => {
                const isExpanded = expandedProjects.has(project.id);
                const isOrdered = project.status === 'ordered';
                const isArchived = project.status === 'archived';
                const badge = statusBadge[project.status] || statusBadge.draft;
                const projectSigns = signs[project.id] || [];

                return (
                  <li key={project.id} className={isArchived ? 'opacity-50' : ''}>
                    {/* Project row */}
                    <div className="group relative">
                      <button
                        onClick={() => toggleProject(project.id)}
                        className={`w-full flex items-center gap-2 rounded-md px-3 py-2 text-left transition-all duration-200 hover:bg-secondary ${
                          activeProjectId === project.id ? 'bg-secondary border-l-[3px] border-accent' : 'border-l-[3px] border-transparent'
                        }`}
                      >
                        <ChevronIcon expanded={isExpanded} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {project.name}
                          </p>
                          <span className={`inline-block mt-0.5 rounded px-1.5 py-0.5 text-[9px] font-medium ${badge.bg}`}>
                            {badge.label}
                            {badge.lock && <LockIcon />}
                          </span>
                        </div>
                      </button>
                      {!isOrdered && !isArchived && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget({ type: 'project', id: project.id });
                          }}
                          className="absolute right-2 top-2 hidden group-hover:flex items-center justify-center h-6 w-6 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          aria-label="Delete project"
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>

                    {/* Signs (Level 2) */}
                    {isExpanded && (
                      <ul className="ml-5 mt-0.5 space-y-0.5 border-l border-border pl-2">
                        {projectSigns.map((sign) => (
                          <li key={sign.id} className="group/sign relative">
                            <button
                              onClick={() => handleSelectSign(project.id, sign)}
                              className={`w-full rounded-md px-3 py-1.5 text-left transition-all duration-200 hover:bg-secondary ${
                                activeSignId === sign.id ? 'bg-secondary text-accent' : ''
                              } ${isOrdered ? 'cursor-default' : ''}`}
                            >
                              <p className="text-[11px] font-medium text-foreground truncate">
                                {isOrdered && <LockIcon />} {sign.title}
                              </p>
                              {sign.profile_type && (
                                <span className="mt-0.5 inline-block rounded px-1.5 py-0.5 text-[9px] font-medium bg-muted text-muted-foreground">
                                  {sign.profile_type}
                                </span>
                              )}
                            </button>
                            {!isOrdered && !isArchived && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget({ type: 'sign', id: sign.id, projectId: project.id });
                                }}
                                className="absolute right-1 top-1 hidden group-hover/sign:flex items-center justify-center h-5 w-5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                aria-label="Delete sign"
                              >
                                <TrashIcon />
                              </button>
                            )}
                          </li>
                        ))}
                        {!isOrdered && !isArchived && (
                          <li>
                            <button
                              onClick={() => handleAddSign(project.id)}
                              className="w-full rounded-md px-3 py-1.5 text-left text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            >
                              + Add Sign
                            </button>
                          </li>
                        )}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Archive toggle */}
          {userEmail && projects.some((p) => p.status === 'archived') && (
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="px-3 py-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {showArchived ? 'Hide Archived' : 'Show Archived'}
            </button>
          )}

          {/* Synced Quotes (legacy) */}
          {quotesList.length > 0 && (
            <>
              <p className="px-3 py-2 mt-4 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Synced Quotes
              </p>
              <ul className="space-y-1">
                {quotesList.map((q) => {
                  const isActive = activeQuoteId === q.quoteId;
                  const unread = !q.isPending && isQuoteUnread(q.quoteId, q.updatedAt);
                  return (
                    <li key={q.quoteId}>
                      <button
                        onClick={() => handleSelectQuote(q)}
                        className={`
                          relative w-full rounded-md px-3 py-2.5 text-left transition-all duration-300
                          ${isActive
                            ? 'border-l-[3px] border-accent bg-secondary glow-pink'
                            : 'border-l-[3px] border-transparent hover:bg-secondary'
                          }
                        `}
                      >
                        {unread && (
                          <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-accent unread-dot" />
                        )}
                        <p className="text-xs font-medium text-foreground truncate">
                          {q.projectName || q.quoteDisplayId || 'Untitled Project'}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">
                            {q.quoteDisplayId || (q.isPending ? 'pending...' : '')}
                          </span>
                          {q.status && (
                            <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${quoteStatusColors[q.status] || 'bg-muted text-muted-foreground'}`}>
                              {q.status}
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4 flex items-center gap-3">
          {isAdminUser && (
            <button
              onClick={() => navigate('/admin')}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin
            </button>
          )}
          <button
            onClick={onSignOut}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* New Project Modal */}
      <NewProjectModal
        open={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
        onCreate={handleCreateProject}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteTarget?.type === 'project' ? 'project' : 'sign'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === 'project'
                ? 'This project and all its signs will be permanently removed.'
                : 'This sign will be permanently removed.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AppSidebar;
