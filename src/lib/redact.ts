export interface RedactionResult {
  redactedText: string
  redactionMap: {
    originalLength: number
    redactionCount: number
    redactionsByType: Record<string, number>
    redactions: Array<{
      type: string
      start: number
      end: number
      replacement: string
    }>
  }
}

interface RedactionPattern {
  type: string
  regex: RegExp
  replacement: (match: string, index: number) => string
  priority: number // Lower numbers processed first
}

const REDACTION_PATTERNS: RedactionPattern[] = [
  // Social Security Numbers - highest priority
  {
    type: 'SSN',
    regex: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
    replacement: () => '[SSN-REDACTED]',
    priority: 1
  },

  // Phone Numbers
  {
    type: 'PHONE',
    regex: /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
    replacement: () => '[PHONE-REDACTED]',
    priority: 2
  },

  // Email Addresses
  {
    type: 'EMAIL',
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: () => '[EMAIL-REDACTED]',
    priority: 3
  },

  // Full Names (more conservative - only redact obvious full names)
  {
    type: 'NAME',
    regex: /\b([A-Z][a-z]{1,15}\s+[A-Z][a-z]{1,15}(?:\s+[A-Z][a-z]{1,15})?)\b/g,
    replacement: (match) => {
      // Don't redact common titles or court terms
      const excludePatterns = [
        /^(Judge|Justice|Attorney|Doctor|Officer|Deputy|Commissioner|Magistrate)/i,
        /^(Court|State|County|Department|Service|Division|Bureau)/i,
        /^(Pierce County|Family Court|Juvenile Court|District Court)/i
      ]
      
      for (const pattern of excludePatterns) {
        if (pattern.test(match)) {
          return match // Don't redact
        }
      }
      
      return '[NAME-REDACTED]'
    },
    priority: 4
  },

  // Addresses (street addresses)
  {
    type: 'ADDRESS',
    regex: /\b\d+\s+[A-Za-z\s]{3,30}(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Way|Court|Ct|Place|Pl)\b/gi,
    replacement: () => '[ADDRESS-REDACTED]',
    priority: 5
  },

  // Dates of Birth (be careful not to redact hearing dates)
  {
    type: 'DOB',
    regex: /\b(?:born|birth|DOB|date of birth)[\s:]+(\d{1,2}[-\/]\d{1,2}[-\/]\d{4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/gi,
    replacement: () => '[DOB-REDACTED]',
    priority: 6
  },

  // Financial information (account numbers, etc)
  {
    type: 'FINANCIAL',
    regex: /\b(?:account|routing|card)[\s#:]*\d{4,16}\b/gi,
    replacement: () => '[FINANCIAL-REDACTED]',
    priority: 7
  }
]

export function redactPII(text: string): RedactionResult {
  if (!text) {
    return {
      redactedText: text,
      redactionMap: {
        originalLength: 0,
        redactionCount: 0,
        redactionsByType: {},
        redactions: []
      }
    }
  }

  let redactedText = text
  const redactions: Array<{
    type: string
    start: number
    end: number
    replacement: string
  }> = []
  
  const redactionsByType: Record<string, number> = {}

  // Sort patterns by priority
  const sortedPatterns = [...REDACTION_PATTERNS].sort((a, b) => a.priority - b.priority)

  // Apply each redaction pattern
  for (const pattern of sortedPatterns) {
    const matches: Array<{
      match: RegExpExecArray
      replacement: string
    }> = []

    // Collect all matches first
    let match
    while ((match = pattern.regex.exec(redactedText)) !== null) {
      const replacement = pattern.replacement(match[0], match.index)
      
      // Only redact if replacement is different from original
      if (replacement !== match[0]) {
        matches.push({ match, replacement })
      }
      
      // Avoid infinite loops
      if (!pattern.regex.global) break
    }

    // Apply replacements in reverse order to maintain indices
    matches.reverse().forEach(({ match, replacement }) => {
      const start = match.index
      const end = match.index + match[0].length
      
      redactions.push({
        type: pattern.type,
        start,
        end,
        replacement
      })

      redactionsByType[pattern.type] = (redactionsByType[pattern.type] || 0) + 1
      
      redactedText = redactedText.substring(0, start) + 
                    replacement + 
                    redactedText.substring(end)
    })

    // Reset regex lastIndex for next iteration
    pattern.regex.lastIndex = 0
  }

  return {
    redactedText,
    redactionMap: {
      originalLength: text.length,
      redactionCount: redactions.length,
      redactionsByType,
      redactions
    }
  }
}

export function validateRedactionSafety(text: string): {
  isSafe: boolean
  riskyContent: string[]
  suggestions: string[]
} {
  const riskyContent: string[] = []
  const suggestions: string[] = []

  // Check for SSN patterns
  const ssnPattern = /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g
  if (ssnPattern.test(text)) {
    riskyContent.push('Potential Social Security Numbers detected')
    suggestions.push('Ensure all SSNs are properly redacted before storing')
  }

  // Check for phone numbers
  const phonePattern = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g
  if (phonePattern.test(text)) {
    riskyContent.push('Phone numbers detected')
    suggestions.push('Consider redacting phone numbers unless essential for case')
  }

  // Check for email addresses
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  if (emailPattern.test(text)) {
    riskyContent.push('Email addresses detected')
    suggestions.push('Email addresses may contain personal information')
  }

  // Check for financial information
  const financialPattern = /\b(?:account|routing|card)[\s#:]*\d{4,16}\b/gi
  if (financialPattern.test(text)) {
    riskyContent.push('Financial account information detected')
    suggestions.push('Financial information must be redacted for privacy')
  }

  return {
    isSafe: riskyContent.length === 0,
    riskyContent,
    suggestions
  }
}

export function createRedactionSummary(redactionMap: RedactionResult['redactionMap']): string {
  if (redactionMap.redactionCount === 0) {
    return 'No sensitive information detected. Document appears safe to store.'
  }

  const typeDescriptions: Record<string, string> = {
    'SSN': 'Social Security Numbers',
    'PHONE': 'Phone Numbers', 
    'EMAIL': 'Email Addresses',
    'NAME': 'Full Names',
    'ADDRESS': 'Street Addresses',
    'DOB': 'Dates of Birth',
    'FINANCIAL': 'Financial Information'
  }

  const redactionSummary = Object.entries(redactionMap.redactionsByType)
    .map(([type, count]) => `${count} ${typeDescriptions[type] || type}`)
    .join(', ')

  const reductionPercent = Math.round(
    (redactionMap.redactionCount / redactionMap.originalLength) * 100
  )

  return `Redacted ${redactionMap.redactionCount} items (${redactionSummary}). ` +
         `Privacy reduction: ~${reductionPercent}% of content protected.`
}