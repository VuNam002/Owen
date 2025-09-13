import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import useAuth
import React from "react"; // Import React

interface PrivateRoutesProps {
    requiredPermission?: string;
    children?: React.ReactNode; // Add children prop
}

function PrivateRoutes({ requiredPermission, children }: PrivateRoutesProps) {
    const { user, loading, hasPermission } = useAuth(); 
    if (loading) {
        return <div>Loading...</div>; // Or a spinner component
    }
    if (!user) {
        console.log("PrivateRoutes: Redirecting to login (no user)");
        return <Navigate to="/admin/login" replace />;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
        console.log("PrivateRoutes: Redirecting to dashboard (no permission)");
        return <Navigate to="*" replace />;
    }
    return children ? <>{children}</> : <Outlet />;
}
export default PrivateRoutes;