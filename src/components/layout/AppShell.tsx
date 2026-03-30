import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LetterManChat } from '@/components/chat/LetterManChat';
import { LogOut, MessageCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { safeStorage } from '@/lib/safeStorage';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { session, signOut } = useAuth();
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(() => safeStorage.getItem('letterman_collapsed') === 'true');

  const isDevMode = new URLSearchParams(window.location.search).get('dev') === 'true';

  const toggleChat = () => {
    setChatCollapsed(prev => {
      const next = !prev;
      safeStorage.setItem('letterman_collapsed', String(next));
      return next;
    });
  };

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
          {children}
        </div>

        {/* RIGHT: LetterMan chat (desktop) */}
        <aside
          className="hidden lg:flex flex-shrink-0 flex-col border-l border-border bg-secondary transition-[width] duration-300 ease-in-out overflow-hidden relative"
          style={{ width: chatCollapsed ? 48 : 400 }}
        >
          <button
            onClick={toggleChat}
            className="absolute top-3 -left-0 z-10 w-6 h-10 flex items-center justify-center rounded-r-md bg-primary/80 hover:bg-primary text-primary-foreground transition-colors"
            title={chatCollapsed ? 'Expand chat' : 'Collapse chat'}
          >
            {chatCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>

          {chatCollapsed ? (
            <div
              className="flex flex-col items-center justify-center h-full gap-3 cursor-pointer select-none"
              onClick={toggleChat}
            >
              <MessageCircle size={20} className="text-muted-foreground" />
              <span
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
              >
                LetterMan
              </span>
            </div>
          ) : (
            <>
              <div className="h-12 flex-shrink-0 flex items-center justify-between px-4 border-b border-sidebar-border bg-primary pl-8">
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
            </>
          )}
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
}
