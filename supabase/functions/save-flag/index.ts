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
    if (authErr || !user) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

    const body = await req.json();
    const { session_id, issue_description, flag_type, sign_page_ref, reason_code, spec_field, customer_value, recommended_value, screenshot_path, sort_order } = body;

    if (!session_id || !issue_description) {
      return new Response(JSON.stringify({ error: 'session_id and issue_description required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Insert using user's auth (RLS will verify reviewer owns session)
    const { data, error } = await supabase.from('review_flags').insert({
      session_id,
      issue_description,
      flag_type: flag_type || 'note',
      sign_page_ref: sign_page_ref || null,
      reason_code: reason_code || null,
      spec_field: spec_field || null,
      customer_value: customer_value || null,
      recommended_value: recommended_value || null,
      screenshot_path: screenshot_path || null,
      sort_order: sort_order || 0,
    }).select().single();

    if (error) throw error;

    // Update flag count on session
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { count } = await admin.from('review_flags').select('*', { count: 'exact', head: true }).eq('session_id', session_id);
    await admin.from('review_sessions').update({ flag_count: count }).eq('id', session_id);

    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});
