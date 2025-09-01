'use client'

import React, { useState, useCallback } from 'react'
import { AnimatedWrapper } from '@/components/ui/AnimatedWrapper'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { User } from '@/types/campaign'
import { 
  ChevronLeft, 
  ChevronRight, 
  User as UserIcon, 
  FileText, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Scale,
  Users,
  Building
} from 'lucide-react'

interface OnboardingFormData {
  accountType: 'individual' | 'lawyer' | 'organization'
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    bio: string
    location: string
  }
  professionalInfo: {
    // For Lawyers
    barNumber?: string
    lawFirm?: string
    licenseState?: string
    specializations?: string[]
    yearsOfPractice?: number
    
    // For Organizations
    organizationName?: string
    taxId?: string
    organizationType?: 'nonprofit' | 'law_firm' | 'advocacy_group'
    websiteUrl?: string
    description?: string
  }
  verification: {
    documents: File[]
    agreedToTerms: boolean
    agreedToPrivacy: boolean
    marketingConsent: boolean
  }
  preferences: {
    emailNotifications: boolean
    smsNotifications: boolean
    categoryInterests: string[]
    locationPreferences: string[]
  }
}

interface StepProps {
  data: OnboardingFormData
  onChange: (data: Partial<OnboardingFormData>) => void
  onNext: () => void
  onPrevious: () => void
  isValid: boolean
}

