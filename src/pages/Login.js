import auth from '../controllers/authController.js';
import profile from '../controllers/profileController.js';

export default function render(app) {
  let isLogin = true;
  const renderForm = () => {
    app.innerHTML = `
      <section class="card container-sm">
        <h2>${isLogin ? 'Kirjaudu' : 'Luo tili'}</h2>
        <form id="auth-form">
          <label>Tunnus <input id="u" type="text" required></label>
          ${!isLogin ? '<label>Sähköposti <input id="e" type="email" required></label>' : ''}
          <label>Salasana <input id="p" type="password" required></label>
          <button class="btn w-full mt-1" type="submit">${isLogin ? 'Kirjaudu' : 'Rekisteröidy'}</button>
        </form>
        <button id="t" class="btn ghost w-full mt-1 font-sm">${isLogin ? 'Luo tili' : 'Kirjaudu'}</button>
      </section>`;
    app.querySelector('#t').onclick = () => { isLogin = !isLogin; renderForm(); };
    app.querySelector('#auth-form').onsubmit = async e => {
      e.preventDefault();
      try {
        const u = app.querySelector('#u').value, p = app.querySelector('#p').value;
        if (isLogin) await auth.login({username:u, password:p});
        else { await auth.register({username:u, email:app.querySelector('#e').value, password:p}); await auth.login({username:u, password:p}); }
        await profile.init(); window.location.hash = '#/profile';
      } catch (err) { alert('Error'); }
    };
  };
  renderForm();
}

