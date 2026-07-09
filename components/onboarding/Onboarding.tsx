'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Compass, Heart, User, ArrowRight, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

const steps = [
  {
    icon: Camera,
    title: 'Compartilhe seus momentos',
    description: 'Publique suas melhores fotos e construa seu portfólio fotográfico.',
    tip: 'Toque no botão + para publicar',
    color: 'from-gray-700 to-gray-900',
  },
  {
    icon: Compass,
    title: 'Explore o mundo',
    description: 'Descubra fotógrafos incríveis e inspire-se com novos olhares.',
    tip: 'Use a lupa para buscar',
    color: 'from-blue-600 to-blue-800',
  },
  {
    icon: Heart,
    title: 'Conecte-se',
    description: 'Curta as fotos que você admira e siga seus fotógrafos favoritos.',
    tip: 'Toque duas vezes para curtir',
    color: 'from-red-500 to-rose-600',
  },
  {
    icon: User,
    title: 'Seu espaço, seu estilo',
    description: 'Personalize seu perfil, escolha temas e torne seu espaço único.',
    tip: 'Seu link: movi.app/seuuser',
    color: 'from-purple-600 to-violet-800',
  },
];

export function Onboarding() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const current = steps[step];
  const isLast = step === steps.length - 1;

  const handleFinish = async () => {
    const user = await getCurrentUser();
    if (user) {
      await supabase.from('profiles').update({ onboarding_done: true }).eq('id', user.id);
    }
    router.push('/');
  };

  return (
    <div className="fixed inset-0 z-[300] bg-white flex flex-col">
      {/* Barra de progresso */}
      <div className="flex gap-1.5 px-6 pt-14 pb-4">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-700 ${
              i <= step ? 'bg-gray-900' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-center"
          >
            {/* Ícone */}
            <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${current.color} flex items-center justify-center mb-10 shadow-2xl`}>
              <current.icon className="w-14 h-14 text-white" strokeWidth={1.5} />
            </div>

            {/* Título */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{current.title}</h2>

            {/* Descrição */}
            <p className="text-gray-500 text-base leading-relaxed max-w-xs mb-6">{current.description}</p>

            {/* Dica */}
            <div className="bg-gray-50 rounded-2xl px-5 py-3">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Dica</p>
              <p className="text-gray-700 text-sm font-medium">{current.tip}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Botões */}
      <div className="px-6 pb-10 space-y-3">
        <button
          onClick={() => isLast ? handleFinish() : setStep(step + 1)}
          className="w-full py-4 rounded-2xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isLast ? (
            <>Começar a explorar <Check className="w-4 h-4" /></>
          ) : (
            <>Próximo <ArrowRight className="w-4 h-4" /></>
          )}
        </button>

        <button
          onClick={handleFinish}
          className="w-full py-3 text-gray-400 text-sm hover:text-gray-600 transition-colors"
        >
          Pular introdução
        </button>
      </div>
    </div>
  );
}