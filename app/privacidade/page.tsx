'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function PrivacidadePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] font-sans antialiased">
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 flex items-center h-14">
          <button 
            onClick={() => router.back()} 
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold text-gray-900 ml-2">Política de Privacidade</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6 text-sm leading-relaxed text-gray-700">
        <h2 className="text-xl font-bold text-gray-950 border-b border-gray-200 pb-2">
          POLÍTICA DE PRIVACIDADE E PROTEÇÃO DE DADOS PESSOAIS — MOVI
        </h2>
        <p className="text-xs text-gray-500 font-medium">Última atualização: 15 de Julho de 2026</p>

        <p>
          Esta Política de Privacidade disciplina as operações de tratamento de dados pessoais realizadas pelo MOVI, em rigorosa conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD), o Marco Civil da Internet (Lei nº 12.965/2014) e as diretrizes regulatórias estabelecidas pela Autoridade Nacional de Proteção de Dados (ANPD).
        </p>

        <section className="space-y-2">
          <h3 className="font-semibold text-gray-900 text-base">1. Da Coleta de Dados e Bases Legais de Tratamento</h3>
          <p>O tratamento de dados restringe-se ao mínimo necessário para a operação, baseado nas seguintes hipóteses legais:</p>
          <ul className="list-disc pl-5 space-y-3">
            <li>
              <strong>Dados Cadastrais Identificadores:</strong> Nome completo ou social, endereço eletrônico, alcunha de perfil (@usuário) e avatares de identificação. <em>Base Legal: Execução de contrato e procedimentos preliminares (Art. 7º, V, LGPD).</em>
            </li>
            <li>
              <strong>Comunicações e Fluxo de Mensageria (Chat):</strong> O conteúdo de texto, mídias anexas e carimbos de data/hora trafegados em conversas privadas são processados eletronicamente sob criptografia. O tráfego ocorre em ambiente lógico isolado. <em>Base Legal: Execução de contrato a pedido do titular.</em>
            </li>
            <li>
              <strong>Dados de Conexão e Registros Físicos:</strong> Endereço IP corporativo ou residencial, portas lógicas de origem, registros de autenticação de sessão e logs de sistema. <em>Base Legal: Cumprimento de obrigação legal ou regulatória (Art. 7º, II, LGPD c/c Art. 15 do Marco Civil da Internet).</em>
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-gray-900 text-base">2. Mecanismos Avançados de Segurança e Isolamento Crítico</h3>
          <p>Para assegurar a inviolabilidade das comunicações no módulo de chat e mitigar incidentes de vazamentos, a arquitetura do sistema adota os seguintes padrões industriais:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Segurança ao Nível de Linha (Row Level Security - RLS):</strong> O banco de dados central bloqueia de forma nativa qualquer tentativa de consulta que não parta do identificador único autenticado do emissor ou do receptor da respectiva mensagem, impedindo vazamentos transversais de conversas.
            </li>
            <li>
              <strong>Criptografia em Trânsito (TLS 1.3):</strong> Toda a camada de transporte de dados utiliza criptografia forte com chaves simétricas atualizadas periodicamente, neutralizando interceptações em redes públicas.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-gray-900 text-base">3. Retenção de Dados e Prazos Legais Exigidos</h3>
          <p>
            Os dados pessoais permanecem ativos no sistema durante o período de vigência da relação contratual entre o titular e a plataforma. As conversas mantidas no chat privado são conservadas para fins de histórico pessoal dos interlocutores. 
          </p>
          <p>
            Mediante a solicitação de exclusão, as informações cadastrais e conteúdos de chat são eliminados fisicamente dos servidores. Registros de conexão (IP, data e hora), contudo, permanecem arquivados sob sigilo pelo prazo compulsório de 6 (seis) meses, atendendo ao disposto no Marco Civil da Internet.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-gray-900 text-base">4. Da Inexistência de Compartilhamento Comercial</h3>
          <p>
            O MOVI adota política corporativa rígida de não mercantilização de dados. Nenhuma informação pessoal, metadado de comportamento ou conteúdo de chat privado é compartilhado com parceiros comerciales, agências de publicidade ou terceiros. O compartilhamento ocorre única e exclusivamente com provedores essenciais de infraestrutura computacional sob contratos de confidencialidade técnica.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-gray-900 text-base">5. Exercício de Direitos pelos Titulares</h3>
          <p>
            Em conformidade com o Artigo 18 da LGPD, os usuários podem exercer diretamente na interface do aplicativo ou por canal de suporte a confirmação do tratamento, acesso facilitado aos relatórios de dados salvos, correção de dados inexatos e a revogação do consentimento com a exclusão definitiva da conta na respectiva Zona de Perigo.
          </p>
        </section>
      </main>
    </div>
  );
}