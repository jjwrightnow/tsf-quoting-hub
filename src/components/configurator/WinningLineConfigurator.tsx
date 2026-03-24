import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useShellStore, type PortalSign } from '@/stores/shellStore';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/* ─── Types ─── */
interface Profile {
  id: string;
  profile_code: string;
  profile_name: string;
  display_name: string | null;
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

interface LightingStyle {
  lighting_code: string;
  display_name: string;
  sku_label: string;
  thumbnail_url: string | null;
  hover_description: string | null;
  sort_order: number;
}

interface TechClass {
  code: string;
  display_name: string;
  short_name: string;
  materials: string;
  price_tier: string;
  hover_description: string;
  thumbnail_url: string | null;
  sort_order: number;
}

interface WinningLineConfiguratorProps {
  activeProject?: { id: string; project_name: string } | null;
  editingSign?: PortalSign | null;
  onSignSaved?: () => void;
}

type UiMode = 'pro' | 'client';

/* ─── Constants ─── */
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

/* ─── Client mode mappings ─── */
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

/* ─── Scale silhouette SVG ─── */
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

/* ─── Breadcrumb ─── */
function ConfiguratorBreadcrumb({
  browseStep,
  selectedTech,
  selectedLighting,
  selectedProfile,
  techClasses,
  lightingStyles,
  onClickTech,
  onClickLighting,
  onClickProfile,
}: {
  browseStep: number;
  selectedTech: string | null;
  selectedLighting: string | null;
  selectedProfile: Profile | null;
  techClasses: TechClass[];
  lightingStyles: LightingStyle[];
  onClickTech: () => void;
  onClickLighting: () => void;
  onClickProfile: () => void;
}) {
  const crumbs = [
    {
      label: selectedTech
        ? (techClasses.find(t => t.code === selectedTech)?.short_name || selectedTech)
        : 'Technology',
      active: browseStep >= 0,
      done: browseStep > 0 || !!selectedProfile,
      onClick: onClickTech,
    },
    {
      label: selectedLighting
        ? (lightingStyles.find(s => s.lighting_code === selectedLighting)?.display_name || selectedLighting)
        : 'Lighting',
      active: browseStep >= 1,
      done: browseStep > 1 || !!selectedProfile,
      onClick: onClickLighting,
    },
    {
      label: selectedProfile
        ? (selectedProfile.display_name || selectedProfile.profile_name)
        : 'Profile',
      active: browseStep >= 2,
      done: !!selectedProfile,
      onClick: onClickProfile,
    },
    {
      label: 'Configure',
      active: !!selectedProfile,
      done: false,
      onClick: () => {},
    },
  ];

  return (
    <div className="flex items-center gap-1 text-[11px] font-medium overflow-x-auto">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1 whitespace-nowrap">
          {i > 0 && <span className="text-muted-foreground mx-0.5">›</span>}
          <button
            onClick={c.done ? c.onClick : undefined}
            className={`transition-colors ${
              c.active
                ? c.done
                  ? 'text-primary hover:underline cursor-pointer'
                  : 'text-foreground font-semibold'
                : 'text-muted-foreground cursor-default'
            }`}
            disabled={!c.done}
          >
            {c.label}
          </button>
        </span>
      ))}
    </div>
  );
}

/* ─── Tech Placeholder ─── */
const TECH_COLORS: Record<string, { bg: string; accent: string; label: string }> = {
  PF: { bg: '#1a1a2e', accent: '#c0c0c0', label: 'Premium Metal' },
  SF: { bg: '#1a1a2e', accent: '#9ca3af', label: 'Standard Metal' },
  AF: { bg: '#1a1a2e', accent: '#3b82f6', label: 'Acrylic Face' },
  SA: { bg: '#1a1a2e', accent: '#06b6d4', label: 'Solid Acrylic' },
  FC: { bg: '#1a1a2e', accent: '#f59e0b', label: 'Flat Cut' },
};

function TechPlaceholder({ technology }: { technology: string | null }) {
  const t = TECH_COLORS[technology || ''] || { bg: '#1a1a2e', accent: '#6b7280', label: technology || '—' };
  return (
    <div style={{ background: t.bg }} className="w-full h-full flex flex-col items-center justify-center gap-2">
      <span style={{ color: t.accent, textShadow: `0 0 20px ${t.accent}40` }}
        className="text-[56px] font-bold leading-none select-none">
        A
      </span>
      <span style={{ color: t.accent }} className="text-[9px] font-medium uppercase tracking-widest opacity-60">
        {t.label}
      </span>
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
            alt={profile.display_name || profile.profile_name}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <TechPlaceholder technology={profile.technology} />
        )}
      </div>
      <p className="text-sm font-semibold text-foreground truncate">{profile.display_name || profile.profile_name}</p>
      <div className="absolute bottom-1 right-1">
        <ScaleSilhouette heightInches={letterHeight} />
      </div>
    </button>
  );
}

