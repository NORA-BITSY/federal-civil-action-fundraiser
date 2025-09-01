type MatchArgs = { caseNumber: string; fullName: string }
type MatchResult = { match: boolean; docketMeta?: any; level?: string }

export async function matchCaseNumber({ caseNumber, fullName }: MatchArgs): Promise<MatchResult> {
  // Phase-1: Basic validation and stub matching
  if (!caseNumber?.trim() || !fullName?.trim()) {
    return { match: false }
  }

  // Basic case number format validation
  const caseNumberPattern = /^\d{4}[-\s]?(JC|FC|CV|CR)[-\s]?\d+$/i
  if (!caseNumberPattern.test(caseNumber.replace(/\s+/g, ''))) {
    return { 
      match: false, 
      level: 'INVALID_FORMAT',
      docketMeta: { error: 'Invalid case number format' }
    }
  }

  // Phase-1: Treat any valid format as L1 self-attested
  // Phase-2: Implement actual docket lookup via court APIs where available
  return { 
    match: true, 
    level: 'L1_SELF_ATTESTED',
    docketMeta: { 
      caseNumber,
      court: extractCourtFromCaseNumber(caseNumber),
      type: extractCaseTypeFromCaseNumber(caseNumber),
      verificationMethod: 'self_attested'
    }
  }
}

function extractCourtFromCaseNumber(caseNumber: string): string {
  // Extract basic court info from case number pattern
  const normalized = caseNumber.replace(/\s+/g, '').toUpperCase()
  if (normalized.includes('JC')) return 'Juvenile Court'
  if (normalized.includes('FC')) return 'Family Court'
  if (normalized.includes('CV')) return 'Civil Court'
  if (normalized.includes('CR')) return 'Criminal Court'
  return 'Unknown Court'
}

function extractCaseTypeFromCaseNumber(caseNumber: string): string {
  const normalized = caseNumber.replace(/\s+/g, '').toUpperCase()
  if (normalized.includes('JC')) return 'CHIPS/CPS'
  if (normalized.includes('FC')) return 'Family Law'
  if (normalized.includes('CV')) return 'Civil'
  if (normalized.includes('CR')) return 'Criminal'
  return 'Unknown'
}

export function validateCaseNumberFormat(caseNumber: string): boolean {
  const pattern = /^\d{4}[-\s]?(JC|FC|CV|CR)[-\s]?\d+$/i
  return pattern.test(caseNumber.replace(/\s+/g, ''))
}

export * as Odyssey from './providers/odyssey'