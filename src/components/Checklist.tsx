import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface ChecklistItem {
  id: string
  title: string
  description?: string
  completed: boolean
  priority?: 'low' | 'medium' | 'high'
  dueDate?: Date
  category?: string
}

interface ChecklistProps {
  items: ChecklistItem[]
  onItemToggle?: (itemId: string, completed: boolean) => void
  onAddItem?: (item: Omit<ChecklistItem, 'id' | 'completed'>) => void
  showAddButton?: boolean
  className?: string
}

export function Checklist({ 
  items, 
  onItemToggle, 
  onAddItem,
  showAddButton = false,
  className = '' 
}: ChecklistProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({ title: '', description: '', priority: 'medium' as const })

  const sortedItems = items.sort((a, b) => {
    // Sort by completion (incomplete first), then by priority, then by due date
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const aPriority = priorityOrder[a.priority || 'medium']
    const bPriority = priorityOrder[b.priority || 'medium']
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }
    
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime()
    }
    
    return 0
  })

  const handleAddItem = () => {
    if (newItem.title.trim()) {
      onAddItem?.({
        title: newItem.title.trim(),
        description: newItem.description.trim() || undefined,
        priority: newItem.priority
      })
      setNewItem({ title: '', description: '', priority: 'medium' })
      setShowAddForm(false)
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const isOverdue = (dueDate?: Date) => {
    return dueDate && new Date() > dueDate
  }

  if (items.length === 0 && !showAddButton) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <div className="text-4xl mb-2">✅</div>
        <p>No tasks yet. Upload documents to get personalized action items.</p>
      </div>
    )
  }

  const completedCount = items.filter(item => item.completed).length
  const totalCount = items.length

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress Summary */}
      {totalCount > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">Progress</h3>
            <span className="text-sm text-gray-600">
              {completedCount} of {totalCount} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Checklist Items */}
      <div className="space-y-2">
        {sortedItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-start gap-3 p-3 border rounded-lg transition-all ${
              item.completed 
                ? 'bg-green-50 border-green-200 opacity-75'
                : isOverdue(item.dueDate)
                ? 'bg-red-50 border-red-200'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            {/* Checkbox */}
            <button
              onClick={() => onItemToggle?.(item.id, !item.completed)}
              className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all ${
                item.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {item.completed && <span className="text-xs">✓</span>}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1">
                <h4 className={`font-medium text-sm ${
                  item.completed ? 'line-through text-gray-500' : 'text-gray-900'
                }`}>
                  {item.title}
                </h4>
                
                {/* Priority Badge */}
                {item.priority && (
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                )}
              </div>

              {/* Description */}
              {item.description && (
                <p className={`text-sm ${
                  item.completed ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {item.description}
                </p>
              )}

              {/* Due Date & Category */}
              <div className="flex items-center gap-3 mt-1">
                {item.dueDate && (
                  <span className={`text-xs ${
                    isOverdue(item.dueDate) && !item.completed
                      ? 'text-red-600 font-medium'
                      : 'text-gray-500'
                  }`}>
                    📅 {item.dueDate.toLocaleDateString()}
                    {isOverdue(item.dueDate) && !item.completed && ' (overdue)'}
                  </span>
                )}
                
                {item.category && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Form */}
      {showAddButton && (
        <div className="border-t pt-4">
          {showAddForm ? (
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <input
                type="text"
                placeholder="Task title"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Description (optional)"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                rows={2}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center justify-between">
                <select
                  value={newItem.priority}
                  onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleAddItem} disabled={!newItem.title.trim()}>
                    Add Task
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setShowAddForm(true)} className="w-full">
              + Add Task
            </Button>
          )}
        </div>
      )}
    </div>
  )
}