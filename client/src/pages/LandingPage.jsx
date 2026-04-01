import { Link } from "react-router-dom";

const FEATURES = [
  {
    title: "Live Tracking",
    description: "Give customers a clear, stage-by-stage view from confirmation to delivery."
  },
  {
    title: "Admin Control",
    description: "Create orders, update shipping stages, and keep every shipment in sync."
  },
  {
    title: "Analytics",
    description: "Monitor delivery mix, 7-day order flow, and revenue in one dashboard."
  }
];

function LandingPage() {
  return (
    <main className="page-shell landing-page">
      <section className="landing-hero card hero-card image-hero image-hero-home">
        <div className="image-hero-overlay" />
        <div className="image-hero-content">
          <p className="eyebrow">GoodShip</p>
          <h1>GoodShip</h1>
          <p className="hero-subtitle">Order Tracking System</p>
          <p className="hero-copy">
            Every package handled with care, precision, and on-time delivery.
          </p>
          <div className="hero-actions">
            <Link to="/client" className="button button-primary">
              Track an Order
            </Link>
            <Link to="/admin" className="button button-secondary">
              Admin Dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        {FEATURES.map((feature) => (
          <article key={feature.title} className="card feature-card">
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default LandingPage;
