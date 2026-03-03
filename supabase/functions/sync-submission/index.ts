import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const AIRTABLE_BASE_ID = 'appsjcchLMyRidtzJ';
const AIRTABLE_TABLE_NAME = 'Signs';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth: require valid JWT or service role key
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Allow service role key OR validate JWT claims
    let isAuthorized = false;
    if (token === serviceRoleKey) {
      isAuthorized = true;
    } else {
      const userClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        anonKey,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
      if (!claimsError && claimsData?.claims) {
        const email = (claimsData.claims.email as string) || '';
        if (email.endsWith('@thesignagefactory.co')) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role client for all DB operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      serviceRoleKey,
    );

    // 1. Query pending/retryable records
    const { data: records, error: fetchErr } = await supabase
      .from('submission_queue')
      .select('id, created_at, sync_status, payload, contact_id, account_id, retry_count')
      .or('sync_status.eq.pending,and(sync_status.eq.error,retry_count.lt.3)')
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchErr) {
      console.error('Failed to fetch records:', fetchErr);
      return new Response(JSON.stringify({ error: fetchErr.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!records || records.length === 0) {
      return new Response(JSON.stringify({ synced: 0, errors: 0, skipped: 0, message: 'No pending records' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const airtableApiKey = Deno.env.get('AIRTABLE_API_KEY');
    if (!airtableApiKey) {
      console.error('AIRTABLE_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'AIRTABLE_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Batch-fetch contact and account info
    const contactIds = [...new Set(records.map((r: any) => r.contact_id))];
    const accountIds = [...new Set(records.map((r: any) => r.account_id))];

    const [contactsRes, accountsRes] = await Promise.all([
      supabase.from('contacts').select('id, email').in('id', contactIds),
      supabase.from('accounts').select('id, company_name').in('id', accountIds),
    ]);

    const contactMap: Record<string, string> = {};
    for (const c of contactsRes.data || []) {
      contactMap[c.id] = c.email;
    }
    const accountMap: Record<string, string> = {};
    for (const a of accountsRes.data || []) {
      accountMap[a.id] = a.company_name;
    }

    let synced = 0;
    let errors = 0;
    let skipped = 0;

    // 2. Process each record
    for (const record of records) {
      const payload = typeof record.payload === 'string' ? JSON.parse(record.payload) : record.payload;

      const airtableFields: Record<string, any> = {
        "Project Name": payload.projectName || 'Untitled',
        "Profile Type": payload.profileName || '',
        "Illumination Style": payload.illuminationName || '',
        "Material": payload.materialName || '',
        "Finish": payload.finishName || '',
        "Letter Height (in)": payload.letterHeight ? Number(payload.letterHeight) : null,
        "Quantity": payload.quantity ? Number(payload.quantity) : null,
        "Submitted By Email": contactMap[record.contact_id] || '',
        "Account Name": accountMap[record.account_id] || '',
        "Specs JSON": JSON.stringify(payload),
        "Status": "Intake Submitted",
      };

      // Remove null fields to avoid Airtable errors
      for (const key of Object.keys(airtableFields)) {
        if (airtableFields[key] === null || airtableFields[key] === '') {
          delete airtableFields[key];
        }
      }

      try {
        const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;
        const atResp = await fetch(airtableUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${airtableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fields: airtableFields }),
        });

        if (!atResp.ok) {
          const errBody = await atResp.text();
          console.error(`Airtable error for ${record.id}:`, atResp.status, errBody);
          await supabase
            .from('submission_queue')
            .update({
              sync_status: 'error',
              retry_count: record.retry_count + 1,
              error_detail: `Airtable ${atResp.status}: ${errBody.substring(0, 500)}`,
              last_attempt: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', record.id);
          errors++;
          continue;
        }

        const atData = await atResp.json();
        const airtableRecordId = atData.id;

        await supabase
          .from('submission_queue')
          .update({
            sync_status: 'synced',
            airtable_record_id: airtableRecordId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', record.id);

        console.log(`Synced record ${record.id} → Airtable ${airtableRecordId}`);
        synced++;
      } catch (err) {
        console.error(`Exception syncing ${record.id}:`, err);
        await supabase
          .from('submission_queue')
          .update({
            sync_status: 'error',
            retry_count: record.retry_count + 1,
            error_detail: String(err).substring(0, 500),
            last_attempt: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', record.id);
        errors++;
      }
    }

    return new Response(JSON.stringify({ synced, errors, skipped }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('sync-submission top-level error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
