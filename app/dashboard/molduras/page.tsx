'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import { ArrowLeft, Check, Sparkles, Star, Zap, Crown, Clock } from 'lucide-react';

const GIFT_DEADLINE = new Date('2025-10-22');

const framesConfig: Record<string, { name: string; icon: any; gradient: string; animation: string; rarity: string; rarityColor: string }> = {
  original: { name: 'Original MOVI', icon: Check, gradient: 'bg-gradient-to-r from-gray-400 to-gray-600', animation: '', rarity: 'Comum', rarityColor: 'text-gray-500' },
  aurora: { name: 'Aurora', icon: Sparkles, gradient: 'bg-gradient-to-r from-purple-500 via-blue-500 to-green-400', animation: 'animate-spin-slow', rarity: 'Rara', rarityColor: 'text-purple-500' },
  neon: { name: 'Neon Pulse', icon: Zap, gradient: 'bg-gradient-to-r from-pink-500 to-purple-600', animation: 'animate-pulse', rarity: 'Rara', rarityColor: 'text-pink-500' },
  golden: { name: 'Golden Hour', icon: Crown, gradient: 'bg-gradient-to-r from-amber-400 to-yellow-500', animation: 'animate-spin-slow', rarity: 'Épica', rarityColor: 'text-amber-500' },
  minimal: { name: 'Minimal', icon: Star, gradient: 'bg-gradient-to-r from-gray-900 to-gray-900', animation: '', rarity: 'Comum', rarityColor: 'text-gray-500' },
};

export default function MoldurasPage() {
  const router = useRouter();
  const [userFrames, setUserFrames] = useState<string[]>([]);
  const [activeFrame, setActiveFrame] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [auroraClaimed, setAuroraClaimed] = useState(false);

  const canClaimGift = new Date() <= GIFT_DEADLINE;
  const daysLeft = Math.ceil((GIFT_DEADLINE.getTime() - Date.now()) / 86400000);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const user = await getCurrentUser();
    if (!user) { router.push('/login'); return; }

    const { data: frames } = await supabase.from('user_frames').select('frame_type').eq('user_id', user.id);
    setUserFrames(frames?.map(f => f.frame_type) || []);
    setAuroraClaimed(frames?.some(f => f.frame_type === 'aurora') || false);

    const { data: profile } = await supabase.from('profiles').select('active_frame').eq('id', user.id).single();
    setActiveFrame(profile?.active_frame || '');
    setLoading(false);
  };

  const handleSelectFrame = async (type: string) => {
    const user = await getCurrentUser();
    if (!user) return;

    if (activeFrame === type) {
      await supabase.from('profiles').update({ active_frame: '' }).eq('id', user.id);
      setActiveFrame('');
      setMessage('Moldura removida!');
    } else {
      await supabase.from('profiles').update({ active_frame: type }).eq('id', user.id);
      setActiveFrame(type);
      setMessage('Moldura aplicada!');
    }
    setTimeout(() => setMessage(''), 2000);
  };

  const handleClaimAurora = async () => {
    if (!canClaimGift) {
      setMessage('Este presente expirou em 22 de outubro de 2025');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const user = await getCurrentUser();
    if (!user) return;

    await supabase.from('user_frames').upsert({
      user_id: user.id,
      frame_type: 'aurora',
    }, { onConflict: 'user_id,frame_type' });

    setAuroraClaimed(true);
    setUserFrames([...userFrames, 'aurora']);
    setMessage('🎁 Moldura Aurora resgatada com sucesso!');
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) return (<div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center"><div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" /></div>);

  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-gray-200">
        <Container>
          <div className="flex items-center h-14">
            <button onClick={() => router.push('/dashboard/perfil?from=profile')} className="p-2 -ml-2 text-gray-500 hover:text-gray-900"><ArrowLeft className="w-5 h-5" /></button>
            <h1 className="text-base font-semibold text-gray-900 ml-2">Minhas Molduras</h1>
          </div>
        </Container>
      </header>

      <Container size="small">
        <div className="py-6 space-y-4">
          {message && (
            <div className={`px-4 py-3 rounded-xl text-sm text-center ${
              message.includes('sucesso') || message.includes('aplicada') 
                ? 'bg-green-50 border border-green-200 text-green-600' 
                : message.includes('expirado')
                ? 'bg-red-50 border border-red-200 text-red-600'
                : 'bg-blue-50 border border-blue-200 text-blue-600'
            }`}>{message}</div>
          )}

          {/* Banner Presente Aurora */}
          {!auroraClaimed && (
            <div className="rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-green-400 p-[2px]">
              <div className="rounded-2xl bg-white p-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-green-400 flex items-center justify-center flex-shrink-0 animate-spin-slow">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900">🎁 Presente Especial!</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Você foi presenteado com a <span className="font-bold text-purple-600">Moldura Aurora</span> — uma edição limitada exclusiva da MOVI!
                    </p>
                    {canClaimGift ? (
                      <>
                        <div className="flex items-center gap-1.5 mt-2 text-amber-600">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{daysLeft} dias restantes para resgatar</span>
                        </div>
                        <button
                          onClick={handleClaimAurora}
                          className="mt-3 w-full py-2.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-all"
                        >
                          Resgatar agora ✨
                        </button>
                      </>
                    ) : (
                      <p className="text-xs text-red-500 mt-2">Este presente expirou em 22 de outubro de 2025</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="rounded-2xl bg-white border border-gray-200 p-6 flex justify-center">
            <div className={`w-28 h-28 rounded-full flex items-center justify-center ${activeFrame ? framesConfig[activeFrame]?.gradient + ' p-[3px]' : 'bg-gray-100'}`}>
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-gray-400 text-3xl font-bold">
                👤
              </div>
            </div>
          </div>

          {userFrames.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma moldura adquirida</p>
              <p className="text-xs mt-1">Fique atento às notificações para ganhar molduras especiais!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userFrames.map((type) => {
                const config = framesConfig[type];
                if (!config) return null;
                const Icon = config.icon;
                const isActive = activeFrame === type;
                return (
                  <button key={type} onClick={() => handleSelectFrame(type)} className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${isActive ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                    <div className={`w-14 h-14 rounded-full ${config.gradient} ${config.animation} flex items-center justify-center`}>
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center"><Icon className="w-5 h-5 text-gray-700" /></div>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-gray-900 text-sm font-semibold">{config.name}</p>
                      <p className={`text-xs ${config.rarityColor}`}>{config.rarity}</p>
                    </div>
                    {isActive && <span className="px-3 py-1 rounded-full bg-gray-900 text-white text-xs font-medium">Ativa</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}