import { NextRequest, NextResponse } from 'next/server'
import { requireParent } from '@/lib/policy/guard'
import { extractDocumentEvents } from '@/lib/ai/rag'
import { canAccessFeature } from '@/lib/plans'
import { prisma } from '@/lib/database'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireParent()
    if (!auth.ok) {
      return NextResponse.json({ error: auth.msg }, { status: auth.status })
    }

    const userId = auth.userId

    // Get user subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: { plan: true }
    })

    const userPlan = subscription?.plan || 'FREE_TRIAL'

    // Timeline feature available to all plans in Phase-1
    // Phase-2 might restrict advanced timeline analytics to higher plans

    // Extract timeline events from user's documents
    const events = await extractDocumentEvents(userId)

    // Basic timeline for all users
    const timeline = {
      events: events.map(event => ({
        date: event.date,
        type: event.type,
        description: event.description,
        source: event.source,
        confidence: event.confidence
      })),
      summary: {
        totalEvents: events.length,
        eventTypes: [...new Set(events.map(e => e.type))],
        sourcesCount: [...new Set(events.map(e => e.source))].length,
        dateRange: events.length > 0 ? {
          earliest: events[0]?.date,
          latest: events[events.length - 1]?.date
        } : null
      }
    }

    // Add advanced analytics for Pro users
    if (canAccessFeature(userPlan, 'advanced_analytics')) {
      const analytics = {
        patterns: analyzeEventPatterns(events),
        milestones: identifyMilestones(events),
        upcomingDeadlines: findUpcomingDeadlines(events)
      }
      
      return NextResponse.json({
        ...timeline,
        analytics,
        plan: userPlan
      })
    }

    return NextResponse.json({
      ...timeline,
      plan: userPlan,
      upgradePrompt: canAccessFeature(userPlan, 'advanced_analytics') ? null : 
        'Upgrade to Pro for advanced timeline analytics and milestone tracking'
    })

  } catch (error) {
    console.error('Timeline error:', error)
    return NextResponse.json(
      { error: 'Failed to generate timeline' }, 
      { status: 500 }
    )
  }
}

function analyzeEventPatterns(events: any[]) {
  // Simple pattern analysis for Phase-1
  const eventsByType = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    mostCommonEventType: Object.entries(eventsByType)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown',
    eventFrequency: eventsByType
  }
}

function identifyMilestones(events: any[]) {
  // Identify potential milestone events
  const milestoneKeywords = ['order', 'hearing', 'judgment', 'petition', 'filing']
  
  return events
    .filter(event => 
      milestoneKeywords.some(keyword => 
        event.description.toLowerCase().includes(keyword)
      )
    )
    .slice(0, 10) // Top 10 milestones
}

function findUpcomingDeadlines(events: any[]) {
  // This would be enhanced in Phase-2 with actual deadline detection
  // For now, return deadline-type events
  return events
    .filter(event => event.type === 'DEADLINE')
    .slice(0, 5)
}