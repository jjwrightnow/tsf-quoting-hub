import { supabase } from '@/integrations/supabase/client';
import { invokeWithAuth } from '@/lib/supabase';

export async function getCatalogBundle() {
  const { data, error } = await supabase.functions.invoke('get-catalog-bundle');
  if (error) throw error;
  return data;
}

export async function submitIntake(payload: Record<string, unknown>) {
  return invokeWithAuth('submit-intake', payload);
}

export async function getQuotePortal(params: { action: 'list' } | { action: 'detail'; quoteId: string }) {
  return invokeWithAuth('get-quote-portal', params);
}

export async function requestRevision(params: { quoteId: string; message: string }) {
  return invokeWithAuth('request-revision', params);
}
