import { useEffect, useState } from "react";
import { PaginationComponent } from "../../../helpers/pagination"; 

interface Product {
    _id: number;
    title: string;
    price: number;
    thumbnail: string;
    oldPrice: number;
    priceNew: number;
    status: string;
}

function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1); 

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        fetch(`http://localhost:3000/api/v1/products?page=${currentPage}&limit=10`)
            .then(response => response.json())
            .then((result) => {
                const data: Product[] = result.data || [];
                setProducts(data);
                if (result.totalPages) {
                    setTotalPages(result.totalPages);
                }
            })
            .catch(error => console.error("Error fetching products:", error)); 
    }, [currentPage]); 

    return (
        <>
            <h1>Danh sách sản phẩm</h1>
            <ul>
                {products
                .filter(products => products.status === 'active')
                .map((product: Product) => (
                    <li key={product._id}>
                        <h2>{product.title}</h2>
                        <img src={product.thumbnail} alt={product.title} style={{ maxWidth: '400px' }} />
                        <p>Giá: {product.price}</p>
                    </li>
                ))}
            </ul>
            <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </>
    )
}
export default Products;