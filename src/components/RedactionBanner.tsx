interface RedactionBannerProps {
  redactionMap?: any
  fields?: string[]
  className?: string
  onShowDetails?: () => void
}

export default function RedactionBanner({ 
  redactionMap, 
  fields = [], 
  className = '',
  onShowDetails 
}: RedactionBannerProps) {
  // Extract redacted field types from redaction map
  const getRedactedTypes = () => {
    if (redactionMap?.redactionsByType) {
      return Object.keys(redactionMap.redactionsByType)
    }
    return fields
  }

  const redactedTypes = getRedactedTypes()
  const redactionCount = redactionMap?.redactionCount || 0

  if (redactionCount === 0 && redactedTypes.length === 0) {
    return null
  }

  const getFieldDisplayName = (field: string): string => {
    const fieldNames = {
      'NAME': 'Names',
      'SSN': 'Social Security Numbers',
      'PHONE': 'Phone Numbers',
      'EMAIL': 'Email Addresses',
      'ADDRESS': 'Addresses',
      'POTENTIAL_NAME': 'Potential Names'
    }
    return fieldNames[field as keyof typeof fieldNames] || field.replace('_', ' ')
  }

  const getFieldIcon = (field: string): string => {
    const fieldIcons = {
      'NAME': '👤',
      'SSN': '🆔',
      'PHONE': '📞',
      'EMAIL': '📧',
      'ADDRESS': '🏠',
      'POTENTIAL_NAME': '👤'
    }
    return fieldIcons[field as keyof typeof fieldIcons] || '🔒'
  }

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-2xl">🔒</div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-amber-900">Privacy Protection Active</h3>
            <span className="bg-amber-200 text-amber-800 px-2 py-0.5 rounded text-xs font-medium">
              {redactionCount} redactions
            </span>
          </div>
          
          <p className="text-amber-800 text-sm mb-3">
            Personal information has been automatically identified and redacted to protect your privacy. 
            This document is now safe for AI analysis and secure sharing.
          </p>

          {redactedTypes.length > 0 && (
            <div className="space-y-2">
              <p className="text-amber-800 text-sm font-medium">Protected information:</p>
              <div className="flex flex-wrap gap-2">
                {redactedTypes.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs"
                  >
                    <span>{getFieldIcon(type)}</span>
                    <span>{getFieldDisplayName(type)}</span>
                    {redactionMap?.redactionsByType?.[type] && (
                      <span className="bg-amber-200 text-amber-900 px-1 py-0.5 rounded font-medium">
                        {redactionMap.redactionsByType[type]}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-amber-700">
              ✓ Original document unchanged • ✓ Only redacted version used for AI analysis
            </div>
            
            {onShowDetails && (
              <button
                onClick={onShowDetails}
                className="text-xs text-amber-700 hover:text-amber-900 underline"
              >
                View details
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Security Features */}
      <div className="mt-4 pt-3 border-t border-amber-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-amber-700">
          <div className="flex items-center gap-2">
            <span>🛡️</span>
            <span>Court-compliant redaction</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔐</span>
            <span>Encrypted storage</span>
          </div>
          <div className="flex items-center gap-2">
            <span>👨‍👩‍👧‍👦</span>
            <span>Minor privacy protected</span>
          </div>
        </div>
      </div>
    </div>
  )
}