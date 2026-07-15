'use client';

import React from 'react';
import { Lock } from 'lucide-react';

interface ProfilePrivateLockProps {
  username: string;
}

export function ProfilePrivateLock({ username }: ProfilePrivateLockProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Círculo com o Cadeado */}
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-5">
        <Lock className="w-6 h-6 text-gray-800" />
      </div>

      <h2 className="text-base font-bold text-gray-900 mb-1">Esta conta é privada</h2>
      <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
        Siga <span className="font-semibold text-gray-800">@{username}</span> para ver suas fotos, vídeos e atualizações do dia a dia.
      </p>
    </div>
  );
}