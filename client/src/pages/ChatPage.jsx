import { ServerSidebar } from "../widgets/server-sidebar/ServerSidebar.jsx";
import { ChannelSidebar } from "../widgets/channel-sidebar/ChannelSidebar.jsx";
import { ChatArea } from "../widgets/chat-area/ChatArea.jsx";
import { MemberList } from "../widgets/member-list/MemberList.jsx";
import { CreateServerModal } from "../features/servers/CreateServerModal.jsx";
import { EditServerModal } from "../features/servers/EditServerModal.jsx";
import { JoinServerModal } from "../features/servers/JoinServerModal.jsx";
import { CreateChannelModal } from "../features/channels/CreateChannelModal.jsx";

export function ChatPage() {
  return (
    <main className="flex h-screen min-h-0 overflow-hidden bg-gray-900 text-white">
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
