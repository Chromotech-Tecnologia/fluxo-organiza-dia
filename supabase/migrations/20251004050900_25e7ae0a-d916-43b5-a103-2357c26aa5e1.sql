-- Fix RLS policies referencing auth.users in team_invitations
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'team_invitations' 
      AND policyname = 'Users can view invitations sent to their email'
  ) THEN
    DROP POLICY "Users can view invitations sent to their email" ON public.team_invitations;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'team_invitations' 
      AND policyname = 'Recipients can update invitations sent to them'
  ) THEN
    DROP POLICY "Recipients can update invitations sent to them" ON public.team_invitations;
  END IF;
END $$;

-- Ensure safe policies relying on recipient_user_id/sender_user_id exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'team_invitations' 
      AND policyname = 'Users can view invitations sent to them'
  ) THEN
    CREATE POLICY "Users can view invitations sent to them"
      ON public.team_invitations FOR SELECT
      USING (auth.uid() = recipient_user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'team_invitations' 
      AND policyname = 'Users can view invitations they sent'
  ) THEN
    CREATE POLICY "Users can view invitations they sent"
      ON public.team_invitations FOR SELECT
      USING (auth.uid() = sender_user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'team_invitations' 
      AND policyname = 'Recipients can update invitations'
  ) THEN
    CREATE POLICY "Recipients can update invitations"
      ON public.team_invitations FOR UPDATE
      USING (auth.uid() = recipient_user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'team_invitations' 
      AND policyname = 'Users can update their sent invitations'
  ) THEN
    CREATE POLICY "Users can update their sent invitations"
      ON public.team_invitations FOR UPDATE
      USING (auth.uid() = sender_user_id);
  END IF;
END $$;
