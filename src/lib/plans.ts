export const Plans = {
  FREE_TRIAL: { 
    name: 'Free Trial',
    price: 0,
    ragLimit: 10, // 10 AI questions per month
    exports: false,
    vaultStorageGB: 1,
    features: [
      'Parent verification',
      'Basic document vault (1GB)',
      '10 AI assistance questions/month',
      'Basic case organization',
      'Community access'
    ],
    limitations: [
      'No document exports',
      'Limited AI assistance',
      'Basic support only'
    ]
  },
  CORE: { 
    name: 'Core',
    price: 29.99,
    ragLimit: 100, // 100 AI questions per month
    exports: true,
    vaultStorageGB: 10,
    features: [
      'Everything in Free Trial',
      'Extended document vault (10GB)',
      '100 AI assistance questions/month',
      'Document export (PDF, Word)',
      'Timeline generation',
      'Priority support',
      'Campaign creation'
    ],
    limitations: [
      'No advanced analytics'
    ]
  },
  PRO: { 
    name: 'Pro',
    price: 49.99,
    ragLimit: 300, // 300 AI questions per month
    exports: true,
    vaultStorageGB: 50,
    features: [
      'Everything in Core',
      'Large document vault (50GB)',
      '300 AI assistance questions/month',
      'Advanced document analysis',
      'Custom letter templates',
      'Case timeline analytics',
      'Bulk document processing',
      'Phone support'
    ],
    limitations: []
  }
} as const

export type PlanType = keyof typeof Plans
export type PlanFeatures = typeof Plans[PlanType]

export function getPlanFeatures(planType: PlanType): PlanFeatures {
  return Plans[planType]
}

export function canAccessFeature(userPlan: string, feature: string): boolean {
  const plan = userPlan.toUpperCase() as PlanType
  const planData = Plans[plan] || Plans.FREE_TRIAL
  
  const featureMap = {
    'ai_copilot': true, // All plans have basic AI
    'document_export': planData.exports,
    'advanced_analytics': plan === 'PRO',
    'bulk_processing': plan === 'PRO',
    'campaign_creation': plan !== 'FREE_TRIAL',
    'priority_support': plan !== 'FREE_TRIAL',
    'phone_support': plan === 'PRO'
  }
  
  return featureMap[feature as keyof typeof featureMap] || false
}

export function getRemainingQueries(userPlan: string, usedQueries: number): number {
  const plan = userPlan.toUpperCase() as PlanType
  const planData = Plans[plan] || Plans.FREE_TRIAL
  return Math.max(0, planData.ragLimit - usedQueries)
}

export function shouldShowUpgradePrompt(userPlan: string, feature: string): boolean {
  if (canAccessFeature(userPlan, feature)) {
    return false
  }
  
  // Show upgrade prompts for features that are available in higher plans
  const upgradeFeatures = [
    'document_export',
    'advanced_analytics',
    'bulk_processing',
    'campaign_creation',
    'priority_support'
  ]
  
  return upgradeFeatures.includes(feature)
}

export function getUpgradeMessage(currentPlan: string, targetFeature: string): string {
  const plan = currentPlan.toUpperCase() as PlanType
  
  const messages = {
    'document_export': 'Upgrade to Core or Pro to export your documents and timelines.',
    'advanced_analytics': 'Upgrade to Pro for advanced case analytics and insights.',
    'bulk_processing': 'Upgrade to Pro to process multiple documents at once.',
    'campaign_creation': 'Upgrade to Core or Pro to create fundraising campaigns.',
    'priority_support': 'Upgrade to Core or Pro for priority customer support.'
  }
  
  return messages[targetFeature as keyof typeof messages] || 'Upgrade your plan to access this feature.'
}

export const STRIPE_PRICE_IDS = {
  CORE: process.env.STRIPE_PRICE_CORE,
  PRO: process.env.STRIPE_PRICE_PRO
} as const