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

function ProductGuide() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [techClasses, setTechClasses] = useState<TechClass[]>([]);
  const [lightingStyles, setLightingStyles] = useState<LightingStyle[]>([]);

  useEffect(() => {
    const fetchGuide = async () => {
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
    };
    fetchGuide();
  }, []);

  return (
    <div className="flex-shrink-0">
      <div
        className="overflow-hidden transition-all duration-300 bg-[#0f0f1a] border-t border-[#1e1e35]"
        style={{ height: isExpanded ? '300px' : '0px' }}
      >
        <div className="grid grid-cols-2 h-full divide-x divide-[#1e1e35]">
          <div className="overflow-y-auto p-4 space-y-3">
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold pb-2 border-b border-white/5">
              Construction Types
            </h4>
            {techClasses.map(t => (
              <div key={t.code} className="pb-3 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{t.short_name}</span>
                  <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase">
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
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold pb-2 border-b border-white/5">
              Lighting Styles
            </h4>
            {lightingStyles.map(l => (
              <div key={l.lighting_code} className="pb-3 border-b border-white/5 last:border-0">
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
        className="h-10 flex items-center justify-between px-4 bg-[#0a0a14] border-t border-[#1e1e35] cursor-pointer hover:bg-[#16162a] transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-500" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Product Guide
          </span>
        </div>
        {isExpanded
          ? <ChevronDown size={14} className="text-muted-foreground" />
          : <ChevronUp size={14} className="text-muted-foreground" />
        }
      </div>
    </div>
  );
}

interface ProjectShellProps {
  children: React.ReactNode;
}

export function ProjectShell({ children }: ProjectShellProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [uiMode, setUiModeState] = useState<'pro' | 'client'>(() => {
    const saved = localStorage.getItem('signmaker_ui_mode');
    return (saved as 'pro' | 'client') || 'pro';
  });
  const store = useShellStore() as any;
  const shellState = store.shellState;
  const activeProject = store.activeProject;
  const userEmail = store.userEmail;
  const signOut = store.signOut;

  const setUiMode = (mode: 'pro' | 'client') => {
    setUiModeState(mode);
    localStorage.setItem('signmaker_ui_mode', mode);
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#0a0a14]">

      <header className="h-12 flex-shrink-0 flex items-center justify-between px-4 bg-[#0a0a14] border-b border-[#1e1e35] z-50">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-lg text-white tracking-tight">SignMaker</span>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        </div>
        <div className="flex-1 text-center hidden sm:block">
          {shellState === 'in_project' && activeProject && (
            <span className="text-sm text-white/80 font-medium">
              {activeProject.project_name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {userEmail && (
            <span className="text-[10px] text-muted-foreground font-mono hidden md:block truncate max-w-[160px]">
              {userEmail}
            </span>
          )}
          <div className="flex bg-[#16162a] p-0.5 rounded border border-[#1e1e35]">
            <button
              onClick={() => setUiMode('pro')}
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded transition-all ${
                uiMode === 'pro' ? 'bg-blue-600 text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Pro
            </button>
            <button
              onClick={() => setUiMode('client')}
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded transition-all ${
                uiMode === 'client' ? 'bg-pink-600 text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Client
            </button>
          </div>
          {signOut && (
            <button
              onClick={signOut}
              className="text-muted-foreground hover:text-white transition-colors p-1"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col bg-[#0d0d1a] overflow-hidden min-w-0">
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
          <ProductGuide />
        </div>

        <aside className="hidden lg:flex w-[400px] flex-shrink-0 flex-col border-l border-[#1e1e35] bg-[#111120]">
          <div className="h-12 flex-shrink-0 flex items-center justify-between px-4 border-b border-[#1e1e35] bg-[#0d0d1a]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white uppercase tracking-wide">
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

      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-4 right-4 z-50 lg:hidden w-12 h-12 rounded-full bg-blue-600 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        aria-label="Open chat"
      >
        <MessageCircle className="w-5 h-5 text-white" />
      </button>

      {chatOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setChatOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 h-[70vh] bg-[#111120] rounded-t-2xl shadow-2xl flex flex-col">
            <div className="h-12 flex items-center justify-between px-6 border-b border-[#1e1e35] flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold uppercase tracking-widest">LetterMan</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </div>
              <button onClick={() => setChatOpen(false)} className="text-muted-foreground hover:text-white p-1">
                <ChevronDown size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <LetterManChat mode="overlay" onClose={() => setChatOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectShell;
