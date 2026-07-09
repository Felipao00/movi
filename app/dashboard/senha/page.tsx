'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Container } from '@/components/ui/Container';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';

export default function SenhaPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Senhas não conferem');
      return;
    }
    if (newPassword.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setError('Erro ao alterar senha. Tente novamente.');
    } else {
      setMessage('Senha alterada com sucesso!');
      setTimeout(() => router.push('/dashboard/configuracoes'), 1500);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-gray-200">
        <Container>
          <div className="flex items-center h-14">
            <button onClick={() => router.push('/dashboard/configuracoes')} className="p-2 -ml-2 text-gray-500 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-gray-900 ml-2">Alterar senha</h1>
          </div>
        </Container>
      </header>

      <Container size="small">
        <div className="py-8">
          {message && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-600 text-sm text-center">{message}</div>
          )}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">{error}</div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Senha atual" className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-900 focus:outline-none focus:border-gray-900" />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nova senha" className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-900 focus:outline-none focus:border-gray-900" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar nova senha" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-900 focus:outline-none focus:border-gray-900" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:opacity-50 transition-all">
              {loading ? 'Alterando...' : 'Alterar senha'}
            </button>
          </form>
        </div>
      </Container>
    </div>
  );
}