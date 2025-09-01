'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { AnimatedWrapper, StaggeredList, StaggeredItem } from '@/components/ui/AnimatedWrapper'
import { useToast } from '@/components/ui/Toast'
import {
  BarChart3,
  Heart,
  TrendingUp,
  Users,
  DollarSign,
  Plus,
  Eye,
  Edit,
  Share2,
  MoreVertical,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Bell,
  Settings,
  CreditCard,
  Activity,
  Target,
  Award
} from 'lucide-react'

// Mock data - in real app, this would come from your API
const mockDashboardData = {
  user: {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    joinDate: '2024-01-15',
    avatar: '/avatars/sarah.jpg'
  },
  stats: {
    campaignsCreated: 3,
    totalRaised: 47500,
    totalDonated: 2850,
    supportedCases: 12,
    avgDonation: 237.50
  },
  campaigns: [
    {
      id: '1',
      title: 'Housing Discrimination Case - Johnson Family',
      status: 'active',
      currentAmount: 18750,
      goalAmount: 25000,
      donorCount: 247,
      daysLeft: 23,
      category: 'Housing Rights',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Environmental Justice: Clean Water Access',
      status: 'active',
      currentAmount: 32100,
      goalAmount: 45000,
      donorCount: 412,
      daysLeft: 35,
      category: 'Environmental',
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      title: 'Civil Rights Violation Case',
      status: 'completed',
      currentAmount: 50000,
      goalAmount: 50000,
      donorCount: 523,
      daysLeft: 0,
      category: 'Civil Rights',
      createdAt: '2024-01-05'
    }
  ],
  recentDonations: [
    { id: '1', campaign: 'Police Accountability Case', amount: 100, date: '2024-01-20' },
    { id: '2', campaign: 'Immigration Family Reunification', amount: 250, date: '2024-01-18' },
    { id: '3', campaign: 'Workplace Discrimination Defense', amount: 75, date: '2024-01-15' },
    { id: '4', campaign: 'Environmental Justice Case', amount: 500, date: '2024-01-12' }
  ],
  activities: [
    { id: '1', type: 'donation', message: 'You donated $100 to Police Accountability Case', time: '2 hours ago' },
    { id: '2', type: 'campaign_update', message: 'Housing Discrimination Case received a new update', time: '1 day ago' },
    { id: '3', type: 'milestone', message: 'Environmental Justice case reached 75% of goal', time: '2 days ago' },
    { id: '4', type: 'donation', message: 'You donated $250 to Immigration case', time: '3 days ago' }
  ]
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  paused: 'bg-gray-100 text-gray-800'
}

