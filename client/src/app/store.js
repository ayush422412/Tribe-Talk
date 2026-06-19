import { configureStore } from "@reduxjs/toolkit";
import { api } from "../shared/api/api.js";
import authReducer from "../features/auth/authSlice.js";
import workspaceReducer from "../features/workspace/workspaceSlice.js";
import uiReducer from "../features/ui/uiSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
    ui: uiReducer,
    [api.reducerPath]: api.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware)
});
