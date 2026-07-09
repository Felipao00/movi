'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';

export default function AboutPage() {
  return (
    <section className="py-20 lg:py-32">
      <Container size="small">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-text-muted text-xs uppercase tracking-[0.3em] mb-12 font-body text-center">
            Sobre
          </p>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-text-primary mb-12 text-center leading-tight">
            A luz que fica<br />depois do clique
          </h1>

          <div className="max-w-xl mx-auto space-y-8 text-text-secondary leading-relaxed font-light text-lg">
            <p>
              Comecei a fotografar por acaso. Uma câmera antiga do meu pai, um filme vencido 
              e a curiosidade de ver o que sairia dali. Saíram fantasmas. Imagens cheias de 
              ruído, mas cheias de verdade também.
            </p>
            <p>
              Desde então, a fotografia se tornou meu jeito de estar no mundo. Não como 
              profissão — como presença. Cada foto é um instante em que eu estava inteiro. 
              Inteiro na luz, no silêncio, na espera.
            </p>
            <p>
              Este espaço não é um portfólio. É um arquivo vivo. Um lugar onde guardo o que 
              meus olhos não querem esquecer.
            </p>
            <p className="text-text-muted italic">
              — Lipe
            </p>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}