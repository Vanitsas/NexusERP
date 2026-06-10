export default function Sidebar({
  role,
  page,
  setPage,
  logout,
}) {
  const baseClass =
    "w-full text-left px-3 py-2 rounded-lg transition font-medium";

  const getClass = (targetPage) =>
    `${baseClass} ${
      page === targetPage
        ? "bg-blue-600 text-white shadow-md"
        : "text-gray-300 hover:bg-gray-800"
    }`;

  return (
    <aside className="w-64 bg-gray-950 border-r border-gray-800 p-4 flex flex-col">

      {/* ================= BRAND ================= */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white tracking-wide">
          ERP PANEL
        </h1>

        <p className="text-xs text-gray-500 mt-1">
          Internal Dashboard System
        </p>
      </div>

      {/* ================= NAVIGATION ================= */}
      <nav className="flex-1 space-y-2">

        <button
          onClick={() => setPage("dashboard")}
          className={getClass("dashboard")}
        >
          Dashboard
        </button>

        <button
          onClick={() => setPage("products")}
          className={getClass("products")}
        >
          Products
        </button>

        <button
          onClick={() => setPage("orders")}
          className={getClass("orders")}
        >
          Orders
        </button>
        
        <button
          onClick={() => setPage("customers")}
          className={getClass("customers")}
        >
          Customers
        </button>

        {role === "admin" && (
          <button
            onClick={() => setPage("stats")}
            className={getClass("stats")}
          >
            Analytics
          </button>
        )}

      </nav>

      {/* ================= FOOTER ================= */}
      <div className="border-t border-gray-800 pt-4 space-y-3">

        <div className="px-2">
          <p className="text-xs text-gray-500">
            Logged in as
          </p>

          <p className="text-sm text-gray-300 font-medium capitalize">
            {role}
          </p>
        </div>

        <button
          onClick={logout}
          className="
            w-full
            text-left
            px-3
            py-2
            rounded-lg
            text-red-400
            hover:bg-red-500/10
            hover:text-red-300
            transition
          "
        >
          Logout
        </button>

      </div>

    </aside>
  );
}