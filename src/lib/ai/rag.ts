import { prisma } from '@/lib/database'
import { chunkText, extractKeyTerms } from './chunk'

export type DocumentChunk = {
  id: string
  name: string
  chunkIndex: number
  text: string
  keyTerms: string[]
  pageNumber?: number
}

export async function retrieveUserContext(userId: string, docIds?: string[]): Promise<DocumentChunk[]> {
  const where = { 
    userId, 
    piiRedacted: true, // Only search redacted documents for safety
    ...(docIds?.length ? { id: { in: docIds } } : {}) 
  }
  
  const docs = await prisma.vaultFile.findMany({ 
    where, 
    select: { 
      id: true, 
      name: true, 
      ocrText: true,
      tags: true 
    },
    orderBy: { createdAt: 'desc' }
  })
  
  const corpus: DocumentChunk[] = []
  
  for (const doc of docs) {
    const ocrData = doc.ocrText as any
    if (!ocrData?.text) continue
    
    const chunks = chunkText(ocrData.text)
    
    chunks.forEach((chunk, index) => {
      corpus.push({
        id: doc.id,
        name: doc.name,
        chunkIndex: index,
        text: chunk,
        keyTerms: extractKeyTerms(chunk),
        pageNumber: ocrData.pages?.[Math.floor(index * ocrData.pages.length / chunks.length)]?.page
      })
    })
  }
  
  // Phase-1 cap to prevent overwhelming responses
  return corpus.slice(0, 60)
}

export async function semanticSearch(query: string, corpus: DocumentChunk[]): Promise<DocumentChunk[]> {
  // Phase-1: Simple keyword-based search
  // Phase-2: Replace with actual vector similarity search
  
  const queryTerms = extractKeyTerms(query.toLowerCase())
  const queryText = query.toLowerCase()
  
  const scored = corpus.map(chunk => {
    let score = 0
    
    // Exact phrase match bonus
    if (chunk.text.toLowerCase().includes(queryText)) {
      score += 10
    }
    
    // Individual term matches
    queryTerms.forEach(term => {
      if (chunk.text.toLowerCase().includes(term)) {
        score += 2
      }
      if (chunk.keyTerms.includes(term)) {
        score += 3
      }
    })
    
    // Boost for certain important document types
    const importantTerms = ['court order', 'hearing', 'deadline', 'service plan', 'petition']
    importantTerms.forEach(term => {
      if (chunk.text.toLowerCase().includes(term)) {
        score += 1
      }
    })
    
    return { ...chunk, score }
  })
  
  return scored
    .filter(chunk => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5) // Top 5 most relevant chunks
}

export async function extractDocumentEvents(userId: string) {
  // Extract timeline events from user's documents
  const docs = await prisma.vaultFile.findMany({
    where: { userId, piiRedacted: true },
    select: { id: true, name: true, ocrText: true, createdAt: true }
  })
  
  const events = []
  
  for (const doc of docs) {
    const ocrData = doc.ocrText as any
    if (!ocrData?.text) continue
    
    const text = ocrData.text.toLowerCase()
    
    // Simple date extraction (Phase-1)
    const dateRegex = /\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}\b/gi
    const matches = text.match(dateRegex)
    
    if (matches) {
      matches.slice(0, 3).forEach((dateStr, index) => { // Limit per document
        const context = extractContextAroundDate(text, dateStr)
        events.push({
          date: dateStr,
          description: context,
          source: doc.name,
          docId: doc.id,
          confidence: 0.7 // Phase-1 basic confidence
        })
      })
    }
  }
  
  // Sort by date (attempt to parse and sort)
  return events
    .sort((a, b) => {
      try {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateA.getTime() - dateB.getTime()
      } catch {
        return 0
      }
    })
    .slice(0, 20) // Limit total events
}

function extractContextAroundDate(text: string, dateStr: string): string {
  const index = text.indexOf(dateStr.toLowerCase())
  if (index === -1) return dateStr
  
  const start = Math.max(0, index - 50)
  const end = Math.min(text.length, index + dateStr.length + 100)
  const context = text.slice(start, end).trim()
  
  // Clean up the context
  return context
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-.:,]/g, ' ')
    .trim()
}