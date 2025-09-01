import { Metadata } from 'next'
import { CampaignCreationWizard } from '@/components/campaign/CampaignCreationWizard'

export const metadata: Metadata = {
  title: 'Create Campaign | Legal Defense Fund',
  description: 'Start a legal defense campaign and get the support you need for your case.',
}

export default function CreateCampaignPage() {
  return <CampaignCreationWizard />
}