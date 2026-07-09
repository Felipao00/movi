'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Camera, Home, User, Compass, Heart, X, ImagePlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';

export default function HomePage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => { initApp(); }, []);
  useEffect(() => { if (currentUser && photos.length > 0) loadLikes(); }, [currentUser, photos]);

  const initApp = async () => { setChecking(true); await checkUser(); await loadFeed(); setChecking(false); };

  const checkUser = async () => {
    const user = await getCurrentUser();
    if (user) {
      setCurrentUser(user);
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setUserProfile(profile);
      const { data: follows } = await supabase.from('follows').select('following_id').eq('follower_id', user.id);
      if (follows) setFollowingUsers(new Set(follows.map(f => f.following_id)));
      if (profile?.onboarding_done && typeof window !== 'undefined') {
        if (!localStorage.getItem('movi_tip_shown')) { setShowTip(true); localStorage.setItem('movi_tip_shown', 'true'); }
      }
    }
  };

  const loadFeed = async () => {
    try {
      const { data } = await supabase.from('photos').select(`id, title, image_url, created_at, user_id, profiles:user_id (id, username, full_name, avatar_url)`).order('created_at', { ascending: false }).limit(100);
      if (data) {
        const photosWithLikes = await Promise.all(data.map(async (photo) => { const { count } = await supabase.from('likes').select('*', { count: 'exact' }).eq('photo_id', photo.id); return { ...photo, likes_count: count || 0 }; }));
        const sorted = photosWithLikes.sort((a, b) => { const now = Date.now(); const dayAgo = now - 86400000; const scoreA = (followingUsers.has(a.user_id) ? 15 : 0) + (a.likes_count * 2) + (new Date(a.created_at).getTime() > dayAgo ? 2 : 0) + Math.random() * 2; const scoreB = (followingUsers.has(b.user_id) ? 15 : 0) + (b.likes_count * 2) + (new Date(b.created_at).getTime() > dayAgo ? 2 : 0) + Math.random() * 2; return scoreB - scoreA; });
        setPhotos(sorted.slice(0, 50));
      }
    } catch (err) { console.error('Erro:', err); } finally { setLoading(false); }
  };

  const loadLikes = async () => {
    if (!currentUser) return;
    const likesMap: Record<string, number> = {}; const userLikesMap: Record<string, boolean> = {};
    for (const photo of photos) { const { count } = await supabase.from('likes').select('*', { count: 'exact' }).eq('photo_id', photo.id); likesMap[photo.id] = count || 0; const { data: like } = await supabase.from('likes').select('*').eq('user_id', currentUser.id).eq('photo_id', photo.id).single(); userLikesMap[photo.id] = !!like; }
    setLikes(likesMap); setUserLikes(userLikesMap);
  };

  const handleLike = async (photoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); if (!currentUser) return;
    const isLiked = userLikes[photoId];
    if (isLiked) { await supabase.from('likes').delete().eq('user_id', currentUser.id).eq('photo_id', photoId); setLikes(prev => ({ ...prev, [photoId]: Math.max(0, (prev[photoId] || 1) - 1) })); setUserLikes(prev => ({ ...prev, [photoId]: false })); }
    else { await supabase.from('likes').insert({ user_id: currentUser.id, photo_id: photoId }); setLikes(prev => ({ ...prev, [photoId]: (prev[photoId] || 0) + 1 })); setUserLikes(prev => ({ ...prev, [photoId]: true })); const photo = photos.find(p => p.id === photoId); if (photo && currentUser.id !== photo.user_id) { await supabase.from('notifications').insert({ user_id: photo.user_id, from_user_id: currentUser.id, type: 'like', photo_id: photoId }); } }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { setUploadFile(file); const reader = new FileReader(); reader.onload = (ev) => setUploadPreview(ev.target?.result as string); reader.readAsDataURL(file); } };

  const handlePublish = async () => {
    if (!currentUser) return; if (!uploadFile && !uploadTitle.trim()) return;
    setUploading(true); let imageUrl = '';
    if (uploadFile) { const fileName = `${currentUser.id}/${Date.now()}-${uploadFile.name}`; await supabase.storage.from('uploads').upload(fileName, uploadFile); const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName); imageUrl = urlData.publicUrl; }
    await supabase.from('photos').insert({ user_id: currentUser.id, title: uploadTitle.trim(), image_url: imageUrl || '' });
    setUploadFile(null); setUploadPreview(null); setUploadTitle(''); setUploading(false); setShowUpload(false); loadFeed();
  };

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => { if (window.location.pathname === '/') router.push('/explorar'); },
    onSwipedRight: () => {},
    delta: 80,
  });

  if (checking) return (<div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center"><div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" /></div>);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
        <div className="flex-1 flex flex-col lg:flex-row">
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 items-center justify-center relative overflow-hidden"><div className="absolute inset-0 opacity-10"><div className="grid grid-cols-8 gap-4 h-full">{Array.from({ length: 64 }).map((_, i) => (<div key={i} className="border border-white/10 rounded-lg" />))}</div></div><div className="relative text-center px-12"><div className="w-32 h-32 flex items-center justify-center mx-auto mb-8"><img src="/logo-branca.png" alt="MOVI" className="w-24 h-24 object-contain" /></div><h1 className="font-signature text-7xl text-white mb-4">MOVI</h1><p className="text-white/60 text-lg font-light max-w-sm mx-auto leading-relaxed">Seu espaço para compartilhar momentos através da fotografia.</p></div><div className="absolute bottom-8 left-0 right-0 text-center"><p className="text-white/30 text-xs">From</p><p className="text-white/50 text-sm font-semibold">Bleth</p></div></div>
          <div className="flex-1 flex items-center justify-center p-6 lg:p-12"><div className="w-full max-w-sm"><div className="lg:hidden text-center mb-10"><div className="w-20 h-20 flex items-center justify-center mx-auto mb-4"><img src="/logo.png" alt="MOVI" className="w-16 h-16 object-contain" /></div><h1 className="font-signature text-5xl text-gray-900">MOVI</h1><p className="text-gray-500 text-sm mt-2">Seu espaço fotográfico</p></div><div className="hidden lg:block mb-10"><h2 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo ao MOVI</h2><p className="text-gray-500">Entre ou crie sua conta para começar.</p></div><div className="space-y-3"><Link href="/login" className="flex items-center justify-center w-full py-4 rounded-2xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition-all active:scale-[0.98]">Entrar na minha conta</Link><Link href="/cadastro" className="flex items-center justify-center w-full py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-900 font-medium text-sm hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-[0.98]">Criar novo espaço</Link></div><div className="mt-10 grid grid-cols-3 gap-4 text-center"><div><div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-2"><Camera className="w-5 h-5 text-gray-600" /></div><p className="text-gray-900 text-xs font-medium">Suas fotos</p></div><div><div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-2"><Compass className="w-5 h-5 text-gray-600" /></div><p className="text-gray-900 text-xs font-medium">Explore</p></div><div><div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-2"><User className="w-5 h-5 text-gray-600" /></div><p className="text-gray-900 text-xs font-medium">Conecte-se</p></div></div><p className="text-center text-gray-400 text-xs mt-8">Ao entrar, você concorda com nossos termos.</p><div className="lg:hidden text-center mt-8"><p className="text-gray-400 text-xs">From</p><p className="text-gray-500 text-sm font-semibold">Bleth</p></div></div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]" {...swipeHandlers}>
      <header className="fixed top-0 left-0 right-0 z-20 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-gray-200"><Container><div className="flex items-center justify-center h-14"><span className="font-signature text-4xl text-gray-900">Movi</span></div></Container></header>

      <main className="pt-16 pb-24">
        <Container>
          {loading ? (<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" /></div>) : photos.length === 0 ? (<div className="flex items-center justify-center min-h-[60vh]"><div className="text-center"><Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h1 className="text-2xl font-display text-gray-900 mb-2">Nenhuma foto ainda</h1><p className="text-gray-500 mb-6">Seja o primeiro a compartilhar</p></div></div>) : (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-2 space-y-2">
              {photos.map((photo) => (
                <div key={photo.id} className="break-inside-avoid cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                  {photo.image_url ? (<div className="rounded-lg overflow-hidden bg-gray-100 relative group"><img src={photo.image_url} alt={photo.title || ''} className="w-full h-auto" loading="lazy" /><div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"><div className="flex items-center gap-4 text-white"><span className="flex items-center gap-1 text-sm font-medium"><Heart className="w-5 h-5 fill-white" />{likes[photo.id] || 0}</span></div></div>{followingUsers.has(photo.user_id) && (<div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-medium">Seguindo</div>)}</div>) : (<div className="rounded-lg bg-gray-900 text-white p-4 aspect-square flex items-center justify-center relative group"><p className="text-sm font-medium text-center leading-relaxed">{photo.title}</p><div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"><div className="flex items-center gap-4 text-white"><span className="flex items-center gap-1 text-sm font-medium"><Heart className="w-5 h-5 fill-white" />{likes[photo.id] || 0}</span></div></div></div>)}
                </div>
              ))}
            </div>
          )}
        </Container>
      </main>

      <AnimatePresence>{showTip && (<motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed bottom-40 right-5 z-50 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-sm max-w-[180px]"><p className="font-medium">📸 Toque aqui para publicar sua primeira foto!</p><div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-gray-900 rotate-45" /><button onClick={() => setShowTip(false)} className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md"><X className="w-3.5 h-3.5 text-gray-900" /></button></motion.div>)}</AnimatePresence>

      <button onClick={() => { setShowUpload(true); setShowTip(false); }} className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-gray-900/80 backdrop-blur-sm text-white shadow-xl flex items-center justify-center hover:bg-gray-900 hover:scale-105 active:scale-95 transition-all lg:hidden border border-white/10"><ImagePlus className="w-7 h-7" strokeWidth={2} /></button>

      <AnimatePresence>{selectedPhoto && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black flex flex-col" onClick={() => setSelectedPhoto(null)}><div className="flex items-center justify-between p-4 text-white flex-shrink-0"><button onClick={() => setSelectedPhoto(null)} className="p-1"><X className="w-6 h-6" /></button><Link href={`/${selectedPhoto.profiles?.username}`} className="flex items-center gap-2" onClick={() => setSelectedPhoto(null)}><div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden">{selectedPhoto.profiles?.avatar_url ? <img src={selectedPhoto.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">{selectedPhoto.profiles?.full_name?.charAt(0)}</div>}</div><span className="text-sm font-medium">{selectedPhoto.profiles?.username}</span></Link><div className="w-8" /></div><div className="flex-1 flex items-center justify-center overflow-auto">{selectedPhoto.image_url ? <img src={selectedPhoto.image_url} alt={selectedPhoto.title || ''} className="max-w-full max-h-full object-contain" /> : <p className="text-white text-lg px-8 text-center">{selectedPhoto.title}</p>}</div><div className="p-4 text-white flex-shrink-0"><div className="flex items-center gap-4 mb-3"><button onClick={(e) => handleLike(selectedPhoto.id, e)} className="flex items-center gap-1.5"><Heart className={`w-7 h-7 transition-all ${userLikes[selectedPhoto.id] ? 'fill-red-500 text-red-500' : 'text-white'}`} /></button></div><p className="text-sm font-medium">{likes[selectedPhoto.id] || 0} curtida{(likes[selectedPhoto.id] || 0) !== 1 ? 's' : ''}</p>{selectedPhoto.title && <p className="text-sm mt-1"><Link href={`/${selectedPhoto.profiles?.username}`} className="font-medium" onClick={() => setSelectedPhoto(null)}>{selectedPhoto.profiles?.username}</Link> {selectedPhoto.title}</p>}</div></motion.div>)}</AnimatePresence>

      <AnimatePresence>{showUpload && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#FAFAFA] flex flex-col"><div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0"><button onClick={() => { setShowUpload(false); setUploadPreview(null); setUploadTitle(''); }} className="p-2 -ml-2 text-gray-500 hover:text-gray-900"><X className="w-5 h-5" /></button><span className="text-base font-semibold text-gray-900">Nova publicação</span><button onClick={handlePublish} disabled={(!uploadFile && !uploadTitle.trim()) || uploading} className="px-4 py-1.5 rounded-full bg-gray-900 text-white text-sm font-medium disabled:opacity-30 transition-all">{uploading ? '...' : 'Publicar'}</button></div><div className="flex-1 flex flex-col"><textarea value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="O que você quer compartilhar?" className="flex-1 w-full px-5 py-4 bg-transparent text-gray-900 placeholder:text-gray-400 text-lg resize-none focus:outline-none" autoFocus />{uploadPreview && (<div className="relative px-4 pb-4"><div className="relative rounded-2xl overflow-hidden"><img src={uploadPreview} alt="Preview" className="w-full max-h-80 object-cover" /><button onClick={() => { setUploadPreview(null); setUploadFile(null); }} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"><X className="w-4 h-4" /></button></div></div>)}</div><div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 flex-shrink-0"><label className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all cursor-pointer"><ImagePlus className="w-5 h-5" /><input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" /></label>{!uploadPreview && !uploadTitle.trim() && <p className="text-gray-400 text-xs ml-1">Adicione uma foto ou escreva algo</p>}</div></motion.div>)}</AnimatePresence>

      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[88%] max-w-sm"><nav className="bg-white/90 backdrop-blur-2xl border border-gray-200/50 rounded-3xl px-2 py-2.5 shadow-2xl shadow-black/5"><div className="flex items-center justify-around"><Link href="/" className="p-2.5 rounded-2xl text-gray-900 bg-gray-100"><Home className="w-6 h-6" strokeWidth={2.5} /></Link><Link href="/explorar" className="p-2.5 rounded-2xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"><Compass className="w-6 h-6" strokeWidth={2} /></Link>{userProfile ? (<Link href={`/${userProfile.username}`} className="p-2.5 rounded-2xl"><div className="w-6 h-6 rounded-full overflow-hidden ring-2 ring-gray-300">{userProfile.avatar_url ? <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px] font-bold bg-gray-100">{userProfile.full_name?.charAt(0)}</div>}</div></Link>) : (<Link href="/login" className="p-2.5 rounded-2xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"><User className="w-6 h-6" strokeWidth={2} /></Link>)}</div></nav></div>
    </div>
  );
}