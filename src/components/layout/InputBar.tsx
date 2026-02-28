import { useState, useRef } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useWizardStore } from '@/stores/wizardStore';
import { supabase } from '@/integrations/supabase/client';

const STEP_LABELS = [
  'Artwork',
  'Profile',
  'Illumination Style',
  'Material & Finish',
  'Dimensions',
  'Project Details',
];

const InputBar = () => {
  const [text, setText] = useState('');
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const wizardActive = useAppStore((s) => s.wizardActive);
  const currentStep = useWizardStore((s) => s.currentStep);
  const setArtwork = useWizardStore((s) => s.setArtwork);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const path = `uploads/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from('intake-assets')
      .upload(path, file, { upsert: false });

    if (!error) {
      setArtwork(path);
    }
    setShowUploadMenu(false);
  };

  const stepLabel = wizardActive && currentStep >= 1
    ? `Step ${currentStep} of 6 -- ${STEP_LABELS[currentStep - 1] || ''}`
    : null;

  return (
    <div className="relative border-t border-border bg-card pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
      {/* Progress indicator */}
      {stepLabel && (
        <div className="flex items-center gap-2 px-4 py-1.5 border-b border-border">
          <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {stepLabel}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 px-4 py-3">
        {/* + button */}
        <div className="relative">
          <button
            onClick={() => setShowUploadMenu(!showUploadMenu)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-all duration-300 hover:text-foreground hover:border-primary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          {showUploadMenu && (
            <div className="absolute bottom-full left-0 mb-2 w-48 rounded-lg border border-border bg-card p-1 shadow-lg animate-fade-in-up">
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-secondary transition-colors"
              >
                Upload Artwork
              </button>
              <button
                onClick={() => setShowUploadMenu(false)}
                className="w-full rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-secondary transition-colors"
              >
                Select from past uploads
              </button>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf,.ai,.eps,.svg"
            onChange={handleUpload}
          />
        </div>

        {/* Text input */}
        <div className="flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe your sign project..."
            className="w-full rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-0 glow-blue transition-all duration-300"
          />
        </div>

        {/* Send */}
        <button
          disabled={!text.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-lg gradient-pink-blue text-foreground transition-all duration-300 hover:opacity-90 disabled:opacity-30"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default InputBar;
