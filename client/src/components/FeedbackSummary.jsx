const renderStars = (rating) => {
  const rounded = Math.round(Number(rating || 0));
  return "★★★★★".split("").map((star, index) => (
    <span key={`${star}-${index}`} className={`rating-star${index < rounded ? " active" : ""}`}>
      ★
    </span>
  ));
};

function FeedbackSummary({ summary }) {
  const {
    totalFeedbacks,
    avgOverallRating,
    avgDeliveryPartnerRating,
    recommendPercent,
    recentComments
  } = summary;

  return (
    <section className="card">
      <h2>Customer Feedback Summary</h2>
      <p className="section-copy">A snapshot of customer satisfaction and recent delivery feedback.</p>

      <div className="metrics-grid">
        <article className="metric-card">
          <p>Total Feedbacks received</p>
          <h3>{totalFeedbacks}</h3>
        </article>
        <article className="metric-card">
          <p>Avg Overall Rating</p>
          <div className="rating-inline">
            <div className="rating-stars">{renderStars(avgOverallRating)}</div>
            <strong>{avgOverallRating ?? "—"}</strong>
          </div>
        </article>
        <article className="metric-card">
          <p>Avg Delivery Partner Rating</p>
          <div className="rating-inline">
            <div className="rating-stars">{renderStars(avgDeliveryPartnerRating)}</div>
            <strong>{avgDeliveryPartnerRating ?? "—"}</strong>
          </div>
        </article>
      </div>

      <article className="chart-card">
        <h3>Recommend %</h3>
        <div className="recommend-track">
          <div className="recommend-fill" style={{ width: `${recommendPercent || 0}%` }} />
        </div>
        <p>{recommendPercent || 0}% would recommend GoodShip</p>
      </article>

      <div className="comment-grid">
        {recentComments.length ? (
          recentComments.map((comment) => (
            <article key={`${comment.orderId}-${comment.comment}`} className="comment-card">
              <div className="comment-topline">
                <strong>{comment.orderId}</strong>
                <span className={`recommend-badge ${comment.wouldRecommend ? "yes" : "no"}`}>
                  Would recommend: {comment.wouldRecommend ? "Yes" : "No"}
                </span>
              </div>
              <div className="rating-inline compact">
                <div className="rating-stars">{renderStars(comment.overallRating)}</div>
                <span>{comment.overallRating}</span>
              </div>
              <p>{comment.comment}</p>
            </article>
          ))
        ) : (
          <p>No comments yet.</p>
        )}
      </div>
    </section>
  );
}

export default FeedbackSummary;
