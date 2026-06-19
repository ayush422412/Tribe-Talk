import { api } from "../../shared/api/api.js";

export const serverApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getServers: builder.query({
      query: () => ({ url: "/servers" }),
      providesTags: ["Server"]
    }),
    getServer: builder.query({
      query: (serverId) => ({ url: `/servers/${serverId}` }),
      providesTags: (result, error, serverId) => [{ type: "Server", id: serverId }]
    }),
    createServer: builder.mutation({
      query: (body) => ({ url: "/servers", method: "POST", data: body }),
      invalidatesTags: ["Server", "Channel"]
    }),
    joinServer: builder.mutation({
      query: (serverId) => ({ url: `/servers/${serverId}/join`, method: "POST" }),
      invalidatesTags: ["Server", "Channel"]
    }),
    leaveServer: builder.mutation({
      query: (serverId) => ({ url: `/servers/${serverId}/leave`, method: "POST" }),
      invalidatesTags: ["Server", "Channel", "Message"]
    }),
    updateServer: builder.mutation({
      query: ({ serverId, ...body }) => ({
        url: `/servers/${serverId}`,
        method: "PATCH",
        data: body
      }),
      invalidatesTags: ["Server"]
    }),
    updateMemberRole: builder.mutation({
      query: ({ serverId, userId, role }) => ({
        url: `/servers/${serverId}/members/${userId}/role`,
        method: "PATCH",
        data: { role }
      }),
      invalidatesTags: ["Server"]
    }),
    kickMember: builder.mutation({
      query: ({ serverId, userId }) => ({
        url: `/servers/${serverId}/members/${userId}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Server"]
    }),
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
