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