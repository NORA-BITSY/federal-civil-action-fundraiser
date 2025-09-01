type MockKycArgs = { idDocUrl: string; selfieUrl: string; fullName: string }

export async function runMockKyc({ idDocUrl, selfieUrl, fullName }: MockKycArgs) {
  // Basic validation
  if (!idDocUrl || !selfieUrl || !fullName) {
    return { 
      ok: false, 
      score: 0, 
      message: 'Missing required verification documents or information' 
    }
  }

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Mock validation rules for development
  const nameTokens = fullName.toLowerCase().split(/\s+/)
  
  // Fail if name is too short or contains test data
  if (nameTokens.length < 2) {
    return { 
      ok: false, 
      score: 0.1, 
      message: 'Full name must include first and last name' 
    }
  }
  
  if (nameTokens.some(token => ['test', 'fake', 'demo', 'example'].includes(token))) {
    return { 
      ok: false, 
      score: 0.2, 
      message: 'Test data detected in verification documents' 
    }
  }
  
  // Mock success with medium-high confidence
  const baseScore = 0.75
  const randomVariation = (Math.random() - 0.5) * 0.2 // +/- 0.1
  const finalScore = Math.min(0.95, Math.max(0.65, baseScore + randomVariation))
  
  return { 
    ok: finalScore >= 0.7, 
    score: finalScore,
    message: finalScore >= 0.7 ? 'Identity verification successful' : 'Identity verification confidence too low'
  }
}

export async function extractIdDocumentData(_idDocUrl: string) {
  // TODO Phase-2: OCR extraction from ID documents
  // This would extract name, DOB, address, etc. from driver's license or state ID
  return {
    name: null,
    dateOfBirth: null,
    address: null,
    documentType: 'unknown',
    expirationDate: null
  }
}