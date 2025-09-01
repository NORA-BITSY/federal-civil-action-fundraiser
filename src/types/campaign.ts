export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  profileImage?: string
  userType: 'individual' | 'lawyer' | 'organization'
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
  bio?: string
  phone?: string
  location?: string
  
  // Legal Professional Fields
  barNumber?: string
  lawFirm?: string
  licenseState?: string
  specializations?: string[]
  
  // Organization Fields
  organizationName?: string
  taxId?: string
  organizationType?: 'nonprofit' | 'law_firm' | 'advocacy_group'
}

export interface Campaign {
  id: string
  slug: string
  userId: string
  user: User
  
  // Basic Information
  title: string
  subtitle: string
  description: string
  category: CampaignCategory
  tags: string[]
  location: {
    city: string
    state: string
    country: string
    zipCode?: string
  }
  
  // Legal Case Information
  caseType: string
  caseNumber?: string
  court?: string
  attorney?: {
    name: string
    barNumber: string
    firm: string
    contact: string
  }
  legalSummary: string
  caseDocuments: CampaignDocument[]
  
  // Fundraising Details
  goalAmount: number
  currentAmount: number
  currency: string
  deadline?: Date
  isUrgent: boolean
  isFeatured: boolean
  
  // Budget Breakdown
  budgetBreakdown: BudgetItem[]
  
  // Status and Verification
  status: CampaignStatus
  verificationStatus: VerificationStatus
  verificationNotes?: string
  verifiedAt?: Date
  verifiedBy?: string
  
  // Media and Content
  images: CampaignImage[]
  videos: CampaignVideo[]
  documents: CampaignDocument[]
  updates: CampaignUpdate[]
  
  // Engagement
  supporters: CampaignSupporter[]
  supporterCount: number
  comments: CampaignComment[]
  
  // Analytics
  views: number
  shares: number
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  endedAt?: Date
}

export type CampaignCategory = 
  | 'civil_rights'
  | 'housing_rights'
  | 'employment'
  | 'environmental'
  | 'immigration'
  | 'police_accountability'
  | 'healthcare'
  | 'education'
  | 'family_law'
  | 'disability_rights'
  | 'consumer_protection'
  | 'other'

export type CampaignStatus = 
  | 'draft'
  | 'pending_review'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'expired'

export type VerificationStatus = 
  | 'pending'
  | 'in_review'
  | 'verified'
  | 'rejected'
  | 'needs_revision'

export interface BudgetItem {
  id: string
  category: string
  description: string
  amount: number
  isRequired: boolean
  notes?: string
}

export interface CampaignImage {
  id: string
  url: string
  caption?: string
  alt: string
  isPrimary: boolean
  order: number
  uploadedAt: Date
}

export interface CampaignVideo {
  id: string
  url: string
  title: string
  description?: string
  duration?: number
  thumbnail?: string
  uploadedAt: Date
}

export interface CampaignDocument {
  id: string
  name: string
  url: string
  type: DocumentType
  size: number
  mimeType: string
  description?: string
  isPublic: boolean
  uploadedAt: Date
  uploadedBy: string
}

export type DocumentType = 
  | 'legal_filing'
  | 'court_order'
  | 'evidence'
  | 'correspondence'
  | 'contract'
  | 'financial'
  | 'identification'
  | 'other'

export interface CampaignUpdate {
  id: string
  campaignId: string
  title: string
  content: string
  images?: string[]
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CampaignSupporter {
  id: string
  campaignId: string
  userId?: string
  amount: number
  currency: string
  isAnonymous: boolean
  displayName?: string
  message?: string
  paymentMethod: string
  transactionId: string
  status: PaymentStatus
  createdAt: Date
}

export type PaymentStatus = 
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'disputed'

export interface CampaignComment {
  id: string
  campaignId: string
  userId?: string
  parentId?: string
  content: string
  isAnonymous: boolean
  displayName?: string
  replies?: CampaignComment[]
  isHidden: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CampaignAnalytics {
  campaignId: string
  totalViews: number
  uniqueViews: number
  dailyViews: DailyMetric[]
  conversionRate: number
  averageDonation: number
  topReferrers: string[]
  geographicData: GeographicMetric[]
  deviceData: DeviceMetric[]
  generatedAt: Date
}

export interface DailyMetric {
  date: string
  views: number
  donations: number
  amount: number
}

export interface GeographicMetric {
  location: string
  views: number
  donations: number
  amount: number
}

export interface DeviceMetric {
  device: string
  views: number
  percentage: number
}

// Form Types for Campaign Creation
export interface CampaignFormData {
  // Step 1: Basic Information
  basicInfo: {
    title: string
    subtitle: string
    category: CampaignCategory
    tags: string[]
    location: {
      city: string
      state: string
      zipCode: string
    }
  }
  
  // Step 2: Legal Case Details
  legalDetails: {
    caseType: string
    caseNumber?: string
    court?: string
    legalSummary: string
    attorney?: {
      name: string
      barNumber: string
      firm: string
      contact: string
    }
  }
  
  // Step 3: Fundraising Goals
  fundraising: {
    goalAmount: number
    deadline?: Date
    isUrgent: boolean
    budgetBreakdown: BudgetItem[]
  }
  
  // Step 4: Content and Media
  content: {
    description: string
    images: File[]
    videos: File[]
    documents: File[]
  }
  
  // Step 5: Review and Publish
  settings: {
    allowComments: boolean
    requireApproval: boolean
    isPublic: boolean
  }
}