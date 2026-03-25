import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAppStore } from "@/stores/appStore";
import { useShellStore } from "@/stores/shellStore";
import { useAuth } from "@/hooks/useAuth";
import { useOperatorConfig } from "@/hooks/useOperatorConfig";
import { useQuotePolling } from "@/hooks/usePolling";
import { useWizardAutoSave } from "@/hooks/useWizardAutoSave";
import AppSidebar from "@/components/layout/AppSidebar";
import InputBar from "@/components/layout/InputBar";
import ProjectShell from "@/components/shell/ProjectShell";
import WinningLineConfigurator from "@/components/configurator/WinningLineConfigurator";
import ChatThread from "@/components/chat/ChatThread";
import ChatErrorBoundary from "@/components/chat/ChatErrorBoundary";

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

/** Floating chat overlay */
function FloatingChat() {
  const [chatOpen, setChatOpen] = useState(() => localStorage.getItem("signmaker_chat_open") === "true");
  const [pulse, setPulse] = useState(false);
  const lastProfileSelected = useShellStore((s) => s.lastProfileSelected);
  const addSignFormOpen = useShellStore((s) => s.addSignFormOpen);

  useEffect(() => {
    if (lastProfileSelected) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 600);
      return () => clearTimeout(t);
    }
  }, [lastProfileSelected]);

  const toggle = () => {
    const next = !chatOpen;
    setChatOpen(next);
    localStorage.setItem("signmaker_chat_open", String(next));
  };

  return (
    <>
      {chatOpen && (
        <div
          className={`fixed z-[55] bg-card border border-border rounded-t-2xl shadow-2xl flex flex-col
            bottom-20 w-[420px] h-[560px]
            max-md:inset-x-0 max-md:bottom-0 max-md:w-full max-md:h-[min(65vh,calc(100vh-env(safe-area-inset-bottom)-120px))] max-md:rounded-t-2xl
            transition-all duration-200
          `}
          style={addSignFormOpen ? { right: 460 } : { right: 24 }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <span className="text-sm font-semibold text-foreground">LetterMan</span>
            <button onClick={toggle} className="text-muted-foreground hover:text-foreground transition-colors text-xs">
              ✕
            </button>
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            <ChatErrorBoundary>
              <ChatThread />
            </ChatErrorBoundary>
          </div>
          <div className="shrink-0">
            <InputBar />
          </div>
        </div>
      )}

      <button
        onClick={toggle}
        className={`fixed bottom-6 right-6 z-50 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-200 ${
          pulse ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
        }`}
      >
        {chatOpen ? "Close" : "Ask LetterMan"}
      </button>
    </>
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
              <button onClick={() => setSidebarOpen(true)} className="text-foreground md:hidden" aria-label="Open menu">
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

      <FloatingChat />

      {/* Mobile sidebar overlay */}
      {userTier === 2 && sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-background/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default Dashboard;
