// src/app/page.tsx
import { LoginButton } from '@/components/auth/LoginButton';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold">Bem-vindo ao Cliick Portal</h1>
        <p className="text-muted-foreground">
          Faça login para acessar seu painel.
        </p>
        <LoginButton />
      </div>
    </main>
  );
}