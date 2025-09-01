import { NextRequest, NextResponse } from 'next/server'
import { requireParent } from '@/lib/policy/guard'
import { prisma } from '@/lib/database'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireParent()
    if (!auth.ok) {
      return NextResponse.json({ error: auth.msg }, { status: auth.status })
    }

    const userId = auth.userId
    const url = new URL(req.url)
    const tag = url.searchParams.get('tag')
    const search = url.searchParams.get('search')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // Build where clause
    const where: any = { userId }
    
    if (tag) {
      where.tags = { has: tag }
    }
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    // Get files with pagination
    const [files, total] = await Promise.all([
      prisma.vaultFile.findMany({
        where,
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
        take: limit,
        skip: offset
      }),
      prisma.vaultFile.count({ where })
    ])

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

    return NextResponse.json({
      files,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      tags: Object.entries(tagCounts).map(([tag, count]) => ({ tag, count }))
    })

  } catch (error) {
    console.error('Vault files error:', error)
    return NextResponse.json(
      { error: 'Failed to get vault files' }, 
      { status: 500 }
    )
  }
}