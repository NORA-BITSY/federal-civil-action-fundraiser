#### app-layout.ts
```ts
import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers/Providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Legal Defense Fund - Crowdfunding for Legal Expenses',
  description: 'Raise funds for legal defense cases, civil rights, and justice initiatives. Support legal battles that matter.',
  keywords: 'legal fundraising, defense fund, crowdfunding, legal expenses, court costs, attorney fees',
  authors: [{ name: 'Legal Defense Fund' }],
  openGraph: {
    title: 'Legal Defense Fund - Crowdfunding for Legal Expenses',
    description: 'Raise funds for legal defense cases, civil rights, and justice initiatives.',
    url: 'https://legaldefensefund.com',
    siteName: 'Legal Defense Fund',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Legal Defense Fund - Crowdfunding for Legal Expenses',
    description: 'Raise funds for legal defense cases, civil rights, and justice initiatives.',
    images: ['/images/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <Providers>
          <div className="min-h-full flex flex-col">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#22c55e',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
```

#### auth-lib.ts
```ts
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.isVerified = user.isVerified
      }
      
      // Handle OAuth account linking
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
      }
      return session
    },
    
    async signIn({ user, account, profile }) {
      // Allow OAuth sign-ins
      if (account?.provider === 'google') {
        return true
      }
      
      // For credentials, check if user is verified
      if (account?.provider === 'credentials') {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! }
        })
        
        // Allow sign in even if not verified, but they'll be prompted to verify
        return true
      }
      
      return true
    },
    
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      
      return baseUrl
    }
  },
  
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log('User signed in:', { userId: user.id, provider: account?.provider })
    },
    
    async createUser({ user }) {
      console.log('New user created:', { userId: user.id, email: user.email })
      
      // Send welcome email (implement email service)
      // await sendWelcomeEmail(user.email, user.name)
    },
  },
  
  debug: process.env.NODE_ENV === 'development',
}

// Utility functions for auth
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
    },
    select: {
      id: true,
      name: true,
      email: true,
      isVerified: true,
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
```

#### auth-types.ts
```ts
import { User } from './user'

export interface AuthUser {
  id: string
  email: string
  name?: string
  image?: string
  role: string
  isVerified: boolean
}

export interface AuthSession {
  user: AuthUser
  expires: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
  confirmPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface VerifyEmailRequest {
  token: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: AuthUser
  token?: string
  redirectUrl?: string
}

export interface OAuthProvider {
  id: string
  name: string
  icon: string
  enabled: boolean
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface JWTPayload {
  sub: string
  email: string
  name?: string
  role: string
  iat: number
  exp: number
}

export interface AuthConfig {
  providers: {
    credentials: boolean
    google: boolean
    facebook: boolean
    github: boolean
  }
  features: {
    registration: boolean
    emailVerification: boolean
    passwordReset: boolean
    socialLogin: boolean
  }
  security: {
    bcryptRounds: number
    jwtExpiresIn: string
    refreshTokenExpiresIn: string
    maxLoginAttempts: number
    lockoutDuration: number
  }
}

export interface LoginAttempt {
  id: string
  email: string
  ipAddress: string
  userAgent: string
  success: boolean
  createdAt: Date
}

export interface SessionData {
  userId: string
  email: string
  role: string
  loginAt: Date
  expiresAt: Date
}

export interface AuthError {
  code: string
  message: string
  field?: string
}

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    message: 'Invalid email or password',
  },
  EMAIL_NOT_VERIFIED: {
    code: 'EMAIL_NOT_VERIFIED',
    message: 'Please verify your email address before signing in',
  },
  ACCOUNT_LOCKED: {
    code: 'ACCOUNT_LOCKED',
    message: 'Account temporarily locked due to too many failed login attempts',
  },
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: 'User not found',
  },
  EMAIL_ALREADY_EXISTS: {
    code: 'EMAIL_ALREADY_EXISTS',
    message: 'An account with this email already exists',
  },
  WEAK_PASSWORD: {
    code: 'WEAK_PASSWORD',
    message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character',
  },
  PASSWORDS_DO_NOT_MATCH: {
    code: 'PASSWORDS_DO_NOT_MATCH',
    message: 'Passwords do not match',
  },
  INVALID_TOKEN: {
    code: 'INVALID_TOKEN',
    message: 'Invalid or expired token',
  },
  SESSION_EXPIRED: {
    code: 'SESSION_EXPIRED',
    message: 'Your session has expired. Please sign in again',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'You are not authorized to access this resource',
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'You do not have permission to perform this action',
  },
  RATE_LIMITED: {
    code: 'RATE_LIMITED',
    message: 'Too many requests. Please try again later',
  },
} as const

export type AuthErrorCode = keyof typeof AUTH_ERRORS
```

#### badge-component.ts
```ts
'use client'

import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline'
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
    
    const variants = {
      default: 'bg-gray-100 text-gray-800',
      primary: 'bg-primary-100 text-primary-800',
      secondary: 'bg-secondary-100 text-secondary-800',
      success: 'bg-success-100 text-success-800',
      warning: 'bg-warning-100 text-warning-800',
      error: 'bg-error-100 text-error-800',
      outline: 'text-gray-700 border border-gray-200',
    }

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
```

#### button-component.ts
```ts
'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from './LoadingSpinner'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    fullWidth = false,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-primary-500',
      link: 'text-primary-600 underline-offset-4 hover:underline focus:ring-primary-500',
      success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',
      warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500',
      error: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
    }
    
    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 py-2 text-sm',
      lg: 'h-12 px-6 py-3 text-base',
      xl: 'h-14 px-8 py-4 text-lg',
    }

    const isLoading = loading
    const isDisabled = disabled || loading

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {isLoading && (
          <LoadingSpinner size="sm" className="mr-2" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
```

