import NextAuth from "next-auth"
import Keycloak from "@auth/keycloak-provider"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Keycloak({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.groups = account.groups
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.groups = token.groups as string[]
      return session
    },
  },
})