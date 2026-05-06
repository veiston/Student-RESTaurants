/**
 * Discovery controller responsibilities:
 * - Fetch and cache restaurants
 * - Fetch daily and weekly menus per restaurant
 * - Persist favourite restaurant to API and localStorage
 */

import {
  fetchRestaurantsRequest,
  fetchRestaurantRequest,
  fetchDailyMenuRequest,
  fetchWeeklyMenuRequest,
  saveFavouriteRestaurantRequest,
} from "../services/discoveryService.js";

import auth from "./authController.js";

const RESTAURANTS_KEY = "restaurants";
const USER_KEY = "user";

function discoveryController() {
  // ─────────────────────────────────────────────
  // GET CACHED RESTAURANTS
  // ─────────────────────────────────────────────
  function getLocalRestaurants() {
    const raw = localStorage.getItem(RESTAURANTS_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  // ─────────────────────────────────────────────
  // INIT / FETCH ALL RESTAURANTS
  // ─────────────────────────────────────────────
  async function init() {
    const data = await fetchRestaurantsRequest();
    // API returns { restaurants: [...] }
    const restaurants = data.restaurants ?? data;

    localStorage.setItem(RESTAURANTS_KEY, JSON.stringify(restaurants));

    return restaurants;
  }

  // ─────────────────────────────────────────────
  // GET SINGLE RESTAURANT
  // ─────────────────────────────────────────────
  async function getRestaurant(id) {
    return await fetchRestaurantRequest(id);
  }

  // ─────────────────────────────────────────────
  // GET DAILY MENU
  // ─────────────────────────────────────────────
  async function getDailyMenu(id, lang = "en") {
    return await fetchDailyMenuRequest(id, lang);
  }

  // ─────────────────────────────────────────────
  // GET WEEKLY MENU
  // ─────────────────────────────────────────────
  async function getWeeklyMenu(id, lang = "en") {
    return await fetchWeeklyMenuRequest(id, lang);
  }

  // ─────────────────────────────────────────────
  // GET FAVOURITE RESTAURANT ID
  // Read from the locally stored user object.
  // Returns null if not logged in or no favourite set.
  // ─────────────────────────────────────────────
  function getLocalFavourite() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user.favouriteRestaurant ?? null;
  }

  // ─────────────────────────────────────────────
  // SAVE FAVOURITE RESTAURANT
  // Persists to API and syncs localStorage user object.
  // Passing null clears the favourite.
  // ─────────────────────────────────────────────
  async function saveFavourite(restaurantId) {
    const token = auth.getToken();
    if (!token) return; // not logged in — silently skip

    const data = await saveFavouriteRestaurantRequest(restaurantId, token);

    // Sync the updated user back to localStorage
    if (data.data) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.data));
    }

    return data;
  }

  return {
    init,
    getRestaurant,
    getDailyMenu,
    getWeeklyMenu,
    getLocalRestaurants,
    getLocalFavourite,
    saveFavourite,
  };
}

const discovery = discoveryController();
export default discovery;
