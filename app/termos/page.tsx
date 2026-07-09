'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { ArrowLeft } from 'lucide-react';

export default function TermosPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-gray-200">
        <Container>
          <div className="flex items-center h-14">
            <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-500 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-gray-900 ml-2">Termos de Uso</h1>
          </div>
        </Container>
      </header>

      <Container size="small">
        <div className="py-8 prose prose-sm max-w-none text-gray-700 space-y-6">
          <p className="text-gray-500 text-sm">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          
          <h2 className="text-gray-900 text-lg font-bold">1. Aceitação dos Termos</h2>
          <p>Ao usar o MOVI, você concorda com estes termos. Se não concordar, não utilize o serviço.</p>
          
          <h2 className="text-gray-900 text-lg font-bold">2. Sua Conta</h2>
          <p>Você é responsável por manter a segurança da sua conta e senha. O MOVI não pode e não será responsável por qualquer perda ou dano resultante da falha em cumprir esta obrigação.</p>
          
          <h2 className="text-gray-900 text-lg font-bold">3. Conteúdo</h2>
          <p>Você mantém todos os direitos sobre as fotos que publica no MOVI. Ao publicar, você nos concede uma licença não exclusiva para exibir seu conteúdo na plataforma.</p>
          <p>Não é permitido publicar conteúdo ilegal, ofensivo, pornográfico ou que viole direitos de terceiros.</p>
          
          <h2 className="text-gray-900 text-lg font-bold">4. Conduta</h2>
          <p>Os usuários devem manter um ambiente respeitoso. Assédio, discurso de ódio e spam não são tolerados.</p>
          
          <h2 className="text-gray-900 text-lg font-bold">5. Encerramento</h2>
          <p>Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos.</p>
        </div>
      </Container>
    </div>
  );
}