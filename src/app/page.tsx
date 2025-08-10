import { ChatView } from "@/components/chat/chat-view";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <SidebarProvider>
      <ChatView />
    </SidebarProvider>
  );
}
