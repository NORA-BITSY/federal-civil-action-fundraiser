import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export async function connectDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Connected to database')
  } catch (error) {
    console.error('❌ Failed to connect to database:', error)
    throw error
  }
}

export async function disconnectDatabase() {
  try {
    await prisma.$disconnect()
    console.log('✅ Disconnected from database')
  } catch (error) {
    console.error('❌ Failed to disconnect from database:', error)
  }
}

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

export async function getCampaignBySlug(slug: string, includePrivate = false) {
  const where: any = { slug }
  
  if (!includePrivate) {
    where.isPublic = true
    where.status = 'ACTIVE'
  }

  return await prisma.campaign.findUnique({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isVerified: true,
        }
      },
      donations: {
        where: { paymentStatus: 'SUCCEEDED' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      comments: {
        where: { isApproved: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      updates: {
        where: { isPublic: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          donations: {
            where: { paymentStatus: 'SUCCEEDED' }
          },
          comments: {
            where: { isApproved: true }
          },
          updates: true,
        }
      }
    }
  })
}

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      isVerified: true,
      createdAt: true,
      _count: {
        select: {
          campaigns: true,
          donations: true,
        }
      }
    }
  })
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      isVerified: true,
    }
  })
}

export async function createDonation(data: {
  amount: number
  currency: string
  platformFee: number
  stripeFee: number
  netAmount: number
  donorName?: string
  donorEmail?: string
  isAnonymous: boolean
  message?: string
  stripePaymentId: string
  paymentStatus: string
  campaignId: string
  userId?: string
}) {
  return await prisma.donation.create({
    data,
    include: {
      campaign: {
        select: {
          id: true,
          title: true,
          slug: true,
          currentAmount: true,
          goalAmount: true,
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      }
    }
  })
}