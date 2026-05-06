/**
 * Router.js — SPA router and shared navigation configuration
 *
 * Provides:
 * 1. Route definitions used by the Router, Navbar, and BottomNav.
 * 2. Hash-based navigation for SPA.
 * 3. Subscriber system for components to update on route changes.
 */
function Router() {
  let initialized = false;
  /**
   * Route definitions — Each route object may include:
   *   - path: the hash pattern for the route (e.g., "#/restaurants")
   *   - load: async function that dynamically imports the page module
   *   - labelKey: string key used in navigation labels
   *   - icon: icon filename for BottomNav (optional)
   *   - showInNav: boolean flag to include in Navbar/BottomNav
   */
  const routes = [
    {
      path: '#/',
      labelKey: 'Home',
      icon: 'nav-home',
      showInNav: true,
      load: () => import('./pages/Home.js'),
    },
    {
      path: '#/Discovery',
      labelKey: 'Discovery',
      icon: 'nav-list',
      showInNav: true,
      load: () => import('./pages/Discovery.js'),
    },
    {
      path: '#/profile',
      labelKey: 'Profile',
      icon: 'nav-profile',
      showInNav: true,
      load: () => import('./pages/Profile.js'),
    },
    {
      path: '#/login',
      showInNav: false,
      load: () => import('./pages/Login.js'),
    },
  ];

  /**
   * Subscribers array — components that react to route changes.
   * Each subscriber is a function that receives the current route object.
   */
  const routeSubscribers = [];

  /**
   * Subscribe a component to route changes.
   * Called whenever the route changes (hash change).
   *
   * callback - function receiving the current route
   */
  const handleSubscribe = (callback) => {
    if (typeof callback === 'function') {
      routeSubscribers.push(callback);
    }
  };

  /**
   * Resolve the current hash to a matching route object
   * Route object or null if no match
   */
  const resolve = () => {
    const hash = window.location.hash || '#/';
    const path = hash.split('?')[0];
    return routes.find((r) => r.path === path) || null;
  };

  /**
   * Handle a hash change: load the corresponding page and notify subscribers.
   */
  const handleRoute = async () => {
    const app = document.getElementById('app');
    const route = resolve();

    // Render Shared Layout
    app.innerHTML = `
      <div class="wrap">
        <header class="topbar">
          <a class="brand" href="#/">Student RESTaurants</a>
          <nav>
            ${routes
              .filter(r => r.showInNav)
              .map(r => `<a href="${r.path}" class="${window.location.hash === r.path ? 'active' : ''}">${r.labelKey}</a>`)
              .join('')}
            <a href="#/profile" class="${window.location.hash === '#/profile' ? 'active' : ''}">Profiili</a>
          </nav>
        </header>
        <main id="content"></main>
      </div>
    `;

    const content = app.querySelector('#content');

    // Notify all subscribed components
    routeSubscribers.forEach((subscriber) => subscriber(route));

    if (!route) {
      content.innerHTML = '<p>404 — Page not found</p>';
      return;
    }

    try {
      const pageModule = await route.load();
      await pageModule.default(content);
    } catch (err) {
      console.error('Failed to load route:', err);
      content.innerHTML = '<p>Something went wrong loading this page.</p>';
    }
  };

  /**
   * Initialize the router. Sets up the hashchange listener and loads the initial route.
   */
  const initRouter = () => {
    if (initialized) return;
    initialized = true;
    window.addEventListener('hashchange', handleRoute);
    handleRoute(); // load initial route
  };

  return {
    routes,
    initRouter,
    handleSubscribe,
  };
}

/**
 * Singleton router instance — shared across the entire app.
 */
export const router = Router();
