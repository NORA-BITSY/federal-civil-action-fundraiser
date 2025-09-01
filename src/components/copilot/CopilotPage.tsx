'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import ChatUI from '@/components/ChatUI'
import { Timeline } from '@/components/Timeline'
import { getContextualDisclaimer } from '@/lib/policy/disclaimers'

interface CopilotPageProps {
  subscription: { plan: string; status: string } | null
  documentCount: number
  recentDocuments: Array<{
    id: string
    name: string
    tags: string[]
    createdAt: Date
  }>
}

export default function CopilotPage({ subscription, documentCount, recentDocuments }: CopilotPageProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'timeline' | 'insights'>('chat')
  const [timeline, setTimeline] = useState<any[]>([])
  const [loadingTimeline, setLoadingTimeline] = useState(false)

  const planName = subscription?.plan || 'FREE_TRIAL'
  const isActiveSub = subscription?.status === 'ACTIVE'

  const loadTimeline = async () => {
    setLoadingTimeline(true)
    try {
      const response = await fetch('/api/copilot/timeline')
      const data = await response.json()
      setTimeline(data.events || [])
    } catch (error) {
      console.error('Failed to load timeline:', error)
    } finally {
      setLoadingTimeline(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤖 Chips Copilot
          </h1>
          <p className="text-gray-600">
            AI-powered assistance for your CPS/CHIPS case management
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Badge variant={documentCount > 0 ? 'success' : 'warning'}>
              {documentCount} documents indexed
            </Badge>
            <Badge variant={isActiveSub ? 'success' : 'secondary'}>
              {planName.replace('_', ' ')} Plan
            </Badge>
          </div>
        </div>

        {/* No Documents State */}
        {documentCount === 0 && (
          <Card className="p-8 text-center bg-blue-50 border-blue-200">
            <div className="text-4xl mb-4">📚</div>
            <h2 className="text-xl font-semibold text-blue-900 mb-2">
              Upload Documents to Get Started
            </h2>
            <p className="text-blue-700 mb-4">
              Chips Copilot analyzes your case documents to provide personalized guidance and insights.
            </p>
            <Button>
              <a href="/vault/upload">Upload Your First Document</a>
            </Button>
          </Card>
        )}

        {/* Main Interface */}
        {documentCount > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Navigation Tabs */}
              <Card className="p-4">
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      activeTab === 'chat'
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    💬 Ask Questions
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('timeline')
                      if (timeline.length === 0) loadTimeline()
                    }}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      activeTab === 'timeline'
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    📅 Case Timeline
                  </button>
                  <button
                    onClick={() => setActiveTab('insights')}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      activeTab === 'insights'
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    📊 Insights
                    {planName === 'FREE_TRIAL' && (
                      <Badge variant="warning" size="sm" className="ml-2">Pro</Badge>
                    )}
                  </button>
                </div>
              </Card>

              {/* Document Context */}
              <Card className="p-4">
                <h3 className="font-medium text-gray-900 mb-3">Your Documents</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total Documents</span>
                    <Badge variant="secondary">{documentCount}</Badge>
                  </div>
                </div>
                
                {recentDocuments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Uploads</h4>
                    <div className="space-y-1">
                      {recentDocuments.slice(0, 5).map((doc) => (
                        <div key={doc.id} className="text-xs text-gray-600 truncate">
                          📄 {doc.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Plan Limits */}
              <Card className="p-4">
                <h3 className="font-medium text-gray-900 mb-3">Usage</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">AI Questions</span>
                    <span className="text-gray-900">
                      {planName === 'FREE_TRIAL' ? '0/10' :
                       planName === 'CORE' ? '0/100' :
                       '0/300'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-blue-600 h-1 rounded-full" style={{ width: '0%' }} />
                  </div>
                </div>
                
                {planName === 'FREE_TRIAL' && (
                  <Button size="sm" className="w-full mt-3">
                    Upgrade Plan
                  </Button>
                )}
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'chat' && (
                <Card className="h-[600px]">
                  <ChatUI 
                    className="h-full"
                    placeholder="Ask me anything about your case documents..."
                  />
                </Card>
              )}

              {activeTab === 'timeline' && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Case Timeline
                    </h2>
                    <Button
                      variant="outline"
                      onClick={loadTimeline}
                      disabled={loadingTimeline}
                    >
                      {loadingTimeline ? 'Analyzing...' : 'Refresh Timeline'}
                    </Button>
                  </div>
                  
                  <Timeline events={timeline} />
                </Card>
              )}

              {activeTab === 'insights' && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Case Insights
                  </h2>
                  
                  {planName === 'FREE_TRIAL' ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <div className="text-4xl mb-4">📊</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Advanced Insights
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Upgrade to Pro for case pattern analysis, milestone tracking, and predictive insights.
                      </p>
                      <Button>Upgrade to Pro</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="font-medium text-green-900 mb-2">✅ Case Progress</h3>
                        <p className="text-green-700 text-sm">
                          Your case documentation is well-organized with {documentCount} documents indexed.
                        </p>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-medium text-yellow-900 mb-2">⚠️ Upcoming Deadlines</h3>
                        <p className="text-yellow-700 text-sm">
                          No immediate deadlines detected in your current documents.
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-medium text-blue-900 mb-2">💡 Recommendations</h3>
                        <p className="text-blue-700 text-sm">
                          Consider uploading recent communication logs and service reports for better timeline analysis.
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-xs text-gray-600 bg-gray-100 p-4 rounded">
          {getContextualDisclaimer('copilot')}
        </div>
      </div>
    </div>
  )
}