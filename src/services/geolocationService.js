/**
 * Geolocation service — wraps the browser Geolocation API.
 * Provides a clean promise-based interface for requesting user location.
 */

// ─────────────────────────────────────────────
// GET USER POSITION
// ─────────────────────────────────────────────

/**
 * Requests the user's current position from the browser.
 * Returns a promise that resolves with { lat, lng } or rejects with an error.
 *
 * [options] - Optional browser geolocation options.
 */
export function getUserPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000, // cache position for 1 minute
        ...options,
      },
    );
  });
}
