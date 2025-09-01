import { NextRequest, NextResponse } from 'next/server'
import { requireParent, sanitizeUserInput, checkRateLimit } from '@/lib/policy/guard'
import { answerWithCitations } from '@/lib/ai'
import { canAccessFeature, getRemainingQueries } from '@/lib/plans'
import { prisma } from '@/lib/database'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireParent()
    if (!auth.ok) {
      return NextResponse.json({ error: auth.msg }, { status: auth.status })
    }

    const userId = auth.userId
    const body = await req.json()
    const { question, contextDocIds = [], tone = 'Respectful' } = body

    // Validate inputs
    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' }, 
        { status: 400 }
      )
    }

    if (!['Respectful', 'Professional', 'Urgent'].includes(tone)) {
      return NextResponse.json(
        { error: 'Invalid tone' }, 
        { status: 400 }
      )
    }

    // Check rate limits
    const rateCheck = checkRateLimit(userId, 'copilot_ask')
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', resetTime: rateCheck.resetTime }, 
        { status: 429 }
      )
    }

    // Get user subscription to check limits
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: { plan: true }
    })

    const userPlan = subscription?.plan || 'FREE_TRIAL'

    // Check if user has AI access
    if (!canAccessFeature(userPlan, 'ai_copilot')) {
      return NextResponse.json(
        { error: 'AI Copilot not available on your plan' }, 
        { status: 403 }
      )
    }

    // TODO Phase-2: Track usage and enforce limits
    // const usedQueries = await getMonthlyUsage(userId)
    // const remaining = getRemainingQueries(userPlan, usedQueries)
    // if (remaining <= 0) {
    //   return NextResponse.json(
    //     { error: 'Monthly AI query limit exceeded' }, 
    //     { status: 403 }
    //   )
    // }

    // Sanitize question
    const sanitizedQuestion = sanitizeUserInput(question)

    if (sanitizedQuestion.length === 0) {
      return NextResponse.json(
        { error: 'Question cannot be empty' }, 
        { status: 400 }
      )
    }

    // Process question with AI
    const result = await answerWithCitations({
      userId,
      question: sanitizedQuestion,
      docIds: contextDocIds,
      tone
    })

    // TODO Phase-2: Log usage for billing/limits
    // await logUsage(userId, 'ai_question', { question: sanitizedQuestion, tone })

    return NextResponse.json({
      ...result,
      metadata: {
        tone,
        documentsSearched: result.citations.length > 0,
        planFeatures: {
          plan: userPlan,
          hasAdvancedFeatures: canAccessFeature(userPlan, 'advanced_analytics')
        }
      }
    })

  } catch (error) {
    console.error('Copilot ask error:', error)
    return NextResponse.json(
      { error: 'Failed to process question' }, 
      { status: 500 }
    )
  }
}