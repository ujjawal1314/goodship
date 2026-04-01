export const ADMIN_TOKEN_KEY = "goodship_admin_token";

export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

export const setAdminToken = (token) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const clearAdminToken = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

export const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`
});
