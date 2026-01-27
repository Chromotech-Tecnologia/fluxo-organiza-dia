import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCw, Download, X } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { TaskAttachment } from '@/types';

interface AttachmentPreviewModalProps {
  attachment: TaskAttachment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AttachmentPreviewModal({ attachment, isOpen, onClose }: AttachmentPreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (attachment && isOpen && attachment.mimeType.startsWith('image/')) {
      loadImage();
    }
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [attachment, isOpen]);

  const loadImage = async () => {
    if (!attachment) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('task-attachments')
        .download(attachment.filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      setImageUrl(url);
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!attachment) return;
    
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
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleClose = () => {
    setZoom(1);
    setRotation(0);
    setImageUrl(null);
    onClose();
  };

  const isImage = attachment?.mimeType.startsWith('image/');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="truncate pr-4">
              {attachment?.name || 'Anexo'}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {isImage && (
                <>
                  <Button variant="outline" size="sm" onClick={handleZoomOut} title="Diminuir zoom">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground min-w-12 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button variant="outline" size="sm" onClick={handleZoomIn} title="Aumentar zoom">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRotate} title="Rotacionar">
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={handleDownload} title="Baixar">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[400px] max-h-[calc(90vh-80px)] bg-muted/30">
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : isImage && imageUrl ? (
            <div 
              className="overflow-auto w-full h-full flex items-center justify-center"
              style={{ cursor: zoom > 1 ? 'move' : 'default' }}
            >
              <img
                src={imageUrl}
                alt={attachment?.name || 'Preview'}
                className="max-w-none transition-transform duration-200"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                }}
              />
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium mb-2">Pré-visualização não disponível</p>
              <p className="text-sm">Tipo: {attachment?.mimeType}</p>
              <Button variant="outline" className="mt-4" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Baixar arquivo
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
