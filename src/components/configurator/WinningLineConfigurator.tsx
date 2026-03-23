import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useShellStore, type PortalSign } from '@/stores/shellStore';
import { toast } from 'sonner';

/* ─── Types ─── */
interface Profile {
  id: string;
  profile_code: string;
  profile_name: string;
  lighting_code: string;
  technology: string | null;
  illustration_url: string | null;
  is_active: boolean;
  face_style: string | null;
  return_type: string | null;
}

interface ProfileComponent {
  id: string;
  profile_id: string;
  component_id: string | null;
  layer_position: string;
  position_order: number;
  is_default: boolean | null;
  notes: string | null;
  component_name: string | null;
  material_category: string | null;
  sub_type: string | null;
  client_badge: string | null;
  client_description: string | null;
}

interface WinningLineConfiguratorProps {
  activeProject?: { id: string; project_name: string } | null;
  editingSign?: PortalSign | null;
  onSignSaved?: () => void;
}

type UiMode = 'pro' | 'client';

/* ─── Constants ─── */
const LIGHTING_BUTTONS = [
  { label: 'None', position: -1 },
  { label: 'Face', position: 0 },
  { label: 'Side (front)', position: 1 },
  { label: 'Side', position: -2 },
  { label: 'Side (back)', position: 2 },
  { label: 'Halo', position: 3 },
] as const;

const TECH_BUTTONS = ['Premium', 'Standard', 'Acrylic', 'Solid Acrylic', 'Flat Cut'] as const;

const PRICE_TIER: Record<string, { label: string; color: string }> = {
  Premium: { label: '$$$', color: 'text-cfg-pink' },
  Acrylic: { label: '$$', color: 'text-cfg-blue' },
  Standard: { label: '$', color: 'text-cfg-muted' },
  'Solid Acrylic': { label: '$', color: 'text-cfg-muted' },
  'Flat Cut': { label: '$', color: 'text-cfg-muted' },
};

const MATERIAL_BORDER: Record<string, string> = {
  metal: 'border-l-cfg-muted',
  acrylic: 'border-l-cyan-400',
  LED: 'border-l-yellow-400',
  hardware: 'border-l-slate-400',
  PVC: 'border-l-teal-400',
  vinyl: 'border-l-purple-400',
  'wire/electrical': 'border-l-red-400',
};

/* ─── Upgrade 1: Client mode mappings ─── */
const LIGHTING_CODE_LABELS: Record<string, string> = {
  '0000': 'No Lighting',
  '1000': 'Front Glow',
  '0001': 'Halo',
  '1001': 'Front + Halo',
  '0010': 'Side Glow',
  '0110': 'Edge Glow',
  '1111': 'Full Illumination',
};

function lightingCodeToLabel(code: string): string {
  const padded = code.padEnd(4, '0');
  return LIGHTING_CODE_LABELS[padded] || 'Custom Lighting';
}

const CLIENT_LAYER_LABELS: Record<string, string> = {
  'face type': 'Front Face',
  'return body': 'Letter Sides',
  'back insert': 'Back Panel',
  'LED': 'Internal Lighting',
  'wiring': 'Power Connection',
  'mounting': 'Wall Attachment',
  'face cover': 'Face Plate',
};

function clientComponentName(name: string | null): string {
  if (!name) return 'Unknown';
  const lower = name.toLowerCase();
  if (lower.includes('acrylic')) return 'Acrylic';
  if (lower.includes('metal')) return 'Metal';
  if (name === 'Stud mount (rivnut + strap)') return 'Wall Studs';
  if (name === 'wire exit (back)') return 'Power Exit';
  if (name === 'LEDs') return 'LED Modules';
  return name;
}

