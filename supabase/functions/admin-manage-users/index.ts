import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify if the requesting user is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header missing' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin using has_role with the authenticated user's id
    const { data: hasAdminRole, error: roleError } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })
    if (roleError || !hasAdminRole) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { method } = req
    const body = method === 'GET' ? {} : await req.json()

    if (method === 'GET') {
      // Get all users from auth with their confirmation status
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        throw authError
      }

      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')

      if (profilesError) throw profilesError

      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')

      if (rolesError) throw rolesError

      // Combine auth users with profiles and roles
      const usersWithDetails = authUsers.users.map(authUser => {
        const profile = profiles?.find(p => p.id === authUser.id)
        const userRoles = roles?.filter(r => r.user_id === authUser.id).map(r => r.role) || []
        
        return {
          id: authUser.id,
          email: authUser.email,
          name: profile?.name || authUser.user_metadata?.name || '',
          roles: userRoles,
          created_at: authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at,
          email_confirmed_at: authUser.email_confirmed_at,
          email_confirmed: !!authUser.email_confirmed_at,
          phone_confirmed: !!authUser.phone_confirmed_at,
          has_profile: !!profile
        }
      })

      return new Response(
        JSON.stringify({ users: usersWithDetails }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (method === 'POST' && body.action === 'confirm_email') {
      const { userId } = body
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'userId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Confirm user email manually
      const { data: updatedUser, error: confirmError } = await supabase.auth.admin.updateUserById(
        userId,
        { 
          email_confirm: true 
        }
      )

      if (confirmError) {
        throw confirmError
      }

      return new Response(
        JSON.stringify({ 
          message: 'Email confirmed successfully',
          user: updatedUser
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (method === 'POST' && body.action === 'create_missing_profile') {
      const { userId } = body
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'userId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get user from auth
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
      
      if (authError || !authUser.user) {
        throw authError || new Error('User not found')
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          name: authUser.user.user_metadata?.name || '',
          email: authUser.user.email
        })

      if (profileError) {
        throw profileError
      }

      return new Response(
        JSON.stringify({ 
          message: 'Profile created successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})