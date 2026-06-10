import { useState } from "react";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import ProductSkeleton from "./ProductSkeleton";

export default function ProductList({
  products,
  role,
  onDelete,
  onUpdate,
  loading,
}) {
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", stock: "" });

  const startEdit = (p) => {
    setEditId(p.id);
    setEditForm({ name: p.name, price: p.price, stock: p.stock });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ name: "", price: "", stock: "" });
  };

  const handleUpdate = (id) => {
    onUpdate(id, {
      name: editForm.name,
      price: parseFloat(editForm.price),
      stock: parseInt(editForm.stock),
    });
    setEditId(null);
  };

  if (loading) {
    return <ProductSkeleton />;
  }

  return (
    <Card>
      {/* HEADER */}
      <h2 className="text-xl font-semibold mb-4">Products</h2>

      {/* EMPTY STATE */}
      {!products || products.length === 0 ? (
        <EmptyState text="No products available" />
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-gray-900/40 p-3 rounded-lg border border-gray-700"
            >
              {editId === p.id ? (
                // ================= EDIT MODE =================
                <div className="space-y-2">
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-1 rounded bg-gray-900 border border-gray-600 text-white text-sm"
                  />
                  <div className="flex gap-2">
                    <input
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      type="number"
                      placeholder="Price"
                      className="w-full px-3 py-1 rounded bg-gray-900 border border-gray-600 text-white text-sm"
                    />
                    <input
                      value={editForm.stock}
                      onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                      type="number"
                      placeholder="Stock"
                      className="w-full px-3 py-1 rounded bg-gray-900 border border-gray-600 text-white text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(p.id)}
                      className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-600 px-3 py-1 rounded hover:bg-gray-700 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // ================= VIEW MODE =================
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {p.name} <span className="text-gray-500 text-xs">#{p.id}</span>
                    </span>
                    <span className="text-sm text-gray-400">Stock: {p.stock}</span>
                  </div>

                  <div className="text-green-400 font-semibold">${p.price}</div>

                  {role === "admin" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(p)}
                        className="bg-yellow-600 px-3 py-1 rounded hover:bg-yellow-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}