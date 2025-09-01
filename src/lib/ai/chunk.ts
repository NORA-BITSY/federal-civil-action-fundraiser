export const CHUNK_SIZE = 1200
export const CHUNK_OVERLAP = 160

export function chunkText(text: string): string[] {
  if (!text || text.length <= CHUNK_SIZE) {
    return [text]
  }

  const chunks: string[] = []
  
  for (let i = 0; i < text.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
    const end = Math.min(text.length, i + CHUNK_SIZE)
    const chunk = text.slice(i, end)
    
    // Try to break on sentence boundaries for better context
    if (end < text.length && chunk.includes('.')) {
      const lastSentenceEnd = chunk.lastIndexOf('.')
      if (lastSentenceEnd > CHUNK_SIZE * 0.7) { // Only break if we keep most of the chunk
        const adjustedChunk = text.slice(i, i + lastSentenceEnd + 1)
        chunks.push(adjustedChunk.trim())
        i = i + lastSentenceEnd + 1 - (CHUNK_SIZE - CHUNK_OVERLAP)
        continue
      }
    }
    
    chunks.push(chunk.trim())
  }
  
  return chunks.filter(chunk => chunk.length > 0)
}

export function extractKeyTerms(text: string): string[] {
  // Simple keyword extraction for Phase-1
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'between', 'among', 'within', 'without', 'along', 'following',
    'across', 'behind', 'beyond', 'plus', 'except', 'but', 'up', 'out', 'around', 'down'
  ])
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
  
  // Count word frequency
  const wordCounts = new Map<string, number>()
  words.forEach(word => {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
  })
  
  // Return top terms by frequency
  return Array.from(wordCounts.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word)
}