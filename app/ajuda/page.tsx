'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function AjudaPage() {
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
          <h1 className="text-base font-semibold text-gray-900 ml-2">Central de Ajuda</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8 text-sm leading-relaxed text-gray-700">
        <h2 className="text-xl font-bold text-gray-950 border-b border-gray-200 pb-2">
          CENTRAL DE AJUDA &amp; SUPORTE TÉCNICO INTEGRADO — MOVI
        </h2>

        <section className="space-y-4">
          <h3 className="font-bold text-gray-900 text-base border-l-2 border-black pl-2 uppercase tracking-wide">
            Segurança das Comunicações e Protocolos do Chat
          </h3>
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Como é garantida a privacidade das mensagens enviadas no chat?</h4>
            <p>
              O módulo de comunicações privadas do MOVI foi desenvolvido com foco absoluto em segurança digital. As mensagens e mídias transmitidas utilizam túneis de criptografia TLS. No banco de dados, o isolamento lógico das conversas é forçado por políticas de segurança estritas (Row Level Security), impedindo que colaboradores, administradores globais ou agentes externos tenham visibilidade ou acesso aos textos particulares.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Como agir em casos de suspeita de comprometimento da conta?</h4>
            <p>
              Se detectar conexões anômalas ou suspeitar que suas credenciais foram expostas, acesse imediatamente as configurações de segurança da conta para redefinir sua senha. É recomendável também revisar a segurança do e-mail principal cadastrado em seu perfil.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-bold text-gray-900 text-base border-l-2 border-black pl-2 uppercase tracking-wide">
            Diretrizes de Moderação, Bloqueio e Denúncias
          </h3>
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Qual o procedimento para reportar comportamentos inadequados ou assédio no chat?</h4>
            <p>
              O MOVI mantém conformidade rígida com os Termos de Uso do ecossistema. Caso receba mensagens de caráter ofensivo, ameaçador ou que infrinjam os regulamentos da comunidade, você pode utilizar a ferramenta de bloqueio definitivo contida no perfil do usuário. Para auditorias avançadas e abertura de processos internos de banimento, encaminhe um relatório detalhado acompanhado do identificador técnico do infrator para suporte@moviapp.com.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-bold text-gray-900 text-base border-l-2 border-black pl-2 uppercase tracking-wide">
            Tratamento de Dados, Cache Local e Conformidade Legal
          </h3>
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Como é realizada a exclusão total de registros da plataforma?</h4>
            <p>
              O direito de eliminação de dados pessoais pode ser exercido diretamente pelo painel de configurações através da exclusão definitiva na Zona de Perigo. Esse comando executa uma rotina automatizada que limpa os bancos de dados ativos de produção. A plataforma preservará estritamente os logs obrigatórios determinados por lei federal pelo prazo residual exigido.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Qual a finalidade técnica do recurso de limpeza de cache interno?</h4>
            <p>
              A limpeza de dados e mídias atua no armazenamento volátil do seu próprio navegador. O aplicativo guarda cópias temporárias locais de portfólios visados para economizar consumo de dados móveis em acessos futuros. Apagar esse cache otimiza o armazenamento físico do seu aparelho, sem afetar ou deletar nenhuma configuração guardada permanentemente nos servidores centrais.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}