import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { ForgotPasswordEmail } from './_templates/forgot-password.tsx';
import { WelcomeEmail } from './_templates/welcome.tsx';
import { AccountConfirmationEmail } from './_templates/account-confirmation.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'forgot-password' | 'welcome' | 'account-confirmation';
  email: string;
  data: {
    resetLink?: string;
    welcomeLink?: string;
    confirmLink?: string;
    name?: string;
  };
}

// Interface para webhook do Supabase Auth
interface SupabaseAuthWebhook {
  type: string;
  table: string;
  record: {
    id: string;
    email: string;
    confirmation_token?: string;
    recovery_token?: string;
    raw_user_meta_data?: any;
    email_confirmed_at?: string;
  };
  schema: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Verificar se é um webhook do Supabase Auth
    if (body.type && body.record && body.table === 'users') {
      return handleAuthWebhook(body as SupabaseAuthWebhook);
    }
    
    // Caso contrário, tratar como chamada manual da API
    return handleManualEmail(body as EmailRequest);
    
  } catch (error: any) {
    console.error("Erro ao processar requisição:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function handleAuthWebhook(webhook: SupabaseAuthWebhook): Promise<Response> {
  const { record } = webhook;
  
  // Verificar se é um signup que precisa de confirmação
  if (record.confirmation_token && !record.email_confirmed_at) {
    const confirmLink = `https://sfwxbotcnfpjkwrsfyqj.supabase.co/auth/v1/verify?token=${record.confirmation_token}&type=signup&redirect_to=${encodeURIComponent('https://organizese.chromotech.com.br/auth')}`;
    
    const html = await renderAsync(
      React.createElement(AccountConfirmationEmail, {
        confirmLink: confirmLink,
        email: record.email
      })
    );

    const emailResponse = await resend.emails.send({
      from: "OrganizeSe <noreply@organizese.chromotech.com.br>",
      to: [record.email],
      subject: "Confirme sua conta - OrganizeSe",
      html: html,
    });

    console.log("Email de confirmação enviado via webhook:", emailResponse);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
  
  // Se não precisar enviar email, retornar sucesso
  return new Response(JSON.stringify({ success: true, message: "No email needed" }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

async function handleManualEmail(emailRequest: EmailRequest): Promise<Response> {
  const { type, email, data } = emailRequest;

  let html: string;
  let subject: string;

  switch (type) {
    case 'forgot-password':
      html = await renderAsync(
        React.createElement(ForgotPasswordEmail, {
          resetLink: data.resetLink || '',
          email: email
        })
      );
      subject = 'Redefinir sua senha - OrganizeSe';
      break;

    case 'welcome':
      html = await renderAsync(
        React.createElement(WelcomeEmail, {
          confirmLink: data.welcomeLink || '',
          name: data.name || '',
          email: email
        })
      );
      subject = 'Bem-vindo ao OrganizeSe! Confirme sua conta';
      break;

    case 'account-confirmation':
      html = await renderAsync(
        React.createElement(AccountConfirmationEmail, {
          confirmLink: data.confirmLink || '',
          email: email
        })
      );
      subject = 'Confirme sua conta - OrganizeSe';
      break;

    default:
      throw new Error('Tipo de email inválido');
  }

  const emailResponse = await resend.emails.send({
    from: "OrganizeSe <noreply@organizese.chromotech.com.br>",
    to: [email],
    subject: subject,
    html: html,
  });

  console.log("Email enviado com sucesso:", emailResponse);

  return new Response(JSON.stringify(emailResponse), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

serve(handler);