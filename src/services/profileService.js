/**
 * Profile API service — handles ONLY HTTP requests
 */

import { API_URL } from "../constants.js";

// ─────────────────────────────────────────────
// GET CURRENT USER
// ─────────────────────────────────────────────
export async function fetchCurrentUserRequest(token) {
  const res = await fetch(`${API_URL}/users/token`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  console.log("FETCH CURRENT USER RESPONSE:", data);

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch user");
  }

  return data;
}

// ─────────────────────────────────────────────
// UPLOAD AVATAR
// ─────────────────────────────────────────────
export async function uploadAvatarRequest(file, token) {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await fetch(`${API_URL}/users/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();
  console.log("UPLOAD AVATAR RESPONSE:", data);

  if (!res.ok) {
    throw new Error(data.message || "Avatar upload failed");
  }

  return data.data;
}

// ─────────────────────────────────────────────
// UPDATE USER
// ─────────────────────────────────────────────
export async function updateUserRequest(payload, token) {
  const res = await fetch(`${API_URL}/users`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  console.log("UPDATE USER RESPONSE:", data);

  if (!res.ok) {
    throw new Error(data.message || "Failed to update user");
  }

  return data.data;
}
