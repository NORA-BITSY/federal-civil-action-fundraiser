'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ArrowRight, TrendingUp, Users, Calendar, Heart } from 'lucide-react'

// Mock campaign data for now
const mockCampaigns = [
  {
    id: '1',
    title: 'Fighting Wrongful Eviction - Single Mother Needs Help',
    shortDescription: 'Maria Rodriguez faces illegal eviction tactics from her landlord. Help her fight for housing rights and keep her family in their home.',
    goalAmount: 15000,
    currentAmount: 8750,
    donorCount: 127,
    category: 'FAMILY_LAW',
    timeLeft: '23 days left',
    image: '/images/default-campaign.jpg',
    slug: 'fighting-wrongful-eviction'
  },
  {
    id: '2',
    title: 'Defending Free Speech Rights - Student Journalist Case',
    shortDescription: 'College student faces suspension for reporting on campus issues. Support press freedom and student rights.',
    goalAmount: 25000,
    currentAmount: 19250,
    donorCount: 284,
    category: 'CIVIL_RIGHTS',
    timeLeft: '15 days left',
    image: '/images/default-campaign.jpg',
    slug: 'defending-free-speech-rights'
  },
  {
    id: '3',
    title: 'Immigration Family Reunification Legal Fund',
    shortDescription: 'Separated family seeks legal help to reunite. Your support can bring a father back to his children.',
    goalAmount: 12000,
    currentAmount: 7300,
    donorCount: 156,
    category: 'IMMIGRATION',
    timeLeft: '31 days left',
    image: '/images/default-campaign.jpg',
    slug: 'immigration-family-reunification'
  },
  {
    id: '4',
    title: 'Police Misconduct Case - Seeking Justice',
    shortDescription: 'Victim of police brutality seeks legal representation to hold officers accountable and prevent future incidents.',
    goalAmount: 35000,
    currentAmount: 22100,
    donorCount: 412,
    category: 'CIVIL_RIGHTS',
    timeLeft: '18 days left',
    image: '/images/default-campaign.jpg',
    slug: 'police-misconduct-case'
  },
  {
    id: '5',
    title: 'Workers Rights - Union Organizer Defense',
    shortDescription: 'Factory worker faces retaliation for organizing. Help defend labor rights and workplace safety.',
    goalAmount: 18000,
    currentAmount: 11900,
    donorCount: 203,
    category: 'BUSINESS_LAW',
    timeLeft: '26 days left',
    image: '/images/default-campaign.jpg',
    slug: 'workers-rights-union-defense'
  },
  {
    id: '6',
    title: 'Environmental Justice - Community vs. Polluter',
    shortDescription: 'Neighborhood fights chemical company polluting their water. Support environmental justice.',
    goalAmount: 50000,
    currentAmount: 31500,
    donorCount: 567,
    category: 'CLASS_ACTION',
    timeLeft: '12 days left',
    image: '/images/default-campaign.jpg',
    slug: 'environmental-justice-community'
  }
]

const categoryColors = {
  CIVIL_RIGHTS: 'primary',
  FAMILY_LAW: 'success',
  IMMIGRATION: 'warning',
  BUSINESS_LAW: 'secondary',
  CLASS_ACTION: 'error',
} as const

export function FeaturedCampaigns() {
  const [campaigns, setCampaigns] = useState<typeof mockCampaigns>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCampaigns(mockCampaigns)
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading featured campaigns...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Legal Defense Campaigns
            </h2>
          </div>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Support these urgent legal cases that need your help. Every contribution makes a difference in the fight for justice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {campaigns.map((campaign) => {
            const progressPercentage = (campaign.currentAmount / campaign.goalAmount) * 100
            
            return (
              <Card key={campaign.id} hover className="overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <div className="text-center text-blue-700">
                      <Heart className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm font-medium">Campaign Image</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={categoryColors[campaign.category as keyof typeof categoryColors] || 'default'}>
                      {campaign.category.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-gray-500">{campaign.timeLeft}</span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {campaign.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {campaign.shortDescription}
                  </p>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-gray-900">
                          ${campaign.currentAmount.toLocaleString()}
                        </span>
                        <span className="text-gray-600">
                          of ${campaign.goalAmount.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={progressPercentage} 
                        className="mb-2"
                        variant={progressPercentage >= 100 ? 'success' : 'default'}
                      />
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{campaign.donorCount} supporters</span>
                        </div>
                        <span>{Math.round(progressPercentage)}% funded</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Link href={`/campaign/${campaign.slug}`} className="flex-1">
                        <Button variant="outline" size="sm" fullWidth>
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/donate/${campaign.id}`} className="flex-1">
                        <Button size="sm" fullWidth>
                          Donate Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="text-center">
          <Link href="/campaigns">
            <Button size="lg" variant="outline">
              View All Campaigns
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}