'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { AnimatedWrapper, StaggeredList, StaggeredItem } from '@/components/ui/AnimatedWrapper'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { 
  Plus, 
  DollarSign, 
  Users, 
  Eye, 
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Share2,
  BarChart3,
  MessageCircle,
  Download
} from 'lucide-react'

interface DashboardStats {
  totalCampaigns: number
  activeCampaigns: number
  totalRaised: number
  totalSupporters: number
  totalViews: number
  conversionRate: number
}

interface RecentActivity {
  id: string
  type: 'donation' | 'comment' | 'view' | 'share' | 'update'
  description: string
  amount?: number
  user?: string
  campaignTitle: string
  timestamp: Date
}

interface CampaignSummary {
  id: string
  title: string
  slug: string
  status: 'draft' | 'pending_review' | 'active' | 'paused' | 'completed'
  currentAmount: number
  goalAmount: number
  supporterCount: number
  views: number
  daysLeft?: number
  lastUpdate: Date
}

// Mock data - replace with actual API calls
const mockStats: DashboardStats = {
  totalCampaigns: 3,
  activeCampaigns: 2,
  totalRaised: 47250,
  totalSupporters: 156,
  totalViews: 2847,
  conversionRate: 5.5
}

const mockActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'donation',
    description: 'New donation received',
    amount: 150,
    user: 'Sarah M.',
    campaignTitle: 'Housing Rights Victory for the Johnson Family',
    timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    id: '2',
    type: 'comment',
    description: 'New comment added',
    user: 'Michael R.',
    campaignTitle: 'Environmental Justice: Clean Water Access',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  {
    id: '3',
    type: 'donation',
    description: 'New donation received',
    amount: 75,
    user: 'Jennifer L.',
    campaignTitle: 'Housing Rights Victory for the Johnson Family',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 hours ago
  }
]

const mockCampaigns: CampaignSummary[] = [
  {
    id: '1',
    title: 'Housing Rights Victory for the Johnson Family',
    slug: 'housing-rights-johnson-family',
    status: 'active',
    currentAmount: 18750,
    goalAmount: 25000,
    supporterCount: 87,
    views: 1247,
    daysLeft: 23,
    lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
  },
  {
    id: '2',
    title: 'Environmental Justice: Clean Water Access',
    slug: 'clean-water-riverside-community',
    status: 'active',
    currentAmount: 28500,
    goalAmount: 45000,
    supporterCount: 69,
    views: 1600,
    daysLeft: 45,
    lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
  },
  {
    id: '3',
    title: 'Workplace Discrimination Defense',
    slug: 'workplace-discrimination-tech-company',
    status: 'pending_review',
    currentAmount: 0,
    goalAmount: 35000,
    supporterCount: 0,
    views: 0,
    lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
  }
]

