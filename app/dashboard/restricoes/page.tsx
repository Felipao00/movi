'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { ArrowLeft, ShieldCheck, AlertTriangle, Ban, Check } from 'lucide-react';

export default function RestricoesPage() {
  const router = useRouter();

  const restricoes = [
    { tipo: 'Bloqueios', status: 'none', desc: 'Nenhum bloqueio ativo' },
    { tipo: 'Avisos', status: 'none', desc: 'Nenhum aviso pendente' },
    { tipo: 'Violações', status: 'none', desc: 'Nenhuma violação registrada' },
    { tipo: 'Suspensões', status: 'none', desc: 'Nenhuma suspensão aplicada' },
  ];

  const getIcon = (status: string) => {
    if (status === 'none') return <ShieldCheck className="w-5 h-5 text-green-500" />;
    if (status === 'warning') return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    return <Ban className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-gray-200">
        <Container>
          <div className="flex items-center h-14">
            <button onClick={() => router.push('/dashboard/configuracoes')} className="p-2 -ml-2 text-gray-500 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-gray-900 ml-2">Restrições da Conta</h1>
          </div>
        </Container>
      </header>

      <Container size="small">
        <div className="py-6 space-y-6">
          {/* Status geral */}
          <div className="rounded-2xl bg-green-50 border border-green-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-green-900 font-semibold text-sm">Conta em situação regular</p>
                <p className="text-green-700 text-xs">Sua conta não possui nenhuma restrição ativa.</p>
              </div>
            </div>
          </div>

          {/* Lista de verificações */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Verificação de segurança</h3>
            <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
              {restricoes.map((item, i) => (
                <div key={i}>
                  {i > 0 && <div className="border-t border-gray-100 mx-4" />}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      {getIcon(item.status)}
                      <div>
                        <p className="text-gray-900 text-sm font-medium">{item.tipo}</p>
                        <p className="text-gray-500 text-xs">{item.desc}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">Limpo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diretrizes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Diretrizes da comunidade</h3>
            <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Respeite todos os usuários da plataforma
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Não publique conteúdo ofensivo ou inadequado
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Não faça spam ou propaganda excessiva
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Respeite os direitos autorais de terceiros
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}