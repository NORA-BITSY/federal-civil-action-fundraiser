import { notFound } from 'next/navigation'
import { prisma } from '@/lib/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Link from 'next/link'
import { ArrowLeft, Heart, Users, Target } from 'lucide-react'

interface DonatePageProps {
  params: { campaignId: string }
}

async function getCampaign(id: string) {
  try {
    return await prisma.campaign.findUnique({
      where: {
        OR: [
          { id },
          { slug: id }
        ]
      },
      select: {
        id: true,
        title: true,
        shortDescription: true,
        goalAmount: true,
        currentAmount: true,
        status: true,
        user: {
          select: {
            name: true,
          }
        },
        _count: {
          select: {
            donations: true,
          }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return null
  }
}

export default async function DonatePage({ params }: DonatePageProps) {
  const campaign = await getCampaign(params.campaignId)

  if (!campaign) {
    notFound()
  }

  if (campaign.status !== 'ACTIVE') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Campaign Not Available
              </h1>
              <p className="text-gray-600 mb-6">
                This campaign is no longer accepting donations.
              </p>
              <Link
                href="/campaigns"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Browse Other Campaigns
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const progressPercentage = Math.min((Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100, 100)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href={`/campaign/${params.campaignId}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaign
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Campaign Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Support This Campaign</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {campaign.title}
                  </h2>
                  <p className="text-gray-600">
                    {campaign.shortDescription}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-gray-900">
                      ${Number(campaign.currentAmount).toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-600">
                      of ${Number(campaign.goalAmount).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{campaign._count.donations} supporters</span>
                    </div>
                    <span>{Math.round(progressPercentage)}% funded</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Campaign organizer:</strong> {campaign.user.name}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Donation Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Make a Donation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Donation System Coming Soon
                  </h3>
                  <p className="text-gray-600 mb-6">
                    The Stripe integration for processing donations will be implemented next.
                    This would include:
                  </p>
                  <ul className="text-left text-sm text-gray-600 space-y-2 max-w-sm mx-auto">
                    <li>• Secure payment processing with Stripe</li>
                    <li>• Custom donation amounts</li>
                    <li>• Anonymous donation option</li>
                    <li>• Personal messages for donors</li>
                    <li>• Real-time progress updates</li>
                    <li>• Email confirmations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}