function StatCard({ icon: Icon, title, value, change, positive = true }: any) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className={`flex items-center mt-2 text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {change}
              </div>
            )}
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CampaignCard({ campaign }: { campaign: any }) {
  const progress = Math.round((campaign.currentAmount / campaign.goalAmount) * 100)
  
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[campaign.status as keyof typeof statusColors]}`}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </span>
              <span className="text-xs text-gray-500">{campaign.category}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
              {campaign.title}
            </h3>
            <div className="flex items-center text-xs text-gray-500 space-x-4">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(campaign.createdAt).toLocaleDateString()}
              </div>
              {campaign.daysLeft > 0 && (
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {campaign.daysLeft} days left
                </div>
              )}
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-900">
              ${campaign.currentAmount.toLocaleString()} raised
            </span>
            <span className="text-gray-500">
              of ${campaign.goalAmount.toLocaleString()}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{campaign.donorCount} supporters</span>
            <span>{progress}% funded</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-gray-100">
          <Link href={`/campaigns/${campaign.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full rounded-xl">
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
          </Link>
          <Button size="sm" variant="ghost" className="rounded-xl">
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="rounded-xl">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const { addToast } = useToast()
  const [selectedTab, setSelectedTab] = useState('overview')

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    redirect('/auth/login')
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'campaigns', name: 'My Campaigns', icon: Heart },
    { id: 'donations', name: 'Donations', icon: DollarSign },
    { id: 'activity', name: 'Activity', icon: Activity }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <AnimatedWrapper variant="slideUp">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {session?.user?.name || 'User'}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Manage your campaigns and track your impact
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="sm" className="rounded-xl">
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                  </Button>
                  <Link href="/dashboard/settings">
                    <Button variant="ghost" size="sm" className="rounded-xl">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                  <Link href="/campaigns/create">
                    <Button size="sm" className="rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Campaign
                    </Button>
                  </Link>
                </div>
              </div>
            </AnimatedWrapper>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StaggeredItem>
                <StatCard
                  icon={Heart}
                  title="Campaigns Created"
                  value={mockDashboardData.stats.campaignsCreated}
                  change="+1 this month"
                />
              </StaggeredItem>
              <StaggeredItem>
                <StatCard
                  icon={DollarSign}
                  title="Total Raised"
                  value={`$${mockDashboardData.stats.totalRaised.toLocaleString()}`}
                  change="+12% vs last month"
                />
              </StaggeredItem>
              <StaggeredItem>
                <StatCard
                  icon={Users}
                  title="Cases Supported"
                  value={mockDashboardData.stats.supportedCases}
                  change="+3 this month"
                />
              </StaggeredItem>
              <StaggeredItem>
                <StatCard
                  icon={Target}
                  title="Total Donated"
                  value={`$${mockDashboardData.stats.totalDonated.toLocaleString()}`}
                  change="+8% vs last month"
                />
              </StaggeredItem>
            </StaggeredList>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Recent Activity */}
              <div className="lg:col-span-2">
                <AnimatedWrapper variant="slideUp">
                  <Card className="border-0 bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                        <Button variant="ghost" size="sm" className="rounded-xl">
                          View All
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {mockDashboardData.activities.map((activity) => (
                          <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              {activity.type === 'donation' && <DollarSign className="w-4 h-4 text-blue-600" />}
                              {activity.type === 'campaign_update' && <Bell className="w-4 h-4 text-blue-600" />}
                              {activity.type === 'milestone' && <Award className="w-4 h-4 text-blue-600" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{activity.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedWrapper>
              </div>

              {/* Quick Actions */}
              <div>
                <AnimatedWrapper variant="slideLeft">
                  <Card className="border-0 bg-white mb-6">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                      <div className="space-y-3">
                        <Link href="/campaigns/create">
                          <Button variant="outline" size="sm" className="w-full justify-start rounded-xl">
                            <Plus className="w-4 h-4 mr-3" />
                            Create Campaign
                          </Button>
                        </Link>
                        <Link href="/campaigns">
                          <Button variant="outline" size="sm" className="w-full justify-start rounded-xl">
                            <Heart className="w-4 h-4 mr-3" />
                            Browse Cases
                          </Button>
                        </Link>
                        <Link href="/dashboard/settings">
                          <Button variant="outline" size="sm" className="w-full justify-start rounded-xl">
                            <Settings className="w-4 h-4 mr-3" />
                            Account Settings
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedWrapper>

                {/* Recent Donations */}
                <AnimatedWrapper variant="slideLeft" delay={0.2}>
                  <Card className="border-0 bg-white">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Donations</h2>
                      <div className="space-y-3">
                        {mockDashboardData.recentDonations.slice(0, 4).map((donation) => (
                          <div key={donation.id} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                {donation.campaign}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(donation.date).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-green-600">
                              +${donation.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Link href="/dashboard?tab=donations" className="block mt-4">
                        <Button variant="ghost" size="sm" className="w-full rounded-xl">
                          View All Donations
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </AnimatedWrapper>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">My Campaigns</h2>
              <Link href="/campaigns/create">
                <Button className="rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Campaign
                </Button>
              </Link>
            </div>

            <StaggeredList className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockDashboardData.campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </StaggeredList>
          </div>
        )}

        {selectedTab === 'donations' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Donation History</h2>
            
            <Card className="border-0 bg-white">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {mockDashboardData.recentDonations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                      <div>
                        <h3 className="font-medium text-gray-900">{donation.campaign}</h3>
                        <p className="text-sm text-gray-500">{new Date(donation.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-semibold text-gray-900">${donation.amount}</span>
                        <p className="text-sm text-gray-500">Donation</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === 'activity' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Activity Timeline</h2>
            
            <Card className="border-0 bg-white">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {mockDashboardData.activities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {activity.type === 'donation' && <DollarSign className="w-5 h-5 text-blue-600" />}
                        {activity.type === 'campaign_update' && <Bell className="w-5 h-5 text-blue-600" />}
                        {activity.type === 'milestone' && <Award className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900">{activity.message}</p>
                        <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}