'use client';

import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export function LoginButton() {
  const handleLogin = () => {
    // Verificar se as variáveis de ambiente estão definidas
    const baseUrl = process.env.NEXT_PUBLIC_KEYCLOAK_BASE_URL;
    const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM;
    const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!baseUrl || !realm || !clientId || !appUrl) {
      console.error('Variáveis de ambiente do Keycloak não configuradas');
      alert('Configuração de autenticação incompleta. Verifique as variáveis de ambiente.');
      return;
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${appUrl}/api/auth/callback`,
      response_type: 'code',
      scope: 'openid profile email',
      // Adicionar um state para segurança
      state: Math.random().toString(36).substring(2, 15),
    });

    const keycloakLoginUrl = `${baseUrl}/realms/${realm}/protocol/openid-connect/auth?${params.toString()}`;
    
    console.log('Redirecionando para:', keycloakLoginUrl);
    window.location.href = keycloakLoginUrl;
  };

  return (
    <Button onClick={handleLogin} size="lg">
      <LogIn className="mr-2 h-4 w-4" />
      Entrar com Keycloak
    </Button>
  );
}