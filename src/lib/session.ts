// src/lib/session.ts
import { session, SessionStore } from 'iron-session';
import { cookies } from 'next/headers';

// Define a estrutura dos dados que vamos armazenar na sessão.
export interface SessionData {
  isLoggedIn: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    groups: string[]; // Nossa claim customizada para multi-tenancy!
  };
}

// Configurações da nossa sessão.
const sessionOptions = {
  cookieName: 'cliick-portal-session',
  password: process.env.SESSION_SECRET as string, // O segredo que definimos no .env.local
  cookieOptions: {
    // Em produção, sempre use 'secure: true' para enviar o cookie apenas via HTTPS.
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true, // Impede que o JavaScript do lado do cliente acesse o cookie.
  },
};

// Função helper para obter a sessão.
export function getSession(): Promise<SessionStore<SessionData>> {
  // Inicializa a sessão com as nossas opções e o store de cookies do Next.js.
  return session<SessionData>(sessionOptions, cookies());
}