#!/usr/bin/env node

/**
 * Vault Worker Starter Script
 * 
 * Starts the BullMQ vault processing worker with proper error handling
 * and graceful shutdown capabilities.
 */

const { spawn } = require('child_process')
const path = require('path')

// Worker configuration
const WORKER_SCRIPT = path.join(__dirname, '../src/workers/vault.worker.ts')
const NODE_ENV = process.env.NODE_ENV || 'development'

console.log('🚀 Starting Chips Copilot Vault Worker...')
console.log(`📦 Environment: ${NODE_ENV}`)
console.log(`📄 Worker script: ${WORKER_SCRIPT}`)

// Spawn the worker process
const workerProcess = spawn('npx', ['tsx', WORKER_SCRIPT], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV,
    WORKER_ID: `vault-worker-${Date.now()}`
  }
})

// Handle worker process events
workerProcess.on('error', (error) => {
  console.error('❌ Failed to start worker process:', error)
  process.exit(1)
})

workerProcess.on('close', (code, signal) => {
  if (code === 0) {
    console.log('✅ Worker process exited successfully')
  } else if (signal) {
    console.log(`⚠️  Worker process killed with signal: ${signal}`)
  } else {
    console.error(`❌ Worker process exited with code: ${code}`)
  }
  process.exit(code || 0)
})

// Handle shutdown signals
const shutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}, shutting down worker...`)
  workerProcess.kill(signal)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

// Keep the main process alive
process.on('exit', (code) => {
  console.log(`🏁 Main process exiting with code: ${code}`)
})