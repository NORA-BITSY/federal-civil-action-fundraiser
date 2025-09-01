import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CampaignDetails } from '@/components/campaign/CampaignDetails'
import { campaignService } from '@/lib/campaign/service'

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const campaign = await campaignService.getCampaignBySlug(params.slug)
  
  if (!campaign) {
    return {
      title: 'Campaign Not Found | Legal Defense Fund'
    }
  }

  return {
    title: `${campaign.title} | Legal Defense Fund`,
    description: campaign.description.slice(0, 160),
    openGraph: {
      title: campaign.title,
      description: campaign.description.slice(0, 160),
      type: 'website',
      images: campaign.images.length > 0 ? [{
        url: campaign.images[0].url,
        width: 1200,
        height: 630,
        alt: campaign.title
      }] : []
    }
  }
}

export default async function CampaignPage({ params }: PageProps) {
  const campaign = await campaignService.getCampaignBySlug(params.slug)
  
  if (!campaign) {
    notFound()
  }

  return <CampaignDetails campaign={campaign} />
}