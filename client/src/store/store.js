import { configureStore } from "@reduxjs/toolkit";
import { api } from "../api/api.js";
import authReducer from "./slices/authSlice.js";
import workspaceReducer from "./slices/workspaceSlice.js";
import uiReducer from "./slices/uiSlice.js";

export const store = configureStore({
  
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
    ui: uiReducer,
    // Add the RTK Query API reducer to the store to manage API state and caching
    [api.reducerPath]: api.reducer
  },
  // Add the RTK Query middleware to the store to enable caching, invalidation, and other features for API calls
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware)
});
