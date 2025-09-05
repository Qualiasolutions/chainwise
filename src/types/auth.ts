import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      subscriptionTier: string
      creditsBalance: number
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    subscriptionTier: string
    creditsBalance: number
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    subscriptionTier: string
    creditsBalance: number
  }
}