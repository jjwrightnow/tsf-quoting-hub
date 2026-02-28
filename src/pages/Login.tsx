import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Login = () => {
  const { sendMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    const { error: err } = await sendMagicLink(email);
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm px-6">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg gradient-pink-blue">
            <div className="h-5 w-5 rounded-sm bg-primary-foreground/90" />
          </div>
          <p className="text-sm text-muted-foreground">
            Professional Sign Quoting
          </p>
        </div>

        {sent ? (
          <div className="animate-fade-in-up rounded-lg border border-border bg-card p-6 text-center">
            <div className="mb-3 text-2xl">&#9993;</div>
            <p className="text-sm text-foreground">
              Check your email &mdash; we've sent you a secure login link.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              autoFocus
            />
            {error && (
              <p className="text-sm text-accent">{error}</p>
            )}
            <Button
              type="submit"
              disabled={loading || !email}
              className="h-12 w-full gradient-pink-blue text-foreground font-semibold transition-all duration-300 hover:opacity-90"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
