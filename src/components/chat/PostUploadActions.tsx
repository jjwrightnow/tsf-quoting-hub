import { useSignStore } from '@/stores/signStore';
import { supabase } from '@/integrations/supabase/client';

const PostUploadActions = () => {
  const setChatPhase = useSignStore((s) => s.setChatPhase);
  const setPostUploadChoice = useSignStore((s) => s.setPostUploadChoice);
  const sessionId = useSignStore((s) => s.sessionId);

  const handleSpecify = () => {
    setPostUploadChoice('specify');
    setChatPhase('identify_signs');
  };

  const handleDone = async () => {
    setPostUploadChoice('done');
    if (sessionId) {
      await supabase
        .from('review_sessions')
        .update({ status: 'submitted' })
        .eq('id', sessionId);
    }
    setChatPhase('done');
  };

  const handleQuestions = () => {
    setPostUploadChoice('questions');
    setChatPhase('chat');
  };

  return (
    <div className="flex flex-col gap-3 mt-3">
      <button
        onClick={handleSpecify}
        className="w-full rounded-lg gradient-pink-blue px-4 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:opacity-90"
      >
        Specify sign profiles
      </button>
      <button
        onClick={handleDone}
        className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary hover:shadow-[0_0_12px_rgba(0,170,255,0.15)]"
      >
        I'm done, team can handle it
      </button>
      <button
        onClick={handleQuestions}
        className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary hover:shadow-[0_0_12px_rgba(0,170,255,0.15)]"
      >
        I have questions
      </button>
    </div>
  );
};

export default PostUploadActions;
