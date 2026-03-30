import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AppShell } from '@/components/layout/AppShell';
import { ArrowLeft, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const PROFILE_OPTIONS = [
  { code: '0000', label: 'Non-Lit' },
  { code: '0001', label: 'Halo' },
  { code: '0010', label: 'Side Back' },
  { code: '0011', label: 'Side Back + Halo' },
  { code: '0100', label: 'Side Front' },
  { code: '0101', label: 'Side Front + Halo' },
  { code: '0110', label: 'Full Side' },
  { code: '0111', label: 'Full Side + Halo' },
  { code: '1000', label: 'Face Lit' },
  { code: '1001', label: 'Face + Halo' },
  { code: '1010', label: 'Face + Side Back' },
  { code: '1011', label: 'Face + Side Back + Halo' },
  { code: '1100', label: 'Face + Side Front' },
  { code: '1101', label: 'Face + Side Front + Halo' },
  { code: '1110', label: 'Face + Full Side' },
  { code: '1111', label: 'All Sides' },
] as const;

interface SignRow {
  id: string;
  sort_order: number;
  sign_name: string;
  profile_code: string | null;
  profile_type: string | null;
  metal_type: string | null;
  spec_data: Record<string, unknown> | null;
  // local edits
  localName: string;
  localProfileCode: string;
}

const ProjectOrganizer = () => {
  const { id } = useParams<{ id: string }>();
  const [projectName, setProjectName] = useState('');
  const [signs, setSigns] = useState<SignRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      const [projRes, signsRes] = await Promise.all([
        supabase.from('portal_projects').select('project_name').eq('id', id).single(),
        supabase
          .from('portal_signs')
          .select('id, sort_order, sign_name, profile_code, profile_type, metal_type, spec_data')
          .eq('project_id', id)
          .order('sort_order'),
      ]);

      if (projRes.data) setProjectName(projRes.data.project_name);

      if (signsRes.data) {
        setSigns(
          signsRes.data.map((s) => ({
            ...s,
            spec_data: s.spec_data as Record<string, unknown> | null,
            localName: s.sign_name,
            localProfileCode: s.profile_code || '',
          }))
        );
      }

      setLoading(false);
    };

    load();
  }, [id]);

  const updateLocalName = (signId: string, value: string) => {
    setSigns((prev) => prev.map((s) => (s.id === signId ? { ...s, localName: value } : s)));
  };

  const updateLocalProfile = (signId: string, value: string) => {
    setSigns((prev) => prev.map((s) => (s.id === signId ? { ...s, localProfileCode: value } : s)));
  };

  return (
    <AppShell>
      <div className="flex flex-col h-full">
        {/* Sub-header */}
        <div className="h-11 flex-shrink-0 flex items-center gap-3 px-4 border-b border-border bg-card">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <h1 className="text-sm font-semibold text-foreground truncate">
            {loading ? 'Loading…' : projectName}
          </h1>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead className="w-16">Page</TableHead>
                  <TableHead className="w-20">Preview</TableHead>
                  <TableHead className="min-w-[180px]">Sign Name</TableHead>
                  <TableHead className="min-w-[220px]">Profile Type</TableHead>
                  <TableHead className="min-w-[120px]">Material</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signs.map((sign) => {
                  const pagePdfUrl = (sign.spec_data as Record<string, unknown>)?.page_pdf_url as string | undefined;

                  return (
                    <TableRow key={sign.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {sign.sort_order}
                      </TableCell>
                      <TableCell>
                        {pagePdfUrl ? (
                          <a
                            href={pagePdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors"
                            title="Open PDF page"
                          >
                            <FileText size={18} />
                          </a>
                        ) : (
                          <FileText size={18} className="text-muted-foreground/40" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          value={sign.localName}
                          onChange={(e) => updateLocalName(sign.id, e.target.value)}
                          className="h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={sign.localProfileCode}
                          onValueChange={(v) => updateLocalProfile(sign.id, v)}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Select profile…" />
                          </SelectTrigger>
                          <SelectContent>
                            {PROFILE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.code} value={opt.code}>
                                {opt.label} ({opt.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {sign.metal_type || '—'}
                      </TableCell>
                      <TableCell>
                        {sign.profile_code ? (
                          <Badge className="bg-green-500/15 text-green-700 border-green-500/30 hover:bg-green-500/15">
                            Configured
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500/15 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/15">
                            Needs Profile
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default ProjectOrganizer;
