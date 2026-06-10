import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ChartDashboard({ data }) {
  // 🔥 GUARD: data yoksa patlama
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-gray-400 p-4 bg-gray-800 rounded">
        No chart data available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

      {/* LINE CHART */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">

        <h2 className="mb-3 font-semibold text-white">
          Orders Over Time
        </h2>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>

            <XAxis
              dataKey="month"
              stroke="#9ca3af"
            />

            <YAxis stroke="#9ca3af" />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="count"
              stroke="#4ade80"
              strokeWidth={2}
              dot={{ r: 3 }}
            />

          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* BAR CHART */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">

        <h2 className="mb-3 font-semibold text-white">
          Revenue
        </h2>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>

            <XAxis
              dataKey="month"
              stroke="#9ca3af"
            />

            <YAxis stroke="#9ca3af" />

            <Tooltip />

            <Bar
              dataKey="revenue"
              fill="#60a5fa"
              radius={[4, 4, 0, 0]}
            />

          </BarChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}