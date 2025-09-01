interface TimelineEvent {
  date: string
  type: string
  description: string
  source?: string
  confidence?: number
}

interface TimelineProps {
  events: TimelineEvent[]
  className?: string
  maxEvents?: number
}

export function Timeline({ events, className = '', maxEvents = 20 }: TimelineProps) {
  const sortedEvents = events
    .sort((a, b) => {
      try {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      } catch {
        return 0
      }
    })
    .slice(0, maxEvents)

  if (sortedEvents.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <div className="text-4xl mb-2">📅</div>
        <p>No timeline events found in your documents yet.</p>
        <p className="text-sm mt-1">
          Upload court orders, hearing notices, or service logs to build your case timeline.
        </p>
      </div>
    )
  }

  const getEventIcon = (type: string): string => {
    switch (type.toUpperCase()) {
      case 'HEARING': return '⚖️'
      case 'ORDER': return '📋'
      case 'SERVICE': return '🏥'
      case 'DEADLINE': return '⏰'
      case 'FILING': return '📝'
      case 'VISITATION': return '👨‍👩‍👧‍👦'
      default: return '📌'
    }
  }

  const getEventColor = (type: string): string => {
    switch (type.toUpperCase()) {
      case 'HEARING': return 'border-blue-500 bg-blue-50'
      case 'ORDER': return 'border-purple-500 bg-purple-50'
      case 'SERVICE': return 'border-green-500 bg-green-50'
      case 'DEADLINE': return 'border-red-500 bg-red-50'
      case 'FILING': return 'border-yellow-500 bg-yellow-50'
      case 'VISITATION': return 'border-pink-500 bg-pink-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {sortedEvents.map((event, index) => (
          <div key={index} className="relative flex items-start gap-4 pb-6">
            {/* Event icon */}
            <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${getEventColor(event.type)}`}>
              <span className="text-lg">{getEventIcon(event.type)}</span>
            </div>
            
            {/* Event content */}
            <div className="flex-1 min-w-0">
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {formatDate(event.date)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.type === 'DEADLINE' ? 'bg-red-100 text-red-800' :
                        event.type === 'HEARING' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.type.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {event.description}
                    </p>
                    
                    {event.source && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <span>📄</span>
                        <span>From: {event.source}</span>
                        {event.confidence && (
                          <>
                            <span>•</span>
                            <span>Confidence: {Math.round(event.confidence * 100)}%</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {events.length > maxEvents && (
        <div className="text-center py-4 border-t">
          <p className="text-sm text-gray-500">
            Showing {maxEvents} of {events.length} events
          </p>
        </div>
      )}
    </div>
  )
}