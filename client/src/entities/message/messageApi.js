import { api } from "../../shared/api/api.js";

export const messageApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMessages: builder.query({
      query: ({ channelId, before }) => ({
        url: `/messages/channels/${channelId}`,
        params: { before }
      }),
      providesTags: (result, error, arg) => [{ type: "Message", id: arg.channelId }]
    }),
    createMessage: builder.mutation({
      query: ({ channelId, content }) => ({
        url: `/messages/channels/${channelId}`,
        method: "POST",
        data: { content }
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Message", id: arg.channelId }]
    }),
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
          data: formData
        };
      },
      invalidatesTags: (result, error, arg) => [{ type: "Message", id: arg.channelId }]
    }),
    editMessage: builder.mutation({
      query: ({ messageId, content }) => ({
        url: `/messages/${messageId}`,
        method: "PATCH",
        data: { content }
      }),
      invalidatesTags: ["Message"]
    }),
    deleteMessage: builder.mutation({
      query: (messageId) => ({ url: `/messages/${messageId}`, method: "DELETE" }),
      invalidatesTags: ["Message"]
    }),
    toggleReaction: builder.mutation({
      query: ({ messageId, emoji }) => ({
        url: `/messages/${messageId}/reactions`,
        method: "POST",
        data: { emoji }
      }),
      invalidatesTags: ["Message"]
    })
  })
});

export const {
  useGetMessagesQuery,
  useCreateMessageMutation,
  useUploadMessageFileMutation,
  useEditMessageMutation,
  useDeleteMessageMutation,
  useToggleReactionMutation
} = messageApi;
