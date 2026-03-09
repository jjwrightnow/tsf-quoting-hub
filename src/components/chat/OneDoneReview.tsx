import { useSignStore } from '@/stores/signStore';
import SignSpecCard from '@/components/chat/SignSpecCard';

const OneDoneReview = () => {
  const { signs, sessionId, setChatPhase } = useSignStore();

  const handleDone = async () => {
    if (sessionId) {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.from('review_sessions').update({ status: 'submitted' }).eq('id', sessionId);
    }
    setChatPhase('done');
  };

  return (
    <div className="space-y-4 mt-3">
      <p className="text-sm text-muted-foreground">
        {signs.length} sign(s) created. Review specs below, then submit.
      </p>
      {signs.map((sign) => (
        <SignSpecCard
          key={sign.id}
          sign={sign}
          onSaved={() => {}}
          onAddAnother={() => {}}
          onDone={handleDone}
        />
      ))}
      <button
        onClick={handleDone}
        className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-primary hover:shadow-[0_0_12px_hsl(var(--primary)/0.25)]"
      >
        Submit All
      </button>
    </div>
  );
};

export default OneDoneReview;
