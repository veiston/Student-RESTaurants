/**
 * Auth controller — manages authentication (token only)
 * Responsibilities:
 * - Login / logout
 * - Store token in localStorage
 * - Expose helpers
 */

import { loginRequest, registerRequest } from "../services/authService.js";

const TOKEN_KEY = "token";

function authController() {
  // ─────────────────────────────────────────────
  // GET TOKEN
  // ─────────────────────────────────────────────
  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  // ─────────────────────────────────────────────
  // SET TOKEN
  // ─────────────────────────────────────────────
  function setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      console.log("TOKEN FROM LOCAL STORAGE:", getToken());
      console.log("USER FROM LOCAL STORAGE:", localStorage.getItem("user"));
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  // ─────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────
  async function login(credentials) {
    const data = await loginRequest(credentials);

    // Store token
    setToken(data.token);

    return data;
  }

  // ─────────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────────
  async function register(payload) {
    return await registerRequest(payload);
  }

  // ─────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────
  function logout() {
    localStorage.removeItem("user");
    setToken(null);

    console.log("TOKEN FROM LOCAL STORAGE:", getToken());
    console.log("USER FROM LOCAL STORAGE:", localStorage.getItem("user"));
  }

  return {
    login,
    register,
    logout,
    getToken,
  };
}

// Export single auth controller instance
const auth = authController();
export default auth;
