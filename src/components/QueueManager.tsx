'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface QueueItem {
  id: string
  content: string
  platform: string
  status: string
  scheduled_at: string | null
  created_at: string
  media?: { id: string; file_path: string }[]
}

export default function QueueManager() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchQueue()
  }, [filter])

  const fetchQueue = async () => {
    setLoading(true)
    
    let query = supabase
      .from('posts')
      .select(`
        *,
        media (*)
      `)
      .order('scheduled_at', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching queue:', error)
      return
    }

    setQueue(data || [])
    setLoading(false)
  }

  const deletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting post')
      return
    }

    fetchQueue()
  }

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      linkedin: '💼',
      twitter: '🐦',
      facebook: '📘',
      instagram: '📷',
    }
    return icons[platform] || '📱'
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      scheduled: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      posted: 'bg-purple-100 text-purple-700',
      failed: 'bg-red-100 text-red-700',
    }
    return styles[status] || 'bg-gray-100 text-gray-700'
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Not scheduled'
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Queue</h2>
          <p className="text-gray-500">Manage your upcoming posts</p>
        </div>

        <div className="flex gap-2">
          {['all', 'draft', 'scheduled', 'posted'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Drafts', count: queue.filter(p => p.status === 'draft').length, color: 'bg-gray-100' },
          { label: 'Scheduled', count: queue.filter(p => p.status === 'scheduled').length, color: 'bg-blue-100' },
          { label: 'Approved', count: queue.filter(p => p.status === 'approved').length, color: 'bg-green-100' },
          { label: 'Posted', count: queue.filter(p => p.status === 'posted').length, color: 'bg-purple-100' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-lg p-4`}>
            <p className="text-2xl font-bold">{stat.count}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Queue List */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : queue.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">No posts in queue</p>
          <p className="text-gray-400 mt-2">Create your first post to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getPlatformIcon(post.platform)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(post.status)}`}>
                    {post.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{formatDate(post.scheduled_at)}</span>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <p className="mt-4 text-gray-800 whitespace-pre-wrap line-clamp-3">{post.content}</p>

              {post.media && post.media.length > 0 && (
                <div className="mt-4 flex gap-2">
                  {post.media.map((m, i) => (
                    <img
                      key={i}
                      src={m.file_path}
                      alt=""
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {post.status === 'draft' && (
                <div className="mt-4 flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Edit
                  </button>
                  <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    Approve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
