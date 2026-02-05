'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    posted: 0,
    scheduled: 0,
    drafts: 0,
    byPlatform: {} as Record<string, number>,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')

    if (error) {
      console.error('Error fetching stats:', error)
      return
    }

    const byPlatform: Record<string, number> = {}
    posts?.forEach((post) => {
      byPlatform[post.platform] = (byPlatform[post.platform] || 0) + 1
    })

    setStats({
      totalPosts: posts?.length || 0,
      posted: posts?.filter((p) => p.status === 'posted').length || 0,
      scheduled: posts?.filter((p) => p.status === 'scheduled').length || 0,
      drafts: posts?.filter((p) => p.status === 'draft').length || 0,
      byPlatform,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-500">Track your social media performance</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Total Posts', value: stats.totalPosts, color: 'bg-blue-500' },
          { label: 'Published', value: stats.posted, color: 'bg-green-500' },
          { label: 'Scheduled', value: stats.scheduled, color: 'bg-yellow-500' },
          { label: 'Drafts', value: stats.drafts, color: 'bg-gray-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl mb-4`}>
              📊
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Posts by Platform</h3>
        
        <div className="space-y-4">
          {Object.entries(stats.byPlatform).map(([platform, count]) => (
            <div key={platform} className="flex items-center gap-4">
              <div className="w-32 capitalize font-medium">{platform}</div>
              <div className="flex-1 bg-gray-100 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full transition-all"
                  style={{
                    width: `${(count / stats.totalPosts) * 100}%`,
                  }}
                />
              </div>
              <div className="w-12 text-right font-medium">{count}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
        <p className="text-gray-500">Analytics features coming soon! Track engagement, reach, and more.</p>
      </div>
    </div>
  )
}
