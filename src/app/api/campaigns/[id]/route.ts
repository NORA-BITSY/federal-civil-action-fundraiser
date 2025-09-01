import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await prisma.campaign.findFirst({
      where: { 
        OR: [
          { id: params.id },
          { slug: params.id }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        donations: {
          where: { isAnonymous: false },
          select: {
            id: true,
            amount: true,
            donorName: true,
            message: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                image: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        comments: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                name: true,
                image: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        updates: {
          where: { isPublic: true },
          include: {
            user: {
              select: {
                name: true,
                image: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            donations: true,
            comments: true,
            updates: true,
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

    // Calculate additional stats
    const totalDonors = campaign._count.donations
    const progressPercentage = Math.min((Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100, 100)
    const daysLeft = campaign.endDate 
      ? Math.max(0, Math.ceil((campaign.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      : null

    // Increment view count
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { 
        viewCount: { 
          increment: 1 
        } 
      }
    })

    const campaignWithStats = {
      ...campaign,
      donorCount: totalDonors,
      progressPercentage,
      daysLeft,
    }

    return NextResponse.json({ campaign: campaignWithStats })
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user owns the campaign
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      select: { userId: true }
    })

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (existingCampaign.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    const updatedCampaign = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
      message: 'Campaign updated successfully'
    })
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user owns the campaign
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      select: { userId: true, status: true }
    })

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (existingCampaign.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Don't allow deletion of campaigns with donations
    const donationCount = await prisma.donation.count({
      where: { campaignId: params.id }
    })

    if (donationCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete campaign with existing donations. You can cancel it instead.' },
        { status: 400 }
      )
    }

    await prisma.campaign.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}