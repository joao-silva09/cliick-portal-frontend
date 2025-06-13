// src/app/api/auth/callback/route.ts
import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await getSession();

  // 1. Extrair o código de autorização da URL
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    // Se não houver código, redirecionar para uma página de erro.
    return NextResponse.json({ error: 'Authorization code not found' }, { status: 400 });
  }

   try {
    // CORRIGIDO
    const tokenUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_BASE_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`;

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      // CORRIGIDO
      client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
      // NÃO MUDA - Este é um segredo do servidor
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
      code: code,
      // CORRIGIDO
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body,
    });
    
    if (!response.ok) {
        const errorBody = await response.json();
        console.error('Keycloak token exchange failed:', errorBody);
        throw new Error(`Token exchange failed with status: ${response.status}`);
    }

    const tokens = await response.json();
    
    // 3. Decodificar o id_token para obter as informações do usuário
    // O id_token é um JWT (JSON Web Token), que consiste em 3 partes separadas por '.'. A parte do meio é o payload.
    const payloadBase64 = tokens.id_token.split('.')[1];
    const decodedPayload = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    const claims = JSON.parse(decodedPayload);

    // NOTA DE SEGURANÇA: Em um ambiente de produção real, você DEVE verificar a assinatura do id_token
    // usando uma biblioteca como 'jose' para garantir que ele não foi adulterado e foi emitido pelo seu Keycloak.

    // 4. Preencher a nossa sessão com os dados
    session.isLoggedIn = true;
    session.accessToken = tokens.access_token;
    session.refreshToken = tokens.refresh_token;
    session.user = {
      id: claims.sub, // 'sub' é o ID do usuário no Keycloak
      name: claims.name,
      email: claims.email,
      groups: claims.groups || [], // Pegando nossa claim de grupos!
    };
    
    // 5. Salvar a sessão (isso criptografa e envia o cookie)
    await session.save();

    // 6. Redirecionar para o dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}