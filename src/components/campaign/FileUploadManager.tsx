'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Upload, 
  FileText, 
  Image, 
  Video, 
  X, 
  Check, 
  AlertCircle,
  Download,
  Trash2,
  Eye
} from 'lucide-react'
import { campaignFileManager, campaignFileHelpers, FileUploadResult } from '@/lib/campaign/file-manager'

interface FileUploadManagerProps {
  campaignId: string
  onFilesUploaded?: (type: string, results: FileUploadResult[]) => void
}

interface FileItem {
  file: File
  preview?: string
  title: string
  caption?: string
  description?: string
  uploadStatus: 'pending' | 'uploading' | 'success' | 'error'
  uploadResult?: FileUploadResult
  progress: number
}

export function FileUploadManager({ campaignId, onFilesUploaded }: FileUploadManagerProps) {
  const [activeTab, setActiveTab] = useState('images')
  const [imageFiles, setImageFiles] = useState<FileItem[]>([])
  const [videoFiles, setVideoFiles] = useState<FileItem[]>([])
  const [documentFiles, setDocumentFiles] = useState<FileItem[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)

  const getFiles = (type: string): FileItem[] => {
    switch (type) {
      case 'images': return imageFiles
      case 'videos': return videoFiles
      case 'documents': return documentFiles
      default: return []
    }
  }

  const setFiles = (type: string, files: FileItem[]) => {
    switch (type) {
      case 'images': setImageFiles(files); break
      case 'videos': setVideoFiles(files); break
      case 'documents': setDocumentFiles(files); break
    }
  }

  const handleFileSelect = async (type: 'images' | 'videos' | 'documents', files: FileList | null) => {
    if (!files) return

    const newFiles: FileItem[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileItem: FileItem = {
        file,
        title: file.name.replace(/\.[^/.]+$/, ''),
        uploadStatus: 'pending',
        progress: 0
      }

      // Create preview for images
      if (type === 'images' && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          fileItem.preview = e.target?.result as string
          setFiles(type, [...getFiles(type), fileItem])
        }
        reader.readAsDataURL(file)
      } else {
        newFiles.push(fileItem)
      }
    }

    if (newFiles.length > 0) {
      setFiles(type, [...getFiles(type), ...newFiles])
    }
  }

  const updateFileItem = (type: string, index: number, updates: Partial<FileItem>) => {
    const files = getFiles(type)
    const updatedFiles = [...files]
    updatedFiles[index] = { ...updatedFiles[index], ...updates }
    setFiles(type, updatedFiles)
  }

  const removeFile = (type: string, index: number) => {
    const files = getFiles(type)
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(type, updatedFiles)
  }

  const uploadFiles = async (type: 'images' | 'videos' | 'documents') => {
    const files = getFiles(type).filter(f => f.uploadStatus === 'pending')
    if (files.length === 0) return

    setIsUploading(true)

    try {
      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i]
        const fileIndex = getFiles(type).findIndex(f => f.file === fileItem.file)

        updateFileItem(type, fileIndex, { uploadStatus: 'uploading', progress: 0 })

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          updateFileItem(type, fileIndex, { 
            progress: Math.min(fileItem.progress + Math.random() * 30, 90) 
          })
        }, 200)

        try {
          const result = await campaignFileManager.uploadFile(
            campaignId,
            fileItem.file,
            type,
            {
              title: fileItem.title,
              caption: fileItem.caption,
              description: fileItem.description
            }
          )

          clearInterval(progressInterval)

          updateFileItem(type, fileIndex, {
            uploadStatus: result.success ? 'success' : 'error',
            uploadResult: result,
            progress: 100
          })

          if (result.success && onFilesUploaded) {
            onFilesUploaded(type, [result])
          }
        } catch (error) {
          clearInterval(progressInterval)
          updateFileItem(type, fileIndex, {
            uploadStatus: 'error',
            progress: 0
          })
        }
      }
    } finally {
      setIsUploading(false)
    }
  }

  const renderFileList = (type: 'images' | 'videos' | 'documents') => {
    const files = getFiles(type)
    const icon = type === 'images' ? Image : type === 'videos' ? Video : FileText

    if (files.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            {React.createElement(icon, { className: 'h-12 w-12' })}
          </div>
          <p className="text-gray-500">No {type} selected</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {files.map((fileItem, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start space-x-4">
              {/* File Preview/Icon */}
              <div className="flex-shrink-0">
                {fileItem.preview ? (
                  <img 
                    src={fileItem.preview} 
                    alt="Preview" 
                    className="h-16 w-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {React.createElement(icon, { className: 'h-8 w-8 text-gray-400' })}
                  </div>
                )}
              </div>

              {/* File Details */}
              <div className="flex-1 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Input
                      value={fileItem.title}
                      onChange={(e) => updateFileItem(type, index, { title: e.target.value })}
                      placeholder="Enter title"
                      className="font-medium"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(type, index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {type === 'images' && (
                    <Input
                      value={fileItem.caption || ''}
                      onChange={(e) => updateFileItem(type, index, { caption: e.target.value })}
                      placeholder="Enter caption (optional)"
                    />
                  )}

                  <Textarea
                    value={fileItem.description || ''}
                    onChange={(e) => updateFileItem(type, index, { description: e.target.value })}
                    placeholder="Enter description (optional)"
                    rows={2}
                  />
                </div>

                {/* Upload Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={
                        fileItem.uploadStatus === 'success' ? 'default' :
                        fileItem.uploadStatus === 'error' ? 'destructive' :
                        fileItem.uploadStatus === 'uploading' ? 'secondary' : 'outline'
                      }
                    >
                      {fileItem.uploadStatus === 'success' && <Check className="h-3 w-3 mr-1" />}
                      {fileItem.uploadStatus === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {fileItem.uploadStatus === 'uploading' && 'Uploading...'}
                      {fileItem.uploadStatus === 'success' && 'Uploaded'}
                      {fileItem.uploadStatus === 'error' && 'Failed'}
                      {fileItem.uploadStatus === 'pending' && 'Ready to upload'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>

                  {fileItem.uploadStatus === 'success' && fileItem.uploadResult && (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {fileItem.uploadStatus === 'uploading' && (
                  <Progress value={fileItem.progress} className="w-full" />
                )}

                {/* Error Message */}
                {fileItem.uploadStatus === 'error' && fileItem.uploadResult?.error && (
                  <p className="text-sm text-red-600">{fileItem.uploadResult.error}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>File Management</CardTitle>
          <CardDescription>
            Upload and manage images, videos, and documents for your campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="images">
                <Image className="h-4 w-4 mr-2" />
                Images
              </TabsTrigger>
              <TabsTrigger value="videos">
                <Video className="h-4 w-4 mr-2" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </TabsTrigger>
            </TabsList>

            {/* Images Tab */}
            <TabsContent value="images" className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  ref={imageInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileSelect('images', e.target.files)}
                  className="hidden"
                />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">Upload Images</p>
                <p className="text-sm text-gray-600 mb-4">
                  PNG, JPG, GIF up to 10MB each. Maximum 20 images.
                </p>
                <Button onClick={() => imageInputRef.current?.click()}>
                  Select Images
                </Button>
              </div>

              {renderFileList('images')}

              {imageFiles.some(f => f.uploadStatus === 'pending') && (
                <Button 
                  onClick={() => uploadFiles('images')} 
                  disabled={isUploading}
                  className="w-full"
                >
                  Upload Images
                </Button>
              )}
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos" className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  ref={videoInputRef}
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={(e) => handleFileSelect('videos', e.target.files)}
                  className="hidden"
                />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">Upload Videos</p>
                <p className="text-sm text-gray-600 mb-4">
                  MP4, WebM, MOV up to 100MB each. Maximum 5 videos.
                </p>
                <Button onClick={() => videoInputRef.current?.click()}>
                  Select Videos
                </Button>
              </div>

              {renderFileList('videos')}

              {videoFiles.some(f => f.uploadStatus === 'pending') && (
                <Button 
                  onClick={() => uploadFiles('videos')} 
                  disabled={isUploading}
                  className="w-full"
                >
                  Upload Videos
                </Button>
              )}
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  ref={documentInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                  onChange={(e) => handleFileSelect('documents', e.target.files)}
                  className="hidden"
                />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">Upload Documents</p>
                <p className="text-sm text-gray-600 mb-4">
                  PDF, DOC, DOCX, TXT, JPG, PNG up to 25MB each. Maximum 50 documents.
                </p>
                <Button onClick={() => documentInputRef.current?.click()}>
                  Select Documents
                </Button>
              </div>

              {renderFileList('documents')}

              {documentFiles.some(f => f.uploadStatus === 'pending') && (
                <Button 
                  onClick={() => uploadFiles('documents')} 
                  disabled={isUploading}
                  className="w-full"
                >
                  Upload Documents
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}