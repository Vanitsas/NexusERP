import { useEffect, useState } from "react";
import api from "./api/client";

import Login from "./pages/Login";
import MainLayout from "./layouts/MainLayout";

import DashboardPage from "./features/dashboard/DashboardPage";
import ProductsPage from "./features/products/ProductsPage";
import OrdersPage from "./features/orders/OrdersPage";
import StatsPage from "./features/stats/StatsPage";
import CustomersPage from "./features/customers/CustomersPage";

import Toast from "./components/ui/Toast";
import LoadingOverlay from "./components/ui/LoadingOverlay";

export default function App() {
  // ================= AUTH =================
  const [token, setToken] = useState("");
  const [role, setRole] = useState("");

  // ================= UI STATE =================
  const [page, setPage] = useState("dashboard");
  const [loading, setLoading] = useState(false);

  // ================= UX =================
  const [toast, setToast] = useState(null);

  // ================= INIT AUTH =================
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");

    if (savedToken) setToken(savedToken);
    if (savedRole) setRole(savedRole);
  }, []);

  // ================= AXIOS 401 AUTO LOGOUT =================
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          logout();

          setToast({
            message: "Session expired. Please login again.",
            type: "error",
          });
        }

        return Promise.reject(err);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

  // ================= LOGIN =================
  const handleLogin = (newToken, userRole) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", userRole);

    setToken(newToken);
    setRole(userRole);

    setToast({
      message: "Login successful",
      type: "success",
    });
  };

  // ================= LOGOUT =================
  const logout = () => {
    localStorage.clear();

    setToken("");
    setRole("");
    setPage("dashboard");

    setToast({
      message: "Logged out",
      type: "success",
    });
  };

  // ================= GUARD =================
  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  // ================= RENDER =================
  return (
    <>
      {/* GLOBAL LOADING */}
      <LoadingOverlay show={loading} />

      {/* TOAST SYSTEM */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <MainLayout
        role={role}
        page={page}
        setPage={setPage}
        logout={logout}
        loading={loading}      
      >
        {/* DASHBOARD */}
        {page === "dashboard" && (
          <DashboardPage role={role} />
        )}

        {/* PRODUCTS */}
        {page === "products" && (
          <ProductsPage role={role} />
        )}

        {/* ORDERS */}
        {page === "orders" && (
          <OrdersPage role={role} />
        )}

        {/* STATS - admin only */}
        {page === "stats" && role === "admin" && (
          <StatsPage />
        )}

        {/* CUSTOMERS */}
        {page === "customers" && (
          <CustomersPage role={role} />
        )}

      </MainLayout>
    </>
  );
}