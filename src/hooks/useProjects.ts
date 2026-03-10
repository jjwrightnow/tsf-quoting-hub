import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Project {
  id: string;
  user_email: string;
  name: string;
  quote_number: string | null;
  status: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sign {
  id: string;
  project_id: string;
  title: string;
  profile_type: string | null;
  spec_data: Record<string, unknown>;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useProjects(userEmail: string | undefined) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [signs, setSigns] = useState<Record<string, Sign[]>>({});
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!userEmail) return;
    setLoading(true);
    const { data } = await supabase
      .from('projects' as any)
      .select('*')
      .eq('user_email', userEmail)
      .order('name', { ascending: true });
    if (data) setProjects(data as unknown as Project[]);
    setLoading(false);
  }, [userEmail]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const fetchSigns = useCallback(async (projectId: string) => {
    const { data } = await supabase
      .from('signs' as any)
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true });
    if (data) {
      setSigns((prev) => ({ ...prev, [projectId]: data as unknown as Sign[] }));
    }
    return (data as unknown as Sign[]) || [];
  }, []);

  const createProject = useCallback(
    async (name: string) => {
      if (!userEmail) return null;
      const { data, error } = await supabase
        .from('projects' as any)
        .insert({ user_email: userEmail, name, status: 'draft' } as any)
        .select()
        .single();
      if (!error && data) {
        const project = data as unknown as Project;
        setProjects((prev) => [...prev, project].sort((a, b) => a.name.localeCompare(b.name)));
        return project;
      }
      return null;
    },
    [userEmail],
  );

  const updateProject = useCallback(
    async (id: string, updates: Partial<Project>) => {
      const { data } = await supabase
        .from('projects' as any)
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq('id', id)
        .select()
        .single();
      if (data) {
        const updated = data as unknown as Project;
        setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      }
    },
    [],
  );

  const deleteProject = useCallback(async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    await supabase.from('projects' as any).delete().eq('id', id);
  }, []);

  const createSign = useCallback(
    async (projectId: string, title = 'New Sign') => {
      const existing = signs[projectId] || [];
      const sortOrder = existing.length;
      const { data, error } = await supabase
        .from('signs' as any)
        .insert({ project_id: projectId, title, sort_order: sortOrder } as any)
        .select()
        .single();
      if (!error && data) {
        const sign = data as unknown as Sign;
        setSigns((prev) => ({
          ...prev,
          [projectId]: [...(prev[projectId] || []), sign],
        }));
        return sign;
      }
      return null;
    },
    [signs],
  );

  const updateSign = useCallback(
    async (signId: string, projectId: string, updates: Partial<Sign>) => {
      const { data } = await supabase
        .from('signs' as any)
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq('id', signId)
        .select()
        .single();
      if (data) {
        const updated = data as unknown as Sign;
        setSigns((prev) => ({
          ...prev,
          [projectId]: (prev[projectId] || []).map((s) =>
            s.id === signId ? updated : s,
          ),
        }));
      }
    },
    [],
  );

  const deleteSign = useCallback(
    async (signId: string, projectId: string) => {
      setSigns((prev) => ({
        ...prev,
        [projectId]: (prev[projectId] || []).filter((s) => s.id !== signId),
      }));
      await supabase.from('signs' as any).delete().eq('id', signId);
    },
    [],
  );

  return {
    projects,
    signs,
    loading,
    fetchProjects,
    fetchSigns,
    createProject,
    updateProject,
    deleteProject,
    createSign,
    updateSign,
    deleteSign,
  };
}
