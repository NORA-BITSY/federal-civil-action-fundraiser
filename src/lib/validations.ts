import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const campaignSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(100, 'Title must be less than 100 characters'),
  shortDescription: z.string().min(20, 'Short description must be at least 20 characters').max(200, 'Short description must be less than 200 characters'),
  description: z.string().min(100, 'Description must be at least 100 characters'),
  goalAmount: z.number().min(100, 'Goal amount must be at least $100').max(1000000, 'Goal amount cannot exceed $1,000,000'),
  category: z.enum(['LEGAL_DEFENSE', 'CIVIL_RIGHTS', 'CRIMINAL_DEFENSE', 'FAMILY_LAW', 'BUSINESS_LAW', 'PERSONAL_INJURY', 'IMMIGRATION', 'APPEALS', 'CLASS_ACTION', 'OTHER']),
  caseNumber: z.string().optional(),
  courtName: z.string().optional(),
  attorneyName: z.string().optional(),
  attorneyContact: z.string().optional(),
  endDate: z.date().optional(),
})

export const donationSchema = z.object({
  amount: z.number().min(5, 'Minimum donation is $5').max(10000, 'Maximum donation is $10,000'),
  donorName: z.string().optional(),
  donorEmail: z.string().email('Invalid email address').optional(),
  isAnonymous: z.boolean().default(false),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
})

export const commentSchema = z.object({
  content: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment must be less than 1000 characters'),
})

export const campaignUpdateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  isPublic: z.boolean().default(true),
})

export const withdrawalSchema = z.object({
  amount: z.number().min(10, 'Minimum withdrawal is $10'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  bankAccountLast4: z.string().length(4, 'Bank account last 4 digits required'),
  routingNumber: z.string().length(9, 'Routing number must be 9 digits'),
})

export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
})

export const passwordResetSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CampaignInput = z.infer<typeof campaignSchema>
export type DonationInput = z.infer<typeof donationSchema>
export type CommentInput = z.infer<typeof commentSchema>
export type CampaignUpdateInput = z.infer<typeof campaignUpdateSchema>
export type WithdrawalInput = z.infer<typeof withdrawalSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type PasswordResetInput = z.infer<typeof passwordResetSchema>