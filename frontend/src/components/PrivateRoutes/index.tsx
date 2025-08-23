import { Navigate, Outlet } from "react-router-dom";

function PrivateRoutes() {
    const token = localStorage.getItem('token');
    const isLogin=!!token;
    return(
        <>
            {isLogin ? (
                <Outlet />
            ) : (
                <Navigate to="/admin/login" replace />
            )}
        </>
    )
}
export default PrivateRoutes;