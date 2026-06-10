import { useQuery } from "@tanstack/react-query";
import api from "../../api/client";
import ChartDashboard from "../../components/ChartDashboard";

export default function StatsPage() {

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await api.get("/admin/stats");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-400">Loading stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-red-400">Failed to load stats</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-gray-400 text-sm">Business overview</p>
        </div>
        <button
          onClick={() => refetch()}
          className="bg-green-500 px-4 py-2 rounded hover:bg-green-600"
        >
          Reload
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm">Total Orders</p>
          <p className="text-3xl font-bold mt-1">{stats?.total_orders ?? 0}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm">Total Products</p>
          <p className="text-3xl font-bold mt-1">{stats?.total_products ?? 0}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold mt-1 text-green-400">
            ${stats?.pending_revenue ?? 0}
          </p>
        </div>
      </div>

      {/* CHARTS */}
      <ChartDashboard data={stats?.orders_over_time ?? []} />

    </div>
  );
}