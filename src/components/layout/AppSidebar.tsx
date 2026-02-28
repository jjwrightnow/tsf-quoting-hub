import { useAppStore, QuoteListItem } from '@/stores/appStore';
import { useWizardStore } from '@/stores/wizardStore';
import { isQuoteUnread, markQuoteSeen } from '@/lib/unread';

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
  const wizardActive = useAppStore((s) => s.wizardActive);
  const resetWizard = useWizardStore((s) => s.resetWizard);

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

  return (
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

      {/* Quotes list */}
      <div className="flex-1 overflow-y-auto px-2">
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

      {/* Sign out */}
      <div className="border-t border-sidebar-border p-4">
        <button
          onClick={onSignOut}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
