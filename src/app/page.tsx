import PostsList from '@/components/PostsList'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">🚀 MIRACH Social Manager</h1>
          <p className="text-gray-600">Draft, approve, and post content</p>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <PostsList />
      </div>
    </main>
  )
}
