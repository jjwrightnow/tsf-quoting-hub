const HeroMockup = () => (
  <div className="mx-auto mt-12 w-full max-w-3xl px-4">
    {/* Browser frame */}
    <div className="rounded-xl border border-border bg-card shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Chrome bar */}
      <div className="flex items-center gap-2 bg-[hsl(240,22%,10%)] px-4 py-2.5 border-b border-border">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[hsl(0,60%,45%)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[hsl(43,80%,50%)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[hsl(130,50%,40%)]" />
        </div>
        <div className="ml-3 flex-1 rounded-md bg-[hsl(240,18%,8%)] px-3 py-1 text-[10px] text-muted-foreground truncate">
          app.signmaker.ai
        </div>
      </div>

      {/* App interior */}
      <div className="flex h-[340px] bg-background text-foreground">
        {/* Sidebar */}
        <div className="w-[180px] shrink-0 border-r border-border bg-[hsl(var(--sidebar-background))] flex flex-col">
          <div className="px-3 pt-4 pb-3">
            <div className="w-full rounded-md py-1.5 text-center text-[10px] font-semibold gradient-pink-blue text-foreground">
              + New Quote
            </div>
          </div>
          <p className="px-3 pb-1 text-[8px] font-medium uppercase tracking-widest text-muted-foreground">
            Drafts
          </p>
          <div className="flex-1 px-2 space-y-0.5 overflow-hidden">
            <MockDraftRow title='Halo Lit Cabinet 36"' label="Halo Lit" active />
            <MockDraftRow title="Open Face Neon Letters" label="Open Face Neon" />
            <MockDraftRow title="Flat Cut Aluminum Logo" label="Flat Cut" />
          </div>
        </div>

        {/* Center chat */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 flex flex-col justify-end px-4 pb-4 gap-3">
            {/* AI bubble */}
            <div className="flex gap-2 max-w-[85%]">
              <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full gradient-pink-blue flex items-center justify-center">
                <div className="h-2 w-2 rounded-sm bg-primary-foreground/90" />
              </div>
              <div className="rounded-lg rounded-tl-sm bg-secondary px-3 py-2 text-[11px] text-foreground leading-relaxed">
                What type of face material will this sign use?
              </div>
            </div>
            {/* User bubble */}
            <div className="flex justify-end max-w-[75%] ml-auto">
              <div className="rounded-lg rounded-tr-sm bg-[hsl(var(--tsf-bubble-user))] px-3 py-2 text-[11px] text-foreground leading-relaxed">
                Acrylic with white<span className="inline-block w-[1px] h-3 bg-foreground ml-0.5 align-middle animate-[blink_1s_step-end_infinite]" />
              </div>
            </div>
          </div>
          {/* Input bar */}
          <div className="border-t border-border px-4 py-2.5">
            <div className="rounded-md border border-border bg-card px-3 py-1.5 text-[10px] text-muted-foreground">
              Type a message…
            </div>
          </div>
        </div>

        {/* Spec card panel */}
        <div className="w-[170px] shrink-0 border-l border-border bg-card p-3 overflow-hidden">
          <p className="text-[9px] font-semibold text-foreground mb-0.5">Halo Lit Cabinet</p>
          <p className="text-[8px] text-muted-foreground mb-2">Sign Specifications</p>
          <div className="space-y-2">
            <SpecField label="Metal Type" value="Aluminum" />
            <SpecField label="Finish" value="Brushed Silver" />
            <SpecField label="Depth" value='3"' />
            <SpecField label="LED Color" />
            <SpecField label="Mounting" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MockDraftRow = ({ title, label, active }: { title: string; label: string; active?: boolean }) => (
  <div
    className={`group relative flex items-start rounded-md px-2 py-1.5 text-left ${
      active ? 'border-l-2 border-accent bg-secondary' : 'border-l-2 border-transparent'
    }`}
  >
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-medium text-foreground truncate">{title}</p>
      <span className="inline-block mt-0.5 rounded px-1 py-[1px] text-[7px] font-medium bg-muted text-muted-foreground">
        {label}
      </span>
    </div>
    <svg
      className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground/40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  </div>
);

const SpecField = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <p className="text-[7px] uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
    {value ? (
      <p className="text-[10px] text-foreground font-medium">{value}</p>
    ) : (
      <div className="h-4 rounded bg-muted/40 border border-border" />
    )}
  </div>
);

export default HeroMockup;
