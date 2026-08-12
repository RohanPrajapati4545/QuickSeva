import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Login from "./../Auth/Login";
import Register from "./../Auth/Register";
import Layout from "./Layout";
import Home from "../Home";
import About from "../About";
import Contact from "../Contact";
import VendorLayout from "../vendor/VendorLayout";
import VendorDashboard from "../vendor/VendorDashboard";
import VendorCategories from "../vendor/VendorCategories";
import VendorServices from "../vendor/vendorServices";
import VendorServiceForm from "../vendor/VendorServiceForm";
import VendorProfile from "../vendor/VendorProfile";
import VendorBookings from "../vendor/VendorBookings";
import Services from "../Services";
import VendorDetails from "../VendorDetails";


import SingleService from "../SingleService";
import UserProfile from "../Auth/UserProfile";
import MyBookings from "../MyBookings";
import VendorBookingDetails from "../vendor/VendorBookingDetails";
import VendorServiceDetails from "../vendor/VendorServiceDetails";

import AdminLayout from "./../Admin/AdminLayout";
import AdminDashboard from "./../Admin/AdminDashboard";
import AllUsers from "./../Admin/AllUsers";
import UserDetails from "./../Admin/UserDetails";
import AdminVendors from "./../Admin/AllVendors";
import AdminVendorDetails from "./../Admin/VendorDetails";
import AdminCategories from "./../Admin/AdminCategories";
import AdminCategoryForm from "./../Admin/AdminCategoryForm";
import AdminServices from "./../Admin/AdminServices";
import AdminServiceDetails from "./../Admin/AdminServiceDetails";


const RequireRole = ({ role, children }) => {
  const { isAuth, user } = useSelector((state) => state.auth);
  if (!isAuth) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return children;
};


const AllRoutes = () => {
  const { isAuth, user } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isAuth && user?.role === "vendor" ? (
              <Navigate to="/vendor/dashboard" replace />
            ) : isAuth && user?.role === "admin" ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Layout>
                <Home />
              </Layout>
            )
          }
        />
        <Route
          path="/about"
          element={
            <Layout>
              <About />
            </Layout>
          }
        />
        <Route
          path="/contact"
          element={
            <Layout>
              <Contact />
            </Layout>
          }
        />
         <Route
          path="/my-bookings"
          element={
            <RequireRole role="customer">
              <Layout>
                <MyBookings />
              </Layout>
            </RequireRole>
          }
        />
        <Route
          path="/login"
          element={
            isAuth ? (
              <Navigate
                to={
                  user?.role === "vendor"
                    ? "/vendor/dashboard"
                    : user?.role === "admin"
                    ? "/admin/dashboard"
                    : "/"
                }
                replace
              />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/register"
          element={isAuth ? <Navigate to="/" replace /> : <Register />}
        />
        <Route path="/services" element={<Layout><Services /></Layout>} />
        <Route path="/services/:categorySlug" element={<Layout><Services /></Layout>} />

        <Route
          path="/service/:id"
          element={
            <RequireRole role="customer">
              <Layout>
                <SingleService />
              </Layout>
            </RequireRole>
          }
        />

        <Route path="/vendor-details/:id" element={<Layout><VendorDetails /></Layout>} />
        
        
        <Route
          path="/profile"
          element={
            <RequireRole>
              <Layout>
                <UserProfile />
              </Layout>
            </RequireRole>




          }
        />




        <Route
          path="/vendor"
          element={
            <RequireRole role="vendor">
              <VendorLayout />
            </RequireRole>
          }
        >




          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="categories" element={<VendorCategories />} />
          <Route path="services" element={<VendorServices />} />
          <Route path="services-form" element={<VendorServiceForm />} />
          <Route path="services/edit/:id" element={<VendorServiceForm />} />
          <Route path="profile" element={<VendorProfile />} />
          <Route path="bookings" element={<VendorBookings />} />
          
<Route path="/vendor/bookings/:id" element={<VendorBookingDetails />} />
<Route path="/vendor/services/:id" element={<VendorServiceDetails />} />

        </Route>






        <Route
          path="/admin"
          element={
            <RequireRole role="admin">
              <AdminLayout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AllUsers />} />
          <Route path="users/:id" element={<UserDetails />} />
          <Route path="vendors" element={<AdminVendors />} />
          <Route path="vendors/:id" element={<AdminVendorDetails />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="categories-form" element={<AdminCategoryForm />} />
          <Route path="categories/edit/:id" element={<AdminCategoryForm />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="services/:id" element={<AdminServiceDetails />} />
        </Route>


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AllRoutes;