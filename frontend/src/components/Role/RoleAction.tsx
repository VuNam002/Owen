import type { FC } from "react";
import { Link } from "react-router-dom";

export const RoleAction: FC = () => {
    return (
        <div className="flex items-center gap-3 px-6 py-4">
            <Link
                to="/admin/roles/create"
                className="px-3 py-2 text-white bg-blue-500 rounded-md"
            > Thêm mới 
            </Link>
        </div>
    )
}