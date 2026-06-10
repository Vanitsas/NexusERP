import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/client";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

const ITEMS_PER_PAGE = 10;

export default function OrdersPage({ role }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_id: "", product_id: "", quantity: "" });
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();

  // ================= ORDERS FETCH =================
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await api.get("/orders");
      return res.data.orders || [];
    },
  });

  // ================= CUSTOMERS FETCH =================
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await api.get("/customers");
      return res.data.customers || [];
    },
  });

  // ================= PRODUCTS FETCH =================
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get("/products");
      return res.data.products || [];
    },
  });

  // ================= PAGINATION =================
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ================= EXPORT CSV =================
  const exportCSV = () => {
    const headers = ["Order ID", "Customer", "Product", "Quantity", "Total", "Status"];
    const rows = orders.map((order) => {
      const customer = customers.find(c => c.id === order.customer_id);
      const product = products.find(p => p.id === order.product_id);
      return [
        order.id,
        customer ? customer.name : order.customer_id,
        product ? product.name : order.product_id,
        order.quantity,
        order.total,
        order.status,
      ];
    });
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ================= EXPORT EXCEL =================
  const exportExcel = () => {
    const rows = orders.map((order) => {
      const customer = customers.find(c => c.id === order.customer_id);
      const product = products.find(p => p.id === order.product_id);
      return {
        "Order ID": order.id,
        "Customer": customer ? customer.name : order.customer_id,
        "Product": product ? product.name : order.product_id,
        "Quantity": order.quantity,
        "Total": order.total,
        "Status": order.status,
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, "orders.xlsx");
  };

  // ================= GENERATE INVOICE =================
  const generateInvoice = (order) => {
    const customer = customers.find(c => c.id === order.customer_id);
    const product = products.find(p => p.id === order.product_id);

    const turkishToAscii = (str) => {
      if (!str) return "";
      return str
        .replace(/ş/g, 's').replace(/Ş/g, 'S')
        .replace(/ı/g, 'i').replace(/İ/g, 'I')
        .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
        .replace(/ü/g, 'u').replace(/Ü/g, 'U')
        .replace(/ö/g, 'o').replace(/Ö/g, 'O')
        .replace(/ç/g, 'c').replace(/Ç/g, 'C');
    };

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("INVOICE", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Invoice #${order.id}`, 20, 40);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);

    doc.line(20, 55, 190, 55);

    doc.text("Bill To:", 20, 65);
    doc.text(`${customer ? turkishToAscii(customer.name) : "Unknown"}`, 20, 75);
    doc.text(`${turkishToAscii(customer?.country || "")}`, 20, 85);

    doc.line(20, 90, 190, 90);

    doc.text("Product", 20, 100);
    doc.text("Quantity", 100, 100);
    doc.text("Total", 160, 100);

    doc.line(20, 105, 190, 105);

    doc.text(`${product ? turkishToAscii(product.name) : "Unknown"}`, 20, 115);
    doc.text(`${order.quantity}`, 100, 115);
    doc.text(`$${order.total}`, 160, 115);

    doc.line(20, 120, 190, 120);

    doc.setFontSize(14);
    doc.text(`Total: $${order.total}`, 160, 135);

    doc.setFontSize(10);
    doc.text("Thank you for your business!", 105, 160, { align: "center" });

    doc.save(`invoice-${order.id}.pdf`);
  };

  // ================= COMPLETE ORDER =================
  const completeMutation = useMutation({
    mutationFn: async (id) => {
      await api.put(`/orders/${id}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  // ================= CANCEL ORDER =================
  const cancelMutation = useMutation({
    mutationFn: async (id) => {
      await api.put(`/orders/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  // ================= CREATE ORDER =================
  const createMutation = useMutation({
    mutationFn: async (data) => {
      await api.post("/orders", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setForm({ customer_id: "", product_id: "", quantity: "" });
      setShowForm(false);
      setCurrentPage(1);
    },
  });

  const handleCreate = () => {
    if (!form.customer_id || !form.product_id || !form.quantity) return;
    createMutation.mutate({
      customer_id: parseInt(form.customer_id),
      product_id: parseInt(form.product_id),
      quantity: parseInt(form.quantity),
    });
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        <p className="text-gray-400">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        <p className="text-red-400">Failed to load orders</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-gray-400 text-sm">Order management system</p>
      </div>

      {/* TOP BAR */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["orders"] })}
          className="bg-green-500 px-4 py-2 rounded hover:bg-green-600"
        >
          Reload
        </button>

        <button
          onClick={exportCSV}
          className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
        >
          Export CSV
        </button>

        <button
          onClick={exportExcel}
          className="bg-emerald-600 px-4 py-2 rounded hover:bg-emerald-700"
        >
          Export Excel
        </button>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 ml-auto"
        >
          {showForm ? "Cancel" : "+ New Order"}
        </button>
      </div>

      {/* CREATE FORM */}
      {showForm && (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3">
          <h2 className="font-semibold text-white">New Order</h2>

          <select
            value={form.customer_id}
            onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
            className="w-full px-3 py-2 rounded bg-gray-900 border border-gray-700 text-white"
          >
            <option value="">Select Customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.country ? `(${c.country})` : ""}
              </option>
            ))}
          </select>

          <select
            value={form.product_id}
            onChange={(e) => setForm({ ...form, product_id: e.target.value })}
            className="w-full px-3 py-2 rounded bg-gray-900 border border-gray-700 text-white"
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — ${p.price} (Stock: {p.stock})
              </option>
            ))}
          </select>

          <input
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            placeholder="Quantity"
            type="number"
            className="w-full px-3 py-2 rounded bg-gray-900 border border-gray-700 text-white"
          />

          {createMutation.isError && (
            <p className="text-red-400 text-sm">
              {createMutation.error?.response?.data?.detail || "Failed to create order"}
            </p>
          )}

          <button
            onClick={handleCreate}
            disabled={createMutation.isPending}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating..." : "Create Order"}
          </button>
        </div>
      )}

      {/* ORDER LIST */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders found</p>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedOrders.map((order) => {
                const customer = customers.find(c => c.id === order.customer_id);
                const product = products.find(p => p.id === order.product_id);

                return (
                  <div
                    key={order.id}
                    className="flex justify-between items-center border-b border-gray-800 pb-3"
                  >
                    <div className="space-y-1">
                      <span className="font-medium">Order #{order.id}</span>
                      <div className="text-sm text-gray-400 space-x-3">
                        <span>Customer: {customer ? customer.name : `ID:${order.customer_id}`}</span>
                        <span>Product: {product ? product.name : `ID:${order.product_id}`}</span>
                        <span>Qty: {order.quantity}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-green-400 font-medium">${order.total}</span>

                      <span className={`text-xs px-2 py-1 rounded ${
                        order.status === "pending"
                          ? "bg-yellow-600 text-white"
                          : order.status === "completed"
                          ? "bg-green-700 text-white"
                          : "bg-gray-700 text-gray-400"
                      }`}>
                        {order.status}
                      </span>

                      {order.status === "pending" && (
                        <>
                          {role === "admin" && (
                            <button
                              onClick={() => completeMutation.mutate(order.id)}
                              disabled={completeMutation.isPending}
                              className="text-xs bg-green-700 hover:bg-green-800 px-3 py-1 rounded disabled:opacity-50"
                            >
                              Complete
                            </button>
                          )}
                          <button
                            onClick={() => cancelMutation.mutate(order.id)}
                            disabled={cancelMutation.isPending}
                            className="text-xs bg-red-700 hover:bg-red-800 px-3 py-1 rounded disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {order.status === "completed" && (
                        <button
                          onClick={() => generateInvoice(order)}
                          className="text-xs bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded"
                        >
                          Invoice
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">
                <p className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages} · {orders.length} orders
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
          </>
        )}
      </div>

    </div>
  );
}