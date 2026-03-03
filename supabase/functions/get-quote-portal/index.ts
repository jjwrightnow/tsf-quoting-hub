import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const ADMIN_EMAILS: string[] = [
  // Add specific admin emails here if needed
];

function isAdminEmail(email: string): boolean {
  return email.endsWith('@thesignagefactory.co') || ADMIN_EMAILS.includes(email);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.claims.sub;
    const userEmail = (claimsData.claims.email as string) || '';

    const body = await req.json();
    const { action, quoteId } = body;

    if (action === 'list') {
      // TODO: query quotes table filtered by authenticated user's account
      return new Response(JSON.stringify({ quotes: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'detail' && quoteId) {
      // TODO: fetch single quote detail
      return new Response(JSON.stringify({ quote: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'list_all') {
      if (!isAdminEmail(userEmail)) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Use service role to bypass RLS for admin query
      const adminClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      );

      const { data: rows, error: qErr } = await adminClient
        .from('submission_queue')
        .select('id, created_at, sync_status, airtable_record_id, payload, error_detail, retry_count, account_id, contact_id')
        .order('created_at', { ascending: false })
        .limit(200);

      if (qErr) {
        return new Response(JSON.stringify({ error: qErr.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch account names for display
      const accountIds = [...new Set((rows || []).map((r: any) => r.account_id))];
      let accountMap: Record<string, string> = {};
      if (accountIds.length > 0) {
        const { data: accounts } = await adminClient
          .from('accounts')
          .select('id, company_name')
          .in('id', accountIds);
        for (const a of accounts || []) {
          accountMap[a.id] = a.company_name;
        }
      }

      const submissions = (rows || []).map((r: any) => ({
        id: r.id,
        created_at: r.created_at,
        sync_status: r.sync_status,
        airtable_record_id: r.airtable_record_id,
        payload: r.payload,
        error_detail: r.error_detail,
        retry_count: r.retry_count,
        company_name: accountMap[r.account_id] || 'Unknown',
      }));

      return new Response(JSON.stringify({ submissions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
