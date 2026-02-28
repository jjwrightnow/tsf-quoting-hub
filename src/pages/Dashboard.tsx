import { useAppStore } from '@/stores/appStore';
import { useWizardStore } from '@/stores/wizardStore';
import { useAuth } from '@/hooks/useAuth';
import { useQuotePolling } from '@/hooks/usePolling';
import AppSidebar from '@/components/layout/AppSidebar';
import MainPanel from '@/components/layout/MainPanel';
import InputBar from '@/components/layout/InputBar';

const Dashboard = () => {
  const { session, signOut } = useAuth();
  const wizardActive = useAppStore((s) => s.wizardActive);
  const activeQuoteId = useAppStore((s) => s.activeQuoteId);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);

  useQuotePolling(!!session);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <AppSidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onSignOut={signOut}
      />

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile header */}
        <header className="flex h-12 items-center border-b border-border bg-card px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-foreground"
            aria-label="Open menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="ml-3 text-sm font-semibold text-foreground">
            SignMaker
          </span>
        </header>

        {/* Chat / Content */}
        <MainPanel />

        {/* Input bar */}
        {(wizardActive || activeQuoteId) && <InputBar />}
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
