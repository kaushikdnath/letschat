"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateRoomForm() {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const trimmed = name.trim()
    if (!trimmed) {
      setError("Room name is required")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to create")
      router.push(`/rooms/${data.room.id}`)
    } catch (err: any) {
      setError(err?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input
        aria-label="Room name"
        placeholder="Enter room name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
        className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
      <button
        type="submit"
        disabled={loading}
        className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {loading ? "Creating…" : "Create"}
      </button>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </form>
  )
}
