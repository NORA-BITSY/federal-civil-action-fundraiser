import { NextRequest, NextResponse } from 'next/server'
import { requireParent, validateFileUpload } from '@/lib/policy/guard'
import { prisma } from '@/lib/database'
import { getSignedUploadUrl, isValidFileType, getMaxFileSize } from '@/lib/storage'
import { addVaultProcessingJob } from '@/lib/queue'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireParent()
    if (!auth.ok) {
      return NextResponse.json({ error: auth.msg }, { status: auth.status })
    }

    const userId = auth.userId
    const body = await req.json()
    const { fileName, sizeBytes, mimeType, tags = [] } = body

    // Validate file type and size
    if (!isValidFileType(mimeType)) {
      return NextResponse.json(
        { error: 'File type not allowed. Supported types: PDF, images, Word documents, plain text.' },
        { status: 400 }
      )
    }

    if (sizeBytes > getMaxFileSize()) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit.' },
        { status: 400 }
      )
    }

    // Generate signed upload URL
    const { key, url } = await getSignedUploadUrl({ 
      keyPrefix: `vault/${userId}`, 
      fileName,
      contentType: mimeType
    })

    // Create vault file record (status: PENDING)
    const vaultFile = await prisma.vaultFile.create({
      data: {
        userId,
        name: fileName,
        path: key,
        sizeBytes,
        mimeType,
        sha256: 'pending', // Will be updated by worker
        tags: Array.isArray(tags) ? tags : [],
        status: 'PENDING', // Will be processed by queue
        piiRedacted: false
      }
    })
    
    return NextResponse.json({
      uploadUrl: url,
      fileId: vaultFile.id,
      uploadKey: key
    })

  } catch (error) {
    console.error('Vault upload error:', error)
    return NextResponse.json(
      { error: 'Failed to prepare file upload' }, 
      { status: 500 }
    )
  }
}

// Handle upload completion - queue processing job
export async function PUT(req: NextRequest) {
  try {
    const auth = await requireParent()
    if (!auth.ok) {
      return NextResponse.json({ error: auth.msg }, { status: auth.status })
    }

    const body = await req.json()
    const { fileId } = body

    // Get file details
    const vaultFile = await prisma.vaultFile.findUnique({
      where: { id: fileId },
      select: { 
        id: true,
        userId: true, 
        path: true, 
        name: true,
        mimeType: true,
        sizeBytes: true,
        status: true
      }
    })

    if (!vaultFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    if (vaultFile.userId !== auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Only queue if file is still pending
    if (vaultFile.status === 'PENDING') {
      // Queue processing job
      const jobId = await addVaultProcessingJob({
        fileId: vaultFile.id,
        userId: vaultFile.userId,
        storageKey: vaultFile.path,
        fileName: vaultFile.name,
        mimeType: vaultFile.mimeType,
        sizeBytes: vaultFile.sizeBytes
      })

      console.log(`Queued processing job ${jobId} for file ${vaultFile.name}`)
      
      return NextResponse.json({ 
        success: true, 
        jobId,
        status: 'queued'
      })
    }

    return NextResponse.json({ 
      success: true, 
      status: vaultFile.status 
    })

  } catch (error) {
    console.error('Upload completion error:', error)
    return NextResponse.json(
      { error: 'Failed to queue processing' }, 
      { status: 500 }
    )
  }
}