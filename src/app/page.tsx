import { ChatView } from "@/components/chat/chat-view";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen bg-background text-foreground font-body">
        <ChatView />
      </div>
    </SidebarProvider>
  );
}
