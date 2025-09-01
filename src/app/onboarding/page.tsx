import { Metadata } from 'next'
import { UserOnboardingWizard } from '@/components/onboarding/UserOnboardingWizard'

export const metadata: Metadata = {
  title: 'Account Setup | Legal Defense Fund',
  description: 'Complete your account setup to start using our legal defense platform.',
}

export default function OnboardingPage() {
  return <UserOnboardingWizard />
}