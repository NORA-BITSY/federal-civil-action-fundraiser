import { NextRequest, NextResponse } from 'next/server'
import { requireParent } from '@/lib/policy/guard'
import { prisma } from '@/lib/database'
import { STRIPE_PRICE_IDS } from '@/lib/plans'

// Note: This uses your existing Stripe setup from lib/stripe.ts
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireParent()
    if (!auth.ok) {
      return NextResponse.json({ error: auth.msg }, { status: auth.status })
    }

    const userId = auth.userId
    const body = await req.json()
    const { plan } = body

    // Validate plan
    if (!plan || !['CORE', 'PRO'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid subscription plan' }, 
        { status: 400 }
      )
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      )
    }

    // Get or create Stripe customer
    let subscription = await prisma.subscription.findUnique({
      where: { userId }
    })

    let customerId = subscription?.stripeCustomerId

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email!,
        name: user.name || undefined,
        metadata: {
          userId,
          plan
        }
      })

      customerId = customer.id

      // Create or update subscription record
      subscription = await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeCustomerId: customer.id,
          plan,
          status: 'INACTIVE'
        },
        update: {
          stripeCustomerId: customer.id,
          plan
        }
      })
    }

    // Get price ID for the plan
    const priceId = STRIPE_PRICE_IDS[plan as keyof typeof STRIPE_PRICE_IDS]
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price configuration not found' }, 
        { status: 500 }
      )
    }

    // Create Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success&plan=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=cancelled`,
      metadata: {
        userId,
        plan
      },
      subscription_data: {
        metadata: {
          userId,
          plan
        }
      }
    })

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id
    })

  } catch (error) {
    console.error('Subscription checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' }, 
      { status: 500 }
    )
  }
}