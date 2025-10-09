"use client"

import useSWR from "swr"
import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function RoomSearch() {
  const [q, setQ] = useState("")
  const { data, isLoading, error } = useSWR<{ rooms: Array<{ id: string; name: string }> }>(
    `/api/rooms?q=${encodeURIComponent(q)}`,
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 2000 },
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          aria-label="Search rooms"
          placeholder="Search by name"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
        <button
          type="button"
          onClick={() => {
            /* noop, typing triggers SWR */
          }}
          className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Search
        </button>
      </div>

      <div className={cn("rounded-md border border-border", "divide-y divide-border")}>
        {error && <div className="p-3 text-sm text-destructive">Failed to load rooms</div>}
        {isLoading && <div className="p-3 text-sm text-muted-foreground">Loading…</div>}
        {!isLoading && data?.rooms?.length === 0 && (
          <div className="p-3 text-sm text-muted-foreground">No rooms found</div>
        )}
        {data?.rooms?.map((room) => (
          <Link
            key={room.id}
            href={`/rooms/${room.id}`}
            className="block px-3 py-2 hover:bg-accent hover:text-accent-foreground"
          >
            <span className="text-foreground">{room.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
