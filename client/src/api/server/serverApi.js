import { api } from "../api.js";

export const serverApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch all servers the authenticated user is a member of
    getServers: builder.query({
      query: () => ({ url: "/servers" }),
      providesTags: ["Server"]
    }),
// Fetch details of a specific server by its ID
    getServer: builder.query({
      query: (serverId) => ({ url: `/servers/${serverId}` }),
      providesTags: (result, error, serverId) => [{ type: "Server", id: serverId }]
    }),

//  Create a new server with the provided details
    createServer: builder.mutation({
      query: (body) => ({ url: "/servers", method: "POST", data: body }),
      invalidatesTags: ["Server", "Channel"]
    }),

// Join a server by its ID
    joinServer: builder.mutation({
      query: (serverId) => ({ url: `/servers/${serverId}/join`, method: "POST" }),
      invalidatesTags: ["Server", "Channel"]
    }),

    // Leave a server by its ID
    leaveServer: builder.mutation({
      query: (serverId) => ({ url: `/servers/${serverId}/leave`, method: "POST" }),
      invalidatesTags: ["Server", "Channel", "Message"]
    }),

// Update server details (like name or description)
    updateServer: builder.mutation({
      query: ({ serverId, ...body }) => ({
        url: `/servers/${serverId}`,
        method: "PATCH",
        data: body
      }),
      invalidatesTags: ["Server"]
    }),

    // Update a member's role in a server (e.g., promote to admin)
    updateMemberRole: builder.mutation({
      query: ({ serverId, userId, role }) => ({
        url: `/servers/${serverId}/members/${userId}/role`,
        method: "PATCH",
        data: { role }
      }),
      invalidatesTags: ["Server"]
    }),

    // Kick a member from a server
    kickMember: builder.mutation({
      query: ({ serverId, userId }) => ({
        url: `/servers/${serverId}/members/${userId}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Server"]
    }),

    // Delete a server by its ID

    deleteServer: builder.mutation({
      query: (serverId) => ({ url: `/servers/${serverId}`, method: "DELETE" }),
      invalidatesTags: ["Server", "Channel", "Message"]
    })
  })
});

export const {
  useGetServersQuery,
  useGetServerQuery,
  useCreateServerMutation,
  useJoinServerMutation,
  useLeaveServerMutation,
  useUpdateServerMutation,
  useUpdateMemberRoleMutation,
  useKickMemberMutation,
  useDeleteServerMutation
} = serverApi;
