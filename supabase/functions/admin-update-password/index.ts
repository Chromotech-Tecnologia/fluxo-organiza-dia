import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user is authenticated and is admin
    const token = authHeader.replace('Bearer ', '')
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )
    
    const { data: { user }, error: userError } = await userClient.auth.getUser(token)
    if (userError || !user) {
      throw new Error('Invalid token')
    }

    // Check if user is admin
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin', {}, {
      headers: { Authorization: authHeader }
    })
    
    if (adminError || !isAdmin) {
      throw new Error('User is not admin')
    }

    // Get request body
    const { userId, password } = await req.json()

    if (!userId || !password) {
      throw new Error('Missing userId or password')
    }

    // Update user password using service role
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: password
    })

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})