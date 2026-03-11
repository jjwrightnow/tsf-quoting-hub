import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const normalizedEmail = email.toLowerCase().trim();

    // Check verified_customers table
    const { data: customerData } = await supabase
      .from('verified_customers')
      .select('id')
      .eq('email', normalizedEmail)
      .limit(1)
      .maybeSingle();

    // Also check verified_domains
    const domain = normalizedEmail.split('@')[1];
    const { data: domainData } = await supabase
      .from('verified_domains')
      .select('id')
      .eq('domain', domain)
      .limit(1)
      .maybeSingle();

    const verified = !!(customerData || domainData);

    return new Response(JSON.stringify({ verified }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
