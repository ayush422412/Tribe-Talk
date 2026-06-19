import { api } from "../../shared/api/api.js";

export const friendApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFriends: builder.query({
      query: () => ({ url: "/friends" }),
      providesTags: ["Friend"]
    }),
    sendFriendRequest: builder.mutation({
      query: (body) => ({ url: "/friends/requests", method: "POST", data: body }),
      invalidatesTags: ["Friend"]
    }),
    respondFriendRequest: builder.mutation({
      query: ({ requestId, status }) => ({
        url: `/friends/requests/${requestId}`,
        method: "PATCH",
        data: { status }
      }),
      invalidatesTags: ["Friend"]
    }),
    getConversation: builder.query({
      query: (friendId) => ({ url: `/friends/${friendId}/conversation` }),
      providesTags: (result, error, friendId) => [{ type: "Conversation", id: friendId }]
    }),
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
