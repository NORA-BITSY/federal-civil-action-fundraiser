'use client'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { SUGGESTED_QUESTIONS } from '@/lib/ai/prompts'
import { getContextualDisclaimer } from '@/lib/policy/disclaimers'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  citations?: Array<{
    docId: string
    name: string
    chunk: number
    excerpt: string
    pageNumber?: number
  }>
  confidence?: number
}

interface ChatUIProps {
  className?: string
  placeholder?: string
  maxMessages?: number
}

export default function ChatUI({ 
  className = '', 
  placeholder = "Ask about your case or a document...",
  maxMessages = 50
}: ChatUIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [tone, setTone] = useState<'Respectful' | 'Professional' | 'Urgent'>('Respectful')
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (messageText?: string) => {
    const question = messageText || currentMessage.trim()
    
    if (!question) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setLoading(true)
    setShowSuggestions(false)

    try {
      const response = await fetch('/api/copilot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          tone,
          contextDocIds: [] // Phase-1: search all documents
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        citations: data.citations,
        confidence: data.confidence
      }

      setMessages(prev => [...prev, assistantMessage])

      // Limit message history
      if (messages.length + 2 > maxMessages) {
        setMessages(prev => prev.slice(-maxMessages + 2))
      }

    } catch (error) {
      console.error('Chat error:', error)
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I'm sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or contact support if the issue persists.`,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  const clearChat = () => {
    setMessages([])
    setShowSuggestions(true)
  }

  return (
    <div className={`flex flex-col h-96 bg-white border rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🤖</div>
          <div>
            <h3 className="font-medium text-gray-900">Chips Copilot</h3>
            <p className="text-xs text-gray-500">Educational guidance only</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as typeof tone)}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="Respectful">Respectful</option>
            <option value="Professional">Professional</option>
            <option value="Urgent">Urgent</option>
          </select>
          
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearChat}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && showSuggestions ? (
          <WelcomeMessage onSuggestionClick={sendMessage} />
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-gray-500">
                <LoadingSpinner size="sm" />
                <span className="text-sm">Analyzing your documents...</span>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder={placeholder}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !currentMessage.trim()}>
            {loading ? <LoadingSpinner size="sm" /> : 'Ask'}
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          {getContextualDisclaimer('copilot')}
        </div>
      </form>
    </div>
  )
}

function WelcomeMessage({ onSuggestionClick }: { onSuggestionClick: (question: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="text-center py-6">
        <div className="text-4xl mb-2">👋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Hi! I'm your Chips Copilot
        </h3>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          I can help you understand your documents, organize your case timeline, 
          and draft respectful communications. What would you like to know?
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Suggested questions:</p>
        <div className="space-y-1">
          {SUGGESTED_QUESTIONS.slice(0, 6).map((question, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(question)}
              className="block w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.type === 'user'
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3xl px-4 py-2 rounded-lg ${
        isUser
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-900'
      }`}>
        <div className="whitespace-pre-wrap">{message.content}</div>
        
        {message.citations && message.citations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
            <p className="text-xs font-medium text-gray-600">Sources:</p>
            {message.citations.map((citation, index) => (
              <div key={index} className="text-xs text-gray-600 bg-white p-2 rounded">
                <div className="font-medium">
                  [{index + 1}] {citation.name}
                  {citation.pageNumber && ` (page ${citation.pageNumber})`}
                </div>
                <div className="text-gray-500 mt-1">
                  "{citation.excerpt.slice(0, 150)}{citation.excerpt.length > 150 ? '...' : ''}"
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-2 text-xs opacity-75">
          <span>{message.timestamp.toLocaleTimeString()}</span>
          {message.confidence && (
            <span>
              Confidence: {Math.round(message.confidence * 100)}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}