/* ─── Material Color Function ─── */
const getMaterialColor = (category: string): string => {
  const colors: Record<string, string> = {
    'metal': '#1e2a3a',
    'acrylic': '#0e2a2e',
    'LED': '#1a1a0e',
    'wire/electrical': '#1a0e2e',
    'hardware': '#1e1e1e',
    'neon flex': '#2a0e2e',
    'adhesive': '#2a1a0e',
    'paint': '#1a2a1a',
    'PVC': '#2a2a1a',
    'vinyl': '#2a1a2a',
  };
  return colors[category] || '#1a1a2e';
};

/* ─── Construction Stack ─── */
function ConstructionStack({ components, mode }: { components: ProfileComponent[]; mode: UiMode }) {
  const isClientMode = mode === 'client';

  const displayPosition = (pos: string) =>
    isClientMode ? (CLIENT_LAYER_LABELS[pos] || pos) : pos;

  const displayName = (name: string | null) =>
    isClientMode ? clientComponentName(name) : (name || 'Unknown');

  // Order components by position_order ascending, filter defaults only
  const orderedComponents = useMemo(() => {
    return components
      .filter((c) => c.is_default !== false)
      .sort((a, b) => a.position_order - b.position_order);
  }, [components]);

  return (
    <div className="overflow-x-auto animate-fade-in-up">
      <div className="flex items-stretch min-h-[120px]">
        {orderedComponents.map((component, index) => (
          <div key={component.id} className="flex flex-col items-center relative">
            {/* Connector arrow between slices */}
            {index > 0 && (
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-[#3b82f6] text-xs">→</div>
            )}
            {/* Layer slice */}
            <div
              className="flex flex-col items-center justify-center px-3 py-4 min-w-[80px] max-w-[100px] border-r border-[#2a2a40] text-center"
              style={{ background: getMaterialColor(component.material_category || '') }}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/60 mb-1">
                {displayPosition(component.layer_position)}
              </span>
              <span className="text-[11px] font-semibold text-white leading-tight">
                {isClientMode ? (component.client_badge || displayName(component.component_name)) : displayName(component.component_name)}
              </span>
              {isClientMode && component.client_description && (
                <span className="text-[9px] text-white/50 mt-1 leading-tight">{component.client_description}</span>
              )}
            </div>
          </div>
        ))}
      </div>
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

  useEffect(() => {
    useShellStore.getState().setAddSignFormOpen(true);
    return () => { useShellStore.getState().setAddSignFormOpen(false); };
  }, []);

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

/* ─── AI Context Ribbon ─── */
function ContextRibbon({
  filteredCount,
  lightingCodeFilters,
  techFilter,
  selectedProfile,
  lightingStyles,
  techClasses,
}: {
  filteredCount: number;
  lightingCodeFilters: Set<string>;
  techFilter: Set<string>;
  selectedProfile: Profile | null;
  lightingStyles: LightingStyle[];
  techClasses: TechClass[];
}) {
  const text = useMemo(() => {
    if (selectedProfile) {
      const matchingStyle = lightingStyles.find(s => s.lighting_code === selectedProfile.lighting_code);
      const lightingLabel = matchingStyle?.display_name || lightingCodeToLabel(selectedProfile.lighting_code);
      return `Selected: ${selectedProfile.display_name || selectedProfile.profile_name} — ${lightingLabel}`;
    }

    const parts: string[] = [];

    if (techFilter.size > 0) {
      const techLabels = Array.from(techFilter).map(code => {
        const tc = techClasses.find(t => t.code === code);
        return tc?.short_name || code;
      });
      parts.push(techLabels.join(' / '));
    }

    if (lightingCodeFilters.size > 0) {
      const lightingLabels = Array.from(lightingCodeFilters).map(code => {
        const style = lightingStyles.find(s => s.lighting_code === code);
        return style?.display_name || code;
      });
      parts.push(lightingLabels.join(' + '));
    }

    if (parts.length === 0) {
      return 'Select a lighting style above to begin';
    }

    return `${parts.join(' ')} — ${filteredCount} profiles`;
  }, [filteredCount, lightingCodeFilters, techFilter, selectedProfile, lightingStyles, techClasses]);

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
  const [lightingStyles, setLightingStyles] = useState<LightingStyle[]>([]);
  const [techClasses, setTechClasses] = useState<TechClass[]>([]);

  // Filters — single selection for progressive flow
  const [lightingCodeFilters, setLightingCodeFilters] = useState<Set<string>>(new Set<string>());
  const [techFilter, setTechFilter] = useState<Set<string>>(new Set<string>());
  const [selectedTechCode, setSelectedTechCode] = useState<string | null>(null);
  const [selectedLightingCode, setSelectedLightingCode] = useState<string | null>(null);

  // Selection
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [components, setComponents] = useState<ProfileComponent[]>([]);
  const [loadingComponents, setLoadingComponents] = useState(false);

  // Browse step: 0=tech, 1=lighting, 2=profile
  const [browseStep, setBrowseStep] = useState(0);

  // CTA
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  // UI mode
  const [uiMode, setUiMode] = useState<UiMode>(
    () => (localStorage.getItem('signmaker_ui_mode') as UiMode) || 'pro'
  );

  // Letter height
  const [letterHeightInches, setLetterHeightInches] = useState(12);

  // Refs for scrolling
  const zone0Ref = useRef<HTMLDivElement>(null);
  const zone1Ref = useRef<HTMLDivElement>(null);
  const zone2Ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch profiles + lighting styles
  useEffect(() => {
    (async () => {
      try {
        const [profilesRes, lightingRes, techRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('is_active', true)
            .order('profile_code', { ascending: true }),
          supabase
            .from('lighting_styles')
            .select('lighting_code, display_name, sku_label, thumbnail_url, hover_description, sort_order')
            .eq('is_active', true)
            .order('sort_order'),
          supabase
            .from('technology_classes')
            .select('code, display_name, short_name, materials, price_tier, hover_description, thumbnail_url, sort_order')
            .eq('is_active', true)
            .order('sort_order'),
        ]);
        
        if (profilesRes.data) setProfiles(profilesRes.data as unknown as Profile[]);
        if (lightingRes.data) setLightingStyles(lightingRes.data as LightingStyle[]);
        if (techRes.data) setTechClasses(techRes.data as TechClass[]);
        
        if (profilesRes.error) {
          console.error('Failed to fetch profiles:', profilesRes.error);
          toast.error('Failed to load profiles');
        }
        if (lightingRes.error) {
          console.error('Failed to fetch lighting styles:', lightingRes.error);
        }
        if (techRes.error) {
          console.error('Failed to fetch technology classes:', techRes.error);
        }
      } catch (error) {
        console.error('Error fetching configurator data:', error);
        toast.error('Failed to load configurator data');
      } finally {
        setLoadingProfiles(false);
      }
    })();
  }, []);

  // Edit mode: auto-select profile when editingSign changes
  useEffect(() => {
    if (!editingSign || profiles.length === 0) return;
    const match = profiles.find(p => p.profile_code === editingSign.profile_code);
    if (match) selectProfile(match).then(() => setShowAddForm(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSign, profiles]);

  // Filter logic — direct lighting_code matching
  const filteredProfiles = useMemo(() => {
    let result = profiles;

    if (lightingCodeFilters.size > 0) {
      result = result.filter(p => lightingCodeFilters.has(p.lighting_code));
    }

    if (techFilter.size > 0) {
      result = result.filter((p) => techFilter.has(p.technology || ''));
    }

    return result;
  }, [profiles, lightingCodeFilters, techFilter]);

  // Toggle lighting code
  const toggleLightingCode = (code: string) => {
    setLightingCodeFilters((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  // Helper: check if a lighting code is active
  const isLightingCodeActive = (code: string) => lightingCodeFilters.has(code);

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
    setBrowseStep(3);
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
      setBrowseStep(3);
    }
    setLoadingComponents(false);

    // Silent context — update store + chat session metadata
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
    setBrowseStep(0);
    setSelectedTechCode(null);
    setSelectedLightingCode(null);
    setTechFilter(new Set());
    setLightingCodeFilters(new Set());
    setShowAddForm(false);
    setShowQuoteForm(false);
    onSignSaved?.();
  };

  // Back to browse
  const handleBackToBrowse = () => {
    setSelectedProfile(null);
    setComponents([]);
    setStep(0);
    setShowAddForm(false);
    setShowQuoteForm(false);
    containerRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  };

  const isProfileSelected = !!selectedProfile;

  return (
    <div ref={containerRef} className="w-full font-sans">
      {/* ── Persistent top bar: Summary + Mode toggle ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div className="flex-1 min-w-0">
          <SummaryBar
            profile={selectedProfile?.display_name || selectedProfile?.profile_name || null}
            technology={selectedProfile?.technology || null}
            onScrollTo={scrollTo}
          />
        </div>
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

      {/* ════════════════════════════════════════════
          VIEW A — Browse Mode (no profile selected)
          ════════════════════════════════════════════ */}
      {!isProfileSelected && (
        <div>
          {/* SECTION 1 — Lighting & Tech Filters */}
          <div ref={zone0Ref} className="px-4 py-4 border-b border-border bg-[#0f0f1a]">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-[#1e1e35] text-[#3b82f6] text-xs font-bold shrink-0">1</span>
              <h2 className="text-sm font-semibold text-foreground">Choose a Lighting Style</h2>
            </div>

            {/* Lighting Style label */}
            <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">Lighting Style</p>

            {/* Lighting Style thumbnail grid */}
            <TooltipProvider>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5 mb-4">
                {/* Show All reset button */}
                <button
                  onClick={() => setLightingCodeFilters(new Set())}
                  className={`flex flex-col items-center rounded-lg border overflow-hidden transition-all cursor-pointer
                    ${lightingCodeFilters.size === 0
                      ? 'border-[#3b82f6] ring-1 ring-[#3b82f6] bg-[#3b82f6]/10'
                      : 'border-[#2a2a40] bg-[#1a1a2e] hover:border-[#3b82f6]/40'
                    }`}
                >
                  <div className="w-full aspect-square bg-[#151525] overflow-hidden flex items-center justify-center">
                    <span className={`text-xl font-bold ${lightingCodeFilters.size === 0 ? 'text-[#3b82f6]' : 'text-[#374151]'}`}>✦</span>
                  </div>
                  <div className="px-1 py-1 w-full text-center">
                    <div className={`text-[8px] font-medium leading-tight ${lightingCodeFilters.size === 0 ? 'text-[#3b82f6]' : 'text-[#9ca3af]'}`}>All</div>
                    <div className="text-[7px] text-[#4b5563]">&nbsp;</div>
                  </div>
                </button>
                {(lightingStyles || []).map((style) => {
                  const active = isLightingCodeActive(style.lighting_code);
                  return (
                    <Tooltip key={style.lighting_code}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => toggleLightingCode(style.lighting_code)}
                          className={`flex flex-col items-center rounded-lg border overflow-hidden transition-all cursor-pointer
                            ${active
                              ? 'border-[#3b82f6] ring-1 ring-[#3b82f6] bg-[#3b82f6]/10'
                              : 'border-[#2a2a40] bg-[#1a1a2e] hover:border-[#3b82f6]/40'
                            }`}
                        >
                          <div className="w-full aspect-square bg-[#151525] overflow-hidden">
                            {style.thumbnail_url ? (
                              <img src={style.thumbnail_url} alt={style.display_name}
                                className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className={`text-xl font-bold ${active ? 'text-[#3b82f6]' : 'text-[#374151]'}`}>A</span>
                              </div>
                            )}
                          </div>
                          <div className="px-1 py-1 w-full text-center">
                            <div className={`text-[8px] font-medium leading-tight truncate ${active ? 'text-[#3b82f6]' : 'text-[#9ca3af]'}`}>
                              {style.display_name}
                            </div>
                            <div className="text-[7px] text-[#4b5563]">{style.sku_label}</div>
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[200px] text-xs text-center">
                        <p className="font-semibold mb-0.5">{style.display_name}</p>
                        <p className="text-muted-foreground">{style.hover_description}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>

            {/* Construction (Technology) section */}
            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">Construction</p>

              <TooltipProvider>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(techClasses || []).map((tech) => {
                    const active = techFilter.has(tech.code);
                    return (
                      <Tooltip key={tech.code}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => toggleTech(tech.code)}
                            className={`relative flex flex-col items-center justify-end rounded-lg border overflow-hidden transition-all w-[72px]
                              ${active ? 'border-[#3b82f6] ring-1 ring-[#3b82f6]' : 'border-[#2a2a40] bg-[#1a1a2e] hover:border-[#3b82f6]/40'}`}
                          >
                            <div className="w-full aspect-square bg-[#151525] overflow-hidden">
                              {tech.thumbnail_url ? (
                                <img src={tech.thumbnail_url} alt={tech.short_name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className={`text-2xl font-bold ${active ? 'text-[#3b82f6]' : 'text-[#374151]'}`}>A</span>
                                </div>
                              )}
                            </div>
                            <div className="w-full px-1 py-1 text-center">
                              <div className={`text-[8px] font-semibold leading-tight truncate ${active ? 'text-[#3b82f6]' : 'text-[#9ca3af]'}`}>
                                {tech.short_name}
                              </div>
                              <div className={`text-[8px] font-medium ${active ? 'text-[#3b82f6]/70' : 'text-[#4b5563]'}`}>
                                {tech.price_tier}
                              </div>
                            </div>
                            {active && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[220px] text-xs">
                          <p className="font-semibold mb-0.5">{tech.display_name} — {tech.price_tier}</p>
                          <p className="text-muted-foreground text-[10px]">{tech.materials}</p>
                          <p className="text-muted-foreground mt-1">{tech.hover_description}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
            </div>

            <div className="mt-2">
              <ContextRibbon
                filteredCount={filteredProfiles.length}
                lightingCodeFilters={lightingCodeFilters}
                techFilter={techFilter}
                selectedProfile={null}
                lightingStyles={lightingStyles}
                techClasses={techClasses}
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
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
          </div>

          {/* SECTION 2 — Profile Grid */}
          <div ref={zone1Ref} className="px-4 py-4 border-b border-border bg-[#13131f]">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-[#1e1e35] text-[#3b82f6] text-xs font-bold shrink-0">2</span>
              <h2 className="text-sm font-semibold text-foreground">Select a Profile</h2>
            </div>
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
                  onClick={() => { setLightingCodeFilters(new Set()); setTechFilter(new Set()); }}
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
                    selected={false}
                    onClick={() => selectProfile(p)}
                    mode={uiMode}
                    letterHeight={letterHeightInches}
                  />
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3 — Review placeholder */}
          <div ref={zone2Ref} className="px-4 py-4 opacity-40 bg-[#0f0f1a]">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-[#1e1e35] text-[#3b82f6] text-xs font-bold shrink-0">3</span>
              <h2 className="text-sm font-semibold text-foreground">Review and Build</h2>
            </div>
            <p className="text-sm text-cfg-muted">Select a profile above to see how it's built.</p>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          VIEW B — Profile Selected Mode
          ════════════════════════════════════════════ */}
      {isProfileSelected && (
        <div>
          {/* Back bar */}
          <div className="flex items-center justify-between bg-card border-b border-border px-4 py-2">
            <button
              onClick={handleBackToBrowse}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="text-base">←</span>
              <span>Back to all profiles</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {selectedProfile.display_name || selectedProfile.profile_name}
              </span>
              {selectedProfile.technology && (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-cfg-muted">
                  {selectedProfile.technology}
                </span>
              )}
            </div>
          </div>

          {/* Profile detail header */}
          <div className="px-4 py-4 border-b border-border bg-[#13131f]">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left: illustration */}
              <div className="w-full md:w-[200px] h-[200px] rounded-lg bg-secondary/40 overflow-hidden shrink-0">
                {selectedProfile.illustration_url ? (
                  <img
                    src={selectedProfile.illustration_url}
                    alt={selectedProfile.display_name || selectedProfile.profile_name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <TechPlaceholder technology={selectedProfile.technology} />
                )}
              </div>
              {/* Right: metadata */}
              <div className="flex flex-col justify-center gap-2 min-w-0">
                <h2 className="text-lg font-semibold text-foreground">
                  {selectedProfile.display_name || selectedProfile.profile_name}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedProfile.technology && (
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-cfg-muted">
                      {selectedProfile.technology}
                    </span>
                  )}
                  {(() => {
                    const tier = PRICE_TIER[selectedProfile.technology || 'Standard'] || PRICE_TIER.Standard;
                    return (
                      <span className={`text-xs font-bold ${tier.color}`}>{tier.label}</span>
                    );
                  })()}
                </div>
                <p className="text-xs text-cfg-muted">
                  {(() => {
                    const matchingStyle = lightingStyles.find(s => s.lighting_code === selectedProfile.lighting_code);
                    return matchingStyle?.display_name || lightingCodeToLabel(selectedProfile.lighting_code);
                  })()}
                </p>
                <div className="flex items-center gap-2 mt-1">
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
                  <ScaleSilhouette heightInches={letterHeightInches} />
                </div>
              </div>
            </div>
          </div>

          {/* Construction Stack */}
          <div className="px-4 py-4 border-b border-border bg-[#0f0f1a]">
            <p className="text-sm font-semibold text-foreground mb-3 pb-2 border-b border-border">
              What's inside this letter
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
          </div>

          {/* CTA */}
          <div className="px-4 py-4 bg-[#13131f]">
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

            {showQuoteForm && !activeProject && (
              <ExploreQuoteForm
                profileCode={selectedProfile.profile_code}
                technology={selectedProfile.technology}
                slotData={components.filter((c) => c.is_default !== false)}
                onClose={() => setShowQuoteForm(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
