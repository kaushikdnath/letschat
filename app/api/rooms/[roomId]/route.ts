import { NextResponse } from "next/server"
import { deleteRoom } from "@/lib/chat-store"

export async function DELETE(_req: Request, { params }: { params: { roomId: string } }) {
  const ok = deleteRoom(params.roomId)
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Room not found" }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
