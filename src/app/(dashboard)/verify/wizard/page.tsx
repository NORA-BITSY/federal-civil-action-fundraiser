import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import VerificationWizard from '@/components/VerificationWizard'

export default async function VerifyWizardPage() {
  const session = await getServerSession(authOptions)
  
  // Redirect if already verified
  if ((session?.user as any)?.isParentVerified) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <VerificationWizard 
          onComplete={() => {
            // Client-side redirect will be handled by the component
            window.location.href = '/dashboard'
          }}
          onCancel={() => {
            window.location.href = '/dashboard'
          }}
        />
      </div>
    </div>
  )
}