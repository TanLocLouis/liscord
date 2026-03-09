import { Navigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  
  const { refreshToken } = useAuth();
  // If no access token or user info, redirect to login

  if (!refreshToken) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;
