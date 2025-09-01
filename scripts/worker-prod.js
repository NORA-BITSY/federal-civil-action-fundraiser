#!/usr/bin/env node

/**
 * Production Vault Worker
 * 
 * Optimized for production deployment with:
 * - Health checks
 * - Metrics collection
 * - Auto-restart on failure
 * - Memory monitoring
 */

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

// Configuration
const WORKER_SCRIPT = path.join(__dirname, '../src/workers/vault.worker.ts')
const MAX_RESTARTS = 5
const RESTART_DELAY = 5000
const MEMORY_THRESHOLD = 512 * 1024 * 1024 // 512MB
const HEALTH_CHECK_INTERVAL = 30000 // 30 seconds

let restartCount = 0
let workerProcess = null
let healthCheckInterval = null

// Logging utility
const log = (level, message) => {
  const timestamp = new Date().toISOString()
  const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}`
  console.log(logLine)
  
  // In production, you might want to log to file or monitoring system
  if (process.env.WORKER_LOG_FILE) {
    fs.appendFileSync(process.env.WORKER_LOG_FILE, logLine + '\n')
  }
}

// Start worker process
const startWorker = () => {
  log('info', `Starting vault worker (attempt ${restartCount + 1}/${MAX_RESTARTS})`)
  
  workerProcess = spawn('npx', ['tsx', WORKER_SCRIPT], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      WORKER_ID: `vault-worker-${Date.now()}`,
      WORKER_RESTART_COUNT: restartCount.toString()
    }
  })

  workerProcess.on('error', (error) => {
    log('error', `Worker process error: ${error.message}`)
    handleWorkerExit(1)
  })

  workerProcess.on('close', (code, signal) => {
    if (signal) {
      log('info', `Worker process killed with signal: ${signal}`)
    } else {
      log('info', `Worker process exited with code: ${code}`)
    }
    handleWorkerExit(code)
  })

  // Start health monitoring
  startHealthMonitoring()
}

// Handle worker exit and restart logic
const handleWorkerExit = (code) => {
  clearInterval(healthCheckInterval)
  
  if (code === 0) {
    log('info', 'Worker exited successfully')
    process.exit(0)
    return
  }

  restartCount++
  
  if (restartCount >= MAX_RESTARTS) {
    log('error', `Worker failed ${MAX_RESTARTS} times, giving up`)
    process.exit(1)
    return
  }

  log('warn', `Worker failed, restarting in ${RESTART_DELAY}ms...`)
  setTimeout(startWorker, RESTART_DELAY)
}

// Health monitoring
const startHealthMonitoring = () => {
  healthCheckInterval = setInterval(() => {
    if (!workerProcess || workerProcess.killed) {
      return
    }

    // Check memory usage
    const memUsage = process.memoryUsage()
    if (memUsage.heapUsed > MEMORY_THRESHOLD) {
      log('warn', `High memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`)
    }

    // Log health status
    log('info', `Worker health check - PID: ${workerProcess.pid}, Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`)
  }, HEALTH_CHECK_INTERVAL)
}

// Graceful shutdown
const shutdown = (signal) => {
  log('info', `Received ${signal}, shutting down...`)
  
  clearInterval(healthCheckInterval)
  
  if (workerProcess && !workerProcess.killed) {
    workerProcess.kill(signal)
    
    // Force kill after timeout
    setTimeout(() => {
      if (!workerProcess.killed) {
        log('warn', 'Force killing worker process')
        workerProcess.kill('SIGKILL')
      }
    }, 10000)
  } else {
    process.exit(0)
  }
}

// Signal handlers
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGHUP', () => {
  log('info', 'Received SIGHUP, restarting worker...')
  if (workerProcess && !workerProcess.killed) {
    workerProcess.kill('SIGTERM')
  }
})

// Unhandled errors
process.on('uncaughtException', (error) => {
  log('error', `Uncaught exception: ${error.message}`)
  log('error', error.stack)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  log('error', `Unhandled rejection at: ${promise}, reason: ${reason}`)
  process.exit(1)
})

// Start the worker
log('info', '🚀 Starting production vault worker manager')
startWorker()