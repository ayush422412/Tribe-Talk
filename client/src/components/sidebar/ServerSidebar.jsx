import { LogIn, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useGetServersQuery } from "../../api/server/serverApi.js";
import { setCurrentServerId } from "../../store/slices/workspaceSlice.js";
import { openCreateServer, openJoinServer } from "../../store/slices/uiSlice.js";

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
    <aside className="flex w-[76px] shrink-0 flex-col items-center gap-3 border-r-[3px] border-ink bg-[#fff3c8] py-4">
      <button
        title="Create server"
        onClick={() => dispatch(openCreateServer())}
        className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-ink bg-[#536dfe] text-white shadow-[3px_3px_0_#171717] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
      >
        <Plus size={22} />
      </button>

      <button
        title="Join server"
        onClick={() => dispatch(openJoinServer())}
        className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-ink bg-[#83df4a] text-ink shadow-[3px_3px_0_#171717] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
      >
        <LogIn size={21} />
      </button>

      <div className="h-[2px] w-9 bg-ink" />

      {servers.map((server) => (
        <button
          key={server._id}
          title={server.name}
          onClick={() => dispatch(setCurrentServerId(server._id))}
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-ink text-sm font-black transition ${
            currentServerId === server._id ? "bg-[#536dfe] text-white shadow-[3px_3px_0_#171717]" : "bg-white text-ink hover:bg-[#fff9e8]"
          }`}
        >
          {server.iconUrl ? (
            <img src={toImageUrl(server.iconUrl)} alt="" className="h-full w-full rounded-2xl object-cover" />
          ) : (
            initials(server.name)
          )}
        </button>
      ))}
    </aside>
  );
}

function toImageUrl(url) {
  return url?.startsWith("/") ? `${(import.meta.env.VITE_API_URL ?? "http://localhost:5000/api").replace(/\/api$/, "")}${url}` : url;
}
