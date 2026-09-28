import { createSlice } from "@reduxjs/toolkit";

const workspaceSlice = createSlice({
  name: "workspace",
  initialState: { currentServerId: null, currentChannelId: null, channelIdByServer: {} },
  reducers: {
    setCurrentServerId(state, action) {
      state.currentServerId = action.payload;
      state.currentChannelId = action.payload ? state.channelIdByServer[action.payload] ?? null : null;
    },
    setCurrentChannelId(state, action) {
      state.currentChannelId = action.payload;

      if (!state.currentServerId) {
        return;
      }

      if (action.payload) {
        state.channelIdByServer[state.currentServerId] = action.payload;
      } else {
        delete state.channelIdByServer[state.currentServerId];
      }
    }
  }
});

export const { setCurrentServerId, setCurrentChannelId } = workspaceSlice.actions;
export default workspaceSlice.reducer;
