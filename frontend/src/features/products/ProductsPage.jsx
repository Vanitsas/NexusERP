import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/client";
import ProductList from "./ProductList";

const ITEMS_PER_PAGE = 10;

export default function ProductsPage({ role }) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", stock: "" });
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();

  // ================= PRODUCTS FETCH =================
  const { data: products = [], isLoading, isFetching } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get("/products");
      return res.data.products || [];
    },
  });

  // ================= DELETE =================
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/products/${id}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
      const previousProducts = queryClient.getQueryData(["products"]);
      queryClient.setQueryData(["products"], (old = []) =>
        old.filter((p) => p.id !== id)
      );
      return { previousProducts };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["products"], context.previousProducts);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  // ================= UPDATE =================
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await api.put(`/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
  // ================= CREATE =================
  const createMutation = useMutation({
    mutationFn: async (data) => {
      await api.post("/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setForm({ name: "", price: "", stock: "" });
      setShowForm(false);
      setCurrentPage(1);
    },
  });

  const handleCreate = () => {
    if (!form.name || !form.price) return;
    createMutation.mutate({
      name: form.name,
      price: parseFloat(form.price),
      stock: parseInt(form.stock) || 0,
    });
  };

  // ================= FILTER =================
  const filtered = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  // ================= PAGINATION =================
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ================= UI =================
  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-gray-400 text-sm">Manage your inventory</p>
      </div>

      {/* TOP BAR */}
      <div className="flex gap-3 items-center flex-wrap">
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["products"] })}
          className="bg-green-500 px-4 py-2 rounded hover:bg-green-600"
        >
          {isFetching ? "Refreshing..." : "Reload"}
        </button>

        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search products..."
          className="px-3 py-2 rounded bg-gray-800 border border-gray-700"
        />

        {role === "admin" && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 ml-auto"
          >
            {showForm ? "Cancel" : "+ Add Product"}
          </button>
        )}
      </div>

      {/* ADD FORM */}
      {showForm && role === "admin" && (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3">
          <h2 className="font-semibold text-white">New Product</h2>

          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Product name"
            className="w-full px-3 py-2 rounded bg-gray-900 border border-gray-700 text-white"
          />

          <input
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="Price"
            type="number"
            className="w-full px-3 py-2 rounded bg-gray-900 border border-gray-700 text-white"
          />

          <input
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            placeholder="Stock (default 0)"
            type="number"
            className="w-full px-3 py-2 rounded bg-gray-900 border border-gray-700 text-white"
          />

          <button
            onClick={handleCreate}
            disabled={createMutation.isPending}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating..." : "Create Product"}
          </button>
        </div>
      )}

      {/* LIST */}
      <ProductList
        products={paginated}
        role={role}
        loading={isLoading}
        onDelete={(id) => deleteMutation.mutate(id)}
        onUpdate={(id, data) => updateMutation.mutate({ id, data })}
      />

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
          <p className="text-sm text-gray-400">
            Page {currentPage} of {totalPages} · {filtered.length} products
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}

    </div>
  );
}