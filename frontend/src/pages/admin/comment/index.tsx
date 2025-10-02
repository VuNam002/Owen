import React from 'react';
import { useComment } from '../../../hooks/useComment';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Pagination } from '../../../components/ui/pagination';
import LayoutAdmin from '../../../layouts/layoutAdmin';

const CommentPage: React.FC = () => {
    const {
        comments,
        loading,
        error,
        keyword,
        setKeyword,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        deleteComment,
        updateCommentStatus,
        totalComments,
    } = useComment();

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
    };

    const totalPages = Math.ceil(totalComments / itemsPerPage);

    return (
            <div className="container p-4 mx-auto">
                <h1 className="mb-4 text-2xl font-bold">Quản lý bình luận</h1>

                <div className="flex items-center justify-between mb-4">
                    <div className="w-1/3">
                        <Input
                            placeholder="Tìm kiếm theo tên, email, nội dung..."
                            value={keyword}
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                {loading && <p>Đang tải...</p>}
                {error && <p className="text-red-500">{error}</p>}

                <div className="overflow-hidden bg-white rounded-lg shadow-md">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                                    Người dùng
                                </th>
                                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                                    Nội dung
                                </th>
                                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                                    Trạng thái
                                </th>
                                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {comments.map(comment => (
                                <tr key={comment._id}>
                                    <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                        <p className="text-gray-900 whitespace-no-wrap">{comment.fullName}</p>
                                        <p className="text-gray-600 whitespace-no-wrap">{comment.email}</p>
                                    </td>
                                    <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                        <p className="text-gray-900 whitespace-no-wrap">{comment.content}</p>
                                    </td>
                                    <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                        <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${comment.status ? 'text-green-900' : 'text-red-900'}`}>
                                            <span aria-hidden className={`absolute inset-0 ${comment.status ? 'bg-green-200' : 'bg-red-200'} opacity-50 rounded-full`}></span>
                                            <span className="relative">{comment.status ? 'Đã duyệt' : 'Chưa duyệt'}</span>
                                        </span>
                                    </td>
                                    <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                        <Button onClick={() => updateCommentStatus(comment._id, !comment.status)} variant={comment.status ? 'secondary' : 'default'}>
                                            {comment.status ? 'Hủy duyệt' : 'Duyệt'}
                                        </Button>
                                        <Button onClick={() => deleteComment(comment._id)} variant="destructive" className="ml-2">
                                            Xóa
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="py-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
    );
};



export default CommentPage;

