import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "../../context/AuthContext"; // Import useAdminAuth
import React from "react"; // Import React

interface PrivateRoutesProps {
    requiredPermission?: string;
    children?: React.ReactNode; // Add children prop
}

function PrivateRoutes({ requiredPermission, children }: PrivateRoutesProps) {
    const { admin, loading, hasPermission } = useAdminAuth(); 
    if (loading) {
        return <div>Loading...</div>; // Or a spinner component
    }
    if (!admin) {
        console.log("PrivateRoutes: Redirecting to login (no admin)");
        return <Navigate to="/admin/login" replace />;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
        console.log("PrivateRoutes: Redirecting to dashboard (no permission)");
        return <Navigate to="*" replace />;
    }
    return children ? <>{children}</> : <Outlet />;
}
export default PrivateRoutes;