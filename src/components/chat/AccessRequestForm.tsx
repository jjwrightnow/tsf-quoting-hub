import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const AccessRequestForm = ({ onSubmitted }: { onSubmitted: () => void }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !companyName.trim()) return;
    setLoading(true);
    setError('');

    try {
      const { error: fnError } = await supabase.functions.invoke('submit-access-request', {
        body: { full_name: fullName.trim(), email: email.trim(), company_name: companyName.trim() },
      });
      if (fnError) throw fnError;
      onSubmitted();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-lg border border-border bg-card p-4">
      <Input
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="h-10 bg-secondary border-border"
      />
      <Input
        type="email"
        placeholder="Work Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-10 bg-secondary border-border"
      />
      <Input
        placeholder="Company Name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        className="h-10 bg-secondary border-border"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        type="submit"
        disabled={loading || !fullName.trim() || !email.trim() || !companyName.trim()}
        className="w-full gradient-pink-blue text-foreground font-semibold"
      >
        {loading ? 'Submitting...' : 'Request Access'}
      </Button>
    </form>
  );
};

export default AccessRequestForm;
