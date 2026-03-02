import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT
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

    // TODO: implement catalog fetching from Airtable or DB
    const bundle = {
      profiles: [
        { id: '1', name: 'Channel Letters' },
        { id: '2', name: 'Dimensional Letters' },
        { id: '3', name: 'Cabinet Signs' },
        { id: '4', name: 'Monument Signs' },
      ],
      illumination: [
        { id: '1', name: 'Front Lit' },
        { id: '2', name: 'Back Lit (Halo)' },
        { id: '3', name: 'Front & Back Lit' },
        { id: '4', name: 'Non-Illuminated' },
      ],
      materials: [
        { id: '1', name: 'Aluminum' },
        { id: '2', name: 'Acrylic' },
        { id: '3', name: 'Stainless Steel' },
        { id: '4', name: 'Painted Metal' },
      ],
      finishes: [
        { id: '1', name: 'Brushed' },
        { id: '2', name: 'Polished' },
        { id: '3', name: 'Painted' },
        { id: '4', name: 'Raw/Natural' },
      ],
    };

    return new Response(JSON.stringify(bundle), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
