import { Fragment, useEffect, useState } from "react";

const ORDER_STATUSES = ["Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered"];

const getVehicleBadgeClass = (vehicleType = "") => {
  const normalized = vehicleType.toLowerCase();

  if (normalized === "bike") {
    return "vehicle-badge vehicle-badge-bike";
  }

  if (normalized === "scooter") {
    return "vehicle-badge vehicle-badge-scooter";
  }

  if (normalized === "van") {
    return "vehicle-badge vehicle-badge-van";
  }

  return "vehicle-badge";
};

function OrderList({
  orders,
  loading,
  error,
  allowStatusUpdate = false,
  onStatusUpdate,
  updatingOrderId = "",
  allPartners = [],
  partnersLoading = false
}) {
  const [statusDrafts, setStatusDrafts] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [assignmentDraft, setAssignmentDraft] = useState(null);
  const [partnersExpanded, setPartnersExpanded] = useState(false);
  const PAGE_SIZE = 8;

  useEffect(() => {
    setStatusDrafts((prev) => {
      const next = { ...prev };
      orders.forEach((order) => {
        next[order.orderId] = order.status;
      });
      return next;
    });
  }, [orders]);

  useEffect(() => {
    if (!assignmentDraft) {
      return;
    }

    const orderStillExists = orders.some((order) => order.orderId === assignmentDraft.orderId);
    if (!orderStillExists) {
      setAssignmentDraft(null);
    }
  }, [assignmentDraft, orders]);

  const setDraftStatus = (orderId, status) => {
    setStatusDrafts((prev) => ({ ...prev, [orderId]: status }));
  };

  const openAssignmentDraft = (order, source = "status") => {
    setAssignmentDraft({
      orderId: order.orderId,
      previousStatus: order.status,
      mode: "auto",
      selectedPartnerId: "",
      error: "",
      source
    });
  };

  const closeAssignmentDraft = (orderId, previousStatus) => {
    setStatusDrafts((prev) => ({
      ...prev,
      [orderId]: previousStatus || prev[orderId]
    }));
    setAssignmentDraft((current) => (current?.orderId === orderId ? null : current));
  };

  const handleStatusSelection = (order, nextStatus) => {
    setDraftStatus(order.orderId, nextStatus);

    if (nextStatus === "Out for Delivery" && order.status !== "Out for Delivery") {
      openAssignmentDraft(order);
      return;
    }

    if (assignmentDraft?.orderId === order.orderId) {
      setAssignmentDraft(null);
    }
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
  const availablePartners = allPartners.filter((partner) => partner.available);

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

  const renderDeliveryPartnerCell = (order) => {
    if (!["Out for Delivery", "Delivered"].includes(order.status) || !order.deliveryPartner) {
      return "—";
    }

    return (
      <div className="partner-cell-card">
        <div className="partner-cell-topline">
          <div>
            <strong>{order.deliveryPartner.name}</strong>
            <p>{order.deliveryPartner.phone}</p>
          </div>
          {order.status === "Out for Delivery" ? (
            <button
              type="button"
              className="partner-reassign-button"
              onClick={() => openAssignmentDraft(order, "reassign")}
              aria-label={`Reassign delivery partner for order ${order.orderId}`}
            >
              🔄
            </button>
          ) : null}
        </div>
        <span className={getVehicleBadgeClass(order.deliveryPartner.vehicleType)}>
          {order.deliveryPartner.vehicleType}
        </span>
      </div>
    );
  };

  const renderAssignmentPanel = (order) => {
    if (!assignmentDraft || assignmentDraft.orderId !== order.orderId) {
      return null;
    }

    const isManual = assignmentDraft.mode === "manual";
    const noPartnersAvailable = availablePartners.length === 0;
    const confirmDisabled =
      updatingOrderId === order.orderId ||
      (isManual && (!assignmentDraft.selectedPartnerId || noPartnersAvailable));

    return (
      <tr className="assignment-row">
        <td colSpan={allowStatusUpdate ? 13 : 12}>
          <div className="assignment-panel">
            <div className="assignment-panel-header">
              <h3>Assign Delivery Partner</h3>
            </div>
            <div className="assignment-toggle-group">
              <button
                type="button"
                className={`button ${assignmentDraft.mode === "auto" ? "button-primary" : "button-secondary"}`}
                onClick={() =>
                  setAssignmentDraft((current) => ({
                    ...current,
                    mode: "auto",
                    selectedPartnerId: "",
                    error: ""
                  }))
                }
              >
                🎲 Auto Assign
              </button>
              <button
                type="button"
                className={`button ${assignmentDraft.mode === "manual" ? "button-primary" : "button-secondary"}`}
                onClick={() =>
                  setAssignmentDraft((current) => ({
                    ...current,
                    mode: "manual",
                    error: ""
                  }))
                }
              >
                👤 Pick Manually
              </button>
            </div>

            {isManual ? (
              <div className="assignment-manual-group">
                {noPartnersAvailable ? (
                  <p className="section-copy">No partners available</p>
                ) : (
                  <select
                    value={assignmentDraft.selectedPartnerId}
                    onChange={(e) =>
                      setAssignmentDraft((current) => ({
                        ...current,
                        selectedPartnerId: e.target.value,
                        error: ""
                      }))
                    }
                    disabled={updatingOrderId === order.orderId}
                  >
                    <option value="">Select a delivery partner</option>
                    {availablePartners.map((partner) => (
                      <option key={partner._id} value={partner._id}>
                        {partner.name} — {partner.phone} ({partner.vehicleType})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <p className="section-copy">A partner will be assigned randomly</p>
            )}

            {assignmentDraft.error ? <p className="error">{assignmentDraft.error}</p> : null}

            <div className="assignment-actions">
              <button
                type="button"
                className="button button-primary"
                disabled={confirmDisabled}
                onClick={async () => {
                  try {
                    await onStatusUpdate(
                      order.orderId,
                      "Out for Delivery",
                      assignmentDraft.mode === "manual"
                        ? assignmentDraft.selectedPartnerId
                        : undefined
                    );
                    setAssignmentDraft(null);
                    setDraftStatus(order.orderId, "Out for Delivery");
                  } catch (submitError) {
                    setAssignmentDraft((current) =>
                      current?.orderId === order.orderId
                        ? {
                            ...current,
                            error:
                              submitError?.response?.data?.message ||
                              submitError?.message ||
                              "Failed to assign delivery partner."
                          }
                        : current
                    );
                  }
                }}
              >
                {updatingOrderId === order.orderId ? "Assigning..." : "Confirm & Assign"}
              </button>
              <button
                type="button"
                className="assignment-cancel"
                onClick={() => closeAssignmentDraft(order.orderId, assignmentDraft.previousStatus)}
              >
                Cancel
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <>
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
                  <Fragment key={order._id}>
                    <tr>
                      <td>{order.orderId}</td>
                      <td>{new Date(order.date).toLocaleDateString()}</td>
                      <td>{order.transactionId || "-"}</td>
                      <td>Rs. {Number(order.price).toFixed(2)}</td>
                      <td>{order.productName}</td>
                      <td>{order.customerName}</td>
                      <td>{order.customerEmail || "-"}</td>
                      <td>{renderDeliveryPartnerCell(order)}</td>
                      <td>{order.shippingAddress || "-"}</td>
                      <td>{order.billingAddress || "-"}</td>
                      <td>{order.status}</td>
                      <td>{order.feedback?.submittedAt ? `⭐ ${order.feedback.overallRating}` : "Pending"}</td>
                      {allowStatusUpdate && (
                        <td>
                          <div className="status-actions">
                            <select
                              value={statusDrafts[order.orderId] || order.status}
                              onChange={(e) => handleStatusSelection(order, e.target.value)}
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
                              onClick={async () => {
                                try {
                                  await onStatusUpdate(
                                    order.orderId,
                                    statusDrafts[order.orderId] || order.status
                                  );
                                } catch (_saveError) {
                                  // Error state is handled by the parent component.
                                }
                              }}
                              disabled={
                                updatingOrderId === order.orderId ||
                                (statusDrafts[order.orderId] || order.status) === order.status ||
                                (statusDrafts[order.orderId] === "Out for Delivery" &&
                                  order.status !== "Out for Delivery")
                              }
                            >
                              {updatingOrderId === order.orderId ? "Saving..." : "Save"}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                    {renderAssignmentPanel(order)}
                  </Fragment>
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

      <section className="card">
        <button
          type="button"
          className="partners-toggle"
          onClick={() => setPartnersExpanded((prev) => !prev)}
        >
          <span>Delivery Partners</span>
          <span>{partnersExpanded ? "▲" : "▼"}</span>
        </button>

        {partnersExpanded ? (
          partnersLoading ? (
            <p>Loading delivery partners...</p>
          ) : (
            <div className="partners-grid">
              {allPartners.map((partner) => (
                <article key={partner._id} className="partner-panel-card">
                  <strong>{partner.name}</strong>
                  <p>{partner.phone}</p>
                  <span className={getVehicleBadgeClass(partner.vehicleType)}>{partner.vehicleType}</span>
                  <div className="partner-availability">
                    <span
                      className={`availability-dot${partner.available ? " available" : " unavailable"}`}
                    />
                    <span>{partner.available ? "Available" : "On Delivery"}</span>
                  </div>
                </article>
              ))}
              {!allPartners.length ? <p>No delivery partners found.</p> : null}
            </div>
          )
        ) : null}
      </section>
    </>
  );
}

export default OrderList;
