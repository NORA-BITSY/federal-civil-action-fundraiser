'use client'
import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { validateFileUpload } from '@/lib/policy/guard'

interface FileUploadProps {
  onUploadComplete?: (fileId: string, fileName: string) => void
  onUploadError?: (error: string) => void
  maxFileSize?: number // in bytes
  acceptedTypes?: string[]
  className?: string
}

export default function FileDropzone({
  onUploadComplete,
  onUploadError,
  maxFileSize = 50 * 1024 * 1024, // 50MB
  acceptedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  className = ''
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const validateAndUpload = useCallback(async (file: File) => {
    // Validate file
    const validation = validateFileUpload({
      name: file.name,
      size: file.size,
      type: file.type
    })

    if (!validation.valid) {
      onUploadError?.(validation.error || 'Invalid file')
      return
    }

    // Check accepted types
    if (!acceptedTypes.includes(file.type)) {
      onUploadError?.('File type not supported')
      return
    }

    // Check file size
    if (file.size > maxFileSize) {
      onUploadError?.(`File too large. Maximum size: ${Math.round(maxFileSize / 1024 / 1024)}MB`)
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Get signed upload URL
      const uploadResponse = await fetch('/api/vault/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          sizeBytes: file.size,
          mimeType: file.type
        })
      })

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json()
        throw new Error(error.error || 'Failed to prepare upload')
      }

      const { uploadUrl, fileId } = await uploadResponse.json()

      // Upload file to storage
      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          onUploadComplete?.(fileId, file.name)
          setSelectedFile(null)
        } else {
          onUploadError?.('Upload failed')
        }
        setUploading(false)
        setUploadProgress(0)
      })

      xhr.addEventListener('error', () => {
        onUploadError?.('Upload failed')
        setUploading(false)
        setUploadProgress(0)
      })

      xhr.open('PUT', uploadUrl)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.send(file)

    } catch (error) {
      console.error('Upload error:', error)
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed')
      setUploading(false)
      setUploadProgress(0)
    }
  }, [acceptedTypes, maxFileSize, onUploadComplete, onUploadError])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
    }
  }, [])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : uploading
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="space-y-3">
            <LoadingSpinner size="lg" />
            <div className="space-y-2">
              <p className="text-green-700 font-medium">Uploading {selectedFile?.name}</p>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-green-600">{uploadProgress}% complete</p>
            </div>
          </div>
        ) : selectedFile ? (
          <div className="space-y-3">
            <div className="text-4xl">📄</div>
            <div>
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
            <div className="flex justify-center gap-3">
              <Button onClick={() => validateAndUpload(selectedFile)}>
                Upload File
              </Button>
              <Button variant="outline" onClick={() => setSelectedFile(null)}>
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-4xl">📁</div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drop your documents here, or click to select
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supports: PDF, Word docs, Images • Max: {Math.round(maxFileSize / 1024 / 1024)}MB
              </p>
            </div>
            
            <input
              type="file"
              accept={acceptedTypes.join(',')}
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload-input"
            />
            <label htmlFor="file-upload-input">
              <Button variant="outline" className="cursor-pointer">
                Choose Files
              </Button>
            </label>
          </div>
        )}
      </div>

      {/* File Type Guide */}
      <div className="bg-gray-50 p-4 rounded text-sm text-gray-600">
        <h4 className="font-medium text-gray-900 mb-2">Recommended Document Types:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          <div>• Court orders & judgments</div>
          <div>• Service plans & reports</div>
          <div>• Hearing notices & transcripts</div>
          <div>• Medical & therapy records</div>
          <div>• Communication logs</div>
          <div>• Legal correspondence</div>
        </div>
        <p className="text-xs mt-2 text-gray-500">
          All documents are automatically encrypted and redacted for privacy protection.
        </p>
      </div>
    </div>
  )
}