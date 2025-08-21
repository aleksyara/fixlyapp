'use client'

import { useState } from 'react'

export default function TestPage() {
  const [msg, setMsg] = useState<string>('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMsg('Submitting...')

    const payload = { foo: 'bar' }

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Booking failed')
      setMsg('Success: ' + JSON.stringify(json))
    } catch (err: any) {
      setMsg('Error: ' + err.message)
    }
  }

  return (
    <div className="p-8">
      <form onSubmit={handleSubmit}>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Test API
        </button>
      </form>
      <p className="mt-4">{msg}</p>
    </div>
  )
}
