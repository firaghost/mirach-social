'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const [linkedInConnected, setLinkedInConnected] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkLinkedInConnection()
  }, [])

  const checkLinkedInConnection = () => {
    // Check if we have a LinkedIn token cookie
    const hasToken = document.cookie.includes('linkedin_token')
    setLinkedInConnected(hasToken)
  }

  const connectLinkedIn = () => {
    setLoading(true)
    window.location.href = '/api/auth/linkedin'
  }

  const disconnectLinkedIn = async () => {
    setLoading(true)
    // In a real app, you'd revoke the token on LinkedIn's side
    // For this MVP, we'll just clear the cookie
    document.cookie = 'linkedin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setLinkedInConnected(false)
    setLoading(false)
    alert('LinkedIn disconnected (cookie cleared).')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500">Manage your integrations and account</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Social Connections</h3>
        
        <div className="flex justify-between items-center py-4 border-b border-gray-100 last:border-b-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💼</span>
            <span className="font-medium text-gray-800">LinkedIn</span>
            <div className={`w-3 h-3 rounded-full ${linkedInConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <div>
            {!linkedInConnected ? (
              <button
                onClick={connectLinkedIn}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Connect'}
              </button>
            ) : (
              <button
                onClick={disconnectLinkedIn}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Disconnecting...' : 'Disconnect'}
              </button>
            )}
          </div>
        </div>

        {/* Other platforms can be added here */}
        <div className="flex justify-between items-center py-4 border-b border-gray-100 last:border-b-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐦</span>
            <span className="font-medium text-gray-800">Twitter</span>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          </div>
          <button disabled className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg cursor-not-allowed">
            Coming Soon
          </button>
        </div>

        <div className="flex justify-between items-center py-4 border-b border-gray-100 last:border-b-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📘</span>
            <span className="font-medium text-gray-800">Facebook</span>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          </div>
          <button disabled className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg cursor-not-allowed">
            Coming Soon
          </button>
        </div>

        <div className="flex justify-between items-center py-4 last:border-b-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📷</span>
            <span className="font-medium text-gray-800">Instagram</span>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          </div>
          <button disabled className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg cursor-not-allowed">
            Coming Soon
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Account Information</h3>
        <p className="text-gray-500">More account settings coming soon.</p>
      </div>
    </div>
  )
}
