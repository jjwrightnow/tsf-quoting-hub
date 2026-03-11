import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useWizardStore } from '@/stores/wizardStore';
import { useSignStore } from '@/stores/signStore';
import { supabase } from '@/integrations/supabase/client';
import { Send, Plus, Upload } from 'lucide-react';

const STEP_LABELS = [
  'Artwork', 'Profile', 'Illumination Style', 'Material & Finish', 'Dimensions', 'Project Details',
];

const MAX_ROWS = 12;
const LINE_HEIGHT = 24;
const MIN_ROWS = 4;

const InputBar = () => {
  const [text, setText] = useState('');
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const userTier = useAppStore((s) => s.userTier);
  const operatorConfig = useAppStore((s) => s.operatorConfig);
  const wizardActive = useAppStore((s) => s.wizardActive);
  const currentStep = useWizardStore((s) => s.currentStep);
  const setArtwork = useWizardStore((s) => s.setArtwork);

  const chatPhase = useSignStore((s) => s.chatPhase);
  const sessionId = useSignStore((s) => s.sessionId);
  const addUploadedFile = useSignStore((s) => s.addUploadedFile);
  const addCannedEntry = useSignStore((s) => s.addCannedEntry);

  const isSignChat = !wizardActive && chatPhase !== 'welcome';
  const showPersistentUpload = isSignChat && chatPhase !== 'done';

  // Canned questions mode for tier 0/1
  const isCannedMode = userTier < 2;
  const cannedQuestions = operatorConfig?.canned_questions || [];

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const minHeight = MIN_ROWS * LINE_HEIGHT;
    const maxHeight = MAX_ROWS * LINE_HEIGHT;
    const scrollH = el.scrollHeight;
    el.style.height = `${Math.min(Math.max(scrollH, minHeight), maxHeight)}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [text, autoResize]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    console.log('[InputBar] submit:', text);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleWizardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = `uploads/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('intake-assets').upload(path, file, { upsert: false });
    if (!error) setArtwork(path);
    setShowUploadMenu(false);
  };

  const handleSignUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !sessionId) return;
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop() || 'bin';
      const uuid = crypto.randomUUID();
      const filePath = `reviews/${sessionId}/${uuid}.${ext}`;
      const { error } = await supabase.storage.from('intake-assets').upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (!error) {
        addUploadedFile({ name: file.name, path: filePath });
      }
    }
    const currentFiles = useSignStore.getState().uploadedFiles;
    await supabase.from('review_sessions').update({ artwork_paths: currentFiles.map((f) => f.path) }).eq('id', sessionId);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleCannedClick = (cq: { q: string; a: string }) => {
    addCannedEntry(cq);
  };

  const stepLabel = wizardActive && currentStep >= 1
    ? `Step ${currentStep} of 6 — ${STEP_LABELS[currentStep - 1] || ''}`
    : null;

  // Canned question chips for tier 0/1
  if (isCannedMode) {
    if (cannedQuestions.length === 0) return null;
    return (
      <div className="w-full flex justify-center px-4 pb-6 pt-2">
        <div className="w-full max-w-[680px]">
          <div className="flex flex-wrap gap-2 justify-center">
            {cannedQuestions.map((cq, i) => (
              <button
                key={i}
                onClick={() => handleCannedClick(cq)}
                className="rounded-full border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-all duration-300 hover:text-foreground hover:border-primary hover:shadow-[0_0_12px_hsl(var(--primary)/0.15)]"
              >
                {cq.q}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Full input bar for tier 2
  const placeholderText = (() => {
    if (wizardActive) return 'Describe your sign project...';
    switch (chatPhase) {
      case 'chat': return 'Type your message...';
      case 'welcome': return 'Describe your sign project...';
      default: return 'Type a message...';
    }
  })();

  const inputDisabled = chatPhase === 'welcome' || chatPhase === 'done';

  return (
    <div className="w-full flex justify-center px-4 pb-6 pt-2">
      <div className="w-full max-w-[680px]">
        {/* Step progress */}
        {stepLabel && (
          <div className="flex items-center gap-2 px-1 pb-2">
            <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(currentStep / 6) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{stepLabel}</span>
          </div>
        )}

        {/* Main input container */}
        <div className="relative rounded-2xl border border-border bg-card transition-all duration-300 focus-within:border-primary/50 focus-within:shadow-[0_0_20px_hsl(var(--primary)/0.12)]">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            disabled={inputDisabled}
            rows={MIN_ROWS}
            className="w-full resize-none bg-transparent px-4 pt-4 pb-14 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-40 scrollbar-thin"
            style={{ lineHeight: `${LINE_HEIGHT}px`, minHeight: `${MIN_ROWS * LINE_HEIGHT}px` }}
          />

          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 pb-3">
            <div className="flex items-center gap-1">
              {wizardActive && (
                <div className="relative">
                  <button
                    onClick={() => setShowUploadMenu(!showUploadMenu)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary"
                  >
                    <Plus size={18} />
                  </button>
                  {showUploadMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 rounded-xl border border-border bg-card p-1 shadow-lg animate-fade-in-up">
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        Upload Artwork
                      </button>
                      <button
                        onClick={() => setShowUploadMenu(false)}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        Select from past uploads
                      </button>
                    </div>
                  )}
                  <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf,.ai,.eps,.svg" onChange={handleWizardUpload} />
                </div>
              )}

              {showPersistentUpload && (
                <div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary"
                  >
                    <Upload size={16} />
                  </button>
                  <input ref={fileRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" multiple onChange={handleSignUpload} />
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputBar;
