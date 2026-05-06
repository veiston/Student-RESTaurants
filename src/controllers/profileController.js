/**
 * Profile controller responsibilities:
 * - Fetch user
 * - Update profile
 * - Upload avatar
 * - Sync localStorage
 */

import {
  fetchCurrentUserRequest,
  updateUserRequest,
  uploadAvatarRequest,
} from "../services/profileService.js";

import auth from "./authController.js";

const USER_KEY = "user";
const PREFS_KEY = "preferences";

function profileController() {
  // ─────────────────────────────────────────────
  // GET LOCAL USER
  // ─────────────────────────────────────────────
  function getLocalUser() {
    if (!auth.getToken()) return null; // always fresh token check
    return JSON.parse(localStorage.getItem(USER_KEY));
  }

  // ─────────────────────────────────────────────
  // INIT / FETCH USER
  // ─────────────────────────────────────────────
  async function init() {
    const token = auth.getToken();
    if (!token) return null;

    const user = await fetchCurrentUserRequest(token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  // ─────────────────────────────────────────────
  // SAVE PROFILE
  // ─────────────────────────────────────────────
  async function saveProfile({ username, email, password, preferences }) {
    const token = auth.getToken();

    const payload = { username, email, preferences };
    if (password) payload.password = password;

    const updatedUser = await updateUserRequest(payload, token);

    // sync localStorage
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

    if (preferences) {
      localStorage.setItem(PREFS_KEY, JSON.stringify(preferences));
    }

    return updatedUser;
  }

  // ─────────────────────────────────────────────
  // CHANGE AVATAR
  // ─────────────────────────────────────────────
  async function changeAvatar(file) {
    const token = auth.getToken();

    const res = await uploadAvatarRequest(file, token);

    const user = getLocalUser();

    const updatedUser = {
      ...user,
      avatar: res.avatar,
    };

    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

    return updatedUser;
  }

  return {
    init,
    saveProfile,
    changeAvatar,
    getLocalUser,
  };
}

const profile = profileController();
export default profile;
