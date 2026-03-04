import { invokeWithAuth } from '@/lib/supabase';

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
  return invokeWithAuth('create-review-session', params);
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
