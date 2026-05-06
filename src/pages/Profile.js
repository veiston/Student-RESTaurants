import profile from '../controllers/profileController.js';
import auth from '../controllers/authController.js';
import { IMG_PATH } from '../constants.js';

export default async function render(app) {
  const user = profile.getLocalUser();

  if (!user) {
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
          <section class="card profile">
            <h2>Profiili</h2>
            <p class="meta">Kirjaudu sisään nähdäksesi profiilisi.</p>
            <div class="actions">
              <a class="btn" href="#/login">Kirjaudu</a>
            </div>
          </section>
        </main>
      </div>
    `;
    return;
  }

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

      <main class="grid">
        <section class="card">
          <h2>Profiili</h2>
          <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem;">
            <img id="avatar-img" src="${user.avatar ? IMG_PATH + user.avatar : 'https://placehold.co/100'}" alt="Avatar" style="width:100px; height:100px; border-radius:50%; object-fit:cover;">
            <div>
              <p><strong>${user.username}</strong></p>
              <p class="meta">${user.email}</p>
            </div>
          </div>

          <form id="avatar-form">
            <label>
              Vaihda profiilikuva
              <input type="file" id="avatar-input" accept="image/*">
            </label>
            <button class="btn ghost" type="submit">Lataa kuva</button>
          </form>

          <hr style="margin:1.5rem 0; border:0; border-top:1px solid var(--line);">

          <form id="update-form">
            <h3>Päivitä tiedot</h3>
            <label>
              Käyttäjätunnus
              <input type="text" id="username" value="${user.username}">
            </label>
            <label>
              Sähköposti
              <input type="text" id="email" value="${user.email}">
            </label>
            <div class="actions">
              <button class="btn" type="submit">Tallenna muutokset</button>
              <button class="btn ghost" id="logout" type="button">Kirjaudu ulos</button>
            </div>
          </form>
          <p id="profile-msg" style="margin-top:1rem;"></p>
        </section>
      </main>
    </div>
  `;

  const avatarForm = app.querySelector('#avatar-form');
  const updateForm = app.querySelector('#update-form');
  const msgEl = app.querySelector('#profile-msg');

  avatarForm.onsubmit = async (e) => {
    e.preventDefault();
    const file = app.querySelector('#avatar-input').files[0];
    if (!file) return;

    try {
      const updatedUser = await profile.changeAvatar(file);
      app.querySelector('#avatar-img').src = IMG_PATH + updatedUser.avatar;
      msgEl.textContent = 'Kuva päivitetty!';
      msgEl.className = '';
    } catch (err) {
      msgEl.textContent = 'Kuvan lataus epäonnistui.';
      msgEl.className = 'error';
    }
  };

  updateForm.onsubmit = async (e) => {
    e.preventDefault();
    const username = app.querySelector('#username').value.trim();
    const email = app.querySelector('#email').value.trim();

    try {
      await profile.saveProfile({ username, email });
      msgEl.textContent = 'Tiedot päivitetty!';
      msgEl.className = '';
    } catch (err) {
      msgEl.textContent = 'Päivitys epäonnistui.';
      msgEl.className = 'error';
    }
  };

  app.querySelector('#logout').onclick = () => {
    auth.logout();
    window.location.hash = '#/';
  };
}

