import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/stores/appStore';
import { useSignStore } from '@/stores/signStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const VerifyEmailForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const setUserTier = useAppStore((s) => s.setUserTier);
  const setChatPhase = useSignStore((s) => s.setChatPhase);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    setNotFound(false);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-customer-email', {
        body: { email: email.trim() },
      });
      if (fnError) throw fnError;

      if (data?.verified) {
        setUserTier(1);
        setChatPhase('welcome');
      } else {
        setNotFound(true);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = () => {
    setChatPhase('access_request');
  };

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-border bg-card p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="Your work email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setNotFound(false); }}
          className="h-10 bg-secondary border-border"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full gradient-pink-blue text-foreground font-semibold"
        >
          {loading ? 'Checking...' : 'Verify Email'}
        </Button>
      </form>
      {notFound && (
        <div className="rounded-lg border border-border bg-secondary p-3 space-y-2 animate-fade-in-up">
          <p className="text-sm text-foreground">
            We couldn't find that email in our system.
          </p>
          <Button
            onClick={handleRequestAccess}
            variant="outline"
            className="w-full border-border text-foreground"
          >
            Request Access Instead
          </Button>
        </div>
      )}
    </div>
  );
};

export default VerifyEmailForm;
