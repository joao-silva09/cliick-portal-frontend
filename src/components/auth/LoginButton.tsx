'use client';

import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export function LoginButton() {
  const handleLogin = () => {
    const params = new URLSearchParams({
      // CORRIGIDO
      client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
      // CORRIGIDO
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL!}/api/auth/callback`,
      response_type: 'code',
      scope: 'openid profile email',
    });

    // CORRIGIDO
    const keycloakLoginUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_BASE_URL!}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM!}/protocol/openid-connect/auth?${params.toString()}`;
    
    window.location.href = keycloakLoginUrl;
  };

  return (
    <Button onClick={handleLogin}>
      <LogIn className="mr-2 h-4 w-4" />
      Entrar com Cliick ID
    </Button>
  );
}