import { useEffect, useState } from 'react';
import { checkReviewerAccess } from '@/lib/review-functions';
import { useReviewStore } from '@/stores/reviewStore';
import SetupScreen from '@/components/review/SetupScreen';
import ReviewScreen from '@/components/review/ReviewScreen';
import { Link } from 'react-router-dom';

const Review = () => {
  const [accessState, setAccessState] = useState<'loading' | 'allowed' | 'denied'>('loading');
  const session = useReviewStore((s) => s.session);

  useEffect(() => {
    checkReviewerAccess()
      .then((res) => setAccessState(res?.allowed ? 'allowed' : 'denied'))
      .catch(() => setAccessState('denied'));
  }, []);

  if (accessState === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (accessState === 'denied') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground">You are not authorized to access the review tool.</p>
        <Link to="/" className="text-primary hover:underline">← Back to home</Link>
      </div>
    );
  }

  return session ? <ReviewScreen /> : <SetupScreen />;
};

export default Review;
