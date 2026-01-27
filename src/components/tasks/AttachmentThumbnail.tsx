import { useState, useEffect } from 'react';
import { File, FileText, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TaskAttachment } from '@/types';
import { cn } from '@/lib/utils';

interface AttachmentThumbnailProps {
  attachment: TaskAttachment;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export function AttachmentThumbnail({ 
  attachment, 
  size = 'md', 
  onClick,
  className 
}: AttachmentThumbnailProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isImage = attachment.mimeType.startsWith('image/');
  
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  useEffect(() => {
    if (isImage) {
      loadThumbnail();
    } else {
      setLoading(false);
    }
    
    return () => {
      if (thumbnailUrl) {
        URL.revokeObjectURL(thumbnailUrl);
      }
    };
  }, [attachment.filePath]);

  const loadThumbnail = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('task-attachments')
        .download(attachment.filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      setThumbnailUrl(url);
    } catch (error) {
      console.error('Erro ao carregar thumbnail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = () => {
    if (attachment.mimeType.includes('pdf') || attachment.mimeType.includes('document')) {
      return <FileText className={iconSizes[size]} />;
    }
    if (attachment.mimeType.startsWith('image/')) {
      return <Image className={iconSizes[size]} />;
    }
    return <File className={iconSizes[size]} />;
  };

  return (
    <div
      className={cn(
        sizeClasses[size],
        'rounded-md overflow-hidden border bg-muted/50 flex items-center justify-center',
        onClick && 'cursor-pointer hover:border-primary transition-colors',
        className
      )}
      onClick={onClick}
    >
      {loading ? (
        <div className="animate-pulse bg-muted w-full h-full" />
      ) : isImage && thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={attachment.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="text-muted-foreground">
          {getFileIcon()}
        </div>
      )}
    </div>
  );
}
