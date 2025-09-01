import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'crypto'

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.STORAGE_REGION!,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
  },
  endpoint: process.env.STORAGE_ENDPOINT, // For R2 compatibility
})

const BUCKET = process.env.STORAGE_BUCKET!

type UploadArgs = { keyPrefix: string; fileName?: string; contentType?: string }

export async function getSignedUploadUrl({ keyPrefix, fileName, contentType }: UploadArgs) {
  // Create clean storage key
  const timestamp = Date.now()
  const randomSuffix = crypto.randomBytes(6).toString('hex')
  const cleanFileName = fileName?.replace(/[^a-zA-Z0-9.-]/g, '_') || `file-${randomSuffix}`
  const key = `${keyPrefix}/${timestamp}-${cleanFileName}`

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType || 'application/octet-stream',
  })

  const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }) // 5 minutes
  return { key, url }
}

export async function getSignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })

  return await getSignedUrl(s3, command, { expiresIn: 60 * 10 }) // 10 minutes
}

export async function getObjectBuffer(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })

  const response = await s3.send(command)
  if (!response.Body) {
    throw new Error('Empty response body')
  }

  // Convert stream to buffer
  const chunks: Buffer[] = []
  // @ts-ignore - AWS SDK types are complex for streams
  for await (const chunk of response.Body) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  
  return Buffer.concat(chunks)
}

export async function runAntivirusScan(_key: string) {
  // TODO Phase-2: Integrate with ClamAV or cloud AV service
  return { clean: true }
}

export function generateSecureHash(data: Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

export function isValidFileType(mimeType: string): boolean {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ]
  return allowedTypes.includes(mimeType)
}

export function getMaxFileSize(): number {
  // 50MB limit for vault files
  return 50 * 1024 * 1024
}