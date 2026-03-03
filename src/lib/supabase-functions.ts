import { invokeWithAuth } from '@/lib/supabase';

export async function getCatalogBundle() {
  return invokeWithAuth('get-catalog-bundle');
}

export async function submitIntake(payload: Record<string, unknown>) {
  return invokeWithAuth('submit-intake', payload);
}

export async function getQuotePortal(params: { action: 'list' } | { action: 'detail'; quoteId: string } | { action: 'list_all' }) {
  return invokeWithAuth('get-quote-portal', params);
}

export async function requestRevision(params: { quoteId: string; message: string }) {
  return invokeWithAuth('request-revision', params);
}
