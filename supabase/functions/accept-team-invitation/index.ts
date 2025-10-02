import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface AcceptInvitationRequest {
  invitationToken: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verificar autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Unauthorized");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { invitationToken } = await req.json() as AcceptInvitationRequest;

    console.log("Accepting invitation with token:", invitationToken);

    // Buscar convite
    const { data: invitation, error: inviteError } = await supabase
      .from("team_invitations")
      .select("*")
      .eq("invitation_token", invitationToken)
      .single();

    if (inviteError || !invitation) {
      throw new Error("Convite não encontrado");
    }

    // Verificar se não expirou
    if (new Date(invitation.expires_at) < new Date()) {
      await supabase
        .from("team_invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id);
      throw new Error("Convite expirado");
    }

    // Verificar se já foi aceito
    if (invitation.status === "accepted") {
      throw new Error("Convite já foi aceito");
    }

    // Verificar se o usuário logado é o destinatário
    const { data: userData } = await supabase.auth.admin.getUserById(user.id);
    if (userData.user?.email !== invitation.recipient_email) {
      throw new Error("Este convite não foi enviado para você");
    }

    // Atualizar convite
    const { error: updateError } = await supabase
      .from("team_invitations")
      .update({
        status: "accepted",
        recipient_user_id: user.id,
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invitation.id);

    if (updateError) {
      console.error("Error updating invitation:", updateError);
      throw updateError;
    }

    // Se existe team_member_id, vincular o colaborador
    if (invitation.team_member_id) {
      const { error: memberError } = await supabase
        .from("team_members")
        .update({
          is_external_collaborator: true,
          collaborator_user_id: user.id,
        })
        .eq("id", invitation.team_member_id);

      if (memberError) {
        console.error("Error updating team member:", memberError);
      }
    }

    // Criar colaboração ativa
    const { error: collabError } = await supabase
      .from("team_collaborations")
      .insert({
        owner_user_id: invitation.sender_user_id,
        collaborator_user_id: user.id,
        team_member_id: invitation.team_member_id,
        is_active: true,
      });

    if (collabError) {
      console.error("Error creating collaboration:", collabError);
      throw collabError;
    }

    console.log("Invitation accepted successfully");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Convite aceito com sucesso! Agora você pode visualizar tarefas delegadas a você." 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in accept-team-invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});