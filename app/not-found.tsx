import { Container } from '@/components/ui/Container';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <Container size="small">
        <div className="text-center">
          <h1 className="text-[8rem] lg:text-[12rem] font-bold text-text-primary leading-none mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-text-primary mb-4">
            Página não encontrada
          </h2>
          <p className="text-lg text-text-secondary mb-8 max-w-lg mx-auto">
            A página que você está procurando pode ter sido removida ou 
            o endereço pode estar incorreto.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-black font-medium hover:bg-white/90 transition-colors"
          >
            <Home className="w-5 h-5" />
            Voltar ao Início
          </a>
        </div>
      </Container>
    </div>
  );
}