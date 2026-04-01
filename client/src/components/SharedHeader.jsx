import { NavLink, Link, useLocation } from "react-router-dom";

function SharedHeader({ onAdminClick, showLogout = false, onLogout }) {
  const location = useLocation();

  return (
    <header className="site-header">
      <div className="header-shell">
        <nav className="header-nav" aria-label="Primary">
          <NavLink
            to="/client"
            className={({ isActive }) => `tab-link${isActive ? " active" : ""}`}
          >
            Client
          </NavLink>
          <button
            type="button"
            onClick={onAdminClick}
            className={`tab-link${location.pathname === "/admin" ? " active" : ""}`}
          >
            Admin
          </button>
        </nav>

        <Link to="/" className="brand-lockup">
          <span className="brand-name">GoodShip</span>
          <span className="brand-subtitle">Order Tracking System</span>
        </Link>

        <div className="header-right">
          {showLogout ? (
            <button type="button" className="button button-secondary header-logout" onClick={onLogout}>
              Logout
            </button>
          ) : <div className="header-logout-spacer" aria-hidden="true" />}
        </div>
      </div>
    </header>
  );
}

export default SharedHeader;
