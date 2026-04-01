import { useEffect, useState } from "react";
import axios from "axios";

const STEPS = ["Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered"];

const formatTimelineDate = (value) => {
  if (!value) {
    return "Pending";
  }
  return new Date(value).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const formatOrderDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

const renderStars = (rating) =>
  [1, 2, 3, 4, 5].map((value) => (
    <span key={value} className={`rating-star${value <= Number(rating || 0) ? " active" : ""}`}>
      ★
    </span>
  ));

function TrackOrder({ apiBaseUrl }) {
  const [orderId, setOrderId] = useState("");
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [feedbackState, setFeedbackState] = useState({
    overallRating: 0,
    deliveryPartnerRating: 0,
    comment: "",
    wouldRecommend: null
  });
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTrackedOrder = async (id) => {
    const { data } = await axios.get(`${apiBaseUrl}/orders/${id}`);
    setTrackedOrder(data);
  };

  useEffect(() => {
    const fetchDeliveryDetails = async () => {
      if (!trackedOrder || trackedOrder.status !== "Out for Delivery") {
        setDeliveryDetails(null);
        return;
      }

      try {
        const { data } = await axios.get(`${apiBaseUrl}/orders/${trackedOrder.orderId}/delivery`);
        setDeliveryDetails(data);
      } catch (_error) {
        setDeliveryDetails(null);
      }
    };

    fetchDeliveryDetails();
  }, [trackedOrder, apiBaseUrl]);

  const handleTrack = async (e) => {
    e.preventDefault();
    setError("");
    setFeedbackError("");
    setFeedbackMessage("");
    setTrackedOrder(null);
    setLoading(true);
    try {
      await fetchTrackedOrder(orderId.trim());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to track order.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!trackedOrder) {
      return;
    }

    setError("");
    try {
      await fetchTrackedOrder(trackedOrder.orderId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to refresh order status.");
    }
  };

  const getStepClassName = (step) => {
    if (!trackedOrder) {
      return "step";
    }
    const currentStepIndex = STEPS.indexOf(trackedOrder.status);
    const stepIndex = STEPS.indexOf(step);
    return stepIndex <= currentStepIndex ? "step active" : "step";
  };

  const isStepActive = (step) => {
    if (!trackedOrder) {
      return false;
    }
    return STEPS.indexOf(step) <= STEPS.indexOf(trackedOrder.status);
  };

  const getStatusTimestamp = (step) => {
    if (!trackedOrder) {
      return null;
    }

    const history = Array.isArray(trackedOrder.statusHistory) ? trackedOrder.statusHistory : [];
    const match = history.find((entry) => entry.status === step);
    if (match?.at) {
      return match.at;
    }

    const currentStepIndex = STEPS.indexOf(trackedOrder.status);
    const stepIndex = STEPS.indexOf(step);
    if (stepIndex <= currentStepIndex && trackedOrder.updatedAt) {
      return trackedOrder.updatedAt;
    }
    return null;
  };

  const updateFeedbackField = (name, value) => {
    setFeedbackState((current) => ({ ...current, [name]: value }));
  };

  const handleFeedbackSubmit = async (event) => {
    event.preventDefault();
    if (!trackedOrder) {
      return;
    }

    setSubmittingFeedback(true);
    setFeedbackError("");
    setFeedbackMessage("");

    try {
      const payload = {
        overallRating: feedbackState.overallRating,
        deliveryPartnerRating: feedbackState.deliveryPartnerRating,
        comment: feedbackState.comment,
        wouldRecommend: feedbackState.wouldRecommend
      };
      const { data } = await axios.post(`${apiBaseUrl}/orders/${trackedOrder.orderId}/feedback`, payload);
      setTrackedOrder((current) => ({
        ...current,
        feedback: {
          ...payload,
          submittedAt: new Date().toISOString()
        }
      }));
      setFeedbackMessage(data.message);
    } catch (submitError) {
      setFeedbackError(submitError.response?.data?.message || "Failed to submit feedback.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const hasSubmittedFeedback = Boolean(trackedOrder?.feedback?.submittedAt);

  return (
    <section className="card track-panel">
      <h2>Track Order</h2>
      <p className="section-copy">Find a shipment by its order ID and review the full journey.</p>
      <form onSubmit={handleTrack} className="search-bar">
        <input
          type="text"
          placeholder="Enter Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          required
        />
        <button type="submit" className="button button-primary" disabled={loading}>
          {loading ? "Tracking..." : "Track"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {trackedOrder && (
        <div className="tracking-result">
          <div className="result-grid">
            <div className="detail-item">
              <span>Product</span>
              <strong>{trackedOrder.productName}</strong>
            </div>
            <div className="detail-item">
              <span>Customer</span>
              <strong>{trackedOrder.customerName}</strong>
            </div>
            <div className="detail-item">
              <span>Price</span>
              <strong>
                Rs. {Number(trackedOrder.price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="detail-item">
              <span>Date</span>
              <strong>{formatOrderDate(trackedOrder.date)}</strong>
            </div>
            <div className="detail-item detail-item-wide">
              <span>Shipping Address</span>
              <strong>{trackedOrder.shippingAddress || "-"}</strong>
            </div>
            <div className="detail-item detail-item-wide">
              <span>Billing Address</span>
              <strong>{trackedOrder.billingAddress || "-"}</strong>
            </div>
          </div>

          {trackedOrder.status === "Out for Delivery" && deliveryDetails ? (
            <div className="delivery-cards">
              <article className="delivery-partner-card">
                <h3>Your delivery partner is on the way!</h3>
                <p className="delivery-partner-icon">🚴</p>
                <strong>{deliveryDetails.partnerName}</strong>
                <p>{deliveryDetails.partnerPhone}</p>
                <span className="vehicle-badge">{deliveryDetails.vehicleType}</span>
              </article>

              <article className="parcel-otp-card">
                <h3>Show this OTP to receive your parcel</h3>
                <p>This was also sent to your email.</p>
                <p>OTP delivered to your registered email.</p>
              </article>
            </div>
          ) : null}

          <div className="timeline-card">
            <div className="timeline-heading">
              <div>
                <h3>Delivery Timeline</h3>
                <p>Current stage: {trackedOrder.status}</p>
              </div>
              <button type="button" onClick={handleRefresh} className="button button-secondary">
                Refresh
              </button>
            </div>

            <div className="progress">
              {STEPS.map((step, index) => (
                <div key={step} className={getStepClassName(step)}>
                  <span className="circle">{index + 1}</span>
                  <span className="label">{step}</span>
                </div>
              ))}
            </div>

            <div className="timeline">
              {STEPS.map((step) => (
                <div key={step} className={`timeline-row${isStepActive(step) ? " active" : ""}`}>
                  <span className="timeline-step">{step}</span>
                  <span className="timeline-time">{formatTimelineDate(getStatusTimestamp(step))}</span>
                </div>
              ))}
            </div>
          </div>

          {trackedOrder.status === "Delivered" && !hasSubmittedFeedback ? (
            <form className="feedback-card" onSubmit={handleFeedbackSubmit}>
              <h3>How was your experience?</h3>

              <div className="feedback-group">
                <span>Overall Rating</span>
                <div className="rating-picker">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={`overall-${value}`}
                      type="button"
                      className={`star-button${value <= feedbackState.overallRating ? " active" : ""}`}
                      onClick={() => updateFeedbackField("overallRating", value)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="feedback-group">
                <span>Rate your delivery partner</span>
                <div className="rating-picker">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={`partner-${value}`}
                      type="button"
                      className={`star-button${value <= feedbackState.deliveryPartnerRating ? " active" : ""}`}
                      onClick={() => updateFeedbackField("deliveryPartnerRating", value)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={feedbackState.comment}
                onChange={(event) => updateFeedbackField("comment", event.target.value)}
                rows="4"
                placeholder="Tell us about your delivery experience..."
              />

              <div className="feedback-group">
                <span>Would you recommend GoodShip?</span>
                <div className="recommend-toggle">
                  <button
                    type="button"
                    className={`recommend-option${feedbackState.wouldRecommend === true ? " active" : ""}`}
                    onClick={() => updateFeedbackField("wouldRecommend", true)}
                  >
                    👍 Yes
                  </button>
                  <button
                    type="button"
                    className={`recommend-option${feedbackState.wouldRecommend === false ? " active" : ""}`}
                    onClick={() => updateFeedbackField("wouldRecommend", false)}
                  >
                    👎 No
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="button button-primary feedback-submit"
                disabled={
                  submittingFeedback ||
                  !feedbackState.overallRating ||
                  !feedbackState.deliveryPartnerRating ||
                  feedbackState.wouldRecommend === null
                }
              >
                {submittingFeedback ? "Submitting..." : "Submit Feedback"}
              </button>

              {feedbackError ? <p className="error">{feedbackError}</p> : null}
              {feedbackMessage ? (
                <p className="success">🎉 Thank you for your feedback, {trackedOrder.customerName}!</p>
              ) : null}
            </form>
          ) : null}

          {trackedOrder.status === "Delivered" && hasSubmittedFeedback ? (
            <article className="feedback-card">
              <h3>✓ You've already rated this order</h3>
              <div className="rating-inline">
                <div className="rating-stars">{renderStars(trackedOrder.feedback.overallRating)}</div>
                <strong>{trackedOrder.feedback.overallRating}/5</strong>
              </div>
              {trackedOrder.feedback.comment ? <p>{trackedOrder.feedback.comment}</p> : null}
              <p>Would recommend: {trackedOrder.feedback.wouldRecommend ? "Yes" : "No"}</p>
            </article>
          ) : null}
        </div>
      )}
    </section>
  );
}

export default TrackOrder;
