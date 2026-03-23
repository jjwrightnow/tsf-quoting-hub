import { useEffect } from 'react';
import ProjectShell from '@/components/shell/ProjectShell';
import WinningLineConfigurator from '@/components/configurator/WinningLineConfigurator';
import { useAppStore } from '@/stores/appStore';
import { useWizardStore } from '@/stores/wizardStore';
import { useSignStore } from '@/stores/signStore';
import { useShellStore } from '@/stores/shellStore';
import { useAuth } from '@/hooks/useAuth';
import { useOperatorConfig } from '@/hooks/useOperatorConfig';
import { useQuotePolling } from '@/hooks/usePolling';
import { useWizardAutoSave } from '@/hooks/useWizardAutoSave';
import AppSidebar from '@/components/layout/AppSidebar';
import MainPanel from '@/components/layout/MainPanel';
import InputBar from '@/components/layout/InputBar';
import { useNavigate } from 'react-router-dom';

/** Bridge component reads shell state and passes props to configurator */
function ConfiguratorBridge() {
  const shellState = useShellStore((s) => s.shellState);
  const activeProject = useShellStore((s) => s.activeProject);

  const projectProp = shellState === 'in_project' && activeProject
    ? { id: activeProject.id, project_name: activeProject.project_name }
    : null;

  const handleSignSaved = () => {
    // Reload signs in shell
    const store = useShellStore.getState();
    if (store.activeProject) {
      supabase
        .from('portal_signs')
        .select('*')
        .eq('project_id', store.activeProject.id)
        .order('sort_order', { ascending: true })
        .then(({ data }) => {
          if (data) store.setActiveSigns(data as any);
        });
    }
  };

  return (
    <WinningLineConfigurator
      activeProject={projectProp}
      onSignSaved={handleSignSaved}
    />
  );
}

const Dashboard = () => {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const userTier = useAppStore((s) => s.userTier);
  const setUserTier = useAppStore((s) => s.setUserTier);
  const wizardActive = useAppStore((s) => s.wizardActive);
  const activeQuoteId = useAppStore((s) => s.activeQuoteId);
  const activeSignId = useAppStore((s) => s.activeSignId);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const chatPhase = useSignStore((s) => s.chatPhase);
  const operatorConfig = useOperatorConfig();

  // Set tier based on auth session
  useEffect(() => {
    if (session) {
      if (userTier < 2) setUserTier(2);
    } else {
      if (userTier === 2) setUserTier(0);
    }
  }, [session, userTier, setUserTier]);

  // Only poll quotes for tier 2
  useQuotePolling(userTier === 2 && !!session);
  useWizardAutoSave();

  // Determine if InputBar should show free-form or canned
  const showFullInputBar = userTier === 2 && (wizardActive || activeQuoteId || activeSignId || chatPhase !== 'welcome');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar — tier 2 only */}
      {userTier === 2 && (
        <AppSidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onSignOut={signOut}
        />
      )}

      {/* Main area */}
      <div className="relative flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="flex h-12 items-center justify-between border-b border-border bg-card px-4">
          <div className="flex items-center gap-3">
            {userTier === 2 && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-foreground md:hidden"
                aria-label="Open menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
            {operatorConfig?.logo_url ? (
              <img src={operatorConfig.logo_url} alt={operatorConfig.brand_name || ''} className="h-7 w-7 rounded-md object-contain" />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-pink-blue">
                <div className="h-3 w-3 rounded-sm bg-primary-foreground/90" />
              </div>
            )}
            {operatorConfig?.brand_name && (
              <span className="text-sm font-semibold text-foreground hidden sm:inline">
                {operatorConfig.brand_name}
              </span>
            )}
          </div>

          {/* Sign In link for tier 0/1 */}
          {userTier < 2 && (
            <button
              onClick={() => navigate('/login')}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </button>
          )}
        </header>

        {/* Right panel: ProjectShell wrapping configurator */}
        <div className="flex-1 overflow-hidden">
          <ProjectShell>
            <ConfiguratorBridge />
          </ProjectShell>
        </div>

        {/* Input bar — always visible */}
        <div className="shrink-0">
          <InputBar />
        </div>
      </div>

      {/* Mobile overlay */}
      {userTier === 2 && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
