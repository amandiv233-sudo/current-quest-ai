import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

interface AuthenticatedRouteProps {
  children: React.ReactNode;
}

const AuthenticatedRoute = ({ children }: AuthenticatedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    // If user is not logged in, redirect them to the authentication page
    return <Navigate to="/auth" replace />;
  }

  // If user is logged in, show the page
  return <>{children}</>;
};

export default AuthenticatedRoute;