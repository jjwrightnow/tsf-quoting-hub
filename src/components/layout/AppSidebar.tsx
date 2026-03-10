import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useWizardStore } from '@/stores/wizardStore';
import { useDraftQuotes, DraftQuote } from '@/hooks/useDraftQuotes';
import { isQuoteUnread, markQuoteSeen } from '@/lib/unread';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import type { QuoteListItem } from '@/stores/appStore';
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

const statusColors: Record<string, string> = {
  'Intake Submitted': 'bg-primary text-primary-foreground',
  'In Review': 'bg-tsf-status-review text-primary-foreground',
  'Quoted': 'bg-tsf-status-success text-primary-foreground',
  'Sent': 'bg-tsf-status-success text-primary-foreground',
  'Revision Requested': 'bg-accent text-accent-foreground',
  'Approved': 'bg-tsf-status-success text-primary-foreground',
};

const AppSidebar = ({ open, onToggle, onSignOut }: AppSidebarProps) => {
  const quotesList = useAppStore((s) => s.quotesList);
  const activeQuoteId = useAppStore((s) => s.activeQuoteId);
  const setActiveQuoteId = useAppStore((s) => s.setActiveQuoteId);
  const setWizardActive = useAppStore((s) => s.setWizardActive);
  const resetWizard = useWizardStore((s) => s.resetWizard);
  const { session } = useAuth();
  const navigate = useNavigate();
  const isAdminUser = session?.user?.email === 'jj@thesignagefactory.co';
  const userEmail = session?.user?.email;

  const { drafts, deleteDraft, updateTitle } = useDraftQuotes(userEmail);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleNewQuote = () => {
    resetWizard();
    setWizardActive(true);
    onToggle();
  };

  const handleSelectQuote = (quote: QuoteListItem) => {
    markQuoteSeen(quote.quoteId);
    setActiveQuoteId(quote.quoteId);
    if (window.innerWidth < 768) onToggle();
  };

  const handleSelectDraft = (draft: DraftQuote) => {
    const wizard = useWizardStore.getState();
    wizard.resetWizard();
    const spec = (draft.spec_data || {}) as Record<string, unknown>;
    // Restore wizard state from spec_data
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

    // Store the draft id so the wizard can upsert back to it
    useAppStore.getState().setActiveDraftId(draft.id);
    useAppStore.getState().setWizardActive(true);
    if (window.innerWidth < 768) onToggle();
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteDraft(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const startEdit = (draft: DraftQuote) => {
    setEditingId(draft.id);
    setEditValue(draft.title);
  };

  const commitEdit = (id: string) => {
    if (editValue.trim()) {
      updateTitle(id, editValue.trim());
    }
    setEditingId(null);
  };

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

        {/* New Quote */}
        <div className="px-4 py-4">
          <button
            onClick={handleNewQuote}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-foreground gradient-pink-blue transition-all duration-300 hover:opacity-90 hover:shadow-lg"
          >
            + New Quote
          </button>
        </div>

        {/* Drafts + Quotes list */}
        <div className="flex-1 overflow-y-auto px-2">
          {/* Draft Quotes */}
          <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Drafts
          </p>
          {!userEmail ? (
            <p className="px-3 py-4 text-xs text-muted-foreground italic">
              Sign in to save quotes
            </p>
          ) : drafts.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              No drafts yet.
            </p>
          ) : (
            <ul className="space-y-1 mb-4">
              {drafts.map((d) => (
                <li key={d.id} className="group relative">
                  <button
                    onClick={() => handleSelectDraft(d)}
                    className="w-full rounded-md px-3 py-2.5 text-left transition-all duration-300 border-l-[3px] border-transparent hover:bg-secondary"
                  >
                    {editingId === d.id ? (
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => commitEdit(d.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitEdit(d.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-transparent border-b border-primary text-xs font-medium text-foreground outline-none"
                      />
                    ) : (
                      <p
                        className="text-xs font-medium text-foreground truncate cursor-text"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(d);
                        }}
                        title="Click to rename"
                      >
                        {d.title}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      {d.profile_type && (
                        <span className="rounded px-1.5 py-0.5 text-[9px] font-medium bg-muted text-muted-foreground">
                          {d.profile_type}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(d.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </button>
                  {/* Trash icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(d.id);
                    }}
                    className="absolute right-2 top-2.5 hidden group-hover:flex items-center justify-center h-6 w-6 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label="Delete draft"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Synced Quotes */}
          <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Your Quotes
          </p>
          {quotesList.length === 0 ? (
            <p className="px-3 py-4 text-xs text-muted-foreground">
              No quotes yet. Start your first one above.
            </p>
          ) : (
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
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${statusColors[q.status] || 'bg-muted text-muted-foreground'}`}>
                            {q.status}
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This draft will be permanently removed.
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
