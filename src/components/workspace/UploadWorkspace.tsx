import { useState, useRef, useCallback } from 'react';
import { Upload, FileUp, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function UploadWorkspace() {
  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptTypes = '.pdf,.png,.jpg,.jpeg';

  const handleFile = useCallback((f: File) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowed.includes(f.type)) {
      toast.error('Please upload a PDF, PNG, or JPG file.');
      return;
    }
    if (f.size > 25 * 1024 * 1024) {
      toast.error('File must be under 25MB.');
      return;
    }
    setFile(f);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file || !projectName.trim()) return;
    setUploading(true);

    try {
      const ext = file.name.split('.').pop() || 'pdf';
      const filePath = `reviews/${crypto.randomUUID()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('intake-assets')
        .upload(filePath, file);
      if (uploadErr) throw uploadErr;

      const { error: dbErr } = await supabase
        .from('review_sessions')
        .insert({
          upload_path: filePath,
          customer_name: projectName.trim(),
          status: 'pending',
        });
      if (dbErr) throw dbErr;

      setSubmitted(true);
      toast.success('Project submitted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center h-full px-6">
        <div className="max-w-[500px] text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Project submitted!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You will be notified when your artwork has been processed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full px-6">
      <div className="w-full max-w-[600px] space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Upload Your Sign Project
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[480px] mx-auto">
            Upload a PDF with your sign artwork. We prefer one sign per page, or group by lighting profile and material.
          </p>
        </div>

        {/* Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`relative h-[300px] rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-4 transition-colors ${
            dragOver
              ? 'border-ring bg-ring/5'
              : file
                ? 'border-green-500/50 bg-green-500/5'
                : 'border-border hover:border-ring/40 bg-card'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptTypes}
            onChange={onFileChange}
            className="hidden"
          />
          {file ? (
            <>
              <FileUp className="w-10 h-10 text-green-500" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="text-xs text-destructive mt-2 hover:underline"
                >
                  Remove
                </button>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-muted-foreground/50" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Drag & drop your file here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse · PDF, PNG, JPG up to 25MB
                </p>
              </div>
            </>
          )}
        </div>

        {/* Project name */}
        <div className="space-y-2">
          <label htmlFor="project-name" className="text-sm font-medium text-foreground">
            Project Name
          </label>
          <Input
            id="project-name"
            placeholder="e.g. Main Street Brewery Signage"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!file || !projectName.trim() || uploading}
          className="w-full h-12 text-sm font-semibold"
          size="lg"
        >
          {uploading ? 'Uploading…' : 'Create Project'}
        </Button>
      </div>
    </div>
  );
}
