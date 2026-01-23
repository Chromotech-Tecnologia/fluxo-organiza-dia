-- Criar bucket para anexos de tarefas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('task-attachments', 'task-attachments', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'application/zip']);

-- Política para usuários verem seus próprios anexos
CREATE POLICY "Users can view their own task attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'task-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para usuários fazerem upload em suas próprias pastas
CREATE POLICY "Users can upload their own task attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'task-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para usuários atualizarem seus próprios anexos
CREATE POLICY "Users can update their own task attachments"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'task-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para usuários deletarem seus próprios anexos
CREATE POLICY "Users can delete their own task attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'task-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Adicionar coluna de anexos na tabela tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;