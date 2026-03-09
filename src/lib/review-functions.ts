import { invokeWithAuth } from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';

export async function checkReviewerAccess() {
  return invokeWithAuth('check-reviewer-access');
}

export async function getCompanies() {
  return invokeWithAuth('get-companies');
}

export async function createReviewSession(params: {
  pg_quote_number?: string;
  account_id: string;
  customer_name: string;
  customer_email?: string;
  artwork_paths: string[];
}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('review_sessions')
    .insert({
      pg_quote_number: params.pg_quote_number || null,
      account_id: params.account_id || null,
      customer_name: params.customer_name,
      customer_email: params.customer_email || null,
      reviewer_email: session.user.email!,
      artwork_paths: params.artwork_paths || [],
      status: 'in_progress',
    })
    .select('id, pg_quote_number, account_id, customer_name, status')
    .single();

  if (error) throw error;
  return data;
}

export async function saveFlag(params: {
  session_id: string;
  issue_description: string;
  flag_type?: string;
  sign_page_ref?: string;
  reason_code?: string;
  spec_field?: string;
  customer_value?: string;
  recommended_value?: string;
  screenshot_path?: string;
  sort_order?: number;
}) {
  return invokeWithAuth('save-flag', params);
}
