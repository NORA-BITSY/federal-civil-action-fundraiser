import { NextRequest, NextResponse } from 'next/server'
import { requireParent } from '@/lib/policy/guard'
import { getQueueStats, checkQueueHealth } from '@/lib/queue'

// Get queue statistics and health status
export async function GET(req: NextRequest) {
  try {
    const auth = await requireParent()
    if (!auth.ok) {
      return NextResponse.json({ error: auth.msg }, { status: auth.status })
    }

    // Only allow admin users to see detailed queue stats
    // For regular users, just return basic health info
    const isAdmin = (auth as any).user?.role === 'ADMIN'

    const [health, stats] = await Promise.all([
      checkQueueHealth(),
      isAdmin ? getQueueStats() : null
    ])

    const response = {
      health,
      timestamp: new Date().toISOString()
    }

    if (isAdmin && stats) {
      (response as any).stats = stats
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Queue stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get queue information' },
      { status: 500 }
    )
  }
}