import Link from "next/link"
import CreateRoomForm from "@/components/create-room-form"
import RoomSearch from "@/components/room-search"

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground text-balance">TempChat</h1>
          <Link href="/" className="text-sm underline text-muted-foreground">
            Home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-6 grid gap-6 md:grid-cols-2">
        {/* Create a room */}
        <section className="rounded-lg border border-border bg-background">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-lg font-medium text-foreground">Create a room</h2>
          </div>
          <div className="px-4 py-4">
            <CreateRoomForm />
          </div>
        </section>

        {/* Find a room */}
        <section className="rounded-lg border border-border bg-background">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-lg font-medium text-foreground">Find a room</h2>
          </div>
          <div className="px-4 py-4">
            <RoomSearch />
          </div>
        </section>

        {/* How it works */}
        <section className="md:col-span-2 rounded-lg border border-border bg-background">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-lg font-medium text-foreground">How it works</h2>
          </div>
          <div className="px-4 py-4 text-sm text-muted-foreground space-y-2 leading-relaxed">
            <p>Rooms and chats are temporary and stored in memory only. If the server restarts, data resets.</p>
            <p>
              Create a room by name, share the URL, and start chatting. Others can find it by searching the room name.
            </p>
          </div>
        </section>
      </section>
    </main>
  )
}
