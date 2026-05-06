/**
 * Discovery API service — handles ONLY HTTP requests
 */

import { API_URL } from "../constants.js";

// ─────────────────────────────────────────────
// GET ALL RESTAURANTS
// ─────────────────────────────────────────────
export async function fetchRestaurantsRequest() {
  const res = await fetch(`${API_URL}/restaurants`);
  const data = await res.json();

  console.log("FETCH RESTAURANTS RESPONSE:", data);

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch restaurants");
  }

  return data;
}

// ─────────────────────────────────────────────
// GET SINGLE RESTAURANT
// ─────────────────────────────────────────────
export async function fetchRestaurantRequest(id) {
  const res = await fetch(`${API_URL}/restaurants/${id}`);
  const data = await res.json();

  console.log("FETCH RESTAURANT RESPONSE:", data);

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch restaurant");
  }

  return data;
}

// ─────────────────────────────────────────────
// GET DAILY MENU
// ─────────────────────────────────────────────
export async function fetchDailyMenuRequest(id, lang = "en") {
  const res = await fetch(`${API_URL}/restaurants/daily/${id}/${lang}`);
  const data = await res.json();

  console.log("FETCH DAILY MENU RESPONSE:", data);

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch daily menu");
  }

  return data;
}

// ─────────────────────────────────────────────
// GET WEEKLY MENU
// ─────────────────────────────────────────────
export async function fetchWeeklyMenuRequest(id, lang = "en") {
  const res = await fetch(`${API_URL}/restaurants/weekly/${id}/${lang}`);
  const data = await res.json();

  console.log("FETCH WEEKLY MENU RESPONSE:", data);

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch weekly menu");
  }

  return data;
}

// ─────────────────────────────────────────────
// SAVE FAVOURITE RESTAURANT
// ─────────────────────────────────────────────
export async function saveFavouriteRestaurantRequest(restaurantId, token) {
  const res = await fetch(`${API_URL}/users`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ favouriteRestaurant: restaurantId }),
  });

  const data = await res.json();

  console.log("SAVE FAVOURITE RESPONSE:", data);

  if (!res.ok) {
    throw new Error(data.message || "Failed to save favourite restaurant");
  }

  return data;
}
