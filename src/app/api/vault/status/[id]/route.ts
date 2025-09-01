import { NextRequest, NextResponse } from 'next/server'
import { requireParent } from '@/lib/policy/guard'
import { prisma } from '@/lib/database'
import { getJobStatus, getQueueStats } from '@/lib/queue'

// Get processing status for a specific file
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireParent()
    if (!auth.ok) {
      return NextResponse.json({ error: auth.msg }, { status: auth.status })
    }

    const fileId = params.id

    // Get file from database
    const vaultFile = await prisma.vaultFile.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        userId: true,
        name: true,
        status: true,
        processingError: true,
        piiRedacted: true,
        createdAt: true,
        updatedAt: true,
        tags: true,
        ocrText: true,
        redactionMap: true
      }
    })

    if (!vaultFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    if (vaultFile.userId !== auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Return status information
    const response = {
      fileId: vaultFile.id,
      name: vaultFile.name,
      status: vaultFile.status,
      processingError: vaultFile.processingError,
      piiRedacted: vaultFile.piiRedacted,
      tags: vaultFile.tags,
      createdAt: vaultFile.createdAt,
      updatedAt: vaultFile.updatedAt,
      hasOcrText: !!vaultFile.ocrText,
      redactionStats: vaultFile.redactionMap ? {
        redactionCount: (vaultFile.redactionMap as any).redactionCount,
        redactionsByType: (vaultFile.redactionMap as any).redactionsByType
      } : null
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Failed to get file status' },
      { status: 500 }
    )
  }
}

// Re-queue processing for a failed file
export async function POST(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireParent()
    if (!auth.ok) {
      return NextResponse.json({ error: auth.msg }, { status: auth.status })
    }

    const fileId = params.id

    // Get file details
    const vaultFile = await prisma.vaultFile.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        userId: true,
        name: true,
        path: true,
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

    // Only allow reprocessing of failed files
    if (vaultFile.status !== 'FAILED') {
      return NextResponse.json(
        { error: 'File is not in failed status' },
        { status: 400 }
      )
    }

    // Reset status and queue processing
    await prisma.vaultFile.update({
      where: { id: fileId },
      data: {
        status: 'PENDING',
        processingError: null
      }
    })

    // Import here to avoid circular dependency issues
    const { addVaultProcessingJob } = await import('@/lib/queue')
    
    const jobId = await addVaultProcessingJob({
      fileId: vaultFile.id,
      userId: vaultFile.userId,
      storageKey: vaultFile.path,
      fileName: vaultFile.name,
      mimeType: vaultFile.mimeType,
      sizeBytes: vaultFile.sizeBytes
    })

    console.log(`Re-queued processing job ${jobId} for file ${vaultFile.name}`)

    return NextResponse.json({
      success: true,
      jobId,
      status: 'queued'
    })

  } catch (error) {
    console.error('Reprocess error:', error)
    return NextResponse.json(
      { error: 'Failed to reprocess file' },
      { status: 500 }
    )
  }
}