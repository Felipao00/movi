'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import { ArrowLeft, Mail, Calendar, ShieldAlert } from 'lucide-react';

export default function DadosPessoaisPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setUserEmail(user.email || '');
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      } catch (error) {
        console.error('Erro ao carregar dados pessoais:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-gray-200">
        <Container>
          <div className="flex items-center h-14">
            <button 
              onClick={() => router.push('/dashboard/configuracoes')} 
              className="p-2 -ml-2 text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-gray-900 ml-2">Informações Pessoais</h1>
          </div>
        </Container>
      </header>

      <Container size="small">
        <div className="py-6 space-y-6">
          <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
            {/* E-mail */}
            <div className="p-4 flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-900 text-sm font-medium">E-mail da Conta</p>
                <p className="text-gray-600 text-sm mt-0.5">{userEmail}</p>
                <p className="text-gray-400 text-xs mt-1">Este e-mail é utilizado para login e recuperação de acesso.</p>
              </div>
            </div>

            <div className="border-t border-gray-100 mx-4" />

            {/* Data de Criação */}
            <div className="p-4 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-900 text-sm font-medium">Membro desde</p>
                <p className="text-gray-600 text-sm mt-0.5">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  }) : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Banner de Segurança */}
          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 flex gap-3">
            <ShieldAlert className="w-5 h-5 text-blue-500 shrink-0" />
            <div>
              <h4 className="text-blue-900 text-xs font-semibold uppercase tracking-wider">Privacidade de dados</h4>
              <p className="text-blue-700 text-xs mt-1 leading-relaxed">
                O MOVI protege a integridade dos seus dados e não compartilha suas informações pessoais com terceiros sob nenhuma hipótese.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}