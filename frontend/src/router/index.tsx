import LayoutDefault from "../layouts/layoutDefault";
import Home from "../pages/client/home";
import Error from "../pages/client/Error";
import Products from "../pages/client/Products/Products";
import LayoutAdmin from "../layouts/layoutAdmin";
import Product from "../pages/admin/product";
import Dashboard from "../pages/admin/dashboard";
import EditProduct from "../pages/admin/product/edit";
import CreateProductPage from "../pages/admin/product/create";
import Category from "../pages/admin/category";
import CreateCategory from "../pages/admin/category/create";
import EditCategoryPage from "../pages/admin/category/edit";
import Account from "../pages/admin/account";
import CreateAccount from "../pages/admin/account/create"
import EditAccount from "../pages/admin/account/edit"; 
import Role from "../pages/admin/role";
import CreateRole from "../pages/admin/role/create";
import EditRole from "../pages/admin/role/edit";
import PermissionsPage from "../pages/admin/role/permissions";
import Login from "../pages/admin/login";
import PrivateRoutes from "../components/PrivateRoutes/index";



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
        element: <PrivateRoutes />,
        children: [
            {
                element: <LayoutAdmin/>,
                children: [
                    {
                        path: "dashboard",
                        element: <Dashboard />
                    },
                    {
                        path: "products",
                        element: <Product/>
                    },
                    {
                        path: "products/edit/:id", 
                        element: <EditProduct/>
                    },
                    {
                        path: "products/create", 
                        element: <CreateProductPage/>
                    },
                    {
                        path: "category", 
                        element: <Category/>
                    },
                    {
                        path: "categorys/create", 
                        element: <CreateCategory/>
                    },
                    {
                        path: "categorys/edit/:id",
                        element: <EditCategoryPage/>
                    },
                    {
                        path: "accounts",
                        element: <Account/>
                    },
                    {
                        path:"accounts/create",
                        element: <CreateAccount/>
                    },
                    {
                        path:"accounts/edit/:id",
                        element: <EditAccount/>
                    },
                    {
                        path: "roles",
                        element: <Role/>
                    },
                    {
                        path:"roles/create",
                        element: <CreateRole/>
                    },
                    {
                        path:"roles/edit/:id",
                        element: <EditRole/>
                    },
                    {
                        path:"permissions",
                        element: <PermissionsPage/>
                    }
                ]
            }
        ]
    },
    {
        path: "admin/login",
        element: <Login/>
    }
]