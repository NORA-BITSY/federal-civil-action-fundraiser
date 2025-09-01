import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CampaignCreationWizard } from '@/components/campaign/CampaignCreationWizard'

export const metadata: Metadata = {
  title: 'Create Campaign | Chips Copilot',
  description: 'Create a fundraising campaign for your CPS/CHIPS case expenses (verified parents only).',
}

export default async function CreateCampaignPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/campaigns/create')
  }

  // Require parent verification for campaign creation
  if (!(session.user as any).isParentVerified) {
    redirect('/verify/wizard')
  }

  return <CampaignCreationWizard />
}