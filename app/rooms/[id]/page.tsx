import ChatRoom from "@/components/chat-room"

export default function RoomPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-dvh bg-background">
      <ChatRoom roomId={params.id} />
    </main>
  )
}
