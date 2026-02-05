'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface Post {
  id: string
  content: string
  platform: string
  status: string
  scheduled_at: string | null
  posted_at: string | null
  created_at: string
  media?: Media[]
}

interface Media {
  id: string
  file_path: string
  file_type: string
}

export default function PostsList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [newContent, setNewContent] = useState('')
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('draft')
  const [linkedInConnected, setLinkedInConnected] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchPosts()
    checkLinkedInConnection()
  }, [activeTab])

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        media (*)
      `)
      .eq('status', activeTab)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching posts:', error)
      return
    }
    
    setPosts(data || [])
  }

  const checkLinkedInConnection = () => {
    // Check if we have a LinkedIn token cookie
    const hasToken = document.cookie.includes('linkedin_token')
    setLinkedInConnected(hasToken)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Limit to 5 images
    if (files.length + selectedImages.length > 5) {
      alert('Maximum 5 images allowed')
      return
    }
    
    setSelectedImages(prev => [...prev, ...files])
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async (postId: string): Promise<string[]> => {
    const uploadedUrls: string[] = []
    
    for (const image of selectedImages) {
      const formData = new FormData()
      formData.append('file', image)
      formData.append('postId', postId)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        uploadedUrls.push(data.url)
      } else {
        console.error('Failed to upload image:', image.name)
      }
    }
    
    return uploadedUrls
  }

  const createPost = async () => {
    if (!newContent.trim()) return
    
    setLoading(true)
    
    // First create the post
    const { data: post, error } = await supabase
      .from('posts')
      .insert([{
        content: newContent,
        platform: 'linkedin',
        status: 'draft'
      }])
      .select()
      .single()
    
    if (error) {
      alert('Error creating post: ' + error.message)
      setLoading(false)
      return
    }
    
    // Upload images if any
    if (selectedImages.length > 0) {
      await uploadImages(post.id)
    }
    
    setLoading(false)
    setNewContent('')
    setSelectedImages([])
    setImagePreviews([])
    fetchPosts()
  }

  const approvePost = async (id: string) => {
    const { error } = await supabase
      .from('posts')
      .update({ status: 'approved' })
      .eq('id', id)
    
    if (error) {
      alert('Error approving post: ' + error.message)
      return
    }
    
    fetchPosts()
  }

  const postToLinkedIn = async (id: string) => {
    if (!linkedInConnected) {
      alert('Please connect LinkedIn first!')
      window.location.href = '/api/auth/linkedin'
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/post-linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: id })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to post')
      }
      
      alert('Posted successfully to LinkedIn!')
      fetchPosts()
    } catch (err: any) {
      alert('Error posting: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const connectLinkedIn = () => {
    window.location.href = '/api/auth/linkedin'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'posted': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* LinkedIn Connection Status */}
      <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${linkedInConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="font-medium">
            LinkedIn {linkedInConnected ? 'Connected' : 'Not Connected'}
          </span>
        </div>
        {!linkedInConnected && (
          <button
            onClick={connectLinkedIn}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Connect LinkedIn
          </button>
        )}
      </div>

      {/* Create New Post */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Create New Post</h2>
        
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Write your LinkedIn post here..."
          className="w-full p-3 border rounded-lg min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {/* Image Preview */}
        {imagePreviews.length > 0 && (
          <div className="mt-4 flex gap-2 flex-wrap">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Image Upload Button */}
        <div className="mt-4 flex items-center gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            multiple
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            📎 Add Images ({selectedImages.length}/5)
          </button>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {newContent.length} characters
          </span>
          <button
            onClick={createPost}
            disabled={loading || !newContent.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex -mb-px">
            {['draft', 'pending_approval', 'approved', 'posted'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </nav>
        </div>

        {/* Posts List */}
        <div className="p-6">
          {posts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No posts in this status</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(post.status)}`}>
                      {post.status.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-800 whitespace-pre-wrap mb-4">{post.content}</p>
                  
                  {/* Display attached images */}
                  {post.media && post.media.length > 0 && (
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {post.media.map((media, index) => (
                        <img
                          key={index}
                          src={media.file_path}
                          alt={`Attached ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {post.status === 'draft' && (
                      <>
                        <button
                          onClick={() => approvePost(post.id)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Approve
                        </button>
                      </>
                    )}
                    
                    {post.status === 'approved' && (
                      <button
                        onClick={() => postToLinkedIn(post.id)}
                        disabled={loading || !linkedInConnected}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {!linkedInConnected ? 'Connect LinkedIn First' : loading ? 'Posting...' : 'Post to LinkedIn'}
                      </button>
                    )}
                    
                    {post.status === 'posted' && post.posted_at && (
                      <span className="text-sm text-green-600">
                        ✓ Posted on {new Date(post.posted_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
