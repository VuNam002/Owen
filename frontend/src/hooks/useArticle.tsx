import { useEffect, useRef } from "react";
import { useState, useCallback, useMemo } from "react";

interface Article {
    _id: string;
    title: string;
    article_category_id: string;
    description: string;
    content: string;
    thumbnail: string;
    status: string;
    position: number;
    featured: boolean;
}

interface ApiResponse {
    data: Article[];
}

const API_BASE = "http://localhost:3000/api/v1/article";

const apiRequest = async (
    url: string,
    options: RequestInit = {}
): Promise<ApiResponse> => {
    const response = await fetch(url, {
        headers: {"Content-Type": "application/json"},
        ...options,
    });
    if(!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
};

export const useArticle = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [keyword, setKeyword] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [positions, setPositions] = useState<{ [key: string]: number }>({});

    const loadingRef = useRef(false);
    const fetchArticles = useCallback(async () => {
        if(loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const result = await apiRequest(API_BASE);
            setArticles(result.data);

            const newPositions: { [key: string]: number} = {};
            result.data.forEach((articles, index) => {
                newPositions[articles._id] = index + 1;
            });
            setPositions(newPositions);
        }catch (err) {
            setError("Không thẻ tải dữ liệu bài viết", err);
        }finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, []);

    useEffect(() => {
        fetchArticles();
    },[fetchArticles]);
    const filterArticles = useMemo(() => {
        if(!articles.length)  return[];
    })
    
    const filteredArticles = useMemo(() => {
        if(!articles.length) return[];

        const keywordLower = keyword.toLowerCase();
        const hasKeyword = keyword.trim().length > 0;
        const hasStatusFilter = filterStatus.length > 0;

        if(!hasKeyword && !hasStatusFilter) return articles;

        return articles.filter((articles: Article) => {
            if(hasStatusFilter && articles.status !== filterArticles){
                return false;
            }
            if(hasKeyword) {
                
            }
        })
    })
}
