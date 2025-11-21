import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "../pages/main/Dashboard";
import Login from "../pages/authentication/Login";
import Registration from "../pages/authentication/Registration";
import ForgotPassword from "../pages/authentication/ForgotPassword";
import ResetPassword from "../pages/authentication/ResetPassword";
import AddProduct from "../pages/main/product/AddProduct.jsx";
import AddCategory from "../pages/main/category/AddCategory.jsx";
import CategoryList from "../pages/main/category/CategoryList.jsx";
import ProductList from "../pages/main/product/ProductList.jsx";
import ApiService from "../config/ApiService";
import { useEffect, useState } from "react";
import InventoryPage from "../pages/main/InventoryPage.jsx";
import ProfilePage from "../pages/main/ProfilePage.jsx";
import OrderList from "../pages/main/orders/OrderList.jsx";
import SingleOrder from "../pages/main/orders/SingleOrder.jsx";

// Authentication check function
const checkAuth = async () => {
  try {
    const isLoggedIn = await ApiService.checkAuthStatus();
    return isLoggedIn;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
};

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const authStatus = await checkAuth();
      setIsAuthenticated(authStatus);
      setLoading(false);
    };

    verifyAuth();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Wrapper Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const authStatus = await checkAuth();
      setIsAuthenticated(authStatus);
      setLoading(false);
    };

    verifyAuth();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout component for protected routes with navigation
const ProtectedLayout = ({ children }) => {
  return (
    <ProtectedRoute>
      <div className="protected-layout">
        <main className="main-content">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
};

// Layout for public pages (without navigation)
const PublicLayout = ({ children }) => {
  return (
    <PublicRoute>
      <div className="public-layout">
        {children}
      </div>
    </PublicRoute>
  );
};

// Public layout without redirection (for pages that can be accessed regardless of auth status)
const PublicLayoutNoRedirect = ({ children }) => {
  return (
    <div className="public-layout">
      {children}
    </div>
  );
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Protected Routes - Require authentication */}
      <Route path="/" element={
        <ProtectedLayout>
          <Dashboard />
        </ProtectedLayout>
      } />

      <Route path="/add-category" element={
        <ProtectedLayout>
          <AddCategory />
        </ProtectedLayout>
      } />

      <Route path="/inventory" element={
        <ProtectedLayout>
          <InventoryPage />
        </ProtectedLayout>
      } />

      {/* <Route path="/order/:orderId" element={
        <ProtectedLayout>
          <SingleOrder />
        </ProtectedLayout>
      } /> */}

      <Route path="/order" element={
        <ProtectedLayout>
          <SingleOrder />
        </ProtectedLayout>
      } />

      <Route path="/orders" element={
        <ProtectedLayout>
          <OrderList />
        </ProtectedLayout>
      } />

      <Route path="/profile" element={
        <ProtectedLayout>
          <ProfilePage />
        </ProtectedLayout>
      } />

      <Route path="/category" element={
        <ProtectedLayout>
          <CategoryList />
        </ProtectedLayout>
      } />

      <Route path="/add-product" element={
        <ProtectedLayout>
          <AddProduct />
        </ProtectedLayout>
      } />

      <Route path="/product" element={
        <ProtectedLayout>
          <ProductList />
        </ProtectedLayout>
      } />

      {/* Public Routes - Redirect to dashboard if already authenticated */}
      <Route path="/login" element={
        <PublicLayout>
          <Login />
        </PublicLayout>
      } />

      <Route path="/registration" element={
        <PublicLayout>
          <Registration />
        </PublicLayout>
      } />

      {/* Public Routes without redirection */}
      <Route path="/forgot-password" element={
        <PublicLayoutNoRedirect>
          <ForgotPassword />
        </PublicLayoutNoRedirect>
      } />

      <Route path="/reset-password" element={
        <PublicLayoutNoRedirect>
          <ResetPassword />
        </PublicLayoutNoRedirect>
      } />

      {/* Catch all route - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </>
  )
);

export default router;