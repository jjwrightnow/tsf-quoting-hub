import { supabase } from '@/integrations/supabase/client';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${session?.access_token}` };
}

export async function getCatalogBundle() {
  const { data, error } = await supabase.functions.invoke('get-catalog-bundle');
  if (error) throw error;
  return data;
}

export async function submitIntake(payload: Record<string, unknown>) {
  const headers = await getAuthHeaders();
  const { data, error } = await supabase.functions.invoke('submit-intake', {
    body: payload,
    headers,
  });
  if (error) throw error;
  return data;
}

export async function getQuotePortal(params: { action: 'list' } | { action: 'detail'; quoteId: string }) {
  const headers = await getAuthHeaders();
  const { data, error } = await supabase.functions.invoke('get-quote-portal', {
    body: params,
    headers,
  });
  if (error) throw error;
  return data;
}

export async function requestRevision(params: { quoteId: string; message: string }) {
  const headers = await getAuthHeaders();
  const { data, error } = await supabase.functions.invoke('request-revision', {
    body: params,
    headers,
  });
  if (error) throw error;
  return data;
}
