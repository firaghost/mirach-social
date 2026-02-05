'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface SidebarProps {
  linkedInConnected: boolean
}

export default function Sidebar({ linkedInConnected }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    { href: '/', icon: '📋', label: 'Queue', badge: null },
    { href: '/calendar', icon: '📅', label: 'Calendar', badge: null },
    { href: '/composer', icon: '✏️', label: 'Composer', badge: null },
    { href: '/analytics', icon: '📊', label: 'Analytics', badge: null },
    { href: '/settings', icon: '⚙️', label: 'Settings', badge: linkedInConnected ? null : '!' },
  ]

  return (
    <aside className={`bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="font-bold text-gray-900">MIRACH</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-100 rounded-lg"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              pathname === item.href
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {!isCollapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
        ))}
      </nav>

      {/* Connected Accounts */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase mb-3">Connected</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${linkedInConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={linkedInConnected ? 'text-gray-700' : 'text-gray-400'}>
                LinkedIn
              </span>
            </div>
          </div>
        </div>
      )}

      {/* User */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
            F
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Fira</p>
              <p className="text-xs text-gray-500 truncate">Admin</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
