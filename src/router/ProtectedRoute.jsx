import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FullPageStatus } from "../components/ui/State";

function ProtectedRoute({ requireAdmin = false }) {
  const location = useLocation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageStatus title="Restoring session" message="Checking your secure cookie." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
