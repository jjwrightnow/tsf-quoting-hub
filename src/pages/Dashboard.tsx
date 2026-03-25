import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAppStore } from "@/stores/appStore";
import { useShellStore } from "@/stores/shellStore";
import { useAuth } from "@/hooks/useAuth";
import { useOperatorConfig } from "@/hooks/useOperatorConfig";
import { useQuotePolling } from "@/hooks/usePolling";
import { useWizardAutoSave } from "@/hooks/useWizardAutoSave";
import AppSidebar from "@/components/layout/AppSidebar";
import ProjectShell from "@/components/shell/ProjectShell";
import WinningLineConfigurator from "@/components/configurator/WinningLineConfigurator";

/** Bridge reads shell state and passes props to configurator */
function ConfiguratorBridge() {
  const shellState = useShellStore((s) => s.shellState);
  const activeProject = useShellStore((s) => s.activeProject);
  const editingSign = useShellStore((s) => s.editingSign);

  const projectProp =
    shellState === "in_project" && activeProject
      ? { id: activeProject.id, project_name: activeProject.project_name }
      : null;

  const handleSignSaved = () => {
    const store = useShellStore.getState();
    if (store.activeProject) {
      supabase
        .from("portal_signs")
        .select("*")
        .eq("project_id", store.activeProject.id)
        .order("sort_order", { ascending: true })
        .then(({ data }) => {
          if (data) store.setActiveSigns(data as any);
        });
    }
  };

  return (
    <WinningLineConfigurator
      activeProject={projectProp}
      editingSign={shellState === "in_project" ? editingSign : null}
      onSignSaved={handleSignSaved}
    />
  );
}

const Dashboard = () => {
  const { session, signOut } = useAuth();
  const userTier = useAppStore((s) => s.userTier);
  const setUserTier = useAppStore((s) => s.setUserTier);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const operatorConfig = useOperatorConfig();

  // Sync auth session to tier
  useEffect(() => {
    if (session) {
      if (userTier < 2) setUserTier(2);
    } else {
      if (userTier === 2) setUserTier(0);
    }
  }, [session, userTier, setUserTier]);

  // Pre-warm chat session so chat_session_id exists before first profile click
  useEffect(() => {
    const initSession = async () => {
      const email = useShellStore.getState().userEmail;
      const { data, error } = await supabase.rpc("init_chat_session", {
        p_email: email || null,
      });
      if (data && !error) {
        localStorage.setItem("chat_session_id", data);
      }
    };
    initSession();
  }, []);

  useQuotePolling(userTier === 2 && !!session);
  useWizardAutoSave();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar — authenticated tier 2 users only */}
      {userTier === 2 && (
        <AppSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onSignOut={signOut} />
      )}

      <div className="relative flex flex-1 flex-col min-w-0">
        {/* Header — brand only, no sign-in button (ProjectShell handles identity) */}
        <header className="flex h-12 items-center border-b border-border bg-primary px-4">
          <div className="flex items-center gap-3">
            {userTier === 2 && (
              <button onClick={() => setSidebarOpen(true)} className="text-primary-foreground md:hidden" aria-label="Open menu">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
            {operatorConfig?.logo_url ? (
              <img
                src={operatorConfig.logo_url}
                alt={operatorConfig.brand_name || ""}
                className="h-7 w-7 rounded-md object-contain"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-pink-blue">
                <div className="h-3 w-3 rounded-sm bg-primary-foreground/90" />
              </div>
            )}
            {operatorConfig?.brand_name && (
              <span className="text-sm font-semibold text-primary-foreground hidden sm:inline">
                {operatorConfig.brand_name}
              </span>
            )}
          </div>
          {/* Sign-in is handled by ProjectShell ExploreBanner — no button here */}
        </header>

        {/* Main content — ProjectShell wraps configurator full width */}
        <div className="flex-1 overflow-hidden">
          <ProjectShell>
            <ConfiguratorBridge />
          </ProjectShell>
        </div>
      </div>

      

      {/* Mobile sidebar overlay */}
      {userTier === 2 && sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-background/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default Dashboard;
