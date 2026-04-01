import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CreateOrderForm from "../components/CreateOrderForm";
import AdminInsights from "../components/AdminInsights";
import FeedbackSummary from "../components/FeedbackSummary";
import OrderList from "../components/OrderList";
import { getAdminToken, getAuthHeaders } from "../utils/adminAuth";

function AdminPage({ apiBaseUrl, onUnauthorized }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [feedbackSummary, setFeedbackSummary] = useState({
    totalFeedbacks: 0,
    avgOverallRating: null,
    avgDeliveryPartnerRating: null,
    recommendPercent: 0,
    recentComments: []
  });
  const [authChecking, setAuthChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [authToken, setAuthToken] = useState("");

  const handleUnauthorized = () => {
    onUnauthorized?.();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    return () => {
      localStorage.removeItem("goodship_admin_token");
    };
  }, []);

  const fetchOrders = async (token) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${apiBaseUrl}/orders`, {
        headers: getAuthHeaders(token)
      });
      setOrders(data);
    } catch (err) {
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      setError(err.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbackSummary = async (token) => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/feedback/summary`, {
        headers: getAuthHeaders(token)
      });
      setFeedbackSummary(data);
    } catch (err) {
      if (err.response?.status === 401) {
        handleUnauthorized();
      }
    }
  };

  useEffect(() => {
    const verifyAccess = async () => {
      const token = getAdminToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      try {
        await axios.get(`${apiBaseUrl}/auth/verify`, {
          headers: getAuthHeaders(token)
        });
        setAuthToken(token);
        await Promise.all([fetchOrders(token), fetchFeedbackSummary(token)]);
      } catch (_error) {
        handleUnauthorized();
      } finally {
        setAuthChecking(false);
      }
    };

    verifyAccess();
  }, []);

  const handleOrderCreated = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  const handleStatusUpdate = async (orderId, status) => {
    setUpdatingOrderId(orderId);
    setError("");
    try {
      const { data } = await axios.patch(
        `${apiBaseUrl}/orders/${orderId}/status`,
        { status },
        {
          headers: getAuthHeaders(authToken)
        }
      );
      setOrders((prev) => prev.map((order) => (order.orderId === orderId ? data : order)));
      await fetchFeedbackSummary(authToken);
    } catch (err) {
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      setError(err.response?.data?.message || "Failed to update order status.");
    } finally {
      setUpdatingOrderId("");
    }
  };

  if (authChecking) {
    return (
      <main className="page-shell">
        <section className="card intro-card">
          <h2>Admin Dashboard</h2>
          <p>Verifying admin access...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="card intro-card">
        <h2>Admin Dashboard</h2>
        <p>
          Create new orders, monitor operational metrics, and move shipments through each delivery
          stage.
        </p>
      </section>

      <CreateOrderForm
        apiBaseUrl={apiBaseUrl}
        authToken={authToken}
        onOrderCreated={handleOrderCreated}
        onUnauthorized={handleUnauthorized}
      />
      <AdminInsights orders={orders} feedbackSummary={feedbackSummary} />
      <FeedbackSummary summary={feedbackSummary} />

      <OrderList
        orders={orders}
        loading={loading}
        error={error}
        allowStatusUpdate
        onStatusUpdate={handleStatusUpdate}
        updatingOrderId={updatingOrderId}
      />
    </main>
  );
}

export default AdminPage;
