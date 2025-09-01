import { runMockKyc } from './provider-stub'

type KycArgs = { idDocUrl: string; selfieUrl: string; fullName: string }
type KycResult = { ok: boolean; score: number; message?: string }

export async function runKycCheck(args: KycArgs): Promise<KycResult> {
  // Phase-1: Use stub provider, can be toggled via env FEATURE_KYC_STUB=true
  if (process.env.FEATURE_KYC_STUB === 'true' || process.env.NODE_ENV === 'development') {
    return runMockKyc(args)
  }
  
  // TODO Phase-2: Implement actual KYC provider integration
  // Examples: Onfido, Veriff, Jumio, etc.
  // 
  // const provider = new OnfidoClient({
  //   apiKey: process.env.ONFIDO_API_KEY!,
  //   region: 'US'
  // })
  // 
  // const check = await provider.check.create({
  //   applicantId: applicantId,
  //   reportNames: ['identity_enhanced', 'facial_similarity_photo']
  // })
  // 
  // return { ok: check.result === 'clear', score: check.score }
  
  throw new Error('KYC provider not configured for production')
}

export * from './provider-stub'