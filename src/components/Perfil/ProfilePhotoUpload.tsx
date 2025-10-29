'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface ProfilePhotoUploadProps {
  userId: number;
  currentImage?: string | null;
  onImageChange: (imageUrl: string) => void;
  className?: string;
}

export default function ProfilePhotoUpload({ 
  userId,
  currentImage, 
  onImageChange, 
  className 
}: ProfilePhotoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(currentImage || null);
  }, [currentImage]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB.');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', String(userId)); // Ensure userId is sent as string

      const response = await fetch('/api/upload-profile-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Falha no upload da imagem.');
      }

      const result = await response.json();
      const newImageUrl = result.publicUrl;
      setPreviewUrl(newImageUrl);
      onImageChange(newImageUrl);

    } catch (e: any) {
      setError(e.message || 'Falha no upload da imagem. Tente novamente.');
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    setError(null);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <Camera className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Foto de Perfil</h3>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Foto de perfil"
                width={96}
                height={96}
                className="w-full h-full object-cover"
                onError={() => {
                  setError('Erro ao carregar a imagem.');
                  setPreviewUrl(null);
                }}
              />
            ) : (
              <User className="h-12 w-12 text-gray-400" />
            )}
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="photo-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="photo-upload"
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
              isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            )}
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'Enviando...' : 'Escolher arquivo'}
          </label>

          {previewUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemovePhoto}
              className="text-red-600 hover:text-red-700"
              disabled={isUploading}
            >
              <X className="h-4 w-4 mr-1" />
              Remover foto
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>• Formatos aceitos: JPG, PNG, GIF</p>
        <p>• Tamanho máximo: 5MB</p>
      </div>
    </div>
  );
}
 