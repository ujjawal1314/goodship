import { useEffect, useState } from "react";

const ORDER_STATUSES = ["Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered"];

function OrderList({
  orders,
  loading,
  error,
  allowStatusUpdate = false,
  onStatusUpdate,
  updatingOrderId = ""
}) {
  const [statusDrafts, setStatusDrafts] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  useEffect(() => {
    setStatusDrafts((prev) => {
      const next = { ...prev };
      orders.forEach((order) => {
        if (!next[order.orderId]) {
          next[order.orderId] = order.status;
        }
      });
      return next;
    });
  }, [orders]);

  const setDraftStatus = (orderId, status) => {
    setStatusDrafts((prev) => ({ ...prev, [orderId]: status }));
  };

  const handleSearch = () => {
    setSearchQuery(searchInput.trim().toLowerCase());
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) {
      return true;
    }
    const searchableText = [
      order.orderId,
      order.transactionId,
      order.productName,
      order.customerName,
      order.deliveryPartner?.name,
      order.shippingAddress,
      order.billingAddress,
      order.status
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(searchQuery);
  });

  const totalPages = Math.max(Math.ceil(filteredOrders.length / PAGE_SIZE), 1);
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const exportCsv = () => {
    if (!filteredOrders.length) {
      return;
    }

    const headers = [
      "Order ID",
      "Date",
      "Transaction ID",
      "Price (INR)",
      "Product",
      "Customer",
      "Customer Email",
      "Delivery Partner",
      "Shipping Address",
      "Billing Address",
      "Status",
      "Feedback"
    ];

    const escapeValue = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const rows = filteredOrders.map((order) => [
      order.orderId,
      new Date(order.date).toLocaleDateString(),
      order.transactionId || "",
      Number(order.price || 0).toFixed(2),
      order.productName || "",
      order.customerName || "",
      order.customerEmail || "",
      order.deliveryPartner?.name || "",
      order.shippingAddress || "",
      order.billingAddress || "",
      order.status || "",
      order.feedback?.overallRating ?? ""
    ]);

    const csv = [headers, ...rows].map((row) => row.map(escapeValue).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="card">
      <h2>Orders Table</h2>
      <p className="section-copy">Review every order and update its shipping stage inline.</p>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by order ID, customer, product, transaction..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="button" onClick={handleSearch} className="button button-primary">
          Search
        </button>
        <button type="button" onClick={handleClearSearch} className="button button-secondary">
          Clear
        </button>
        <button type="button" onClick={exportCsv} className="button button-secondary">
          Export CSV
        </button>
      </div>
      {loading && <p>Loading orders...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !orders.length && <p>No orders yet.</p>}
      {!loading && !!orders.length && !!searchQuery && (
        <p>Showing {filteredOrders.length} result(s) for "{searchQuery}"</p>
      )}
      {!loading && !!orders.length && (
        <p>
          Page {safePage} of {totalPages}
        </p>
      )}

      {!!orders.length && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Transaction ID</th>
                <th>Price (INR)</th>
                <th>Product</th>
                <th>Customer</th>
                <th>Customer Email</th>
                <th>Delivery Partner</th>
                <th>Shipping Address</th>
                <th>Billing Address</th>
                <th>Status</th>
                <th>Feedback</th>
                {allowStatusUpdate && <th>Update Stage</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderId}</td>
                  <td>{new Date(order.date).toLocaleDateString()}</td>
                  <td>{order.transactionId || "-"}</td>
                  <td>Rs. {Number(order.price).toFixed(2)}</td>
                  <td>{order.productName}</td>
                  <td>{order.customerName}</td>
                  <td>{order.customerEmail || "-"}</td>
                  <td>{order.deliveryPartner?.name || "—"}</td>
                  <td>{order.shippingAddress || "-"}</td>
                  <td>{order.billingAddress || "-"}</td>
                  <td>{order.status}</td>
                  <td>{order.feedback?.submittedAt ? `⭐ ${order.feedback.overallRating}` : "Pending"}</td>
                  {allowStatusUpdate && (
                    <td>
                      <div className="status-actions">
                        <select
                          value={statusDrafts[order.orderId] || order.status}
                          onChange={(e) => setDraftStatus(order.orderId, e.target.value)}
                          disabled={updatingOrderId === order.orderId}
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="button button-primary"
                          onClick={() =>
                            onStatusUpdate(order.orderId, statusDrafts[order.orderId] || order.status)
                          }
                          disabled={
                            updatingOrderId === order.orderId ||
                            (statusDrafts[order.orderId] || order.status) === order.status
                          }
                        >
                          {updatingOrderId === order.orderId ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && !!orders.length && !filteredOrders.length && <p>No matching orders found.</p>}
      {!loading && filteredOrders.length > PAGE_SIZE && (
        <div className="pagination">
          <button
            type="button"
            className="button button-secondary"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          <button
            type="button"
            className="button button-secondary"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}

export default OrderList;
