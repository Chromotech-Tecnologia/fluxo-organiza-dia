import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Paperclip, X, Upload, FileText, Image, File, Download, Loader2, Clipboard } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from '@/hooks/use-toast';

export interface TaskAttachment {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

interface TaskAttachmentsProps {
  attachments: TaskAttachment[];
  onAttachmentsChange: (attachments: TaskAttachment[]) => void;
  taskId?: string;
  readOnly?: boolean;
}

export function TaskAttachments({ attachments, onAttachmentsChange, taskId, readOnly = false }: TaskAttachmentsProps) {
  const { user } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
    setSelectedFile(file);
    if (!newAttachmentName) {
      // Remove a extensão do nome do arquivo para usar como nome padrão
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
      setNewAttachmentName(nameWithoutExtension);
    }
  }, [newAttachmentName]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
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

  const handleUpload = async () => {
    if (!selectedFile || !user?.id) return;

    const displayName = newAttachmentName.trim() || selectedFile.name.replace(/\.[^/.]+$/, '');
    
    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const newAttachment: TaskAttachment = {
        id: crypto.randomUUID(),
        name: displayName,
        fileName: selectedFile.name,
        filePath,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        uploadedAt: new Date().toISOString()
      };

      onAttachmentsChange([...attachments, newAttachment]);
      setSelectedFile(null);
      setNewAttachmentName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: "Arquivo anexado",
        description: `"${displayName}" foi anexado com sucesso.`
      });
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível enviar o arquivo",
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

  const cancelUpload = () => {
    setSelectedFile(null);
    setNewAttachmentName('');
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

      {/* Lista de anexos existentes */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50"
            >
              {getFileIcon(attachment.mimeType)}
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

      {/* Upload de novo anexo */}
      {!readOnly && (
        <div className="space-y-3">
          {selectedFile ? (
            <div className="space-y-3 p-3 border rounded-lg border-dashed">
              <div className="flex items-center gap-2">
                {getFileIcon(selectedFile.type)}
                <span className="text-sm truncate flex-1">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="attachmentName" className="text-xs">
                  Nome do anexo
                </Label>
                <Input
                  id="attachmentName"
                  value={newAttachmentName}
                  onChange={(e) => setNewAttachmentName(e.target.value)}
                  placeholder="Digite um nome para o anexo"
                  className="h-9"
                />
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
                  size="sm"
                  onClick={handleUpload}
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
                      Anexar
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
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Selecionar arquivo para anexar
              </Button>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Máx. 10MB • Imagens, PDFs, documentos
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