function StatCard({ title, value, icon: Icon, trend }: {
  title: string
  value: string | number
  icon: React.ComponentType<any>
  trend?: { value: number; isPositive: boolean }
}) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {trend && (
              <div className={`flex items-center mt-2 text-sm ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`w-4 h-4 mr-1 ${
                  trend.isPositive ? '' : 'transform rotate-180'
                }`} />
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          <div className="p-3 bg-blue-100 rounded-xl">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ activity }: { activity: RecentActivity }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'donation':
        return DollarSign
      case 'comment':
        return MessageCircle
      case 'view':
        return Eye
      case 'share':
        return Share2
      case 'update':
        return Edit
      default:
        return AlertCircle
    }
  }

  const Icon = getIcon()
  const timeAgo = getTimeAgo(activity.timestamp)

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="p-2 bg-blue-100 rounded-lg">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">
            {activity.description}
            {activity.amount && (
              <span className="text-green-600 ml-1 font-semibold">
                ${activity.amount}
              </span>
            )}
          </p>
          <span className="text-xs text-gray-500">{timeAgo}</span>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {activity.user && `by ${activity.user} • `}
          {activity.campaignTitle}
        </p>
      </div>
    </div>
  )
}

function CampaignCard({ campaign }: { campaign: CampaignSummary }) {
  const progressPercentage = (campaign.currentAmount / campaign.goalAmount) * 100
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'pending_review':
        return 'text-yellow-600 bg-yellow-100'
      case 'draft':
        return 'text-gray-600 bg-gray-100'
      case 'paused':
        return 'text-orange-600 bg-orange-100'
      case 'completed':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return CheckCircle
      case 'pending_review':
        return Clock
      case 'draft':
        return Edit
      default:
        return AlertCircle
    }
  }

  const StatusIcon = getStatusIcon(campaign.status)

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {campaign.title}
            </h3>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {campaign.status.replace('_', ' ')}
            </div>
          </div>
        </div>

        {campaign.status === 'active' && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-900">
                  ${campaign.currentAmount.toLocaleString()}
                </span>
                <span className="text-gray-500">
                  of ${campaign.goalAmount.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-semibold text-gray-900">{campaign.supporterCount}</div>
                <div className="text-gray-600">supporters</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">{campaign.views}</div>
                <div className="text-gray-600">views</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">{campaign.daysLeft || 0}</div>
                <div className="text-gray-600">days left</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Updated {getTimeAgo(campaign.lastUpdate)}
          </span>
          <div className="flex items-center space-x-2">
            <Link href={`/dashboard/campaigns/${campaign.id}`}>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-1" />
                Manage
              </Button>
            </Link>
            {campaign.status === 'active' && (
              <Link href={`/campaigns/${campaign.slug}`} target="_blank">
                <Button size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) {
    return `${minutes}m ago`
  } else if (hours < 24) {
    return `${hours}h ago`
  } else {
    return `${days}d ago`
  }
}

export function DashboardOverview() {
  const [timeRange, setTimeRange] = useState('30d')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your campaigns and track your impact</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Link href="/campaigns/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <AnimatedWrapper>
        <StaggeredList className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StaggeredItem>
            <StatCard
              title="Total Raised"
              value={`$${mockStats.totalRaised.toLocaleString()}`}
              icon={DollarSign}
              trend={{ value: 12.5, isPositive: true }}
            />
          </StaggeredItem>
          <StaggeredItem>
            <StatCard
              title="Total Supporters"
              value={mockStats.totalSupporters}
              icon={Users}
              trend={{ value: 8.2, isPositive: true }}
            />
          </StaggeredItem>
          <StaggeredItem>
            <StatCard
              title="Campaign Views"
              value={mockStats.totalViews.toLocaleString()}
              icon={Eye}
              trend={{ value: 15.7, isPositive: true }}
            />
          </StaggeredItem>
          <StaggeredItem>
            <StatCard
              title="Conversion Rate"
              value={`${mockStats.conversionRate}%`}
              icon={TrendingUp}
              trend={{ value: 2.1, isPositive: true }}
            />
          </StaggeredItem>
        </StaggeredList>
      </AnimatedWrapper>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* My Campaigns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">My Campaigns</h2>
            <Link href="/dashboard/campaigns">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          <AnimatedWrapper>
            <StaggeredList className="space-y-4">
              {mockCampaigns.map((campaign) => (
                <StaggeredItem key={campaign.id}>
                  <CampaignCard campaign={campaign} />
                </StaggeredItem>
              ))}
            </StaggeredList>
          </AnimatedWrapper>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/campaigns/create" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Campaign
                  </Button>
                </Link>
                <Link href="/dashboard/analytics" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
                <Link href="/dashboard/settings" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="w-4 h-4 mr-2" />
                    Account Settings
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                <Link href="/dashboard/activity">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-1">
                {mockActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Help & Resources */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
              <div className="space-y-3 text-sm">
                <Link href="/support" className="flex items-center text-blue-600 hover:text-blue-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Link>
                <Link href="/resources" className="flex items-center text-blue-600 hover:text-blue-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  Campaign Best Practices
                </Link>
                <Link href="/how-it-works" className="flex items-center text-blue-600 hover:text-blue-700">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  How It Works
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}