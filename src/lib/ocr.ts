import PDFParse from 'pdf-parse'

export interface OCRResult {
  text: string
  pages: Array<{
    page: number
    text: string
  }>
  metadata?: {
    totalPages: number
    info?: any
  }
}

export async function performOCR(buffer: Buffer, mimeType: string): Promise<OCRResult> {
  if (mimeType === 'application/pdf') {
    return await processPDF(buffer)
  }
  
  if (mimeType.startsWith('text/')) {
    return processTextFile(buffer)
  }
  
  // For images and other types, return empty result for now
  // TODO Phase-2: Add Tesseract.js for image OCR
  return {
    text: '',
    pages: [],
    metadata: {
      totalPages: 0
    }
  }
}

async function processPDF(buffer: Buffer): Promise<OCRResult> {
  try {
    const data = await PDFParse(buffer, {
      // Extract page-by-page text
      pagerender: async (pageData: any) => {
        return pageData.getTextContent().then((textContent: any) => {
          return textContent.items.map((item: any) => item.str).join(' ')
        })
      }
    })

    // Split text by pages if available
    const pageTexts = data.text.split('\f') // Form feed character separates pages
    const pages = pageTexts.map((pageText, index) => ({
      page: index + 1,
      text: pageText.trim()
    })).filter(page => page.text.length > 0)

    return {
      text: data.text,
      pages: pages.length > 0 ? pages : [{ page: 1, text: data.text }],
      metadata: {
        totalPages: data.numpages || 1,
        info: data.info
      }
    }
  } catch (error) {
    console.error('PDF OCR failed:', error)
    throw new Error(`PDF processing failed: ${error.message}`)
  }
}

function processTextFile(buffer: Buffer): OCRResult {
  const text = buffer.toString('utf-8')
  
  return {
    text,
    pages: [{ page: 1, text }],
    metadata: {
      totalPages: 1
    }
  }
}

export function generateTagHints(ocrText: string): string[] {
  const text = ocrText.toLowerCase()
  const hints: string[] = []

  // Legal document type detection
  if (text.includes('court order') || text.includes('order of the court')) {
    hints.push('COURT_ORDER')
  }
  
  if (text.includes('hearing') || text.includes('scheduled') || text.includes('appear')) {
    hints.push('HEARING')
  }
  
  if (text.includes('service plan') || text.includes('case plan')) {
    hints.push('SERVICE_PLAN')
  }
  
  if (text.includes('drug test') || text.includes('toxicology') || text.includes('substance')) {
    hints.push('TOXICOLOGY')
  }
  
  if (text.includes('home study') || text.includes('visit') || text.includes('inspection')) {
    hints.push('HOME_STUDY')
  }
  
  if (text.includes('mental health') || text.includes('psychological') || text.includes('therapy')) {
    hints.push('MENTAL_HEALTH')
  }
  
  if (text.includes('parenting class') || text.includes('parent education')) {
    hints.push('PARENTING')
  }
  
  if (text.includes('petition') || text.includes('complaint')) {
    hints.push('PETITION')
  }
  
  if (text.includes('termination') || text.includes('tpr')) {
    hints.push('TERMINATION')
  }
  
  if (text.includes('permanency') || text.includes('placement')) {
    hints.push('PERMANENCY')
  }
  
  // Time-sensitive documents
  if (text.includes('deadline') || text.includes('due date') || text.includes('must complete')) {
    hints.push('DEADLINE')
  }
  
  // Financial documents
  if (text.includes('payment') || text.includes('cost') || text.includes('fee')) {
    hints.push('FINANCIAL')
  }

  return hints
}

export function extractEventsFromText(text: string): Array<{
  date: string
  type: string
  description: string
  confidence: number
}> {
  const events: Array<{
    date: string
    type: string
    description: string
    confidence: number
  }> = []
  
  if (!text || text.length === 0) return events
  
  // Simple date extraction patterns
  const datePatterns = [
    /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/g,                    // MM/DD/YYYY
    /\b(\d{4}-\d{2}-\d{2})\b/g,                          // YYYY-MM-DD
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi  // Month DD, YYYY
  ]
  
  const eventKeywords = {
    'HEARING': ['hearing', 'court hearing', 'judicial hearing', 'trial', 'appearance'],
    'ORDER': ['court order', 'ordered', 'decree', 'judgment'],
    'SERVICE': ['service', 'services', 'therapy', 'counseling', 'treatment'],
    'DEADLINE': ['deadline', 'due date', 'by', 'before', 'no later than'],
    'FILING': ['filed', 'petition', 'motion', 'document', 'paperwork'],
    'VISITATION': ['visitation', 'visit', 'contact', 'parenting time']
  }
  
  for (const pattern of datePatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const dateStr = match[0]
      const matchIndex = match.index
      
      // Get context around the date (100 chars before and after)
      const contextStart = Math.max(0, matchIndex - 100)
      const contextEnd = Math.min(text.length, matchIndex + dateStr.length + 100)
      const context = text.slice(contextStart, contextEnd).toLowerCase()
      
      // Determine event type based on context
      let eventType = 'DATE_MENTION'
      let confidence = 0.5
      
      for (const [type, keywords] of Object.entries(eventKeywords)) {
        for (const keyword of keywords) {
          if (context.includes(keyword.toLowerCase())) {
            eventType = type
            confidence = 0.8
            break
          }
        }
        if (eventType !== 'DATE_MENTION') break
      }
      
      // Clean up context for description
      const description = context
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 150) + (context.length > 150 ? '...' : '')
      
      events.push({
        date: dateStr,
        type: eventType,
        description,
        confidence
      })
    }
  }
  
  // Remove duplicates and sort by confidence
  const uniqueEvents = events
    .filter((event, index, self) => 
      index === self.findIndex(e => e.date === event.date && e.type === event.type)
    )
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 20) // Limit to top 20 events
  
  return uniqueEvents
}

export function extractCaseNumbers(text: string): Array<{
  caseNumber: string
  confidence: number
  context: string
}> {
  const caseNumbers: Array<{
    caseNumber: string
    confidence: number
    context: string
  }> = []
  
  // Case number patterns
  const patterns = [
    /\b\d{4}[-\s]?JC[-\s]?\d+/gi,     // Juvenile Court
    /\b\d{4}[-\s]?FC[-\s]?\d+/gi,     // Family Court  
    /\b\d{4}[-\s]?CV[-\s]?\d+/gi,     // Civil
    /\b\d{4}[-\s]?CR[-\s]?\d+/gi,     // Criminal
    /\bcase\s+no\.?\s*:?\s*(\d{4}[-\s]?[A-Z]{2}[-\s]?\d+)/gi  // "Case No: XXXX-XX-XXXX"
  ]
  
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const caseNumber = match[0]
      const matchIndex = match.index
      
      // Get context
      const contextStart = Math.max(0, matchIndex - 50)
      const contextEnd = Math.min(text.length, matchIndex + caseNumber.length + 50)
      const context = text.slice(contextStart, contextEnd).trim()
      
      // Higher confidence for properly formatted case numbers
      const confidence = caseNumber.match(/\d{4}[-\s]?[A-Z]{2}[-\s]?\d+/) ? 0.9 : 0.7
      
      caseNumbers.push({
        caseNumber: caseNumber.replace(/\s+/g, ''),
        confidence,
        context
      })
    }
  }
  
  return caseNumbers
    .filter((item, index, self) => 
      index === self.findIndex(c => c.caseNumber === item.caseNumber)
    )
    .sort((a, b) => b.confidence - a.confidence)
}

