import { Navigate } from "react-router-dom";
import { useGetCurrentUserQuery } from "../../features/auth/authApi.js";
import { FullPageLoader } from "../ui/FullPageLoader.jsx";

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
