/**
 * Auth API service — handles ONLY HTTP requests
 */

import { API_URL } from "../constants.js";

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
export async function loginRequest({ username, password }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  console.log("LOGIN RESPONSE:", data);

  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
}

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────
export async function registerRequest({ username, email, password }) {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await res.json();
  console.log("REGISTER RESPONSE:", data);

  if (!res.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
}
