import React, { useState, useRef } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Image from 'next/image';

interface ProfilePhotoUploadProps {
  currentImage?: string | null;
  onImageChange: (imageUrl: string) => void;
  className?: string;
}

export default function ProfilePhotoUpload({ 
  currentImage, 
  onImageChange, 
  className 
}: ProfilePhotoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB.');
      return;
    }

    setError(null);
    setIsUploading(true);

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      onImageChange(result);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlInput = (url: string) => {
    setError(null);
    if (url) {
      // Validar URL
      try {
        new URL(url);
        setPreviewUrl(url);
        onImageChange(url);
      } catch {
        setError('Por favor, insira uma URL válida.');
      }
    } else {
      setPreviewUrl(null);
      onImageChange('');
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

      {/* Preview da Foto */}
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
                onError={() => setError('Erro ao carregar a imagem. Verifique a URL.')}
              />
            ) : (
              <User className="h-12 w-12 text-gray-400" />
            )}
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          {/* Upload de Arquivo */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              Escolher arquivo
            </label>
          </div>

          {/* Ou URL */}
          <div>
            <input
              type="url"
              placeholder="Ou cole uma URL da imagem"
              onChange={(e) => handleUrlInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Remover */}
          {previewUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemovePhoto}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" />
              Remover foto
            </Button>
          )}
        </div>
      </div>

      {/* Mensagens de Erro */}
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      {/* Dicas */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Formatos aceitos: JPG, PNG, GIF</p>
        <p>• Tamanho máximo: 5MB</p>
        <p>• Você pode fazer upload de um arquivo ou colar uma URL</p>
      </div>
    </div>
  );
} 