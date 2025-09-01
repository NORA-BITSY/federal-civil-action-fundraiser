'use client'

import React, { useState, useCallback } from 'react'
import { AnimatedWrapper } from '@/components/ui/AnimatedWrapper'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { CampaignFormData, CampaignCategory, BudgetItem } from '@/types/campaign'
import { 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Scale, 
  DollarSign, 
  Image, 
  CheckCircle,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react'

interface StepProps {
  data: CampaignFormData
  onChange: (data: Partial<CampaignFormData>) => void
  onNext: () => void
  onPrevious: () => void
  isValid: boolean
}

const CAMPAIGN_CATEGORIES: { value: CampaignCategory; label: string; description: string }[] = [
  { value: 'civil_rights', label: 'Civil Rights', description: 'Fighting for fundamental rights and freedoms' },
  { value: 'housing_rights', label: 'Housing Rights', description: 'Addressing housing discrimination and tenant rights' },
  { value: 'employment', label: 'Employment', description: 'Workplace discrimination and labor disputes' },
  { value: 'environmental', label: 'Environmental Justice', description: 'Environmental protection and community health' },
  { value: 'immigration', label: 'Immigration Rights', description: 'Immigration law and family reunification' },
  { value: 'police_accountability', label: 'Police Accountability', description: 'Police misconduct and excessive force cases' },
  { value: 'healthcare', label: 'Healthcare Rights', description: 'Medical malpractice and healthcare access' },
  { value: 'education', label: 'Education', description: 'Educational discrimination and accessibility' },
  { value: 'family_law', label: 'Family Law', description: 'Custody, divorce, and family disputes' },
  { value: 'disability_rights', label: 'Disability Rights', description: 'ADA compliance and accessibility issues' },
  { value: 'consumer_protection', label: 'Consumer Protection', description: 'Fraud, scams, and consumer rights' },
  { value: 'other', label: 'Other', description: 'Other legal matters requiring funding' }
]

// Step 1: Basic Information
function BasicInformationStep({ data, onChange, onNext, isValid }: StepProps) {
  const handleInputChange = (field: string, value: string | string[]) => {
    onChange({
      basicInfo: {
        ...data.basicInfo,
        [field]: value
      }
    })
  }

  const handleLocationChange = (field: string, value: string) => {
    onChange({
      basicInfo: {
        ...data.basicInfo,
        location: {
          ...data.basicInfo.location,
          [field]: value
        }
      }
    })
  }

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    handleInputChange('tags', tags)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Basic Information</h2>
        <p className="text-lg text-gray-600">Tell us about your legal case and what you're fighting for</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Title *</label>
          <Input
            placeholder="Enter a clear, compelling title for your case"
            value={data.basicInfo.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">{data.basicInfo.title.length}/100 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
          <Input
            placeholder="Brief description of your case (optional)"
            value={data.basicInfo.subtitle}
            onChange={(e) => handleInputChange('subtitle', e.target.value)}
            maxLength={150}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Legal Category *</label>
          <div className="grid md:grid-cols-2 gap-3">
            {CAMPAIGN_CATEGORIES.map((category) => (
              <div
                key={category.value}
                className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                  data.basicInfo.category === category.value
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleInputChange('category', category.value)}
              >
                <div className="font-medium text-gray-900">{category.label}</div>
                <div className="text-sm text-gray-600 mt-1">{category.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <Input
            placeholder="Enter tags separated by commas (e.g., discrimination, housing, civil rights)"
            value={data.basicInfo.tags.join(', ')}
            onChange={(e) => handleTagsChange(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">Help people find your case with relevant tags</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
            <Input
              placeholder="City"
              value={data.basicInfo.location.city}
              onChange={(e) => handleLocationChange('city', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
            <Input
              placeholder="State"
              value={data.basicInfo.location.state}
              onChange={(e) => handleLocationChange('state', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
            <Input
              placeholder="ZIP Code"
              value={data.basicInfo.location.zipCode}
              onChange={(e) => handleLocationChange('zipCode', e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button onClick={onNext} disabled={!isValid}>
            Next: Legal Details
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Step 2: Legal Details
function LegalDetailsStep({ data, onChange, onNext, onPrevious }: StepProps) {
  const handleInputChange = (field: string, value: string) => {
    onChange({
      legalDetails: {
        ...data.legalDetails,
        [field]: value
      }
    })
  }

  const handleAttorneyChange = (field: string, value: string) => {
    onChange({
      legalDetails: {
        ...data.legalDetails,
        attorney: {
          ...data.legalDetails.attorney,
          [field]: value
        }
      }
    })
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
          <Scale className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Legal Case Details</h2>
        <p className="text-lg text-gray-600">Provide information about your legal case</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Case Type *</label>
          <Input
            placeholder="e.g., Housing Discrimination, Employment Dispute, Civil Rights Violation"
            value={data.legalDetails.caseType}
            onChange={(e) => handleInputChange('caseType', e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Case Number</label>
            <Input
              placeholder="Court case number (if applicable)"
              value={data.legalDetails.caseNumber || ''}
              onChange={(e) => handleInputChange('caseNumber', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Court</label>
            <Input
              placeholder="Court name (if applicable)"
              value={data.legalDetails.court || ''}
              onChange={(e) => handleInputChange('court', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Legal Summary *</label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
            placeholder="Provide a clear summary of your legal case, what happened, and what you're seeking to achieve..."
            value={data.legalDetails.legalSummary}
            onChange={(e) => handleInputChange('legalSummary', e.target.value)}
            maxLength={2000}
          />
          <p className="text-xs text-gray-500 mt-1">{data.legalDetails.legalSummary.length}/2000 characters</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Attorney Information (Optional)</h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attorney Name</label>
                <Input
                  placeholder="Attorney's full name"
                  value={data.legalDetails.attorney?.name || ''}
                  onChange={(e) => handleAttorneyChange('name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bar Number</label>
                <Input
                  placeholder="State bar number"
                  value={data.legalDetails.attorney?.barNumber || ''}
                  onChange={(e) => handleAttorneyChange('barNumber', e.target.value)}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Law Firm</label>
                <Input
                  placeholder="Law firm name"
                  value={data.legalDetails.attorney?.firm || ''}
                  onChange={(e) => handleAttorneyChange('firm', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
                <Input
                  placeholder="Email or phone"
                  value={data.legalDetails.attorney?.contact || ''}
                  onChange={(e) => handleAttorneyChange('contact', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrevious}>
            <ChevronLeft className="mr-2 w-4 h-4" />
            Previous
          </Button>
          <Button onClick={onNext}>
            Next: Fundraising Goals
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Step 3: Fundraising Goals
function FundraisingStep({ data, onChange, onNext, onPrevious }: StepProps) {
  const handleInputChange = (field: string, value: number | Date | boolean) => {
    onChange({
      fundraising: {
        ...data.fundraising,
        [field]: value
      }
    })
  }

  const addBudgetItem = () => {
    const newItem: BudgetItem = {
      id: Date.now().toString(),
      category: '',
      description: '',
      amount: 0,
      isRequired: true
    }
    
    onChange({
      fundraising: {
        ...data.fundraising,
        budgetBreakdown: [...data.fundraising.budgetBreakdown, newItem]
      }
    })
  }

  const updateBudgetItem = (id: string, field: keyof BudgetItem, value: any) => {
    onChange({
      fundraising: {
        ...data.fundraising,
        budgetBreakdown: data.fundraising.budgetBreakdown.map(item =>
          item.id === id ? { ...item, [field]: value } : item
        )
      }
    })
  }

  const removeBudgetItem = (id: string) => {
    onChange({
      fundraising: {
        ...data.fundraising,
        budgetBreakdown: data.fundraising.budgetBreakdown.filter(item => item.id !== id)
      }
    })
  }

  const totalBudget = data.fundraising.budgetBreakdown.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
          <DollarSign className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Fundraising Goals</h2>
        <p className="text-lg text-gray-600">Set your funding target and budget breakdown</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Funding Goal *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input
                type="number"
                placeholder="25000"
                value={data.fundraising.goalAmount || ''}
                onChange={(e) => handleInputChange('goalAmount', parseInt(e.target.value) || 0)}
                className="pl-8"
                min="100"
                max="1000000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Deadline</label>
            <Input
              type="date"
              value={data.fundraising.deadline?.toISOString().split('T')[0] || ''}
              onChange={(e) => handleInputChange('deadline', new Date(e.target.value))}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-xl">
          <input
            type="checkbox"
            id="urgent"
            checked={data.fundraising.isUrgent}
            onChange={(e) => handleInputChange('isUrgent', e.target.checked)}
            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
          />
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
            <label htmlFor="urgent" className="text-sm font-medium text-gray-900">
              This is an urgent case requiring immediate funding
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Budget Breakdown</h3>
            <Button variant="outline" size="sm" onClick={addBudgetItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          {data.fundraising.budgetBreakdown.map((item, index) => (
            <div key={item.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <Input
                    placeholder="e.g., Attorney Fees, Court Costs"
                    value={item.category}
                    onChange={(e) => updateBudgetItem(item.id, 'category', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      type="number"
                      value={item.amount || ''}
                      onChange={(e) => updateBudgetItem(item.id, 'amount', parseInt(e.target.value) || 0)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Input
                  placeholder="Brief description of this expense"
                  value={item.description}
                  onChange={(e) => updateBudgetItem(item.id, 'description', e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={item.isRequired}
                    onChange={(e) => updateBudgetItem(item.id, 'isRequired', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Required expense</span>
                </div>
                {data.fundraising.budgetBreakdown.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeBudgetItem(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total Budget:</span>
              <span className="text-xl font-bold text-blue-600">${totalBudget.toLocaleString()}</span>
            </div>
            {totalBudget !== data.fundraising.goalAmount && (
              <p className="text-sm text-orange-600 mt-2">
                ⚠️ Budget total (${totalBudget.toLocaleString()}) doesn't match funding goal (${data.fundraising.goalAmount.toLocaleString()})
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrevious}>
            <ChevronLeft className="mr-2 w-4 h-4" />
            Previous
          </Button>
          <Button onClick={onNext}>
            Next: Content & Media
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Step 4: Content & Media
function ContentMediaStep({ data, onChange, onNext, onPrevious }: StepProps) {
  const handleDescriptionChange = (value: string) => {
    onChange({
      content: {
        ...data.content,
        description: value
      }
    })
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
          <Image className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Content & Media</h2>
        <p className="text-lg text-gray-600">Tell your story and add supporting media</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Description *</label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[200px]"
            placeholder="Tell your full story here. Explain what happened, why you need legal help, and how the community can make a difference..."
            value={data.content.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            maxLength={5000}
          />
          <p className="text-xs text-gray-500 mt-1">{data.content.description.length}/5000 characters</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Supporting Media</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
            <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="font-medium text-gray-900 mb-2">Upload Images</h4>
            <p className="text-sm text-gray-600 mb-4">Add photos that help tell your story (JPG, PNG, max 5MB each)</p>
            <Button variant="outline">
              Choose Images
            </Button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="font-medium text-gray-900 mb-2">Upload Documents</h4>
            <p className="text-sm text-gray-600 mb-4">Add legal documents, evidence, or supporting materials (PDF, max 10MB each)</p>
            <Button variant="outline">
              Choose Documents
            </Button>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Privacy Notice</p>
              <p>Only upload documents you're comfortable sharing publicly. Sensitive legal documents should be shared privately during the verification process.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrevious}>
            <ChevronLeft className="mr-2 w-4 h-4" />
            Previous
          </Button>
          <Button onClick={onNext}>
            Review & Submit
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Step 5: Review & Submit
function ReviewSubmitStep({ data, onChange, onPrevious }: Omit<StepProps, 'onNext'>) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Submit campaign
      console.log('Submitting campaign:', data)
      // Navigate to success page or dashboard
    } catch (error) {
      console.error('Failed to submit campaign:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Review & Submit</h2>
        <p className="text-lg text-gray-600">Review your campaign before submitting for verification</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="space-y-6">
          {/* Campaign Summary */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{data.basicInfo.title}</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li><span className="font-medium">Category:</span> {data.basicInfo.category}</li>
                    <li><span className="font-medium">Location:</span> {data.basicInfo.location.city}, {data.basicInfo.location.state}</li>
                    <li><span className="font-medium">Tags:</span> {data.basicInfo.tags.join(', ')}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Fundraising</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li><span className="font-medium">Goal:</span> ${data.fundraising.goalAmount.toLocaleString()}</li>
                    <li><span className="font-medium">Deadline:</span> {data.fundraising.deadline?.toDateString() || 'No deadline'}</li>
                    <li><span className="font-medium">Urgent:</span> {data.fundraising.isUrgent ? 'Yes' : 'No'}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Allow public comments</span>
                  <input
                    type="checkbox"
                    checked={data.settings.allowComments}
                    onChange={(e) => onChange({
                      settings: { ...data.settings, allowComments: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Require donation approval</span>
                  <input
                    type="checkbox"
                    checked={data.settings.requireApproval}
                    onChange={(e) => onChange({
                      settings: { ...data.settings, requireApproval: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Make campaign public</span>
                  <input
                    type="checkbox"
                    checked={data.settings.isPublic}
                    onChange={(e) => onChange({
                      settings: { ...data.settings, isPublic: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What happens next?</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <span>Your campaign will be submitted for verification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <span>Our legal experts will review your case (typically 24-48 hours)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <span>Once approved, your campaign will go live and you can start raising funds</span>
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
              {isSubmitting ? 'Submitting...' : 'Submit Campaign'}
              <CheckCircle className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Progress indicator
function ProgressIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const steps = [
    { number: 1, title: 'Basic Info', icon: FileText },
    { number: 2, title: 'Legal Details', icon: Scale },
    { number: 3, title: 'Fundraising', icon: DollarSign },
    { number: 4, title: 'Content', icon: Image },
    { number: 5, title: 'Review', icon: CheckCircle },
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

// Main Wizard Component
export function CampaignCreationWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<CampaignFormData>({
    basicInfo: {
      title: '',
      subtitle: '',
      category: 'civil_rights',
      tags: [],
      location: {
        city: '',
        state: '',
        zipCode: ''
      }
    },
    legalDetails: {
      caseType: '',
      legalSummary: ''
    },
    fundraising: {
      goalAmount: 0,
      isUrgent: false,
      budgetBreakdown: [{
        id: '1',
        category: '',
        description: '',
        amount: 0,
        isRequired: true
      }]
    },
    content: {
      description: '',
      images: [],
      videos: [],
      documents: []
    },
    settings: {
      allowComments: true,
      requireApproval: false,
      isPublic: true
    }
  })

  const updateFormData = useCallback((data: Partial<CampaignFormData>) => {
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
        return formData.basicInfo.title && formData.basicInfo.category && 
               formData.basicInfo.location.city && formData.basicInfo.location.state
      case 2:
        return formData.legalDetails.caseType && formData.legalDetails.legalSummary
      case 3:
        return formData.fundraising.goalAmount > 0
      case 4:
        return formData.content.description.length > 50
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
            <BasicInformationStep
              data={formData}
              onChange={updateFormData}
              onNext={nextStep}
              onPrevious={previousStep}
              isValid={isStepValid(1)}
            />
          )}
          {currentStep === 2 && (
            <LegalDetailsStep
              data={formData}
              onChange={updateFormData}
              onNext={nextStep}
              onPrevious={previousStep}
              isValid={isStepValid(2)}
            />
          )}
          {currentStep === 3 && (
            <FundraisingStep
              data={formData}
              onChange={updateFormData}
              onNext={nextStep}
              onPrevious={previousStep}
              isValid={isStepValid(3)}
            />
          )}
          {currentStep === 4 && (
            <ContentMediaStep
              data={formData}
              onChange={updateFormData}
              onNext={nextStep}
              onPrevious={previousStep}
              isValid={isStepValid(4)}
            />
          )}
          {currentStep === 5 && (
            <ReviewSubmitStep
              data={formData}
              onChange={updateFormData}
              onPrevious={previousStep}
              isValid={true}
            />
          )}
        </AnimatedWrapper>
      </div>
    </div>
  )
}