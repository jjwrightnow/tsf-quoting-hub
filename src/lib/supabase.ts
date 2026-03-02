import { supabase } from '@/integrations/supabase/client';

export async function invokeWithAuth(functionName: string, payload?: object) {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = '/login';
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) throw error;
  return data;
}
