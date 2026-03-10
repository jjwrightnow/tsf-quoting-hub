import { useEffect, useState, useCallback } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getQuotePortal } from '@/lib/supabase-functions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { RefreshCw } from 'lucide-react';
import SpecOptionsEditor from '@/components/admin/SpecOptionsEditor';

const ADMIN_EMAILS = ['jj@thesignagefactory.co'];

function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}

interface Submission {
  id: string;
  created_at: string;
  sync_status: string;
  airtable_record_id: string | null;
  payload: Record<string, any>;
  error_detail: string | null;
  retry_count: number;
  company_name: string;
}

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
    synced: { label: 'Synced', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    error: { label: 'Error', className: 'bg-red-500/20 text-red-300 border-red-500/30' },
  };
  const s = map[status] || { label: status, className: '' };
  return <Badge variant="outline" className={s.className}>{s.label}</Badge>;
};

const formatDate = (iso: string) => {
  try {
    return format(new Date(iso), "MMM d, yyyy h:mmaaa");
  } catch {
    return iso;
  }
};

const Admin = () => {
  const { session, loading: authLoading, signOut } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'queue';

  const email = session?.user?.email;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getQuotePortal({ action: 'list_all' } as any);
      if (data?.submissions) {
        setSubmissions(data.submissions);
      }
      setLastRefresh(new Date());
    } catch (err) {
      console.error('[Admin] fetch error:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!session || !isAdmin(email)) return;
    if (activeTab === 'queue') {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [session, email, fetchData, activeTab]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  if (!isAdmin(email)) return <Navigate to="/" replace />;

  const today = new Date().toDateString();
  const todayCount = submissions.filter((s) => new Date(s.created_at).toDateString() === today).length;
  const pendingCount = submissions.filter((s) => s.sync_status === 'pending').length;
  const errorCount = submissions.filter((s) => s.sync_status === 'error').length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <h1 className="text-xl font-bold tracking-tight">TSF Admin</h1>
        <div className="flex items-center gap-3">
          {activeTab === 'queue' && (
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          <button onClick={signOut} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        <Tabs value={activeTab} onValueChange={(v) => setSearchParams({ tab: v })}>
          <TabsList>
            <TabsTrigger value="queue">Submission Queue</TabsTrigger>
            <TabsTrigger value="spec-options">Spec Options</TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="space-y-6 mt-4">
            {/* Summary strip */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card><CardContent className="py-4 px-5">
                <p className="text-xs text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">{todayCount}</p>
              </CardContent></Card>
              <Card><CardContent className="py-4 px-5">
                <p className="text-xs text-muted-foreground">Pending Sync</p>
                <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
              </CardContent></Card>
              <Card><CardContent className="py-4 px-5">
                <p className="text-xs text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-red-400">{errorCount}</p>
              </CardContent></Card>
              <Card><CardContent className="py-4 px-5">
                <p className="text-xs text-muted-foreground">Last Refresh</p>
                <p className="text-sm font-medium">{lastRefresh ? format(lastRefresh, 'h:mm:ss a') : '—'}</p>
              </CardContent></Card>
            </div>

            {/* Table */}
            {loading && submissions.length === 0 ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Profile</TableHead>
                      <TableHead>Illumination</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Airtable Record</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                          No submissions found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      submissions.map((s) => {
                        const p = s.payload || {};
                        return (
                          <TableRow key={s.id}>
                            <TableCell className="whitespace-nowrap text-xs">{formatDate(s.created_at)}</TableCell>
                            <TableCell className="text-xs">{s.company_name}</TableCell>
                            <TableCell className="text-xs">{p.projectName || p.project_name || '—'}</TableCell>
                            <TableCell className="text-xs">{p.profile || p.profileType || '—'}</TableCell>
                            <TableCell className="text-xs">{p.illumination || p.illuminationStyle || '—'}</TableCell>
                            <TableCell>{statusBadge(s.sync_status)}</TableCell>
                            <TableCell className="text-xs">
                              {s.airtable_record_id ? (
                                <span className="text-emerald-400">✓ Synced</span>
                              ) : (
                                <span className="text-muted-foreground">Pending</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {(s.sync_status === 'error' || s.sync_status === 'pending') && (
                                <Button variant="outline" size="sm" className="text-xs h-7">
                                  Retry Sync
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="spec-options" className="mt-4">
            <SpecOptionsEditor />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
