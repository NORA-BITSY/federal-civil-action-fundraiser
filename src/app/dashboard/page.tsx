import { Metadata } from 'next'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'

export const metadata: Metadata = {
  title: 'Dashboard | Legal Defense Fund',
  description: 'Manage your campaigns and track your fundraising progress.',
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardOverview />
      </div>
    </div>
  )
}