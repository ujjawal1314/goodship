function AdminLoginModal({
  isOpen,
  formData,
  loading,
  error,
  onChange,
  onClose,
  onSubmit
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal-card" onClick={(event) => event.stopPropagation()}>
        <h2>Admin Access</h2>
        <p>Sign in to open the GoodShip admin dashboard.</p>

        <form className="admin-modal-form" onSubmit={onSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={onChange}
            autoComplete="username"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={onChange}
            autoComplete="current-password"
            required
          />
          <button type="submit" className="button button-primary admin-modal-submit" disabled={loading}>
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

        {error ? <p className="error">{error}</p> : null}

        <button type="button" className="admin-modal-cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default AdminLoginModal;
