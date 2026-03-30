import { useRef, useState } from 'react';
import { Upload, FolderOpen, Plus } from 'lucide-react';
import { useSignStore } from '@/stores/signStore';
import { useShellStore } from '@/stores/shellStore';
import { useAppStore } from '@/stores/appStore';
import { supabase } from '@/integrations/supabase/client';
import { createReviewSession } from '@/lib/review-functions';

const WelcomeLanding = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const setChatPhase = useSignStore((s) => s.setChatPhase);
  const setSessionId = useSignStore((s) => s.setSessionId);
  const addUploadedFile = useSignStore((s) => s.addUploadedFile);
  const sessionId = useSignStore((s) => s.sessionId);

  const projects = useShellStore((s) => s.projects);
  const setActiveProject = useShellStore((s) => s.setActiveProject);

  const setWizardActive = useAppStore((s) => s.setWizardActive);
  const userTier = useAppStore((s) => s.userTier);

  const ensureSession = async (): Promise<string> => {
    if (sessionId) return sessionId;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');
    const email = session.user.email || '';
    const result = await createReviewSession({
      customer_name: email.split('@')[0],
      customer_email: email,
      account_id: '',
      artwork_paths: [],
    });
    const id = result?.id;
    if (!id) throw new Error('Failed to create session');
    setSessionId(id);
    localStorage.setItem('chat_session_id', id);
    return id;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadError(null);
    setUploading(true);

    try {
      const sid = await ensureSession();
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop() || 'bin';
        const uuid = crypto.randomUUID();
        const filePath = `reviews/${sid}/${uuid}.${ext}`;

        const { error } = await supabase.storage
          .from('intake-assets')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (error) {
          console.error('Upload error:', error);
          setUploadError(`Upload failed: ${error.message}`);
          continue;
        }
        addUploadedFile({ name: file.name, path: filePath });
      }

      const currentFiles = useSignStore.getState().uploadedFiles;
      if (currentFiles.length === 0) {
        if (!uploadError) setUploadError('No files were uploaded successfully.');
        setUploading(false);
        return;
      }
      await supabase
        .from('review_sessions')
        .update({ artwork_paths: currentFiles.map((f) => f.path) })
        .eq('id', sid);

      setChatPhase('post_upload');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Upload flow error:', err);
      setUploadError(`Upload failed: ${msg}`);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleNewProject = () => {
    setWizardActive(true);
  };

  // Only show for authenticated users (tier 2)
  if (userTier < 2) return null;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.03,
        }}
      />

      <div className="relative z-10 w-full max-w-lg space-y-8">
        {/* Upload artwork — primary action */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="group w-full rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center transition-all duration-300 hover:border-primary hover:shadow-[0_0_30px_hsl(var(--primary)/0.12)] disabled:opacity-50"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
            <Upload size={28} />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">
            Upload Artwork
          </h2>
          <p className="text-sm text-muted-foreground">
            {uploading ? 'Uploading...' : 'PDF, PNG, JPG -- drop your files to get started'}
          </p>
        </button>

        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg"
          multiple
          onChange={handleUpload}
        />

        {uploadError && (
          <p className="text-sm text-destructive text-center">{uploadError}</p>
        )}

        {/* Start new project — secondary action */}
        <div className="text-center">
          <button
            onClick={handleNewProject}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <Plus size={14} />
            Start New Project
          </button>
        </div>

        {/* Existing projects */}
        {projects.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Recent Projects
            </h3>
            <div className="space-y-2">
              {projects.slice(0, 5).map((project) => (
                <button
                  key={project.id}
                  onClick={() => setActiveProject(project)}
                  className="w-full flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-all duration-200 hover:border-primary/50 hover:shadow-[0_0_12px_hsl(var(--primary)/0.08)]"
                >
                  <FolderOpen size={16} className="text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {project.project_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {project.status} {project.quote_ref ? `-- ${project.quote_ref}` : ''}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeLanding;
