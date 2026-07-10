'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Home, Compass, User, Heart, Play, MessageCircle, Repeat2, Share, Plus, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MomentsPage() {
  const [moments, setMoments] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [showStoryUpload, setShowStoryUpload] = useState(false);
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storyPreview, setStoryPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { initApp(); }, []);

  const initApp = async () => {
    await checkUser();
    await loadStories();
    await loadMoments();
  };

  const checkUser = async () => {
    const user = await getCurrentUser();
    if (user) {
      setCurrentUser(user);
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setUserProfile(profile);
    }
  };

  const loadStories = async () => {
    const { data } = await supabase
      .from('stories')
      .select(`*, profiles:user_id (id, username, full_name, avatar_url)`)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(20);
    setStories(data || []);
  };

  const loadMoments = async () => {
    // GLOBAL - todas as pessoas
    const { data } = await supabase
      .from('photos')
      .select(`id, title, image_url, created_at, user_id, profiles:user_id (id, username, full_name, avatar_url, verified)`)
      .order('created_at', { ascending: false })
      .limit(30);
    setMoments(data || []);
    setLoading(false);
  };

  const handleStoryUpload = async () => {
    if (!storyFile || !currentUser) return;
    setUploading(true);
    const fileName = `stories/${currentUser.id}/${Date.now()}-${storyFile.name}`;
    await supabase.storage.from('uploads').upload(fileName, storyFile);
    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    await supabase.from('stories').insert({ user_id: currentUser.id, image_url: urlData.publicUrl });
    setStoryFile(null); setStoryPreview(null); setShowStoryUpload(false); setUploading(false);
    loadStories();
  };

  const timeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  // Agrupa stories por usuário
  const storyUsers = stories.reduce((acc: any[], story) => {
    if (!acc.find(s => s.user_id === story.user_id)) acc.push(story);
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="fixed top-0 left-0 right-0 z-20 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-gray-200">
        <Container>
          <div className="flex items-center justify-center h-14">
            <h1 className="font-signature text-4xl text-gray-900">Movi<span className="text-purple-500">+</span></h1>
          </div>
        </Container>
      </header>

      <main className="pt-16 pb-24">
        <Container size="small">
          {/* Stories */}
          <div className="flex gap-3 overflow-x-auto py-4 mb-2 scrollbar-hide border-b border-gray-100">
            {/* Seu story */}
            <button onClick={() => setShowStoryUpload(true)} className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-[68px] h-[68px] rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2.5px]">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  {userProfile?.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <Plus className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
              <span className="text-[10px] text-gray-500">Você</span>
            </button>

            {storyUsers.map((story) => (
              <button
                key={story.id}
                onClick={() => { setSelectedStory(story); setStoryIndex(0); }}
                className="flex flex-col items-center gap-1 flex-shrink-0"
              >
                <div className="w-[68px] h-[68px] rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2.5px]">
                  <div className="w-full h-full rounded-full bg-white p-[2px]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                      {story.profiles?.avatar_url ? <img src={story.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">{story.profiles?.full_name?.charAt(0) || '?'}</div>}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-gray-500 truncate max-w-[64px]">@{story.profiles?.username}</span>
              </button>
            ))}
          </div>

          {/* Timeline */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" /></div>
          ) : moments.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
              <Play className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-base font-medium text-gray-500">Nenhum moment ainda</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {moments.map((moment) => (
                <div key={moment.id} className="py-4">
                  <div className="flex gap-3">
                    <Link href={`/${moment.profiles?.username}`} className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                        {moment.profiles?.avatar_url ? <img src={moment.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-sm">{moment.profiles?.full_name?.charAt(0) || '?'}</div>}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Link href={`/${moment.profiles?.username}`} className="flex items-center gap-1.5 hover:underline">
                          <span className="text-sm font-bold text-gray-900 truncate">{moment.profiles?.full_name}</span>
                          {moment.profiles?.verified && <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#0095F6"/><path d="M8.5 12L11 14.5L15.5 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </Link>
                        <span className="text-gray-400 text-sm">@{moment.profiles?.username}</span>
                        <span className="text-gray-400 text-sm">·</span>
                        <span className="text-gray-400 text-sm">{timeAgo(moment.created_at)}</span>
                      </div>
                      {moment.title && <p className="text-[15px] text-gray-900 leading-relaxed mb-3 whitespace-pre-line">{moment.title}</p>}
                      {moment.image_url && (
                        <div className="rounded-2xl overflow-hidden border border-gray-200 mb-3">
                          <img src={moment.image_url} alt="" className="w-full max-h-96 object-cover" loading="lazy" />
                        </div>
                      )}
                      <div className="flex items-center gap-6 mt-1">
                        <button className="flex items-center gap-1.5 text-gray-400 hover:text-blue-500 transition-colors group"><div className="p-1.5 rounded-full group-hover:bg-blue-50"><MessageCircle className="w-4 h-4" /></div><span className="text-xs">0</span></button>
                        <button className="flex items-center gap-1.5 text-gray-400 hover:text-green-500 transition-colors group"><div className="p-1.5 rounded-full group-hover:bg-green-50"><Repeat2 className="w-4 h-4" /></div><span className="text-xs">0</span></button>
                        <button className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors group"><div className="p-1.5 rounded-full group-hover:bg-red-50"><Heart className="w-4 h-4" /></div><span className="text-xs">0</span></button>
                        <button className="flex items-center gap-1.5 text-gray-400 hover:text-blue-500 transition-colors ml-auto"><div className="p-1.5 rounded-full hover:bg-blue-50"><Share className="w-4 h-4" /></div></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </main>

      {/* Modal Visualizar Story */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black flex flex-col" onClick={() => setSelectedStory(null)}>
            <div className="flex items-center gap-3 p-4 text-white">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                {selectedStory.profiles?.avatar_url ? <img src={selectedStory.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-500" />}
              </div>
              <span className="text-sm font-medium">{selectedStory.profiles?.username}</span>
              <span className="text-white/50 text-xs">{timeAgo(selectedStory.created_at)}</span>
              <button onClick={() => setSelectedStory(null)} className="ml-auto p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <img src={selectedStory.image_url} alt="" className="max-w-full max-h-full object-contain" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Upload Story */}
      <AnimatePresence>
        {showStoryUpload && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black flex flex-col" onClick={() => setShowStoryUpload(false)}>
            <div className="flex items-center justify-between p-4 text-white">
              <button onClick={() => { setShowStoryUpload(false); setStoryPreview(null); }}><X className="w-5 h-5" /></button>
              <span className="text-sm font-medium">Novo story</span>
              <button onClick={handleStoryUpload} disabled={!storyFile || uploading} className="text-sm font-medium text-purple-400 disabled:opacity-30">{uploading ? '...' : 'Publicar'}</button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              {storyPreview ? (
                <img src={storyPreview} alt="" className="max-w-full max-h-full object-contain" />
              ) : (
                <label className="cursor-pointer text-white/60 text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-40" />
                  <p className="text-lg font-medium">Toque para escolher uma foto</p>
                  <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setStoryFile(file); const reader = new FileReader(); reader.onload = (ev) => setStoryPreview(ev.target?.result as string); reader.readAsDataURL(file); } }} className="hidden" />
                </label>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[88%] max-w-sm">
        <nav className="bg-white/90 backdrop-blur-2xl border border-gray-200/50 rounded-3xl px-2 py-2.5 shadow-2xl shadow-black/5">
          <div className="flex items-center justify-around">
            <Link href="/" className="p-2.5 rounded-2xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"><Home className="w-6 h-6" strokeWidth={2} /></Link>
            <Link href="/moments" className="p-2.5 rounded-2xl text-gray-900 bg-gray-100"><Play className="w-6 h-6" strokeWidth={2.5} /></Link>
            <Link href="/explorar" className="p-2.5 rounded-2xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"><Compass className="w-6 h-6" strokeWidth={2} /></Link>
            {userProfile ? (
              <Link href={`/${userProfile.username}`} className="p-2.5 rounded-2xl"><div className="w-6 h-6 rounded-full overflow-hidden ring-2 ring-gray-300">{userProfile.avatar_url ? <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px] font-bold bg-gray-100">{userProfile.full_name?.charAt(0)}</div>}</div></Link>
            ) : (<Link href="/login" className="p-2.5 rounded-2xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"><User className="w-6 h-6" strokeWidth={2} /></Link>)}
          </div>
        </nav>
      </div>
    </div>
  );
}