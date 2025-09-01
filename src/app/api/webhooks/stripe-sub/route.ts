import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/database'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' }, 
        { status: 400 }
      )
    }

    let event
    try {
      event = stripe.webhooks.constructEvent(
        body, 
        signature, 
        process.env.STRIPE_SUB_WEBHOOK_SECRET!
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' }, 
        { status: 400 }
      )
    }

    // Handle subscription events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        
        await prisma.subscription.upsert({
          where: { stripeSubId: subscription.id },
          create: {
            userId: subscription.metadata?.userId || '',
            stripeCustomerId: subscription.customer,
            stripeSubId: subscription.id,
            plan: subscription.metadata?.plan || 'CORE',
            status: subscription.status.toUpperCase(),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
          },
          update: {
            status: subscription.status.toUpperCase(),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            plan: subscription.metadata?.plan || 'CORE'
          }
        })

        console.log(`Subscription ${subscription.id} ${event.type}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        
        await prisma.subscription.updateMany({
          where: { stripeSubId: subscription.id },
          data: { 
            status: 'CANCELED',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
          }
        })

        console.log(`Subscription ${subscription.id} canceled`)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        
        if (invoice.subscription) {
          await prisma.subscription.updateMany({
            where: { stripeSubId: invoice.subscription },
            data: { status: 'ACTIVE' }
          })
          
          console.log(`Payment succeeded for subscription ${invoice.subscription}`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        
        if (invoice.subscription) {
          await prisma.subscription.updateMany({
            where: { stripeSubId: invoice.subscription },
            data: { status: 'PAST_DUE' }
          })
          
          console.log(`Payment failed for subscription ${invoice.subscription}`)
        }
        break
      }

      default:
        console.log(`Unhandled subscription event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Subscription webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' }, 
      { status: 500 }
    )
  }
}