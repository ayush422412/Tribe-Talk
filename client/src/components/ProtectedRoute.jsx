import { Navigate } from "react-router-dom";
import { useGetCurrentUserQuery } from "../api/authApi.js";
import { FullPageLoader } from "./common/FullPageLoader.jsx";

export function ProtectedRoute({ children }) {
  const { isLoading, isError } = useGetCurrentUserQuery();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (isError) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
