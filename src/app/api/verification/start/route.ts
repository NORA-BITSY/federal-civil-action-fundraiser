import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/policy/guard'
import { prisma } from '@/lib/database'
import { getSignedUploadUrl } from '@/lib/storage'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!auth.ok) {
      return NextResponse.json({ error: auth.msg }, { status: auth.status })
    }

    const userId = auth.userId

    // Create or update verification record
    const verification = await prisma.parentVerification.upsert({
      where: { userId },
      update: { 
        status: 'PENDING',
        updatedAt: new Date()
      },
      create: { 
        userId, 
        status: 'PENDING' 
      }
    })

    // Generate signed upload URLs for ID document and selfie
    const idUpload = await getSignedUploadUrl({ 
      keyPrefix: `verify/${userId}/id`,
      fileName: 'id-document.jpg'
    })
    const selfieUpload = await getSignedUploadUrl({ 
      keyPrefix: `verify/${userId}/selfie`,
      fileName: 'selfie.jpg'
    })

    return NextResponse.json({
      verificationId: verification.id,
      uploads: { 
        idUpload: {
          url: idUpload.url,
          key: idUpload.key
        }, 
        selfieUpload: {
          url: selfieUpload.url,
          key: selfieUpload.key
        }
      }
    })

  } catch (error) {
    console.error('Verification start error:', error)
    return NextResponse.json(
      { error: 'Failed to start verification process' }, 
      { status: 500 }
    )
  }
}