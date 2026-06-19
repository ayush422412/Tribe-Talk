import { api } from "../../shared/api/api.js";

export const channelApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getChannels: builder.query({
      query: (serverId) => ({ url: `/servers/${serverId}/channels` }),
      providesTags: (result, error, serverId) => [{ type: "Channel", id: serverId }]
    }),
    createChannel: builder.mutation({
      query: ({ serverId, name }) => ({
        url: `/servers/${serverId}/channels`,
        method: "POST",
        data: { name }
      }),
      invalidatesTags: ["Channel"]
    }),
    updateChannel: builder.mutation({
      query: ({ channelId, ...body }) => ({
        url: `/channels/${channelId}`,
        method: "PATCH",
        data: body
      }),
      invalidatesTags: ["Channel"]
    }),
    deleteChannel: builder.mutation({
      query: (channelId) => ({ url: `/channels/${channelId}`, method: "DELETE" }),
      invalidatesTags: ["Channel", "Message"]
    })
  })
});

export const {
  useGetChannelsQuery,
  useCreateChannelMutation,
  useUpdateChannelMutation,
  useDeleteChannelMutation
} = channelApi;
