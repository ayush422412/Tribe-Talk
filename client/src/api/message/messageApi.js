import { api } from "../api.js";

export const messageApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch messages for a specific channel, optionally before a certain message ID
    getMessages: builder.query({
      query: ({ channelId, before, after }) => ({
        url: `/messages/channels/${channelId}`,
        params: { before, after }
      }),
      providesTags: (result, error, arg) => [{ type: "Message", id: arg.channelId }]
    }),

    getUnreadCounts: builder.query({
      query: (serverId) => ({ url: "/messages/unread", params: { serverId } }),
      providesTags: (result, error, serverId) => [{ type: "Message", id: `unread-${serverId}` }]
    }),

    markChannelRead: builder.mutation({
      query: (channelId) => ({ url: `/messages/channels/${channelId}/read`, method: "PATCH" }),
      invalidatesTags: ["Message"]
    }),

// Create a new message in a specific channel
    createMessage: builder.mutation({
      query: ({ channelId, content }) => ({
        url: `/messages/channels/${channelId}`,
        method: "POST",
        body: { content }
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Message", id: arg.channelId }]
    }),

// Upload a file as a message in a specific channel

    uploadMessageFile: builder.mutation({
      query: ({ channelId, content, file }) => {
        const formData = new FormData();
        formData.append("file", file);

        if (content) {
          formData.append("content", content);
        }

        return {
          url: `/messages/channels/${channelId}/uploads`,
          method: "POST",
          body: formData
        };
      },
      invalidatesTags: (result, error, arg) => [{ type: "Message", id: arg.channelId }]
    }),

// Edit an existing message by its ID

    editMessage: builder.mutation({
      query: ({ messageId, content }) => ({
        url: `/messages/${messageId}`,
        method: "PATCH",
        body: { content }
      }),
      invalidatesTags: ["Message"]
    }),

// Delete a message by its ID

    deleteMessage: builder.mutation({
      query: (messageId) => ({ url: `/messages/${messageId}`, method: "DELETE" }),
      invalidatesTags: ["Message"]
    }),

// Toggle a reaction (add or remove) for a specific message

    toggleReaction: builder.mutation({
      query: ({ messageId, emoji }) => ({
        url: `/messages/${messageId}/reactions`,
        method: "POST",
        body: { emoji }
      }),
      invalidatesTags: ["Message"]
    })
  })
});

export const {
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useGetUnreadCountsQuery,
  useMarkChannelReadMutation,
  useCreateMessageMutation,
  useUploadMessageFileMutation,
  useEditMessageMutation,
  useDeleteMessageMutation,
  useToggleReactionMutation
} = messageApi;
