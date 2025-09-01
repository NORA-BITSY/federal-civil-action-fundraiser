import { Queue, Worker, ConnectionOptions } from 'bullmq'
import IORedis from 'ioredis'

// Redis connection configuration
const redisConfig: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  lazyConnect: true,
}

// Create Redis connection
export const redis = new IORedis(redisConfig)

// Queue names
export const QUEUE_NAMES = {
  VAULT_PROCESSING: 'vault-processing',
  OCR_REDACT: 'ocr-redact'
} as const

// Job types
export interface VaultProcessingJobData {
  fileId: string
  userId: string
  storageKey: string
  fileName: string
  mimeType: string
  sizeBytes: number
}

export interface OCRRedactJobData {
  fileId: string
  userId: string  
  storageKey: string
  fileName: string
  mimeType: string
}

// Queue configuration
const defaultQueueConfig = {
  connection: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 50, // Keep last 50 completed jobs
    removeOnFail: 100,    // Keep last 100 failed jobs
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
}

// Create queues
export const vaultQueue = new Queue<VaultProcessingJobData>(
  QUEUE_NAMES.VAULT_PROCESSING,
  defaultQueueConfig
)

export const ocrQueue = new Queue<OCRRedactJobData>(
  QUEUE_NAMES.OCR_REDACT,
  defaultQueueConfig
)

// Queue health check
export async function checkQueueHealth(): Promise<{
  redis: boolean
  queues: Record<string, boolean>
}> {
  const health = {
    redis: false,
    queues: {} as Record<string, boolean>
  }

  try {
    // Check Redis connection
    await redis.ping()
    health.redis = true
  } catch (error) {
    console.error('Redis health check failed:', error)
  }

  // Check each queue
  for (const [name, queue] of Object.entries({ vaultQueue, ocrQueue })) {
    try {
      await queue.getWaiting()
      health.queues[name] = true
    } catch (error) {
      console.error(`Queue ${name} health check failed:`, error)
      health.queues[name] = false
    }
  }

  return health
}

// Add jobs to queues
export async function addVaultProcessingJob(
  data: VaultProcessingJobData,
  options?: {
    priority?: number
    delay?: number
  }
): Promise<string> {
  const job = await vaultQueue.add(
    'process-vault-file', 
    data,
    {
      priority: options?.priority || 0,
      delay: options?.delay || 0,
      jobId: `vault-${data.fileId}-${Date.now()}`
    }
  )
  
  return job.id!
}

export async function addOCRRedactJob(
  data: OCRRedactJobData,
  options?: {
    priority?: number
    delay?: number
  }
): Promise<string> {
  const job = await ocrQueue.add(
    'ocr-redact-file',
    data,
    {
      priority: options?.priority || 0, 
      delay: options?.delay || 0,
      jobId: `ocr-${data.fileId}-${Date.now()}`
    }
  )
  
  return job.id!
}

// Get job status
export async function getJobStatus(queueName: string, jobId: string) {
  const queue = queueName === QUEUE_NAMES.VAULT_PROCESSING ? vaultQueue : ocrQueue
  
  try {
    const job = await queue.getJob(jobId)
    if (!job) {
      return { status: 'not_found' }
    }

    return {
      status: await job.getState(),
      progress: job.progress,
      returnValue: job.returnvalue,
      failedReason: job.failedReason,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      attemptsMade: job.attemptsMade,
      data: job.data
    }
  } catch (error) {
    console.error(`Failed to get job status for ${jobId}:`, error)
    return { status: 'error', error: error.message }
  }
}

// Get queue stats
export async function getQueueStats() {
  const stats = {}
  
  for (const [name, queue] of Object.entries({
    [QUEUE_NAMES.VAULT_PROCESSING]: vaultQueue,
    [QUEUE_NAMES.OCR_REDACT]: ocrQueue
  })) {
    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaiting(),
        queue.getActive(), 
        queue.getCompleted(),
        queue.getFailed(),
        queue.getDelayed()
      ])

      stats[name] = {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        total: waiting.length + active.length + completed.length + failed.length + delayed.length
      }
    } catch (error) {
      console.error(`Failed to get stats for queue ${name}:`, error)
      stats[name] = { error: error.message }
    }
  }

  return stats
}

// Graceful shutdown
export async function closeQueues(): Promise<void> {
  try {
    await Promise.all([
      vaultQueue.close(),
      ocrQueue.close(),
      redis.quit()
    ])
    console.log('All queues and Redis connections closed')
  } catch (error) {
    console.error('Error closing queues:', error)
  }
}

// Export types
export type { Job } from 'bullmq'