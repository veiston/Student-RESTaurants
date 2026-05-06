import profile from '../controllers/profileController.js';
import auth from '../controllers/authController.js';
import discovery from '../controllers/discoveryController.js';
import {IMG_PATH} from '../constants.js';

export default async function render(app) {
  const user = profile.getLocalUser();
  if (!user)
    return (app.innerHTML = `<section class="card container-sm text-center"><h2>Profiili</h2><a class="btn" href="#/login">Kirjaudu</a></section>`);

  const favId = discovery.getLocalFavourite();
  const restaurants = discovery.getLocalRestaurants();
  const favName =
    restaurants?.find((r) => r._id === favId)?.name || 'Ei suosikkia';

  app.innerHTML = `
    <div class="grid">
      <section class="card text-center">
        <img id="a-i" src="${user.avatar ? IMG_PATH + user.avatar : 'https://placehold.co/120'}" class="avatar-profile">
        <h3>${user.username}</h3><p class="meta">${user.email}</p>
        <form id="a-f" class="mt-1"><input type="file" id="a-p" accept="image/*" class="font-xs"><button class="btn ghost w-full mt-1">Lataa</button></form>
      </section>
      <div class="list">
        <section class="card"><h2>Suosikki</h2><div class="chip active">${favName}</div></section>
        <section class="card">
          <h2>Tiedot</h2>
          <form id="u-f">
            <label>Käyttäjätunnus <input id="u" value="${user.username}"></label>
            <label>Sähköposti <input id="e" value="${user.email}"></label>
            <div class="flex-gap-1 mt-1"><button class="btn">Tallenna</button><button class="btn ghost" id="l-o" type="button">Ulos</button></div>
          </form>
        </section>
      </div>
    </div>`;

  app.querySelector('#a-f').onsubmit = async (e) => {
    e.preventDefault();
    const f = app.querySelector('#a-p').files[0];
    if (f)
      try {
        const u = await profile.changeAvatar(f);
        app.querySelector('#a-i').src = IMG_PATH + u.avatar;
      } catch (e) {
        alert('Error');
      }
  };
  app.querySelector('#u-f').onsubmit = async (e) => {
    e.preventDefault();
    try {
      await profile.saveProfile({
        username: app.querySelector('#u').value,
        email: app.querySelector('#e').value,
      });
      alert('Ok');
    } catch (e) {
      alert('Error');
    }
  };
  app.querySelector('#l-o').onclick = () => {
    auth.logout();
    window.location.hash = '#/';
  };
}
