import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/database'
import VaultPage from '@/components/vault/VaultPage'

export const metadata = {
  title: 'Case Vault | Chips Copilot',
  description: 'Secure document storage and organization for your CPS/CHIPS case.'
}

export default async function Page() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  // Get vault files with pagination
  const files = await prisma.vaultFile.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      sizeBytes: true,
      mimeType: true,
      tags: true,
      piiRedacted: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 20 // Initial load
  })

  // Get tag statistics
  const tagStats = await prisma.vaultFile.groupBy({
    by: ['tags'],
    where: { userId },
    _count: { tags: true }
  })

  const allTags = tagStats.flatMap(stat => stat.tags)
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const tags = Object.entries(tagCounts).map(([tag, count]) => ({ tag, count }))

  return (
    <VaultPage 
      files={files} 
      tags={tags}
      totalFiles={files.length}
    />
  )
}