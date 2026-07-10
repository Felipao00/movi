'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import { Camera, ArrowLeft, Settings, Grid3X3, Home, Compass, User, Heart, X, Shield, MoreHorizontal, Pin, Trash2, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const framesConfig: Record<string, { gradient: string; animation: string }> = {
  original: { gradient: 'bg-gradient-to-r from-gray-400 to-gray-600', animation: '' },
  aurora: { gradient: 'bg-gradient-to-r from-purple-500 via-blue-500 to-green-400', animation: 'animate-spin-slow' },
  neon: { gradient: 'bg-gradient-to-r from-pink-500 to-purple-600', animation: 'animate-pulse' },
  golden: { gradient: 'bg-gradient-to-r from-amber-400 to-yellow-500', animation: 'animate-spin-slow' },
  minimal: { gradient: 'bg-gradient-to-r from-gray-900 to-gray-900', animation: '' },
};

function BioText({ text, maxLength }: { text: string; maxLength: number }) {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = text.length > maxLength;
  const displayText = expanded || !shouldTruncate ? text : text.slice(0, maxLength) + '...';
  return (
    <div className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed mb-4 whitespace-pre-line">
      {displayText}
      {shouldTruncate && (<button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-700 ml-1 text-xs font-medium">{expanded ? 'menos' : 'mais'}</button>)}
    </div>
  );
}

export default function PublicProfilePage() {
  const { username } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [showVerifiedInfo, setShowVerifiedInfo] = useState(false);
  const [menuPhoto, setMenuPhoto] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = React.useRef(0);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  const avatarPressTimer = React.useRef<any>(null);

  useEffect(() => { loadProfile(); checkUser(); }, [username]);
  useEffect(() => { const closeMenu = () => setMenuPhoto(null); if (menuPhoto) { document.addEventListener('click', closeMenu); return () => document.removeEventListener('click', closeMenu); } }, [menuPhoto]);

  const checkUser = async () => { const user = await getCurrentUser(); if (user) { setCurrentUser(user); const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single(); setUserProfile(data); } };

  const loadProfile = async () => {
    const cleanUsername = decodeURIComponent(String(username)).replace('@', '');
    const { data: profileData } = await supabase.from('profiles').select('*').eq('username', cleanUsername).single();
    if (profileData) {
      setProfile(profileData);
      const { data: photosData } = await supabase.from('photos').select('*').eq('user_id', profileData.id).order('pinned', { ascending: false }).order('created_at', { ascending: false });
      setPhotos(photosData || []);
      if (photosData) { const likesMap: Record<string, number> = {}; const userLikesMap: Record<string, boolean> = {}; for (const photo of photosData) { const { count } = await supabase.from('likes').select('*', { count: 'exact' }).eq('photo_id', photo.id); likesMap[photo.id] = count || 0; if (currentUser) { const { data: like } = await supabase.from('likes').select('*').eq('user_id', currentUser.id).eq('photo_id', photo.id).single(); userLikesMap[photo.id] = !!like; } } setLikes(likesMap); setUserLikes(userLikesMap); }
      const { count: followers } = await supabase.from('follows').select('*', { count: 'exact' }).eq('following_id', profileData.id); setFollowersCount(followers || 0);
      const { count: following } = await supabase.from('follows').select('*', { count: 'exact' }).eq('follower_id', profileData.id); setFollowingCount(following || 0);
      const user = await getCurrentUser(); if (user?.id === profileData.id) setIsOwner(true); else if (user) { const { data: follow } = await supabase.from('follows').select('*').eq('follower_id', user.id).eq('following_id', profileData.id).single(); setIsFollowing(!!follow); }
    }
    setLoading(false);
  };

  const handleRefresh = async () => { setRefreshing(true); await loadProfile(); setRefreshing(false); };
  const handleTouchStart = (e: React.TouchEvent) => { if (window.scrollY === 0) touchStartY.current = e.touches[0].clientY; };
  const handleTouchMove = (e: React.TouchEvent) => { if (touchStartY.current > 0) { const distance = e.touches[0].clientY - touchStartY.current; if (distance > 0 && distance < 100) setPullDistance(distance); } };
  const handleTouchEnd = () => { if (pullDistance > 60) handleRefresh(); touchStartY.current = 0; setPullDistance(0); };

  const handleAvatarPressStart = () => { avatarPressTimer.current = setTimeout(() => setShowAvatarPreview(true), 500); };
  const handleAvatarPressEnd = () => { if (avatarPressTimer.current) { clearTimeout(avatarPressTimer.current); } };

  const handleLike = async (photoId: string) => { if (!currentUser) { router.push('/login'); return; } const isLiked = userLikes[photoId]; if (isLiked) { await supabase.from('likes').delete().eq('user_id', currentUser.id).eq('photo_id', photoId); setLikes(prev => ({ ...prev, [photoId]: Math.max(0, (prev[photoId] || 1) - 1) })); setUserLikes(prev => ({ ...prev, [photoId]: false })); } else { await supabase.from('likes').insert({ user_id: currentUser.id, photo_id: photoId }); setLikes(prev => ({ ...prev, [photoId]: (prev[photoId] || 0) + 1 })); setUserLikes(prev => ({ ...prev, [photoId]: true })); if (currentUser.id !== profile.id) { await supabase.from('notifications').insert({ user_id: profile.id, from_user_id: currentUser.id, type: 'like', photo_id: photoId }); } } };
  const handleFollow = async () => { const user = await getCurrentUser(); if (!user) { router.push('/login'); return; } if (isFollowing) { await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', profile.id); setIsFollowing(false); setFollowersCount(followersCount - 1); } else { await supabase.from('follows').insert({ follower_id: user.id, following_id: profile.id }); setIsFollowing(true); setFollowersCount(followersCount + 1); await supabase.from('notifications').insert({ user_id: profile.id, from_user_id: user.id, type: 'follow' }); } };
  const handlePin = async (photo: any) => { await supabase.from('photos').update({ pinned: !photo.pinned }).eq('id', photo.id); setMenuPhoto(null); loadProfile(); };
  const handleDelete = (photo: any) => { setPhotoToDelete(photo); setMenuPhoto(null); setShowDeleteConfirm(true); };
  const confirmDelete = async () => { if (photoToDelete) { await supabase.from('photos').delete().eq('id', photoToDelete.id); setShowDeleteConfirm(false); setPhotoToDelete(null); setSelectedPhoto(null); loadProfile(); } };
  const handleEdit = (photo: any) => { setEditTitle(photo.title || ''); setMenuPhoto(null); setSelectedPhoto(photo); setShowEditModal(true); };
  const saveEdit = async () => { if (selectedPhoto) { await supabase.from('photos').update({ title: editTitle }).eq('id', selectedPhoto.id); setShowEditModal(false); setSelectedPhoto({ ...selectedPhoto, title: editTitle }); loadProfile(); } };

  if (loading) return (<div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center"><div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" /></div>);
  if (!profile) return (<div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center"><div className="text-center"><Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h1 className="text-xl font-display text-gray-900 mb-2">Usuário não encontrado</h1><Link href="/" className="text-gray-500 hover:text-gray-900 text-sm">Voltar</Link></div></div>);

  const activeFrame = profile?.active_frame;
  const frameConfig = activeFrame ? framesConfig[activeFrame] : null;

  return (
    <div className="min-h-screen bg-[#FAFAFA]" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <header className="sticky top-0 z-20 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-gray-200"><Container><div className="flex items-center justify-between h-14"><button onClick={() => router.push('/')} className="p-2 -ml-2 text-gray-500 hover:text-gray-900"><ArrowLeft className="w-5 h-5" /></button><span className="text-base font-medium text-gray-900">@{profile.username}</span>{isOwner ? <Link href="/dashboard/configuracoes" className="p-2 text-gray-500 hover:text-gray-900"><Settings className="w-4 h-4" /></Link> : <div className="w-8" />}</div></Container></header>

      {pullDistance > 30 && (<div className="fixed top-16 left-1/2 -translate-x-1/2 z-30"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" style={{ opacity: Math.min(pullDistance / 60, 1) }} /></div>)}
      {refreshing && (<div className="fixed top-16 left-1/2 -translate-x-1/2 z-30"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" /></div>)}

      <main className="pb-24">
        <Container size="small">
          <div className="py-8 text-center">
            <div className="cursor-pointer" onTouchStart={handleAvatarPressStart} onTouchEnd={handleAvatarPressEnd} onTouchMove={handleAvatarPressEnd} onMouseDown={handleAvatarPressStart} onMouseUp={handleAvatarPressEnd} onMouseLeave={handleAvatarPressEnd}>
              {frameConfig ? (
                <div className="relative inline-block mx-auto mb-4"><div className={`absolute -inset-[3px] rounded-full ${frameConfig.gradient} ${frameConfig.animation} opacity-70`} /><div className="absolute -inset-[1px] rounded-full bg-white" /><div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-white">{profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">{profile.full_name?.charAt(0) || '?'}</div>}</div></div>
              ) : profile.verified && profile.username === 'lipe' ? (
                <div className="relative inline-block mx-auto mb-4"><div className="absolute -inset-[3px] rounded-full bg-gradient-conic from-amber-400 via-black to-amber-400 animate-spin-slow opacity-70" /><div className="absolute -inset-[1px] rounded-full bg-white" /><div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-white">{profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">{profile.full_name?.charAt(0) || '?'}</div>}</div></div>
              ) : profile.verified ? (
                <div className="w-[104px] h-[104px] rounded-full bg-gradient-to-r from-blue-400 to-blue-500 p-[3px] mx-auto mb-4"><div className="w-full h-full rounded-full bg-white p-[2px]"><div className="w-full h-full rounded-full overflow-hidden bg-gray-100">{profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">{profile.full_name?.charAt(0) || '?'}</div>}</div></div></div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden mx-auto mb-4">{profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">{profile.full_name?.charAt(0) || '?'}</div>}</div>
              )}
            </div>

            <div className="flex items-center justify-center gap-1.5 mb-1"><h1 className="text-xl font-bold text-gray-900">{profile.full_name}</h1>{profile.verified && (<button onClick={() => setShowVerifiedInfo(true)} className="inline-flex items-center justify-center"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#0095F6"/><path d="M8.5 12L11 14.5L15.5 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>)}</div>
            {profile.bio && <BioText text={profile.bio} maxLength={100} />}
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="text-center"><p className="text-lg font-bold text-gray-900">{photos.length}</p><p className="text-gray-500 text-xs">publis</p></div>
              <Link href={`/${profile.username}/seguidores`} className="text-center hover:opacity-80 transition-opacity"><p className="text-lg font-bold text-gray-900">{followersCount}</p><p className="text-gray-500 text-xs">conectados</p></Link>
              <Link href={`/${profile.username}/seguindo`} className="text-center hover:opacity-80 transition-opacity"><p className="text-lg font-bold text-gray-900">{followingCount}</p><p className="text-gray-500 text-xs">seguindo</p></Link>
            </div>
            
            {isOwner ? (
              <div className="flex gap-2 justify-center">
                <Link href="/dashboard/perfil?from=profile" className="inline-flex px-5 py-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-900 text-sm font-medium">Editar perfil</Link>
                <Link href="/dashboard/insights" className="inline-flex px-5 py-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-900 text-sm font-medium">Insights</Link>
              </div>
            ) : (
              <button onClick={handleFollow} className={`inline-flex px-8 py-2 rounded-lg text-sm font-medium transition-all ${isFollowing ? 'bg-gray-100 border border-gray-200 text-gray-900' : 'bg-gray-900 text-white'}`}>{isFollowing ? 'Seguindo' : 'Seguir'}</button>
            )}
          </div>

          {photos.length === 0 ? (<div className="text-center py-16"><Grid3X3 className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Nenhuma foto ainda</p></div>) : (
            <div className="columns-2 gap-2 space-y-2">
              {photos.map((photo) => (
                <div key={photo.id} className="break-inside-avoid relative group">
                  <div className="cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                    {photo.image_url ? (<div className="rounded-lg overflow-hidden bg-gray-100"><img src={photo.image_url} alt={photo.title} className="w-full h-auto" loading="lazy" />{photo.pinned && (<div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/80 backdrop-blur-sm text-gray-900 text-[10px] font-bold flex items-center gap-1"><Pin className="w-3 h-3" /> Fixado</div>)}<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"><div className="flex items-center gap-3 text-white"><span className="flex items-center gap-1"><Heart className="w-5 h-5 fill-white" />{likes[photo.id] || 0}</span></div></div></div>) : (<div className="rounded-lg bg-gray-900 text-white p-4 aspect-square flex items-center justify-center relative"><p className="text-sm font-medium text-center leading-relaxed">{photo.title}</p><div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"><div className="flex items-center gap-3 text-white"><span className="flex items-center gap-1"><Heart className="w-5 h-5 fill-white" />{likes[photo.id] || 0}</span></div></div></div>)}
                  </div>
                  {isOwner && (<div className="absolute top-2 right-2 z-10"><button onClick={(e) => { e.stopPropagation(); setMenuPhoto(menuPhoto?.id === photo.id ? null : photo); }} className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white shadow-sm"><MoreHorizontal className="w-4 h-4" /></button>{menuPhoto?.id === photo.id && (<div className="absolute top-8 right-0 bg-white rounded-xl shadow-xl border border-gray-200 py-1 min-w-[140px] z-20" onClick={(e) => e.stopPropagation()}><button onClick={() => handlePin(photo)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><Pin className="w-4 h-4" /> {photo.pinned ? 'Desafixar' : 'Fixar'}</button><button onClick={() => handleEdit(photo)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><Edit3 className="w-4 h-4" /> Editar</button><button onClick={() => handleDelete(photo)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /> Deletar</button></div>)}</div>)}
                </div>
              ))}
            </div>
          )}
        </Container>
      </main>

      <AnimatePresence>{showAvatarPreview && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/80 flex flex-col items-center justify-center p-4" onClick={() => setShowAvatarPreview(false)} onTouchEnd={() => setShowAvatarPreview(false)}><motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="w-72 h-72 rounded-full overflow-hidden shadow-2xl">{profile.avatar_url ? <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center text-8xl font-bold text-gray-400">{profile.full_name?.charAt(0) || '?'}</div>}</motion.div><p className="mt-6 text-white text-lg font-semibold">{profile.full_name}</p><p className="text-white/60 text-sm">@{profile.username}</p></motion.div>)}</AnimatePresence>

      <AnimatePresence>{selectedPhoto && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black flex flex-col" onClick={() => setSelectedPhoto(null)}><div className="flex items-center justify-between p-4 text-white flex-shrink-0"><button onClick={() => setSelectedPhoto(null)} className="p-1"><X className="w-6 h-6" /></button><Link href={`/${profile.username}`} className="flex items-center gap-2" onClick={() => setSelectedPhoto(null)}><div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden">{profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">{profile.full_name?.charAt(0)}</div>}</div><span className="text-sm font-medium">{profile.username}</span></Link>{isOwner && <button onClick={() => { setShowEditModal(true); setEditTitle(selectedPhoto.title || ''); }} className="p-1"><Edit3 className="w-5 h-5" /></button>}</div><div className="flex-1 flex items-center justify-center overflow-auto">{selectedPhoto.image_url ? <img src={selectedPhoto.image_url} alt={selectedPhoto.title} className="max-w-full max-h-full object-contain" /> : <p className="text-white text-lg px-8 text-center">{selectedPhoto.title}</p>}</div><div className="p-4 text-white flex-shrink-0"><div className="flex items-center gap-4 mb-3"><button onClick={() => handleLike(selectedPhoto.id)} className="flex items-center gap-1.5"><Heart className={`w-7 h-7 transition-all ${userLikes[selectedPhoto.id] ? 'fill-red-500 text-red-500' : 'text-white'}`} /></button></div><p className="text-sm font-medium">{likes[selectedPhoto.id] || 0} curtida{(likes[selectedPhoto.id] || 0) !== 1 ? 's' : ''}</p>{selectedPhoto.title && <p className="text-sm mt-1"><span className="font-medium">{profile.username}</span> {selectedPhoto.title}</p>}</div></motion.div>)}</AnimatePresence>

      <AnimatePresence>{showEditModal && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}><h3 className="text-lg font-bold text-gray-900 mb-4">Editar foto</h3><input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Descrição da foto..." className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-gray-900 mb-4" autoFocus /><div className="flex gap-2"><button onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm font-medium">Cancelar</button><button onClick={saveEdit} className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium">Salvar</button></div></motion.div></motion.div>)}</AnimatePresence>

      <AnimatePresence>{showDeleteConfirm && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="text-center"><div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-7 h-7 text-red-500" /></div><h3 className="text-lg font-bold text-gray-900 mb-2">Deletar foto?</h3><p className="text-gray-500 text-sm mb-6">Esta ação não pode ser desfeita.</p><div className="flex gap-3"><button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm font-medium">Cancelar</button><button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium">Deletar</button></div></div></motion.div></motion.div>)}</AnimatePresence>

      <AnimatePresence>{showVerifiedInfo && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowVerifiedInfo(false)}><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="text-center"><div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200"><svg className="w-12 h-12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="white" opacity="0.2"/><path d="M8.5 12L11 14.5L15.5 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div><h2 className="text-xl font-bold text-gray-900 mb-1">Conta Verificada</h2><p className="text-gray-500 text-sm mb-5">Este selo confirma a autenticidade desta conta na MOVI.</p><div className="bg-gray-50 rounded-2xl p-5 text-left space-y-3 mb-4"><div className="flex items-center justify-between"><span className="text-gray-500 text-sm">Usuário</span><span className="text-gray-900 text-sm font-semibold">@{profile.username}</span></div><div className="flex items-center justify-between"><span className="text-gray-500 text-sm">Nome</span><span className="text-gray-900 text-sm font-semibold">{profile.full_name}</span></div><div className="flex items-center justify-between"><span className="text-gray-500 text-sm">Entrou em</span><span className="text-gray-900 text-sm font-semibold">{profile.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</span></div><div className="flex items-center justify-between"><span className="text-gray-500 text-sm">País</span><span className="text-gray-900 text-sm font-semibold">Brasil 🇧🇷</span></div><div className="flex items-center justify-between"><span className="text-gray-500 text-sm">Verificado em</span><span className="text-gray-900 text-sm font-semibold">{profile.verified_at ? new Date(profile.verified_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div><div className="flex items-center justify-between"><span className="text-gray-500 text-sm">Tipo</span><span className="text-gray-900 text-sm font-semibold">{profile.username === 'lipe' ? 'Fundador' : 'Criador de conteúdo'}</span></div></div><div className="bg-blue-50 rounded-2xl p-4 text-left mb-4"><div className="flex items-start gap-2"><Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" /><div><p className="text-blue-800 text-xs font-semibold mb-1">Por que esta conta é verificada?</p><p className="text-blue-700 text-xs leading-relaxed">{profile.username === 'lipe' ? 'Felipe é o fundador da MOVI.' : 'Esta conta foi verificada pela equipe MOVI.'}</p></div></div></div><button onClick={() => setShowVerifiedInfo(false)} className="w-full py-3 rounded-xl bg-gray-100 text-gray-900 text-sm font-medium hover:bg-gray-200 transition-all">Entendi</button></div></motion.div></motion.div>)}</AnimatePresence>

      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[88%] max-w-sm"><nav className="bg-white/90 backdrop-blur-2xl border border-gray-200/50 rounded-3xl px-2 py-2.5 shadow-2xl shadow-black/5"><div className="flex items-center justify-around"><Link href="/" className="p-2.5 rounded-2xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"><Home className="w-6 h-6" strokeWidth={2} /></Link><Link href="/explorar" className="p-2.5 rounded-2xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"><Compass className="w-6 h-6" strokeWidth={2} /></Link>{currentUser && userProfile ? (<Link href={`/${userProfile.username}`} className="p-2.5 rounded-2xl"><div className={`w-6 h-6 rounded-full overflow-hidden ${userProfile.username === profile.username ? 'ring-2 ring-gray-900' : 'ring-2 ring-gray-300'}`}>{userProfile.avatar_url ? <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px] font-bold bg-gray-100">{userProfile.full_name?.charAt(0)}</div>}</div></Link>) : (<Link href="/login" className="p-2.5 rounded-2xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"><User className="w-6 h-6" strokeWidth={2} /></Link>)}</div></nav></div>
    </div>
  );
}