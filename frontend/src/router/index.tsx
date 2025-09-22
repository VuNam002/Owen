import { Outlet } from "react-router-dom";
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
import CreateAccount from "../pages/admin/account/create";
import EditAccount from "../pages/admin/account/edit";
import Role from "../pages/admin/role";
import CreateRole from "../pages/admin/role/create";
import EditRole from "../pages/admin/role/edit";
import PermissionsPage from "../pages/admin/role/permissions";
import Login from "../pages/admin/login";
import PrivateRoutes from "../components/PrivateRoutes";
import SearchPage from "../pages/client/Products/SearchPage";
import ProductDetail from "../pages/client/Products/ProductDetail";
import Cart from "../pages/client/cart/cart";
import Check from "../pages/client/checkout/index";
import Success from "../pages/client/checkout/success";
import Order from "../pages/admin/order/index";
import DetailOrderPage from "../pages/admin/order/detail";
import LoginU from "../pages/client/user/Login";
import RegisterPage from "../pages/client/user/Register";
import ForgotPasswordPage from "../pages/client/user/Forgot-password";
import User from "../pages/admin/user/index";

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
                path: 'category/:id',
                element: <Products/>
            },
            {
                path: 'search',
                element: <SearchPage/>
            },
            {
                path: 'products/detail/:id',
                element: <ProductDetail/>
            },
            {
                path: 'cart',
                element: <Cart/>
            },
            {
                path: 'register',
                element: <RegisterPage/>
            },
            {
                path: 'checkout',
                element: <Check/>
            },
            {
                path: 'loginClient',
                element: <LoginU/>
            },
            {
                path: 'checkout/success/:orderId',
                element: <Success/>
            },
            {
                path: 'forgot-password',
                element: <ForgotPasswordPage/>
            },
        ]
    },
    {
        path: 'admin',
        element: <Outlet />, // Use Outlet to render nested admin routes
        children: [
            {
                path: 'login',
                element: <Login />
            },
            {
                // All other admin routes are protected
                path: '',
                element: <PrivateRoutes><LayoutAdmin /></PrivateRoutes>,
                children: [
                    {
                        path: "dashboard",
                        element: <Dashboard />
                    },
                    {
                        path: "products",
                        element: <PrivateRoutes requiredPermission="product_view"><Product/></PrivateRoutes> 
                    },
                    {
                        path: "products/edit/:id", 
                        element: <PrivateRoutes requiredPermission="product_edit"><EditProduct/></PrivateRoutes> 
                    },
                    {
                        path: "products/create", 
                        element: <PrivateRoutes requiredPermission="product_create"><CreateProductPage/></PrivateRoutes> 
                    },
                    {
                        path: "category", 
                        element: <PrivateRoutes requiredPermission="product-category_view"><Category/></PrivateRoutes> 
                    },
                    {
                        path: "categorys/create", 
                        element: <PrivateRoutes requiredPermission="product-category_create"><CreateCategory/></PrivateRoutes> 
                    },
                    {
                        path: "categorys/edit/:id",
                        element: <PrivateRoutes requiredPermission="product-category_edit"><EditCategoryPage/></PrivateRoutes>
                    },
                    {
                        path: "accounts",
                        element: <PrivateRoutes requiredPermission="accounts_view"><Account/></PrivateRoutes> 
                    },
                    {
                        path:"accounts/create",
                        element: <PrivateRoutes requiredPermission="accounts_create"><CreateAccount/></PrivateRoutes> 
                    },
                    {
                        path:"accounts/edit/:id",
                        element: <PrivateRoutes requiredPermission="accounts_edit"><EditAccount/></PrivateRoutes> 
                    },
                    {
                        path: "roles",
                        element: <PrivateRoutes requiredPermission="roles_view"><Role/></PrivateRoutes> 
                    },
                    {
                        path:"roles/create",
                        element: <PrivateRoutes requiredPermission="roles_create"><CreateRole/></PrivateRoutes> 
                    },
                    {
                        path:"roles/edit/:id",
                        element: <PrivateRoutes requiredPermission="roles_edit"><EditRole/></PrivateRoutes> 
                    },
                    {
                        path:"permissions",
                        element: <PrivateRoutes requiredPermission="roles_permissions"><PermissionsPage/></PrivateRoutes> 
                    },
                    {
                        path:"orders",
                        element: <PrivateRoutes requiredPermission="orders_view"><Order/></PrivateRoutes> 
                    },
                    {
                        path:"orders/detail/:orderId",
                        element: <PrivateRoutes requiredPermission="orders_view"><DetailOrderPage/></PrivateRoutes> 
                    },
                    {
                        path:"users",
                        element: <PrivateRoutes requiredPermission="users_view"><User/></PrivateRoutes> 
                    }
                ]
            }
        ]
    },
    {
        path: "*",
        element: <Error/>
    },
]
