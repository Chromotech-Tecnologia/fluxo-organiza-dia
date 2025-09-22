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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, data }: EmailRequest = await req.json();

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
  } catch (error: any) {
    console.error("Erro ao enviar email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);