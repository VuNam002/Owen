import type { FC } from "react";
import { Link } from "react-router-dom";

export const AccountAction: FC = () => {
  return (
    <div className="flex items-center gap-3 px-6 py-4">
      <Link
        to="/admin/accounts/create"
        className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        Thêm tài khoản
      </Link>
    </div>
  );
};
