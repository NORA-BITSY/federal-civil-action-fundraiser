import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  metadata: Record<string, string> = {}
) {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  })
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  return await stripe.paymentIntents.retrieve(paymentIntentId)
}

export async function createCustomer(
  email: string,
  name?: string,
  metadata: Record<string, string> = {}
) {
  return await stripe.customers.create({
    email,
    name,
    metadata,
  })
}

export async function retrieveCustomer(customerId: string) {
  return await stripe.customers.retrieve(customerId)
}

export async function createTransfer(
  amount: number,
  destination: string,
  currency: string = 'usd'
) {
  return await stripe.transfers.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    destination,
  })
}

export async function createAccount(
  type: 'express' | 'standard' = 'express',
  country: string = 'US',
  email?: string
) {
  return await stripe.accounts.create({
    type,
    country,
    email,
  })
}

export async function createAccountLink(
  account: string,
  refreshUrl: string,
  returnUrl: string
) {
  return await stripe.accountLinks.create({
    account,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  })
}

export async function retrieveBalance() {
  return await stripe.balance.retrieve()
}

export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
) {
  const refundData: any = {
    payment_intent: paymentIntentId,
  }

  if (amount) {
    refundData.amount = Math.round(amount * 100) // Convert to cents
  }

  if (reason) {
    refundData.reason = reason
  }

  return await stripe.refunds.create(refundData)
}

export function constructWebhookEvent(body: string | Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set')
  }

  return stripe.webhooks.constructEvent(body, signature, webhookSecret)
}

export function formatAmountFromStripe(amount: number): number {
  return amount / 100 // Convert from cents to dollars
}

export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100) // Convert to cents
}