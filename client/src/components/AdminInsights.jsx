const STATUS_ORDER = ["Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered"];

const formatInr = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getDateKey = (inputDate) => {
  const date = new Date(inputDate);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
};

const buildLast7Days = () => {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push({
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      key: getDateKey(date)
    });
  }
  return days;
};

function AdminInsights({ orders, feedbackSummary }) {
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((order) => order.status === "Delivered").length;
  const inTransitOrders = orders.filter((order) =>
    ["Confirmed", "Shipped", "Out for Delivery"].includes(order.status)
  ).length;
  const revenue = orders.reduce((sum, order) => sum + Number(order.price || 0), 0);
  const avgRating = feedbackSummary?.avgOverallRating;

  const statusCounts = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = orders.filter((order) => order.status === status).length;
    return acc;
  }, {});

  const maxStatusCount = Math.max(...Object.values(statusCounts), 1);

  const last7Days = buildLast7Days();
  const dayCountMap = last7Days.reduce((acc, day) => ({ ...acc, [day.key]: 0 }), {});

  orders.forEach((order) => {
    const key = getDateKey(order.date || order.createdAt);
    if (Object.prototype.hasOwnProperty.call(dayCountMap, key)) {
      dayCountMap[key] += 1;
    }
  });

  const maxDailyCount = Math.max(...Object.values(dayCountMap), 1);

  return (
    <section className="card">
      <h2>Insights</h2>
      <p className="section-copy">A live operational snapshot powered by the current order list.</p>

      <div className="metrics-grid">
        <article className="metric-card">
          <p>Total Orders</p>
          <h3>{totalOrders}</h3>
        </article>
        <article className="metric-card">
          <p>In Transit</p>
          <h3>{inTransitOrders}</h3>
        </article>
        <article className="metric-card">
          <p>Delivered</p>
          <h3>{deliveredOrders}</h3>
        </article>
        <article className="metric-card">
          <p>Revenue</p>
          <h3>{formatInr(revenue)}</h3>
        </article>
        <article className="metric-card">
          <p>Avg Rating</p>
          <h3>{avgRating ?? "—"}</h3>
        </article>
      </div>

      <div className="charts-grid">
        <article className="chart-card">
          <h3>Status Distribution</h3>
          <div className="status-bars">
            {STATUS_ORDER.map((status) => (
              <div key={status} className="status-bar-row">
                <span>{status}</span>
                <div className="status-bar-track">
                  <div
                    className="status-bar-fill"
                    style={{ width: `${(statusCounts[status] / maxStatusCount) * 100}%` }}
                  />
                </div>
                <strong>{statusCounts[status]}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="chart-card">
          <h3>Orders in Last 7 Days</h3>
          <div className="weekly-bars">
            {last7Days.map((day) => (
              <div key={day.key} className="weekly-bar-col">
                <div className="weekly-bar-wrap">
                  <div
                    className="weekly-bar-fill"
                    style={{ height: `${(dayCountMap[day.key] / maxDailyCount) * 100}%` }}
                  />
                </div>
                <strong>{dayCountMap[day.key]}</strong>
                <span>{day.label}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

export default AdminInsights;
