export interface User {
  sub: string
  email: string
  name: string
  preferred_username: string
  given_name: string
  family_name: string
  groups: string[]
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  idToken: string
  expiresIn: number
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  tenant: string | null
}