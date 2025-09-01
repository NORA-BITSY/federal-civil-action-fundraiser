import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/policy/guard'
import { prisma } from '@/lib/database'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!auth.ok) {
      return NextResponse.json({ error: auth.msg }, { status: auth.status })
    }

    const userId = auth.userId

    // Get verification record
    const verification = await prisma.parentVerification.findUnique({
      where: { userId },
      select: {
        id: true,
        status: true,
        level: true,
        caseNumber: true,
        docketCourt: true,
        matchScore: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!verification) {
      return NextResponse.json({
        verification: null,
        message: 'Verification not started'
      })
    }

    // Get current user verification status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isParentVerified: true }
    })

    return NextResponse.json({
      verification: {
        ...verification,
        // Don't expose sensitive URLs in status response
        idDocUrl: undefined,
        selfieUrl: undefined
      },
      isParentVerified: user?.isParentVerified || false
    })

  } catch (error) {
    console.error('Verification status error:', error)
    return NextResponse.json(
      { error: 'Failed to get verification status' }, 
      { status: 500 }
    )
  }
}