import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Paperclip, X, Upload, FileText, Image, File, Download, Loader2, Eye } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from '@/hooks/use-toast';
import { TaskAttachment } from '@/types';
import { AttachmentPreviewModal } from './AttachmentPreviewModal';
import { AttachmentThumbnail } from './AttachmentThumbnail';

interface TaskAttachmentsProps {
  attachments: TaskAttachment[];
  onAttachmentsChange: (attachments: TaskAttachment[]) => void;
  taskId?: string;
  readOnly?: boolean;
}

export function TaskAttachments({ attachments, onAttachmentsChange, taskId, readOnly = false }: TaskAttachmentsProps) {
  const { user } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<TaskAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const processFile = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 10MB",
        variant: "destructive"
      });
      return;
    }
    setPendingFiles(prev => [...prev, file]);
  }, []);

  const processMultipleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    
    for (const file of fileArray) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: `"${file.name}" excede o limite de 10MB`,
          variant: "destructive"
        });
      } else {
        validFiles.push(file);
      }
    }
    
    if (validFiles.length > 0) {
      setPendingFiles(prev => [...prev, ...validFiles]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processMultipleFiles(files);
    }
  };

  // Handle paste event (Ctrl+V)
  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (readOnly) return;
    
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Check if it's a file (image or other)
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          
          // Generate a name for pasted content
          const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
          let fileName = file.name;
          
          // For screenshots/clipboard images, generate a descriptive name
          if (file.type.startsWith('image/') && (!file.name || file.name === 'image.png')) {
            const ext = file.type.split('/')[1] || 'png';
            fileName = `screenshot_${timestamp}.${ext}`;
          }
          
          // Create a new file with the generated name if needed
          const blob = new Blob([file], { type: file.type });
          const processedFile = new window.File([blob], fileName, { type: file.type });
          processFile(processedFile);
          
          toast({
            title: "Arquivo colado",
            description: `"${fileName}" pronto para anexar.`
          });
          return;
        }
      }
    }
  }, [readOnly, processFile]);

  // Set up paste event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container || readOnly) return;

    // Listen for paste on the container
    const handleContainerPaste = (e: Event) => handlePaste(e as ClipboardEvent);
    container.addEventListener('paste', handleContainerPaste);

    // Also listen globally when container is focused
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (container.contains(document.activeElement) || document.activeElement === container) {
        handlePaste(e);
      }
    };
    document.addEventListener('paste', handleGlobalPaste);

    return () => {
      container.removeEventListener('paste', handleContainerPaste);
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, [handlePaste, readOnly]);

  const handleUploadAll = async () => {
    if (pendingFiles.length === 0 || !user?.id) return;
    
    setUploading(true);
    const newAttachments: TaskAttachment[] = [];
    
    try {
      for (const file of pendingFiles) {
        const displayName = file.name.replace(/\.[^/.]+$/, '');
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('task-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        newAttachments.push({
          id: crypto.randomUUID(),
          name: displayName,
          fileName: file.name,
          filePath,
          fileSize: file.size,
          mimeType: file.type,
          uploadedAt: new Date().toISOString()
        });
      }

      onAttachmentsChange([...attachments, ...newAttachments]);
      setPendingFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: "Arquivos anexados",
        description: `${newAttachments.length} arquivo(s) anexado(s) com sucesso.`
      });
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível enviar os arquivos",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (attachment: TaskAttachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('task-attachments')
        .download(attachment.filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Erro ao baixar arquivo:', error);
      toast({
        title: "Erro ao baixar",
        description: error.message || "Não foi possível baixar o arquivo",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (attachment: TaskAttachment) => {
    try {
      const { error } = await supabase.storage
        .from('task-attachments')
        .remove([attachment.filePath]);

      if (error) throw error;

      onAttachmentsChange(attachments.filter(a => a.id !== attachment.id));

      toast({
        title: "Arquivo removido",
        description: `"${attachment.name}" foi removido.`
      });
    } catch (error: any) {
      console.error('Erro ao deletar arquivo:', error);
      toast({
        title: "Erro ao remover",
        description: error.message || "Não foi possível remover o arquivo",
        variant: "destructive"
      });
    }
  };

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const cancelUpload = () => {
    setPendingFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="space-y-4"
      tabIndex={0}
      onFocus={() => {}}
    >
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Paperclip className="h-4 w-4" />
          Anexos
          {!readOnly && (
            <span className="text-xs text-muted-foreground font-normal ml-1">
              (Ctrl+V para colar)
            </span>
          )}
        </Label>
        {attachments.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {attachments.length} arquivo(s)
          </span>
        )}
      </div>

      {/* Lista de anexos existentes com thumbnails */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-1 gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-2 border rounded-lg bg-muted/50"
            >
              <AttachmentThumbnail 
                attachment={attachment} 
                size="sm"
                onClick={() => setPreviewAttachment(attachment)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachment.name}</p>
                <p className="text-xs text-muted-foreground">
                  {attachment.fileName} • {formatFileSize(attachment.fileSize)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewAttachment(attachment)}
                  title="Visualizar"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(attachment)}
                  title="Baixar arquivo"
                >
                  <Download className="h-4 w-4" />
                </Button>
                {!readOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(attachment)}
                    className="text-destructive hover:text-destructive"
                    title="Remover arquivo"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload de novos anexos */}
      {!readOnly && (
        <div className="space-y-3">
          {pendingFiles.length > 0 ? (
            <div className="space-y-3 p-3 border rounded-lg border-dashed">
              <p className="text-sm font-medium">{pendingFiles.length} arquivo(s) selecionado(s):</p>
              <div className="space-y-2">
                {pendingFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {getFileIcon(file.type)}
                    <span className="truncate flex-1">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive"
                      onClick={() => removePendingFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={cancelUpload}
                  disabled={uploading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  + Mais
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleUploadAll}
                  disabled={uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Anexar todos
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                multiple
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Selecionar arquivos para anexar
              </Button>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Máx. 10MB cada • Imagens, PDFs, documentos • Múltiplos arquivos
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal de preview */}
      <AttachmentPreviewModal
        attachment={previewAttachment}
        isOpen={!!previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />
    </div>
  );
}
