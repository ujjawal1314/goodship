import TrackOrder from "../components/TrackOrder";

function ClientPage({ apiBaseUrl }) {
  return (
    <main className="page-shell client-page">
      <section className="card client-hero image-hero image-hero-client">
        <div className="image-hero-overlay" />
        <div className="image-hero-content client-hero-content">
          <p className="eyebrow">Tracking Portal</p>
          <h2>Customer Tracking Portal</h2>
          <p className="client-hero-copy">
            Enter an order ID to view product details, delivery progress, and the latest shipment
            stage in real time.
          </p>
        </div>
      </section>
      <TrackOrder apiBaseUrl={apiBaseUrl} />
    </main>
  );
}

export default ClientPage;
