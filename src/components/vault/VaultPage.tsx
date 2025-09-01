'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import DocCard from '@/components/DocCard'

interface VaultFile {
  id: string
  name: string
  sizeBytes: number
  mimeType: string
  tags: string[]
  piiRedacted: boolean
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED'
  processingError?: string
  createdAt: Date
  updatedAt: Date
}

interface VaultPageProps {
  files: VaultFile[]
  tags: Array<{ tag: string; count: number }>
  totalFiles: number
}

export default function VaultPage({ files, tags, totalFiles }: VaultPageProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredFiles, setFilteredFiles] = useState(files)

  // Filter files based on selected tag and search query
  const applyFilters = (tagFilter?: string, searchFilter?: string) => {
    let filtered = files

    if (tagFilter) {
      filtered = filtered.filter(file => file.tags.includes(tagFilter))
    }

    if (searchFilter) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchFilter.toLowerCase())
      )
    }

    setFilteredFiles(filtered)
  }

  const handleTagFilter = (tag: string | null) => {
    setSelectedTag(tag)
    applyFilters(tag || undefined, searchQuery || undefined)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    applyFilters(selectedTag || undefined, query || undefined)
  }

  const getStorageUsed = () => {
    const totalBytes = files.reduce((sum, file) => sum + file.sizeBytes, 0)
    const mb = totalBytes / (1024 * 1024)
    return mb.toFixed(1)
  }

  if (files.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📁</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Case Vault is Empty</h1>
            <p className="text-gray-600 mb-6">
              Upload your case documents to start organizing and analyzing your information.
            </p>
            <Link href="/vault/upload">
              <Button size="lg">Upload First Document</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Case Vault</h1>
            <p className="text-gray-600">
              {totalFiles} documents • {getStorageUsed()} MB used
            </p>
          </div>
          <Link href="/vault/upload">
            <Button>+ Upload Documents</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search */}
            <Card className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">Search</h3>
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Card>

            {/* Tags Filter */}
            <Card className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">Filter by Tag</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleTagFilter(null)}
                  className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedTag === null
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Documents ({totalFiles})
                </button>
                {tags.map(({ tag, count }) => (
                  <button
                    key={tag}
                    onClick={() => handleTagFilter(tag)}
                    className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      selectedTag === tag
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tag.replace('_', ' ')} ({count})
                  </button>
                ))}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Documents</span>
                  <span className="font-medium">{totalFiles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ready</span>
                  <span className="font-medium text-green-600">
                    {files.filter(f => f.status === 'READY').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing</span>
                  <span className="font-medium text-yellow-600">
                    {files.filter(f => f.status === 'PROCESSING' || f.status === 'PENDING').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Failed</span>
                  <span className="font-medium text-red-600">
                    {files.filter(f => f.status === 'FAILED').length}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content - Files Grid */}
          <div className="lg:col-span-3">
            {/* Filter Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="font-medium text-gray-900">
                  {selectedTag ? `${selectedTag.replace('_', ' ')} Documents` : 'All Documents'}
                </h2>
                <Badge variant="secondary">
                  {filteredFiles.length}
                </Badge>
              </div>
              
              {(selectedTag || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedTag(null)
                    setSearchQuery('')
                    setFilteredFiles(files)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Files Grid */}
            {filteredFiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFiles.map((file) => (
                  <DocCard
                    key={file.id}
                    id={file.id}
                    name={file.name}
                    sizeBytes={file.sizeBytes}
                    mimeType={file.mimeType}
                    tags={file.tags}
                    piiRedacted={file.piiRedacted}
                    status={file.status}
                    processingError={file.processingError}
                    createdAt={file.createdAt}
                    onView={(id) => {
                      // Navigate to document viewer
                      window.location.href = `/vault/doc/${id}`
                    }}
                    onEdit={(id) => {
                      // Open edit modal
                      console.log('Edit document:', id)
                    }}
                    onDelete={(id) => {
                      // Show delete confirmation
                      if (confirm('Are you sure you want to delete this document?')) {
                        // API call to delete
                        console.log('Delete document:', id)
                      }
                    }}
                    onRetry={async (id) => {
                      // Retry processing for failed files
                      try {
                        const response = await fetch(`/api/vault/status/${id}`, {
                          method: 'POST'
                        })
                        if (response.ok) {
                          // Refresh page or update state
                          window.location.reload()
                        } else {
                          alert('Failed to retry processing')
                        }
                      } catch (error) {
                        console.error('Retry error:', error)
                        alert('Failed to retry processing')
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                <p>Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}