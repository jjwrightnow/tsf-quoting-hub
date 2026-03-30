import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOperatorConfig } from '@/hooks/useOperatorConfig';
import { UploadWorkspace } from '@/components/workspace/UploadWorkspace';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/stores/appStore';

type WorkspaceView = 'upload' | 'project';

const Dashboard = () => {
  const { session } = useAuth();
  const setUserTier = useAppStore((s) => s.setUserTier);
  const setOperatorConfig = useAppStore((s) => s.setOperatorConfig);

  const [workspaceView] = useState<WorkspaceView>('upload');

  const isDevMode = new URLSearchParams(window.location.search).get('dev') === 'true';
  const devSignInAttempted = useRef(false);

  useOperatorConfig();

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

  useEffect(() => {
    if (session) {
      setUserTier(2);
    } else if (!isDevMode) {
      setUserTier(0);
    }
  }, [session, setUserTier, isDevMode]);

  return (
    <AppShell>
      {workspaceView === 'upload' && <UploadWorkspace />}
      {workspaceView === 'project' && (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground text-sm">Project view coming soon.</p>
        </div>
      )}
    </AppShell>
  );
};

export default Dashboard;