// Step 1: Account Type Selection
function AccountTypeStep({ data, onChange, onNext }: Omit<StepProps, 'onPrevious' | 'isValid'>) {
  const accountTypes = [
    {
      type: 'individual' as const,
      icon: UserIcon,
      title: 'Individual',
      description: 'I need legal help for a personal case',
      features: [
        'Create campaigns for personal legal matters',
        'Connect with qualified attorneys',
        'Access to community support',
        'Case management tools'
      ]
    },
    {
      type: 'lawyer' as const,
      icon: Scale,
      title: 'Legal Professional',
      description: 'I am an attorney or legal professional',
      features: [
        'Help clients raise funds for legal fees',
        'Manage multiple client campaigns',
        'Professional verification badge',
        'Advanced case management tools'
      ]
    },
    {
      type: 'organization' as const,
      icon: Building,
      title: 'Organization',
      description: 'I represent a legal aid organization or law firm',
      features: [
        'Manage organization-wide campaigns',
        'Team collaboration tools',
        'Bulk case management',
        'Custom branding options'
      ]
    }
  ]

  const handleTypeSelect = (type: 'individual' | 'lawyer' | 'organization') => {
    onChange({ accountType: type })
    setTimeout(() => {
      onNext()
    }, 300)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-3xl mb-8">
          <Users className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Legal Defense Fund</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Let's set up your account. Choose the option that best describes you:
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
        {accountTypes.map((accountType) => (
          <Card
            key={accountType.type}
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
              data.accountType === accountType.type 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => handleTypeSelect(accountType.type)}
          >
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
                <accountType.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{accountType.title}</h3>
              <p className="text-gray-600 mb-6">{accountType.description}</p>
              <div className="space-y-2 text-left">
                {accountType.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Step 2: Personal Information
function PersonalInfoStep({ data, onChange, onNext, onPrevious, isValid }: StepProps) {
  const handleInputChange = (field: string, value: string) => {
    onChange({
      personalInfo: {
        ...data.personalInfo,
        [field]: value
      }
    })
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
          <UserIcon className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Personal Information</h2>
        <p className="text-lg text-gray-600">Tell us a bit about yourself</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
            <Input
              placeholder="Your first name"
              value={data.personalInfo.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
            <Input
              placeholder="Your last name"
              value={data.personalInfo.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
          <Input
            type="email"
            placeholder="your@email.com"
            value={data.personalInfo.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <Input
            type="tel"
            placeholder="(555) 123-4567"
            value={data.personalInfo.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
          <Input
            placeholder="City, State"
            value={data.personalInfo.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
            placeholder="Tell us about yourself and why you're joining our platform..."
            value={data.personalInfo.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">{data.personalInfo.bio.length}/500 characters</p>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrevious}>
            <ChevronLeft className="mr-2 w-4 h-4" />
            Previous
          </Button>
          <Button onClick={onNext} disabled={!isValid}>
            Next: Professional Details
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Step 3: Professional Information
function ProfessionalInfoStep({ data, onChange, onNext, onPrevious, isValid }: StepProps) {
  const handleInputChange = (field: string, value: string | string[] | number) => {
    onChange({
      professionalInfo: {
        ...data.professionalInfo,
        [field]: value
      }
    })
  }

  const handleSpecializationsChange = (value: string) => {
    const specializations = value.split(',').map(spec => spec.trim()).filter(spec => spec.length > 0)
    handleInputChange('specializations', specializations)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Professional Information</h2>
        <p className="text-lg text-gray-600">
          {data.accountType === 'lawyer' && 'Provide your legal credentials and practice information'}
          {data.accountType === 'organization' && 'Tell us about your organization'}
          {data.accountType === 'individual' && 'Any additional professional information (optional)'}
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {data.accountType === 'lawyer' && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bar Number *</label>
                <Input
                  placeholder="State bar number"
                  value={data.professionalInfo.barNumber || ''}
                  onChange={(e) => handleInputChange('barNumber', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License State *</label>
                <Input
                  placeholder="e.g., CA, NY, TX"
                  value={data.professionalInfo.licenseState || ''}
                  onChange={(e) => handleInputChange('licenseState', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Law Firm / Organization</label>
              <Input
                placeholder="Law firm or organization name"
                value={data.professionalInfo.lawFirm || ''}
                onChange={(e) => handleInputChange('lawFirm', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years of Practice</label>
              <Input
                type="number"
                placeholder="Years practicing law"
                value={data.professionalInfo.yearsOfPractice || ''}
                onChange={(e) => handleInputChange('yearsOfPractice', parseInt(e.target.value) || 0)}
                min="0"
                max="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
              <Input
                placeholder="Enter specializations separated by commas (e.g., Civil Rights, Employment Law, Immigration)"
                value={data.professionalInfo.specializations?.join(', ') || ''}
                onChange={(e) => handleSpecializationsChange(e.target.value)}
              />
            </div>
          </>
        )}

        {data.accountType === 'organization' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name *</label>
              <Input
                placeholder="Full organization name"
                value={data.professionalInfo.organizationName || ''}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization Type *</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={data.professionalInfo.organizationType || ''}
                  onChange={(e) => handleInputChange('organizationType', e.target.value)}
                >
                  <option value="">Select type</option>
                  <option value="nonprofit">Non-profit Organization</option>
                  <option value="law_firm">Law Firm</option>
                  <option value="advocacy_group">Advocacy Group</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID / EIN</label>
                <Input
                  placeholder="Federal Tax ID"
                  value={data.professionalInfo.taxId || ''}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
              <Input
                type="url"
                placeholder="https://yourorganization.com"
                value={data.professionalInfo.websiteUrl || ''}
                onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Organization Description</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                placeholder="Describe your organization's mission and work..."
                value={data.professionalInfo.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                maxLength={1000}
              />
            </div>
          </>
        )}

        {data.accountType === 'individual' && (
          <div className="text-center p-8 bg-gray-50 rounded-xl">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              As an individual user, you can proceed to the next step. 
              Additional verification may be required when creating campaigns.
            </p>
          </div>
        )}

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrevious}>
            <ChevronLeft className="mr-2 w-4 h-4" />
            Previous
          </Button>
          <Button onClick={onNext} disabled={!isValid}>
            Next: Verification
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Step 4: Verification & Terms
function VerificationStep({ data, onChange, onNext, onPrevious, isValid }: StepProps) {
  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files)
      onChange({
        verification: {
          ...data.verification,
          documents: [...data.verification.documents, ...fileArray]
        }
      })
    }
  }

  const handleCheckboxChange = (field: string, value: boolean) => {
    onChange({
      verification: {
        ...data.verification,
        [field]: value
      }
    })
  }

  const getRequiredDocuments = () => {
    switch (data.accountType) {
      case 'lawyer':
        return [
          'Bar license or certificate',
          'Government-issued ID',
          'Professional liability insurance (optional)'
        ]
      case 'organization':
        return [
          'IRS determination letter or incorporation documents',
          'Government-issued ID of authorized representative',
          'Proof of tax-exempt status (if applicable)'
        ]
      default:
        return [
          'Government-issued ID',
          'Proof of residence (optional)'
        ]
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Verification & Terms</h2>
        <p className="text-lg text-gray-600">
          Help us verify your identity to ensure platform security
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">Required Documents</h3>
          <ul className="space-y-2">
            {getRequiredDocuments().map((doc, index) => (
              <li key={index} className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                {doc}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="font-medium text-gray-900 mb-2">Upload Verification Documents</h4>
          <p className="text-sm text-gray-600 mb-4">
            Upload clear photos or scans of the required documents (PDF, JPG, PNG, max 5MB each)
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="document-upload"
          />
          <label htmlFor="document-upload">
            <Button as="span" variant="outline">
              Choose Files
            </Button>
          </label>
          {data.verification.documents.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              {data.verification.documents.length} file(s) uploaded
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="terms"
              checked={data.verification.agreedToTerms}
              onChange={(e) => handleCheckboxChange('agreedToTerms', e.target.checked)}
              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I agree to the <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a> and 
              understand that I am responsible for the accuracy of the information provided. *
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="privacy"
              checked={data.verification.agreedToPrivacy}
              onChange={(e) => handleCheckboxChange('agreedToPrivacy', e.target.checked)}
              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="privacy" className="text-sm text-gray-700">
              I have read and agree to the <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>. *
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="marketing"
              checked={data.verification.marketingConsent}
              onChange={(e) => handleCheckboxChange('marketingConsent', e.target.checked)}
              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="marketing" className="text-sm text-gray-700">
              I would like to receive updates about new features, success stories, and platform news.
            </label>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Verification Process</p>
              <p>
                Your documents will be reviewed by our verification team within 1-2 business days. 
                You'll receive an email notification once your account is verified.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrevious}>
            <ChevronLeft className="mr-2 w-4 h-4" />
            Previous
          </Button>
          <Button onClick={onNext} disabled={!isValid}>
            Complete Setup
            <CheckCircle className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Step 5: Preferences & Completion
function PreferencesStep({ data, onChange, onPrevious }: Omit<StepProps, 'onNext' | 'isValid'>) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePreferenceChange = (field: string, value: boolean | string[]) => {
    onChange({
      preferences: {
        ...data.preferences,
        [field]: value
      }
    })
  }

  const handleCategoryInterests = (categories: string[]) => {
    handlePreferenceChange('categoryInterests', categories)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Submit onboarding data
      console.log('Submitting onboarding data:', data)
      // Redirect to dashboard or welcome page
    } catch (error) {
      console.error('Failed to submit onboarding:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const legalCategories = [
    'Civil Rights', 'Housing Rights', 'Employment', 'Environmental Justice',
    'Immigration', 'Police Accountability', 'Healthcare', 'Education',
    'Family Law', 'Disability Rights', 'Consumer Protection'
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Almost Done!</h2>
        <p className="text-lg text-gray-600">
          Set your preferences to get the most relevant content and notifications
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Email Notifications</div>
                  <div className="text-sm text-gray-600">Receive updates about campaigns and platform news</div>
                </div>
                <input
                  type="checkbox"
                  checked={data.preferences.emailNotifications}
                  onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">SMS Notifications</div>
                  <div className="text-sm text-gray-600">Get urgent updates via text message</div>
                </div>
                <input
                  type="checkbox"
                  checked={data.preferences.smsNotifications}
                  onChange={(e) => handlePreferenceChange('smsNotifications', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Areas of Interest</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select legal categories you're interested in to see more relevant campaigns
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {legalCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`category-${category}`}
                    checked={data.preferences.categoryInterests.includes(category)}
                    onChange={(e) => {
                      const currentInterests = data.preferences.categoryInterests
                      const newInterests = e.target.checked
                        ? [...currentInterests, category]
                        : currentInterests.filter(c => c !== category)
                      handleCategoryInterests(newInterests)
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`category-${category}`} className="text-sm text-gray-700">
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Next?</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                <div>
                  <div className="font-medium">Account Verification</div>
                  <div className="text-gray-600">We'll review your documents within 1-2 business days</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                <div>
                  <div className="font-medium">Explore the Platform</div>
                  <div className="text-gray-600">Browse campaigns, learn about our process, and get familiar with the tools</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                <div>
                  <div className="font-medium">Start Supporting or Creating</div>
                  <div className="text-gray-600">Support existing campaigns or create your own once verified</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrevious}>
            <ChevronLeft className="mr-2 w-4 h-4" />
            Previous
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Complete Setup'}
            <CheckCircle className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Progress indicator
function ProgressIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const steps = [
    { number: 1, title: 'Account Type', icon: Users },
    { number: 2, title: 'Personal Info', icon: UserIcon },
    { number: 3, title: 'Professional', icon: FileText },
    { number: 4, title: 'Verification', icon: Shield },
    { number: 5, title: 'Preferences', icon: CheckCircle },
  ]

  return (
    <div className="mb-12">
      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-200 ${
                  currentStep === step.number
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : currentStep > step.number
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                <step.icon className="w-5 h-5" />
              </div>
              <span className={`mt-2 text-xs font-medium ${
                currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 ${
                currentStep > step.number ? 'bg-green-600' : 'bg-gray-300'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

// Main Onboarding Wizard Component
export function UserOnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<OnboardingFormData>({
    accountType: 'individual',
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      bio: '',
      location: ''
    },
    professionalInfo: {},
    verification: {
      documents: [],
      agreedToTerms: false,
      agreedToPrivacy: false,
      marketingConsent: false
    },
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      categoryInterests: [],
      locationPreferences: []
    }
  })

  const updateFormData = useCallback((data: Partial<OnboardingFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }, [])

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 5))
  }

  const previousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.accountType !== undefined
      case 2:
        return formData.personalInfo.firstName && formData.personalInfo.lastName && 
               formData.personalInfo.email && formData.personalInfo.location
      case 3:
        if (formData.accountType === 'lawyer') {
          return formData.professionalInfo.barNumber && formData.professionalInfo.licenseState
        }
        if (formData.accountType === 'organization') {
          return formData.professionalInfo.organizationName && formData.professionalInfo.organizationType
        }
        return true
      case 4:
        return formData.verification.agreedToTerms && formData.verification.agreedToPrivacy
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProgressIndicator currentStep={currentStep} totalSteps={5} />
        
        <AnimatedWrapper>
          {currentStep === 1 && (
            <AccountTypeStep
              data={formData}
              onChange={updateFormData}
              onNext={nextStep}
            />
          )}
          {currentStep === 2 && (
            <PersonalInfoStep
              data={formData}
              onChange={updateFormData}
              onNext={nextStep}
              onPrevious={previousStep}
              isValid={isStepValid(2)}
            />
          )}
          {currentStep === 3 && (
            <ProfessionalInfoStep
              data={formData}
              onChange={updateFormData}
              onNext={nextStep}
              onPrevious={previousStep}
              isValid={isStepValid(3)}
            />
          )}
          {currentStep === 4 && (
            <VerificationStep
              data={formData}
              onChange={updateFormData}
              onNext={nextStep}
              onPrevious={previousStep}
              isValid={isStepValid(4)}
            />
          )}
          {currentStep === 5 && (
            <PreferencesStep
              data={formData}
              onChange={updateFormData}
              onPrevious={previousStep}
            />
          )}
        </AnimatedWrapper>
      </div>
    </div>
  )
}