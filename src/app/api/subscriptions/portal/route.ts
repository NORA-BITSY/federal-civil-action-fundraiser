import { NextRequest, NextResponse } from 'next/server'
import { requireParent } from '@/lib/policy/guard'
import { prisma } from '@/lib/database'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireParent()
    if (!auth.ok) {
      return NextResponse.json({ error: auth.msg }, { status: auth.status })
    }

    const userId = auth.userId

    // Get subscription record
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    })

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No subscription found' }, 
        { status: 404 }
      )
    }

    // Create Stripe customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    })

    return NextResponse.json({
      url: portalSession.url
    })

  } catch (error) {
    console.error('Subscription portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' }, 
      { status: 500 }
    )
  }
}