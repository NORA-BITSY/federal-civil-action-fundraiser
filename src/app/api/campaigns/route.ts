import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CampaignStatus, CampaignCategory } from '@prisma/client'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category') as CampaignCategory
    const status = searchParams.get('status') as CampaignStatus
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'newest'
    const featured = searchParams.get('featured') === 'true'
    
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (category) {
      where.category = category
    }
    
    if (status) {
      where.status = status
    } else {
      // Default to active campaigns
      where.status = 'ACTIVE'
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (featured) {
      // Featured campaigns are those with high engagement
      where.AND = [
        { currentAmount: { gt: 1000 } },
      ]
    }

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' }
    
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'mostRaised':
        orderBy = { currentAmount: 'desc' }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    // Execute queries
    const [campaigns, totalCount] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            }
          },
          _count: {
            select: {
              donations: true,
              comments: true,
              updates: true,
            }
          }
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.campaign.count({ where })
    ])

    // Calculate additional fields
    const campaignsWithStats = campaigns.map(campaign => ({
      ...campaign,
      donorCount: campaign._count.donations,
      commentCount: campaign._count.comments,
      updateCount: campaign._count.updates,
      progressPercentage: Math.min((Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100, 100),
    }))

    const totalPages = Math.ceil(totalCount / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      campaigns: campaignsWithStats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext,
        hasPrev,
      }
    })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Chips Copilot: Require parent verification for campaign creation
    if (!(session.user as any).isParentVerified) {
      return NextResponse.json(
        { error: 'Only verified parents can create campaigns' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Extract form fields
    const {
      title,
      shortDescription,
      description,
      goalAmount,
      category,
      caseNumber,
      courtName,
      attorneyName,
      attorneyContact,
      endDate,
      videoUrl,
      images = []
    } = body

    // Validate required fields
    if (!title || !shortDescription || !description || !goalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique slug
    let slug = slugify(title)
    let slugCount = 0
    let finalSlug = slug
    
    while (await prisma.campaign.findUnique({ where: { slug: finalSlug } })) {
      slugCount++
      finalSlug = `${slug}-${slugCount}`
    }

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        title,
        slug: finalSlug,
        description,
        shortDescription,
        goalAmount,
        category: category || 'LEGAL_DEFENSE',
        caseNumber,
        courtName,
        attorneyName,
        attorneyContact,
        endDate: endDate ? new Date(endDate) : null,
        videoUrl,
        images,
        userId: session.user.id,
        status: 'DRAFT', // Start as draft for review
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
      campaign,
      message: 'Campaign created successfully. It will be reviewed before going live.'
    })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}