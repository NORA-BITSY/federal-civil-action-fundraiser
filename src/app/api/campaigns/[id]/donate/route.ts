import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { amount, donorName, donorEmail, message, isAnonymous = false } = body

    // Validate required fields
    if (!amount || amount < 5) {
      return NextResponse.json(
        { error: 'Minimum donation amount is $5' },
        { status: 400 }
      )
    }

    // Get campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        status: true,
        goalAmount: true,
        currentAmount: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Campaign is not accepting donations' },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    // Calculate fees (3% platform fee + stripe fees)
    const platformFeeRate = 0.03
    const stripeFeeFixed = 0.30
    const stripeFeeRate = 0.029

    const platformFee = Math.round(amount * platformFeeRate * 100) / 100
    const stripeFee = Math.round((amount * stripeFeeRate + stripeFeeFixed) * 100) / 100
    const netAmount = amount - platformFee - stripeFee

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        donorName: donorName || 'Anonymous',
        donorEmail: donorEmail || '',
      },
      description: `Donation to: ${campaign.title}`,
    })

    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        amount,
        currency: 'USD',
        platformFee,
        stripeFee,
        netAmount,
        donorName: isAnonymous ? null : donorName,
        donorEmail: isAnonymous ? null : donorEmail,
        message,
        isAnonymous,
        paymentStatus: 'PENDING',
        stripePaymentId: paymentIntent.id,
        userId,
        campaignId: campaign.id,
      }
    })

    return NextResponse.json({
      success: true,
      donation,
      clientSecret: paymentIntent.client_secret,
      message: 'Donation created successfully'
    })
  } catch (error) {
    console.error('Error creating donation:', error)
    return NextResponse.json(
      { error: 'Failed to create donation' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [donations, totalCount] = await Promise.all([
      prisma.donation.findMany({
        where: {
          campaignId: params.id,
          paymentStatus: 'SUCCEEDED',
        },
        select: {
          id: true,
          amount: true,
          donorName: true,
          message: true,
          isAnonymous: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              image: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.donation.count({
        where: {
          campaignId: params.id,
          paymentStatus: 'SUCCEEDED',
        }
      })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      donations,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }
    })
  } catch (error) {
    console.error('Error fetching donations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    )
  }
}