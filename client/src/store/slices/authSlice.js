import { createSlice } from "@reduxjs/toolkit";
// Define a Redux slice for authentication state management, including user credentials and actions to set or clear them

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null },
  reducers: {
    setCredentials(state, action) { state.user = action.payload; },
    clearCredentials(state) { state.user = null; }
  }
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
