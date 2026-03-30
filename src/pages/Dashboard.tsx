import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOperatorConfig } from '@/hooks/useOperatorConfig';
import { LetterManChat } from '@/components/chat/LetterManChat';
import { UploadWorkspace } from '@/components/workspace/UploadWorkspace';
import { LogOut, MessageCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { safeStorage } from '@/lib/safeStorage';

import { useAppStore } from '@/stores/appStore';

type WorkspaceView = 'upload' | 'project';

const Dashboard = () => {
  const { session, signOut } = useAuth();
  const setUserTier = useAppStore((s) => s.setUserTier);
  const setOperatorConfig = useAppStore((s) => s.setOperatorConfig);

  const [workspaceView] = useState<WorkspaceView>('upload');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const isDevMode = new URLSearchParams(window.location.search).get('dev') === 'true';
  const devSignInAttempted = useRef(false);

  useOperatorConfig();

  // Dev-mode bypass
  useEffect(() => {
    if (!isDevMode || devSignInAttempted.current) return;
    devSignInAttempted.current = true;
    supabase.auth.signInWithPassword({
      email: 'dev@signmaker.ai',
      password: 'devtest123',
    }).then(({ error }) => {
      if (error) {
        console.error('[DevMode] sign-in failed:', error.message);
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
      }
    });
  }, [isDevMode, setUserTier, setOperatorConfig]);

  // Auth-tier sync
  useEffect(() => {
    if (session) {
      setUserTier(2);
    } else if (!isDevMode) {
      setUserTier(0);
    }
  }, [session, setUserTier, isDevMode]);


  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="h-12 flex-shrink-0 flex items-center justify-between px-4 bg-primary border-b border-sidebar-border z-50">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-lg text-primary-foreground tracking-tight">SignMaker</span>
          <div className="w-1.5 h-1.5 rounded-full bg-ring" />
        </div>
        <div className="flex items-center gap-3">
          {(session || isDevMode) && (
            <button
              onClick={signOut}
              className="text-primary-foreground/60 hover:text-primary-foreground transition-colors p-1"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </header>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Workspace */}
        <div className="flex-1 overflow-y-auto min-w-0">
          {workspaceView === 'upload' && <UploadWorkspace />}
          {workspaceView === 'project' && (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-sm">Project view coming soon.</p>
            </div>
          )}
        </div>

        {/* RIGHT: LetterMan chat (desktop) */}
        <aside className="hidden lg:flex w-[400px] flex-shrink-0 flex-col border-l border-border bg-secondary">
          <div className="h-12 flex-shrink-0 flex items-center justify-between px-4 border-b border-sidebar-border bg-primary">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary-foreground uppercase tracking-wide">
                LetterMan
              </span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <LetterManChat mode="embedded" />
          </div>
        </aside>
      </div>

      {/* Mobile chat bubble */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        {!mobileChatOpen && (
          <button
            onClick={() => setMobileChatOpen(true)}
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            <MessageCircle size={24} />
          </button>
        )}
      </div>

      {/* Mobile chat overlay */}
      {mobileChatOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-background">
          <div className="h-12 flex-shrink-0 flex items-center justify-between px-4 bg-primary border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary-foreground uppercase tracking-wide">
                LetterMan
              </span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <button
              onClick={() => setMobileChatOpen(false)}
              className="text-primary-foreground/60 hover:text-primary-foreground p-1"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <LetterManChat mode="overlay" onClose={() => setMobileChatOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
