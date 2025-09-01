'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Checklist } from '@/components/Checklist'

interface DashboardProps {
  user: any
  isParentVerified: boolean
  subscription: { plan: string; status: string } | null
  recentFiles: Array<{
    id: string
    name: string
    createdAt: Date
    tags: string[]
    piiRedacted: boolean
  }>
}

export default function ChipsCopilotDashboard({ 
  user, 
  isParentVerified, 
  subscription,
  recentFiles 
}: DashboardProps) {
  // Sample checklist items (in real app, these would come from AI analysis)
  const [checklistItems] = useState([
    {
      id: '1',
      title: 'Upload court order from latest hearing',
      description: 'Helps AI understand current case status',
      completed: false,
      priority: 'high' as const,
      category: 'Documents'
    },
    {
      id: '2',
      title: 'Review service plan requirements',
      description: 'Check what services are required and deadlines',
      completed: false,
      priority: 'medium' as const,
      category: 'Services'
    },
    {
      id: '3',
      title: 'Schedule attorney consultation',
      description: 'Discuss recent developments and next steps',
      completed: false,
      priority: 'medium' as const,
      category: 'Legal'
    }
  ])

  const planName = subscription?.plan || 'FREE_TRIAL'
  const isActiveSub = subscription?.status === 'ACTIVE'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to Chips Copilot
          </h1>
          <p className="text-gray-600 mt-1">
            Your private, parent-only case management and AI assistance platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isParentVerified ? 'success' : 'warning'}>
            {isParentVerified ? '✓ Verified Parent' : '⏳ Verification Pending'}
          </Badge>
        </div>
      </div>

      {/* Verification Status Banner */}
      {!isParentVerified && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🔐</div>
            <div className="flex-1">
              <h3 className="font-medium text-blue-900">Complete Parent Verification</h3>
              <p className="text-blue-700 text-sm">
                Verify your identity and case involvement to unlock full access to Chips Copilot features.
              </p>
            </div>
            <Link href="/verify/wizard">
              <Button>Complete Verification</Button>
            </Link>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href="/vault/upload" 
                className={`p-4 border-2 border-dashed rounded-lg text-center transition-colors ${
                  isParentVerified 
                    ? 'border-gray-300 hover:border-blue-400 hover:bg-blue-50' 
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              >
                <div className="text-3xl mb-2">📁</div>
                <h3 className="font-medium text-gray-900">Upload Documents</h3>
                <p className="text-sm text-gray-600">Add case files for AI analysis</p>
                {!isParentVerified && (
                  <Badge variant="warning" size="sm" className="mt-2">Requires Verification</Badge>
                )}
              </Link>
              
              <Link 
                href="/copilot" 
                className={`p-4 border-2 border-dashed rounded-lg text-center transition-colors ${
                  isParentVerified 
                    ? 'border-gray-300 hover:border-green-400 hover:bg-green-50' 
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              >
                <div className="text-3xl mb-2">🤖</div>
                <h3 className="font-medium text-gray-900">Ask Copilot</h3>
                <p className="text-sm text-gray-600">Get AI guidance on your case</p>
                {!isParentVerified && (
                  <Badge variant="warning" size="sm" className="mt-2">Requires Verification</Badge>
                )}
              </Link>
              
              <Link 
                href="/campaigns/create" 
                className={`p-4 border-2 border-dashed rounded-lg text-center transition-colors ${
                  isParentVerified 
                    ? 'border-gray-300 hover:border-purple-400 hover:bg-purple-50' 
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              >
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-medium text-gray-900">Create Campaign</h3>
                <p className="text-sm text-gray-600">Raise funds for case expenses</p>
                {!isParentVerified && (
                  <Badge variant="warning" size="sm" className="mt-2">Requires Verification</Badge>
                )}
              </Link>
              
              <Link 
                href="/vault" 
                className={`p-4 border-2 border-dashed rounded-lg text-center transition-colors ${
                  isParentVerified 
                    ? 'border-gray-300 hover:border-yellow-400 hover:bg-yellow-50' 
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              >
                <div className="text-3xl mb-2">🗃️</div>
                <h3 className="font-medium text-gray-900">Case Vault</h3>
                <p className="text-sm text-gray-600">Organize your documents</p>
                {!isParentVerified && (
                  <Badge variant="warning" size="sm" className="mt-2">Requires Verification</Badge>
                )}
              </Link>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Documents</h2>
            {recentFiles.length > 0 ? (
              <div className="space-y-3">
                {recentFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div className="text-xl">📄</div>
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-600">
                          {file.createdAt.toLocaleDateString()} • 
                          {file.piiRedacted ? ' Privacy protected' : ' Processing...'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.tags.map(tag => (
                        <Badge key={tag} variant="secondary" size="sm">
                          {tag.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
                <Link href="/vault">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Documents
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📂</div>
                <p>No documents uploaded yet.</p>
                <p className="text-sm">Upload your first case document to get started.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subscription Status */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Subscription</h3>
              <Badge variant={isActiveSub ? 'success' : 'secondary'}>
                {planName.replace('_', ' ')}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              {planName === 'FREE_TRIAL' && (
                <div className="space-y-2">
                  <p className="text-gray-600">
                    • 10 AI questions/month<br/>
                    • 1GB document storage<br/>
                    • Basic features
                  </p>
                  <Button size="sm" className="w-full">
                    Upgrade to Core
                  </Button>
                </div>
              )}
              
              {planName === 'CORE' && (
                <div className="space-y-2">
                  <p className="text-green-700">
                    ✓ 100 AI questions/month<br/>
                    ✓ 10GB storage<br/>
                    ✓ Document exports<br/>
                    ✓ Priority support
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Subscription
                  </Button>
                </div>
              )}
              
              {planName === 'PRO' && (
                <div className="space-y-2">
                  <p className="text-blue-700">
                    ✓ 300 AI questions/month<br/>
                    ✓ 50GB storage<br/>
                    ✓ Advanced analytics<br/>
                    ✓ Phone support
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Subscription
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Task Checklist */}
          <Card className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">Recommended Actions</h3>
            <Checklist 
              items={checklistItems}
              className="max-h-80 overflow-y-auto"
            />
          </Card>

          {/* Help & Resources */}
          <Card className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">Resources</h3>
            <div className="space-y-2 text-sm">
              <Link href="/support" className="block text-blue-600 hover:text-blue-800">
                📞 Support Center
              </Link>
              <Link href="/about" className="block text-blue-600 hover:text-blue-800">
                ℹ️ How Chips Copilot Works
              </Link>
              <Link href="/privacy" className="block text-blue-600 hover:text-blue-800">
                🔒 Privacy & Security
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}