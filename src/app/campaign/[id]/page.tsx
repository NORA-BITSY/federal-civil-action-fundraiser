import { notFound } from 'next/navigation'
import { prisma } from '@/lib/database'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { Users, Clock, Share2, Heart, MapPin, Scale, Calendar } from 'lucide-react'
import Link from 'next/link'

interface CampaignPageProps {
  params: { id: string }
}

async function getCampaign(id: string) {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: {
        OR: [
          { id },
          { slug: id }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        donations: {
          where: { 
            paymentStatus: 'SUCCEEDED',
            isAnonymous: false 
          },
          select: {
            id: true,
            amount: true,
            donorName: true,
            message: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            donations: true,
            comments: true,
          }
        }
      }
    })

    if (!campaign) return null

    // Increment view count (in a real app, you'd want to track unique views)
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { viewCount: { increment: 1 } }
    })

    return campaign
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

  const progressPercentage = Math.min((Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100, 100)
  const daysLeft = campaign.endDate 
    ? Math.max(0, Math.ceil((campaign.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null

  const categoryColors = {
    CIVIL_RIGHTS: 'primary',
    FAMILY_LAW: 'success',
    IMMIGRATION: 'warning',
    BUSINESS_LAW: 'secondary',
    CLASS_ACTION: 'error',
    LEGAL_DEFENSE: 'primary',
    CRIMINAL_DEFENSE: 'warning',
    PERSONAL_INJURY: 'error',
    APPEALS: 'secondary',
    OTHER: 'default',
  } as const

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Campaign Image */}
            <div className="lg:col-span-2">
              <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mb-6">
                <div className="text-center text-blue-700">
                  <Scale className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg font-medium">Campaign Image</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Badge variant={categoryColors[campaign.category as keyof typeof categoryColors] || 'default'}>
                    {campaign.category.replace('_', ' ')}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Created by {campaign.user.name}
                  </span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  {campaign.title}
                </h1>

                <p className="text-lg text-gray-600">
                  {campaign.shortDescription}
                </p>
              </div>
            </div>

            {/* Donation Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-2xl font-bold text-gray-900">
                          ${Number(campaign.currentAmount).toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-600">
                          of ${Number(campaign.goalAmount).toLocaleString()}
                        </span>
                      </div>
                      
                      <Progress 
                        value={progressPercentage} 
                        className="mb-3"
                        variant={progressPercentage >= 100 ? 'success' : 'default'}
                      />
                      
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{Math.round(progressPercentage)}% funded</span>
                        <span>{campaign._count.donations} supporters</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <Users className="w-5 h-5 text-gray-500 mr-1" />
                        </div>
                        <div className="text-xl font-semibold text-gray-900">
                          {campaign._count.donations}
                        </div>
                        <div className="text-sm text-gray-600">Supporters</div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <Clock className="w-5 h-5 text-gray-500 mr-1" />
                        </div>
                        <div className="text-xl font-semibold text-gray-900">
                          {daysLeft !== null ? `${daysLeft}` : '∞'}
                        </div>
                        <div className="text-sm text-gray-600">Days left</div>
                      </div>
                    </div>

                    {/* Donate Button */}
                    <div className="space-y-3">
                      <Link href={`/donate/${campaign.id}`}>
                        <Button size="lg" fullWidth>
                          <Heart className="w-5 h-5 mr-2" />
                          Donate Now
                        </Button>
                      </Link>
                      
                      <Button variant="outline" size="lg" fullWidth>
                        <Share2 className="w-5 h-5 mr-2" />
                        Share Campaign
                      </Button>
                    </div>

                    {/* Case Details */}
                    {(campaign.caseNumber || campaign.courtName) && (
                      <div className="pt-4 border-t border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3">Case Information</h3>
                        <div className="space-y-2 text-sm">
                          {campaign.caseNumber && (
                            <div className="flex items-start">
                              <Scale className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                              <div>
                                <span className="text-gray-600">Case Number:</span>
                                <br />
                                <span className="font-medium">{campaign.caseNumber}</span>
                              </div>
                            </div>
                          )}
                          {campaign.courtName && (
                            <div className="flex items-start">
                              <MapPin className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                              <div>
                                <span className="text-gray-600">Court:</span>
                                <br />
                                <span className="font-medium">{campaign.courtName}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Story</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{campaign.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Donations */}
            {campaign.donations.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Recent Supporters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaign.donations.map((donation) => (
                      <div key={donation.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Heart className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">
                              {donation.donorName || 'Anonymous Supporter'}
                            </p>
                            <span className="font-semibold text-green-600">
                              ${Number(donation.amount).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </p>
                          {donation.message && (
                            <p className="text-sm text-gray-700 mt-2 italic">
                              &ldquo;{donation.message}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            {/* Campaign Organizer */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{campaign.user.name}</p>
                    <p className="text-sm text-gray-600">Campaign Creator</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Created {new Date(campaign.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}