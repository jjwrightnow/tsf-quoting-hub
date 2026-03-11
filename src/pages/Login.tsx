import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { session, sendMagicLink } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated, go home
  if (session) {
    navigate('/', { replace: true });
    return null;
  }

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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg gradient-pink-blue">
            <div className="h-5 w-5 rounded-sm bg-primary-foreground/90" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Sign In</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your email to receive a magic link</p>
        </div>

        {sent ? (
          <div className="animate-fade-in-up rounded-lg border border-border bg-secondary p-6 text-center">
            <div className="mb-3 text-2xl">&#9993;</div>
            <p className="text-sm text-foreground">Check your email for the login link.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-secondary border-border"
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              disabled={loading || !email}
              className="h-12 w-full gradient-pink-blue text-foreground font-semibold"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
