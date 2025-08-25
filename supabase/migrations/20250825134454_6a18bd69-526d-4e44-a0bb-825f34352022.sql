-- Add missing INSERT and DELETE policies for profiles table
-- This fixes the security vulnerability that could allow account takeover

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = id);