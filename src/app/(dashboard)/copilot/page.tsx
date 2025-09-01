import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/database'
import CopilotPage from '@/components/copilot/CopilotPage'

export const metadata = {
  title: 'AI Copilot | Chips Copilot',
  description: 'Get AI-powered guidance and document analysis for your CPS/CHIPS case.'
}

export default async function Page() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  // Get user's subscription to check AI limits
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true }
  })

  // Get summary of user's documents for context
  const documentStats = await prisma.vaultFile.aggregate({
    where: { userId, piiRedacted: true }, // Only count processed documents
    _count: true
  })

  // Get recent documents for context selection
  const recentDocs = await prisma.vaultFile.findMany({
    where: { userId, piiRedacted: true },
    select: {
      id: true,
      name: true,
      tags: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  return (
    <CopilotPage 
      subscription={subscription}
      documentCount={documentStats._count}
      recentDocuments={recentDocs}
    />
  )
}