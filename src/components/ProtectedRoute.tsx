// src/components/ProtectedRoute.tsx

import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole"; // Import our new hook

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { role, loadingRole } = useUserRole();

  if (loadingRole) {
    return <div className="flex h-screen items-center justify-center">Verifying Access...</div>;
  }

  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;