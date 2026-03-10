import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronUp, ChevronDown, X, Plus, Save, Check } from 'lucide-react';
import { toast } from 'sonner';

interface SpecOption {
  id: string;
  profile_type: string;
  field_name: string;
  label: string;
  options: string[];
  sort_order: number;
  required: boolean;
}

const SpecOptionsEditor = () => {
  const [allOptions, setAllOptions] = useState<SpecOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [newOptionInputs, setNewOptionInputs] = useState<Record<string, string>>({});

  const fetchOptions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('spec_options')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Failed to fetch spec_options:', error);
      toast.error('Failed to load spec options');
    } else {
      setAllOptions(
        (data || []).map((row) => ({
          ...row,
          options: Array.isArray(row.options) ? (row.options as string[]) : [],
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const profileTypes = [...new Set(allOptions.map((o) => o.profile_type))];

  const markDirty = (id: string) => {
    setDirty((prev) => new Set(prev).add(id));
  };

  const updateField = (id: string, updates: Partial<SpecOption>) => {
    setAllOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
    markDirty(id);
  };

  const moveOption = (id: string, optIndex: number, direction: -1 | 1) => {
    setAllOptions((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const newOpts = [...o.options];
        const swapIndex = optIndex + direction;
        if (swapIndex < 0 || swapIndex >= newOpts.length) return o;
        [newOpts[optIndex], newOpts[swapIndex]] = [newOpts[swapIndex], newOpts[optIndex]];
        return { ...o, options: newOpts };
      })
    );
    markDirty(id);
  };

  const removeOption = (id: string, optIndex: number) => {
    setAllOptions((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        return { ...o, options: o.options.filter((_, i) => i !== optIndex) };
      })
    );
    markDirty(id);
  };

  const addOption = (id: string) => {
    const value = (newOptionInputs[id] || '').trim();
    if (!value) return;
    setAllOptions((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        if (o.options.includes(value)) return o;
        return { ...o, options: [...o.options, value] };
      })
    );
    setNewOptionInputs((prev) => ({ ...prev, [id]: '' }));
    markDirty(id);
  };

  const handleSave = async (spec: SpecOption) => {
    setSaving((prev) => new Set(prev).add(spec.id));
    const { error } = await supabase
      .from('spec_options')
      .upsert({
        id: spec.id,
        profile_type: spec.profile_type,
        field_name: spec.field_name,
        label: spec.label,
        options: spec.options as unknown as any,
        sort_order: spec.sort_order,
        required: spec.required,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'profile_type,field_name' });

    if (error) {
      console.error('Save error:', error);
      toast.error(`Failed to save ${spec.label}`);
    } else {
      toast.success(`${spec.label} saved`);
      setDirty((prev) => {
        const next = new Set(prev);
        next.delete(spec.id);
        return next;
      });
    }
    setSaving((prev) => {
      const next = new Set(prev);
      next.delete(spec.id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  return (
    <Tabs defaultValue={profileTypes[0] || ''}>
      <TabsList className="flex-wrap h-auto gap-1">
        {profileTypes.map((pt) => (
          <TabsTrigger key={pt} value={pt} className="text-xs">
            {pt}
          </TabsTrigger>
        ))}
      </TabsList>

      {profileTypes.map((pt) => {
        const fields = allOptions.filter((o) => o.profile_type === pt);
        return (
          <TabsContent key={pt} value={pt} className="space-y-4 mt-4">
            {fields.map((spec) => {
              const isDirty = dirty.has(spec.id);
              const isSaving = saving.has(spec.id);

              return (
                <Card key={spec.id}>
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Input
                          value={spec.label}
                          onChange={(e) => updateField(spec.id, { label: e.target.value })}
                          className="h-8 w-48 text-sm font-medium"
                        />
                        <span className="text-xs text-muted-foreground font-mono">{spec.field_name}</span>
                        {spec.required && (
                          <span className="text-[10px] bg-primary/10 text-primary rounded px-1.5 py-0.5">Required</span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant={isDirty ? 'default' : 'outline'}
                        disabled={!isDirty || isSaving}
                        onClick={() => handleSave(spec)}
                        className="h-7 text-xs"
                      >
                        {isSaving ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        ) : isDirty ? (
                          <><Save className="h-3 w-3 mr-1" /> Save</>
                        ) : (
                          <><Check className="h-3 w-3 mr-1" /> Saved</>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-0">
                    <div className="space-y-1">
                      {spec.options.map((opt, idx) => (
                        <div
                          key={`${opt}-${idx}`}
                          className="flex items-center gap-1.5 group"
                        >
                          <span className="flex-1 text-sm text-foreground bg-secondary rounded px-2.5 py-1.5">
                            {opt}
                          </span>
                          <button
                            onClick={() => moveOption(spec.id, idx, -1)}
                            disabled={idx === 0}
                            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => moveOption(spec.id, idx, 1)}
                            disabled={idx === spec.options.length - 1}
                            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => removeOption(spec.id, idx)}
                            className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        placeholder="Add option…"
                        value={newOptionInputs[spec.id] || ''}
                        onChange={(e) =>
                          setNewOptionInputs((prev) => ({ ...prev, [spec.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addOption(spec.id);
                        }}
                        className="h-8 text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addOption(spec.id)}
                        className="h-8"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export default SpecOptionsEditor;
