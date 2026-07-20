import { api } from "./api.js";
import { clearCredentials, setCredentials } from "../store/slices/authSlice.js";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({

      // Register a new user and automatically log them in
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

    // Log in an existing user and store their credentials in the Redux state

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

    // Log out the current user and clear their credentials from the Redux state

    
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

  // Fetch the current authenticated user's information and update the Redux state accordingly
  
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
