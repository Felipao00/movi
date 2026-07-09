'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface PhotoCardProps {
  photo: any;
  profile: any;
  showUser?: boolean;
}

export function PhotoCard({ photo, profile, showUser = true }: PhotoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="break-inside-avoid rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.04]"
    >
      <img
        src={photo.image_url}
        alt={photo.title}
        className="w-full h-auto"
        loading="lazy"
      />
      
      {showUser && profile && (
        <div className="p-4">
          <Link href={`/@${profile.username}`} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-medium overflow-hidden flex-shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                profile.full_name?.charAt(0) || '?'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{profile.full_name}</p>
              <p className="text-white/30 text-xs">@{profile.username}</p>
            </div>
          </Link>
        </div>
      )}
    </motion.div>
  );
}