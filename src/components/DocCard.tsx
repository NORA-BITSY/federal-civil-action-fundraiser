import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface DocCardProps {
  id: string
  name: string
  sizeBytes: number
  mimeType: string
  tags?: string[]
  piiRedacted?: boolean
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED'
  processingError?: string
  createdAt: Date
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onRetry?: (id: string) => void
  className?: string
}

export default function DocCard({
  id,
  name,
  sizeBytes,
  mimeType,
  tags = [],
  piiRedacted = false,
  status,
  processingError,
  createdAt,
  onView,
  onEdit,
  onDelete,
  onRetry,
  className = ''
}: DocCardProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('image')) return '🖼️'
    if (mimeType.includes('word')) return '📝'
    if (mimeType.includes('text')) return '📋'
    return '📄'
  }

  const getFileTypeLabel = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return 'PDF'
    if (mimeType.includes('image')) return 'Image'
    if (mimeType.includes('word')) return 'Word'
    if (mimeType.includes('text')) return 'Text'
    return 'Document'
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'READY':
        return (
          <Badge variant="success" size="sm">
            ✅ Ready
          </Badge>
        )
      case 'PROCESSING':
        return (
          <Badge variant="warning" size="sm">
            ⚡ Processing
          </Badge>
        )
      case 'PENDING':
        return (
          <Badge variant="secondary" size="sm">
            ⏳ Queued
          </Badge>
        )
      case 'FAILED':
        return (
          <Badge variant="destructive" size="sm">
            ❌ Failed
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Card className={`p-4 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-2xl">{getFileIcon(mimeType)}</div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate" title={name}>
              {name}
            </h3>
            
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <span>{getFileTypeLabel(mimeType)}</span>
              <span>•</span>
              <span>{formatFileSize(sizeBytes)}</span>
              <span>•</span>
              <span>{createdAt.toLocaleDateString()}</span>
            </div>
            
            <div className="mt-2 flex items-center gap-1 flex-wrap">
              {getStatusBadge()}
              
              {piiRedacted && (
                <Badge variant="info" size="sm">
                  🔒 Privacy Protected
                </Badge>
              )}
              
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" size="sm">
                  {tag.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
            
            {/* Error message for failed files */}
            {status === 'FAILED' && processingError && (
              <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                {processingError}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 ml-3">
          {onView && status === 'READY' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(id)}
              title="View document"
            >
              👁️
            </Button>
          )}
          
          {onEdit && status === 'READY' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(id)}
              title="Edit tags"
            >
              ✏️
            </Button>
          )}
          
          {onRetry && status === 'FAILED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRetry(id)}
              title="Retry processing"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              🔄
            </Button>
          )}
          
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(id)}
              title="Delete document"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              🗑️
            </Button>
          )}
        </div>
      </div>
      
      {/* Quick stats */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>
            {tags.length > 0 ? `${tags.length} tags` : 'No tags'}
          </span>
          <span>
            {status === 'READY' && 'Ready for AI analysis'}
            {status === 'PROCESSING' && 'Processing document...'}
            {status === 'PENDING' && 'Waiting to be processed'}
            {status === 'FAILED' && 'Processing failed'}
          </span>
        </div>
      </div>
    </Card>
  )
}