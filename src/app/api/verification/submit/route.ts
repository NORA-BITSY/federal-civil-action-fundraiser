import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, sanitizeUserInput } from '@/lib/policy/guard'
import { prisma } from '@/lib/database'
import { runKycCheck } from '@/lib/kyc'
import { matchCaseNumber, validateCaseNumberFormat } from '@/lib/dockets'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!auth.ok) {
      return NextResponse.json({ error: auth.msg }, { status: auth.status })
    }

    const userId = auth.userId
    const body = await req.json()
    const { idDocKey, selfieKey, caseNumber, fullName, docketCourt } = body

    // Validate required fields
    if (!idDocKey || !selfieKey || !caseNumber || !fullName) {
      return NextResponse.json(
        { error: 'Missing required verification information' }, 
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedCaseNumber = sanitizeUserInput(caseNumber)
    const sanitizedFullName = sanitizeUserInput(fullName)
    const sanitizedDocketCourt = docketCourt ? sanitizeUserInput(docketCourt) : undefined

    // Validate case number format
    if (!validateCaseNumberFormat(sanitizedCaseNumber)) {
      return NextResponse.json(
        { error: 'Invalid case number format' }, 
        { status: 400 }
      )
    }

    // Check if verification exists
    const existingVerification = await prisma.parentVerification.findUnique({
      where: { userId }
    })

    if (!existingVerification) {
      return NextResponse.json(
        { error: 'Verification process not started' }, 
        { status: 400 }
      )
    }

    // Run KYC check
    const kycResult = await runKycCheck({
      idDocUrl: idDocKey, // In production, convert storage key to URL
      selfieUrl: selfieKey,
      fullName: sanitizedFullName
    })

    if (!kycResult.ok) {
      await prisma.parentVerification.update({
        where: { userId },
        data: {
          status: 'REJECTED',
          rejectionReason: kycResult.message || 'Identity verification failed',
          matchScore: kycResult.score,
          updatedAt: new Date()
        }
      })

      return NextResponse.json({
        success: false,
        error: kycResult.message || 'Identity verification failed'
      }, { status: 400 })
    }

    // Match case number
    const caseMatch = await matchCaseNumber({
      caseNumber: sanitizedCaseNumber,
      fullName: sanitizedFullName
    })

    // Determine verification level
    const level = caseMatch.match ? 'L2_CASE_MATCHED' : 'L1_SELF_ATTESTED'

    // Update verification record
    const verification = await prisma.parentVerification.update({
      where: { userId },
      data: {
        idDocUrl: idDocKey,
        selfieUrl: selfieKey,
        caseNumber: sanitizedCaseNumber,
        docketCourt: sanitizedDocketCourt,
        matchScore: kycResult.score,
        level: level as any,
        status: 'APPROVED', // Phase-1: Auto-approve if KYC passes
        updatedAt: new Date()
      }
    })

    // Update user verification status
    await prisma.user.update({
      where: { id: userId },
      data: { isParentVerified: true }
    })

    return NextResponse.json({
      success: true,
      verification: {
        id: verification.id,
        status: verification.status,
        level: verification.level,
        matchScore: verification.matchScore
      }
    })

  } catch (error) {
    console.error('Verification submit error:', error)
    return NextResponse.json(
      { error: 'Failed to process verification' }, 
      { status: 500 }
    )
  }
}