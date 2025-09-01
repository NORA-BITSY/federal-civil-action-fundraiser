import { retrieveUserContext, semanticSearch, type DocumentChunk } from './rag'
import { DISCLAIMER, SYSTEM_GUARDRAILS, documentAnalysisPrompt, SUGGESTED_QUESTIONS } from './prompts'

type AskArgs = { 
  userId: string
  question: string
  docIds?: string[]
  tone?: 'Respectful' | 'Professional' | 'Urgent'
}

type AskResult = {
  answer: string
  citations: Array<{
    docId: string
    name: string
    chunk: number
    excerpt: string
    pageNumber?: number
  }>
  disclaimer: string
  suggestedQuestions?: string[]
  confidence: number
}

export async function answerWithCitations({ userId, question, docIds, tone = 'Respectful' }: AskArgs): Promise<AskResult> {
  try {
    // Retrieve user's document corpus
    const corpus = await retrieveUserContext(userId, docIds)
    
    if (corpus.length === 0) {
      return {
        answer: "I don't have any documents to reference yet. Please upload and process your case documents first.",
        citations: [],
        disclaimer: DISCLAIMER,
        suggestedQuestions: SUGGESTED_QUESTIONS.slice(0, 5),
        confidence: 0
      }
    }
    
    // Find relevant chunks
    const relevantChunks = await semanticSearch(question, corpus)
    
    // Generate response based on relevant content
    const answer = await synthesizeAnswer(question, relevantChunks, tone)
    
    // Prepare citations
    const citations = relevantChunks.map((chunk, index) => ({
      docId: chunk.id,
      name: chunk.name,
      chunk: chunk.chunkIndex,
      excerpt: chunk.text.slice(0, 200) + (chunk.text.length > 200 ? '...' : ''),
      pageNumber: chunk.pageNumber
    }))
    
    // Calculate confidence based on relevance and coverage
    const confidence = calculateConfidence(question, relevantChunks)
    
    return {
      answer,
      citations,
      disclaimer: DISCLAIMER,
      suggestedQuestions: getContextualSuggestions(question, relevantChunks),
      confidence
    }
    
  } catch (error) {
    console.error('Error in answerWithCitations:', error)
    return {
      answer: "I'm having trouble processing your question right now. Please try again or contact support if the issue persists.",
      citations: [],
      disclaimer: DISCLAIMER,
      confidence: 0
    }
  }
}

async function synthesizeAnswer(question: string, chunks: DocumentChunk[], tone: string): Promise<string> {
  // Phase-1: Template-based response generation
  // Phase-2: Replace with actual LLM API call (OpenAI, Claude, etc.)
  
  if (chunks.length === 0) {
    return `I couldn't find relevant information in your uploaded documents to answer: "${question}"\n\nConsider:\n- Uploading more case documents\n- Asking about specific document types you've uploaded\n- Rephrasing your question with different terms\n\nRemember to consult with your attorney for case-specific guidance.`
  }
  
  const citedContent = chunks
    .map((chunk, i) => `[${i+1}] From "${chunk.name}"${chunk.pageNumber ? `, page ${chunk.pageNumber}` : ''}:\n${chunk.text.slice(0, 300)}${chunk.text.length > 300 ? '...' : ''}`)
    .join('\n\n')
  
  const responseParts = [
    `## Answer to: "${question}"`,
    '',
    'Based on your uploaded documents, here\'s what I found:',
    '',
    citedContent,
    '',
    '## Key Takeaways',
    generateKeyTakeaways(chunks),
    '',
    '## Suggested Next Steps',
    generateNextSteps(question, chunks),
    '',
    '**Remember**: This analysis is for educational purposes only. Always consult your attorney for case-specific legal guidance.'
  ]
  
  return responseParts.join('\n')
}

function generateKeyTakeaways(chunks: DocumentChunk[]): string {
  // Extract common themes and important information
  const commonTerms = chunks
    .flatMap(chunk => chunk.keyTerms)
    .reduce((acc, term) => {
      acc[term] = (acc[term] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  
  const topTerms = Object.entries(commonTerms)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([term]) => term)
  
  const takeaways = []
  
  if (topTerms.includes('hearing') || topTerms.includes('court')) {
    takeaways.push('• Court proceedings or hearings are mentioned in your documents')
  }
  
  if (topTerms.includes('service') || topTerms.includes('services')) {
    takeaways.push('• Services or service plans appear to be part of your case')
  }
  
  if (topTerms.includes('deadline') || topTerms.includes('date')) {
    takeaways.push('• There are important dates or deadlines to track')
  }
  
  if (takeaways.length === 0) {
    takeaways.push('• Your documents contain relevant case information that may help with understanding your situation')
  }
  
  return takeaways.join('\n')
}

function generateNextSteps(question: string, chunks: DocumentChunk[]): string {
  const steps = []
  
  if (question.toLowerCase().includes('deadline') || question.toLowerCase().includes('date')) {
    steps.push('• Create a calendar with all important dates from your documents')
    steps.push('• Ask your attorney about any deadlines you might be missing')
  }
  
  if (question.toLowerCase().includes('hearing') || question.toLowerCase().includes('court')) {
    steps.push('• Review hearing notices carefully with your attorney')
    steps.push('• Prepare questions to ask at your next legal consultation')
  }
  
  if (question.toLowerCase().includes('service')) {
    steps.push('• Discuss service requirements with your caseworker')
    steps.push('• Document your compliance with any service plans')
  }
  
  if (steps.length === 0) {
    steps.push('• Review the cited documents more thoroughly')
    steps.push('• Prepare specific questions for your attorney based on this information')
    steps.push('• Consider uploading related documents for more complete analysis')
  }
  
  return steps.join('\n')
}

function calculateConfidence(question: string, chunks: DocumentChunk[]): number {
  if (chunks.length === 0) return 0
  
  let confidence = 0.3 // Base confidence
  
  // Boost confidence based on relevance
  const questionTerms = question.toLowerCase().split(/\s+/)
  const matchingTerms = chunks.reduce((total, chunk) => {
    return total + questionTerms.filter(term => 
      chunk.text.toLowerCase().includes(term) || 
      chunk.keyTerms.includes(term)
    ).length
  }, 0)
  
  confidence += Math.min(0.4, matchingTerms * 0.1)
  
  // Boost for multiple source documents
  const uniqueDocs = new Set(chunks.map(c => c.id)).size
  confidence += Math.min(0.2, uniqueDocs * 0.1)
  
  // Cap at 0.85 for Phase-1 (we're not doing full LLM analysis yet)
  return Math.min(0.85, confidence)
}

function getContextualSuggestions(question: string, chunks: DocumentChunk[]): string[] {
  const suggestions = [...SUGGESTED_QUESTIONS]
  
  // Add context-specific suggestions based on document content
  const hasCourtDocs = chunks.some(c => c.name.toLowerCase().includes('order') || c.name.toLowerCase().includes('court'))
  const hasServiceDocs = chunks.some(c => c.name.toLowerCase().includes('service') || c.keyTerms.includes('service'))
  const hasHearingDocs = chunks.some(c => c.keyTerms.includes('hearing') || c.text.toLowerCase().includes('hearing'))
  
  if (hasCourtDocs) {
    suggestions.unshift("What does this court order require me to do?")
  }
  
  if (hasServiceDocs) {
    suggestions.unshift("What services am I required to complete?")
  }
  
  if (hasHearingDocs) {
    suggestions.unshift("When is my next hearing and how should I prepare?")
  }
  
  return suggestions.slice(0, 6) // Return top 6 suggestions
}