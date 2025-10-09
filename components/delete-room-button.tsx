"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function DeleteRoomButton({ roomId }: { roomId: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function onDelete() {
    if (!roomId) return
    const confirmed = window.confirm("Delete this room? This cannot be undone.")
    if (!confirmed) return

    try {
      setPending(true)
      const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data?.error || "Failed to delete the room.")
        return
      }
      // Go back to home after deletion
      router.push("/")
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      className="inline-flex items-center rounded-md border border-(--border) bg-(--background) px-3 py-1.5 text-sm text-(--foreground) hover:bg-(--muted) disabled:opacity-50"
      aria-label="Delete room"
    >
      {pending ? "Deleting..." : "Delete room"}
    </button>
  )
}
