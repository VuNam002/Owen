import { useEffect, useRef, useState, useCallback, useMemo } from "react";

interface Comment {
    _id: string;
    article_id: string;
    product_id: string;
    user_id: string;
    fullName: string;
    email: string;
    content: string;
    parent_id: string;
    status: "active" | "inactive";
}

interface ApiResponse {
    data: Comment[];
}

const API_BASE = "http://localhost:3000/api/v1/comments";

const apiRequest = async (
    url: string,
    options: RequestInit = {}
): Promise<any> => {
    const token = localStorage.getItem('admin_token');
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401) {
            window.location.href = '/admin/login';
        }
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export const useComment = () => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [keyword, setKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('all');

    const loadingRef = useRef(false);

    const fetchComments = useCallback(async (status: 'active' | 'inactive' | 'all') => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            let url = API_BASE;
            if (status !== 'all') {
                url += `?status=${status}`;
            }
            const result = await apiRequest(url);
            setComments(result.data);
        } catch (err) {
            setError("Không thể tải dữ liệu bình luận");
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, []);

    useEffect(() => {
        fetchComments(statusFilter);
    }, [fetchComments, statusFilter]);

    const filteredComments = useMemo(() => {
        if (!comments || !comments.length) return [];

        const keywordLower = keyword.toLowerCase();
        return comments.filter(comment =>
            comment.fullName.toLowerCase().includes(keywordLower) ||
            comment.email.toLowerCase().includes(keywordLower) ||
            comment.content.toLowerCase().includes(keywordLower)
        );
    }, [comments, keyword]);

    const paginatedComments = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredComments.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredComments, currentPage, itemsPerPage]);

    const deleteComment = async (id: string) => {
        try {
            await apiRequest(`${API_BASE}/delete/${id}`, { method: "DELETE" });
            setComments(prev => prev.filter(c => c._id !== id));
        } catch {
            setError("Không thể xóa bình luận");
        }
    };

    const updateCommentStatus = async (id: string, status: "active" | "inactive") => {
        try {
            await apiRequest(`${API_BASE}/change-status/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });
            setComments(prev =>
                prev.map(c => (c._id === id ? { ...c, status } : c))
            );
        } catch {
            setError("Không thể cập nhật trạng thái");
        }
    };

    return {
        comments: paginatedComments,
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
        totalComments: filteredComments.length,
        statusFilter,
        setStatusFilter,
    };
};