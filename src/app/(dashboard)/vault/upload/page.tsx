import FileDropzone from '@/components/FileDropzone'
import { Card } from '@/components/ui/Card'
import { getContextualDisclaimer } from '@/lib/policy/disclaimers'

export const metadata = {
  title: 'Upload Documents | Chips Copilot',
  description: 'Upload and organize your case documents securely.'
}

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
          <p className="text-gray-600 mt-2">
            Securely add your case documents for AI analysis and organization
          </p>
        </div>

        {/* Upload Interface */}
        <Card className="p-6">
          <FileDropzone 
            onUploadComplete={(fileId, fileName) => {
              console.log('Upload complete:', fileId, fileName)
              // You could show a success notification here
            }}
            onUploadError={(error) => {
              console.error('Upload error:', error)
              // You could show an error notification here
            }}
          />
        </Card>

        {/* Privacy & Security Info */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            🔒 Privacy & Security Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h3 className="font-medium mb-1">Automatic Redaction</h3>
              <p>Names, phone numbers, and other PII are automatically detected and redacted</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Encrypted Storage</h3>
              <p>All documents are encrypted at rest and in transit</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">AI Processing</h3>
              <p>Documents are analyzed to extract timelines and key information</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Access Control</h3>
              <p>Only verified parents can access their own case documents</p>
            </div>
          </div>
        </Card>

        {/* Disclaimer */}
        <div className="text-xs text-gray-600 bg-gray-100 p-4 rounded">
          {getContextualDisclaimer('vault')}
        </div>
      </div>
    </div>
  )
}