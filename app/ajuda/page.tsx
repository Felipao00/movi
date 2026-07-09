'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { ArrowLeft, Camera, User, Palette, Shield } from 'lucide-react';

export default function AjudaPage() {
  const router = useRouter();

  const faqs = [
    { icon: Camera, q: 'Como publicar uma foto?', a: 'Vá até a aba "Criar" no menu inferior, escolha uma foto e adicione um título.' },
    { icon: User, q: 'Como editar meu perfil?', a: 'Acesse seu perfil, clique no botão "Editar perfil" e altere suas informações.' },
    { icon: Palette, q: 'Como mudar o tema?', a: 'Vá em Configurações > Aparência > Tema e escolha entre claro e escuro.' },
    { icon: Shield, q: 'Como excluir minha conta?', a: 'Vá em Configurações > Zona de Perigo > Excluir conta. Esta ação é permanente.' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-gray-200">
        <Container>
          <div className="flex items-center h-14">
            <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-500 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-gray-900 ml-2">Central de Ajuda</h1>
          </div>
        </Container>
      </header>

      <Container size="small">
        <div className="py-8 space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="flex items-start gap-3">
                <faq.icon className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-gray-900 font-medium text-sm mb-1">{faq.q}</h3>
                  <p className="text-gray-500 text-sm">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}