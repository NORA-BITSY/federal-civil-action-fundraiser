import { Worker, Job } from 'bullmq'
import { PrismaClient } from '@prisma/client'
import { redis, QUEUE_NAMES, type VaultProcessingJobData } from '../lib/queue'
import { getObjectBuffer, runAntivirusScan, generateSecureHash } from '../lib/storage'
import { performOCR, generateTagHints } from '../lib/ocr'
import { redactPII, validateRedactionSafety, createRedactionSummary } from '../lib/redact'

const prisma = new PrismaClient()

// Worker configuration
const workerConfig = {
  connection: redis,
  concurrency: parseInt(process.env.VAULT_WORKER_CONCURRENCY || '2'),
  removeOnComplete: 50,
  removeOnFail: 100,
}

export const vaultWorker = new Worker<VaultProcessingJobData>(
  QUEUE_NAMES.VAULT_PROCESSING,
  async (job: Job<VaultProcessingJobData>) => {
    const { fileId, userId, storageKey, fileName, mimeType, sizeBytes } = job.data
    
    console.log(`Processing vault file: ${fileName} (${fileId})`)
    await job.updateProgress(10)

    try {
      // Step 1: Update status to PROCESSING
      await prisma.vaultFile.update({
        where: { id: fileId },
        data: {
          status: 'PROCESSING',
          processingError: null
        }
      })
      await job.updateProgress(15)

      // Step 2: Download file from storage
      console.log(`Downloading file from storage: ${storageKey}`)
      const fileBuffer = await getObjectBuffer(storageKey)
      await job.updateProgress(25)

      // Step 3: Run antivirus scan
      console.log('Running antivirus scan...')
      const scanResult = await runAntivirusScan(storageKey)
      if (!scanResult.clean) {
        throw new Error(`File failed antivirus scan: ${scanResult.threat || 'Unknown threat'}`)
      }
      await job.updateProgress(35)

      // Step 4: Generate secure hash for deduplication
      const sha256 = generateSecureHash(fileBuffer)
      await job.updateProgress(40)

      // Step 5: Perform OCR
      console.log(`Performing OCR on ${fileName}...`)
      const ocrResult = await performOCR(fileBuffer, mimeType)
      await job.updateProgress(60)

      // Step 6: Redact PII
      console.log('Redacting sensitive information...')
      const redactionResult = redactPII(ocrResult.text)
      
      // Validate redaction safety
      const safetyCheck = validateRedactionSafety(redactionResult.redactedText)
      if (!safetyCheck.isSafe) {
        console.warn('Redaction safety concerns:', safetyCheck.riskyContent)
        // Log concerns but don't fail the job - let user review
      }
      await job.updateProgress(80)

      // Step 7: Generate document tags
      const tagHints = generateTagHints(ocrResult.text)
      await job.updateProgress(85)

      // Step 8: Update database with results
      console.log('Saving processing results...')
      await prisma.vaultFile.update({
        where: { id: fileId },
        data: {
          status: 'READY',
          sha256,
          piiRedacted: redactionResult.redactionMap.redactionCount > 0,
          ocrText: {
            text: redactionResult.redactedText,
            pages: ocrResult.pages?.map(page => ({
              ...page,
              text: redactPII(page.text).redactedText
            })),
            metadata: ocrResult.metadata
          },
          redactionMap: redactionResult.redactionMap,
          tags: {
            set: [...new Set([...tagHints])] // Remove duplicates
          },
          processingError: null
        }
      })
      await job.updateProgress(100)

      const summary = createRedactionSummary(redactionResult.redactionMap)
      console.log(`✅ Successfully processed ${fileName}: ${summary}`)

      return {
        success: true,
        fileId,
        fileName,
        ocrTextLength: redactionResult.redactedText.length,
        redactionCount: redactionResult.redactionMap.redactionCount,
        tagHints,
        summary,
        safetyCheck: {
          isSafe: safetyCheck.isSafe,
          concerns: safetyCheck.riskyContent.length
        }
      }

    } catch (error) {
      console.error(`❌ Failed to process vault file ${fileName}:`, error)

      // Update database with error
      await prisma.vaultFile.update({
        where: { id: fileId },
        data: {
          status: 'FAILED',
          processingError: error.message || 'Unknown processing error'
        }
      })

      throw error // Re-throw to mark job as failed
    }
  },
  workerConfig
)

// Worker event handlers
vaultWorker.on('ready', () => {
  console.log('📄 Vault worker is ready and waiting for jobs')
})

vaultWorker.on('error', (err) => {
  console.error('❌ Vault worker error:', err)
})

vaultWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message)
})

vaultWorker.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed successfully:`, result.summary)
})

vaultWorker.on('stalled', (jobId) => {
  console.warn(`⚠️  Job ${jobId} stalled`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received. Shutting down vault worker gracefully...')
  await vaultWorker.close()
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received. Shutting down vault worker gracefully...')
  await vaultWorker.close()
  await prisma.$disconnect()
  process.exit(0)
})

// Handle uncaught exceptions
process.on('uncaughtException', async (err) => {
  console.error('💥 Uncaught Exception:', err)
  await vaultWorker.close()
  await prisma.$disconnect()
  process.exit(1)
})

process.on('unhandledRejection', async (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason)
  await vaultWorker.close()
  await prisma.$disconnect()
  process.exit(1)
})

export default vaultWorker