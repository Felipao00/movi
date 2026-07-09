'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import { Camera, ArrowLeft } from 'lucide-react';

export default function PerfilPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = searchParams.get('novo') === 'true';
  const fromProfile = searchParams.get('from') === 'profile';

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    const user = await getCurrentUser();
    if (!user) { router.push('/login'); return; }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      setFullName(data.full_name || '');
      setUsername(data.username || '');
      setBio(data.bio || '');
      setAvatarUrl(data.avatar_url || '');
      setCharCount((data.bio || '').length);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!fullName.trim()) { setMessage('Nome é obrigatório'); return; }
    if (!username.trim()) { setMessage('Nome de usuário é obrigatório'); return; }
    setSaving(true);
    const user = await getCurrentUser();
    if (!user) return;
    const { error } = await supabase.from('profiles').update({
      full_name: fullName.trim(),
      username: username.trim().toLowerCase().replace(/[^a-z0-9]/g, ''),
      bio: bio.trim(),
    }).eq('id', user.id);
    if (error) {
      setMessage(error.message.includes('unique') ? 'Este nome de usuário já está em uso' : 'Erro ao salvar');
    } else {
      setMessage('Perfil salvo!');
      setTimeout(() => router.push(`/${username.trim().toLowerCase()}`), 500);
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const user = await getCurrentUser();
    if (!user) return;
    const fileName = `avatars/${user.id}-${Date.now()}`;
    await supabase.storage.from('uploads').upload(fileName, file);
    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', user.id);
    setAvatarUrl(urlData.publicUrl);
  };

  const handleBack = () => {
    if (fromProfile) router.push(`/${username || 'perfil'}`);
    else router.push('/dashboard/configuracoes');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-gray-200">
        <Container>
          <div className="flex items-center justify-between h-14">
            <button onClick={handleBack} className="p-2 -ml-2 text-gray-500 hover:text-gray-900"><ArrowLeft className="w-5 h-5" /></button>
            <h1 className="text-base font-medium text-gray-900">{isNew ? 'Completar perfil' : 'Editar perfil'}</h1>
            <button onClick={handleSave} disabled={saving} className="p-2 -mr-2 text-gray-900 font-medium text-sm disabled:opacity-50">{saving ? '...' : 'Salvar'}</button>
          </div>
        </Container>
      </header>

      <Container size="small">
        <div className="py-8">
          {message && (
            <div className={`mb-6 px-4 py-3 rounded-xl text-sm text-center ${message.includes('salvo') ? 'bg-green-50 border border-green-200 text-green-600' : 'bg-red-50 border border-red-200 text-red-600'}`}>{message}</div>
          )}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden">
                {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Camera className="w-8 h-8 text-gray-300" /></div>}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center cursor-pointer shadow-lg"><Camera className="w-4 h-4" /><input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" /></label>
            </div>
          </div>
          <div className="space-y-5">
            <div><label className="text-gray-500 text-xs font-medium block mb-2">Nome completo</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome" className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-300 text-sm focus:outline-none focus:border-gray-900" /></div>
            <div><label className="text-gray-500 text-xs font-medium block mb-2">Nome de usuário</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))} placeholder="@seuuser" className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-300 text-sm focus:outline-none focus:border-gray-900" /></div>
            <div><label className="text-gray-500 text-xs font-medium block mb-2">Bio ({charCount}/200)</label><textarea value={bio} onChange={(e) => { if (e.target.value.length <= 200) { setBio(e.target.value); setCharCount(e.target.value.length); } }} placeholder="Conte um pouco sobre você..." rows={3} maxLength={200} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-300 text-sm focus:outline-none focus:border-gray-900 resize-none" /></div>
          </div>
          <button onClick={handleSave} disabled={saving} className="w-full mt-8 py-3.5 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-all disabled:opacity-50">{saving ? 'Salvando...' : isNew ? 'Criar perfil' : 'Salvar alterações'}</button>
        </div>
      </Container>
    </div>
  );
}