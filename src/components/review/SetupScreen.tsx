import { useEffect, useState, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { getCompanies, createReviewSession } from '@/lib/review-functions';
import { useReviewStore } from '@/stores/reviewStore';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';

interface Company {
  id: string;
  company_name: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  path: string | null;
  error: string | null;
}

const SetupScreen = () => {
  const [quoteNumber, setQuoteNumber] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [uploads, setUploads] = useState<UploadingFile[]>([]);
  const [creating, setCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const sessionId = useRef(crypto.randomUUID()).current;
  const setSession = useReviewStore((s) => s.setSession);
  const setArtworkFiles = useReviewStore((s) => s.setArtworkFiles);

  useEffect(() => {
    getCompanies().then(setCompanies).catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    if (!search) return companies;
    const q = search.toLowerCase();
    return companies.filter((c) => c.company_name.toLowerCase().includes(q));
  }, [companies, search]);

  const completedPaths = uploads.filter((u) => u.path).map((u) => u.path!);
  const canStart = !!selectedCompany && completedPaths.length > 0 && !creating;

  const uploadFile = async (file: File) => {
    const ext = file.name.split('.').pop();
    const filePath = `reviews/${sessionId}/${crypto.randomUUID()}.${ext}`;
    const entry: UploadingFile = { file, progress: 0, path: null, error: null };
    setUploads((prev) => [...prev, entry]);
    const idx = uploads.length;

    try {
      const { error } = await supabase.storage.from('intake-assets').upload(filePath, file);
      if (error) throw error;
      setUploads((prev) => prev.map((u, i) => (u.file === file ? { ...u, progress: 100, path: filePath } : u)));
    } catch (e: any) {
      setUploads((prev) => prev.map((u) => (u.file === file ? { ...u, error: e.message } : u)));
    }
  };

  const handleFiles = (files: FileList | File[]) => {
    const accepted = ['.pdf', '.png', '.jpg', '.jpeg'];
    Array.from(files).forEach((f) => {
      if (accepted.some((ext) => f.name.toLowerCase().endsWith(ext))) uploadFile(f);
    });
  };

  const removeUpload = (file: File) => {
    setUploads((prev) => prev.filter((u) => u.file !== file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleStart = async () => {
    if (!selectedCompany) return;
    setCreating(true);
    try {
      const res = await createReviewSession({
        pg_quote_number: quoteNumber || undefined,
        account_id: selectedCompany.id,
        customer_name: selectedCompany.company_name,
        artwork_paths: completedPaths,
      });
      setArtworkFiles(
        uploads.filter((u) => u.path).map((u) => ({
          name: u.file.name,
          path: u.path!,
          type: u.file.type,
        }))
      );
      setSession(res);
    } catch (e) {
      console.error(e);
      setCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-xl font-semibold text-foreground">New Artwork Review</h1>

        {/* Quote Number */}
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">PG Quote Number</label>
          <Input
            placeholder="Enter quote number (optional)"
            value={quoteNumber}
            onChange={(e) => setQuoteNumber(e.target.value)}
          />
        </div>

        {/* Company Search */}
        <div className="relative space-y-1.5">
          <label className="text-sm text-muted-foreground">Company</label>
          {selectedCompany ? (
            <div className="flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
              <span>{selectedCompany.company_name}</span>
              <button onClick={() => { setSelectedCompany(null); setSearch(''); }} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Input
                ref={searchInputRef}
                placeholder="Search company..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setDropdownOpen(true); }}
                onFocus={() => setDropdownOpen(true)}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
              />
              {dropdownOpen && filtered.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
                  {filtered.slice(0, 20).map((c) => (
                    <button
                      key={c.id}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { setSelectedCompany(c); setSearch(c.company_name); setDropdownOpen(false); }}
                    >
                      {c.company_name}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Upload Area */}
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">Upload Artwork</label>
          <div
            ref={dropRef}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed border-border p-6 text-muted-foreground transition-colors hover:border-primary"
          >
            <Upload className="h-8 w-8" />
            <span className="text-sm">Drop files here or click to browse</span>
            <span className="text-xs">.pdf, .png, .jpg accepted</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />

          {/* File List */}
          {uploads.length > 0 && (
            <div className="mt-2 space-y-2">
              {uploads.map((u, i) => (
                <div key={i} className="flex items-center gap-2 rounded-md border border-border bg-card p-2">
                  {u.file.type === 'application/pdf' ? (
                    <FileText className="h-5 w-5 shrink-0 text-primary" />
                  ) : (
                    <ImageIcon className="h-5 w-5 shrink-0 text-primary" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{u.file.name}</p>
                    {u.error ? (
                      <p className="text-xs text-destructive">{u.error}</p>
                    ) : u.path ? (
                      <p className="text-xs text-green-500">Uploaded</p>
                    ) : (
                      <Progress value={50} className="h-1" />
                    )}
                  </div>
                  <button onClick={() => removeUpload(u.file)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button onClick={handleStart} disabled={!canStart} className="w-full">
          {creating ? 'Creating…' : 'Start Review'}
        </Button>
      </div>
    </div>
  );
};

export default SetupScreen;
