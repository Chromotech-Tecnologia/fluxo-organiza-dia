-- Configure Supabase to use our custom email function
-- This disables the default Supabase confirmation emails and uses our custom function

-- First, let's create a webhook configuration
INSERT INTO extensions.pg_net_config (name, value) VALUES ('webhook.send_auth_emails', 'https://sfwxbotcnfpjkwrsfyqj.supabase.co/functions/v1/send-auth-emails');

-- Create the auth webhook configuration
CREATE OR REPLACE FUNCTION public.handle_auth_event()
RETURNS trigger AS $$
DECLARE
  webhook_url text := 'https://sfwxbotcnfpjkwrsfyqj.supabase.co/functions/v1/send-auth-emails';
  payload jsonb;
BEGIN
  -- Only handle signup confirmations
  IF NEW.email_confirmed_at IS NULL AND OLD.email_confirmed_at IS NULL AND NEW.confirmation_token IS NOT NULL THEN
    payload := jsonb_build_object(
      'type', 'account-confirmation',
      'email', NEW.email,
      'data', jsonb_build_object(
        'confirmLink', 'https://organizese.chromotech.com.br/auth?token=' || NEW.confirmation_token || '&type=signup',
        'name', COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
      )
    );
    
    -- Call the webhook
    PERFORM net.http_post(
      url := webhook_url,
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}'::jsonb,
      body := payload
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;