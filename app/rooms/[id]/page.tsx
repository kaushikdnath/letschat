import ChatRoom from "@/components/chat-room"
import DeleteRoomButton from "@/components/delete-room-button"

export default function RoomPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-dvh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <p className="text-sm text-foreground">
            Connected to room: <span className="font-medium">{params.id}</span>
          </p>
          <DeleteRoomButton roomId={params.id} />
        </div>
      </header>
      <ChatRoom roomId={params.id} />
    </main>
  )
}
