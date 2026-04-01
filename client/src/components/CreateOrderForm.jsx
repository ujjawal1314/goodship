import { useState } from "react";
import axios from "axios";
import { getAuthHeaders } from "../utils/adminAuth";

function CreateOrderForm({ apiBaseUrl, authToken, onOrderCreated, onUnauthorized }) {
  const today = new Date();
  const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(today.getDate()).padStart(2, "0")}`;

  const [formData, setFormData] = useState({
    orderId: "",
    date: "",
    price: "",
    productName: "",
    customerName: "",
    customerEmail: "",
    shippingAddress: "",
    billingAddress: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    if (formData.date > todayDateString) {
      setError("Order date cannot be in the future.");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        price: Number(formData.price)
      };
      const { data } = await axios.post(`${apiBaseUrl}/orders`, payload, {
        headers: getAuthHeaders(authToken)
      });
      onOrderCreated(data);
      setMessage("Order created successfully.");
      setFormData({
        orderId: "",
        date: "",
        price: "",
        productName: "",
        customerName: "",
        customerEmail: "",
        shippingAddress: "",
        billingAddress: ""
      });
    } catch (err) {
      if (err.response?.status === 401) {
        onUnauthorized?.();
        return;
      }
      setError(err.response?.data?.message || "Failed to create order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card">
      <h2>Create Order</h2>
      <p className="section-copy">Add a new order record and initialize its shipment journey.</p>
      <form onSubmit={handleSubmit} className="form-grid">
        <input
          type="text"
          name="orderId"
          placeholder="Order ID"
          value={formData.orderId}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          max={todayDateString}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="productName"
          placeholder="Product Name"
          value={formData.productName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="customerName"
          placeholder="Customer Name"
          value={formData.customerName}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="customerEmail"
          placeholder="Customer Email"
          value={formData.customerEmail}
          onChange={handleChange}
          required
        />
        <textarea
          name="shippingAddress"
          placeholder="Shipping Address"
          value={formData.shippingAddress}
          onChange={handleChange}
          className="field-span-2"
          rows="3"
          required
        />
        <textarea
          name="billingAddress"
          placeholder="Billing Address"
          value={formData.billingAddress}
          onChange={handleChange}
          className="field-span-2"
          rows="3"
          required
        />
        <div className="submit-field">
          <button type="submit" className="button button-primary" disabled={submitting}>
            {submitting ? "Creating..." : "Create Order"}
          </button>
        </div>
      </form>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </section>
  );
}

export default CreateOrderForm;
