import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  createServerOpen: false,
  editServerOpen: false,
  joinServerOpen: false,
  createChannelOpen: false
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openCreateServer(state) {
      state.createServerOpen = true;
    },
    closeCreateServer(state) {
      state.createServerOpen = false;
    },
    openEditServer(state) {
      state.editServerOpen = true;
    },
    closeEditServer(state) {
      state.editServerOpen = false;
    },
    openJoinServer(state) {
      state.joinServerOpen = true;
    },
    closeJoinServer(state) {
      state.joinServerOpen = false;
    },
    openCreateChannel(state) {
      state.createChannelOpen = true;
    },
    closeCreateChannel(state) {
      state.createChannelOpen = false;
    }
  }
});

export const {
  openCreateServer,
  closeCreateServer,
  openEditServer,
  closeEditServer,
  openJoinServer,
  closeJoinServer,
  openCreateChannel,
  closeCreateChannel
} = uiSlice.actions;
export default uiSlice.reducer;
