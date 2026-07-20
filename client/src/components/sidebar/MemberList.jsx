import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useGetServerQuery } from "../../api/server/serverApi.js";
import { getSocket } from "../../services/socketClient.js";

export function MemberList() {
  const currentServerId = useSelector((state) => state.workspace.currentServerId);
  const { data } = useGetServerQuery(currentServerId, { skip: !currentServerId });
  const members = data?.server?.members ?? [];
  const [onlineUserIds, setOnlineUserIds] = useState([]);

  useEffect(() => {
    if (!currentServerId) {
      setOnlineUserIds([]);
      return;
    }

    const socket = getSocket();
    socket.connect();

    socket.emit("presence:list", (response) => {
      if (response?.ok) {
        setOnlineUserIds(response.userIds);
      }
    });

    function handleOnline({ userId }) {
      setOnlineUserIds((userIds) => [...new Set([...userIds, userId])]);
    }

    function handleOffline({ userId }) {
      setOnlineUserIds((userIds) => userIds.filter((id) => id !== userId));
    }

    socket.on("presence:user-online", handleOnline);
    socket.on("presence:user-offline", handleOffline);

    return () => {
      socket.off("presence:user-online", handleOnline);
      socket.off("presence:user-offline", handleOffline);
    };
  }, [currentServerId]);

  return (
    <aside className="hidden w-60 shrink-0 bg-gray-800 p-4 lg:block">
      <h2 className="mb-4 text-xs font-bold uppercase text-gray-400">
        Members - {members.length}
      </h2>
      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.user._id} className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-700 text-sm font-bold">
              {member.user.username?.[0]?.toUpperCase()}
              {onlineUserIds.includes(member.user._id) && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-800 bg-emerald-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-100">{member.user.username}</p>
              <p className="text-xs capitalize text-gray-500">{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
