
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, authLoading } = useAuth();

  // Wait until the saved token has been checked
  if (authLoading) {
    return <p className="route-loading">Checking authentication...</p>;
  }

  // Redirect logged-out users to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Restrict access by role when required
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
