-- Add welcome_shown column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN welcome_shown boolean DEFAULT false;