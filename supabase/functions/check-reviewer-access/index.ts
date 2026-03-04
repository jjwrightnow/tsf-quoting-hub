import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ allowed: false }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user?.email) {
      return new Response(JSON.stringify({ allowed: false }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 });
    }

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: whitelist } = await admin.from('reviewer_whitelist').select('email').eq('email', user.email).eq('active', true).maybeSingle();

    return new Response(JSON.stringify({ allowed: !!whitelist }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ allowed: false, error: e.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});
