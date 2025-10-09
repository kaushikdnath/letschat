export type Room = {
  id: string
  name: string
  createdAt: number
}

export type Message = {
  id: string
  roomId: string
  user: string
  text: string
  createdAt: number
}

type EventPayload =
  | { type: "init"; messages: Message[] }
  | { type: "message"; message: Message }
  | { type: "system"; text: string }

class ChatStore {
  private rooms = new Map<string, Room>()
  private roomNameIndex = new Map<string, string>() // lowercased name -> id
  private messages = new Map<string, Message[]>() // roomId -> messages
  private subscribers = new Map<string, Set<(payload: EventPayload) => void>>() // roomId -> listeners

  createRoom(name: string): Room {
    const trimmed = name.trim()
    if (!trimmed) {
      throw new Error("Room name is required")
    }
    const key = trimmed.toLowerCase()
    const existingId = this.roomNameIndex.get(key)
    if (existingId) {
      // Return existing (idempotent create)
      const existing = this.rooms.get(existingId)!
      return existing
    }
    const id = crypto.randomUUID()
    const room: Room = { id, name: trimmed, createdAt: Date.now() }
    this.rooms.set(id, room)
    this.roomNameIndex.set(key, id)
    this.messages.set(id, [])
    this.subscribers.set(id, new Set())
    return room
  }

  findRooms(query?: string, limit = 50): Room[] {
    const q = (query || "").trim().toLowerCase()
    const all = Array.from(this.rooms.values()).sort((a, b) => b.createdAt - a.createdAt)
    if (!q) return all.slice(0, limit)
    return all.filter((r) => r.name.toLowerCase().includes(q)).slice(0, limit)
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId)
  }

  addMessage(roomId: string, user: string, text: string): Message {
    const room = this.rooms.get(roomId)
    if (!room) {
      throw new Error("Room not found")
    }
    const trimmed = text.trim()
    if (!trimmed) {
      throw new Error("Message cannot be empty")
    }
    const msg: Message = {
      id: crypto.randomUUID(),
      roomId,
      user: user.trim() || "Anonymous",
      text: trimmed,
      createdAt: Date.now(),
    }
    const arr = this.messages.get(roomId)!
    arr.push(msg)
    // Keep last 200 messages per room to limit memory
    if (arr.length > 200) {
      arr.splice(0, arr.length - 200)
    }
    this.emit(roomId, { type: "message", message: msg })
    return msg
  }

  getMessages(roomId: string, limit = 100): Message[] {
    const arr = this.messages.get(roomId) || []
    return arr.slice(-limit)
  }

  subscribe(roomId: string, cb: (payload: EventPayload) => void): () => void {
    const set = this.subscribers.get(roomId)
    if (!set) {
      throw new Error("Room not found")
    }
    set.add(cb)
    return () => {
      set.delete(cb)
    }
  }

  private emit(roomId: string, payload: EventPayload) {
    const set = this.subscribers.get(roomId)
    if (!set || set.size === 0) return
    for (const cb of set) {
      try {
        cb(payload)
      } catch {
        // ignore subscriber errors
      }
    }
  }
}

let _store: ChatStore | null = null

export function getChatStore(): ChatStore {
  if (!_store) {
    _store = new ChatStore()
  }
  return _store
}
