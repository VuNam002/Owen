import { useEffect, useState } from "react";

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

    useEffect(() => {
        fetch("http://localhost:3000/api/v1/products")
            .then(response => response.json())
            .then((result) => {
                const data: Product[] = result.data || [];
                setProducts(data);
                console.log(data);
            })
    }, []);

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
        </>
    )
}
export default Products;