#### campaign-details-component.ts
```ts
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { Campaign } from '@/types/campaign'
import { 
  FileText, 
  Scale, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  User,
  Target,
  Strategy,
  AlertCircle,
  ExternalLink
} from 'lucide-react'

interface CampaignDetailsProps {
  campaign: Campaign
}

export function CampaignDetails({ campaign }: CampaignDetailsProps) {
  const [activeTab, setActiveTab] = useState<'story' | 'legal' | 'organizer'>('story')

  const tabs = [
    { id: 'story', label: 'Campaign Story', icon: FileText },
    { id: 'legal', label: 'Legal Details', icon: Scale },
    { id: 'organizer', label: 'Organizer', icon: User },
  ]

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {/* Story Tab */}
        {activeTab === 'story' && (
          <Card>
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {campaign.description}
                </div>

                {/* Video */}
                {campaign.videoUrl && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Video</h3>
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-gray-500 text-center">
                        <div className="mb-2">📹</div>
                        <div className="text-sm">Video Player</div>
                        <a 
                          href={campaign.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline text-sm flex items-center justify-center mt-2"
                        >
                          Watch on External Site
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Images */}
                {campaign.images && campaign.images.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {campaign.images.map((image, index) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded-lg">
                          <img
                            src={image}
                            alt={`Campaign image ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legal Tab */}
        {activeTab === 'legal' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center space-x-2 mb-6">
                  <Scale className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Legal Case Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {campaign.caseNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Case Number</label>
                      <p className="text-gray-900 font-mono">{campaign.caseNumber}</p>
                    </div>
                  )}

                  {campaign.courtName && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Court</label>
                      <p className="text-gray-900">{campaign.courtName}</p>
                    </div>
                  )}

                  {campaign.attorneyName && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Attorney</label>
                      <p className="text-gray-900">{campaign.attorneyName}</p>
                    </div>
                  )}

                  {campaign.attorneyContact && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Attorney Contact</label>
                      <p className="text-gray-900">{campaign.attorneyContact}</p>
                    </div>
                  )}
                </div>

                {campaign.caseDescription && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Target className="w-5 h-5 mr-2 text-primary-600" />
                      Case Description
                    </h3>
                    <div className="prose prose-gray max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-6 rounded-lg">
                        {campaign.caseDescription}
                      </div>
                    </div>
                  </div>
                )}

                {campaign.legalStrategy && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Strategy className="w-5 h-5 mr-2 text-primary-600" />
                      Legal Strategy
                    </h3>
                    <div className="prose prose-gray max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-6 rounded-lg">
                        {campaign.legalStrategy}
                      </div>
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-900 mb-1">Legal Disclaimer</h4>
                      <p className="text-sm text-yellow-700">
                        Legal case information is provided by the campaign organizer. While we review campaigns for legitimacy, 
                        donors should conduct their own due diligence. Funds are released to campaign organizers for stated legal purposes.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Organizer Tab */}
        {activeTab === 'organizer' && (
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-2 mb-6">
                <User className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">Campaign Organizer</h2>
              </div>

              <div className="flex items-start space-x-6 mb-8">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  {campaign.user.image ? (
                    <img
                      src={campaign.user.image}
                      alt={campaign.user.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-500" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {campaign.user.name}
                    </h3>
                    {campaign.user.isVerified && (
                      <Badge variant="success">Verified</Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>{campaign.user.email}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Member since {formatDate(campaign.createdAt, { year: 'numeric', month: 'long' })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Organizer Stats */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {campaign.user.campaigns?.length || 1}
                  </div>
                  <div className="text-sm text-gray-600">
                    Campaign{(campaign.user.campaigns?.length || 1) !== 1 ? 's' : ''} Created
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {campaign.user.donations?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    Campaign{(campaign.user.donations?.length || 0) !== 1 ? 's' : ''} Supported
                  </div>
                </div>
              </div>

              {/* Contact Organizer */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact Organizer</h4>
                <p className="text-gray-600 mb-4">
                  Have questions about this campaign? You can reach out to the organizer directly.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="flex-1">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  
                  <Button variant="outline" className="flex-1">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Report Campaign
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
```

#### campaign-details-page.ts
```ts
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { CampaignDetails } from '@/components/campaign/CampaignDetails'
import { DonationForm } from '@/components/campaign/DonationForm'
import { CampaignProgress } from '@/components/campaign/CampaignProgress'
import { CampaignUpdates } from '@/components/campaign/CampaignUpdates'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { formatCurrency, formatDate, formatRelativeTime, calculateProgress, calculateDaysLeft } from '@/lib/utils'
import { CAMPAIGN_CATEGORIES } from '@/types/campaign'
import { 
  Share2, 
  Heart, 
  Flag,
  Clock,
  MapPin,
  Scale,
  User,
  Calendar,
  MessageCircle,
  TrendingUp,
  Shield,
  AlertCircle
} from 'lucide-react'

interface CampaignPageProps {
  params: {
    id: string
  }
}

async function getCampaign(id: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/campaigns/${id}`, {
      cache: 'no-store' // Ensure fresh data
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.campaign
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return null
  }
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const campaign = await getCampaign(params.id)

  if (!campaign) {
    notFound()
  }

  const progressPercentage = calculateProgress(campaign.currentAmount, campaign.goalAmount)
  const daysLeft = campaign.deadline ? calculateDaysLeft(campaign.deadline) : null
  const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Campaign Image */}
              <div className="aspect-[16/9] relative rounded-xl overflow-hidden mb-6">
                {campaign.featuredImage ? (
                  <Image
                    src={campaign.featuredImage}
                    alt={campaign.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <Scale className="w-24 h-24 text-primary-400" />
                  </div>
                )}

                {/* Overlay badges */}
                <div className="absolute top-4 left-4 flex space-x-2">
                  <Badge variant={campaign.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {campaign.status}
                  </Badge>
                  <Badge variant="primary">
                    {CAMPAIGN_CATEGORIES[campaign.category].label}
                  </Badge>
                </div>

                {isUrgent && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="warning" className="animate-pulse">
                      <Clock className="w-3 h-3 mr-1" />
                      Urgent: {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                    </Badge>
                  </div>
                )}
              </div>

              {/* Title and Description */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {campaign.title}
                </h1>
                
                <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
                  {campaign.user && (
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>By {campaign.user.name}</span>
                      {campaign.user.isVerified && (
                        <Shield className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  )}
                  
                  {campaign.courtName && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{campaign.courtName}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatRelativeTime(campaign.createdAt)}</span>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="text-xl text-gray-700 leading-relaxed">
                    {campaign.shortDescription}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mb-8">
                <Button size="lg" className="flex-1 sm:flex-none">
                  <Heart className="w-5 h-5 mr-2" />
                  Donate Now
                </Button>
                
                <Button variant="outline" size="lg">
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
                
                <Button variant="outline" size="lg">
                  <Flag className="w-5 h-5 mr-2" />
                  Report
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Progress Card */}
                <CampaignProgress campaign={campaign} />

                {/* Donation Form */}
                <DonationForm campaign={campaign} />

                {/* Recent Supporters */}
                {campaign.recentDonations && campaign.recentDonations.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Recent Supporters
                      </h3>
                      
                      <div className="space-y-3">
                        {campaign.recentDonations.slice(0, 5).map((donation: any) => (
                          <div key={donation.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-primary-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {donation.isAnonymous ? 'Anonymous' : donation.donorName || 'Supporter'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatRelativeTime(donation.createdAt)}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-green-600">
                              {formatCurrency(donation.amount)}
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      {campaign.donorCount > 5 && (
                        <p className="text-sm text-gray-500 mt-4">
                          And {campaign.donorCount - 5} more supporters
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Trust Indicators */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Trust & Safety
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-sm">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">SSL Encrypted Donations</span>
                      </div>
                      
                      <div className="flex items-center space-x-3 text-sm">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">Campaign Verified</span>
                      </div>
                      
                      <div className="flex items-center space-x-3 text-sm">
                        <Scale className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-700">Legal Case Reviewed</span>
                      </div>
                      
                      {campaign.user?.isVerified && (
                        <div className="flex items-center space-x-3 text-sm">
                          <Shield className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Verified Campaign Creator</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CampaignDetails campaign={campaign} />
          </div>
          
          <div className="lg:col-span-1">
            <CampaignUpdates campaign={campaign} />
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### campaign-id-api.ts
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma, getCampaignBySlug } from '@/lib/database'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const campaignId = params.id
    
    // Try to find by ID first, then by slug
    let campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isVerified: true,
          }
        },
        donations: {
          where: { paymentStatus: 'SUCCEEDED' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        comments: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        updates: {
          where: { isPublic: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            donations: {
              where: { paymentStatus: 'SUCCEEDED' }
            },
            comments: {
              where: { isApproved: true }
            },
            updates: true,
          }
        }
      }
    })

    // If not found by ID, try by slug
    if (!campaign) {
      campaign = await getCampaignBySlug(campaignId)
    }

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check if user can view this campaign
    if (!campaign.isPublic) {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id || (session.user.id !== campaign.userId && session.user.role !== 'ADMIN')) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        )
      }
    }

    // Increment view count
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { viewCount: { increment: 1 } }
    })

    // Calculate additional stats
    const campaignWithStats = {
      ...campaign,
      donorCount: campaign._count.donations,
      commentCount: campaign._count.comments,
      updateCount: campaign._count.updates,
      progressPercentage: Math.min((Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100, 100),
      recentDonations: campaign.donations.slice(0, 10),
      topDonations: campaign.donations
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .slice(0, 5),
    }

    return NextResponse.json({ campaign: campaignWithStats })

  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const campaignId = params.id
    const body = await request.json()

    // Check if campaign exists and user owns it
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    })

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (existingCampaign.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update campaign
    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        ...body,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Campaign updated successfully',
      campaign: updatedCampaign
    })

  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const campaignId = params.id

    // Check if campaign exists and user owns it
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        _count: {
          select: {
            donations: {
              where: { paymentStatus: 'SUCCEEDED' }
            }
          }
        }
      }
    })

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (existingCampaign.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Don't allow deletion if campaign has donations
    if (existingCampaign._count.donations > 0) {
      return NextResponse.json(
        { error: 'Cannot delete campaign with donations. Please contact support.' },
        { status: 400 }
      )
    }

    // Delete campaign
    await prisma.campaign.delete({
      where: { id: campaignId }
    })

    return NextResponse.json({
      message: 'Campaign deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}
```

#### campaign-progress-component.ts
```ts
'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { formatCurrency, calculateProgress, calculateDaysLeft } from '@/lib/utils'
import { Campaign } from '@/types/campaign'
import { DollarSign, Users, Clock, TrendingUp } from 'lucide-react'

interface CampaignProgressProps {
  campaign: Campaign
}

export function CampaignProgress({ campaign }: CampaignProgressProps) {
  const progressPercentage = calculateProgress(campaign.currentAmount, campaign.goalAmount)
  const daysLeft = campaign.deadline ? calculateDaysLeft(campaign.deadline) : null
  const remainingAmount = campaign.goalAmount - campaign.currentAmount

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Main Progress */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-3xl font-bold text-gray-900">
                {formatCurrency(campaign.currentAmount)}
              </span>
              <span className="text-lg text-gray-600">
                of {formatCurrency(campaign.goalAmount)}
              </span>
            </div>
            
            <Progress 
              value={progressPercentage} 
              className="mb-3"
              variant={progressPercentage >= 100 ? 'success' : 'default'}
            />
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>{Math.round(progressPercentage)}% funded</span>
              {remainingAmount > 0 && (
                <span>{formatCurrency(remainingAmount)} to go</span>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {campaign.donorCount || 0}
              </div>
              <div className="text-sm text-gray-600">
                Supporter{(campaign.donorCount || 0) !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {daysLeft !== null ? (
                  <Clock className="w-5 h-5 text-warning-600" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-success-600" />
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {daysLeft !== null ? (
                  daysLeft > 0 ? daysLeft : 0
                ) : (
                  '∞'
                )}
              </div>
              <div className="text-sm text-gray-600">
                {daysLeft !== null ? (
                  daysLeft > 0 ? 'Days left' : 'Ended'
                ) : (
                  'No deadline'
                )}
              </div>
            </div>
          </div>

          {/* Goal Achievement */}
          {progressPercentage >= 100 && (
            <div className="bg-success-50 border border-success-200 rounded-lg p-4 text-center">
              <div className="text-success-800 font-semibold mb-2">
                🎉 Goal Achieved!
              </div>
              <div className="text-sm text-success-700">
                This campaign has reached its fundraising goal. Additional donations will continue to support this legal case.
              </div>
            </div>
          )}

          {/* Urgency Notice */}
          {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 text-center">
              <div className="text-warning-800 font-semibold mb-2">
                ⏰ Time is Running Out!
              </div>
              <div className="text-sm text-warning-700">
                Only {daysLeft} day{daysLeft !== 1 ? 's' : ''} left to support this legal case.
              </div>
            </div>
          )}

          {/* Campaign Ended */}
          {daysLeft !== null && daysLeft <= 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-gray-800 font-semibold mb-2">
                Campaign Ended
              </div>
              <div className="text-sm text-gray-600">
                This fundraising campaign has ended. No new donations are being accepted.
              </div>
            </div>
          )}

          {/* Platform Fee Disclosure */}
          <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-1 mb-1">
              <DollarSign className="w-3 h-3" />
              <span>Platform fee: 2.9% + payment processing</span>
            </div>
            <div>
              Funds are delivered to the campaign creator for legal expenses.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

#### campaign-updates-component.ts
```ts
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { Campaign, CampaignUpdate } from '@/types/campaign'
import { 
  MessageSquare, 
  User, 
  Calendar, 
  Image as ImageIcon,
  FileText,
  Plus,
  ChevronDown
} from 'lucide-react'

interface CampaignUpdatesProps {
  campaign: Campaign
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string
    image?: string
  }
}

export function CampaignUpdates({ campaign }: CampaignUpdatesProps) {
  const [updates, setUpdates] = useState<CampaignUpdate[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'updates' | 'comments'>('updates')
  const [showAllComments, setShowAllComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    fetchUpdatesAndComments()
  }, [campaign.id])

  const fetchUpdatesAndComments = async () => {
    try {
      const [updatesResponse, commentsResponse] = await Promise.all([
        fetch(`/api/campaigns/${campaign.id}/updates`),
        fetch(`/api/campaigns/${campaign.id}/comments`)
      ])

      if (updatesResponse.ok) {
        const updatesData = await updatesResponse.json()
        setUpdates(updatesData.updates || [])
      }

      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json()
        setComments(commentsData.comments || [])
      }
    } catch (error) {
      console.error('Error fetching updates and comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmittingComment(true)
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim()
        })
      })

      if (response.ok) {
        setNewComment('')
        fetchUpdatesAndComments() // Refresh comments
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <LoadingSpinner size="md" />
            <p className="text-gray-600 mt-4">Loading updates and comments...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle>Campaign Activity</CardTitle>
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('updates')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'updates'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Updates ({updates.length})
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'comments'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Comments ({comments.length})
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Updates Tab */}
          {activeTab === 'updates' && (
            <div className="space-y-6">
              {updates.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No updates yet</p>
                  <p className="text-gray-500 text-sm">
                    The campaign organizer hasn't posted any updates yet.
                  </p>
                </div>
              ) : (
                updates.map((update) => (
                  <div key={update.id} className="border-l-4 border-primary-200 pl-6 pb-6 last:pb-0">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {update.user.image ? (
                          <Image
                            src={update.user.image}
                            alt={update.user.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <User className="w-5 h-5 text-primary-600" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {update.title}
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <span>{update.user.name}</span>
                              <span>•</span>
                              <span>{formatRelativeTime(update.createdAt)}</span>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {formatDate(update.createdAt)}
                          </Badge>
                        </div>

                        <div className="prose prose-gray max-w-none mb-4">
                          <div className="whitespace-pre-wrap text-gray-700">
                            {update.content}
                          </div>
                        </div>

                        {/* Update Images */}
                        {update.images && update.images.length > 0 && (
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            {update.images.slice(0, 4).map((image, index) => (
                              <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                <Image
                                  src={image}
                                  alt={`Update image ${index + 1}`}
                                  width={200}
                                  height={200}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Leave a comment of support..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Comments are reviewed before being published
                  </p>
                  <Button
                    type="submit"
                    disabled={!newComment.trim() || submittingComment}
                    loading={submittingComment}
                  >
                    Post Comment
                  </Button>
                </div>
              </form>

              {/* Comments List */}
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No comments yet</p>
                  <p className="text-gray-500 text-sm">
                    Be the first to leave a message of support!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments
                    .slice(0, showAllComments ? comments.length : 5)
                    .map((comment) => (
                      <div key={comment.id} className="flex space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          {comment.user.image ? (
                            <Image
                              src={comment.user.image}
                              alt={comment.user.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <User className="w-5 h-5 text-gray-500" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {comment.user.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))
                  }

                  {comments.length > 5 && !showAllComments && (
                    <div className="text-center">
                      <Button
                        variant="outline"
                        onClick={() => setShowAllComments(true)}
                        className="w-full"
                      >
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Show {comments.length - 5} more comments
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

#### campaigns-api-route.ts
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CampaignStatus, CampaignCategory } from '@prisma/client'
import { slugify } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category') as CampaignCategory
    const status = searchParams.get('status') as CampaignStatus
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'newest'
    const featured = searchParams.get('featured') === 'true'
    
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (category) {
      where.category = category
    }
    
    if (status) {
      where.status = status
    } else {
      // Default to active campaigns
      where.status = 'ACTIVE'
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (featured) {
      // Featured campaigns are those with high engagement
      where.AND = [
        { currentAmount: { gt: 1000 } },
        { donorCount: { gt: 5 } },
        { viewCount: { gt: 100 } }
      ]
    }

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' }
    
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'mostRaised':
        orderBy = { currentAmount: 'desc' }
        break
      case 'mostPopular':
        orderBy = { viewCount: 'desc' }
        break
      case 'deadline':
        orderBy = { deadline: 'asc' }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    // Execute queries
    const [campaigns, totalCount] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            }
          },
          _count: {
            select: {
              donations: true,
              comments: true,
              updates: true,
            }
          }
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.campaign.count({ where })
    ])

    // Calculate additional fields
    const campaignsWithStats = campaigns.map(campaign => ({
      ...campaign,
      donorCount: campaign._count.donations,
      commentCount: campaign._count.comments,
      updateCount: campaign._count.updates,
      progressPercentage: Math.min((Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100, 100),
    }))

    const totalPages = Math.ceil(totalCount / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      campaigns: campaignsWithStats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext,
        hasPrev,
      }
    })

  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    
    // Extract form fields
    const title = formData.get('title') as string
    const shortDescription = formData.get('shortDescription') as string
    const description = formData.get('description') as string
    const goalAmount = parseFloat(formData.get('goalAmount') as string)
    const category = formData.get('category') as CampaignCategory
    const caseNumber = formData.get('caseNumber') as string || undefined
    const courtName = formData.get('courtName') as string || undefined
    const attorneyName = formData.get('attorneyName') as string || undefined
    const attorneyContact = formData.get('attorneyContact') as string || undefined
    const caseDescription = formData.get('caseDescription') as string || undefined
    const legalStrategy = formData.get('legalStrategy') as string || undefined
    const deadline = formData.get('deadline') as string || undefined
    const videoUrl = formData.get('videoUrl') as string || undefined
    const minimumDonation = formData.get('minimumDonation') as string
    const maxDonation = formData.get('maxDonation') as string
    const allowAnonymous = formData.get('allowAnonymous') === 'true'
    const isPublic = formData.get('isPublic') === 'true'

    // Validate required fields
    if (!title || !shortDescription || !description || !goalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique slug
    let slug = slugify(title)
    let slugCount = 0
    let finalSlug = slug
    
    while (await prisma.campaign.findUnique({ where: { slug: finalSlug } })) {
      slugCount++
      finalSlug = `${slug}-${slugCount}`
    }

    // Handle file upload (if present)
    let featuredImage: string | undefined
    const imageFile = formData.get('featuredImage') as File
    
    if (imageFile && imageFile.size > 0) {
      // TODO: Implement file upload to cloud storage (Cloudinary, S3, etc.)
      // For now, we'll use a placeholder
      featuredImage = '/images/campaign-placeholder.jpg'
    }

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        title,
        slug: finalSlug,
        shortDescription,
        description,
        goalAmount,
        category,
        featuredImage,
        videoUrl,
        caseNumber,
        courtName,
        attorneyName,
        attorneyContact,
        caseDescription,
        legalStrategy,
        deadline: deadline ? new Date(deadline) : undefined,
        minimumDonation: minimumDonation ? parseFloat(minimumDonation) : undefined,
        maxDonation: maxDonation ? parseFloat(maxDonation) : undefined,
        allowAnonymous,
        isPublic,
        userId: session.user.id,
        status: 'ACTIVE', // Could be 'UNDER_REVIEW' depending on your workflow
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Campaign created successfully',
      campaign,
      slug: finalSlug,
    })

  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}
```

#### card-component.ts
```ts
'use client'

import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    padding = 'md', 
    shadow = 'sm',
    hover = false,
    children, 
    ...props 
  }, ref) => {
    const baseStyles = 'bg-white rounded-lg border border-gray-200'
    
    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    }
    
    const shadows = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
    }

    return (
      <div
        className={cn(
          baseStyles,
          paddings[padding],
          shadows[shadow],
          hover && 'transition-shadow duration-200 hover:shadow-md',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-gray-600', className)}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
```

#### claude-artifacts.md
``````markdown
# Claude Conversation Artifacts

Generated: 9/1/2025, 12:51:39 AM

## Table of Contents

1. [Artifact 1](#artifact-1)
2. [Artifact 2](#artifact-2)
3. [Artifact 3](#artifact-3)
4. [Artifact 4](#artifact-4)
5. [Artifact 5](#artifact-5)
6. [Artifact 6](#artifact-6)

---

## Artifact 1: Artifact 1

```
src/app/campaign/create/page.tsx
Code 
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card
```

---

## Artifact 2: Artifact 2

```
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card
```

---

## Artifact 3: Artifact 3

```
src/components/campaign/CampaignDetails.tsx
Code 
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { Ca
```

---

## Artifact 4: Artifact 4

```
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { Ca
```

---

## Artifact 5: Artifact 5

```
src/app/auth/login/page.tsx
Code 
'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Inp
```

---

## Artifact 6: Artifact 6

```
'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Inp
```

---
``````

#### database-lib.ts
```ts
import { PrismaClient } from '@prisma/client'

// Prevent multiple instances of Prisma Client in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// Database utility functions
export async function connectDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Connected to database')
  } catch (error) {
    console.error('❌ Failed to connect to database:', error)
    throw error
  }
}

export async function disconnectDatabase() {
  try {
    await prisma.$disconnect()
    console.log('✅ Disconnected from database')
  } catch (error) {
    console.error('❌ Failed to disconnect from database:', error)
  }
}

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

// Campaign utilities
export async function getCampaignBySlug(slug: string, includePrivate = false) {
  const where: any = { slug }
  
  if (!includePrivate) {
    where.isPublic = true
    where.status = 'ACTIVE'
  }

  return await prisma.campaign.findUnique({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isVerified: true,
        }
      },
      donations: {
        where: { paymentStatus: 'SUCCEEDED' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      comments: {
        where: { isApproved: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      updates: {
        where: { isPublic: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          donations: {
            where: { paymentStatus: 'SUCCEEDED' }
          },
          comments: {
            where: { isApproved: true }
          },
          updates: true,
        }
      }
    }
  })
}

// User utilities
export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      isVerified: true,
      createdAt: true,
      _count: {
        select: {
          campaigns: true,
          donations: true,
        }
      }
    }
  })
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      isVerified: true,
    }
  })
}

// Donation utilities
export async function createDonation(data: {
  amount: number
  currency: string
  platformFee: number
  stripeFee: number
  netAmount: number
  donorName?: string
  donorEmail?: string
  isAnonymous: boolean
  message?: string
  stripePaymentId: string
  paymentStatus: string
  campaignId: string
  userId?: string
}) {
  return await prisma.donation.create({
    data,
    include: {
      campaign: {
        select: {
          id: true,
          title: true,
          slug: true,
          currentAmount: true,
          goalAmount: true,
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      }
    }
  })
}

// Stats utilities
export async function getPlatformStats() {
  try {
    const [
      totalRaised,
      totalCampaigns,
      activeCampaigns,
      totalDonors,
      averageDonation,
      totalUsers,
      casesWon
    ] = await Promise.all([
      prisma.donation.aggregate({
        where: { paymentStatus: 'SUCCEEDED' },
        _sum: { amount: true }
      }),
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      prisma.donation.count({
        where: { paymentStatus: 'SUCCEEDED' },
        distinct: ['donorEmail']
      }),
      prisma.donation.aggregate({
        where: { paymentStatus: 'SUCCEEDED' },
        _avg: { amount: true }
      }),
      prisma.user.count(),
      prisma.campaign.count({ where: { status: 'COMPLETED' } })
    ])

    return {
      totalRaised: Number(totalRaised._sum.amount || 0),
      totalCampaigns,
      activeCampaigns,
      totalDonors,
      averageDonation: Number(averageDonation._avg.amount || 0),
      totalUsers,
      casesWon,
      successRate: totalCampaigns > 0 ? Math.round((casesWon / totalCampaigns) * 100) : 0,
    }
  } catch (error) {
    console.error('Error fetching platform stats:', error)
    return {
      totalRaised: 0,
      totalCampaigns: 0,
      activeCampaigns: 0,
      totalDonors: 0,
      averageDonation: 0,
      totalUsers: 0,
      casesWon: 0,
      successRate: 0,
    }
  }
}

// Transaction wrapper
export async function withTransaction<T>(
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(callback)
}

// Cleanup utilities
export async function cleanupExpiredSessions() {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date()
        }
      }
    })
    console.log(`Cleaned up ${result.count} expired sessions`)
    return result.count
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error)
    return 0
  }
}

export async function cleanupExpiredVerificationTokens() {
  try {
    const result = await prisma.verificationToken.deleteMany({
      where: {
        expires: {
          lt: new Date()
        }
      }
    })
    console.log(`Cleaned up ${result.count} expired verification tokens`)
    return result.count
  } catch (error) {
    console.error('Error cleaning up expired verification tokens:', error)
    return 0
  }
}
```

#### donation-form-component.ts
```ts
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { formatCurrency, calculateFees } from '@/lib/utils'
import { Campaign } from '@/types/campaign'
import { Heart, DollarSign, Shield, Lock, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

interface DonationFormProps {
  campaign: Campaign
}

const SUGGESTED_AMOUNTS = [25, 50, 100, 250, 500, 1000]

export function DonationForm({ campaign }: DonationFormProps) {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)

  const numAmount = parseFloat(amount) || 0
  const fees = numAmount > 0 ? calculateFees(numAmount) : null
  const isValidAmount = numAmount >= (campaign.minimumDonation || 1) && 
                       (campaign.maxDonation ? numAmount <= campaign.maxDonation : true)

  const handleAmountSelect = (suggestedAmount: number) => {
    setAmount(suggestedAmount.toString())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValidAmount) {
      toast.error('Please enter a valid donation amount')
      return
    }

    if (!isAnonymous && (!donorName.trim() || !donorEmail.trim())) {
      toast.error('Please provide your name and email')
      return
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions')
      return
    }

    setLoading(true)

    try {
      // Create donation intent
      const response = await fetch('/api/donations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: campaign.id,
          amount: numAmount,
          donorName: isAnonymous ? null : donorName.trim(),
          donorEmail: isAnonymous ? null : donorEmail.trim(),
          message: message.trim() || null,
          isAnonymous,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create donation')
      }

      const data = await response.json()
      
      // Redirect to payment page
      router.push(`/donate/${campaign.id}?intent=${data.paymentIntentId}`)
      
    } catch (error) {
      console.error('Error creating donation:', error)
      toast.error('Failed to process donation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = isValidAmount && 
                     (isAnonymous || (donorName.trim() && donorEmail.trim())) && 
                     agreedToTerms

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-red-500" />
          <span>Support This Case</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Selection */}
          <div>
            <label className="form-label">Donation Amount *</label>
            
            {/* Suggested Amounts */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {SUGGESTED_AMOUNTS.map((suggestedAmount) => (
                <button
                  key={suggestedAmount}
                  type="button"
                  onClick={() => handleAmountSelect(suggestedAmount)}
                  className={`p-3 text-sm font-medium rounded-md border transition-colors ${
                    parseInt(amount) === suggestedAmount
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {formatCurrency(suggestedAmount)}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="pl-10"
                min={campaign.minimumDonation || 1}
                max={campaign.maxDonation || undefined}
              />
            </div>

            {/* Amount Validation */}
            {amount && !isValidAmount && (
              <p className="form-error">
                {numAmount < (campaign.minimumDonation || 1) 
                  ? `Minimum donation is ${formatCurrency(campaign.minimumDonation || 1)}`
                  : `Maximum donation is ${formatCurrency(campaign.maxDonation!)}`
                }
              </p>
            )}

            {/* Fee Breakdown */}
            {fees && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm">
                <div className="flex justify-between mb-1">
                  <span>Your donation:</span>
                  <span>{formatCurrency(numAmount)}</span>
                </div>
                <div className="flex justify-between mb-1 text-gray-600">
                  <span>Platform fee (2.9%):</span>
                  <span>{formatCurrency(fees.platformFee)}</span>
                </div>
                <div className="flex justify-between mb-1 text-gray-600">
                  <span>Payment processing:</span>
                  <span>{formatCurrency(fees.stripeFee)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-gray-300 pt-1">
                  <span>Campaign receives:</span>
                  <span className="text-green-600">{formatCurrency(fees.netAmount)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Anonymous Option */}
          {campaign.allowAnonymous && (
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="anonymous" className="text-sm text-gray-700">
                Donate anonymously
              </label>
            </div>
          )}

          {/* Donor Information */}
          {!isAnonymous && (
            <div className="space-y-4">
              <div>
                <label className="form-label">Your Name *</label>
                <Input
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Enter your full name"
                  required={!isAnonymous}
                />
              </div>

              <div>
                <label className="form-label">Email Address *</label>
                <Input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required={!isAnonymous}
                />
                <p className="form-help">
                  You'll receive a receipt and updates about this campaign
                </p>
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="form-label">Message (Optional)</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave a message of support..."
              rows={3}
              maxLength={500}
            />
            <p className="form-help">{message.length}/500 characters</p>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-0.5"
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I agree to the{' '}
              <a href="/terms" target="_blank" className="text-primary-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" target="_blank" className="text-primary-600 hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={!isFormValid}
            loading={loading}
            className="font-semibold"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            {loading ? 'Processing...' : `Donate ${amount ? formatCurrency(numAmount) : ''}`}
          </Button>

          {/* Security Notice */}
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <Shield className="w-4 h-4" />
            <span>Secured by SSL encryption</span>
            <Lock className="w-4 h-4" />
            <span>PCI DSS compliant</span>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
```

#### env-example.sh
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/legal_fundraiser"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
FROM_EMAIL="noreply@legalfundraiser.com"

# File Upload
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# App Configuration
APP_NAME="Legal Defense Fund"
APP_URL="http://localhost:3000"
ADMIN_EMAIL="admin@legalfundraiser.com"

# Security
JWT_SECRET="your-jwt-secret-key"
ENCRYPTION_KEY="your-encryption-key-32-chars"

# Third Party Services
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
FACEBOOK_PIXEL_ID="your-facebook-pixel-id"

# Feature Flags
ENABLE_EMAIL_NOTIFICATIONS="true"
ENABLE_SMS_NOTIFICATIONS="false"
ENABLE_SOCIAL_LOGIN="true"
ENABLE_CRYPTO_DONATIONS="false"

# Rate Limiting
RATE_LIMIT_WINDOW="15"
RATE_LIMIT_MAX_REQUESTS="100"

# Legal/Compliance
TERMS_OF_SERVICE_URL="https://legalfundraiser.com/terms"
PRIVACY_POLICY_URL="https://legalfundraiser.com/privacy"
PLATFORM_FEE_PERCENTAGE="2.9"
STRIPE_FEE_PERCENTAGE="2.9"
```

#### featured-campaigns-component.ts
```ts
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CampaignCard } from '@/components/campaign/CampaignCard'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Campaign } from '@/types/campaign'
import { ArrowRight, TrendingUp } from 'lucide-react'

export function FeaturedCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFeaturedCampaigns()
  }, [])

  const fetchFeaturedCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns?featured=true&limit=6')
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns')
      }

      const data = await response.json()
      setCampaigns(data.campaigns || [])
    } catch (err) {
      setError('Failed to load campaigns')
      console.error('Error fetching featured campaigns:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading featured campaigns...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error || campaigns.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Featured Legal Defense Campaigns
            </h2>
            
            {error ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-yellow-800 mb-4">{error}</p>
                <Button onClick={fetchFeaturedCampaigns} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-blue-800 mb-4">No featured campaigns available at the moment.</p>
                <Link href="/campaigns">
                  <Button variant="outline">
                    Browse All Campaigns
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Legal Defense Campaigns
            </h2>
          </div>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Support these urgent legal cases that need your help. Every contribution makes a difference in the fight for justice.
          </p>
        </div>

        {/* Featured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {campaigns.slice(0, 6).map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              showAuthor={true}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/campaigns">
            <Button size="lg">
              View All Campaigns
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          
          <p className="mt-4 text-sm text-gray-500">
            Browse through {campaigns.length > 6 ? 'hundreds of' : 'all'} active legal defense campaigns
          </p>
        </div>
      </div>
    </section>
  )
}
```

#### footer-component.ts
```ts
'use client'

import Link from 'next/link'
import { Scale, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

const footerNavigation = {
  platform: [
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Start Campaign', href: '/campaign/create' },
    { name: 'Browse Campaigns', href: '/campaigns' },
    { name: 'Success Stories', href: '/success-stories' },
    { name: 'Pricing', href: '/pricing' },
  ],
  legal: [
    { name: 'Legal Categories', href: '/categories' },
    { name: 'Case Verification', href: '/verification' },
    { name: 'Attorney Network', href: '/attorneys' },
    { name: 'Legal Resources', href: '/resources' },
    { name: 'Pro Bono', href: '/pro-bono' },
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Safety & Security', href: '/safety' },
    { name: 'Trust & Safety', href: '/trust' },
    { name: 'Report Issue', href: '/report' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
    { name: 'Blog', href: '/blog' },
    { name: 'Investors', href: '/investors' },
  ],
}

const socialMedia = [
  { name: 'Facebook', href: '#', icon: Facebook },
  { name: 'Twitter', href: '#', icon: Twitter },
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'LinkedIn', href: '#', icon: Linkedin },
]

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <Scale className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold">
                Legal Defense Fund
              </span>
            </Link>
            
            <p className="text-gray-300 mb-6 max-w-md">
              Empowering access to justice through crowdfunding. Help individuals and families fight for their legal rights with community support.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary-400" />
                <span>support@legaldefensefund.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary-400" />
                <span>1-800-LEGAL-DF (1-800-534-2533)</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-primary-400" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-3">
              {footerNavigation.platform.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerNavigation.legal.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerNavigation.support.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerNavigation.company.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
              <p className="text-gray-300 text-sm">
                Get the latest legal defense stories and platform updates
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              <p>
                © 2024 Legal Defense Fund. All rights reserved. |{' '}
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>{' '}
                |{' '}
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>{' '}
                |{' '}
                <Link href="/accessibility" className="hover:text-white transition-colors">
                  Accessibility
                </Link>
              </p>
              <p className="mt-2">
                Legal Defense Fund is a registered 501(c)(3) nonprofit organization.
                Donations may be tax-deductible. EIN: 12-3456789
              </p>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4">
              {socialMedia.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center space-x-8 text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">SSL</span>
              </div>
              <span>256-bit SSL Secured</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">PCI</span>
              </div>
              <span>PCI DSS Compliant</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">★</span>
              </div>
              <span>BBB Accredited A+</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">♦</span>
              </div>
              <span>Stripe Verified</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

#### globals-css.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Form styles */
.form-input {
  @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm;
}

.form-textarea {
  @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm;
}

.form-select {
  @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.form-error {
  @apply text-sm text-red-600 mt-1;
}

.form-help {
  @apply text-sm text-gray-500 mt-1;
}

/* Button variants */
.btn-primary {
  @apply bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500;
}

.btn-secondary {
  @apply bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500;
}

.btn-success {
  @apply bg-success-600 text-white hover:bg-success-700 focus:ring-success-500;
}

.btn-warning {
  @apply bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500;
}

.btn-error {
  @apply bg-error-600 text-white hover:bg-error-700 focus:ring-error-500;
}

.btn-outline {
  @apply border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-primary-500;
}

/* Card styles */
.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}

.card-hover {
  @apply transition-shadow duration-200 hover:shadow-md;
}

/* Progress bar */
.progress-bar {
  @apply bg-gray-200 rounded-full h-2;
}

.progress-fill {
  @apply bg-primary-600 h-2 rounded-full transition-all duration-300;
}

/* Badge styles */
.badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.badge-primary {
  @apply bg-primary-100 text-primary-800;
}

.badge-success {
  @apply bg-success-100 text-success-800;
}

.badge-warning {
  @apply bg-warning-100 text-warning-800;
}

.badge-error {
  @apply bg-error-100 text-error-800;
}

.badge-gray {
  @apply bg-gray-100 text-gray-800;
}

/* Animation utilities */
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

.animate-pulse-slow {
  animation: pulse 3s infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Loading spinner */
.spinner {
  @apply inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite];
}

/* Rich text content */
.prose {
  @apply text-gray-900 max-w-none;
}

.prose h1 {
  @apply text-3xl font-bold text-gray-900 mt-8 mb-4;
}

.prose h2 {
  @apply text-2xl font-bold text-gray-900 mt-6 mb-3;
}

.prose h3 {
  @apply text-xl font-semibold text-gray-900 mt-4 mb-2;
}

.prose p {
  @apply mb-4 leading-7;
}

.prose ul {
  @apply list-disc list-inside mb-4 space-y-1;
}

.prose ol {
  @apply list-decimal list-inside mb-4 space-y-1;
}

.prose a {
  @apply text-primary-600 hover:text-primary-700 underline;
}

.prose blockquote {
  @apply border-l-4 border-gray-300 pl-4 italic my-4;
}

.prose img {
  @apply rounded-lg shadow-sm my-4;
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .mobile-scroll {
    -webkit-overflow-scrolling: touch;
  }
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
  
  .print-only {
    display: block !important;
  }
}

/* Accessibility improvements */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus styles */
.focus-outline {
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
}

/* Error states */
.error-input {
  @apply border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500;
}

/* Success states */
.success-input {
  @apply border-green-300 text-green-900 placeholder-green-300 focus:outline-none focus:ring-green-500 focus:border-green-500;
}
```

#### header-component.ts
```ts
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { 
  Menu, 
  X, 
  Scale, 
  User,
  Heart,
  Plus,
  Search
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Browse Campaigns', href: '/campaigns' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Success Stories', href: '/success-stories' },
  { name: 'About', href: '/about' },
  { name: 'Support', href: '/support' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Scale className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">
                Legal Defense Fund
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary-600',
                  pathname === item.href
                    ? 'text-primary-600'
                    : 'text-gray-700'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search campaigns..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Action Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/campaigns">
              <Button variant="ghost" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Donate
              </Button>
            </Link>
            
            <Link href="/campaign/create">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Start Campaign
              </Button>
            </Link>

            {/* User Menu */}
            <div className="relative">
              <Link href="/auth/login">
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 py-6 space-y-6 bg-white shadow-lg">
            {/* Mobile Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search campaigns..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'block text-base font-medium transition-colors',
                    pathname === item.href
                      ? 'text-primary-600'
                      : 'text-gray-700 hover:text-primary-600'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Mobile Action Buttons */}
            <div className="space-y-4">
              <Link href="/campaigns" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" fullWidth>
                  <Heart className="w-4 h-4 mr-2" />
                  Browse & Donate
                </Button>
              </Link>
              
              <Link href="/campaign/create" onClick={() => setMobileMenuOpen(false)}>
                <Button fullWidth>
                  <Plus className="w-4 h-4 mr-2" />
                  Start Campaign
                </Button>
              </Link>

              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" fullWidth>
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
```

#### hero-component.ts
```ts
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Play, Users, DollarSign, Scale } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Justice Shouldn't 
              <span className="block text-primary-100">
                Depend on Wealth
              </span>
            </h1>
            
            <p className="mt-6 text-xl text-primary-100 leading-8 max-w-2xl">
              Raise funds for legal defense cases, civil rights battles, and access to justice. 
              Our platform connects those fighting for what's right with supporters who believe in their cause.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/campaign/create">
                <Button size="xl" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold">
                  Start Your Campaign
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <Link href="/campaigns">
                <Button 
                  size="xl" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary-600 font-semibold"
                >
                  Browse Cases
                  <Scale className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8 text-center lg:text-left">
              <div>
                <div className="text-3xl font-bold text-white">$50M+</div>
                <div className="text-primary-200 text-sm font-medium">Raised for Justice</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">25,000+</div>
                <div className="text-primary-200 text-sm font-medium">Cases Supported</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">500,000+</div>
                <div className="text-primary-200 text-sm font-medium">Supporters</div>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20">
              {/* Video Thumbnail or Image */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 cursor-pointer hover:bg-white/30 transition-colors">
                    <Play className="w-12 h-12 text-white fill-current" />
                  </div>
                </div>
              </div>
              
              {/* Overlay Stats */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-600">Recent Success</div>
                      <div className="text-lg font-bold text-gray-900">Civil Rights Case #2024-CR-456</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-success-600">$127K</div>
                      <div className="text-sm text-gray-500">of $100K goal</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      842 supporters
                    </div>
                    <div className="flex items-center">
                      <Scale className="w-4 h-4 mr-1" />
                      Case Won!
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center space-x-2 text-white">
                <DollarSign className="w-5 h-5" />
                <span className="font-semibold">Low 2.9% Fees</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center space-x-2 text-white">
                <Scale className="w-5 h-5" />
                <span className="font-semibold">Legal Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" className="w-full h-12 fill-white">
          <path d="M0,60 C400,20 800,100 1200,60 L1200,120 L0,120 Z"></path>
        </svg>
      </div>
    </section>
  )
}
```

#### homepage.ts
```ts
import { Hero } from '@/components/shared/Hero'
import { FeaturedCampaigns } from '@/components/shared/FeaturedCampaigns'
import { Stats } from '@/components/shared/Stats'
import { Testimonials } from '@/components/shared/Testimonials'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { 
  Scale, 
  Shield, 
  Users, 
  Heart,
  TrendingUp,
  Award,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              How Legal Defense Fund Works
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform makes it easy to raise funds for legal expenses and connect with supporters who believe in justice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Scale className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Create Your Campaign
              </h3>
              <p className="text-gray-600 mb-6">
                Share your legal case, set a funding goal, and tell your story. Our platform guides you through the process.
              </p>
              <Link href="/campaign/create">
                <Button variant="outline" size="sm">
                  Start Campaign
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-success-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Share & Promote
              </h3>
              <p className="text-gray-600 mb-6">
                Spread the word through social media, email, and personal networks. Every share brings you closer to your goal.
              </p>
              <Button variant="outline" size="sm">
                Learn More
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-warning-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Receive Support
              </h3>
              <p className="text-gray-600 mb-6">
                Collect donations securely and withdraw funds directly to your bank account. Keep supporters updated on progress.
              </p>
              <Button variant="outline" size="sm">
                View Campaigns
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <FeaturedCampaigns />

      {/* Platform Stats */}
      <Stats />

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Why Choose Legal Defense Fund
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              We're dedicated to providing a secure, transparent, and effective platform for legal fundraising.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Platform</h3>
              <p className="text-gray-600 text-sm">
                Bank-level security with encrypted transactions and data protection.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-success-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Low Fees</h3>
              <p className="text-gray-600 text-sm">
                Competitive platform fees to maximize funds for your legal case.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-warning-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Support</h3>
              <p className="text-gray-600 text-sm">
                Dedicated support team to help optimize your fundraising campaign.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-secondary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Transparent</h3>
              <p className="text-gray-600 text-sm">
                Clear fee structure and real-time tracking of campaign progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Start Your Legal Defense Campaign?
          </h2>
          <p className="mt-4 text-xl text-primary-100">
            Join thousands of others who have successfully raised funds for their legal cases.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/campaign/create">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                Start Your Campaign
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-primary-600">
                Browse Campaigns
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
```

#### loading-spinner.ts
```ts
'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4', 
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-r-transparent',
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}
```

#### login-auth-page.ts
```ts
'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Scale, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/'
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        switch (result.error) {
          case 'CredentialsSignin':
            toast.error('Invalid email or password')
            break
          case 'CallbackRouteError':
            toast.error('Login failed. Please try again.')
            break
          default:
            toast.error('An unexpected error occurred')
            break
        }
      } else if (result?.ok) {
        toast.success('Welcome back!')
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signIn('google', { callbackUrl })
    } catch (error) {
      console.error('Google sign in error:', error)
      toast.error('Google sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center space-x-2">
            <Scale className="h-10 w-10 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">
              Legal Defense Fund
            </span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            href="/auth/register"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="form-label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                    error={!!errors.email}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="form-error">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    error={!!errors.password}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="form-error">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/auth/forgot-password"
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                Sign in
              </Button>
            </form>

            {/* Error Display */}
            {searchParams?.get('error') && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Authentication Error
                    </h3>
                    <div className="mt-1 text-sm text-red-700">
                      {searchParams.get('error') === 'OAuthAccountNotLinked'
                        ? 'Email already exists with different provider'
                        : 'An error occurred during sign in'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-gray-600">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-primary-600 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary-600 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
```

#### login-page.ts
```ts
'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Scale, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/'
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        switch (result.error) {
          case 'CredentialsSignin':
            toast.error('Invalid email or password')
            break
          case 'CallbackRouteError':
            toast.error('Login failed. Please try again.')
            break
          default:
            toast.error('An unexpected error occurred')
            break
        }
      } else if (result?.ok) {
        toast.success('Welcome back!')
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signIn('google', { callbackUrl })
    } catch (error) {
      console.error('Google sign in error:', error)
      toast.error('Google sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center space-x-2">
            <Scale className="h-10 w-10 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">
              Legal Defense Fund
            </span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            href="/auth/register"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="form-label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                    error={!!errors.email}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="form-error">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    error={!!errors.password}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="form-error">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/auth/forgot-password"
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                Sign in
              </Button>
            </form>

            {/* Error Display */}
            {searchParams?.get('error') && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Authentication Error
                    </h3>
                    <div className="mt-1 text-sm text-red-700">
                      {searchParams.get('error') === 'OAuthAccountNotLinked'
                        ? 'Email already exists with different provider'
                        : 'An error occurred during sign in'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-gray-600">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-primary-600 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary-600 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
```

#### next-config.js
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'localhost',
      'images.unsplash.com',
      'res.cloudinary.com',
      's3.amazonaws.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.stripe.com',
      },
    ],
  },
  env: {
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/webhooks/:path*',
        destination: '/api/webhooks/:path*',
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
```

#### package-json.json
```json
{
  "name": "legal-fundraiser",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@next/font": "14.0.4",
    "@prisma/client": "^5.7.1",
    "@stripe/stripe-js": "^2.4.0",
    "@stripe/react-stripe-js": "^2.4.0",
    "stripe": "^14.10.0",
    "next-auth": "^4.24.5",
    "@next-auth/prisma-adapter": "^1.0.7",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4",
    "react-hook-form": "^7.48.2",
    "@hookform/resolvers": "^3.3.2",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.303.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "date-fns": "^3.0.6",
    "react-dropzone": "^14.2.3",
    "sharp": "^0.33.1",
    "nodemailer": "^6.9.8",
    "@types/nodemailer": "^6.4.14",
    "react-query": "^3.39.3",
    "axios": "^1.6.2",
    "framer-motion": "^10.16.16"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.10.5",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "prisma": "^5.7.1",
    "tsx": "^4.6.2",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.0.4",
    "@types/jest": "^29.5.11",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### prisma-schema.txt
```text
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          Role      @default(USER)
  isVerified    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  accounts    Account[]
  sessions    Session[]
  campaigns   Campaign[]
  donations   Donation[]
  comments    Comment[]
  updates     CampaignUpdate[]
  withdrawals Withdrawal[]

  // Profile fields
  firstName   String?
  lastName    String?
  phone       String?
  address     String?
  city        String?
  state       String?
  zipCode     String?
  country     String?
  dateOfBirth DateTime?

  @@map("users")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verificationtokens")
}

model Campaign {
  id                String            @id @default(cuid())
  title             String
  slug              String            @unique
  description       String            @db.Text
  shortDescription  String
  goalAmount        Decimal           @db.Decimal(10, 2)
  currentAmount     Decimal           @default(0) @db.Decimal(10, 2)
  currency          String            @default("USD")
  status            CampaignStatus    @default(ACTIVE)
  category          CampaignCategory  @default(LEGAL_DEFENSE)
  
  // Media
  featuredImage     String?
  images            String[]
  videoUrl          String?
  
  // Legal case information
  caseNumber        String?
  courtName         String?
  attorneyName      String?
  attorneyContact   String?
  caseDescription   String?           @db.Text
  legalStrategy     String?           @db.Text
  
  // Timeline
  startDate         DateTime          @default(now())
  endDate           DateTime?
  deadline          DateTime?
  
  // Settings
  isPublic          Boolean           @default(true)
  allowAnonymous    Boolean           @default(true)
  minimumDonation   Decimal?          @db.Decimal(10, 2)
  maxDonation       Decimal?          @db.Decimal(10, 2)
  
  // Metadata
  viewCount         Int               @default(0)
  shareCount        Int               @default(0)
  donorCount        Int               @default(0)
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  // Relations
  userId            String
  user              User              @relation(fields: [userId], references: [id])
  donations         Donation[]
  comments          Comment[]
  updates           CampaignUpdate[]
  withdrawals       Withdrawal[]
  categories        CampaignCategoryTag[]
  
  @@map("campaigns")
}

model Donation {
  id              String        @id @default(cuid())
  amount          Decimal       @db.Decimal(10, 2)
  currency        String        @default("USD")
  platformFee     Decimal       @db.Decimal(10, 2)
  stripeFee       Decimal       @db.Decimal(10, 2)
  netAmount       Decimal       @db.Decimal(10, 2)
  
  // Donor information
  donorName       String?
  donorEmail      String?
  isAnonymous     Boolean       @default(false)
  message         String?       @db.Text
  
  // Payment information
  stripePaymentId String        @unique
  paymentStatus   PaymentStatus @default(PENDING)
  paymentMethod   String?
  
  // Metadata
  ipAddress       String?
  userAgent       String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  // Relations
  userId          String?
  user            User?         @relation(fields: [userId], references: [id])
  campaignId      String
  campaign        Campaign      @relation(fields: [campaignId], references: [id])
  
  @@map("donations")
}

model Comment {
  id         String   @id @default(cuid())
  content    String   @db.Text
  isApproved Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  // Relations
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  campaignId String
  campaign   Campaign @relation(fields: [campaignId], references: [id])
  
  @@map("comments")
}

model CampaignUpdate {
  id          String   @id @default(cuid())
  title       String
  content     String   @db.Text
  images      String[]
  isPublic    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  campaignId  String
  campaign    Campaign @relation(fields: [campaignId], references: [id])
  
  @@map("campaign_updates")
}

model Withdrawal {
  id              String           @id @default(cuid())
  amount          Decimal          @db.Decimal(10, 2)
  currency        String           @default("USD")
  status          WithdrawalStatus @default(PENDING)
  description     String?          @db.Text
  
  // Bank information
  bankAccountLast4 String?
  routingNumber   String?
  
  // Processing information
  stripeTransferId String?
  processedAt     DateTime?
  rejectedAt      DateTime?
  rejectionReason String?
  
  // Metadata
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  
  // Relations
  userId          String
  user            User             @relation(fields: [userId], references: [id])
  campaignId      String
  campaign        Campaign         @relation(fields: [campaignId], references: [id])
  
  @@map("withdrawals")
}

model CampaignCategoryTag {
  id         String   @id @default(cuid())
  name       String   @unique
  slug       String   @unique
  color      String?
  createdAt  DateTime @default(now())
  
  campaigns  Campaign[]
  
  @@map("campaign_category_tags")
}

// Enums
enum Role {
  USER
  ADMIN
  MODERATOR
}

enum CampaignStatus {
  DRAFT
  ACTIVE
  PAUSED
  COMPLETED
  CANCELLED
  UNDER_REVIEW
}

enum CampaignCategory {
  LEGAL_DEFENSE
  CIVIL_RIGHTS
  CRIMINAL_DEFENSE
  FAMILY_LAW
  BUSINESS_LAW
  PERSONAL_INJURY
  IMMIGRATION
  APPEALS
  CLASS_ACTION
  OTHER
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  CANCELLED
  REFUNDED
}

enum WithdrawalStatus {
  PENDING
  APPROVED
  PROCESSED
  REJECTED
  CANCELLED
}
```

#### progress-component.ts
```ts
'use client'

import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, size = 'md', variant = 'default', ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    const sizes = {
      sm: 'h-1',
      md: 'h-2', 
      lg: 'h-3',
    }
    
    const variants = {
      default: 'bg-primary-600',
      success: 'bg-success-600',
      warning: 'bg-warning-600',
      error: 'bg-error-600',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-gray-200',
          sizes[size],
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full w-full flex-1 transition-all duration-300 ease-in-out',
            variants[variant]
          )}
          style={{
            transform: `translateX(-${100 - percentage}%)`,
          }}
        />
      </div>
    )
  }
)

Progress.displayName = 'Progress'

export { Progress }
```

#### project-structure.sh
```bash
legal-fundraiser/
├── README.md
├── next.config.js
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── .env.local
├── .env.example
├── .gitignore
├── public/
│   ├── favicon.ico
│   ├── logo.png
│   └── images/
│       ├── hero-bg.jpg
│       └── default-campaign.jpg
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── campaign/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── create/
│   │   │       └── page.tsx
│   │   ├── donate/
│   │   │   ├── [campaignId]/
│   │   │   │   └── page.tsx
│   │   │   └── success/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   └── route.ts
│   │       ├── campaigns/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       └── donate/
│   │       │           └── route.ts
│   │       ├── payments/
│   │       │   ├── stripe/
│   │       │   │   └── route.ts
│   │       │   └── webhook/
│   │       │       └── route.ts
│   │       └── uploads/
│   │           └── route.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Progress.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Textarea.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── campaign/
│   │   │   ├── CampaignCard.tsx
│   │   │   ├── CampaignDetails.tsx
│   │   │   ├── CampaignForm.tsx
│   │   │   ├── CampaignProgress.tsx
│   │   │   ├── CampaignUpdates.tsx
│   │   │   └── DonationForm.tsx
│   │   ├── forms/
│   │   │   ├── AuthForm.tsx
│   │   │   ├── ContactForm.tsx
│   │   │   └── WithdrawalForm.tsx
│   │   ├── shared/
│   │   │   ├── Hero.tsx
│   │   │   ├── FeaturedCampaigns.tsx
│   │   │   ├── Stats.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   └── payments/
│   │       ├── StripeProvider.tsx
│   │       ├── CheckoutForm.tsx
│   │       └── PaymentMethods.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCampaigns.ts
│   │   ├── useDonations.ts
│   │   └── useLocalStorage.ts
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── database.ts
│   │   ├── stripe.ts
│   │   ├── utils.ts
│   │   ├── validations.ts
│   │   └── constants.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── campaign.ts
│   │   ├── donation.ts
│   │   └── user.ts
│   ├── styles/
│   │   └── components.css
│   └── middleware.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── SETUP.md
└── tests/
    ├── components/
    ├── pages/
    └── api/
```

#### stats-component.ts
```ts
'use client'

import { useState, useEffect } from 'react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Scale,
  Heart,
  Award,
  Shield,
  CheckCircle
} from 'lucide-react'

interface PlatformStats {
  totalRaised: number
  totalCampaigns: number
  activeCampaigns: number
  totalDonors: number
  averageDonation: number
  successRate: number
  totalUsers: number
  casesWon: number
}

export function Stats() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Fallback to demo stats
      setStats({
        totalRaised: 52000000,
        totalCampaigns: 25000,
        activeCampaigns: 3200,
        totalDonors: 485000,
        averageDonation: 150,
        successRate: 78,
        totalUsers: 125000,
        casesWon: 18500,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading platform statistics...</p>
          </div>
        </div>
      </section>
    )
  }

  if (!stats) {
    return null
  }

  const statItems = [
    {
      icon: DollarSign,
      value: formatCurrency(stats.totalRaised),
      label: 'Total Raised',
      description: 'Funds raised for legal defense',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: Scale,
      value: formatNumber(stats.totalCampaigns),
      label: 'Legal Cases',
      description: 'Cases supported on our platform',
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      icon: Users,
      value: formatNumber(stats.totalDonors),
      label: 'Supporters',
      description: 'People fighting for justice',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: CheckCircle,
      value: formatNumber(stats.casesWon),
      label: 'Cases Won',
      description: 'Successful legal outcomes',
      color: 'text-success-600',
      bgColor: 'bg-success-100',
    },
    {
      icon: TrendingUp,
      value: `${stats.successRate}%`,
      label: 'Success Rate',
      description: 'Campaigns reaching their goals',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      icon: Heart,
      value: formatCurrency(stats.averageDonation),
      label: 'Avg. Donation',
      description: 'Average contribution amount',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Award className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">
              Our Impact
            </h2>
          </div>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Together, we're making justice accessible to everyone. Here's the impact we've made so far.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {statItems.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              
              <div className="text-sm font-medium text-gray-900 mb-1">
                {stat.label}
              </div>
              
              <div className="text-xs text-gray-500">
                {stat.description}
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-16 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Shield className="w-12 h-12 text-primary-600 mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Secure & Trusted</h4>
              <p className="text-sm text-gray-600">
                Bank-level security with SSL encryption and fraud protection
              </p>
            </div>

            <div className="flex flex-col items-center">
              <CheckCircle className="w-12 h-12 text-success-600 mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Verified Cases</h4>
              <p className="text-sm text-gray-600">
                All legal cases are reviewed and verified by our team
              </p>
            </div>

            <div className="flex flex-col items-center">
              <DollarSign className="w-12 h-12 text-green-600 mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Low Fees</h4>
              <p className="text-sm text-gray-600">
                Only 2.9% platform fee - more funds go to legal defense
              </p>
            </div>

            <div className="flex flex-col items-center">
              <Users className="w-12 h-12 text-blue-600 mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Expert Support</h4>
              <p className="text-sm text-gray-600">
                Dedicated team to help optimize your fundraising campaign
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

#### tailwind-config.js
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        mono: ['Monaco', 'Consolas', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 2px 10px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
```

#### testimonials-component.ts
```ts
'use client'

import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Quote, Star, CheckCircle } from 'lucide-react'

interface Testimonial {
  id: string
  name: string
  role: string
  image?: string
  quote: string
  caseType: string
  amountRaised: string
  outcome: 'won' | 'settled' | 'ongoing'
  rating: number
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Martinez',
    role: 'Civil Rights Activist',
    image: '/images/testimonial-1.jpg',
    quote: 'This platform helped me raise $75,000 for my wrongful termination case. The support from the community was incredible, and I was able to get justice.',
    caseType: 'Employment Discrimination',
    amountRaised: '$75,000',
    outcome: 'won',
    rating: 5,
  },
  {
    id: '2',
    name: 'David Thompson',
    role: 'Small Business Owner',
    image: '/images/testimonial-2.jpg',
    quote: 'When I was falsely accused, this platform gave me hope. The transparency and ease of use made it simple to share my story and get the legal help I needed.',
    caseType: 'Criminal Defense',
    amountRaised: '$125,000',
    outcome: 'won',
    rating: 5,
  },
  {
    id: '3',
    name: 'Maria Rodriguez',
    role: 'Immigration Rights Advocate',
    image: '/images/testimonial-3.jpg',
    quote: 'Our family immigration case seemed impossible until we found this platform. The community rallied around us and we successfully fought deportation.',
    caseType: 'Immigration Law',
    amountRaised: '$32,000',
    outcome: 'settled',
    rating: 5,
  },
  {
    id: '4',
    name: 'James Wilson',
    role: 'Personal Injury Victim',
    image: '/images/testimonial-4.jpg',
    quote: 'After my accident, legal fees were overwhelming. This platform connected me with supporters who believed in my case and helped me get fair compensation.',
    caseType: 'Personal Injury',
    amountRaised: '$89,000',
    outcome: 'settled',
    rating: 4,
  },
]

export function Testimonials() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Quote className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">
              Success Stories
            </h2>
          </div>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Real people who found justice through our platform. Their stories inspire us to keep fighting for accessible legal defense.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="p-8 h-full flex flex-col" hover>
              {/* Quote */}
              <div className="flex-grow mb-6">
                <Quote className="w-8 h-8 text-primary-200 mb-4" />
                <blockquote className="text-gray-700 text-lg leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {testimonial.rating}.0
                </span>
              </div>

              {/* Case Info */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Case Type:</span>
                    <p className="font-medium text-gray-900">{testimonial.caseType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Amount Raised:</span>
                    <p className="font-medium text-green-600">{testimonial.amountRaised}</p>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center">
                  <CheckCircle className={`w-4 h-4 mr-2 ${
                    testimonial.outcome === 'won' 
                      ? 'text-green-500' 
                      : testimonial.outcome === 'settled' 
                        ? 'text-blue-500' 
                        : 'text-yellow-500'
                  }`} />
                  <span className="text-sm font-medium">
                    Case {testimonial.outcome === 'won' ? 'Won' : testimonial.outcome === 'settled' ? 'Settled' : 'Ongoing'}
                  </span>
                </div>
              </div>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                  {testimonial.image ? (
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-gray-500 font-medium text-lg">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  )}
                </div>
                
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">4.9/5</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">78%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">25K+</div>
              <div className="text-sm text-gray-600">Cases Supported</div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">$50M+</div>
              <div className="text-sm text-gray-600">Total Raised</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

#### ts-config.json
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"],
      "@/styles/*": ["./src/styles/*"],
      "@/utils/*": ["./src/lib/utils/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### utils.ts
```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number | string,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount)
}

export function formatNumber(
  number: number | string,
  locale: string = 'en-US'
): string {
  const num = typeof number === 'string' ? parseFloat(number) : number
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatPercentage(
  value: number,
  total: number,
  decimals: number = 0
): string {
  if (total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${percentage.toFixed(decimals)}%`
}

export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj)
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  }
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / secondsInUnit)
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`
    }
  }
  
  return 'Just now'
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function calculateDaysLeft(endDate: Date | string): number {
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  const now = new Date()
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

export function calculateProgress(current: number, goal: number): number {
  if (goal === 0) return 0
  return Math.min(100, (current / goal) * 100)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function generateShareUrl(campaignSlug: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}/campaign/${campaignSlug}`
}

export function extractVideoId(url: string): string | null {
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/
  
  const youtubeMatch = url.match(youtubeRegex)
  if (youtubeMatch) return youtubeMatch[1]
  
  const vimeoMatch = url.match(vimeoRegex)
  if (vimeoMatch) return vimeoMatch[1]
  
  return null
}

export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

export const PLATFORM_FEE_PERCENTAGE = 2.9
export const STRIPE_FEE_PERCENTAGE = 2.9

export function calculateFees(amount: number): {
  platformFee: number
  stripeFee: number
  netAmount: number
} {
  const platformFee = (amount * PLATFORM_FEE_PERCENTAGE) / 100
  const stripeFee = (amount * STRIPE_FEE_PERCENTAGE) / 100
  const netAmount = amount - platformFee - stripeFee
  
  return {
    platformFee: Math.round(platformFee * 100) / 100,
    stripeFee: Math.round(stripeFee * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100,
  }
}
```