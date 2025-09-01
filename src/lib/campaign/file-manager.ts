import * as fs from 'fs/promises'
import * as path from 'path'
import { Campaign, CampaignDocument, CampaignImage, CampaignVideo } from '@/types/campaign'

export interface FileUploadResult {
  success: boolean
  url: string
  fileName: string
  fileSize: number
  fileType: string
  error?: string
}

export interface FileValidationOptions {
  maxSize: number // in bytes
  allowedTypes: string[]
  maxFiles?: number
}

export class CampaignFileManager {
  private basePath: string
  private baseUrl: string

  constructor(basePath: string = '/uploads/campaigns', baseUrl: string = '/api/uploads/campaigns') {
    this.basePath = basePath
    this.baseUrl = baseUrl
  }

  // File validation configurations
  private static readonly FILE_VALIDATIONS = {
    images: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      maxFiles: 20
    },
    videos: {
      maxSize: 100 * 1024 * 1024, // 100MB
      allowedTypes: ['video/mp4', 'video/webm', 'video/mov'],
      maxFiles: 5
    },
    documents: {
      maxSize: 25 * 1024 * 1024, // 25MB
      allowedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png'
      ],
      maxFiles: 50
    }
  }

  /**
   * Upload and store a file for a campaign
   */
  async uploadFile(
    campaignId: string,
    file: File,
    type: 'images' | 'videos' | 'documents',
    metadata: { title?: string; caption?: string; description?: string } = {}
  ): Promise<FileUploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file, type)
      if (!validation.isValid) {
        return {
          success: false,
          url: '',
          fileName: '',
          fileSize: 0,
          fileType: '',
          error: validation.error
        }
      }

      // Create campaign directory structure if it doesn't exist
      const campaignDir = path.join(this.basePath, campaignId)
      const typeDir = path.join(campaignDir, type)
      
      await this.ensureDirectoryExists(typeDir)

      // Generate unique filename
      const fileName = this.generateUniqueFileName(file.name)
      const filePath = path.join(typeDir, fileName)

      // Convert File to Buffer and write to disk
      const buffer = Buffer.from(await file.arrayBuffer())
      await fs.writeFile(filePath, buffer)

      const fileUrl = `${this.baseUrl}/${campaignId}/${type}/${fileName}`

      return {
        success: true,
        url: fileUrl,
        fileName: fileName,
        fileSize: file.size,
        fileType: file.type
      }
    } catch (error) {
      console.error('File upload error:', error)
      return {
        success: false,
        url: '',
        fileName: '',
        fileSize: 0,
        fileType: '',
        error: error instanceof Error ? error.message : 'Unknown upload error'
      }
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    campaignId: string,
    files: File[],
    type: 'images' | 'videos' | 'documents',
    metadata: Array<{ title?: string; caption?: string; description?: string }> = []
  ): Promise<FileUploadResult[]> {
    const results: FileUploadResult[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const meta = metadata[i] || {}
      const result = await this.uploadFile(campaignId, file, type, meta)
      results.push(result)
    }

    return results
  }

  /**
   * Delete a file from the campaign directory
   */
  async deleteFile(
    campaignId: string,
    fileName: string,
    type: 'images' | 'videos' | 'documents'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const filePath = path.join(this.basePath, campaignId, type, fileName)
      
      // Check if file exists
      try {
        await fs.access(filePath)
      } catch {
        return {
          success: false,
          error: 'File not found'
        }
      }

      await fs.unlink(filePath)
      return { success: true }
    } catch (error) {
      console.error('File deletion error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown deletion error'
      }
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(
    campaignId: string,
    fileName: string,
    type: 'images' | 'videos' | 'documents'
  ): Promise<{
    exists: boolean
    size?: number
    created?: Date
    modified?: Date
  }> {
    try {
      const filePath = path.join(this.basePath, campaignId, type, fileName)
      const stats = await fs.stat(filePath)
      
      return {
        exists: true,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      }
    } catch {
      return { exists: false }
    }
  }

  /**
   * List all files in a campaign directory
   */
  async listFiles(
    campaignId: string,
    type?: 'images' | 'videos' | 'documents'
  ): Promise<{
    [key: string]: Array<{
      name: string
      size: number
      created: Date
      modified: Date
      url: string
    }>
  }> {
    const result: { [key: string]: any[] } = {}
    const types = type ? [type] : ['images', 'videos', 'documents']

    for (const fileType of types) {
      result[fileType] = []
      
      try {
        const typeDir = path.join(this.basePath, campaignId, fileType)
        const files = await fs.readdir(typeDir)
        
        for (const fileName of files) {
          const filePath = path.join(typeDir, fileName)
          const stats = await fs.stat(filePath)
          const fileUrl = `${this.baseUrl}/${campaignId}/${fileType}/${fileName}`
          
          result[fileType].push({
            name: fileName,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            url: fileUrl
          })
        }
      } catch (error) {
        // Directory might not exist yet
        console.warn(`Directory not found: ${campaignId}/${fileType}`)
      }
    }

    return result
  }

  /**
   * Get total storage usage for a campaign
   */
  async getCampaignStorageUsage(campaignId: string): Promise<{
    totalSize: number
    fileCount: number
    breakdown: {
      images: { size: number; count: number }
      videos: { size: number; count: number }
      documents: { size: number; count: number }
    }
  }> {
    const breakdown = {
      images: { size: 0, count: 0 },
      videos: { size: 0, count: 0 },
      documents: { size: 0, count: 0 }
    }

    let totalSize = 0
    let totalCount = 0

    const types: Array<'images' | 'videos' | 'documents'> = ['images', 'videos', 'documents']
    
    for (const type of types) {
      try {
        const typeDir = path.join(this.basePath, campaignId, type)
        const files = await fs.readdir(typeDir)
        
        for (const fileName of files) {
          const filePath = path.join(typeDir, fileName)
          const stats = await fs.stat(filePath)
          
          breakdown[type].size += stats.size
          breakdown[type].count += 1
          totalSize += stats.size
          totalCount += 1
        }
      } catch {
        // Directory might not exist
      }
    }

    return {
      totalSize,
      fileCount: totalCount,
      breakdown
    }
  }

  /**
   * Archive campaign files
   */
  async archiveCampaignFiles(campaignId: string): Promise<{ success: boolean; archivePath?: string; error?: string }> {
    try {
      const campaignDir = path.join(this.basePath, campaignId)
      const archiveDir = path.join(this.basePath, 'archives')
      const archivePath = path.join(archiveDir, `${campaignId}-${Date.now()}.tar.gz`)

      // Ensure archive directory exists
      await this.ensureDirectoryExists(archiveDir)

      // Note: In a real implementation, you would use a library like 'tar' or 'archiver'
      // to create the archive. For now, we'll just move the directory.
      const archivedPath = path.join(archiveDir, campaignId)
      await fs.rename(campaignDir, archivedPath)

      return {
        success: true,
        archivePath: archivedPath
      }
    } catch (error) {
      console.error('Archive error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown archive error'
      }
    }
  }

  // Private helper methods

  private validateFile(file: File, type: 'images' | 'videos' | 'documents'): {
    isValid: boolean
    error?: string
  } {
    const validation = CampaignFileManager.FILE_VALIDATIONS[type]

    if (file.size > validation.maxSize) {
      return {
        isValid: false,
        error: `File size exceeds maximum allowed size of ${this.formatFileSize(validation.maxSize)}`
      }
    }

    if (!validation.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed for ${type}`
      }
    }

    return { isValid: true }
  }

  private generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = path.extname(originalName)
    const baseName = path.basename(originalName, extension)
    
    return `${baseName}-${timestamp}-${randomString}${extension}`
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath)
    } catch {
      await fs.mkdir(dirPath, { recursive: true })
    }
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }
}

// Export singleton instance
export const campaignFileManager = new CampaignFileManager()

// Helper functions for campaign file operations
export const campaignFileHelpers = {
  /**
   * Convert file upload results to campaign image objects
   */
  uploadResultsToImages(results: FileUploadResult[], captions: string[] = []): CampaignImage[] {
    return results
      .filter(result => result.success)
      .map((result, index) => ({
        id: `img_${Date.now()}_${index}`,
        url: result.url,
        caption: captions[index] || '',
        alt: result.fileName,
        order: index
      }))
  },

  /**
   * Convert file upload results to campaign video objects
   */
  uploadResultsToVideos(results: FileUploadResult[], titles: string[] = []): CampaignVideo[] {
    return results
      .filter(result => result.success)
      .map((result, index) => ({
        id: `vid_${Date.now()}_${index}`,
        url: result.url,
        title: titles[index] || result.fileName,
        thumbnail: '', // Would be generated separately
        duration: 0, // Would be extracted from video metadata
        order: index
      }))
  },

  /**
   * Convert file upload results to campaign document objects
   */
  uploadResultsToDocuments(
    results: FileUploadResult[], 
    titles: string[] = [], 
    types: string[] = []
  ): CampaignDocument[] {
    return results
      .filter(result => result.success)
      .map((result, index) => ({
        id: `doc_${Date.now()}_${index}`,
        title: titles[index] || result.fileName,
        type: types[index] || this.getDocumentType(result.fileType),
        url: result.url,
        size: result.fileSize,
        uploadedAt: new Date()
      }))
  },

  getDocumentType(mimeType: string): string {
    const typeMap: { [key: string]: string } = {
      'application/pdf': 'Legal Document',
      'application/msword': 'Word Document',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
      'text/plain': 'Text Document',
      'image/jpeg': 'Image',
      'image/png': 'Image'
    }
    
    return typeMap[mimeType] || 'Document'
  }
}