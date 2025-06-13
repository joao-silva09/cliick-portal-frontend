import Cookies from 'js-cookie'
import { User, AuthTokens } from '@/types/auth'

const KEYCLOAK_CONFIG = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_BASE_URL!,
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM!,
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
}

export class AuthService {
  private static readonly TOKEN_KEY = 'auth_tokens'
  private static readonly USER_KEY = 'auth_user'

  // Gerar URL de login do Keycloak
  static getLoginUrl(): string {
    const baseUrl = `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/auth`
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    
    const params = new URLSearchParams({
      client_id: KEYCLOAK_CONFIG.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      state: this.generateState(),
    })
    
    return `${baseUrl}?${params.toString()}`
  }

  // Gerar URL de logout do Keycloak
  static getLogoutUrl(): string {
    const baseUrl = `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/logout`
    const params = new URLSearchParams({
      client_id: KEYCLOAK_CONFIG.clientId,
      post_logout_redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
    })
    
    return `${baseUrl}?${params.toString()}`
  }

  // Trocar código por tokens
  static async exchangeCodeForTokens(code: string): Promise<AuthTokens> {
    const tokenUrl = `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/token`
    
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: KEYCLOAK_CONFIG.clientId,
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    })

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Token exchange failed:', errorText)
      throw new Error(`Failed to exchange code for tokens: ${response.status}`)
    }

    const data = await response.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      idToken: data.id_token,
      expiresIn: data.expires_in,
    }
  }

  // Refresh tokens
  static async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const tokenUrl = `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/token`
    
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: KEYCLOAK_CONFIG.clientId,
      refresh_token: refreshToken,
    })

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body,
    })

    if (!response.ok) {
      throw new Error('Failed to refresh tokens')
    }

    const data = await response.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      idToken: data.id_token,
      expiresIn: data.expires_in,
    }
  }

  // Decodificar token JWT manualmente
  static decodeToken(token: string): User {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format')
      }

      const payload = parts[1]
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
      
      return {
        sub: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        preferred_username: decoded.preferred_username,
        given_name: decoded.given_name,
        family_name: decoded.family_name,
        groups: decoded.groups || [],
      }
    } catch (error) {
      console.error('Token decode error:', error)
      throw new Error('Invalid token')
    }
  }

  // Salvar tokens e usuário
  static saveAuth(tokens: AuthTokens): User {
    const user = this.decodeToken(tokens.accessToken)
    
    Cookies.set(this.TOKEN_KEY, JSON.stringify(tokens), {
      expires: 7, // 7 dias
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
    
    Cookies.set(this.USER_KEY, JSON.stringify(user), {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    return user
  }

  // Obter tokens salvos
  static getTokens(): AuthTokens | null {
    const tokensStr = Cookies.get(this.TOKEN_KEY)
    return tokensStr ? JSON.parse(tokensStr) : null
  }

  // Obter usuário salvo
  static getUser(): User | null {
    const userStr = Cookies.get(this.USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  }

  // Limpar autenticação
  static clearAuth(): void {
    Cookies.remove(this.TOKEN_KEY)
    Cookies.remove(this.USER_KEY)
  }

  // Verificar se token está expirado
  static isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.')
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      return Date.now() >= payload.exp * 1000
    } catch {
      return true
    }
  }

  // Gerar state para PKCE
  private static generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }
}