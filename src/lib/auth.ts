import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/database'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          isVerified: user.isVerified,
          isParentVerified: user.isParentVerified,
        }
      }
    }),
    
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.isVerified = user.isVerified
        token.isParentVerified = (user as any).isParentVerified
      } else if (token?.sub) {
        // Refresh user data from DB if token exists but no user in params
        const u = await prisma.user.findUnique({ 
          where: { id: token.sub }, 
          select: { role: true, isVerified: true, isParentVerified: true } 
        })
        if (u) {
          token.role = u.role
          token.isVerified = u.isVerified
          token.isParentVerified = u.isParentVerified
        }
      }
      
      if (account?.provider && token.sub) {
        await prisma.user.update({
          where: { id: token.sub },
          data: {
            emailVerified: account.provider === 'google' ? new Date() : undefined,
            isVerified: account.provider === 'google' ? true : token.isVerified,
          }
        })
      }
      
      return token
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.isVerified = token.isVerified as boolean
        ;(session.user as any).isParentVerified = token.isParentVerified as boolean
      }
      return session
    },
    
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        return true
      }
      
      if (account?.provider === 'credentials') {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! }
        })
        
        return true
      }
      
      return true
    },
    
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log('User signed in:', { userId: user.id, provider: account?.provider })
    },
    
    async createUser({ user }) {
      console.log('New user created:', { userId: user.id, email: user.email })
    },
  },
  
  debug: process.env.NODE_ENV === 'development',
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export async function createUser(data: {
  name: string
  email: string
  password: string
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (existingUser) {
    throw new Error('User already exists')
  }

  const hashedPassword = await hashPassword(data.password)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      isVerified: false,
      isParentVerified: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isVerified: true,
      isParentVerified: true,
      createdAt: true,
    }
  })

  return user
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const hashedPassword = await hashPassword(newPassword)

  return await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  })
}

export async function verifyUserEmail(userId: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: { 
      isVerified: true,
      emailVerified: new Date(),
    }
  })
}

export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}