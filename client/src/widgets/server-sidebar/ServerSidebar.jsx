import { LogIn, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useGetServersQuery } from "../../entities/server/serverApi.js";
import { setCurrentServerId } from "../../features/workspace/workspaceSlice.js";
import { openCreateServer, openJoinServer } from "../../features/ui/uiSlice.js";

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ServerSidebar() {
  const dispatch = useDispatch();
  const currentServerId = useSelector((state) => state.workspace.currentServerId);
  const { data } = useGetServersQuery();
  const servers = data?.servers ?? [];

  useEffect(() => {
    if (!currentServerId && servers.length > 0) {
      dispatch(setCurrentServerId(servers[0]._id));
    }
  }, [currentServerId, dispatch, servers]);

  return (
    <aside className="flex w-[72px] shrink-0 flex-col items-center gap-3 bg-rail py-3">
      <button
        title="Create server"
        onClick={() => dispatch(openCreateServer())}
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white transition hover:rounded-xl"
      >
        <Plus size={22} />
      </button>

      <button
        title="Join server"
        onClick={() => dispatch(openJoinServer())}
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white transition hover:rounded-xl hover:bg-emerald-500"
      >
        <LogIn size={21} />
      </button>

      <div className="h-px w-8 bg-gray-700" />

      {servers.map((server) => (
        <button
          key={server._id}
          title={server.name}
          onClick={() => dispatch(setCurrentServerId(server._id))}
          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold transition hover:rounded-xl ${
            currentServerId === server._id ? "bg-accent text-white" : "bg-gray-700 text-gray-200"
          }`}
        >
          {server.iconUrl ? (
            <img src={server.iconUrl} alt="" className="h-full w-full rounded-2xl object-cover" />
          ) : (
            initials(server.name)
          )}
        </button>
      ))}
    </aside>
  );
}
