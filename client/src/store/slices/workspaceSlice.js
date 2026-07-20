import { createSlice } from "@reduxjs/toolkit";

const workspaceSlice = createSlice({
  name: "workspace",
  initialState: { currentServerId: null, currentChannelId: null },
  reducers: {
    setCurrentServerId(state, action) { state.currentServerId = action.payload; state.currentChannelId = null; },
    setCurrentChannelId(state, action) { state.currentChannelId = action.payload; }
  }
});

export const { setCurrentServerId, setCurrentChannelId } = workspaceSlice.actions;
export default workspaceSlice.reducer;
