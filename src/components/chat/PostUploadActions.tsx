import { Upload, Grid3X3, CircleDot, MessageSquare } from 'lucide-react';
import { useSignStore } from '@/stores/signStore';
import { supabase } from '@/integrations/supabase/client';
import type { ChatPhase } from '@/stores/signStore';
import type { LucideIcon } from 'lucide-react';

interface PathOption {
  key: 'dump_run' | 'tag_go' | 'one_done' | 'letterman_assist';
  label: string;
  description: string;
  icon: LucideIcon;
  nextPhase: ChatPhase;
}

const PATHS: PathOption[] = [
  { key: 'dump_run', label: 'Dump & Run', description: 'Drop your files and go. Our team handles the rest.', icon: Upload, nextPhase: 'done' },
  { key: 'tag_go', label: 'Tag & Go', description: 'Batch-assign sign profiles to your uploaded pages.', icon: Grid3X3, nextPhase: 'batch_assign' },
  { key: 'one_done', label: 'One & Done', description: 'All signs use the same profile. Pick once, done.', icon: CircleDot, nextPhase: 'one_done_pick' },
  { key: 'letterman_assist', label: 'LetterMan Assist', description: 'Walk through each sign one at a time with me.', icon: MessageSquare, nextPhase: 'identify_signs' },
];

const PostUploadActions = () => {
  const { sessionId, setUploadPath, setPostUploadChoice, setChatPhase } = useSignStore();

  const handleSelect = async (path: PathOption) => {
    setUploadPath(path.key);
    setPostUploadChoice(path.key);

    if (sessionId) {
      const update: Record<string, string> = { upload_path: path.key };
      if (path.key === 'dump_run') update.status = 'submitted';
      await supabase.from('review_sessions').update(update).eq('id', sessionId);
    }

    setChatPhase(path.nextPhase);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
      {PATHS.map((path) => {
        const Icon = path.icon;
        return (
          <button
            key={path.key}
            onClick={() => handleSelect(path)}
            className="flex flex-col items-start gap-2 rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-[0_0_12px_hsl(var(--primary)/0.25)]"
          >
            <Icon className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">{path.label}</span>
            <span className="text-xs text-muted-foreground leading-snug">{path.description}</span>
          </button>
        );
      })}
    </div>
  );
};

export default PostUploadActions;
