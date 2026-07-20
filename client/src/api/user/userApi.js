import { api } from "../api.js";
import { setCredentials } from "../../store/slices/authSlice.js";

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch the dashboard data for the authenticated user, including servers and other relevant information
    getDashboard: builder.query({
      query: () => ({ url: "/users/dashboard" }),
      providesTags: ["Auth", "Server"]
    }),

    // Update the authenticated user's profile information
    updateProfile: builder.mutation({
      query: (body) => ({ url: "/users/me", method: "PATCH", data: body }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data.user));
      },
      // Invalidate the "Auth" tag to ensure that any cached user data is refreshed after the profile update
      invalidatesTags: ["Auth"]
    }),
    uploadImage: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return { url: "/users/uploads/images", method: "POST", data: formData };
      }
    })
  })
});

export const { useGetDashboardQuery, useUpdateProfileMutation, useUploadImageMutation } = userApi;
