import React from 'react'

type Props = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SettingsPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : undefined
  const linkedInConnected = params?.linkedin_connected === 'true'

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      {linkedInConnected ? (
        <div className="rounded-md p-4 bg-green-50 text-green-800">
          LinkedIn successfully connected.
        </div>
      ) : (
        <div className="text-gray-700">No recent connection activity.</div>
      )}
    </main>
  )
}
