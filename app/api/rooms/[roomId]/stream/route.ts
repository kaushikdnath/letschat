import type { NextRequest } from "next/server"
import { getChatStore } from "@/lib/chat-store"

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  }
}

export async function GET(req: NextRequest, { params }: { params: { roomId: string } }) {
  const store = getChatStore()
  const room = store.getRoom(params.roomId)
  if (!room) {
    return new Response("Room not found", { status: 404 })
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // Send initial batch
      const initial = store.getMessages(room.id, 100)
      send({ type: "init", room: { id: room.id, name: room.name }, messages: initial })

      // Subscribe to new messages
      const unsubscribe = store.subscribe(room.id, (payload) => {
        send(payload)
      })

      // Heartbeats to keep connection alive
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": heartbeat\n\n"))
      }, 15000)

      // Handle client disconnect
      const close = () => {
        clearInterval(heartbeat)
        unsubscribe()
        try {
          controller.close()
        } catch {}
      }

      req.signal.addEventListener("abort", close)
    },
    cancel() {
      // no-op; handled by abort
    },
  })

  return new Response(stream, {
    headers: sseHeaders(),
  })
}
