```typescript
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const supabaseUrl = Deno.env.get('URL')
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY') // Also try to get SERVICE_ROLE_KEY

    console.log('test-env: Attempting to read environment variables');
    console.log('test-env: URL:', supabaseUrl ? 'Successfully retrieved' : 'Not found');
    console.log('test-env: SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Successfully retrieved' : 'Not found');

    if (!supabaseUrl) {
      return new Response(
        JSON.stringify({ error: 'CONFIGURATION_ERROR', message: 'Missing URL environment variable' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
      )
    }
    
    // You can optionally initialize Supabase client here to test the key as well
    // const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    return new Response(
      JSON.stringify({ 
        message: 'Environment variables retrieved successfully!', 
        url: supabaseUrl,
        serviceKeyStatus: supabaseServiceKey ? 'retrieved' : 'not retrieved'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  } catch (error) {
    console.error('test-env: Error', { error: String((error as any)?.message || error) })
    return new Response(
      JSON.stringify({ error: 'UNEXPECTED_ERROR', message: (error as any)?.message || String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})
```