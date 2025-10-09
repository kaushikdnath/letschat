"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"

type Message = {
  id: string
  roomId: string
  user: string
  text: string
  createdAt: number
}

type EventPayload =
  | { type: "init"; room: { id: string; name: string }; messages: Message[] }
  | { type: "message"; message: Message }
  | { type: "system"; text: string }

export default function ChatRoom({ roomId }: { roomId: string }) {
  const [username, setUsername] = useState<string>("")
  const [joined, setJoined] = useState<boolean>(false)
  const [inputName, setInputName] = useState<string>("")
  const [input, setInput] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [roomName, setRoomName] = useState<string>("")
  const [editingName, setEditingName] = useState<boolean>(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  // Load saved username
  useEffect(() => {
    const stored = localStorage.getItem(`tempchat:username`)
    if (stored) {
      setUsername(stored)
      setInputName(stored)
      setJoined(true)
    }
  }, [])

  // Auto scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Connect SSE when joined
  useEffect(() => {
    if (!joined) return
    const es = new EventSource(`/api/rooms/${roomId}/stream`)
    es.onmessage = (evt) => {
      try {
        const payload = JSON.parse(evt.data) as EventPayload
        if (payload.type === "init") {
          setMessages(payload.messages)
          setRoomName(payload.room?.name || "")
        } else if (payload.type === "message") {
          setMessages((prev) => {
            const msg = payload.message
            if (prev.some((m) => m.id === msg.id)) return prev
            return [...prev, msg]
          })
        }
      } catch {
        // ignore
      }
    }
    es.onerror = () => {
      // EventSource retries automatically
    }
    return () => es.close()
  }, [roomId, joined])

  async function sendMessage() {
    const text = input.trim()
    if (!text) return
    try {
      const res = await fetch(`/api/rooms/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: username || "Anonymous", text }),
      })
      const data = await res.json().catch(() => null)
      if (res.ok && data?.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev
          return [...prev, data.message]
        })
        setInput("")
      }
    } catch {
      // ignore
    }
  }

  function onJoin(e: React.FormEvent) {
    e.preventDefault()
    const name = inputName.trim()
    if (!name) return
    setUsername(name)
    localStorage.setItem(`tempchat:username`, name)
    setJoined(true)
  }

  const headerTitle = useMemo(() => {
    return roomName ? `Connected to: ${roomName}` : `Connected to room: ${roomId}`
  }, [roomName, roomId])

  return (
    <div className="mx-auto max-w-3xl px-4 py-4">
      <header className="mb-4 flex items-center justify-between">
        <Link href="/" className="text-sm underline text-muted-foreground">
          Back
        </Link>
        <h1 className="text-xl font-semibold text-foreground">{headerTitle}</h1>
        <div />
      </header>

      {!joined ? (
        <section className="rounded-lg border border-border bg-background">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-lg font-medium text-foreground">Choose a display name</h2>
          </div>
          <div className="px-4 py-4">
            <form onSubmit={onJoin} className="flex items-center gap-2">
              <input
                aria-label="Display name"
                placeholder="e.g. Alex"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              />
              <button
                type="submit"
                className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Join
              </button>
            </form>
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-border bg-background">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-lg font-medium text-foreground">Chat</h2>
          </div>

          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center justify-between rounded-md border border-border bg-background p-2">
              <div className="text-sm text-muted-foreground">
                You are: <span className="font-medium text-foreground">{username || "Anonymous"}</span>
              </div>
              {!editingName ? (
                <button
                  type="button"
                  onClick={() => {
                    setInputName(username)
                    setEditingName(true)
                  }}
                  className="rounded-md bg-secondary px-3 py-1.5 text-xs text-secondary-foreground transition-colors hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Change name
                </button>
              ) : (
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const name = inputName.trim()
                    if (!name) return
                    setUsername(name)
                    localStorage.setItem(`tempchat:username`, name)
                    setEditingName(false)
                  }}
                >
                  <input
                    aria-label="New display name"
                    placeholder="Enter new name"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    className="w-40 rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-2.5 py-1.5 text-xs text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingName(false)}
                    className="rounded-md bg-muted px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>

            <div className="h-[50vh] overflow-y-auto rounded-md border border-border p-3 bg-background">
              <ol className="space-y-2">
                {messages.map((m) => (
                  <li key={m.id} className="text-sm">
                    <span className="font-medium text-foreground">{m.user}</span>{" "}
                    <span className="text-muted-foreground">·</span>{" "}
                    <span className="text-muted-foreground">{new Date(m.createdAt).toLocaleTimeString()}</span>
                    <div className="text-foreground">{m.text}</div>
                  </li>
                ))}
                <div ref={bottomRef} />
              </ol>
            </div>

            <div className="flex items-center gap-2">
              <input
                aria-label="Message"
                placeholder="Type a message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              />
              <button
                type="button"
                onClick={sendMessage}
                className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Send
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
