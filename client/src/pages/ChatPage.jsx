import { ServerSidebar } from "../components/sidebar/ServerSidebar.jsx";
import { ChannelSidebar } from "../components/sidebar/ChannelSidebar.jsx";
import { ChatArea } from "../components/chat/ChatArea.jsx";
import { MemberList } from "../components/sidebar/MemberList.jsx";
import { CreateServerModal } from "../components/modals/servers/CreateServerModal.jsx";
import { EditServerModal } from "../components/modals/servers/EditServerModal.jsx";
import { JoinServerModal } from "../components/modals/servers/JoinServerModal.jsx";
import { CreateChannelModal } from "../components/modals/channels/CreateChannelModal.jsx";

export function ChatPage() {
  return (
    <main className="flex h-screen min-h-0 overflow-hidden bg-[#fff9e8] text-ink">
      <ServerSidebar />
      <ChannelSidebar />
      <ChatArea />
      <MemberList />
      <CreateServerModal />
      <EditServerModal />
      <JoinServerModal />
      <CreateChannelModal />
    </main>
  );
}
