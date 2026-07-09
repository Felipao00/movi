'use client';

import React from 'react';
import { Camera } from 'lucide-react';

interface ProfileHeaderProps {
  profile: any;
  photosCount: number;
  isOwner?: boolean;
  onEditClick?: () => void;
}

export function ProfileHeader({ profile, photosCount, isOwner, onEditClick }: ProfileHeaderProps) {
  return (
    <div className="text-center mb-12">
      {/* Avatar */}
      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/[0.03] border-2 border-white/[0.08] mx-auto mb-5 overflow-hidden">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="w-10 h-10 text-white/20" />
          </div>
        )}
      </div>

      {/* Info */}
      <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-1">
        {profile?.full_name || 'Sem nome'}
      </h1>
      <p className="text-white/40 mb-2">@{profile?.username}</p>

      {/* Stats */}
      <div className="flex items-center justify-center gap-8 my-6">
        <div className="text-center">
          <p className="text-xl font-bold text-white">{photosCount}</p>
          <p className="text-white/40 text-xs">fotos</p>
        </div>
      </div>

      {/* Bio */}
      {profile?.bio && (
        <p className="text-white/50 max-w-md mx-auto leading-relaxed text-sm">
          {profile.bio}
        </p>
      )}

      {/* Botão editar */}
      {isOwner && onEditClick && (
        <button
          onClick={onEditClick}
          className="mt-6 px-6 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white text-sm hover:bg-white/[0.1] transition-all"
        >
          Editar perfil
        </button>
      )}
    </div>
  );
}