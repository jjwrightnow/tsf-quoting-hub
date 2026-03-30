import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useShellStore } from '@/stores/shellStore';
import { LetterManChat } from '@/components/chat/LetterManChat';
import { BookOpen, ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import { safeStorage } from '@/lib/safeStorage';

interface TechClass {
  code: string;
  short_name: string;
  price_tier: string;
  hover_description: string;
}

interface LightingStyle {
  lighting_code: string;
  display_name: string;
  sku_label: string;
  hover_description: string;
}

const readUiMode = (): 'pro' | 'client' => {
  const saved = safeStorage.getItem('signmaker_ui_mode');
  return saved === 'client' ? 'client' : 'pro';
};

function ProductGuide() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [techClasses, setTechClasses] = useState<TechClass[]>([]);
  const [lightingStyles, setLightingStyles] = useState<LightingStyle[]>([]);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const { data: tech } = await supabase
          .from('technology_classes')
          .select('code, short_name, price_tier, hover_description')
          .eq('is_active', true)
          .order('sort_order');
        const { data: light } = await supabase
          .from('lighting_styles')
          .select('lighting_code, display_name, sku_label, hover_description')
          .eq('is_active', true)
          .order('sort_order');
        if (tech) setTechClasses(tech);
        if (light) setLightingStyles(light);
      } catch (err) {
        console.error('ProductGuide fetch error:', err);
      }
    };
    fetchGuide();
  }, []);

  return (
    <div className="flex-shrink-0">
      <div
        className="overflow-hidden transition-all duration-300 bg-background border-t border-border"
        style={{ height: isExpanded ? '300px' : '0px' }}
      >
        <div className="grid grid-cols-2 h-full divide-x divide-border">
          <div className="overflow-y-auto p-4 space-y-3">
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold pb-2 border-b border-border">
              Construction Types
            </h4>
            {techClasses.map(t => (
              <div key={t.code} className="pb-3 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{t.short_name}</span>
                  <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase">
                    {t.price_tier}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed opacity-70">
                  {t.hover_description}
                </p>
              </div>
            ))}
          </div>
          <div className="overflow-y-auto p-4 space-y-3">
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold pb-2 border-b border-border">
              Lighting Styles
            </h4>
            {lightingStyles.map(l => (
              <div key={l.lighting_code} className="pb-3 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{l.display_name}</span>
                  <span className="text-[9px] font-mono text-muted-foreground opacity-50">
                    [{l.sku_label}]
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed opacity-70">
                  {l.hover_description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-10 flex items-center justify-between px-4 bg-primary border-t border-border cursor-pointer hover:bg-primary/90 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary-foreground" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-primary-foreground">
            Product Guide
          </span>
        </div>
        {isExpanded
          ? <ChevronDown size={14} className="text-primary-foreground" />
          : <ChevronUp size={14} className="text-primary-foreground" />
        }
      </div>
    </div>
  );
}

interface ProjectShellProps {
  children: React.ReactNode;
}

export function ProjectShell({ children }: ProjectShellProps) {
  const [uiMode, setUiModeState] = useState<'pro' | 'client'>(readUiMode);
  
  let store: any = { shellState: 'loading', activeProject: null, userEmail: '', signOut: null };
  try {
    store = useShellStore() as any;
  } catch (e) {
    console.error('Failed to initialize useShellStore:', e);
  }

  const setUiMode = (mode: 'pro' | 'client') => {
    setUiModeState(mode);
    safeStorage.setItem('signmaker_ui_mode', mode);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-background">

      <header className="h-12 flex-shrink-0 flex items-center justify-between px-4 bg-primary border-b border-sidebar-border z-50">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-lg text-primary-foreground tracking-tight">SignMaker</span>
          <div className="w-1.5 h-1.5 rounded-full bg-ring" />
        </div>
        <div className="flex-1 text-center hidden sm:block">
          {store.shellState === 'in_project' && store.activeProject && (
            <span className="text-sm text-primary-foreground/80 font-medium">
              {store.activeProject.project_name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {store.userEmail && (
            <span className="text-[10px] text-primary-foreground/60 font-mono hidden md:block truncate max-w-[160px]">
              {store.userEmail}
            </span>
          )}
          <div className="flex bg-sidebar-accent p-0.5 rounded border border-sidebar-border">
            <button
              onClick={() => setUiMode('pro')}
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded transition-all ${
                uiMode === 'pro' ? 'bg-blue-600 text-white' : 'text-primary-foreground/60 hover:text-primary-foreground'
              }`}
            >
              Pro
            </button>
            <button
              onClick={() => setUiMode('client')}
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded transition-all ${
                uiMode === 'client' ? 'bg-pink-600 text-white' : 'text-primary-foreground/60 hover:text-primary-foreground'
              }`}
            >
              Client
            </button>
          </div>
          {store.signOut && (
            <button
              onClick={store.signOut}
              className="text-primary-foreground/60 hover:text-primary-foreground transition-colors p-1"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col bg-background overflow-hidden min-w-0">
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
          <ProductGuide />
        </div>

        <aside className="hidden lg:flex w-[400px] flex-shrink-0 flex-col border-l border-border bg-secondary">
          <div className="h-12 flex-shrink-0 flex items-center justify-between px-4 border-b border-sidebar-border bg-primary">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary-foreground uppercase tracking-wide">
                LetterMan
              </span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            </div>
            <div className={`rounded px-2 py-0.5 border text-[9px] font-bold uppercase tracking-tight ${
              uiMode === 'pro'
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                : 'bg-pink-500/10 border-pink-500/20 text-pink-400'
            }`}>
              {uiMode} Mode
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <LetterManChat mode="embedded" />
          </div>
        </aside>
      </div>

    </div>
  );
}

export default ProjectShell;
