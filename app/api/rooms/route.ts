import type { NextRequest } from "next/server"
import { getChatStore } from "@/lib/chat-store"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || undefined
  const rooms = getChatStore().findRooms(q)
  return Response.json({ rooms })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const name = (body?.name as string) || ""
    const room = getChatStore().createRoom(name)
    return Response.json({ room }, { status: 201 })
  } catch (e: any) {
    return Response.json({ error: e?.message || "Failed to create room" }, { status: 400 })
  }
}
