import { useEffect } from "react";
import { useAppStore } from "@/stores/appStore";
import { useAuth } from "@/hooks/useAuth";
import { useOperatorConfig } from "@/hooks/useOperatorConfig";
import { useQuotePolling } from "@/hooks/usePolling";
import { useWizardAutoSave } from "@/hooks/useWizardAutoSave";
import AppSidebar from "@/components/layout/AppSidebar";
import MainPanel from "@/components/layout/MainPanel";
import InputBar from "@/components/layout/InputBar";
import ProjectShell from "@/components/shell/ProjectShell";

const Dashboard = () => {
  const { session, signOut } = useAuth();
  const userTier = useAppStore((s) => s.userTier);
  const setUserTier = useAppStore((s) => s.setUserTier);
  const setOperatorConfig = useAppStore((s) => s.setOperatorConfig);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);

  const isDevMode = new URLSearchParams(window.location.search).get('dev') === 'true';

  useOperatorConfig();

  // Dev-mode bypass: fake tier 2 + default operator config
  useEffect(() => {
    if (isDevMode) {
      setUserTier(2);
      setOperatorConfig({
        brand_name: 'Dev SignMaker',
        chatbot_name: 'LetterMan',
        logo_url: null,
        primary_color: null,
        support_email: 'dev@example.com',
        canned_questions: [],
        context_instruction: null,
      });
      return;
    }
    // Normal auth-tier sync
    if (session) {
      if (userTier < 2) setUserTier(2);
    } else {
      if (userTier === 2) setUserTier(0);
    }
  }, [session, userTier, setUserTier, setOperatorConfig, isDevMode]);

  useQuotePolling(userTier === 2 && !!session);
  useWizardAutoSave();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar — authenticated tier 2 users only */}
      {userTier === 2 && (
        <AppSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onSignOut={signOut} />
      )}

      <div className="relative flex flex-1 flex-col min-w-0">
        <div className="flex-1 overflow-hidden">
          <ProjectShell>
            <div className="flex h-full min-h-0 flex-col">
              <div className="min-h-0 flex-1 overflow-hidden">
                <MainPanel />
              </div>
              <div className="border-t border-border bg-background">
                <InputBar />
              </div>
            </div>
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
