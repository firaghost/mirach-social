'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useDropzone } from 'react-dropzone'

interface ComposerProps {
  onPostCreated?: () => void
}

export default function Composer({ onPostCreated }: ComposerProps) {
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin'])
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-600' },
    { id: 'twitter', name: 'Twitter', icon: '🐦', color: 'bg-sky-500' },
    { id: 'facebook', name: 'Facebook', icon: '📘', color: 'bg-blue-700' },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  ]

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > 4) {
      alert('Maximum 4 images allowed')
      return
    }

    setImages(prev => [...prev, ...acceptedFiles])
    
    acceptedFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }, [images.length])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxSize: 5242880, // 5MB
  })

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  const getCharacterCount = () => {
    const counts: Record<string, number> = {
      linkedin: 3000,
      twitter: 280,
      facebook: 63206,
      instagram: 2200,
    }
    return selectedPlatforms.map(p => `${content.length}/${counts[p] || 3000} ${p}`).join(' | ')
  }

  const isOverLimit = () => {
    const limits: Record<string, number> = {
      linkedin: 3000,
      twitter: 280,
    }
    return selectedPlatforms.some(p => content.length > (limits[p] || Infinity))
  }

  const handleSubmit = async () => {
    if (!content.trim() || selectedPlatforms.length === 0) return

    setLoading(true)

    try {
      // Create posts for each platform
      for (const platform of selectedPlatforms) {
        const scheduledAt = scheduleDate && scheduleTime
          ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
          : null

        const { data: post, error } = await supabase
          .from('posts')
          .insert([{
            content,
            platform,
            status: scheduledAt ? 'scheduled' : 'draft',
            scheduled_at: scheduledAt,
          }])
          .select()
          .single()

        if (error) throw error

        // Upload images
        if (images.length > 0) {
          for (const image of images) {
            const formData = new FormData()
            formData.append('file', image)
            formData.append('postId', post.id)

            await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            })
          }
        }
      }

      // Reset form
      setContent('')
      setImages([])
      setPreviews([])
      setScheduleDate('')
      setScheduleTime('')

      onPostCreated?.()
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Create Post</h2>
        <p className="text-sm text-gray-500">Compose and schedule your content</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Platform Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Platforms</label>
          <div className="flex flex-wrap gap-2">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  selectedPlatforms.includes(platform.id)
                    ? `border-transparent ${platform.color} text-white`
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{platform.icon}</span>
                <span className="font-medium">{platform.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-4 border border-gray-200 rounded-lg min-h-[200px] focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
          <div className={`mt-2 text-sm ${isOverLimit() ? 'text-red-500' : 'text-gray-500'}`}>
            {getCharacterCount()}
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Media</label>
          
          {previews.length > 0 && (
            <div className="flex gap-3 mb-3 flex-wrap">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-gray-600">
              {isDragActive ? 'Drop images here...' : 'Drag & drop images, or click to select'}
            </p>
            <p className="text-sm text-gray-400 mt-1">Max 4 images, 5MB each</p>
          </div>
        </div>

        {/* Scheduling */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date</label>
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Time</label>
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Preview Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="preview"
            checked={showPreview}
            onChange={(e) => setShowPreview(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <label htmlFor="preview" className="text-sm text-gray-700">Show Preview</label>
        </div>

        {/* Preview */}
        {showPreview && content && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="whitespace-pre-wrap text-gray-800">{content}</p>
              {previews.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {previews.slice(0, 4).map((preview, i) => (
                    <img key={i} src={preview} alt="" className="rounded-lg w-full h-32 object-cover" />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={loading || !content.trim() || selectedPlatforms.length === 0 || isOverLimit()}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading
              ? 'Saving...'
              : scheduleDate && scheduleTime
              ? 'Schedule Post'
              : 'Add to Queue'
            }
          </button>
        </div>
      </div>
    </div>
  )
}
