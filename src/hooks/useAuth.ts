import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const initialised = useRef(false);

  useEffect(() => {
    // Set up listener FIRST so we never miss events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('[useAuth] onAuthStateChange:', event, !!newSession, newSession?.user?.email);
        setSession(newSession);
        if (initialised.current) {
          setLoading(false);
        }
      }
    );

    // getSession restores session from storage AND processes hash tokens
    supabase.auth.getSession().then(({ data: { session: restored } }) => {
      initialised.current = true;
      setSession(restored);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const sendMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { session, loading, sendMagicLink, signOut };
}
