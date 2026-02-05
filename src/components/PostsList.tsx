'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Post {
  id: string
  content: string
  platform: string
  status: string
  scheduled_at: string | null
  posted_at: string | null
  created_at: string
}

export default function PostsList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [newContent, setNewContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('draft')

  useEffect(() => {
    fetchPosts()
  }, [activeTab])

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', activeTab)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching posts:', error)
      return
    }
    
    setPosts(data || [])
  }

  const createPost = async () => {
    if (!newContent.trim()) return
    
    setLoading(true)
    const { error } = await supabase
      .from('posts')
      .insert([{
        content: newContent,
        platform: 'linkedin',
        status: 'draft'
      }])
    
    setLoading(false)
    
    if (error) {
      alert('Error creating post: ' + error.message)
      return
    }
    
    setNewContent('')
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
      {/* Create New Post */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Create New Post</h2>
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Write your LinkedIn post here..."
          className="w-full p-3 border rounded-lg min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
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
                        disabled={loading}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {loading ? 'Posting...' : 'Post to LinkedIn'}
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
