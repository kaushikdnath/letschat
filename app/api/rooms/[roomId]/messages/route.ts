import type { NextRequest } from "next/server"
import { getChatStore } from "@/lib/chat-store"

export async function POST(req: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const body = await req.json().catch(() => ({}))
    const user = (body?.user as string) || "Anonymous"
    const text = (body?.text as string) || ""
    const msg = getChatStore().addMessage(params.roomId, user, text)
    return Response.json({ message: msg }, { status: 201 })
  } catch (e: any) {
    return Response.json({ error: e?.message || "Failed to send message" }, { status: 400 })
  }
}
