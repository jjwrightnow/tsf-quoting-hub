import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GuestUpload = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');

    try {
      const timestamp = Date.now();
      for (const file of Array.from(files)) {
        const path = `guest-uploads/${timestamp}-${file.name}`;
        const { error: uploadErr } = await supabase.storage.from('intake-assets').upload(path, file);
        if (uploadErr) throw uploadErr;
      }
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (done) {
    return (
      <div className="mt-3 rounded-lg border border-border bg-card p-4 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary text-lg">
            &#10003;
          </div>
          <p className="text-sm font-semibold text-foreground">Files received.</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Our team will review your artwork and send a quote to your email within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.ai,.eps,.svg"
        multiple
        className="hidden"
        onChange={handleUpload}
      />
      <Button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="w-full gap-2 gradient-pink-blue text-foreground font-semibold"
      >
        <Upload className="h-4 w-4" />
        {uploading ? 'Uploading...' : 'Upload Artwork for a Quote'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default GuestUpload;
