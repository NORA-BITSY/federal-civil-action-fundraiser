import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { ok: false, status: 401, msg: 'Authentication required' }
  }
  return { ok: true, userId: session.user.id, user: session.user }
}

export async function requireParent() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { ok: false, status: 401, msg: 'Authentication required' }
  }
  if (!(session.user as any).isParentVerified) {
    return { ok: false, status: 403, msg: 'Only verified parents can access this resource' }
  }
  return { ok: true, userId: session.user.id, user: session.user }
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { ok: false, status: 401, msg: 'Authentication required' }
  }
  if ((session.user as any).role !== 'ADMIN') {
    return { ok: false, status: 403, msg: 'Admin access required' }
  }
  return { ok: true, userId: session.user.id, user: session.user }
}

export function validateParentOnlyResource(resourceType: string, action: string): boolean {
  // Define which resources and actions are restricted to verified parents only
  const parentsOnlyResources = {
    'campaign': ['create', 'publish'],
    'vault': ['upload', 'view', 'delete'],
    'copilot': ['ask', 'chat'],
    'verification': ['submit', 'view']
  }
  
  const allowedActions = parentsOnlyResources[resourceType as keyof typeof parentsOnlyResources]
  return allowedActions ? allowedActions.includes(action) : false
}

export function checkRateLimit(userId: string, action: string): { allowed: boolean; resetTime?: number } {
  // TODO Phase-2: Implement rate limiting with Redis or in-memory cache
  // For Phase-1, allow all requests
  
  const rateLimits = {
    'copilot_ask': { limit: 10, window: 60000 }, // 10 requests per minute
    'vault_upload': { limit: 5, window: 300000 }, // 5 uploads per 5 minutes
    'verification_attempt': { limit: 3, window: 3600000 }, // 3 attempts per hour
  }
  
  // Phase-1: Always allow (implement actual rate limiting in Phase-2)
  return { allowed: true }
}

export function sanitizeUserInput(input: string): string {
  // Basic input sanitization
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 5000) // Limit length
}

export function validateFileUpload(file: { name: string; size: number; type: string }): { valid: boolean; error?: string } {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ]
  
  const maxSize = 50 * 1024 * 1024 // 50MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large (max 50MB)' }
  }
  
  // Check for suspicious file names
  const suspiciousPatterns = /\.(exe|bat|cmd|scr|vbs|js|jar|com|pif)$/i
  if (suspiciousPatterns.test(file.name)) {
    return { valid: false, error: 'File type not allowed' }
  }
  
  return { valid: true }
}