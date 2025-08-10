import { ChatView } from "@/components/chat/chat-view";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <ChatView />
    </div>
  );
}
