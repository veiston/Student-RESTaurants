import auth from '../controllers/authController.js';
import profile from '../controllers/profileController.js';

export default function render(app) {
  app.innerHTML = `
    <div class="wrap">
      <header class="topbar">
        <div class="brand">Student RESTaurants</div>
        <nav>
          <a href="#/">Home</a>
          <a href="#/Discovery">Discovery</a>
          <a href="#/profile">Profile</a>
          <a href="#/login">Login</a>
        </nav>
      </header>

      <main>
        <section class="card">
          <h2>Login</h2>
          <form id="login-form">
            <label>
              Username
              <input id="username" type="text" autocomplete="username" />
            </label>
            <label>
              Password
              <input id="password" type="password" autocomplete="current-password" />
            </label>
            <div class="actions">
              <button class="btn" type="submit">Login</button>
            </div>
          </form>
          <p id="login-error" class="error" aria-live="polite"></p>
        </section>
      </main>
    </div>
  `;

  const form = app.querySelector('#login-form');
  const errorEl = app.querySelector('#login-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';

    const username = app.querySelector('#username').value.trim();
    const password = app.querySelector('#password').value.trim();

    if (!username || !password) {
      errorEl.textContent = 'Username and password are required.';
      return;
    }

    try {
      await auth.login({username, password});
      await profile.init();
      window.location.hash = '#/profile';
    } catch (err) {
      errorEl.textContent = 'Login failed. Check your credentials.';
    }
  });
}
