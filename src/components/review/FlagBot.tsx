import { useState, useRef, useEffect, useMemo } from 'react';
import { useReviewStore } from '@/stores/reviewStore';
import { saveFlag } from '@/lib/review-functions';
import FlagCard from './FlagCard';
import FlagForm from './FlagForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

const FlagBot = () => {
  const session = useReviewStore((s) => s.session);
  const flags = useReviewStore((s) => s.flags);
  const autocompleteOptions = useReviewStore((s) => s.autocompleteOptions);
  const flagFormState = useReviewStore((s) => s.flagFormState);
  const setFlagFormState = useReviewStore((s) => s.setFlagFormState);
  const addFlag = useReviewStore((s) => s.addFlag);
  const removeFlag = useReviewStore((s) => s.removeFlag);
  const currentPage = useReviewStore((s) => s.currentPage);
  const submitStatus = useReviewStore((s) => s.submitStatus);
  const setSubmitStatus = useReviewStore((s) => s.setSubmitStatus);

  const [inputValue, setInputValue] = useState('');
  const [acOpen, setAcOpen] = useState(false);
  const [acIndex, setAcIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter autocomplete
  const acResults = useMemo(() => {
    if (!inputValue.trim()) return [];
    const q = inputValue.toLowerCase();
    return autocompleteOptions
      .filter((o) => {
        const label = o.display_label.toLowerCase();
        const terms = (o.search_terms || '').toLowerCase();
        return label.includes(q) || terms.includes(q);
      })
      .slice(0, 8);
  }, [inputValue, autocompleteOptions]);

  useEffect(() => {
    if (acResults.length > 0 && inputValue.trim()) setAcOpen(true);
    else setAcOpen(false);
    setAcIndex(0);
  }, [acResults, inputValue]);

  // Scroll to bottom when flags change
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [flags.length]);

  const openForm = (description: string, reasonCode?: string) => {
    setFlagFormState({
      visible: true,
      issue_description: description,
      step: 1,
      sign_page_ref: `Page ${currentPage}`,
      flag_type: null,
      spec_field: null,
      customer_value: '',
      recommended_value: '',
      reason_code: reasonCode || null,
      screenshot_path: null,
    });
    setInputValue('');
    setAcOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (acOpen) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setAcIndex((i) => Math.min(i + 1, acResults.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setAcIndex((i) => Math.max(i - 1, 0)); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = acResults[acIndex];
        if (selected) openForm(selected.display_label, selected.option_value);
        else if (inputValue.trim()) openForm(inputValue.trim());
      }
    } else if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      openForm(inputValue.trim());
    }
  };

  const handleSaveFlag = async (flagData: any) => {
    if (!session) return;
    try {
      const res = await saveFlag({
        session_id: session.id,
        sort_order: flags.length,
        ...flagData,
      });
      addFlag(res);
      setFlagFormState(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (e: any) {
      toast({ title: 'Error saving flag', description: e.message, variant: 'destructive' });
    }
  };

  const handleDeleteFlag = (id: string) => {
    removeFlag(id);
    // TODO: call delete-flag edge function
  };

  const handleSubmitReview = () => {
    setSubmitStatus('success');
    toast({ title: `Review saved with ${flags.length} flag${flags.length !== 1 ? 's' : ''}` });
  };

  if (submitStatus === 'success') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
        <div className="text-2xl">✅</div>
        <h2 className="text-lg font-semibold text-foreground">Review saved with {flags.length} flag{flags.length !== 1 ? 's' : ''}</h2>
        <p className="text-sm text-muted-foreground">Airtable sync will run in Phase 2.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Flag List */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {flags.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No flags yet. Type an issue below to start.</p>
        ) : (
          flags.map((f) => <FlagCard key={f.id} flag={f} onDelete={() => handleDeleteFlag(f.id)} />)
        )}
      </div>

      {/* Flag Form */}
      {flagFormState?.visible && (
        <FlagForm
          onSave={handleSaveFlag}
          onCancel={() => setFlagFormState(null)}
        />
      )}

      {/* Input Bar */}
      <div className="relative border-t border-border bg-card p-2">
        {acOpen && (
          <div className="absolute bottom-full left-0 right-0 z-50 mb-1 max-h-64 overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
            {acResults.map((opt, i) => (
              <button
                key={opt.option_value + i}
                className={`w-full px-3 py-2 text-left text-sm ${
                  i === acIndex ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent/50'
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => openForm(opt.display_label, opt.option_value)}
              >
                <span className="text-xs text-muted-foreground">{opt.category}</span>
                <span className="ml-2">{opt.display_label}</span>
              </button>
            ))}
          </div>
        )}
        <Input
          ref={inputRef}
          placeholder="Type an issue..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!!flagFormState?.visible}
        />
      </div>

      {/* Submit Footer */}
      <div className="border-t border-border bg-card p-2">
        <Button
          className="w-full"
          disabled={flags.length === 0}
          onClick={handleSubmitReview}
        >
          Submit Review ({flags.length} flag{flags.length !== 1 ? 's' : ''})
        </Button>
      </div>
    </div>
  );
};

export default FlagBot;
