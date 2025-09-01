import { NextRequest, NextResponse } from 'next/server'
import { requireParent } from '@/lib/policy/guard'
import { prisma } from '@/lib/database'
import { getSignedDownloadUrl } from '@/lib/storage'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireParent()
    if (!auth.ok) {
      return NextResponse.json({ error: auth.msg }, { status: auth.status })
    }

    const userId = auth.userId
    const fileId = params.id

    // Get file details
    const vaultFile = await prisma.vaultFile.findFirst({
      where: { 
        id: fileId, 
        userId // Ensure user owns this file
      },
      select: {
        id: true,
        name: true,
        path: true,
        sizeBytes: true,
        mimeType: true,
        tags: true,
        piiRedacted: true,
        redactionMap: true,
        ocrText: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!vaultFile) {
      return NextResponse.json(
        { error: 'File not found' }, 
        { status: 404 }
      )
    }

    // Generate signed download URL
    const downloadUrl = await getSignedDownloadUrl(vaultFile.path)

    return NextResponse.json({
      file: {
        ...vaultFile,
        downloadUrl
      }
    })

  } catch (error) {
    console.error('Vault file get error:', error)
    return NextResponse.json(
      { error: 'Failed to get file details' }, 
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireParent()
    if (!auth.ok) {
      return NextResponse.json({ error: auth.msg }, { status: auth.status })
    }

    const userId = auth.userId
    const fileId = params.id
    const body = await req.json()
    const { tags, name } = body

    // Validate input
    if (tags && !Array.isArray(tags)) {
      return NextResponse.json(
        { error: 'Tags must be an array' }, 
        { status: 400 }
      )
    }

    if (name && (typeof name !== 'string' || name.length > 255)) {
      return NextResponse.json(
        { error: 'Invalid file name' }, 
        { status: 400 }
      )
    }

    // Update file
    const updateData: any = {}
    if (tags !== undefined) updateData.tags = tags
    if (name !== undefined) updateData.name = name

    const updatedFile = await prisma.vaultFile.updateMany({
      where: { 
        id: fileId, 
        userId // Ensure user owns this file
      },
      data: updateData
    })

    if (updatedFile.count === 0) {
      return NextResponse.json(
        { error: 'File not found' }, 
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Vault file update error:', error)
    return NextResponse.json(
      { error: 'Failed to update file' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireParent()
    if (!auth.ok) {
      return NextResponse.json({ error: auth.msg }, { status: auth.status })
    }

    const userId = auth.userId
    const fileId = params.id

    // Delete file record (in Phase-2, would also delete from storage)
    const deletedFile = await prisma.vaultFile.deleteMany({
      where: { 
        id: fileId, 
        userId // Ensure user owns this file
      }
    })

    if (deletedFile.count === 0) {
      return NextResponse.json(
        { error: 'File not found' }, 
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Vault file delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' }, 
      { status: 500 }
    )
  }
}