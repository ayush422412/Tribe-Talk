import { api } from "../api.js";

// Define the channelApi with endpoints for managing channels

export const channelApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch all channels for a specific server
    getChannels: builder.query({
      query: (serverId) => ({ url: `/servers/${serverId}/channels` }),
      providesTags: (result, error, serverId) => [{ type: "Channel", id: serverId }]
    }),


// Create a new channel in a server
    createChannel: builder.mutation({
      query: ({ serverId, name }) => ({
        url: `/servers/${serverId}/channels`,
        method: "POST",
        data: { name }
      }),
      invalidatesTags: ["Channel"]
    }),

// Update an existing channel's name

    updateChannel: builder.mutation({
      query: ({ channelId, ...body }) => ({
        url: `/channels/${channelId}`,
        method: "PATCH",
        data: body
      }),
      invalidatesTags: ["Channel"]
    }),

// Delete a channel by its ID
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
