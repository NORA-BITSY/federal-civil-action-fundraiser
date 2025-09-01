import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  const body = await request.text()
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
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler error' },
      { status: 500 }
    )
  }
}

async function handlePaymentSucceeded(paymentIntent: any) {
  const donation = await prisma.donation.findFirst({
    where: { stripePaymentId: paymentIntent.id },
    include: { campaign: true }
  })

  if (!donation) {
    console.error('Donation not found for payment intent:', paymentIntent.id)
    return
  }

  if (donation.paymentStatus === 'SUCCEEDED') {
    console.log('Donation already processed:', donation.id)
    return
  }

  // Update donation status
  await prisma.donation.update({
    where: { id: donation.id },
    data: { paymentStatus: 'SUCCEEDED' }
  })

  // Update campaign total
  await prisma.campaign.update({
    where: { id: donation.campaignId },
    data: {
      currentAmount: { increment: donation.amount }
    }
  })

  console.log(`Payment succeeded for donation ${donation.id}`)

  // TODO: Send confirmation emails, notifications, etc.
}

async function handlePaymentFailed(paymentIntent: any) {
  const donation = await prisma.donation.findFirst({
    where: { stripePaymentId: paymentIntent.id }
  })

  if (!donation) {
    console.error('Donation not found for payment intent:', paymentIntent.id)
    return
  }

  // Update donation status
  await prisma.donation.update({
    where: { id: donation.id },
    data: { paymentStatus: 'FAILED' }
  })

  console.log(`Payment failed for donation ${donation.id}`)

  // TODO: Send failure notification emails
}