import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/database'
import ChipsCopdilotDashboard from '@/components/dashboard/ChipsCopilotDashboard'

export const metadata: Metadata = {
  title: 'Dashboard | Chips Copilot',
  description: 'Your parent-only case management and AI assistance dashboard.',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/login')
  }

  // Check if parent verification is complete
  const isParentVerified = (session.user as any).isParentVerified

  if (!isParentVerified) {
    // Get verification status
    const verification = await prisma.parentVerification.findUnique({
      where: { userId: (session.user as any).id },
      select: { status: true }
    })

    // If no verification started, redirect to verification wizard
    if (!verification) {
      redirect('/verify/wizard')
    }
  }

  // Get user subscription info
  const subscription = await prisma.subscription.findUnique({
    where: { userId: (session.user as any).id },
    select: { plan: true, status: true }
  })

  // Get recent vault files
  const recentFiles = await prisma.vaultFile.findMany({
    where: { userId: (session.user as any).id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      tags: true,
      piiRedacted: true
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ChipsCopdilotDashboard 
          user={session.user}
          isParentVerified={isParentVerified}
          subscription={subscription}
          recentFiles={recentFiles}
        />
      </div>
    </div>
  )
}