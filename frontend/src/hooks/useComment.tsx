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
    status: boolean;
}

interface ApiResponse {
    data: Comment[];
}

const API_BASE = "http://localhost:3000/api/v1/comments";

const apiRequest = async (
    url: string,
    options: RequestInit = {}
): Promise<ApiResponse> => {
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
            // Unauthorized, redirect to login or handle appropriately
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

    const loadingRef = useRef(false);

    const fetchComments = useCallback(async () => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const result = await apiRequest(API_BASE);
            setComments(result.data);
        } catch  {
            setError("Không thể tải dữ liệu bình luận");
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, []);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const filteredComments = useMemo(() => {
        if (!comments.length) return [];

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
        } catch  {
            setError("Không thể xóa bình luận");
        }
    };

    const updateCommentStatus = async (id: string, status: boolean) => {
        try {
            await apiRequest(`${API_BASE}/change-status/${status}/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });
            setComments(prev =>
                prev.map(c => (c._id === id ? { ...c, status } : c))
            );
        } catch  {
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
    };
};