import { api } from "../../shared/api/api.js";
import { clearCredentials, setCredentials } from "./authSlice.js";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({ url: "/auth/register", method: "POST", data: body }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data.user));
        } catch {
          dispatch(clearCredentials());
        }
      },
      invalidatesTags: ["Auth"]
    }),
    login: builder.mutation({
      query: (body) => ({ url: "/auth/login", method: "POST", data: body }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data.user));
        } catch {
          dispatch(clearCredentials());
        }
      },
      invalidatesTags: ["Auth"]
    }),
    logout: builder.mutation({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(clearCredentials());
          dispatch(api.util.resetApiState());
        }
      }
    }),
    getCurrentUser: builder.query({
      query: () => ({ url: "/auth/me" }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data.user));
        } catch {
          dispatch(clearCredentials());
        }
      },
      providesTags: ["Auth"]
    })
  })
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery
} = authApi;
