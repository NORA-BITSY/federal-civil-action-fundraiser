import { NextRequest, NextResponse } from 'next/server'
import { requireParent } from '@/lib/policy/guard'
import { prisma } from '@/lib/database'
import { getPlanFeatures, type PlanType } from '@/lib/plans'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireParent()
    if (!auth.ok) {
      return NextResponse.json({ error: auth.msg }, { status: auth.status })
    }

    const userId = auth.userId

    // Get subscription record
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: {
        id: true,
        plan: true,
        status: true,
        currentPeriodEnd: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!subscription) {
      return NextResponse.json({
        subscription: null,
        plan: 'FREE_TRIAL',
        features: getPlanFeatures('FREE_TRIAL'),
        isActive: false
      })
    }

    const planType = subscription.plan.toUpperCase() as PlanType
    const features = getPlanFeatures(planType)
    const isActive = subscription.status === 'ACTIVE'

    // TODO Phase-2: Track AI usage for rate limiting
    const currentUsage = {
      aiQueries: 0, // Would come from usage tracking
      storageUsed: 0, // Would come from vault files
    }

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt
      },
      plan: planType,
      features,
      isActive,
      usage: currentUsage,
      limits: {
        aiQueries: features.ragLimit,
        storageGB: features.vaultStorageGB
      }
    })

  } catch (error) {
    console.error('Subscription status error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription status' }, 
      { status: 500 }
    )
  }
}