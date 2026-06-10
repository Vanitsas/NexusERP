import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/client";

export default function CustomersPage({ role }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", country: "" });

  const queryClient = useQueryClient();

  // ================= FETCH =================
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await api.get("/customers");
      return res.data.customers || [];
    },
  });

  // ================= CREATE =================
  const createMutation = useMutation({
    mutationFn: async (data) => {
      await api.post("/customers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setForm({ name: "", country: "" });
      setShowForm(false);
    },
  });

  // ================= DELETE =================
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const handleCreate = () => {
    if (!form.name) return;
    createMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Customers</h1>
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-gray-400 text-sm">Manage your customers</p>
      </div>

      {/* TOP BAR */}
      <div className="flex gap-3">
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["customers"] })}
          className="bg-green-500 px-4 py-2 rounded hover:bg-green-600"
        >
          Reload
        </button>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 ml-auto"
        >
          {showForm ? "Cancel" : "+ Add Customer"}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3">
          <h2 className="font-semibold text-white">New Customer</h2>

          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Customer name"
            className="w-full px-3 py-2 rounded bg-gray-900 border border-gray-700 text-white"
          />

          <input
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            placeholder="Country (optional)"
            className="w-full px-3 py-2 rounded bg-gray-900 border border-gray-700 text-white"
          />

          {createMutation.isError && (
            <p className="text-red-400 text-sm">Failed to create customer</p>
          )}

          <button
            onClick={handleCreate}
            disabled={createMutation.isPending}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating..." : "Create Customer"}
          </button>
        </div>
      )}

      {/* LIST */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        {customers.length === 0 ? (
          <p className="text-gray-500">No customers yet</p>
        ) : (
          <div className="space-y-3">
            {customers.map((c) => (
              <div
                key={c.id}
                className="flex justify-between items-center border-b border-gray-800 pb-3"
              >
                <div className="space-y-1">
                  <span className="font-medium">{c.name}</span>
                  <div className="text-sm text-gray-400">
                    {c.country || "—"} · ID: {c.id}
                  </div>
                </div>

                {role === "admin" && (
                  <button
                    onClick={() => deleteMutation.mutate(c.id)}
                    className="text-xs bg-red-700 hover:bg-red-800 px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}