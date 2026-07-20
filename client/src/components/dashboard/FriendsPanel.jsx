import { MessageSquare } from "lucide-react";
import { useMemo, useState } from "react";
import {
  useGetConversationQuery,
  useGetFriendsQuery,
  useRespondFriendRequestMutation,
  useSendDirectMessageMutation,
  useSendFriendRequestMutation
} from "../../api/friend/friendApi.js";
import { Button } from "../common/Button.jsx";

export function FriendsPanel() {
  const { data: friendData } = useGetFriendsQuery();
  const [sendFriendRequest, friendRequestState] = useSendFriendRequestMutation();
  const [respondFriendRequest] = useRespondFriendRequestMutation();
  const [sendDirectMessage] = useSendDirectMessageMutation();
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [friendUsername, setFriendUsername] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const { data: conversationData } = useGetConversationQuery(selectedFriendId, {
    skip: !selectedFriendId
  });
  const selectedFriend = useMemo(
    () => friendData?.friends?.find((friend) => friend._id === selectedFriendId),
    [friendData, selectedFriendId]
  );

  async function handleFriendSubmit(event) {
    event.preventDefault();
    await sendFriendRequest({ username: friendUsername }).unwrap();
    setFriendUsername("");
  }

  async function handleMessageSubmit(event) {
    event.preventDefault();

    if (!messageContent.trim() || !selectedFriendId) {
      return;
    }

    await sendDirectMessage({ friendId: selectedFriendId, content: messageContent }).unwrap();
    setMessageContent("");
  }

  return (
    <section className="rounded-lg bg-gray-900 p-5">
      <h2 className="text-base font-bold">Friends & DMs</h2>
      <form onSubmit={handleFriendSubmit} className="mt-4 flex gap-2">
        <input
          value={friendUsername}
          onChange={(event) => setFriendUsername(event.target.value)}
          placeholder="Send request by username"
          className="h-10 min-w-0 flex-1 rounded-md bg-gray-950 px-3 text-sm outline-none"
        />
        <Button disabled={friendRequestState.isLoading || !friendUsername.trim()}>Add</Button>
      </form>
      {friendRequestState.error && (
        <p className="mt-2 text-sm text-red-300">{friendRequestState.error.data?.message}</p>
      )}

      <IncomingRequests
        requests={friendData?.incomingRequests ?? []}
        onRespond={respondFriendRequest}
      />
      <FriendList
        friends={friendData?.friends ?? []}
        selectedFriendId={selectedFriendId}
        onSelect={setSelectedFriendId}
      />
      {selectedFriend && (
        <Conversation
          friend={selectedFriend}
          messages={conversationData?.conversation?.messages ?? []}
          messageContent={messageContent}
          onMessageContentChange={setMessageContent}
          onSubmit={handleMessageSubmit}
        />
      )}
    </section>
  );
}

function IncomingRequests({ requests, onRespond }) {
  return (
    <>
      <h3 className="mt-6 text-xs font-bold uppercase text-gray-400">Incoming Requests</h3>
      <div className="mt-2 space-y-2">
        {requests.map((request) => (
          <div key={request._id} className="flex items-center justify-between rounded bg-gray-800 p-2">
            <span className="text-sm">{request.from.username}</span>
            <div className="flex gap-2">
              <button
                onClick={() => onRespond({ requestId: request._id, status: "accepted" })}
                className="text-xs text-emerald-300"
              >
                Accept
              </button>
              <button
                onClick={() => onRespond({ requestId: request._id, status: "rejected" })}
                className="text-xs text-red-300"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function FriendList({ friends, selectedFriendId, onSelect }) {
  return (
    <>
      <h3 className="mt-6 text-xs font-bold uppercase text-gray-400">Friends</h3>
      <div className="mt-2 space-y-2">
        {friends.map((friend) => (
          <button
            key={friend._id}
            onClick={() => onSelect(friend._id)}
            className={`flex w-full items-center gap-2 rounded p-2 text-left text-sm ${
              selectedFriendId === friend._id ? "bg-accent" : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            <MessageSquare size={16} />
            <span>{friend.username}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function Conversation({ friend, messages, messageContent, onMessageContentChange, onSubmit }) {
  return (
    <div className="mt-5 border-t border-gray-800 pt-4">
      <h3 className="font-semibold">DM with {friend.username}</h3>
      <div className="mt-3 max-h-72 space-y-3 overflow-y-auto rounded bg-gray-950 p-3">
        {messages.map((message) => (
          <div key={message._id} className="text-sm">
            <span className="font-semibold text-gray-300">{message.author.username}: </span>
            <span className="text-gray-100">{message.content}</span>
          </div>
        ))}
      </div>
      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <input
          value={messageContent}
          onChange={(event) => onMessageContentChange(event.target.value)}
          className="h-10 min-w-0 flex-1 rounded-md bg-gray-950 px-3 text-sm outline-none"
          placeholder="Send a direct message"
        />
        <Button disabled={!messageContent.trim()}>Send</Button>
      </form>
    </div>
  );
}
