import { api } from "../api.js";

export const friendApi = api.injectEndpoints({
  endpoints: (builder) => ({

    // Fetch all friends for the authenticated user
    getFriends: builder.query({
      query: () => ({ url: "/friends" }),
      providesTags: ["Friend"]
    }),

// Send a friend request to another user
    sendFriendRequest: builder.mutation({
      query: (body) => ({ url: "/friends/requests", method: "POST", data: body }),
      invalidatesTags: ["Friend"]
    }),

// Respond to a friend request (accept or reject)
    respondFriendRequest: builder.mutation({
      query: ({ requestId, status }) => ({
        url: `/friends/requests/${requestId}`,
        method: "PATCH",
        data: { status }
      }),
      invalidatesTags: ["Friend"]
    }),

// Fetch the conversation with a specific friend
    getConversation: builder.query({
      query: (friendId) => ({ url: `/friends/${friendId}/conversation` }),
      providesTags: (result, error, friendId) => [{ type: "Conversation", id: friendId }]
    }),

// Send a direct message to a friend
    sendDirectMessage: builder.mutation({
      query: ({ friendId, content }) => ({
        url: `/friends/${friendId}/messages`,
        method: "POST",
        data: { content }
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Conversation", id: arg.friendId }]
    })
  })
});

export const {
  useGetFriendsQuery,
  useSendFriendRequestMutation,
  useRespondFriendRequestMutation,
  useGetConversationQuery,
  useSendDirectMessageMutation
} = friendApi;
