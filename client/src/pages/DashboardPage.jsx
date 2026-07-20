import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetDashboardQuery } from "../api/user/userApi.js";
import { FriendsPanel } from "../components/dashboard/FriendsPanel.jsx";
import { ProfileCard } from "../components/dashboard/ProfileCard.jsx";
import { ServerSection } from "../components/dashboard/ServerSection.jsx";

export function DashboardPage() {
  const currentUser = useSelector((state) => state.auth.user);
  const { data, isLoading } = useGetDashboardQuery();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-300">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="flex h-14 items-center justify-between border-b border-gray-800 px-5">
        <h1 className="text-lg font-bold">Dashboard</h1>
        <Link className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white" to="/">
          <ArrowLeft size={16} />
          Back to Chat
        </Link>
      </header>

      <div className="grid gap-5 p-5 xl:grid-cols-[360px_1fr_420px]">
        <ProfileCard user={data?.user} currentUser={currentUser} />
        <section className="space-y-5">
          <ServerSection
            title="Owned Servers"
            servers={data?.ownedServers ?? []}
            currentUserId={currentUser?.id}
            editable
          />
          <ServerSection
            title="Joined Servers"
            servers={data?.joinedServers ?? []}
            currentUserId={currentUser?.id}
          />
        </section>
        <FriendsPanel />
      </div>
    </main>
  );
}
