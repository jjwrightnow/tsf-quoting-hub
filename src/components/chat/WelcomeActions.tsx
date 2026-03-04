import { useRef } from 'react';
import { useSignStore } from '@/stores/signStore';
import { supabase } from '@/integrations/supabase/client';
import { createReviewSession } from '@/lib/review-functions';

const WelcomeActions = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const setChatPhase = useSignStore((s) => s.setChatPhase);
  const setSessionId = useSignStore((s) => s.setSessionId);
  const addUploadedFile = useSignStore((s) => s.addUploadedFile);
  const sessionId = useSignStore((s) => s.sessionId);

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
    const id = result?.session_id || result?.id;
    if (!id) throw new Error('Failed to create session');
    setSessionId(id);
    return id;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const sid = await ensureSession();
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop() || 'bin';
        const uuid = crypto.randomUUID();
        const filePath = `uploads/${sid}/${uuid}.${ext}`;

        const { error } = await supabase.storage
          .from('intake-assets')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (error) {
          console.error('Upload error:', error);
          continue;
        }
        addUploadedFile({ name: file.name, path: filePath });
      }
      // Update session artwork_paths
      const currentFiles = useSignStore.getState().uploadedFiles;
      await supabase
        .from('review_sessions')
        .update({ artwork_paths: currentFiles.map((f) => f.path) })
        .eq('id', sid);

      setChatPhase('post_upload');
    } catch (err) {
      console.error('Upload flow error:', err);
    }
    // Reset file input
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleStartChat = async () => {
    try {
      await ensureSession();
    } catch (err) {
      console.error('Session creation error:', err);
    }
    setChatPhase('chat');
  };

  return (
    <div className="flex flex-col gap-3 mt-3">
      <button
        onClick={() => fileRef.current?.click()}
        className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary hover:shadow-[0_0_12px_rgba(0,170,255,0.15)]"
      >
        <span className="flex items-center justify-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload Artwork
        </span>
      </button>
      <button
        onClick={handleStartChat}
        className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary hover:shadow-[0_0_12px_rgba(0,170,255,0.15)]"
      >
        Start Chat
      </button>

      <input
        ref={fileRef}
        type="file"
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg"
        multiple
        onChange={handleUpload}
      />
    </div>
  );
};

export default WelcomeActions;
