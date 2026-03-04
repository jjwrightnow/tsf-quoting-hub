import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user?.email) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

    const body = await req.json();
    const { pg_quote_number, account_id, customer_name, customer_email, artwork_paths } = body;

    if (!account_id || !customer_name) {
      return new Response(JSON.stringify({ error: 'account_id and customer_name required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data, error } = await admin.from('review_sessions').insert({
      pg_quote_number: pg_quote_number || null,
      account_id,
      customer_name,
      customer_email: customer_email || null,
      reviewer_email: user.email,
      artwork_paths: artwork_paths || [],
      status: 'in_progress',
    }).select('id, pg_quote_number, account_id, customer_name, status').single();

    if (error) throw error;

    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});
