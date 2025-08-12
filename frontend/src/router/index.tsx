import LayoutDefault from "../layouts/layoutDefault";
import Home from "../pages/client/Error/home";
import Error from "../pages/client/Error";
import Products from "../pages/client/Products/Products";
import LayoutAdmin from "../layouts/layoutAdmin";
import Product from "../pages/admin/product";
import Dashboard from "../pages/admin/dashboard";


export const routes = [
    {
        path: '/',
        element: <LayoutDefault />,
        children: [
            {
                index: true,
                element: <Home/>
            },
            {
                path: 'products',
                element: <Products/>
            },
            {
                path: "*",
                element: <Error/>
            },
        ]
    },
    {
        path: 'admin',
        element: <LayoutAdmin/>,
        children: [
            {
                path: "dashboard",
                element: <Dashboard />
            },
            {
                path: "products",
                element: <Product/>
            }
        ]
    }
]