/* ─── Lighting code icon ─── */
function LightingIcon({ code, mode }: { code: string; mode: UiMode }) {
  const positions = code.padEnd(4, '0').split('');
  const colors = ['hsl(var(--cfg-blue))', '#eab308', '#eab308', '#eab308'];

  if (mode === 'client') {
    return (
      <span className="text-[9px] text-cfg-muted leading-none">
        {lightingCodeToLabel(code)}
      </span>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-[2px] w-5 h-5">
      {positions.map((bit, i) => (
        <div
          key={i}
          className="rounded-[2px]"
          style={{
            backgroundColor: bit === '1' ? colors[i] : 'hsl(var(--cfg-muted) / 0.3)',
            boxShadow: bit === '1' ? `0 0 4px ${colors[i]}` : 'none',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Upgrade 4: Scale silhouette SVG ─── */
function ScaleSilhouette({ heightInches }: { heightInches: number }) {
  const svgH = 36;
  const svgW = 20;
  const refHeight = 72;
  const personH = svgH - 2;
  const letterH = Math.max(2, (heightInches / refHeight) * personH);

  return (
    <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
      <rect x="2" y={svgH - 2 - personH} width="4" height={personH}
        fill="#6b7280" opacity="0.8" rx="1" />
      <rect x="10" y={svgH - 2 - letterH} width="6" height={letterH}
        fill="#3b82f6" opacity="0.6" rx="1" />
    </svg>
  );
}

/* ─── Summary Bar ─── */
function SummaryBar({
  profile,
  technology,
  onScrollTo,
}: {
  profile: string | null;
  technology: string | null;
  onScrollTo: (zone: number) => void;
}) {
  const segments = [
    { label: profile || '—', zone: 1 },
    { label: technology || '—', zone: 0 },
    { label: '—', zone: 2 },
    { label: '—', zone: 2 },
  ];

  return (
    <div className="flex items-center gap-1.5 rounded-md bg-card px-3 py-2 text-xs overflow-x-auto">
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">
          <button
            onClick={() => onScrollTo(seg.zone)}
            className={`rounded px-2 py-0.5 transition-colors ${
              seg.label !== '—'
                ? 'bg-cfg-blue/10 text-cfg-blue hover:bg-cfg-blue/20 cursor-pointer'
                : 'text-cfg-muted cursor-default'
            }`}
          >
            {seg.label}
          </button>
          {i < segments.length - 1 && <span className="text-cfg-muted">·</span>}
        </span>
      ))}
    </div>
  );
}

/* ─── Stepper ─── */
function Stepper({ step }: { step: number }) {
  const steps = ['Choose lighting', 'Pick style', 'Review and quote'];
  return (
    <div className="flex items-center gap-4 w-full text-[11px] font-medium">
      {steps.map((label, i) => (
        <span
          key={i}
          className={`flex items-center gap-1.5 ${
            i === step ? 'text-cfg-blue' : 'text-cfg-muted'
          }`}
        >
          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
            i === step ? 'bg-cfg-blue text-primary-foreground' : 'bg-secondary text-cfg-muted'
          }`}>
            {i + 1}
          </span>
          {label}
        </span>
      ))}
    </div>
  );
}

/* ─── Profile Card ─── */
function ProfileCard({
  profile,
  selected,
  onClick,
  mode,
  letterHeight,
}: {
  profile: Profile;
  selected: boolean;
  onClick: () => void;
  mode: UiMode;
  letterHeight: number;
}) {
  const tier = PRICE_TIER[profile.technology || 'Standard'] || PRICE_TIER.Standard;

  return (
    <button
      onClick={onClick}
      className={`group relative rounded-lg bg-card p-3 text-left transition-all duration-200 border-2 ${
        selected
          ? 'border-cfg-pink shadow-[0_0_16px_hsl(var(--cfg-pink)/0.3)]'
          : 'border-transparent hover:border-border'
      }`}
    >
      <span className={`absolute top-2 left-2 text-[10px] font-bold ${tier.color}`}>
        {tier.label}
      </span>
      <div className="absolute top-2 right-2">
        <LightingIcon code={profile.lighting_code} mode={mode} />
      </div>
      <div className="flex items-center justify-center h-24 mb-2 rounded bg-secondary/40 overflow-hidden">
        {profile.illustration_url ? (
          <img
            src={profile.illustration_url}
            alt={profile.profile_name}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1e1e35] to-[#151525]">
            <span className="text-[64px] font-bold text-cfg-blue/20 select-none leading-none">A</span>
          </div>
        )}
      </div>
      <p className="text-xs font-bold text-foreground truncate">{profile.profile_name}</p>
      {mode === 'pro' && (
        <p className="text-[10px] font-mono text-cfg-blue">{profile.profile_code}</p>
      )}
      <div className="absolute bottom-1 right-1">
        <ScaleSilhouette heightInches={letterHeight} />
      </div>
    </button>
  );
}

/* ─── Construction Stack ─── */
function ConstructionStack({ components, mode }: { components: ProfileComponent[]; mode: UiMode }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const groups = useMemo(() => {
    const face = components.filter(
      (c) => c.layer_position === 'face cover' || c.layer_position === 'face type',
    );
    const body = components.filter(
      (c) => c.layer_position === 'return body' || c.layer_position === 'back insert',
    );
    const systems = components.filter(
      (c) =>
        c.layer_position === 'LED' ||
        c.layer_position === 'wiring' ||
        c.layer_position === 'mounting',
    );
    return [
      { title: 'Face Assembly', items: face },
      { title: 'Body', items: body },
      { title: 'Systems', items: systems },
    ].filter((g) => g.items.length > 0);
  }, [components]);

  const toggleExpand = (pos: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(pos) ? next.delete(pos) : next.add(pos);
      return next;
    });
  };

  const groupSlots = (items: ProfileComponent[]) => {
    const map = new Map<string, ProfileComponent[]>();
    for (const item of items) {
      const existing = map.get(item.layer_position) || [];
      existing.push(item);
      map.set(item.layer_position, existing);
    }
    return Array.from(map.entries());
  };

  const displayPosition = (pos: string) =>
    mode === 'client' ? (CLIENT_LAYER_LABELS[pos] || pos) : pos;

  const displayName = (name: string | null) =>
    mode === 'client' ? clientComponentName(name) : (name || 'Unknown');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-fade-in-up">
      {groups.map((group) => (
        <div key={group.title} className="rounded-lg bg-cfg-surface p-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-cfg-muted mb-2">
            {group.title}
          </p>
          <div className="space-y-2">
            {groupSlots(group.items).map(([position, slots]) => {
              const defaults = slots.filter((s) => s.is_default !== false);
              const alternates = slots.filter((s) => s.is_default === false);
              const isExpanded = expanded.has(position);
              const borderColor =
                MATERIAL_BORDER[defaults[0]?.material_category || ''] || 'border-l-cfg-muted';

              return (
                <div key={position}>
                  {defaults.map((slot) => (
                    <div
                      key={slot.id}
                      className={`rounded border-l-2 ${borderColor} bg-background/40 px-2.5 py-1.5`}
                    >
                      <p className="text-[9px] uppercase tracking-wide text-cfg-muted">
                        {displayPosition(position)}
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        {displayName(slot.component_name)}
                      </p>
                      {mode === 'client' && slot.client_badge && (
                        <span className="inline-block text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400" title={slot.client_description || ''}>
                          {slot.client_badge}
                        </span>
                      )}
                      {mode === 'pro' && slot.material_category && (
                        <span className="text-[9px] text-cfg-muted">{slot.material_category}</span>
                      )}
                    </div>
                  ))}
                  {alternates.length > 0 && (
                    <button
                      onClick={() => toggleExpand(position)}
                      className="text-[10px] text-cfg-blue hover:underline mt-1"
                    >
                      {isExpanded ? 'Hide alternates' : `... ${alternates.length} alternate${alternates.length > 1 ? 's' : ''}`}
                    </button>
                  )}
                  {isExpanded &&
                    alternates.map((alt) => (
                      <div
                        key={alt.id}
                        className={`rounded border-l-2 ${
                          MATERIAL_BORDER[alt.material_category || ''] || 'border-l-cfg-muted'
                        } bg-background/20 px-2.5 py-1.5 mt-1`}
                      >
                        <p className="text-xs text-foreground/80">{displayName(alt.component_name)}</p>
                        {mode === 'pro' && alt.material_category && (
                          <span className="text-[9px] text-cfg-muted">{alt.material_category}</span>
                        )}
                      </div>
                    ))}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Add Sign Form ─── */
function AddSignForm({
  projectId,
  projectName,
  profileCode,
  technology,
  slotData,
  letterHeight,
  onHeightChange,
  onSaved,
  onCancel,
  editingSign,
}: {
  projectId: string;
  projectName: string;
  profileCode: string;
  technology: string | null;
  slotData: ProfileComponent[];
  letterHeight: number;
  onHeightChange: (h: number) => void;
  onSaved: () => void;
  onCancel: () => void;
  editingSign?: PortalSign | null;
}) {
  const [signName, setSignName] = useState(editingSign?.sign_name || '');
  const [height, setHeight] = useState(editingSign?.height || String(letterHeight));
  const [quantity, setQuantity] = useState(editingSign?.sets || 1);
  const [notes, setNotes] = useState(editingSign?.notes || '');
  const [saving, setSaving] = useState(false);

  // Track form open state in store
  useEffect(() => {
    useShellStore.getState().setAddSignFormOpen(true);
    return () => { useShellStore.getState().setAddSignFormOpen(false); };
  }, []);

  // Sync height back to parent letterHeight
  useEffect(() => {
    const parsed = parseFloat(height);
    if (!isNaN(parsed) && parsed > 0) onHeightChange(parsed);
  }, [height, onHeightChange]);

  const handleSave = async () => {
    if (!signName.trim()) return;
    setSaving(true);

    const specData: Record<string, unknown[]> = { face_assembly: [], body: [], systems: [] };
    for (const c of slotData) {
      const entry = { component_name: c.component_name, material_category: c.material_category, layer_position: c.layer_position };
      if (c.layer_position === 'face cover' || c.layer_position === 'face type') {
        specData.face_assembly.push(entry);
      } else if (c.layer_position === 'return body' || c.layer_position === 'back insert') {
        specData.body.push(entry);
      } else {
        specData.systems.push(entry);
      }
    }

    const heightNum = parseFloat(height);

    if (editingSign) {
      // UPDATE existing sign
      const { error } = await supabase.from('portal_signs').update({
        sign_name: signName.trim(),
        profile_code: profileCode,
        profile_type: technology,
        spec_data: specData,
        height: height || null,
        height_inches: !isNaN(heightNum) ? heightNum : null,
        sets: quantity,
        notes: notes || null,
        is_complete: true,
      } as any).eq('id', editingSign.id);

      if (!error) {
        toast.success(`${signName.trim()} updated`);
        useShellStore.getState().setEditingSign(null);
        useShellStore.getState().setEditingSignId(null);
        onSaved();
      } else {
        toast.error('Failed to update sign');
      }
    } else {
      // INSERT new sign
      const { error } = await supabase.from('portal_signs').insert({
        project_id: projectId,
        sign_name: signName.trim(),
        profile_code: profileCode,
        profile_type: technology,
        spec_data: specData,
        height: height || null,
        height_inches: !isNaN(heightNum) ? heightNum : null,
        sets: quantity,
        notes: notes || null,
        sort_order: 0,
        is_complete: true,
      } as any);

      if (!error) {
        toast.success(`${signName.trim()} added to ${projectName}`);
        onSaved();
      } else {
        toast.error('Failed to save sign');
      }
    }
    setSaving(false);
  };

  const handleCancel = () => {
    if (editingSign) {
      useShellStore.getState().setEditingSign(null);
      useShellStore.getState().setEditingSignId(null);
    }
    onCancel();
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3 animate-fade-in-up">
      <p className="text-sm font-semibold text-foreground">
        {editingSign ? 'Edit Sign' : 'Add Sign to Project'}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-wide text-cfg-muted">Sign name *</label>
          <input
            value={signName}
            onChange={(e) => setSignName(e.target.value)}
            placeholder="e.g. Main Entrance, Lobby Logo"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wide text-cfg-muted">Height</label>
          <input
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder='e.g. 12 inches'
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wide text-cfg-muted">Quantity / Sets</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wide text-cfg-muted">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !signName.trim()}
          className="rounded-md bg-cfg-blue px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-cfg-blue/90 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : editingSign ? 'Update Sign' : 'Save Sign to Project'}
        </button>
        <button onClick={handleCancel} className="text-xs text-cfg-muted hover:text-foreground transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─── Explore Quote Drawer ─── */
function ExploreQuoteForm({
  profileCode,
  technology,
  slotData,
  onClose,
}: {
  profileCode: string;
  technology: string | null;
  slotData: ProfileComponent[];
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');
  const [projectName, setProjectName] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!email.trim() || !projectName.trim()) return;
    setSaving(true);

    const specData: Record<string, unknown[]> = { face_assembly: [], body: [], systems: [] };
    for (const c of slotData) {
      const entry = { component_name: c.component_name, material_category: c.material_category, layer_position: c.layer_position };
      if (c.layer_position === 'face cover' || c.layer_position === 'face type') {
        specData.face_assembly.push(entry);
      } else if (c.layer_position === 'return body' || c.layer_position === 'back insert') {
        specData.body.push(entry);
      } else {
        specData.systems.push(entry);
      }
    }

    const { error } = await supabase.from('draft_quotes').insert({
      user_email: email.trim().toLowerCase(),
      title: projectName.trim(),
      profile_type: profileCode,
      spec_data: { ...specData, notes },
    } as any);

    if (!error) {
      toast.success('Quote request submitted!');
      onClose();
    } else {
      toast.error('Failed to submit');
    }
    setSaving(false);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3 animate-fade-in-up">
      <p className="text-sm font-semibold text-foreground">Request a Quote</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-wide text-cfg-muted">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wide text-cfg-muted">Project name *</label>
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. 123 Main St Lobby"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wide text-cfg-muted">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !email.trim() || !projectName.trim()}
          className="rounded-md bg-cfg-blue px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-cfg-blue/90 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Submitting...' : 'Request Quote'}
        </button>
        <button onClick={onClose} className="text-xs text-cfg-muted hover:text-foreground transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─── Upgrade 3: AI Context Ribbon ─── */
function ContextRibbon({
  filteredCount,
  lightingFilters,
  techFilter,
  selectedProfile,
}: {
  filteredCount: number;
  lightingFilters: Set<number>;
  techFilter: Set<string>;
  selectedProfile: Profile | null;
}) {
  const text = useMemo(() => {
    if (selectedProfile) {
      return `Selected: ${selectedProfile.profile_name} — ${lightingCodeToLabel(selectedProfile.lighting_code)}`;
    }

    const parts: string[] = [];

    if (techFilter.size > 0) {
      parts.push(Array.from(techFilter).join(' / '));
    }

    const lightingLabels: string[] = [];
    if (lightingFilters.has(0)) lightingLabels.push('face-lit');
    if (lightingFilters.has(1)) lightingLabels.push('side-front');
    if (lightingFilters.has(-2)) lightingLabels.push('side-lit');
    if (lightingFilters.has(2)) lightingLabels.push('side-back');
    if (lightingFilters.has(3)) lightingLabels.push('halo');
    if (lightingLabels.length > 0) {
      parts.push(lightingLabels.join(' and ') + ' options');
    }

    if (parts.length === 0) {
      return 'Select a lighting style above to begin';
    }

    return `${parts.join(' ')} — ${filteredCount} profiles`;
  }, [filteredCount, lightingFilters, techFilter, selectedProfile]);

  return (
    <p className="text-[11px] italic text-cfg-muted px-1">{text}</p>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export default function WinningLineConfigurator({
  activeProject = null,
  editingSign = null,
  onSignSaved,
}: WinningLineConfiguratorProps) {
  // Data
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  // Filters
  const [lightingFilters, setLightingFilters] = useState<Set<number>>(new Set());
  const [techFilter, setTechFilter] = useState<Set<string>>(new Set());

  // Selection
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [components, setComponents] = useState<ProfileComponent[]>([]);
  const [loadingComponents, setLoadingComponents] = useState(false);

  // Stepper
  const [step, setStep] = useState(0);

  // CTA
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  // Upgrade 1: UI mode
  const [uiMode, setUiMode] = useState<UiMode>(
    () => (localStorage.getItem('signmaker_ui_mode') as UiMode) || 'pro'
  );

  // Upgrade 4: Letter height
  const [letterHeightInches, setLetterHeightInches] = useState(12);

  // Refs for scrolling
  const zone0Ref = useRef<HTMLDivElement>(null);
  const zone1Ref = useRef<HTMLDivElement>(null);
  const zone2Ref = useRef<HTMLDivElement>(null);

  // Fetch profiles
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('profile_code', { ascending: true });
      if (data) setProfiles(data as unknown as Profile[]);
      setLoadingProfiles(false);
    })();
  }, []);

  // Edit mode: auto-select profile when editingSign changes
  useEffect(() => {
    if (!editingSign || profiles.length === 0) return;
    const match = profiles.find(p => p.profile_code === editingSign.profile_code);
    if (match) selectProfile(match).then(() => setShowAddForm(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSign, profiles]);

  // Filter logic
  const filteredProfiles = useMemo(() => {
    let result = profiles;

    if (lightingFilters.size > 0 && !lightingFilters.has(-1)) {
      result = result.filter((p) => {
        const code = p.lighting_code.padEnd(4, '0');
        return Array.from(lightingFilters).every((pos) => {
          if (pos === -2) {
            return code[1] === '1' || code[2] === '1';
          }
          return code[pos] === '1';
        });
      });
    }

    if (techFilter.size > 0) {
      result = result.filter((p) => techFilter.has(p.technology || ''));
    }

    return result;
  }, [profiles, lightingFilters, techFilter]);

  // Toggle lighting
  const toggleLighting = (position: number) => {
    setLightingFilters((prev) => {
      const next = new Set(prev);
      if (position === -1) {
        return new Set();
      }
      next.delete(-1);
      next.has(position) ? next.delete(position) : next.add(position);
      return next;
    });
  };

  // Toggle tech
  const toggleTech = (tech: string) => {
    setTechFilter((prev) => {
      const next = new Set(prev);
      next.has(tech) ? next.delete(tech) : next.add(tech);
      return next;
    });
  };

  // Select profile
  const selectProfile = async (profile: Profile) => {
    setSelectedProfile(profile);
    setStep(1);
    setShowAddForm(false);
    setShowQuoteForm(false);
    setLoadingComponents(true);

    const { data } = await supabase
      .from('profile_components')
      .select('id, profile_id, component_id, layer_position, position_order, is_default, notes, components(component_name, material_category, sub_type, client_badge, client_description)')
      .eq('profile_id', profile.id)
      .order('position_order', { ascending: true });

    if (data) {
      const mapped: ProfileComponent[] = (data as any[]).map((pc) => ({
        id: pc.id,
        profile_id: pc.profile_id,
        component_id: pc.component_id,
        layer_position: pc.layer_position,
        position_order: pc.position_order,
        is_default: pc.is_default,
        notes: pc.notes,
        component_name: pc.components?.component_name || null,
        material_category: pc.components?.material_category || null,
        sub_type: pc.components?.sub_type || null,
        client_badge: pc.components?.client_badge || null,
        client_description: pc.components?.client_description || null,
      }));
      setComponents(mapped);
      setStep(2);
    }
    setLoadingComponents(false);

    // Task 4: Silent context — update store + chat session metadata
    useShellStore.getState().setLastProfileSelected(Date.now());
    const sessionId = localStorage.getItem('chat_session_id');
    if (sessionId) {
      supabase.from('chat_sessions').update({
        metadata: {
          selected_profile: profile.profile_code,
          profile_name: profile.profile_name,
          lighting_label: lightingCodeToLabel(profile.lighting_code),
          technology: profile.technology,
        }
      }).eq('id', sessionId).then(() => {});
    }
  };

  // Scroll helper
  const scrollTo = (zone: number) => {
    const refs = [zone0Ref, zone1Ref, zone2Ref];
    refs[zone]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Reset after save
  const handleSaved = () => {
    setSelectedProfile(null);
    setComponents([]);
    setStep(0);
    setShowAddForm(false);
    setShowQuoteForm(false);
    onSignSaved?.();
  };

  return (
    <div className="w-full space-y-3 font-sans">
      {/* Top row: Summary + Mode toggle */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <SummaryBar
            profile={selectedProfile?.profile_name || null}
            technology={selectedProfile?.technology || null}
            onScrollTo={scrollTo}
          />
        </div>
        {/* Upgrade 1: Pro / Client toggle */}
        <div className="flex rounded-md bg-secondary p-0.5 shrink-0">
          <button
            onClick={() => { setUiMode('pro'); localStorage.setItem('signmaker_ui_mode', 'pro'); }}
            className={`rounded px-2.5 py-1 text-[10px] font-semibold transition-colors ${
              uiMode === 'pro' ? 'bg-cfg-blue text-primary-foreground' : 'text-cfg-muted hover:text-foreground'
            }`}
          >
            Pro
          </button>
          <button
            onClick={() => { setUiMode('client'); localStorage.setItem('signmaker_ui_mode', 'client'); }}
            className={`rounded px-2.5 py-1 text-[10px] font-semibold transition-colors ${
              uiMode === 'client' ? 'bg-cfg-blue text-primary-foreground' : 'text-cfg-muted hover:text-foreground'
            }`}
          >
            Client
          </button>
        </div>
      </div>

      {/* Stepper */}
      <Stepper step={step} />

      {/* ZONE 1 — Compact Lighting Filter */}
      <div ref={zone0Ref} className="space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-cfg-muted mr-0.5">Light:</span>
          {LIGHTING_BUTTONS.map((btn) => {
            const active = btn.position === -1
              ? lightingFilters.size === 0
              : lightingFilters.has(btn.position);
            return (
              <button
                key={btn.label}
                onClick={() => toggleLighting(btn.position)}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                  active
                    ? 'bg-cfg-blue text-primary-foreground'
                    : 'bg-secondary text-cfg-muted hover:text-foreground'
                }`}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-cfg-muted mr-0.5">Tech:</span>
          {TECH_BUTTONS.map((tech) => {
            const active = techFilter.has(tech);
            return (
              <button
                key={tech}
                onClick={() => toggleTech(tech)}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                  active
                    ? 'bg-cfg-blue text-primary-foreground'
                    : 'bg-secondary text-cfg-muted hover:text-foreground'
                }`}
              >
                {tech}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Context Ribbon */}
      <ContextRibbon
        filteredCount={filteredProfiles.length}
        lightingFilters={lightingFilters}
        techFilter={techFilter}
        selectedProfile={selectedProfile}
      />

      {/* Height control */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-cfg-muted">Letter height</span>
        <input
          type="number"
          min={1}
          max={200}
          value={letterHeightInches}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v) && v > 0) setLetterHeightInches(v);
          }}
          className="w-14 rounded border border-input bg-background px-2 py-0.5 text-xs text-foreground text-center focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <span className="text-[10px] text-cfg-muted">in</span>
      </div>

      {/* ZONE 2 — Profile Grid */}
      <div ref={zone1Ref}>
        {loadingProfiles ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 rounded-lg shimmer-skeleton" />
            ))}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-cfg-muted">No profiles match</p>
            <button
              onClick={() => { setLightingFilters(new Set()); setTechFilter(new Set()); }}
              className="text-xs text-cfg-blue hover:underline mt-1"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {filteredProfiles.map((p) => (
              <ProfileCard
                key={p.id}
                profile={p}
                selected={selectedProfile?.id === p.id}
                onClick={() => selectProfile(p)}
                mode={uiMode}
                letterHeight={letterHeightInches}
              />
            ))}
          </div>
        )}
      </div>

      {/* ZONE 3 — Construction Stack */}
      {selectedProfile && (
        <div ref={zone2Ref} className="space-y-4">
          <p className="text-xs font-semibold text-foreground">
            Construction — {selectedProfile.profile_name}
          </p>

          {loadingComponents ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-lg shimmer-skeleton" />
              ))}
            </div>
          ) : (
            <ConstructionStack components={components} mode={uiMode} />
          )}

          {/* CTA Row */}
          {!showAddForm && !showQuoteForm && (
            <div className="flex justify-end">
              {activeProject ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="rounded-md bg-cfg-blue px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-cfg-blue/90 transition-colors"
                >
                  {editingSign ? 'Edit Sign Details' : 'Add to Project'}
                </button>
              ) : (
                <button
                  onClick={() => setShowQuoteForm(true)}
                  className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-cfg-muted hover:text-foreground transition-colors"
                >
                  Request Quote
                </button>
              )}
            </div>
          )}

          {/* Add Sign Form */}
          {showAddForm && activeProject && (
            <AddSignForm
              projectId={activeProject.id}
              projectName={activeProject.project_name}
              profileCode={selectedProfile.profile_code}
              technology={selectedProfile.technology}
              slotData={components.filter((c) => c.is_default !== false)}
              letterHeight={letterHeightInches}
              onHeightChange={setLetterHeightInches}
              onSaved={handleSaved}
              onCancel={() => setShowAddForm(false)}
              editingSign={editingSign}
            />
          )}

          {/* Explore Quote Form */}
          {showQuoteForm && !activeProject && (
            <ExploreQuoteForm
              profileCode={selectedProfile.profile_code}
              technology={selectedProfile.technology}
              slotData={components.filter((c) => c.is_default !== false)}
              onClose={() => setShowQuoteForm(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
