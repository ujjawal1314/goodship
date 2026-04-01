import { useState } from "react";
import axios from "axios";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import AdminLoginModal from "./components/AdminLoginModal";
import SharedHeader from "./components/SharedHeader";
import LandingPage from "./pages/LandingPage";
import AdminPage from "./pages/AdminPage";
import ClientPage from "./pages/ClientPage";
import {
  clearAdminToken,
  getAdminToken,
  getAuthHeaders,
  setAdminToken
} from "./utils/adminAuth";

import { API_BASE } from "./api/config";

const API_BASE_URL = API_BASE;
function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminFormData, setAdminFormData] = useState({ username: "", password: "" });
  const [adminAuthError, setAdminAuthError] = useState("");
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);

  const verifyStoredAdminToken = async (token) => {
    const { data } = await axios.get(`${API_BASE_URL}/auth/verify`, {
      headers: getAuthHeaders(token)
    });
    return data;
  };

  const openAdminModal = () => {
    setAdminAuthError("");
    setIsAdminModalOpen(true);
  };

  const closeAdminModal = () => {
    setAdminAuthError("");
    setAdminFormData({ username: "", password: "" });
    setIsAdminModalOpen(false);
  };

  const handleAdminFieldChange = (event) => {
    const { name, value } = event.target;
    setAdminFormData((current) => ({ ...current, [name]: value }));
  };

  const handleAdminClick = async () => {
    clearAdminToken();
    openAdminModal();
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    setAdminAuthLoading(true);
    setAdminAuthError("");

    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/login`, adminFormData);
      setAdminToken(data.token);
      closeAdminModal();
      navigate("/admin");
    } catch (error) {
      setAdminAuthError(error.response?.data?.message || "Login failed.");
    } finally {
      setAdminAuthLoading(false);
    }
  };

  const handleAdminLogout = () => {
    clearAdminToken();
    closeAdminModal();
    navigate("/", { replace: true });
  };

  const handleAdminUnauthorized = () => {
    clearAdminToken();
    openAdminModal();
  };

  return (
    <div className="app-shell">
      <SharedHeader
        onAdminClick={handleAdminClick}
        showLogout={location.pathname === "/admin" && !!getAdminToken()}
        onLogout={handleAdminLogout}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/client" element={<ClientPage apiBaseUrl={API_BASE_URL} />} />
        <Route
          path="/admin"
          element={<AdminPage apiBaseUrl={API_BASE_URL} onUnauthorized={handleAdminUnauthorized} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AdminLoginModal
        isOpen={isAdminModalOpen}
        formData={adminFormData}
        loading={adminAuthLoading}
        error={adminAuthError}
        onChange={handleAdminFieldChange}
        onClose={closeAdminModal}
        onSubmit={handleAdminLogin}
      />
    </div>
  );
}

export default App;
