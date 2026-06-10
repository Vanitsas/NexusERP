import { useQuery } from "@tanstack/react-query";
import ChartDashboard from "../../components/ChartDashboard";
import api from "../../api/client";

export default function DashboardPage({ role }) {

  // ================= STATS QUERY =================
  const {
    data: stats,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await api.get("/admin/stats");
      return res.data;
    },
    enabled: role === "admin",
  });

  // ================= PRODUCTS PREVIEW =================
  const {
    data: products = [],
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get("/products");
      return res.data.products || [];
    },
  });

  // ================= LOADING =================
  if (isLoading) {
    return (
      <div className="text-gray-400">
        Loading dashboard...
      </div>
    );
  }

  // ================= ERROR =================
  if (isError) {
    return (
      <div className="text-red-400">
        Failed to load dashboard
        <button
          onClick={() => refetch()}
          className="ml-3 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <p className="text-gray-400">
          Welcome back,{" "}
          <span className="text-white font-semibold">{role || "user"}</span>
        </p>
      </div>

      {/* EMPTY STATE */}
      {!stats && (
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl text-gray-400">
          No analytics data available.
        </div>
      )}

      {/* KPI GRID */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-5 rounded-xl shadow-lg">
            <p className="text-gray-400 text-sm">Total Orders</p>
            <p className="text-2xl font-bold mt-1">
              {stats.total_orders ?? 0}
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-5 rounded-xl shadow-lg">
            <p className="text-gray-400 text-sm">Products</p>
            <p className="text-2xl font-bold mt-1">
              {stats.total_products ?? 0}
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-5 rounded-xl shadow-lg">
            <p className="text-gray-400 text-sm">Revenue</p>
            <p className="text-2xl font-bold mt-1 text-green-400">
              ${stats.pending_revenue ?? 0}
            </p>
          </div>

        </div>
      )}

      {/* CHART */}
      {Array.isArray(stats?.orders_over_time) &&
        stats.orders_over_time.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-lg">

            <h2 className="text-xl font-semibold mb-2">
              Analytics Overview
            </h2>

            <p className="text-gray-400 text-sm mb-4">
              Orders & revenue trends
            </p>

            <ChartDashboard data={stats.orders_over_time} />
          </div>
        )}

      {/* PRODUCTS PREVIEW */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-xl font-semibold mb-3">
          Latest Products
        </h2>

        {products.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No products loaded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {products.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="flex justify-between text-sm text-gray-300 border-b border-gray-800 py-2"
              >
                <span>{p.name}</span>
                <span className="text-green-400">${p.price}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}