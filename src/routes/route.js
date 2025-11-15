// routes/route.js
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Dashboard from "../pages/main/Dashboard";
import Login from "../pages/authentication/Login";
import Registration from "../pages/authentication/Registration";
import ForgotPassword from "../pages/authentication/ForgotPassword";
import ResetPassword from "../pages/authentication/ResetPassword";
import AddProduct from "../pages/main/AddProduct";
import AddCategory from "../pages/main/AddCategory.jsx";
import CategoryList from "../pages/main/CategoryList.jsx";
import ProductList from "../pages/main/ProductList.jsx";

// Layout component for protected routes with navigation
const ProtectedLayout = ({ children }) => {
  return (
    <div className="protected-layout">
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

// Layout for public pages (without navigation)
const PublicLayout = ({ children }) => {
  return (
    <div className="public-layout">
      {children}
    </div>
  );
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <>

      <Route path="/" element={
        <PublicLayout>
          <Dashboard />
        </PublicLayout>
      } />  

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

      <Route path="/reset-password" element={
        <PublicLayout>
          <ResetPassword />
        </PublicLayout>
      } />  

      <Route path="/add-category" element={
        <PublicLayout>
          <AddCategory />
        </PublicLayout>
      } />

      <Route path="/category" element={
        <PublicLayout>
          <CategoryList />
        </PublicLayout>
      } />  

      <Route path="/forgot-password" element={
        <PublicLayout>
          <ForgotPassword />
        </PublicLayout>
      } />  

      <Route path="/add-product" element={
        <PublicLayout>
          <AddProduct />
        </PublicLayout>
      } />

      <Route path="/product" element={
        <PublicLayout>
          <ProductList />
        </PublicLayout>
      } />   
     
    </>
  )
);

export default router;