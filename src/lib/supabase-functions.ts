import { supabase } from '@/integrations/supabase/client';

export async function getCatalogBundle() {
  const { data, error } = await supabase.functions.invoke('get-catalog-bundle');
  if (error) throw error;
  return data;
}

export async function submitIntake(payload: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('submit-intake', {
    body: payload,
  });
  if (error) throw error;
  return data;
}

export async function getQuotePortal(params: { action: 'list' } | { action: 'detail'; quoteId: string }) {
  const { data, error } = await supabase.functions.invoke('get-quote-portal', {
    body: params,
  });
  if (error) throw error;
  return data;
}

export async function requestRevision(params: { quoteId: string; message: string }) {
  const { data, error } = await supabase.functions.invoke('request-revision', {
    body: params,
  });
  if (error) throw error;
  return data;
}
