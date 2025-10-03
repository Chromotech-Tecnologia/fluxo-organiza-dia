import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface InvitationRequest {
  recipientEmail: string;
  teamMemberId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Verificar autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se o sender tem conta ativa (com fallback)
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("is_permanent, trial_expires_at")
      .eq("user_id", user.id)
      .maybeSingle();

    // Se não encontrar user_role, criar um trial padrão
    let isActive = false;
    if (!userRole) {
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: 'user',
          trial_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      
      if (!insertError) {
        isActive = true;
      }
    } else {
      isActive = userRole.is_permanent || 
        (userRole.trial_expires_at && new Date(userRole.trial_expires_at) > new Date());
    }

    if (!isActive) {
      return new Response(
        JSON.stringify({ error: 'Sua conta não está ativa. Entre em contato com o suporte.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { recipientEmail, teamMemberId } = await req.json() as InvitationRequest;

    console.log("Sending invitation to:", recipientEmail);

    // Verificar se o email existe na plataforma
    const { data: recipientUserData, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error verifying recipient:', usersError);
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar email do destinatário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const recipient = recipientUserData.users.find(u => u.email?.toLowerCase() === recipientEmail.toLowerCase());

    if (!recipient) {
      return new Response(
        JSON.stringify({ error: 'Email não está cadastrado na plataforma' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se já existe convite pendente
    const { data: existingInvite } = await supabase
      .from("team_invitations")
      .select("*")
      .eq("sender_user_id", user.id)
      .eq("recipient_email", recipientEmail)
      .eq("status", "pending")
      .maybeSingle();

    if (existingInvite) {
      return new Response(
        JSON.stringify({ error: 'Já existe um convite pendente para este email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar convite
    const { data: invitation, error: inviteError } = await supabase
      .from("team_invitations")
      .insert({
        sender_user_id: user.id,
        recipient_email: recipientEmail,
        recipient_user_id: recipient.id,
        team_member_id: teamMemberId || null,
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Error creating invitation:", inviteError);
      throw inviteError;
    }

    // Buscar nome do sender
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();

    const senderName = senderProfile?.name || user.email;

    // Enviar email
    const acceptUrl = `${Deno.env.get("SUPABASE_URL")?.replace("supabase.co", "lovableproject.com")}/accept-invitation/${invitation.invitation_token}`;

    const { error: emailError } = await resend.emails.send({
      from: "OrganizeSe <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `${senderName} convidou você para colaborar na equipe`,
      html: `
        <h1>Convite para Colaboração</h1>
        <p><strong>${senderName}</strong> convidou você para fazer parte da equipe!</p>
        <p>Com esta colaboração, você poderá visualizar e gerenciar tarefas delegadas a você.</p>
        <p>
          <a href="${acceptUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Aceitar Convite
          </a>
        </p>
        <p>Ou copie e cole este link no seu navegador:</p>
        <p style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all;">
          ${acceptUrl}
        </p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
          Este convite expira em 7 dias. Se você não solicitou este convite, pode ignorar este email.
        </p>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      // Não falhar a requisição se o email não for enviado
    }

    console.log("Invitation created successfully:", invitation.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitation,
        message: "Convite enviado com sucesso!" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in send-team-invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});