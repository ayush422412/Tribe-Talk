import { api } from "../../shared/api/api.js";
import { setCredentials } from "../../features/auth/authSlice.js";

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query({
      query: () => ({ url: "/users/dashboard" }),
      providesTags: ["Auth", "Server"]
    }),
    updateProfile: builder.mutation({
      query: (body) => ({ url: "/users/me", method: "PATCH", data: body }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data.user));
      },
      invalidatesTags: ["Auth"]
    })
  })
});

export const { useGetDashboardQuery, useUpdateProfileMutation } = userApi;
