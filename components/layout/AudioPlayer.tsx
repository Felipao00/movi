'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [musicUrl, setMusicUrl] = useState('/audio/musica.mp3');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadMusic();
  }, []);

  const loadMusic = async () => {
    const { data } = await supabase
      .from('site_data')
      .select('music')
      .eq('id', 1)
      .single();
    
    if (data?.music) {
      setMusicUrl(data.music);
    }
  };

  useEffect(() => {
    if (!musicUrl) return;
    
    audioRef.current = new Audio(musicUrl);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.2;

    const playPromise = audioRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setShowButton(true);
        });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [musicUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Se falhar, mantém o botão visível
      });
    }
  };

  if (!showButton && !isPlaying) return null;

  return (
    <button
      onClick={togglePlay}
      className="fixed bottom-5 left-5 z-40 p-3 rounded-full bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] text-text-muted hover:text-text-primary transition-all"
      title={isPlaying ? 'Pausar música' : 'Tocar música'}
    >
      {isPlaying ? (
        <Volume2 className="w-5 h-5" />
      ) : (
        <VolumeX className="w-5 h-5" />
      )}
    </button>
  );
}