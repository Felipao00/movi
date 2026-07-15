'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function TermosPage() {
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
          <h1 className="text-base font-semibold text-gray-900 ml-2">Termos de Uso</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6 text-sm leading-relaxed text-gray-700">
        <h2 className="text-xl font-bold text-gray-950 border-b border-gray-200 pb-2">
          TERMOS DE USO E CONDIÇÕES GERAIS DE SERVIÇO — MOVI
        </h2>

        <section className="space-y-2">
          <h3 className="font-semibold text-gray-900 text-base">1. Do Objeto e Escopo Operacional</h3>
          <p>
            Estes Termos de Uso e Condições Gerais regulam o fornecimento do ecossistema tecnológico MOVI, compreendendo a hospedagem de portfólios fotográficos, indexação de mídias digitais, sistemas de interação social pública e ferramentas de comunicação eletrônica privada dirigida (módulo de chat). O aceite integral destes termos é condição sine qua non para a utilização de qualquer funcionalidade da plataforma.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-gray-900 text-base">2. Cadastro, Elegibilidade e Confidencialidade de Credenciais</h3>
          <p>
            O acesso aos serviços exige a criação de uma conta digital vinculada a um endereço de e-mail válido. O usuário declara e garante possuir capacidade civil plena de acordo com a legislação brasileira ou possuir a devida autorização legal de seus responsáveis. 
          </p>
          <p>
            É dever do usuário a manutenção do sigilo estrito de suas credenciais de acesso (tokens, senhas e chaves de sessão). Qualquer atividade lesiva, civil ou criminalmente imputável, realizada sob as credenciais de uma conta cadastrada será atribuída de forma exclusiva e irrestrita ao seu titular original.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-gray-900 text-base">3. Das Diretrizes Rigorosas de Conduta e Segurança no Módulo de Chat</h3>
          <p>
            A implementação do canal de comunicação privada direta (chat) impõe aos usuários deveres estritos de civilidade, legalidade e ética negocial. Fica expressamente proibida a utilização do chat, sob pena de rescisão contratual imediata e banimento permanente, para:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Envio de comunicações não solicitadas de cunho puramente comercial, publicidade abusiva ou fraudulenta (práticas corporativas de spam ou phishing).</li>
            <li>Transmissão de mensagens contendo injúrias, calúnias, difamações, ameaças coercitivas, assédio moral ou discursos que configurem crimes de ódio previstos na legislação penal.</li>
            <li>Disseminação de arquivos contendo scripts maliciosos, cavalos de troia, vírus, exploits ou qualquer vetor de ataque focado em comprometer os servidores ou os aparelhos de outros utilizadores.</li>
            <li>Engenharia social voltada à extração de dados pessoais, financeiros ou chaves privadas de autenticação de terceiros.</li>
          </ul>
          <p className="italic text-xs text-gray-500 mt-2">
            Parágrafo único: O MOVI reserva-se o direito de cooperar ativamente com órgãos de persecução penal e autoridades judiciais, fornecendo logs de registro e metadados de conexões associados a contas suspeitas de atividades criminosas no chat, nos estritos termos do Marco Civil da Internet.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-gray-900 text-base">4. Propriedade Intelectual e Extensão da Licença de Mídias</h3>
          <p>
            O usuário mantém a titularidade integral dos direitos autorais patrimoniais e morais sobre as fotografias e mídias por ele submetidas à plataforma. 
          </p>
          <p>
            Para viabilizar a entrega técnica do serviço, o usuário outorga ao MOVI uma licença de escopo global, gratuita, não exclusiva e sublicenciável unicamente para fins operacionais (compreendendo o armazenamento em servidores de nuvem, otimização de resolução, distribuição em redes de entrega de conteúdo - CDN e exibição no fluxo do aplicativo). Esta licença cessa de forma automática e imediata mediante a exclusão do arquivo ou encerramento definitivo da conta.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-gray-900 text-base">5. Limitação Global de Responsabilidade Técnica</h3>
          <p>
            O MOVI emprega os melhores esforços de segurança cibernética disponíveis no mercado, contudo, não garante a imunidade absoluta contra interrupções temporárias decorrentes de manutenção técnica, falhas em backbones globais de internet ou ataques de negação de serviço. A plataforma exime-se de responsabilidade por lucros cessantes, perdas de dados decorrentes de mau uso por parte do usuário ou transações comerciais firmadas entre usuários através do chat.
          </p>
        </section>
      </main>
    </div>
  );
}