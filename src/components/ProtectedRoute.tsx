// src/components/ProtectedRoute.tsx

import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { userRole, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading & Verifying Access...</div>;
  }

  if (userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;