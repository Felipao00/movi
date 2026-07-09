'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { ArrowLeft } from 'lucide-react';

export default function PrivacidadePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-gray-200">
        <Container>
          <div className="flex items-center h-14">
            <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-500 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-gray-900 ml-2">Política de Privacidade</h1>
          </div>
        </Container>
      </header>

      <Container size="small">
        <div className="py-8 prose prose-sm max-w-none text-gray-700 space-y-6">
          <p className="text-gray-500 text-sm">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          
          <h2 className="text-gray-900 text-lg font-bold">1. Dados Coletados</h2>
          <p>Coletamos apenas as informações necessárias para o funcionamento do serviço: nome de usuário, email (opcional), fotos publicadas e preferências de tema.</p>
          
          <h2 className="text-gray-900 text-lg font-bold">2. Uso dos Dados</h2>
          <p>Seus dados são usados exclusivamente para fornecer e melhorar o serviço MOVI. Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros.</p>
          
          <h2 className="text-gray-900 text-lg font-bold">3. Armazenamento</h2>
          <p>As fotos são armazenadas de forma segura usando criptografia. Você pode solicitar a exclusão completa dos seus dados a qualquer momento.</p>
          
          <h2 className="text-gray-900 text-lg font-bold">4. Cookies</h2>
          <p>Utilizamos cookies essenciais para manter sua sessão ativa. Não utilizamos cookies de rastreamento ou publicidade.</p>
          
          <h2 className="text-gray-900 text-lg font-bold">5. Seus Direitos</h2>
          <p>Você pode acessar, corrigir ou excluir seus dados a qualquer momento através das configurações da sua conta.</p>
        </div>
      </Container>
    </div>
  );
}