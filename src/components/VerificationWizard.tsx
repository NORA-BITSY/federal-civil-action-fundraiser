'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { getContextualDisclaimer } from '@/lib/policy/disclaimers'

type VerificationStep = 'intro' | 'upload-id' | 'upload-selfie' | 'case-info' | 'review' | 'processing' | 'complete'

interface VerificationState {
  idDocKey?: string
  selfieKey?: string
  caseNumber: string
  fullName: string
  docketCourt: string
}

interface VerificationWizardProps {
  onComplete?: () => void
  onCancel?: () => void
}

export default function VerificationWizard({ onComplete, onCancel }: VerificationWizardProps) {
  const [step, setStep] = useState<VerificationStep>('intro')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadUrls, setUploadUrls] = useState<any>(null)
  const [state, setState] = useState<VerificationState>({
    caseNumber: '',
    fullName: '',
    docketCourt: ''
  })

  const handleStart = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/verification/start', { method: 'POST' })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start verification')
      }
      
      setUploadUrls(data.uploads)
      setStep('upload-id')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start verification')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File, type: 'id' | 'selfie') => {
    if (!uploadUrls) return
    
    setLoading(true)
    setError(null)
    
    try {
      const uploadUrl = type === 'id' ? uploadUrls.idUpload.url : uploadUrls.selfieUpload.url
      const uploadKey = type === 'id' ? uploadUrls.idUpload.key : uploadUrls.selfieUpload.key
      
      // Upload to storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      })
      
      if (!uploadResponse.ok) {
        throw new Error('File upload failed')
      }
      
      // Update state
      setState(prev => ({
        ...prev,
        [type === 'id' ? 'idDocKey' : 'selfieKey']: uploadKey
      }))
      
      // Move to next step
      if (type === 'id') {
        setStep('upload-selfie')
      } else {
        setStep('case-info')
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/verification/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idDocKey: state.idDocKey,
          selfieKey: state.selfieKey,
          caseNumber: state.caseNumber,
          fullName: state.fullName,
          docketCourt: state.docketCourt
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }
      
      setStep('complete')
      setTimeout(() => onComplete?.(), 2000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
      setStep('review') // Go back to review
    } finally {
      setLoading(false)
    }
  }

  const progress = {
    'intro': 0,
    'upload-id': 20,
    'upload-selfie': 40,
    'case-info': 60,
    'review': 80,
    'processing': 90,
    'complete': 100
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Parent Verification</h1>
        <p className="text-gray-600 mt-2">Secure identity verification for parents only</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress[step]}%` }}
        />
      </div>

      <Card className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {step === 'intro' && (
          <IntroStep onStart={handleStart} loading={loading} />
        )}

        {step === 'upload-id' && (
          <UploadStep
            type="id"
            title="Upload Photo ID"
            description="Upload a clear photo of your driver's license or state ID"
            onUpload={(file) => handleFileUpload(file, 'id')}
            loading={loading}
            onBack={() => setStep('intro')}
          />
        )}

        {step === 'upload-selfie' && (
          <UploadStep
            type="selfie"
            title="Take Selfie with ID"
            description="Take a selfie while holding your ID next to your face"
            onUpload={(file) => handleFileUpload(file, 'selfie')}
            loading={loading}
            onBack={() => setStep('upload-id')}
          />
        )}

        {step === 'case-info' && (
          <CaseInfoStep
            state={state}
            setState={setState}
            onNext={() => setStep('review')}
            onBack={() => setStep('upload-selfie')}
          />
        )}

        {step === 'review' && (
          <ReviewStep
            state={state}
            onSubmit={handleSubmit}
            onBack={() => setStep('case-info')}
            loading={loading}
          />
        )}

        {step === 'complete' && (
          <CompleteStep onContinue={() => onComplete?.()} />
        )}
      </Card>

      {/* Disclaimer */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
        {getContextualDisclaimer('verification')}
      </div>

      {onCancel && (
        <div className="text-center">
          <button 
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel and return later
          </button>
        </div>
      )}
    </div>
  )
}

function IntroStep({ onStart, loading }: { onStart: () => void; loading: boolean }) {
  return (
    <div className="text-center space-y-4">
      <div className="text-4xl mb-4">🛡️</div>
      <h2 className="text-xl font-semibold">Why We Verify Parents</h2>
      <div className="text-left space-y-3 text-gray-600">
        <p>• Protect families from unauthorized access to case information</p>
        <p>• Ensure compliance with court protective orders</p>
        <p>• Maintain a safe, parents-only community</p>
        <p>• Verify your involvement in the case you're seeking help with</p>
      </div>
      <div className="bg-amber-50 border border-amber-200 p-3 rounded text-sm text-amber-800">
        Your verification documents are encrypted and automatically deleted after approval.
      </div>
      <Button onClick={onStart} disabled={loading} className="w-full">
        {loading ? <LoadingSpinner /> : 'Begin Verification'}
      </Button>
    </div>
  )
}

function UploadStep({ 
  type, 
  title, 
  description, 
  onUpload, 
  loading, 
  onBack 
}: {
  type: string
  title: string
  description: string
  onUpload: (file: File) => void
  loading: boolean
  onBack: () => void
}) {
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = (file: File | null) => {
    if (file) onUpload(file)
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>

      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(false)
          const files = Array.from(e.dataTransfer.files)
          if (files[0]) handleFileSelect(files[0])
        }}
      >
        <div className="text-4xl mb-2">📷</div>
        <p className="text-gray-600 mb-4">
          Drag and drop your {type === 'id' ? 'ID document' : 'selfie'} here, or click to select
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button variant="outline" disabled={loading} className="cursor-pointer">
            {loading ? <LoadingSpinner /> : 'Choose File'}
          </Button>
        </label>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
      </div>
    </div>
  )
}

function CaseInfoStep({ 
  state, 
  setState, 
  onNext, 
  onBack 
}: {
  state: VerificationState
  setState: (state: VerificationState) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Case Information</h2>
        <p className="text-gray-600">Enter your case details for verification</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Full Legal Name
          </label>
          <input
            type="text"
            value={state.fullName}
            onChange={(e) => setState({ ...state, fullName: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="First Middle Last"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Case Number
          </label>
          <input
            type="text"
            value={state.caseNumber}
            onChange={(e) => setState({ ...state, caseNumber: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="2024-JC-000123"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Format examples: 2024-JC-123, 2024-FC-456, 24JC123
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Court/County (Optional)
          </label>
          <input
            type="text"
            value={state.docketCourt}
            onChange={(e) => setState({ ...state, docketCourt: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Pierce County, WI"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!state.fullName.trim() || !state.caseNumber.trim()}
        >
          Review
        </Button>
      </div>
    </div>
  )
}

function ReviewStep({ 
  state, 
  onSubmit, 
  onBack, 
  loading 
}: {
  state: VerificationState
  onSubmit: () => void
  onBack: () => void
  loading: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Review & Submit</h2>
        <p className="text-gray-600">Please verify your information is correct</p>
      </div>

      <div className="bg-gray-50 p-4 rounded space-y-2">
        <div><strong>Name:</strong> {state.fullName}</div>
        <div><strong>Case Number:</strong> {state.caseNumber}</div>
        {state.docketCourt && (
          <div><strong>Court:</strong> {state.docketCourt}</div>
        )}
        <div><strong>Documents:</strong> ID uploaded ✓ | Selfie uploaded ✓</div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm text-blue-800">
        By submitting, you confirm that all information is accurate and that you are a parent 
        involved in this case. Your verification will be processed within 24-48 hours.
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button onClick={onSubmit} disabled={loading}>
          {loading ? <LoadingSpinner /> : 'Submit for Verification'}
        </Button>
      </div>
    </div>
  )
}

function CompleteStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="text-center space-y-4">
      <div className="text-4xl text-green-500 mb-4">✅</div>
      <h2 className="text-xl font-semibold text-green-800">Verification Complete!</h2>
      <p className="text-gray-600">
        Your parent verification has been approved. You now have full access to Chips Copilot.
      </p>
      <Button onClick={onContinue} className="w-full">
        Continue to Dashboard
      </Button>
    </div>
  )
}