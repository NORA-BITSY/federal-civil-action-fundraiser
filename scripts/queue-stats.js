#!/usr/bin/env node

/**
 * Queue Statistics Utility
 * 
 * Display current queue status and statistics
 */

async function main() {
  try {
    console.log('📊 Chips Copilot Queue Statistics')
    console.log('=' .repeat(50))
    
    // Dynamic import to handle ES modules
    const { checkQueueHealth, getQueueStats } = await import('../src/lib/queue.js')
    
    // Check health
    console.log('\n🏥 Health Check:')
    const health = await checkQueueHealth()
    
    console.log(`Redis: ${health.redis ? '✅ Connected' : '❌ Disconnected'}`)
    
    for (const [queueName, isHealthy] of Object.entries(health.queues)) {
      console.log(`${queueName}: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`)
    }
    
    // Get detailed stats
    console.log('\n📈 Queue Statistics:')
    const stats = await getQueueStats()
    
    for (const [queueName, queueStats] of Object.entries(stats)) {
      if (queueStats.error) {
        console.log(`\n❌ ${queueName}: Error - ${queueStats.error}`)
        continue
      }
      
      console.log(`\n📋 ${queueName}:`)
      console.log(`  • Waiting: ${queueStats.waiting}`)
      console.log(`  • Active: ${queueStats.active}`)
      console.log(`  • Completed: ${queueStats.completed}`)
      console.log(`  • Failed: ${queueStats.failed}`)
      console.log(`  • Delayed: ${queueStats.delayed}`)
      console.log(`  • Total: ${queueStats.total}`)
    }
    
    // Performance recommendations
    console.log('\n💡 Recommendations:')
    let hasRecommendations = false
    
    for (const [queueName, queueStats] of Object.entries(stats)) {
      if (queueStats.error) continue
      
      if (queueStats.failed > 10) {
        console.log(`⚠️  High failure rate in ${queueName} (${queueStats.failed} failed jobs)`)
        hasRecommendations = true
      }
      
      if (queueStats.waiting > 50) {
        console.log(`⚠️  Large backlog in ${queueName} (${queueStats.waiting} waiting jobs)`)
        hasRecommendations = true
      }
      
      if (queueStats.active === 0 && queueStats.waiting > 0) {
        console.log(`🚨 No active workers for ${queueName} but ${queueStats.waiting} jobs waiting`)
        hasRecommendations = true
      }
    }
    
    if (!hasRecommendations) {
      console.log('✅ All queues appear to be running smoothly')
    }
    
    console.log('\n' + '='.repeat(50))
    console.log('📝 Commands:')
    console.log('  npm run worker:dev    - Start development worker')
    console.log('  npm run worker:prod   - Start production worker')
    console.log('  npm run queue:stats   - Show this report')
    
  } catch (error) {
    console.error('❌ Failed to get queue statistics:', error.message)
    
    if (error.message.includes('Redis')) {
      console.log('\n💡 Make sure Redis is running:')
      console.log('  • Local: redis-server')
      console.log('  • Docker: docker run -p 6379:6379 redis:alpine')
      console.log('  • Check REDIS_HOST and REDIS_PORT environment variables')
    }
    
    process.exit(1)
  }
}

// Handle CLI arguments
if (process.argv.includes('--watch') || process.argv.includes('-w')) {
  console.log('👀 Watching queue stats (press Ctrl+C to exit)')
  
  const runStats = async () => {
    console.clear()
    await main()
  }
  
  runStats()
  setInterval(runStats, 5000) // Update every 5 seconds
} else {
  main()
}