import { useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";

export default function MainLayout({
  children,
  role,
  page,
  setPage,
  logout,
  loading,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`
        fixed z-30 top-0 left-0 h-full transition-transform duration-300
        md:static md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar
          role={role}
          page={page}
          setPage={(p) => {
            setPage(p);
            setSidebarOpen(false);
          }}
          logout={logout}
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 space-y-4 min-w-0">

        {/* MOBILE HEADER */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white text-2xl p-1"
          >
            ☰
          </button>
          <span className="font-bold text-lg">ERP PANEL</span>
        </div>

        {/* LOADING BAR */}
        {loading && (
          <div className="bg-yellow-500 text-black px-4 py-2 rounded-lg shadow">
            Loading data...
          </div>
        )}

        {/* PAGE CONTENT */}
        <div className="animate-fade-in">
          {children}
        </div>

      </div>
    </div>
  );
}