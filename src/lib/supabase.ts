import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gwgfmmtwnaqtyhczrdxr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3Z2ZtbXR3bmFxdHloY3pyZHhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1MjI5MDUsImV4cCI6MjA0OTA5ODkwNX0.NFlxPF1PKP1UYIeE2qPPhOKSlSRFhzEVo9c8MzWmX7M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);