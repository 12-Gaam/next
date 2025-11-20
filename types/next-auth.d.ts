import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      fullName: string
      email: string
      role: string
      status: string
      gaamId?: string | null
    }
  }

  interface User {
    id: string
    username: string
    fullName: string
    email: string
    role: string
    status: string
    gaamId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    username: string
    fullName: string
    email: string
    status: string
    gaamId?: string | null
  }
}

