'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import { Trash2, Grid3X3, ArrowLeft, Camera, X } from 'lucide-react';

export default function FotosPage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadPhotos(); }, []);

  const loadPhotos = async () => {
    const user = await getCurrentUser();
    if (!user) return;
    const { data } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setPhotos(data || []);
  };

  const handleFileSelect = (file: File) => {
    setPreviewFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!previewFile) return;
    setUploading(true);

    const user = await getCurrentUser();
    if (!user) return;

    const fileName = `${user.id}/${Date.now()}-${previewFile.name}`;
    await supabase.storage.from('uploads').upload(fileName, previewFile);
    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);

    await supabase.from('photos').insert({
      user_id: user.id,
      title: title || previewFile.name,
      image_url: urlData.publicUrl,
    });

    setTitle('');
    setPreview(null);
    setPreviewFile(null);
    setUploading(false);
    setMessage('Foto publicada!');
    setTimeout(() => setMessage(''), 2500);
    loadPhotos();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('photos').delete().eq('id', id);
    setMessage('Foto removida.');
    setTimeout(() => setMessage(''), 2500);
    loadPhotos();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#080808] pb-24">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
        <Container>
          <div className="flex items-center h-14">
            <Link href="/dashboard" className="p-2 -ml-2 text-text-secondary hover:text-text-primary">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-base font-medium text-text-primary ml-2">Nova foto</h1>
          </div>
        </Container>
      </header>

      <Container size="small">
        <div className="py-6 space-y-6">
          {message && (
            <div className="px-4 py-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 text-sm text-center">
              {message}
            </div>
          )}

          {/* Preview ou Upload */}
          {preview ? (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-surface border border-border">
                <img src={preview} alt="Preview" className="w-full max-h-80 object-contain" />
                <button
                  onClick={() => { setPreview(null); setPreviewFile(null); }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Escreva um título..."
                className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent/30"
              />
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-3.5 bg-accent text-background rounded-xl font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50"
              >
                {uploading ? 'Publicando...' : 'Publicar foto'}
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file && file.type.startsWith('image/')) handleFileSelect(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-12 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-surface hover:bg-border/5'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-accent/5 flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-text-primary font-semibold text-lg mb-2">Arraste sua foto aqui</h3>
              <p className="text-text-muted text-sm mb-4">ou clique para escolher</p>
              <span className="px-4 py-2 bg-accent text-background rounded-xl text-sm font-medium">
                Selecionar arquivo
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
              />
            </div>
          )}

          {/* Grid de fotos */}
          {photos.length > 0 && (
            <div>
              <h3 className="text-text-primary font-medium text-sm mb-3 flex items-center gap-2">
                <Grid3X3 className="w-4 h-4" />
                Suas fotos ({photos.length})
              </h3>
              <div className="grid grid-cols-3 gap-1.5">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-surface border border-border">
                    <img src={photo.image_url} alt={photo.title} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Trash2 className="w-6 h-6 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}